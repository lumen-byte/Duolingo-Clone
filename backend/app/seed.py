"""Seeds the SQLite database with course content, achievements, and leaderboard.
Idempotent: safe to run on every startup.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from .database import AsyncSessionLocal, engine, Base
from .models import Unit, Skill, Lesson, Exercise, Achievement, LeaderboardEntry
from .seed_data import COURSE, ACHIEVEMENTS, LEADERBOARD_SEED


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as s:  # type: AsyncSession
        # units / skills / lessons / exercises
        existing = (await s.execute(select(Unit))).scalars().first()
        if not existing:
            for u in COURSE['units']:
                unit = Unit(id=u['id'], title=u['title'], subtitle=u['subtitle'], color=u['color'],
                            color_dark=u['color_dark'], order_index=u['order_index'])
                s.add(unit)
                for sk in u['skills']:
                    skill = Skill(id=sk['id'], unit_id=u['id'], title=sk['title'], icon=sk['icon'],
                                  description=sk['description'], order_index=sk['order_index'])
                    s.add(skill)
                    for l in sk['lessons']:
                        lesson = Lesson(id=l['id'], skill_id=sk['id'], title=l['title'], order_index=l['order_index'])
                        s.add(lesson)
                        for i, e in enumerate(l['exercises']):
                            s.add(Exercise(id=e['id'], lesson_id=l['id'], type=e['type'], order_index=i, payload=e['payload']))
            await s.commit()

        # achievements
        if not (await s.execute(select(Achievement))).scalars().first():
            for a in ACHIEVEMENTS:
                s.add(Achievement(**a))
            await s.commit()

        # leaderboard
        if not (await s.execute(select(LeaderboardEntry))).scalars().first():
            for lb in LEADERBOARD_SEED:
                s.add(LeaderboardEntry(**lb))
            await s.commit()
