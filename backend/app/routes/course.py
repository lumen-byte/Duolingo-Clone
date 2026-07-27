"""Course tree + lesson exercises endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
import random

from ..database import get_session
from ..models import Unit, Skill, Lesson, Exercise, UserSkillProgress, UserLessonProgress
from ..utils import get_or_create_user

router = APIRouter(prefix='/api')


def sanitize_exercise(ex: Exercise) -> dict:
    p = dict(ex.payload)
    # strip anti-cheat sensitive fields
    p.pop('correctAnswer', None)
    if ex.type == 'match_pairs':
        pairs = p.pop('pairs', [])
        lefts = [pp['left'] for pp in pairs]
        rights = [pp['right'] for pp in pairs]
        random.shuffle(rights)
        p['lefts'] = lefts
        p['rights'] = rights
        p['pairsCount'] = len(pairs)
    return {'id': ex.id, 'type': ex.type, **p}


@router.get('/course')
async def get_course(session: AsyncSession = Depends(get_session)):
    user = await get_or_create_user(session)
    units = (await session.execute(
        select(Unit).options(selectinload(Unit.skills).selectinload(Skill.lessons))
        .order_by(Unit.order_index)
    )).scalars().all()

    sp_rows = (await session.execute(select(UserSkillProgress).where(UserSkillProgress.user_id == user.id))).scalars().all()
    sp_map = {r.skill_id: r for r in sp_rows}
    lp_rows = (await session.execute(select(UserLessonProgress).where(UserLessonProgress.user_id == user.id))).scalars().all()
    lp_map = {r.lesson_id: r for r in lp_rows}

    out_units = []
    previous_skill_finished = True
    for u in units:
        skills_out = []
        for s in sorted(u.skills, key=lambda x: x.order_index):
            prog = sp_map.get(s.id)
            total_lessons = len(s.lessons)
            lessons_completed = prog.lessons_completed if prog else 0
            crowns = prog.crowns if prog else 0
            finished = lessons_completed >= total_lessons
            unlocked = previous_skill_finished
            sorted_lessons = sorted(s.lessons, key=lambda l: l.order_index)
            active_lesson_id = sorted_lessons[min(lessons_completed, total_lessons - 1)].id if total_lessons > 0 else None
            skills_out.append({
                'id': s.id, 'title': s.title, 'icon': s.icon, 'description': s.description,
                'totalLessons': total_lessons, 'lessonsCompleted': lessons_completed, 'crowns': crowns,
                'unlocked': unlocked, 'finished': finished, 'activeLessonId': active_lesson_id,
                'lessons': [{'id': l.id, 'title': l.title, 'completed': lp_map.get(l.id).completed if lp_map.get(l.id) else False} for l in sorted_lessons]
            })
            previous_skill_finished = finished
        out_units.append({
            'id': u.id, 'title': u.title, 'subtitle': u.subtitle, 'color': u.color, 'colorDark': u.color_dark, 'skills': skills_out
        })
    return {'id': 'spanish-101', 'language': 'Spanish', 'languageCode': 'es', 'flag': '🇪🇸', 'units': out_units}


@router.get('/lesson/{lesson_id}')
async def get_lesson(lesson_id: str, session: AsyncSession = Depends(get_session)):
    lesson = (await session.execute(
        select(Lesson).options(selectinload(Lesson.exercises), selectinload(Lesson.skill).selectinload(Skill.unit))
        .where(Lesson.id == lesson_id)
    )).scalars().first()
    if not lesson:
        raise HTTPException(status_code=404, detail='Lesson not found')
    exercises = sorted(lesson.exercises, key=lambda e: e.order_index)
    return {
        'id': lesson.id, 'title': lesson.title,
        'skill': {'id': lesson.skill.id, 'title': lesson.skill.title, 'color': lesson.skill.unit.color, 'colorDark': lesson.skill.unit.color_dark},
        'exercises': [sanitize_exercise(e) for e in exercises],
    }


@router.get('/lesson/{lesson_id}/legendary')
async def get_lesson_legendary(lesson_id: str, session: AsyncSession = Depends(get_session)):
    """Legendary mode: same lesson but exercises reshuffled and marked timed."""
    data = await get_lesson(lesson_id, session)
    exs = data['exercises']
    random.shuffle(exs)
    return {**data, 'exercises': exs, 'legendary': True}
