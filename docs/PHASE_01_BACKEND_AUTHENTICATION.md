# RagFloe — Phase 1 Backend Authentication

## Objective

Integrate the existing Supabase Authentication system with the FastAPI backend.

The frontend already supports:

- Google OAuth
- GitHub OAuth

Do NOT rebuild OAuth in FastAPI.

The backend must verify the authenticated user's Supabase access token and establish the user's identity for protected API requests.

---

# 1. Architecture

The authentication flow must be:

Frontend
    ↓
Google / GitHub
    ↓
Supabase Auth
    ↓
Authenticated Supabase Session
    ↓
Access Token
    ↓
FastAPI
    ↓
Verify Access Token
    ↓
Authenticated User
    ↓
Protected API

Supabase Auth remains the authentication source of truth.

FastAPI is responsible for validating the user's authentication
before allowing access to protected backend resources.

---

# 2. Backend Technology

Use:

- Python
- FastAPI
- Supabase
- Pydantic
- Existing project dependencies

Do not introduce another authentication provider.

Do not implement a second JWT authentication system.

Do not create custom OAuth flows.

---

# 3. Supabase Configuration

The backend must use environment variables.

Required configuration should conceptually include:

SUPABASE_URL
SUPABASE_JWT_SECRET / appropriate Supabase verification configuration
SUPABASE_SERVICE_ROLE_KEY (server-side only, only if actually required)

IMPORTANT:

- Never expose service-role credentials to the frontend.
- Never commit secrets.
- Never hardcode credentials.
- Use `.env`.
- Provide `.env.example`.

Inspect the current Supabase project configuration before deciding
which verification mechanism is appropriate.

---

# 4. Token Verification

Create backend authentication middleware/dependency.

The backend should receive:

Authorization: Bearer <access_token>

FastAPI must:

1. Extract the Bearer token.
2. Validate that the token exists.
3. Verify the token with Supabase's supported authentication mechanism.
4. Reject invalid or expired tokens.
5. Extract the authenticated user's Supabase user ID.
6. Make the authenticated user available to protected endpoints.

Invalid/missing token:

HTTP 401 Unauthorized

Do not return sensitive authentication details.

---

# 5. Authentication Dependency

Create a reusable FastAPI authentication dependency.

Conceptually:

get_current_user()

The dependency should:

- Read Authorization header.
- Extract Bearer token.
- Verify token.
- Return authenticated user information.

Protected endpoints should use this dependency.

Example concept:

GET /api/v1/me

Request:

Authorization: Bearer <supabase_access_token>

Response:

{
  "id": "supabase-user-id",
  "email": "user@example.com"
}

Do not expose unnecessary Supabase/internal fields.

---

# 6. User Identity

Supabase Auth's `auth.users` remains the source of truth.

The backend must use the Supabase user ID as the user's identity.

Do NOT create another authentication users table.

Do NOT create passwords in the RagFloe backend.

Do NOT store OAuth provider secrets.

The user's identity comes from:

Supabase Auth
    ↓
Supabase User ID
    ↓
FastAPI authenticated user

---

# 7. Protected Routes

Create at least one protected endpoint for verification:

GET /api/v1/me

Expected behavior:

Authenticated request
→ 200 OK

Missing token
→ 401 Unauthorized

Invalid token
→ 401 Unauthorized

Expired token
→ 401 Unauthorized

This endpoint is primarily an integration test for the authentication layer.

Do not implement Organizations or Projects yet.

---

# 8. Frontend → Backend Integration

The existing frontend authentication must remain unchanged unless modifications are required to send the Supabase access token.

When calling a protected FastAPI endpoint:

Frontend obtains current Supabase session
    ↓
Extract access_token
    ↓
Send:

Authorization: Bearer <access_token>

FastAPI verifies the token.

Do not send passwords.

Do not send OAuth client secrets.

Do not manually construct JWTs in the frontend.

---

# 9. Session Handling

The frontend remains responsible for maintaining the user's Supabase session.

FastAPI should not maintain a second independent login session.

FastAPI should validate the access token on protected requests.

The system should therefore have:

Frontend:
Session management

Backend:
Token verification + authorization context

Supabase:
Authentication source of truth

---

# 10. CORS

Configure FastAPI CORS for the current frontend origin.

Development example:

Frontend:
http://localhost:3000

Backend:
http://localhost:8000

Do NOT use unrestricted:

allow_origins=["*"]

when credentials/authenticated browser requests are involved.

Use explicit allowed origins through environment configuration.

---

# 11. Authentication Module Structure

Use a modular structure similar to:

backend/
└── app/
    ├── api/
    │   └── v1/
    │       └── routes/
    │           └── auth.py
    │
    ├── core/
    │   ├── config.py
    │   └── security.py
    │
    ├── schemas/
    │   └── auth.py
    │
    ├── services/
    │   └── auth_service.py
    │
    └── main.py

Do not create unnecessary files if the existing backend structure
already has an equivalent organization.

Reuse existing architecture.

---

# 12. Authentication Responsibilities

## Frontend

Responsible for:

- Login UI
- Google OAuth
- GitHub OAuth
- Logout UI
- Session state
- Redirects
- Sending access token to backend

## Supabase

Responsible for:

- OAuth provider integration
- User authentication
- Authenticated session
- Access token issuance
- User identity

## FastAPI

Responsible for:

- Access token validation
- Authentication dependency
- Identifying the current user
- Protecting API routes
- Returning 401 for unauthorized requests

---

# 13. Error Handling

Handle:

- Missing Authorization header
- Invalid Bearer format
- Invalid token
- Expired token
- Supabase verification errors
- Malformed authentication data

Return appropriate HTTP responses.

Example:

401 Unauthorized

Do not expose:

- JWT contents unnecessarily
- Secret keys
- Internal exceptions
- Stack traces

---

# 14. Logging

Authentication failures may be logged for debugging/security,
but NEVER log:

- Access tokens
- Refresh tokens
- Service-role keys
- OAuth client secrets
- Passwords

Example acceptable log:

"Authentication failed: invalid or expired token"

Example unacceptable log:

"Token: eyJhbGciOi..."

---

# 15. Testing

Implement tests for:

### Test 1 — No token

GET /api/v1/me

Expected:

401 Unauthorized

### Test 2 — Invalid token

GET /api/v1/me

Authorization:
Bearer invalid-token

Expected:

401 Unauthorized

### Test 3 — Valid token

Use a real authenticated Supabase session during integration testing.

Expected:

200 OK

And the response contains the authenticated Supabase user ID.

### Test 4 — Frontend integration

Login through Google.

Then call:

GET /api/v1/me

Expected:

FastAPI recognizes the authenticated user.

### Test 5 — GitHub integration

Login through GitHub.

Then call:

GET /api/v1/me

Expected:

FastAPI recognizes the authenticated user.

### Test 6 — Logout

Logout from frontend.

Attempt protected API request.

Expected:

Request is rejected once the session/access token is no longer valid.

---

# 16. Security Requirements

MUST:

- Validate access tokens.
- Protect backend routes.
- Use HTTPS in production.
- Keep secrets server-side.
- Use environment variables.
- Never trust a user ID supplied directly by the frontend.
- Obtain authenticated user identity from the verified token.

MUST NOT:

- Trust `user_id` from request body for authentication.
- Accept arbitrary user IDs from frontend.
- Decode JWT payload and blindly trust it without verification.
- Store OAuth passwords.
- Implement a second authentication system.
- Expose service-role credentials.

---

# 17. Important Architectural Rule

Never do:

POST /projects

{
    "user_id": "some-user-id"
}

and assume that user is authenticated.

Instead:

Request
    ↓
Authorization Header
    ↓
Verified Supabase Token
    ↓
Current User
    ↓
Authorization
    ↓
Create Resource

The authenticated identity must come from the verified token.

---

# 18. Scope Restriction

This phase ONLY implements:

- Supabase integration
- Backend token verification
- Authentication dependency
- Protected endpoint
- Frontend → backend authenticated request
- CORS
- Authentication tests
- Authentication error handling

DO NOT implement:

- Organizations
- Organization Members
- Roles
- Projects
- Documents
- File uploads
- Google Drive
- Qdrant
- Embeddings
- RAG
- Prompt Studio
- Evaluation
- API keys
- Usage analytics

Those belong to later phases.

---

# 19. Definition of Done

Phase 1 Backend Authentication is COMPLETE when:

[ ] FastAPI can validate Supabase access tokens.

[ ] `get_current_user()` dependency works.

[ ] `/api/v1/me` is protected.

[ ] Missing token returns 401.

[ ] Invalid token returns 401.

[ ] Valid Google-authenticated user is recognized.

[ ] Valid GitHub-authenticated user is recognized.

[ ] Frontend can call FastAPI using the Supabase access token.

[ ] Logout/session invalidation behavior is verified.

[ ] CORS is correctly configured.

[ ] Secrets are not exposed.

[ ] Authentication tests pass.

[ ] No future RagFloe modules were implemented.

---

# 20. Agent Instructions

Before coding:

1. Inspect the existing repository.
2. Read `AGENTS.md`.
3. Inspect the existing frontend Supabase authentication implementation.
4. Inspect the existing FastAPI structure.
5. Inspect environment configuration.
6. Determine the Supabase project configuration already in use.
7. Do not rewrite working frontend authentication.
8. Implement only backend authentication integration.

After coding:

1. Run backend tests.
2. Run lint/type checks where available.
3. Test `/api/v1/me`.
4. Test unauthenticated requests.
5. Test authenticated Google flow.
6. Test authenticated GitHub flow.
7. Verify no secrets are logged/exposed.
8. Report modified files.
9. Report any required Supabase configuration.
10. Report anything that remains incomplete.

Do not proceed to Phase 2 automatically.

Phase 2 begins only when Phase 1 authentication is explicitly
marked COMPLETE.