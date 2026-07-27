"""Business-logic helpers shared across routes."""
from datetime import datetime, date, timedelta
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from .models import (
    User, Skill, Lesson, Exercise, UserSkillProgress, UserLessonProgress,
    Unit, Achievement, UserAchievement
)
import unicodedata
import re

DEFAULT_USER_ID = 'default-user'
HEARTS_REGEN_MINUTES = 30


def today_str() -> str:
    return date.today().isoformat()


def normalize(s) -> str:
    if s is None:
        return ''
    s = str(s).lower().strip()
    # remove accents
    s = ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn')
    s = re.sub(r"[¿?¡!.,]", '', s)
    s = re.sub(r"\s+", ' ', s)
    return s


async def get_or_create_user(session: AsyncSession, user_id: str = DEFAULT_USER_ID) -> User:
    user = await session.get(User, user_id)
    if user is None:
        user = User(id=user_id, name='Learner', avatar='🦉', daily_xp_date=today_str())
        session.add(user)
        await session.commit()
        await session.refresh(user)

    changed = False
    # Reset daily XP if new day
    if user.daily_xp_date != today_str():
        user.daily_xp = 0
        user.daily_xp_date = today_str()
        changed = True
    # Regenerate hearts if scheduled
    if user.hearts < user.max_hearts and user.hearts_regen_at is not None:
        if datetime.utcnow() >= user.hearts_regen_at:
            user.hearts = min(user.max_hearts, user.hearts + 1)
            if user.hearts < user.max_hearts:
                user.hearts_regen_at = datetime.utcnow() + timedelta(minutes=HEARTS_REGEN_MINUTES)
            else:
                user.hearts_regen_at = None
            changed = True
    if changed:
        await session.commit()
        await session.refresh(user)
    return user


async def user_to_dict(session: AsyncSession, user: User) -> dict:
    # skill progress
    sp_rows = (await session.execute(select(UserSkillProgress).where(UserSkillProgress.user_id == user.id))).scalars().all()
    skill_progress = {r.skill_id: {'crowns': r.crowns, 'lessonsCompleted': r.lessons_completed} for r in sp_rows}
    lp_rows = (await session.execute(select(UserLessonProgress).where(UserLessonProgress.user_id == user.id))).scalars().all()
    lesson_progress = {r.lesson_id: {'completed': r.completed, 'mistakes': r.mistakes, 'timeSec': r.time_sec} for r in lp_rows}
    ach_rows = (await session.execute(select(UserAchievement).where(UserAchievement.user_id == user.id))).scalars().all()
    achievements = [r.achievement_id for r in ach_rows]
    return {
        'id': user.id, 'name': user.name, 'avatar': user.avatar,
        'createdAt': user.created_at.isoformat() if user.created_at else datetime.utcnow().isoformat(),
        'xp': user.xp, 'streak': user.streak, 'lastActive': user.last_active,
        'hearts': user.hearts, 'maxHearts': user.max_hearts,
        'heartsRegenAt': user.hearts_regen_at.isoformat() if user.hearts_regen_at else None,
        'gems': user.gems, 'dailyGoal': user.daily_goal, 'dailyXp': user.daily_xp, 'dailyXpDate': user.daily_xp_date,
        'language': user.language, 'theme': user.theme,
        'skillProgress': skill_progress, 'lessonProgress': lesson_progress, 'achievements': achievements,
    }


def check_answer(exercise_payload: dict, exercise_type: str, answer) -> bool:
    if exercise_type in ('multiple_choice', 'fill_blank'):
        return normalize(answer) == normalize(exercise_payload.get('correctAnswer'))
    if exercise_type == 'type_answer':
        return normalize(answer) == normalize(exercise_payload.get('correctAnswer'))
    if exercise_type == 'translate_wordbank':
        joined = ' '.join(answer) if isinstance(answer, list) else str(answer)
        return normalize(joined) == normalize(exercise_payload.get('correctAnswer'))
    if exercise_type == 'match_pairs':
        if not isinstance(answer, list):
            return False
        pairs = exercise_payload.get('pairs', [])
        if len(answer) != len(pairs):
            return False
        mapping = {normalize(p['left']): normalize(p['right']) for p in pairs}
        for a in answer:
            if not isinstance(a, dict):
                return False
            if mapping.get(normalize(a.get('left'))) != normalize(a.get('right')):
                return False
        return True
    return False


async def update_streak_on_activity(session: AsyncSession, user: User):
    today = today_str()
    yesterday = (date.today() - timedelta(days=1)).isoformat()
    if user.last_active == today:
        pass  # already counted
    elif user.last_active == yesterday:
        user.streak += 1
    else:
        user.streak = 1
    user.last_active = today
    await session.commit()


async def evaluate_achievements(session: AsyncSession, user: User, *, perfect_lesson: bool = False, legendary: bool = False) -> list[str]:
    """Unlock any achievements the user newly qualifies for. Returns newly-unlocked ids."""
    all_ach = (await session.execute(select(Achievement))).scalars().all()
    already = {r.achievement_id for r in (await session.execute(select(UserAchievement).where(UserAchievement.user_id == user.id))).scalars().all()}
    lessons_done = (await session.execute(select(UserLessonProgress).where(UserLessonProgress.user_id == user.id, UserLessonProgress.completed == True))).scalars().all()
    newly = []
    for a in all_ach:
        if a.id in already:
            continue
        ok = False
        if a.rule_type == 'xp' and user.xp >= a.rule_value:
            ok = True
        elif a.rule_type == 'streak' and user.streak >= a.rule_value:
            ok = True
        elif a.rule_type == 'lessons' and len(lessons_done) >= a.rule_value:
            ok = True
        elif a.rule_type == 'perfect_lesson' and perfect_lesson:
            ok = True
        elif a.rule_type == 'legendary' and legendary:
            ok = True
        if ok:
            session.add(UserAchievement(user_id=user.id, achievement_id=a.id))
            newly.append(a.id)
    if newly:
        await session.commit()
    return newly
