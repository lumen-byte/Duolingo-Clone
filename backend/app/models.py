"""SQLAlchemy 2.0 ORM models. Schema follows the Duolingo data model:

    Course > Unit > Skill > Lesson > Exercise
    User has per-skill and per-lesson progress (many-to-one).
    Achievements are a fixed catalog with unlock rules; UserAchievement records unlocks.
"""
from datetime import datetime
from sqlalchemy import String, Integer, Boolean, DateTime, ForeignKey, JSON, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .database import Base


class User(Base):
    __tablename__ = 'users'

    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String, default='Learner')
    avatar: Mapped[str] = mapped_column(String, default='🦉')
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Gamification
    xp: Mapped[int] = mapped_column(Integer, default=0)
    streak: Mapped[int] = mapped_column(Integer, default=0)
    last_active: Mapped[str | None] = mapped_column(String, nullable=True)  # yyyy-mm-dd
    hearts: Mapped[int] = mapped_column(Integer, default=5)
    max_hearts: Mapped[int] = mapped_column(Integer, default=5)
    hearts_regen_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    gems: Mapped[int] = mapped_column(Integer, default=500)
    daily_goal: Mapped[int] = mapped_column(Integer, default=30)
    daily_xp: Mapped[int] = mapped_column(Integer, default=0)
    daily_xp_date: Mapped[str] = mapped_column(String, default='')  # yyyy-mm-dd
    language: Mapped[str] = mapped_column(String, default='es')
    theme: Mapped[str] = mapped_column(String, default='light')  # light | dark

    skill_progress: Mapped[list['UserSkillProgress']] = relationship(back_populates='user', cascade='all, delete-orphan')
    lesson_progress: Mapped[list['UserLessonProgress']] = relationship(back_populates='user', cascade='all, delete-orphan')
    achievements: Mapped[list['UserAchievement']] = relationship(back_populates='user', cascade='all, delete-orphan')


class Unit(Base):
    __tablename__ = 'units'
    id: Mapped[str] = mapped_column(String, primary_key=True)
    section: Mapped[int] = mapped_column(Integer, default=1)
    title: Mapped[str] = mapped_column(String)
    subtitle: Mapped[str] = mapped_column(String)
    color: Mapped[str] = mapped_column(String)
    color_dark: Mapped[str] = mapped_column(String)
    order_index: Mapped[int] = mapped_column(Integer, default=0)

    skills: Mapped[list['Skill']] = relationship(back_populates='unit', order_by='Skill.order_index')


class Skill(Base):
    __tablename__ = 'skills'
    id: Mapped[str] = mapped_column(String, primary_key=True)
    unit_id: Mapped[str] = mapped_column(ForeignKey('units.id'))
    title: Mapped[str] = mapped_column(String)
    icon: Mapped[str] = mapped_column(String)
    description: Mapped[str] = mapped_column(String, default='')
    order_index: Mapped[int] = mapped_column(Integer, default=0)

    unit: Mapped[Unit] = relationship(back_populates='skills')
    lessons: Mapped[list['Lesson']] = relationship(back_populates='skill', order_by='Lesson.order_index')


class Lesson(Base):
    __tablename__ = 'lessons'
    id: Mapped[str] = mapped_column(String, primary_key=True)
    skill_id: Mapped[str] = mapped_column(ForeignKey('skills.id'))
    title: Mapped[str] = mapped_column(String)
    order_index: Mapped[int] = mapped_column(Integer, default=0)

    skill: Mapped[Skill] = relationship(back_populates='lessons')
    exercises: Mapped[list['Exercise']] = relationship(back_populates='lesson', order_by='Exercise.order_index')


class Exercise(Base):
    __tablename__ = 'exercises'
    id: Mapped[str] = mapped_column(String, primary_key=True)
    lesson_id: Mapped[str] = mapped_column(ForeignKey('lessons.id'))
    type: Mapped[str] = mapped_column(String)  # multiple_choice | translate_wordbank | match_pairs | fill_blank | type_answer
    order_index: Mapped[int] = mapped_column(Integer, default=0)
    # `payload` holds type-specific fields (prompt, options, correctAnswer, pairs, wordBank, sentence, hint, translation)
    payload: Mapped[dict] = mapped_column(JSON)

    lesson: Mapped[Lesson] = relationship(back_populates='exercises')


class UserSkillProgress(Base):
    __tablename__ = 'user_skill_progress'
    user_id: Mapped[str] = mapped_column(ForeignKey('users.id'), primary_key=True)
    skill_id: Mapped[str] = mapped_column(ForeignKey('skills.id'), primary_key=True)
    crowns: Mapped[int] = mapped_column(Integer, default=0)
    lessons_completed: Mapped[int] = mapped_column(Integer, default=0)

    user: Mapped[User] = relationship(back_populates='skill_progress')


class UserLessonProgress(Base):
    __tablename__ = 'user_lesson_progress'
    user_id: Mapped[str] = mapped_column(ForeignKey('users.id'), primary_key=True)
    lesson_id: Mapped[str] = mapped_column(ForeignKey('lessons.id'), primary_key=True)
    completed: Mapped[bool] = mapped_column(Boolean, default=False)
    mistakes: Mapped[int] = mapped_column(Integer, default=0)
    time_sec: Mapped[int] = mapped_column(Integer, default=0)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped[User] = relationship(back_populates='lesson_progress')


class Achievement(Base):
    __tablename__ = 'achievements'
    id: Mapped[str] = mapped_column(String, primary_key=True)
    title: Mapped[str] = mapped_column(String)
    description: Mapped[str] = mapped_column(String)
    icon: Mapped[str] = mapped_column(String)
    color: Mapped[str] = mapped_column(String)
    rule_type: Mapped[str] = mapped_column(String)  # xp | streak | lessons | perfect_lesson
    rule_value: Mapped[int] = mapped_column(Integer)


class UserAchievement(Base):
    __tablename__ = 'user_achievements'
    user_id: Mapped[str] = mapped_column(ForeignKey('users.id'), primary_key=True)
    achievement_id: Mapped[str] = mapped_column(ForeignKey('achievements.id'), primary_key=True)
    unlocked_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped[User] = relationship(back_populates='achievements')


class LeaderboardEntry(Base):
    """Seeded competitors for the leaderboard."""
    __tablename__ = 'leaderboard_seed'
    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String)
    avatar: Mapped[str] = mapped_column(String)
    xp: Mapped[int] = mapped_column(Integer, default=0)


class TutorMessage(Base):
    """Persist Duo Max AI conversation turns for continuity."""
    __tablename__ = 'tutor_messages'
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    session_id: Mapped[str] = mapped_column(String, index=True)
    role: Mapped[str] = mapped_column(String)  # user | assistant
    content: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
