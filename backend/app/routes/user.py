"""User CRUD + basic gamification endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import get_session
from ..models import User
from ..schemas import UserUpdate
from ..utils import get_or_create_user, user_to_dict

router = APIRouter(prefix='/api')


@router.get('/user')
async def get_user(session: AsyncSession = Depends(get_session)):
    user = await get_or_create_user(session)
    return await user_to_dict(session, user)


@router.post('/user')
async def update_user(body: UserUpdate, session: AsyncSession = Depends(get_session)):
    user = await get_or_create_user(session)
    if body.name is not None:
        user.name = body.name[:40]
    if body.avatar is not None:
        user.avatar = body.avatar[:8]
    if body.dailyGoal is not None:
        user.daily_goal = max(10, min(60, int(body.dailyGoal)))
    if body.theme is not None and body.theme in ('light', 'dark'):
        user.theme = body.theme
    await session.commit()
    await session.refresh(user)
    return await user_to_dict(session, user)
