# RagFloe Frontend — Phase 1 Authentication

Next.js App Router app with Supabase Auth (Google + GitHub OAuth).

## Prerequisites

- Node.js 20+
- A Supabase project with Google and GitHub providers enabled

## Setup

1. Copy environment variables:

```bash
cp .env.local.example .env.local
```

2. Fill in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-or-publishable-key
```

Use the **Project URL** and **anon / publishable** key from Supabase → Project Settings → API.  
Never put the **service_role** key in the frontend.

3. Install and run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

For backend identity checks, also set:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

and run the FastAPI server (see `../backend/README.md`).

## Manual Supabase configuration

Complete these steps in the Supabase dashboard (and provider consoles) before OAuth works:

### 1. Google provider

1. Google Cloud Console → create OAuth 2.0 Client ID (Web)
2. Authorized redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`
3. Supabase → Authentication → Providers → **Google** → enable and paste Client ID + Secret

### 2. GitHub provider

1. GitHub → Settings → Developer settings → **OAuth Apps** → New OAuth App
2. Homepage URL: `http://localhost:3000`
3. Authorization callback URL: `https://<project-ref>.supabase.co/auth/v1/callback`
4. Create the app, then generate a **Client Secret**
5. Supabase → Authentication → Providers → **GitHub** → enable and paste Client ID + Secret

### 3. Auth URL configuration

Supabase → Authentication → URL Configuration:

| Setting | Local value |
|---------|-------------|
| Site URL | `http://localhost:3000` |
| Redirect URLs | `http://localhost:3000/auth/callback` |

### 4. Manual identity linking (required for Connected Accounts)

Supabase Auth can attach Google and GitHub to **one** `auth.users` row.

1. Supabase → **Authentication** → **Providers** (or Auth settings)
2. Enable **Manual linking** (`GOTRUE_SECURITY_MANUAL_LINKING_ENABLED`)
3. Keep providers’ verified emails unique (Supabase default automatic linking for matching verified emails remains enabled)

Then in RagFloe: **Settings → Account → Connected accounts** → **Connect** for Google/GitHub while signed in.  
RagFloe never silently merges two existing `auth.users` rows just because emails match. If a provider identity already belongs to another user, linking fails with a clear error.

X / Twitter is deferred (free API plan cannot reliably return user profile).

## Auth flow

- `/login` — Continue with Google / Continue with GitHub
- `/auth/callback` — exchanges OAuth code for a session cookie (also completes identity linking)
- `/settings/account` — Connected Accounts (`linkIdentity` / `unlinkIdentity`) + API identity check
- `/organizations` — protected app home
- `POST /auth/signout` — clears session and returns to `/login`
- Unauthenticated access to protected routes redirects to `/login`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
