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

## Phase 3: Registration wizard

Adds read-only platform catalog endpoints and the business registration
flow: draft save/resume for wizard steps 2-4, and a `finish` endpoint
that atomically creates the `businesses` + `subscriptions` +
`subscription_backup_modules` rows.

**Step 1 (Account) is not part of this — it's `/auth/signup`.** The
`registration_drafts` table requires a `user_id` (its FK is `NOT NULL`),
so a draft can only exist for a user that already exists.
`RegisterBusinessPage.jsx`'s own step-1 form (username/email/password/etc.)
duplicates what `SignUpPage.jsx` already collects — see "Known gaps" below.

### New endpoints

| Method | Path                         | Auth   | Notes |
|--------|-------------------------------|--------|-------|
| GET    | `/api/catalog/modules`        | —      | All modules, incl. `is_available:0` ones ("MORE SOON" tiles). |
| GET    | `/api/catalog/business-types` | —      | |
| GET    | `/api/catalog/plans`          | —      | Active plans only. |
| GET    | `/api/catalog/backup-modules` | —      | Active backup modules only. |
| GET    | `/api/registration/draft`     | cookie | `{ draft: null }` if none saved yet. |
| PUT    | `/api/registration/draft`     | cookie | `{ step: 2\|3\|4, payload: {...} }` — upserts. |
| POST   | `/api/registration/finish`    | cookie | Creates the business. 409 if one already exists for this user. |

`POST /api/registration/finish` body shape:
```json
{
  "business": {
    "businessName": "Fairy Parcel Co",
    "businessTypeCode": "grocery",
    "location": "Karachi, DHA",
    "cityRegion": "Karachi, Sindh",
    "shopAddress": "Shop 12, Bahadurabad",
    "isRegistered": true,
    "nicNumber": "42101-1234567-1"
  },
  "moduleCode": "grocery",
  "subscription": {
    "planCode": "retention_6m",
    "platform": "web_app",
    "paymentMethod": "card",
    "backupModuleCodes": ["sales_pos", "inventory"]
  }
}
```

### Known gaps to fix on the frontend (not touched by this patch)

- `RegisterBusinessPage.jsx` step 1 duplicates `SignUpPage.jsx` (both
  collect username/email/password). Once a user is authenticated via
  `/auth/signup`, this step should be skipped or pre-filled/read-only.
- `businessForm.businessType` is free text, not sourced from
  `GET /api/catalog/business-types`. The backend does a best-effort
  case-insensitive match and falls back to `'other'` so this doesn't
  block registration, but a real dropdown would be more correct.
- The retention-plan buttons (`3month`, `6month`, `3month_dup`) don't
  match `plans.code` (`retention_3m`/`retention_6m`/`retention_12m`) —
  there's also a duplicate `3month_dup` button where a 12-month option
  should be, and no 12-month plan is actually offered in the UI.
- `platform` state uses `'web'|'mobile'|'both'`; the API expects the
  schema's exact enum: `'web_app'|'mobile_pos'|'both'`.
- `paymentMethod` state uses `'card'|'bank'|'jazzcash'`; the API expects
  `'card'|'bank_transfer'|'jazzcash_easypaisa'`.
- `backupSales`/`backupInventory` are separate booleans; the API wants
  `subscription.backupModuleCodes: ['sales_pos', 'inventory']`.
- `shopAddress` is collected in step 1, but the schema needs it on
  `businesses` at finish-setup time — it's optional in the request body,
  so wire it in whenever the frontend has it available.
- `handleFinishSetup` currently just does `navigate('/dashboard')` with
  no API call at all — this whole flow needs wiring up.

### Design notes / schema decisions made this phase

- `PUT /api/registration/draft` stores whatever `payload` object the
  frontend sends, whole — no partial merge server-side. The frontend is
  expected to always send its full accumulated wizard state, not a diff.
- `finish` re-validates everything server-side (module availability,
  plan active, NIC-when-registered, etc.) rather than trusting the
  draft — the draft is for UX convenience, not a source of truth.

