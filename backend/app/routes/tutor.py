"""Duo Max AI Tutor — Gemini via emergentintegrations. Two endpoints:
   POST /api/tutor/explain — explain why an answer was wrong
   POST /api/tutor/chat    — free-form conversational tutor (session-persistent)
"""
from fastapi import APIRouter, HTTPException
from emergentintegrations.llm.chat import LlmChat, UserMessage
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends
from datetime import datetime

from ..database import get_session
from ..config import settings
from ..schemas import TutorChatRequest, ExplainRequest
from ..models import TutorMessage

router = APIRouter(prefix='/api/tutor')

TUTOR_SYSTEM = (
    "You are Duo Max, a friendly, concise Spanish language tutor inside the Duolingo app. "
    "Speak in the user's language (usually English). Be encouraging, playful, and specific. "
    "When explaining mistakes: keep it under 90 words, use one short example, and offer a mini-tip. "
    "When chatting: correct errors gently, suggest better phrasing in Spanish, and ask one follow-up question. "
    "Never use markdown headers. Use plain sentences with occasional emojis (🦉, ✨)."
)


def make_chat(session_id: str) -> LlmChat:
    if not settings.EMERGENT_LLM_KEY:
        raise HTTPException(status_code=503, detail='LLM key not configured')
    chat = (
        LlmChat(api_key=settings.EMERGENT_LLM_KEY, session_id=session_id, system_message=TUTOR_SYSTEM)
        .with_model(settings.AI_PROVIDER, settings.AI_MODEL)
    )
    return chat


@router.post('/explain')
async def explain(body: ExplainRequest, session: AsyncSession = Depends(get_session)):
    prompt = (
        f"A learner just answered a Spanish exercise incorrectly.\n"
        f"Exercise type: {body.exerciseType}\n"
        f"Question / source: {body.prompt}\n"
        f"Their answer: '{body.userAnswer}'\n"
        f"Correct answer: '{body.correctAnswer}'\n\n"
        f"Explain in 2–3 short sentences: (1) what went wrong, (2) why, (3) one memory tip. "
        f"Be encouraging. No headers."
    )
    try:
        chat = make_chat(body.sessionId)
        reply = await chat.send_message(UserMessage(text=prompt))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f'LLM error: {e}')
    text = getattr(reply, 'content', None) or str(reply)
    session.add(TutorMessage(session_id=body.sessionId, role='user', content=prompt))
    session.add(TutorMessage(session_id=body.sessionId, role='assistant', content=text))
    await session.commit()
    return {'reply': text}


@router.post('/chat')
async def chat(body: TutorChatRequest, session: AsyncSession = Depends(get_session)):
    try:
        c = make_chat(body.sessionId)
        reply = await c.send_message(UserMessage(text=body.message))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f'LLM error: {e}')
    text = getattr(reply, 'content', None) or str(reply)
    session.add(TutorMessage(session_id=body.sessionId, role='user', content=body.message))
    session.add(TutorMessage(session_id=body.sessionId, role='assistant', content=text))
    await session.commit()
    return {'reply': text}


@router.get('/history/{session_id}')
async def history(session_id: str, session: AsyncSession = Depends(get_session)):
    rows = (await session.execute(
        select(TutorMessage).where(TutorMessage.session_id == session_id).order_by(TutorMessage.created_at)
    )).scalars().all()
    return {'messages': [{'role': r.role, 'content': r.content, 'createdAt': r.created_at.isoformat()} for r in rows]}
