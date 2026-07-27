"""Duo Max AI Tutor — Groq integration. Two endpoints:
   POST /api/tutor/explain — explain why an answer was wrong
   POST /api/tutor/chat    — free-form conversational tutor (session-persistent)
"""
from fastapi import APIRouter, HTTPException
from groq import Groq
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

def get_groq_client():
    if not settings.GROQ_API_KEY:
        raise HTTPException(status_code=503, detail='Groq API key not configured')
    return Groq(api_key=settings.GROQ_API_KEY)


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
        client = get_groq_client()
        messages = [
            {"role": "system", "content": TUTOR_SYSTEM},
            {"role": "user", "content": prompt}
        ]
        completion = client.chat.completions.create(
            model=settings.AI_MODEL,
            messages=messages,
            temperature=0.7,
        )
        text = completion.choices[0].message.content
    except Exception as e:
        raise HTTPException(status_code=502, detail=f'LLM error: {e}')
        
    session.add(TutorMessage(session_id=body.sessionId, role='user', content=prompt))
    session.add(TutorMessage(session_id=body.sessionId, role='assistant', content=text))
    await session.commit()
    return {'reply': text}


@router.post('/chat')
async def chat(body: TutorChatRequest, session: AsyncSession = Depends(get_session)):
    try:
        # Load history
        rows = (await session.execute(
            select(TutorMessage).where(TutorMessage.session_id == body.sessionId).order_by(TutorMessage.created_at)
        )).scalars().all()
        
        messages = [{"role": "system", "content": TUTOR_SYSTEM}]
        for r in rows:
            messages.append({"role": r.role, "content": r.content})
        messages.append({"role": "user", "content": body.message})
        
        client = get_groq_client()
        completion = client.chat.completions.create(
            model=settings.AI_MODEL,
            messages=messages,
            temperature=0.7,
        )
        text = completion.choices[0].message.content
    except Exception as e:
        raise HTTPException(status_code=502, detail=f'LLM error: {e}')
        
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
