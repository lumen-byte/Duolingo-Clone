# Duolingo Clone — Scaler SDE Fullstack Assignment

A full-stack Duolingo clone built on the required stack — **Next.js (TypeScript) + FastAPI + SQLite** — implementing the complete lesson loop across 5 exercise types, XP/streak/hearts gamification, a seeded leaderboard, and an achievement system, on top of a normalized relational schema and a resource-based API design. Beyond the core spec, it ships three original systems: **Duo Max**, an in-app AI tutor (Groq Llama 3) that explains wrong answers and answers open Spanish questions; a **Legendary mode** (timed, shuffled challenge run); and a full **OLED dark theme** matching Duolingo's real design tokens. Every addition reflects a deliberate product or architectural decision, not just a feature checkbox.

**Live app:** [duolingo-clone-lumenbyte1.vercel.app](https://duolingo-clone-lumenbyte1.vercel.app/)
**Repo:** [github.com/lumen-byte/Duolingo-Clone](https://github.com/lumen-byte/Duolingo-Clone)

---

## Screenshots

### Learning Path (Light Mode)

Main learning dashboard with lesson progression.

![Learning Path Light](assets/screenshots/01-learning-path-light.png)

---

### Learning Path (Dark Mode)

Dark mode version of the learning dashboard.

![Learning Path Dark](assets/screenshots/02-learning-path-dark.png)

---

### Interactive Lesson

Interactive lesson with hints and answer validation.

![Interactive Lesson](assets/screenshots/03-interactive-lesson.png)

---

### Error Feedback

Detailed feedback for incorrect answers.

![Error Feedback](assets/screenshots/04-error-feedback.png)

---

### Lesson Completion

Lesson summary with XP and achievements.

![Lesson Complete](assets/screenshots/05-lesson-complete.png)

---

### Duo Max AI

AI tutor for Spanish learning assistance.

![Duo Max AI](assets/screenshots/06-duo-max-ai.png)

---

### Leaderboard

XP rankings and league standings.

![Leaderboard](assets/screenshots/07-leaderboard.png)

---

### Learner Profile

User profile with progress and achievements.

![Learner Profile](assets/screenshots/08-profile.png)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui, framer-motion |
| Backend | FastAPI (async), SQLAlchemy 2.0 (async), Pydantic v2 |
| Database | SQLite, seeded on first startup |
| AI | Groq API, `llama-3.1-8b-instant` |
| TTS | Web Speech API (browser-native) |
| Deploy | Vercel (frontend) · Render, via Docker (backend) |

---

## Architecture

```
Browser → Next.js (rewrites /api/*) → FastAPI → SQLAlchemy async → SQLite
```

Frontend and backend are fully decoupled — Next.js serves the UI and proxies every `/api/*` call to FastAPI, so each service can be built, tested, and deployed independently. The backend is organized by resource rather than by layer:

```
app/routes/user.py     → user profile (name, avatar, theme, goal)
app/routes/course.py   → skill tree, lessons, legendary variant
app/routes/game.py     → answers, XP, hearts, leaderboard, achievements
app/routes/tutor.py    → Duo Max (AI explain / chat)
app/models.py          → SQLAlchemy schema (10 tables)
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
- Exercise `payload` is JSON, so one schema accommodates all 5 exercise shapes (MCQ, word bank, match pairs, fill-blank, type-answer) without a table per type.
- Progress tables live separately from `users`, which means multi-language support can be added later without denormalizing existing data.
- `correctAnswer` is stripped server-side before any lesson response reaches the client. Answer validation and normalization (accents, casing, punctuation) both happen on the backend.

---

## Core Features

- **Skill tree** — 3 units, 7 skills, seeded lessons across all exercise types. Lock → active → completed states, crown progress rings, animated "Start" prompt.
- **Lesson player** — 5 exercise types (MCQ, word bank, match pairs, fill-blank, type-answer), signature correct/incorrect feedback bar, hearts deduction on wrong answers, out-of-hearts modal, an animated Duo Owl mascot that reacts to performance, and text-to-speech narration on prompts and options.
- **Gamification** — streak tracking, daily XP goal, hearts that regenerate over time or refill via gems/practice, a Bronze league leaderboard against seeded competitors, and a 7-badge achievement engine driven by backend rules.
- **Practice mode** — replay a completed skill to earn XP and recover a heart, mirroring Duolingo's real refill mechanic rather than just gating progress.
- **Legendary mode** — a timed, shuffled challenge run (60s per exercise) for a large XP payout.
- **Duo Max** — an AI tutor built on Groq's Llama 3 model, with two entry points: an inline "explain my mistake" button on wrong answers, and a full conversational chat panel for open-ended Spanish questions.
- **Dark mode** — persists per user in the database, matches Duolingo's actual OLED palette rather than a generic inverted theme.
- **Responsive layout** — mobile bottom-nav, desktop sidebar.

## Mocked / Placeholder (per assignment scope)

Speech recognition, the Super subscription/IAP, friends/social features, and additional language courses are shown as "Coming soon." Authentication is a single default learner, as the assignment explicitly permits.

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

---

## Local Setup

```bash
git clone <repo> && cd duolingo-clone

# Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # add GROQ_API_KEY for Duo Max
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload

# Frontend
cd .. && yarn install && yarn dev
```

## Environment Variables

```
DATABASE_URL=sqlite+aiosqlite:///./duolingo.db
GROQ_API_KEY=gsk_...
AI_MODEL=llama-3.1-8b-instant
CORS_ORIGINS=*
```

## Deployment

Frontend deploys to Vercel (`vercel --prod`). Backend deploys to Render as a Dockerized service; the container runs `uvicorn app.main:app --host 0.0.0.0 --port $PORT`. Update the `/api/*` rewrite in `next.config.js` to point at the deployed FastAPI URL.

---

## Assumptions

1. A single default learner is used in place of full authentication, per the assignment's explicit allowance.
2. Streak logic compares date strings rather than relying on timezone-aware timers; a dev endpoint (`/dev/advance-day`) exists purely for testing.
3. Hearts regenerate every 30 minutes, shortened from Duolingo's roughly 4-hour cycle so the mechanic is demonstrable without a long wait.
4. XP is computed as `max(5, base − mistakes × 2)`, where base is 15, 5, or 40 for a standard lesson, practice run, or legendary run respectively.
5. Render's free tier uses an ephemeral filesystem, so the database re-seeds on startup to keep sample progress consistent across redeploys. The same tier introduces a cold-start delay of roughly 30–50 seconds on the first request after inactivity — expected hosting behavior, not an application defect.

---

**Author:** Abhimanyu Pratap Singh · Roll No: E23CSEU0193 · Bennett University
