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

### Frontend wiring (this patch)

Originally these endpoints existed but nothing in `src/` called them. This
patch wires the frontend up completely:

- `SignUpPage.jsx` now sends `{ username, email, password, phoneNumber, city }`
  (previously sent stale `businessName`/`businessType` fields left over from
  the old server) and logs the user into `AuthContext` immediately on success.
- `LoginPage.jsx` now sends `remember` in the request body, and its
  post-login redirect uses `super_admin` (underscore) via the shared
  `src/lib/roleRedirects.js` instead of the old `'super-admin'` typo.
- `ForgotPasswordPage.jsx` calls `POST /auth/forgot-password` for real
  (was a fake 2-second `setTimeout`).
- **New page** `ResetPasswordPage.jsx` (route `/reset-password?token=...`)
  — there was no frontend page to actually consume the reset link before
  this patch, even though the backend endpoint existed.
- `ProtectedRoute.jsx` / `RoleRoute.jsx` were stubs ("Temporarily bypass
  ... for development/testing") — now do real auth/role checks and are
  applied in `App.jsx`: shared POS pages require login, `/admin` requires
  `admin`/`super_admin`, `/super-admin/*` requires `super_admin`.

**Left alone, on purpose:** `ModuleSelectPage.jsx` (route `/modules`) posts
to `/business/select-module`, which doesn't exist in the new backend and
doesn't fit the new one-module-per-business schema (a business's module is
now fixed at registration, not re-selectable per staff session). This needs
a product decision, not a guess — flagging it rather than touching it.
Google/Facebook sign-in buttons are also still non-functional; no OAuth
endpoints exist yet (the schema's `oauth_accounts` table is ready for
this whenever it's prioritized).


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
`RegisterBusinessPage.jsx`'s wizard now opens directly at Business
details for this reason — see "Frontend wiring" below.

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

### Frontend wiring (this patch)

`RegisterBusinessPage.jsx` previously had zero API calls at all —
`handleFinishSetup` just did `navigate('/dashboard')`. It's been
substantially rewritten:

- **Step 1 (Account) removed.** It duplicated `SignUpPage.jsx`
  (username/email/password again) and can't work as a draft anyway —
  see the note above about `registration_drafts.user_id`. The wizard
  now opens straight to Business details, renumbered 1-2-3
  (Business details → Module Selection → Backup & Plan). The `shopAddress`
  field that used to live on the old step 1 moved to the business
  details step, since that's what the backend actually needs it for.
- Business type is now a real `<select>` sourced from
  `GET /api/catalog/business-types`, not free text.
- Module tiles are sourced from `GET /api/catalog/modules` — the old
  hardcoded list had `'general-store'` (hyphen) vs. the schema's
  `'general_store'` (underscore), which would have silently sent the
  wrong code. Modules with `is_available: 0` now render as real
  disabled "MORE SOON" tiles instead of one static placeholder box.
- Retention plan buttons are sourced from `GET /api/catalog/plans` —
  fixes the old UI's duplicate 3-month button (there was no 12-month
  option at all before).
- `platform` and `paymentMethod` state now use the backend's exact enum
  values directly (`web_app`/`mobile_pos`/`both`,
  `card`/`bank_transfer`/`jazzcash_easypaisa`) instead of a set of
  values that needed translating.
- Backup module checkboxes are sourced from
  `GET /api/catalog/backup-modules` and collected into
  `subscription.backupModuleCodes` — no more hardcoded `150`/`150`
  pricing; the cost summary is computed live from the fetched prices.
- The wizard now calls `PUT /api/registration/draft` after each step
  and `GET`s it on mount to resume progress, and `handleFinishSetup`
  calls `POST /api/registration/finish` for real, then
  `refreshUser()`s `AuthContext` so `businessId` updates immediately.
- `LoginPage.jsx`'s post-login redirect now sends owners straight to
  `/register-business` if they haven't finished onboarding
  (`role === 'admin' && !businessId`) instead of an empty dashboard.


### Design notes / schema decisions made this phase

- `PUT /api/registration/draft` stores whatever `payload` object the
  frontend sends, whole — no partial merge server-side. The frontend is
  expected to always send its full accumulated wizard state, not a diff.
- `finish` re-validates everything server-side (module availability,
  plan active, NIC-when-registered, etc.) rather than trusting the
  draft — the draft is for UX convenience, not a source of truth.

## Phase 4: Core POS catalog

Categories, suppliers, customers, products, and the module-specific
satellite tables — this is what makes `/inventory` and
`ClothingInventoryPage.jsx` actually work instead of 404ing (they already
called `/inventory/items` etc. before this patch; nothing existed to
answer).

### New middleware: `requireBusiness`

Every route from here on is business-scoped. `requireBusiness` (runs
after `verifyToken`) resolves `req.user.id` → their business and
attaches `req.businessId` + `req.business` (including `module_code`,
used to pick the right satellite table). 403s if the owner hasn't
finished the registration wizard yet.

**Real gap, not fixed here:** this only resolves `businesses.owner_user_id`
— i.e. the `admin` role. There's no staff-to-business linking in the
schema (no `business_staff` table, no `business_id` on `users`), so a
`user`-role login has no way to reach a business's data through this
middleware yet. Hasn't mattered so far because staff accounts aren't
creatable either — will need solving before `role='user'` logins do
anything useful.

### New endpoints

| Method | Path                        | Notes |
|--------|------------------------------|-------|
| GET    | `/api/inventory/items`      | Same shape the frontend already expects: `{ items: [{ id, name, category, price, stock_qty, reorder_level, module_specific_fields }] }` |
| POST   | `/api/inventory/items`      | Creates a product + its satellite row + an `opening` stock movement if `stockQty > 0` |
| GET/PUT/DELETE | `/api/inventory/items/:id` | DELETE is a **soft delete** (`is_active = 0`), not a hard `DELETE` — see below |
| GET    | `/api/inventory/low-stock`  | `stock_quantity <= reorder_level` |
| GET    | `/api/inventory/scan/:barcode` | 404 when nothing matches |
| GET    | `/api/inventory/search?q=`  | LIKE match on name/sku/barcode/category |
| GET/POST/PUT/DELETE | `/api/categories`, `/api/suppliers`, `/api/customers` | Plain CRUD. `customers` isn't consumed by any frontend page yet — no customer-facing UI exists. |

### How `category`/`supplier` free text becomes real rows

`ItemFormModal.jsx` sends `category` as a plain string (its dropdowns are
hardcoded lists, not sourced from a catalog) and grocery's
`moduleSpecificFields.supplier_name` the same way. `findOrCreateCategory`
/ `findOrCreateSupplier` resolve or create a real row scoped to the
business on every write, so `products.category_id` / `.supplier_id` stay
proper FKs underneath a free-text UI. Product list responses resolve
these back to name strings via `LEFT JOIN`, matching what the UI already
renders (`it.category`).

### Module satellite tables — only 3 of 7 wired up

`server/lib/moduleSatellites.js` maps `moduleSpecificFields` onto the
right satellite table (`grocery_products` / `pharmacy_products` /
`clothing_products`) based on **the business's actual module** (from
`requireBusiness`, not anything the client sends). Only these three are
implemented, because they're the only modules with a real inventory UI —
`InventoryPage.jsx` falls back to the grocery layout for
electronics/bakery/restaurant/general_store too (see its `isPharmacy`
check), so those four modules get a working `products` row but no
satellite row. Add a case in `moduleSatellites.js` (and a real form) when
one of those modules gets its own UI.

**Clothing variants are a stopgap, not real per-variant tracking.**
`clothing_products` models one size + one color per product row (schema
comment: `size VARCHAR(24) -- S, M, L, 32, 8.5`), but the UI lets someone
multi-select several sizes and colors for a single listing. Rather than
silently drop the extra selections or block the UI, sizes/colors are
stored comma-joined and split back into arrays on read — good enough to
keep `ClothingInventoryPage.jsx`'s existing variant grid working, but it
means all sizes/colors share one stock count rather than being tracked
per-combination. Real variant support would mean one product row per
size/color combo (with its own SKU and stock) — a bigger feature for
later, not attempted here.

### Soft delete

`DELETE /api/inventory/items/:id` sets `is_active = 0` rather than
removing the row. A hard delete would either cascade-orphan
`stock_movements` history or null out `sale_items.product_id` on past
receipts — soft delete keeps a discontinued product's sale history
intact. `listProducts` filters `is_active = 1`, so deleted items
disappear from the UI exactly as before; nothing in the frontend needed
to change for this.

### Stock movements

Every create with `stockQty > 0` logs a `stock_movements` row
(`movement_type: 'opening'`). Every edit where `stockQty` actually
changed logs an `'adjustment'` row with the delta. `products.stock_quantity`
stays the fast/cached number the UI reads; `stock_movements` is the
audit trail behind it, per the schema's own stated design.

### Frontend fix (this patch)

`ItemFormModal.jsx`'s pharmacy branch collected a unit type
(PCS/STRIP/BOX/BOTTLE) in UI state but never included it in the payload
sent to the server — grocery's branch already did, pharmacy's didn't.
Fixed to match.

