from pydantic import BaseModel, Field
from typing import Any


class UserOut(BaseModel):
    id: str
    name: str
    avatar: str
    createdAt: str
    xp: int
    streak: int
    lastActive: str | None
    hearts: int
    maxHearts: int
    heartsRegenAt: str | None
    gems: int
    dailyGoal: int
    dailyXp: int
    dailyXpDate: str
    language: str
    theme: str
    skillProgress: dict[str, dict]
    lessonProgress: dict[str, dict]
    achievements: list[str]


class UserUpdate(BaseModel):
    name: str | None = None
    avatar: str | None = None
    dailyGoal: int | None = None
    theme: str | None = None


class AnswerRequest(BaseModel):
    exerciseId: str
    answer: Any


class AnswerResponse(BaseModel):
    correct: bool
    correctAnswer: Any | None = None
    hearts: int
    translation: str | None = None


class CompleteLessonRequest(BaseModel):
    lessonId: str
    xpEarned: int = 15
    mistakes: int = 0
    timeSec: int = 0
    mode: str = 'lesson'  # lesson | practice | legendary


class HeartsRefillRequest(BaseModel):
    method: str = 'gems'  # gems | practice | ad


class TutorChatRequest(BaseModel):
    sessionId: str
    message: str


class ExplainRequest(BaseModel):
    sessionId: str = 'default-explain'
    prompt: str
    userAnswer: str
    correctAnswer: str
    exerciseType: str
