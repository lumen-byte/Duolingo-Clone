# GitHub Repository Structure

For the final submission, the recommended repo layout is:

```
duolingo-clone/
├── frontend/            <-- move Next.js files here (see below)
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── next.config.js
│   └── .env.example      # NEXT_PUBLIC_API_URL if backend on different host
├── backend/              <-- FastAPI app (already at /app/backend)
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── utils.py
│   │   ├── seed.py
│   │   ├── seed_data.py
│   │   └── routes/
│   │       ├── user.py
│   │       ├── course.py
│   │       ├── game.py
│   │       └── tutor.py
│   ├── requirements.txt
│   ├── .env.example
│   └── duolingo.db       # created on first run (gitignore this)
├── README.md
└── .gitignore
```

## Local repo restructure (one-time command)

```bash
cd /path/to/preview-project
mkdir -p frontend
# Move all frontend files into ./frontend
for item in app components lib public package.json package-lock.json yarn.lock \
            tsconfig.json next.config.js tailwind.config.js postcss.config.js \
            next-env.d.ts .env components.json; do
  [ -e "$item" ] && mv "$item" frontend/
done
# backend/ is already in place.
```

## .gitignore
```
node_modules/
.next/
frontend/.env
backend/.env
backend/duolingo.db
backend/__pycache__/
backend/**/__pycache__/
backend/.venv/
.DS_Store
```
