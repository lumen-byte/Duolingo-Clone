"""Lesson answer + completion, hearts, leaderboard."""
from datetime import datetime, timedelta, date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ..database import get_session
from ..models import (
    User, Exercise, Lesson, Skill, UserSkillProgress, UserLessonProgress, LeaderboardEntry
)
from ..schemas import AnswerRequest, AnswerResponse, CompleteLessonRequest, HeartsRefillRequest
from ..utils import (
    get_or_create_user, user_to_dict, check_answer, update_streak_on_activity,
    evaluate_achievements, HEARTS_REGEN_MINUTES
)

router = APIRouter(prefix='/api')


@router.post('/answer', response_model=AnswerResponse)
async def answer(body: AnswerRequest, session: AsyncSession = Depends(get_session)):
    user = await get_or_create_user(session)
    ex = (await session.execute(select(Exercise).where(Exercise.id == body.exerciseId))).scalars().first()
    if not ex:
        raise HTTPException(status_code=404, detail='Exercise not found')
    is_correct = check_answer(ex.payload, ex.type, body.answer)
    hearts = user.hearts
    if not is_correct:
        hearts = max(0, user.hearts - 1)
        user.hearts = hearts
        if hearts < user.max_hearts and user.hearts_regen_at is None:
            user.hearts_regen_at = datetime.utcnow() + timedelta(minutes=HEARTS_REGEN_MINUTES)
        await session.commit()
    return AnswerResponse(
        correct=is_correct,
        correctAnswer=ex.payload.get('correctAnswer') or ex.payload.get('pairs'),
        hearts=hearts,
        translation=ex.payload.get('translation'),
    )


@router.post('/lesson/complete')
async def complete_lesson(body: CompleteLessonRequest, session: AsyncSession = Depends(get_session)):
    lesson = (await session.execute(
        select(Lesson).options(selectinload(Lesson.skill).selectinload(Skill.lessons)).where(Lesson.id == body.lessonId)
    )).scalars().first()
    if not lesson:
        raise HTTPException(status_code=404, detail='Lesson not found')
    user = await get_or_create_user(session)

    lp = (await session.execute(select(UserLessonProgress).where(
        UserLessonProgress.user_id == user.id, UserLessonProgress.lesson_id == body.lessonId
    ))).scalars().first()
    already = lp is not None and lp.completed

    if lp is None:
        lp = UserLessonProgress(user_id=user.id, lesson_id=body.lessonId, completed=True, mistakes=body.mistakes, time_sec=body.timeSec)
        session.add(lp)
    else:
        lp.completed = True
        lp.mistakes = min(lp.mistakes, body.mistakes) if lp.mistakes else body.mistakes
        lp.time_sec = body.timeSec or lp.time_sec
        lp.updated_at = datetime.utcnow()

    total_skill_lessons = len(lesson.skill.lessons)
    sp = (await session.execute(select(UserSkillProgress).where(
        UserSkillProgress.user_id == user.id, UserSkillProgress.skill_id == lesson.skill_id
    ))).scalars().first()
    if sp is None:
        sp = UserSkillProgress(user_id=user.id, skill_id=lesson.skill_id, crowns=0, lessons_completed=0)
        session.add(sp)
    if not already:
        sp.lessons_completed = min(total_skill_lessons, sp.lessons_completed + 1)
    if sp.lessons_completed >= total_skill_lessons and not already:
        sp.crowns = min(5, sp.crowns + 1)

    # Rewards vary by mode: practice awards heart + smaller XP; legendary is bigger XP
    mode = body.mode or 'lesson'
    xp_earned = int(body.xpEarned)
    if mode == 'practice':
        xp_earned = 5
        # heart refill by 1
        if user.hearts < user.max_hearts:
            user.hearts = min(user.max_hearts, user.hearts + 1)
            if user.hearts >= user.max_hearts:
                user.hearts_regen_at = None
    elif mode == 'legendary':
        xp_earned = max(xp_earned, 40)

    user.xp += xp_earned
    user.daily_xp += xp_earned
    user.gems += 5
    await session.commit()

    await update_streak_on_activity(session, user)
    perfect = body.mistakes == 0 and mode != 'practice'
    newly = await evaluate_achievements(session, user, perfect_lesson=perfect, legendary=(mode == 'legendary'))

    await session.refresh(user)
    return {'ok': True, 'user': await user_to_dict(session, user), 'xpEarned': xp_earned, 'skillCrowns': sp.crowns, 'newAchievements': newly}


@router.post('/hearts/refill')
async def hearts_refill(body: HeartsRefillRequest, session: AsyncSession = Depends(get_session)):
    user = await get_or_create_user(session)
    if user.hearts >= user.max_hearts:
        return {'ok': True, 'user': await user_to_dict(session, user), 'message': 'Hearts already full'}
    method = body.method or 'gems'
    if method == 'gems':
        cost = 350
        if user.gems < cost:
            raise HTTPException(status_code=400, detail=f'Not enough gems. Need {cost - user.gems} more')
        user.gems -= cost
        user.hearts = user.max_hearts
        user.hearts_regen_at = None
    else:
        user.hearts = min(user.max_hearts, user.hearts + 1)
        if user.hearts >= user.max_hearts:
            user.hearts_regen_at = None
    await session.commit()
    await session.refresh(user)
    return {'ok': True, 'user': await user_to_dict(session, user)}


@router.get('/leaderboard')
async def leaderboard(session: AsyncSession = Depends(get_session)):
    user = await get_or_create_user(session)
    seeds = (await session.execute(select(LeaderboardEntry))).scalars().all()
    users = [{'id': s.id, 'name': s.name, 'avatar': s.avatar, 'xp': s.xp} for s in seeds]
    users.append({'id': user.id, 'name': user.name, 'avatar': user.avatar, 'xp': user.xp, 'isMe': True})
    users.sort(key=lambda x: -x['xp'])
    return {'league': 'Bronze', 'users': users}


@router.get('/achievements')
async def list_achievements(session: AsyncSession = Depends(get_session)):
    from ..models import Achievement, UserAchievement
    user = await get_or_create_user(session)
    all_ach = (await session.execute(select(Achievement))).scalars().all()
    unlocked = {r.achievement_id for r in (await session.execute(select(UserAchievement).where(UserAchievement.user_id == user.id))).scalars().all()}
    return {'achievements': [{'id': a.id, 'title': a.title, 'description': a.description, 'icon': a.icon, 'color': a.color, 'unlocked': a.id in unlocked} for a in all_ach]}


@router.post('/dev/reset')
async def dev_reset(session: AsyncSession = Depends(get_session)):
    from sqlalchemy import delete
    from ..models import UserSkillProgress as _USP, UserLessonProgress as _ULP, UserAchievement as _UA, User as _U
    await session.execute(delete(_USP))
    await session.execute(delete(_ULP))
    await session.execute(delete(_UA))
    await session.execute(delete(_U))
    await session.commit()
    user = await get_or_create_user(session)
    return {'ok': True, 'user': await user_to_dict(session, user)}


@router.post('/dev/advance-day')
async def dev_advance_day(session: AsyncSession = Depends(get_session)):
    user = await get_or_create_user(session)
    yesterday = (date.today() - timedelta(days=1)).isoformat()
    user.last_active = yesterday
    user.daily_xp = 0
    user.daily_xp_date = yesterday
    await session.commit()
    return {'ok': True, 'user': await user_to_dict(session, user)}
