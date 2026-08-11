You are working on RagFloe, a developer-focused RAG-as-a-Service platform.

CURRENT TASK: Implement Phase 1 Authentication only.

TECH STACK:
- Frontend: Next.js + TypeScript
- Backend: FastAPI + Python
- Auth/Database: Supabase
- Authentication providers currently enabled: Google OAuth and X OAuth
- GitHub OAuth will be added later.

GOAL:
Implement a complete authentication flow using Supabase Auth.

REQUIREMENTS:

1. Create Supabase client configuration for the Next.js frontend.
2. Implement a login page with exactly two OAuth options:
   - Continue with Google
   - Continue with X
3. When the user clicks either provider, initiate Supabase OAuth.
4. Implement the OAuth callback route.
5. Correctly establish and persist the authenticated Supabase session.
6. Create protected application routes/pages that unauthenticated users cannot access.
7. If an unauthenticated user tries to access a protected route, redirect them to /login.
8. Create a logout action that signs the user out through Supabase.
9. Display the authenticated user's basic information (email/name/avatar when available).
10. Handle OAuth errors gracefully and show useful user-facing error messages.
11. Do NOT implement GitHub authentication yet.
12. Do NOT implement Organizations, OrganizationMember, Projects, RAG, documents, embeddings, or any other RagFloe modules yet.

IMPORTANT ARCHITECTURE:
- Supabase Auth's auth.users is the authentication source of truth.
- Do NOT create a custom users table for authentication.
- Keep authentication logic separate from future RagFloe business entities.
- Use environment variables for Supabase URL and public/publishable key.
- Never expose Supabase service-role credentials in the frontend.
- Follow the existing project structure instead of unnecessarily rewriting the application.

BEFORE CODING:
1. Inspect the existing repository structure.
2. Identify the current Next.js version and routing approach.
3. Identify whether Supabase is already configured.
4. Reuse existing components and conventions where appropriate.
5. Do not install unnecessary dependencies.

EXPECTED RESULT:
A user should be able to:

/login
  ↓
Continue with Google OR Continue with X
  ↓
OAuth provider
  ↓
Supabase Auth
  ↓
OAuth callback
  ↓
Authenticated session
  ↓
Protected dashboard

And:

Dashboard
  ↓
Logout
  ↓
Session destroyed
  ↓
Redirect to /login

After implementation:
- Run the project.
- Verify both OAuth flows.
- Verify protected-route behavior.
- Verify logout.
- Verify no secrets are exposed.
- Report exactly what files were created/modified and what remains to be configured manually in Supabase.