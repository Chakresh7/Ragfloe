# RagFloe

RAG-as-a-Service platform for developers.

## Stack

- **Frontend:** Next.js (App Router) + Supabase Auth (Google / GitHub OAuth)
- **Backend:** FastAPI + SQLAlchemy
- **Database / Auth:** Supabase PostgreSQL + JWKS JWT verification

## Phases in this repo

1. Project foundation and documentation
2. Frontend authentication (Supabase OAuth)
3. Backend authentication (JWT / JWKS + `/api/v1/me`)
4. Organizations & projects backend (schema, RLS, APIs)
5. Organizations & projects frontend integration
6. OAuth account linking (Connected Accounts)
7. Auth performance + login UX polish

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
