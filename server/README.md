# Nexus Desktop — Server

Backend for Nexus Desktop, a multi-tenant POS app. Raw `mysql2` (no ORM),
Express, JWT auth via httpOnly cookies.

## Phase 1 + 2: Foundation + Auth

This patch sets up the server skeleton and a complete authentication
system: signup, login, session-based `/me`, logout, refresh-token
rotation, and forgot/reset password. Everything else (business
registration wizard, catalog, POS, inventory, sales, super admin) comes
in later patches — `app.js` has a comment marking where those routers
get mounted.

### Setup

1. **Apply the schema.** Open `db/schema.sql` in MySQL Workbench and run
   it (it drops/recreates the `nexus_desktop` database — safe for local
   dev). Or, from this folder: `npm run db:reset`.

2. **Configure env vars.**
   ```
   cp .env.example .env
   ```
   Fill in your MySQL credentials and generate real JWT secrets:
   ```
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```
   Run it twice — once for `JWT_ACCESS_SECRET`, once for `JWT_REFRESH_SECRET`.

3. **Install & run.**
   ```
   npm install
   npm run dev
   ```
   Server starts on `http://localhost:5000`. It refuses to start if it
   can't reach MySQL, with a message pointing back here.

4. **Frontend.** No changes needed — `src/lib/api.js` already points at
   `http://localhost:5000/api` by default (override with `VITE_API_URL`
   in the frontend's own `.env`).

### Endpoints in this phase

| Method | Path                        | Auth      | Notes |
|--------|-----------------------------|-----------|-------|
| POST   | `/api/auth/signup`          | —         | Creates the user, logs them in. Business is created later (wizard). |
| POST   | `/api/auth/login`           | —         | Accepts username *or* email in the `username` field. |
| GET    | `/api/auth/me`               | cookie    | Returns `{ user }` incl. `businessId` (null pre-onboarding). |
| POST   | `/api/auth/logout`          | —         | Revokes the current refresh session. |
| POST   | `/api/auth/refresh`         | cookie    | Rotates access+refresh tokens. |
| POST   | `/api/auth/forgot-password` | —         | Always 200; logs the reset link to the console (no email provider wired up yet). |
| POST   | `/api/auth/reset-password`  | —         | Consumes the token, revokes all sessions for that user. |

### Known gaps to fix on the frontend (not touched by this patch)

- `LoginPage.jsx`'s `ROLE_REDIRECTS` uses `'super-admin'` (hyphen); the
  schema/backend use `'super_admin'` (underscore). Role-based redirects
  won't work until that's aligned.
- `LoginPage.jsx` has a `remember` checkbox in state but never sends it
  in the `/auth/login` request body — the backend already accepts and
  uses it (`remember`), just needs the one-line wiring.
- `ProtectedRoute.jsx` / `RoleRoute.jsx` exist but aren't used in
  `App.jsx` yet — every route is currently public.
- `ForgotPasswordPage.jsx` isn't wired to `apiFetch` yet.

### Design notes / schema decisions made this phase

- `users.status` defaults to `'active'` on signup rather than `'pending'`
  — there's no email-verification UI in the frontend yet, so leaving new
  accounts `'pending'` would just lock everyone out. Revisit if/when an
  email-verification flow gets built.
- `sessions.ip_address` is left `NULL` for now — schema reserves it for
  a future "Active Sessions" screen that doesn't exist in the frontend
  yet; wiring real IPv4/IPv6 parsing for a value nothing reads felt
  premature.
- Refresh tokens are rotated by **revoking** the old session row (not
  deleting it), so `sessions` doubles as an audit trail.
