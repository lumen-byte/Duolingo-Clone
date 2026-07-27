# Duolingo Clone — Scaler SDE Fullstack Assignment

A full-stack Duolingo clone built on the exact required stack — **Next.js (TypeScript) + FastAPI + SQLite** — implementing the complete lesson loop (5 exercise types), XP/streak/hearts gamification, and a seeded leaderboard, architected with a normalized relational schema and resource-based API design. Beyond the core spec, it ships three original systems: **Duo Max**, an in-app AI tutor (Gemini) that explains wrong answers and answers open Spanish questions; a **Legendary mode** (timed, shuffled challenge run); and a full **OLED dark theme** matching Duolingo's real design tokens — all built to demonstrate not just working features, but deliberate architectural and product decisions.

**Live app:** [duolingo-clone-lumenbyte1.vercel.app](https://duolingo-clone-lumenbyte1.vercel.app/)
**Repo:** [github.com/lumen-byte/Duolingo-Clone](https://github.com/lumen-byte/Duolingo-Clone)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui, framer-motion |
| Backend | FastAPI (async), SQLAlchemy 2.0 (async), Pydantic v2 |
| Database | SQLite, seeded on first startup |
| AI | Gemini 2.5 Flash via `emergentintegrations` |
| TTS | Web Speech API (browser-native) |
| Deploy | Vercel (frontend) · Render (backend) |

---

## Architecture

```
Browser → Next.js (rewrites /api/*) → FastAPI → SQLAlchemy async → SQLite
```

Frontend and backend are deployed independently and connected via a rewrite proxy. The backend is organized by resource, not by layer:

```
app/routes/user.py     → user profile (name, avatar, theme, goal)
app/routes/course.py   → skill tree, lessons, legendary variant
app/routes/game.py     → answers, XP, hearts, leaderboard, achievements
app/routes/tutor.py    → Duo Max (AI explain / chat)
app/models.py          → 10-table SQLAlchemy schema
app/utils.py           → pure functions: answer normalization, streaks, achievement rules
app/seed_data.py       → idempotent course + achievement + leaderboard seed
```

## Database Schema

```
units ──1:n── skills ──1:n── lessons ──1:n── exercises (JSON payload)

users ──1:n── user_skill_progress    → skills
      ──1:n── user_lesson_progress   → lessons
      ──1:n── user_achievements      → achievements
      ──1:n── tutor_messages
```

**Key decisions:**
- Exercise `payload` is JSON — one schema accommodates all 5 exercise shapes (MCQ, word bank, match pairs, fill-blank, type-answer).
- Progress tables are separated from `users`, so multi-language support can be added without denormalizing.
- `correctAnswer` is stripped server-side before any lesson response — client never receives the answer key.

---

## Core Features

- **Skill tree**: lock → active → completed states, crown rings (up to 5/skill), animated "Start" prompt.
- **Lesson player**: 5 exercise types, feedback bar, hearts deduction, out-of-hearts modal, Duo Owl mascot with emotional states, TTS on every prompt.
- **Gamification**: streak tracking, daily XP goal, hearts (regen over time / gems / practice), Bronze league leaderboard, 7-badge achievement engine.
- **Practice mode**: replay finished skills for XP + heart recovery — mirrors Duolingo's real mechanic.
- **Legendary mode**: timed, shuffled challenge run (60s/exercise) — bonus item from the spec.
- **Duo Max (AI tutor)**: Gemini-powered explain-on-wrong-answer + full conversational chat panel.
- **Dark mode**: persists per user, matches Duolingo's actual OLED palette.
- **Responsive**: mobile bottom-nav, desktop sidebar.

## Mocked / Placeholder (per assignment scope)

Speech recognition, Super subscription/IAP, friends/social, and additional languages are placeholder ("Coming soon") sections. Auth is a single default learner, as explicitly permitted by the brief.

---

## API Overview

```
GET  /user                      GET  /course
POST /user                      GET  /lesson/{id}
POST /answer                    GET  /lesson/{id}/legendary
POST /lesson/complete           GET  /leaderboard
POST /hearts/refill             GET  /achievements
POST /tutor/explain             POST /tutor/chat
```

Answer validation and normalization happen entirely server-side; the answer key never reaches the client.

---

## Local Setup

```bash
git clone <repo> && cd duolingo-clone

# Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # add EMERGENT_LLM_KEY for Duo Max
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload

# Frontend
cd .. && yarn install && yarn dev
```

## Environment Variables

```
DATABASE_URL=sqlite+aiosqlite:///./duolingo.db
EMERGENT_LLM_KEY=sk-emergent-...
AI_MODEL=gemini-2.5-flash
AI_PROVIDER=gemini
CORS_ORIGINS=*
```

## Deployment

Frontend → Vercel (`vercel --prod`). Backend → Render, start command `uvicorn app.main:app --host 0.0.0.0 --port $PORT`. Update the `/api/*` rewrite in `next.config.js` to the deployed FastAPI URL.

---

## Assumptions

1. Single default learner — auth simplified per assignment.
2. Streak uses date-string comparison, not timezone-aware timers; a dev endpoint (`/dev/advance-day`) supports testing.
3. Hearts regenerate every 30 min (shortened from Duolingo's ~4h, for demo purposes).
4. XP formula: `max(5, base − mistakes×2)`, base = 15 / 5 / 40 for lesson / practice / legendary.
5. Render's free tier has an ephemeral filesystem, so the DB re-seeds on startup to persist sample data across redeploys; the same tier introduces a cold-start delay (30–50s) on the first request after inactivity.

---

**Author:** Abhimanyu Pratap Singh · Roll No: E23CSEU0193 · Bennett University
