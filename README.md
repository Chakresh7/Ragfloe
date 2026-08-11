# RagFloe

RAG-as-a-Service platform for developers.

## Stack

- **Frontend:** Next.js (App Router) + Supabase Auth (Google / GitHub OAuth)
- **Backend:** FastAPI + SQLAlchemy
- **Database / Auth:** Supabase PostgreSQL + JWKS JWT verification

## Phases shipped

1. **Foundation** — monorepo docs and gitignore
2. **Frontend auth** — Google/GitHub OAuth, session middleware, login UX (always-light login, no back-to-login when signed in)
3. **Backend auth** — JWT/JWKS verification and `GET /api/v1/me`
4. **Orgs/projects API** — schema, RLS, membership roles, FastAPI CRUD
5. **Orgs/projects UI** — authenticated workspace wired to the API
6. **Account linking** — Settings → Connected Accounts (`linkIdentity` / no silent merge)
7. **Ops notes** — this README quick start

## Quick start

### Frontend

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

### Backend

```bash
cd backend
cp .env.example .env
# create/activate a Python venv, then:
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

Never commit `.env` / `.env.local` or the service-role key.
