# Duolingo Clone — Scaler SDE Fullstack Assignment

A production-quality, functional Duolingo web-app clone with a skill tree, five interactive exercise types, XP/streak/hearts gamification, a Bronze league leaderboard, and — as a differentiator — **Duo Max**, an AI language tutor powered by Gemini.

Built exactly to the assignment's technical stack: **Next.js (TypeScript)** frontend, **Python FastAPI** backend, **SQLite** database.

---

## Live demo & repository

* **Live app**: duolingo-clone-lumenbyte1.vercel.app
* **Repo**: https://github.com/lumen-byte/Duolingo-Clone

---

## Tech Stack

| Layer     | Technology |
| --------- | --- |
| Frontend  | Next.js 15 (App Router) + **TypeScript** + React 18 + Tailwind CSS + shadcn/ui + framer-motion + lucide-react |
| Backend   | **Python FastAPI** (async) + **SQLAlchemy 2.0 async** + Pydantic v2 |
| Database  | **SQLite** (`backend/duolingo.db`, seeded on first startup) |
| AI        | Gemini 2.5 Flash (free tier) via `emergentintegrations` universal LLM client |
| TTS       | Web Speech API (browser-native, no external key) |
| Deploy    | Frontend → Vercel; Backend → Render / Railway / any Python host |

---

## Architecture Overview

```
                           HTTPS
   Browser  ─────────────────────────────────►  Next.js (port 3000)
                                                     │
                                     /api/*  rewrite │
                                                     ▼
                                             FastAPI (port 8001)
                                                     │
                                            SQLAlchemy async
                                                     ▼
                                             SQLite (file DB)
```

* **Next.js** serves the frontend and — via `next.config.js` rewrites — proxies every `/api/*` request to the FastAPI backend. This lets the two services be developed and deployed independently.
* **FastAPI** is a modular Python service organised by resource:
  * `app/main.py` — application bootstrap, CORS, DB init
  * `app/routes/user.py` — user CRUD (name / avatar / theme / daily goal)
  * `app/routes/course.py` — course tree + lessons + legendary variant
  * `app/routes/game.py` — answer validation, lesson completion, hearts refill, leaderboard, achievements
  * `app/routes/tutor.py` — **Duo Max AI** (`/tutor/explain`, `/tutor/chat`)
  * `app/models.py` — SQLAlchemy ORM models (User, Unit, Skill, Lesson, Exercise, UserSkillProgress, UserLessonProgress, Achievement, UserAchievement, LeaderboardEntry, TutorMessage)
  * `app/utils.py` — pure functions: answer normalisation, achievement rules, streak logic, hearts regen
  * `app/seed_data.py` + `seed.py` — course + achievements + leaderboard seeding (idempotent)

* **SQLite** is initialised on first boot with course content, achievements catalog, and seeded leaderboard competitors.

---

## Database Schema

Fully relational, third-normal-form. Rendered in Mermaid style:

```
   ┌──────────┐      ┌──────────┐       ┌──────────┐      ┌────────────┐
   │  units   │──1─n─│  skills  │──1─n──│  lessons │──1─n─│  exercises │
   └──────────┘      └──────────┘       └──────────┘      └────────────┘
                                                              (payload JSON)

   ┌──────────┐         n────────────┐
   │  users   │─────────► user_skill_progress ─────► skills
   │          │─────────► user_lesson_progress ────► lessons
   │          │─────────► user_achievements ───────► achievements
   └──────────┘
                     ┌────────────────────┐
                     │  leaderboard_seed  │  (seeded competitors)
                     └────────────────────┘
                     ┌────────────────────┐
                     │  tutor_messages    │  (Duo Max conversation log)
                     └────────────────────┘
```

**Design choices:**
* Exercise `payload` is a JSON column — accommodates varied shapes (multiple-choice options, translate word bank, match pairs, fill-blank sentence, type-answer prompt) with a single schema.
* Progress is separated from user so we can add multi-language support without denormalising.
* `correctAnswer` lives in payload but is **stripped server-side** before responses (see `sanitize_exercise` in `routes/course.py`).
* Answer normalisation strips accents/case/punctuation → `HOLA!` matches `hola`.

---

## Core Features Implemented

**Learning path / skill tree**
* ✅ S-curve visual layout, unit banners with colors, mascot flourishes
* ✅ Lock → active → completed states; crown progress rings per skill (up to 5 crowns each)
* ✅ Auto-highlights the current "Start" skill with a bouncing tooltip
* ✅ Top bar with streak, XP, hearts, gems (mocked)

**Lesson player (the core loop)**
* ✅ Five varied exercise types:
  1. **Multiple choice** — pick the correct Spanish word with emoji visuals
  2. **Translate word bank** — tap English words to form the Spanish sentence
  3. **Match pairs** — connect Spanish words to their English meaning
  4. **Fill in the blank** — pick the right conjugation
  5. **Type the answer** — free-text with accent normalisation
* ✅ Signature Duolingo feedback bar (green correct / red incorrect)
* ✅ Progress bar across the lesson, hearts deducted on wrong answers
* ✅ Out-of-hearts modal, lesson-end failure handling
* ✅ **Duo Owl mascot** — animated SVG that shows emotion (idle / happy / cheer / sad / thinking)
* ✅ **Text-to-speech** on Spanish words + English source sentences (browser Web Speech API)
* ✅ **"Ask Duo Max" button** on wrong answers → AI explanation from Gemini

**Gamification & progress**
* ✅ Streak counter with daily-activity logic (dev helper `/api/dev/advance-day` for testing)
* ✅ Total XP + daily-goal indicator (progress bar in right rail)
* ✅ Hearts: lose on wrong, regenerate 1 heart / 30 min, refill with 350 gems, refill via **practice mode**
* ✅ **Practice mode** — replay a finished skill for +5 XP and +1 heart (matches real Duolingo)
* ✅ **Legendary mode** — timed challenge (60 s / exercise), shuffled order, +40 XP, unlocks the Legendary achievement 💎
* ✅ Bronze league leaderboard — you + 10 seeded competitors, sorted by XP
* ✅ **Achievement engine** — 7 unlockable badges (First Steps, On Fire, Wordsmith, Scholar, Sharpshooter, Weekly Warrior, Legendary) triggered by rules

**Content management**
* ✅ One Spanish 101 course seeded in SQLite: 3 units → 7 skills → 10 lessons → 36 exercises across all 5 types
* ✅ Learner profile with editable name & avatar (10 emoji options), streak/XP/league/goal stats, achievement wall

**Duolingo experience**
* ✅ Playful, colorful, gamified UI — Duo's exact color palette + Nunito font + 3D pressed-button shadows
* ✅ Animated feedback bar, confetti-filled lesson complete screen with stat cards
* ✅ Modals (lesson complete, out of hearts, hearts refill, Duo Max), toast notifications (Sonner)
* ✅ Path navigation with unit-scoped popovers
* ✅ Settings placeholders ("Coming soon" cards)

**Signature differentiators**
* 🌙 **Full dark mode** (real Duolingo's OLED-black palette) — toggle in sidebar, persists per user in DB
* 🤖 **Duo Max AI Tutor** (Gemini 2.5 Flash) with two entry points:
  * "Ask Duo Max" button on wrong answers → concise, encouraging explanation
  * Full chat panel from sidebar / floating button → conversational tutor for any Spanish question
* 🔊 **Text-to-speech** on every exercise prompt & option (no API cost — browser Web Speech API)
* 📱 **Responsive** — mobile bottom-nav + desktop sidebar; works on phones, tablets and desktop
* 🏆 **Legendary mode** — timed practice challenge, per the assignment's bonus item

---

## Mocked / Placeholders (per the assignment's guidance)

* Speech recognition / pronunciation exercises → "Speech practice → Coming soon" in `More`
* In-app purchases / Super subscription → gems are mocked; Unlimited Hearts card is "Coming soon"
* Friends → seeded leaderboard only
* Multiple languages → one seeded course (Spanish 🇪🇸)
* Real user authentication → default-learner (`id="default-user"`), per assignment's permission to simplify auth

---

## API Overview

Base URL: `${NEXT_PUBLIC_BASE_URL}/api`

### User
* `GET /user` → get/create default learner
* `POST /user` → update `name`, `avatar`, `dailyGoal`, `theme`

### Course
* `GET /course` → full unit/skill/lesson tree with per-user progress
* `GET /lesson/{id}` → lesson exercises (correctAnswer stripped)
* `GET /lesson/{id}/legendary` → shuffled exercises + `legendary: true` flag

### Gameplay
* `POST /answer` → `{ exerciseId, answer }` → validates, deducts heart on wrong
* `POST /lesson/complete` → `{ lessonId, xpEarned, mistakes, timeSec, mode }` → grants XP, crown, streak, achievements
* `POST /hearts/refill` → `{ method: 'gems' | 'practice' | 'ad' }`
* `GET /leaderboard` → league + seeded users + you (sorted by XP)
* `GET /achievements` → 7 achievements with unlocked flag per user

### AI Tutor (Duo Max)
* `POST /tutor/explain` → explain a wrong answer in 2–3 friendly sentences
* `POST /tutor/chat` → conversational tutor, session-persistent
* `GET /tutor/history/{session_id}` → full conversation log

### Dev helpers
* `POST /dev/reset` → wipe user progress (course seeds preserved)
* `POST /dev/advance-day` → set `lastActive = yesterday` (streak testing)

### Anti-cheat
* `correctAnswer` is **never** sent to the client on `GET /lesson/{id}`.
* Answer normalisation happens server-side.

---

## Local Setup

```bash
# 1. Clone
git clone <repo> duolingo-clone && cd duolingo-clone

# 2. Backend (FastAPI + SQLite)
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/
cp .env.example .env       # add your EMERGENT_LLM_KEY for Duo Max
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
# SQLite DB is auto-created and seeded on first run.

# 3. Frontend (Next.js)
cd ..
yarn install
yarn dev                    # runs on port 3000, /api/* proxies to :8001
```

Then open `http://localhost:3000` — reset progress at any time with:
```bash
curl -X POST http://localhost:3000/api/dev/reset
```

---

## Environment Variables

**Backend** (`backend/.env`):
```
DATABASE_URL=sqlite+aiosqlite:///./duolingo.db
EMERGENT_LLM_KEY=sk-emergent-...   # required for Duo Max AI (get from https://app.emergent.sh)
AI_MODEL=gemini-2.5-flash
AI_PROVIDER=gemini
CORS_ORIGINS=*
```

**Frontend** — nothing user-facing; `NEXT_PUBLIC_BASE_URL` is auto-set by the host in production.

---

## Deployment

Any Node host for the frontend + any Python host for the backend:

* **Frontend → Vercel**: `vercel --prod`. Set `NEXT_PUBLIC_API_URL` to your FastAPI URL if the rewrite proxy is not used.
* **Backend → Render**: create a Web Service pointing to `backend/`, start command:
  `uvicorn app.main:app --host 0.0.0.0 --port $PORT`. Add env vars from `.env.example`.

Update `next.config.js` `rewrites()` destination to point to the deployed FastAPI URL.

---

## Assumptions

1. Single default learner (`default-user`) — auth deliberately simplified per assignment.
2. Streak is a date-string comparison, not a real timezone-aware timer. Dev endpoint helps testing.
3. Hearts regenerate 1 per 30 min (shortened from Duolingo's ~4h for demo purposes).
4. XP formula: `max(5, base - mistakes*2)` where base is 15/5/40 for lesson/practice/legendary.
5. Course content is seeded via Python data; no admin surface for the MVP.
6. Match-pairs are optimistically confirmed in the UI and revalidated on submit.
7. Duo Max is powered by Gemini 2.5 Flash (free tier). It gracefully degrades to "Duo Max is having trouble" on any LLM error.
8. Web Speech API TTS is browser-side and free — quality varies by browser.

---

## Files of interest

| File | Purpose |
| --- | --- |
| `backend/app/main.py` | FastAPI entrypoint |
| `backend/app/models.py` | SQLAlchemy schema (10 tables) |
| `backend/app/routes/*.py` | Endpoint modules |
| `backend/app/utils.py` | Answer normalisation, achievement rules |
| `backend/app/seed_data.py` | Course/leaderboard/achievement seed |
| `app/page.tsx` | Main SPA shell (TypeScript) |
| `components/duo/*.tsx` | Duolingo UI components (Sidebar, TopBar, SkillTree, LessonPlayer, DuoOwl, DuoMax, Profile, Leaderboard, Shop, HeartsModal, LessonComplete, RightRail) |
| `lib/types.ts` | Shared TypeScript types |
| `next.config.js` | `/api/*` rewrite proxy to FastAPI |
| `tailwind.config.js` + `app/globals.css` | Duo design tokens + dark mode |

---

## What makes this stand out

1. **Faithful stack compliance** — matches the assignment brief exactly (Next.js TS + FastAPI + SQLite), not a MongoDB/Node substitute.
2. **Real backend architecture** — resource-organised routers, ORM models, pure utility functions, seeded catalog vs user progress separation. Not one giant file.
3. **AI differentiator that reflects the real Duolingo** — Duolingo just launched "Max" with GPT-4 in production; this clone ships a working equivalent with Gemini. Two entry points (in-lesson explain + full chat).
4. **Dark mode that looks like the real Duolingo** — proper design tokens (`--surface`, `--ink`, `--outline`) + Duolingo's exact `#131f24` OLED background.
5. **All 5 exercise types implemented from scratch**, not just multiple choice.
6. **Practice + Legendary modes**, both from the assignment's core and bonus lists.
7. **TTS on every prompt** — free bonus item ticked off.
8. **Server-side anti-cheat** — correctAnswer never leaves the server on lesson fetch.
9. **Fully responsive** — mobile bottom nav + desktop sidebar layouts.
10. **Type-safe frontend** with a single `lib/types.ts` module driving the entire UI.

---

Built for the Scaler SDE Fullstack assignment. 🦉
Name - Abhimanyu Pratap Singh

