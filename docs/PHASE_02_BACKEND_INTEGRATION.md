# RagFloe Phase 2 — Backend Integration
## Goal
Connect existing Next.js UI to FastAPI + Supabase PostgreSQL.
```text
Next.js → Bearer Token → FastAPI → PostgreSQL
                           ↓
                    Auth + Authorization
```
Frontend MUST NOT access PostgreSQL directly.

## Scope
Implement only: profiles, organizations, organization_members, projects, roles, RLS, FastAPI CRUD APIs, frontend API integration. Do NOT implement documents, embeddings, Qdrant, RAG, prompts, evaluation, or API keys.

## Database Schema
Supabase Auth already provides `auth.users`.
```text
profiles:
id UUID PK → auth.users(id), display_name TEXT, avatar_url TEXT, created_at, updated_at

organizations:
id UUID PK, name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, plan TEXT DEFAULT 'free', created_at, updated_at

organization_members:
organization_id UUID FK → organizations(id), user_id UUID FK → auth.users(id),
role TEXT NOT NULL, created_at, PK(organization_id,user_id)

projects:
id UUID PK, organization_id UUID FK → organizations(id), name TEXT NOT NULL,
slug TEXT NOT NULL, description TEXT, status TEXT DEFAULT 'active',
created_at, updated_at, UNIQUE(organization_id,slug)
```
Roles: `owner`, `admin`, `developer`.
Relationship: `auth.users → organization_members → organizations → projects`.
A project always belongs to an organization. Never trust frontend `user_id`.

## Database Setup
Use Supabase SQL migrations. Use SQLAlchemy in FastAPI.
```text
backend/app/
  api/ core/ models/ schemas/ repositories/ services/
```
Create `app/core/database.py` for engine, session factory, and DB dependency.
Backend `.env`: `DATABASE_URL=`, `SUPABASE_URL=`.
Never expose database credentials/service-role credentials to Next.js.
Add indexes on membership user/org IDs and project organization/slug.

## RLS + Authorization
Enable RLS on `profiles`, `organizations`, `organization_members`, `projects`.
```text
Verified User → Organization Membership → Organization → Project
```
Users must never access another organization's data. RLS is defense-in-depth; FastAPI MUST also authorize every request.
Create `require_organization_member()`, `require_organization_role()`, `require_project_access()`.
Permissions: Owner = everything; Admin = members/projects; Developer = project access, no member management.

## Authentication
Phase 1 is complete:
```text
OAuth → Supabase Auth → Session → Bearer Token → FastAPI JWKS → current_user
```
Reuse the existing `get_current_user()` dependency on every protected Phase 2 endpoint.

## Models + Schemas
Create SQLAlchemy models: `Profile`, `Organization`, `OrganizationMember`, `Project`.
Create separate Pydantic schemas: `OrganizationCreate`, `OrganizationResponse`, `ProjectCreate`, `ProjectResponse`, etc.
Never return ORM models directly.

## Organization APIs
```text
GET    /api/v1/organizations
POST   /api/v1/organizations
GET    /api/v1/organizations/{id}
PATCH  /api/v1/organizations/{id}
DELETE /api/v1/organizations/{id}
```
Creation: verified JWT user → create organization → create membership with `owner` role → commit transaction.

## Member APIs
```text
GET    /api/v1/organizations/{id}/members
PATCH  /api/v1/organizations/{id}/members/{user_id}
DELETE /api/v1/organizations/{id}/members/{user_id}
```
Do not build complex email invitations yet.

## Project APIs
```text
GET    /api/v1/organizations/{id}/projects
POST   /api/v1/organizations/{id}/projects
GET    /api/v1/projects/{project_id}
PATCH  /api/v1/projects/{project_id}
DELETE /api/v1/projects/{project_id}
```
Flow: `JWT user → organization access → role check → operation`.

## Frontend API Client
Create:
```text
frontend/lib/api/
  client.ts
  organizations.ts
  projects.ts
```
The client reads the Supabase session, gets the access token, sends `Authorization: Bearer <token>`, calls FastAPI, and handles errors. Components must not duplicate API/auth logic.

## Bind Existing UI
Organizations: `GET/POST /api/v1/organizations`.
Projects: `GET/POST /api/v1/organizations/{id}/projects`.
Workspace: `GET /api/v1/projects/{project_id}`.
Replace mock data with API data while preserving the current UI. Future workspace modules remain placeholders.

## Errors
`401` unauthenticated; `403` unauthorized; `404` not found; `409` conflict; `422` validation; `500` server error. Never expose stack traces or secrets.

## Testing
Verify OAuth still works; organization creation; creator becomes owner; real organization data in UI; project CRUD; real workspace data; role restrictions; cross-organization denial; RLS tenant isolation; missing/invalid tokens return 401.

## Implementation Order
```text
Schema → Migrations → Constraints/Indexes → RLS
→ SQLAlchemy Models → Pydantic Schemas → Authorization
→ Organization APIs → Member APIs → Project APIs → Tests
→ Frontend API Client → Replace Mock Data → End-to-End Test
```

## Agent Guardrails
- Inspect Phase 1 before coding.
- Reuse JWKS authentication; do not rewrite OAuth.
- Never connect Next.js directly to PostgreSQL.
- Do not add unnecessary dependencies.
- Do not implement future RAG modules.
- Run backend tests and TypeScript/lint checks.
- Report changed files and remaining work.

## Definition of Done
```text
Login → Organizations → Create/Select Organization
→ Members/Roles → Projects → Project Workspace → Authorized Data Only
```
Phase 2 is complete only when this entire flow works end-to-end.
