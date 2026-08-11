# RagFloe Backend — Phase 1 Auth + Phase 2 Orgs/Projects

FastAPI verifies Supabase access tokens and serves organization/project APIs backed by Supabase Postgres.

## Prerequisites

- Python 3.11+
- A Supabase project (same one used by the frontend)
- Frontend running at `http://localhost:3000` (for CORS + integration)

## Setup

```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
# source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
```

Fill `.env`:

| Variable | Where to get it |
|----------|-----------------|
| `SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `SUPABASE_JWT_SECRET` | Optional legacy HS256 secret. New projects use JWKS at `{SUPABASE_URL}/auth/v1/.well-known/jwks.json` |
| `DATABASE_HOST` / `DATABASE_USER` / `DATABASE_PASSWORD` | Supabase → Project Settings → Database → **Connection string → Pooler (Session mode)**. On Windows prefer the pooler host (`aws-0-<region>.pooler.supabase.com`) and user `postgres.<project-ref>`. Direct `db.<ref>.supabase.co` is often IPv6-only. Use the **database** password (reset it in that screen if auth fails)—not your Supabase login password. Special characters in the password are encoded automatically. |
| `CORS_ORIGINS` | `http://localhost:3000` for local frontend |

Never put database passwords, JWT private keys, or service-role keys in the frontend.

## Migrations

```bash
cd backend
alembic upgrade head
```

Creates `profiles`, `organizations`, `organization_members`, `projects` plus RLS policies.

## Run

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

- Health: `GET /health`
- Me: `GET /api/v1/me`
- Orgs: `GET/POST /api/v1/organizations`
- Projects: `GET/POST /api/v1/organizations/{id}/projects`, `GET/PATCH/DELETE /api/v1/projects/{id}`

All protected routes require `Authorization: Bearer <supabase_access_token>`.

## Automated tests

```bash
cd backend
pytest -q
```

## Architecture

- Frontend owns the Supabase session and sends `access_token` as Bearer.
- FastAPI verifies JWTs (JWKS ES256/RS256, HS256 fallback) and authorizes membership/roles in app code.
- SQLAlchemy uses a privileged `DATABASE_URL` connection; RLS is defense-in-depth for direct client access.
- OAuth identity linking (Google ↔ GitHub) is handled in Supabase Auth / the frontend. Linked providers keep the same `auth.users.id` (`sub`), so `/api/v1/me` and org/project ownership are unchanged.
- Startup warms the DB pool and JWKS cache so the first authenticated API call is not a cold connect.
