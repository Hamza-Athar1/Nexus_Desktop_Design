# Nexus Desktop — Multi-Tenant POS & Enterprise Management System

**Nexus Desktop** is a modern, modular, multi-tenant Point of Sale (POS) and Enterprise Business Management Platform built for desktop browsers. It empowers businesses across various retail sectors (Grocery, Pharmacy, Clothing/Fashion, Electronics, General Store, Bakery, Restaurant) to manage inventory, sales transactions, store staff, billing subscriptions, and multi-tier analytics.

---

## 🏗️ Architecture & Technology Stack

### **Frontend**
- **Framework & Build Tool:** React 19, Vite, React Router v7
- **Styling & UI:** Tailwind CSS v4, Lucide React Icons
- **Data Visualization & Tools:** Recharts (Analytics & Reports), `@react-oauth/google`, `react-barcode-scanner`
- **State & HTTP Client:** React Context API (`AuthContext`), custom transparent fetch wrapper (`src/lib/api.js`) with automatic token refresh handling

### **Backend**
- **Runtime & Server:** Node.js, Express.js
- **Database Engine:** MySQL 8.x using raw `mysql2` connection pool (No ORM for maximum query control and performance)
- **Security & Auth:** JWT authentication via `httpOnly` secure cookies, Access Token + Refresh Token rotation architecture, `bcryptjs` password hashing

---

## 👥 User Roles & Access Control

1. **Super Admin (`super_admin`)**
   - Platform-wide administrative authority.
   - Manages tenant business lifecycle (activation, suspension, blocking, deletion, extending subscription due dates).
   - Reviews shop upgrade/modification requests.
   - Oversees platform-wide billing, revenue analytics, module management, and custom theme palettes.

2. **Business Admin / Owner (`admin`)**
   - Tenant owner who completes the multi-step business onboarding wizard.
   - Manages store inventory, product categories, subcategories, suppliers, and customer databases.
   - Analyzes store sales, profit reports, stock levels, and product performance.
   - Manages store billing subscriptions and creates store staff accounts.

3. **POS Cashier / Staff (`user`)**
   - Front-desk cashier terminal access.
   - Fast barcode scanning, manual product search, cart manipulation, tax/discount adjustments, transaction holding, and receipt printing.

---

## 📊 Comprehensive Status & Disconnection Matrix

### 🔌 Frontend Connection Status

| Page / Component | Target Route | Current Connection Status | Source of Data |
|---|---|---|---|
| `LandingPage.jsx` | `/` | 🟢 Connected | Public View / Layout |
| `LoginPage.jsx` / `AdminLoginPage.jsx` | `/login`, `/admin-login` | 🟢 Connected | `POST /api/auth/login` |
| `SignUpPage.jsx` | `/signup` | 🟢 Connected | `POST /api/auth/signup` |
| `ForgotPasswordPage.jsx` / `ResetPasswordPage.jsx` | `/forgot-password`, `/reset-password` | 🟢 Connected | `POST /api/auth/forgot-password`, `POST /api/auth/reset-password` |
| `RegisterBusinessPage.jsx` | `/register-business` | 🟢 Connected | `/api/catalog/*`, `GET/PUT /api/registration/draft`, `POST /api/registration/finish` |
| `SuperAdminDashboardPage.jsx` | `/super-admin` | 🟢 Connected | Backend Super Admin Stats |
| `SuperAdminRequestsPage.jsx` | `/super-admin/requests` | 🟢 Connected | `GET/PATCH /api/admin/requests` |
| `SuperAdminUserManagementPage.jsx` | `/super-admin/users` | 🟢 Connected | `GET/PATCH/DELETE /api/admin/shops` |
| `SuperAdminActivateAccountPage.jsx` | `/super-admin/activate/:shopId` | 🟢 Connected | `GET/PATCH /api/admin/shops/:id` |
| `SuperAdminBillingPage.jsx` | `/super-admin/billing` | 🟢 Connected | `GET/POST /api/admin/billing` |
| `SuperAdminPaymentPage.jsx` | `/super-admin/payment` | 🟢 Connected | `GET /api/admin/payment` |
| `SuperAdminPOSPage.jsx` | `/super-admin/pos` | 🟢 Connected | `GET/POST/PATCH/DELETE /api/admin/pos` |
| `SuperAdminProfilePage.jsx` | `/super-admin/profile` | 🟢 Connected | `GET/PUT /api/profile/*` |
| `AdminDashboardPage.jsx` | `/admin` | 🔴 **Disconnected** | Static Mock KPIs |
| `AdminProductsPage.jsx` | `/admin/products` | 🔴 **Disconnected** | Static `INITIAL_PRODUCTS` State |
| `AdminSalesPage.jsx` | `/admin/sales` | 🔴 **Disconnected** | Static Sales Transactions |
| `AdminSalesHistoryPage.jsx` | `/admin/sales/history` | 🔴 **Disconnected** | Static History Log |
| `AdminSalesReturnsPage.jsx` | `/admin/sales/returns` | 🔴 **Disconnected** | Static Returns Log |
| `AdminReportsPage.jsx` (All Sub-reports) | `/admin/reports/*` | 🔴 **Disconnected** | Static Chart Data Arrays |
| `AdminUserPage.jsx` | `/admin/user` | 🔴 **Disconnected** | Static Staff Array |
| `AdminBillingPage.jsx` | `/admin/billing` | 🔴 **Disconnected** | Static Plan & Invoice Objects |
| `POSSystemPage.jsx` | `/pos` | 🔴 **Disconnected** | Static Local Cart & Product List |

---

## ✨ Feature Breakdown: Current Implemented Features

### 🟢 Backend Features (Implemented)

1. **Authentication & Security System (`/api/auth`)**
   - User Signup (`POST /api/auth/signup`) and Login (`POST /api/auth/login`) carrying `httpOnly` cookies.
   - Session Check (`GET /api/auth/me`) and Token Refresh / Rotation (`POST /api/auth/refresh`).
   - Logout (`POST /api/auth/logout`) with session revocation.
   - Password Recovery (`POST /api/auth/forgot-password`, `POST /api/auth/reset-password`).

2. **Platform Catalog & Registration Wizard (`/api/catalog`, `/api/registration`)**
   - Read-only catalog endpoints for business types, modules, retention plans, and backup modules.
   - Multi-step draft persistence/resume (`GET`, `PUT /api/registration/draft`).
   - Atomic business finish transaction (`POST /api/registration/finish`).

3. **Multi-Tenant Inventory & Core Catalogs (`/api/inventory`, `/api/categories`, `/api/suppliers`, `/api/customers`)**
   - Tenant scoping middleware (`requireBusiness`) ensuring store data separation.
   - Inventory item CRUD, low-stock search, barcode scanner lookup (`/api/inventory/scan/:barcode`).
   - Soft-delete strategy (`is_active = 0`) to preserve transaction histories.
   - Module Satellite Drivers for Grocery, Pharmacy, and Clothing products.
   - Automatic stock audit ledger in `stock_movements`.
   - Category, Supplier, and Customer CRUD endpoints.

4. **Super Admin Management APIs**
   - **Shop Requests (`/api/admin/requests`):** Platform-wide requests listing, filtering, detail view, approval/rejection/resubmit with reviewer notes.
   - **Shop Lifecycle & User Management (`/api/admin/shops`):** Shop profile inspection, status toggling (`Active`, `Suspended`, `Blocked`), due date extensions, activity logs, direct messages, and soft/hard deletion.
   - **Billing & Payment Analytics (`/api/admin/billing`, `/api/admin/payment`):** Invoices overview, manual invoice initiation, revenue per module analytics.
   - **POS Config (`/api/admin/pos`):** POS module toggle stats, CRUD for POS modules, custom theme color palette management (`/admin/pos/palettes`).
   - **Profile & Security (`/api/profile`):** Account detail updates, email change, password change, 2FA toggle, UI preference settings.

---

## 🟡 Missing Backend Features & Disconnected Parts

### 🔴 1. Completely Missing Backend Systems (Backend APIs to build)

1. **Sales & Checkout Engine (`/api/sales`)**
   - `POST /api/sales`: Process checkout cart, generate tax/discount breakdowns, generate sequential receipt numbers, create `sales` & `sale_items` DB rows, decrement inventory `stock_quantity`, and log `stock_movements` (type `'sale'`).
   - `GET /api/sales` & `GET /api/sales/:id`: Fetch paginated sales history and individual receipt details.
   - `POST /api/sales/returns`: Process customer returns, calculate refund amounts, increment inventory, and log `stock_movements` (type `'return'`).

2. **Business Admin Analytics & Aggregation Engine (`/api/admin/reports`)**
   - `GET /api/reports/sales`: Daily, weekly, and monthly sales graphs aggregation.
   - `GET /api/reports/products`: Top-performing products by volume and revenue.
   - `GET /api/reports/profit`: Net profit analysis (Gross revenue - Cost of Goods Sold).
   - `GET /api/reports/stock`: Total stock valuation and reorder alert summaries.

3. **Store Staff Management API (`/api/users/staff`)**
   - Endpoints for Business Admins to create cashier accounts, update passwords/PINs, set permissions, and deactivate staff accounts.

4. **Business Subscription & Store Billing (`/api/business/billing`)**
   - Business owner view of active subscription tier, upgrade plan requests, payment method management, and store invoice history downloads.

5. **Purchases & Supplier Orders (`/api/purchases`)**
   - Purchase orders creation, stock receiving endpoints, supplier debt tracking.

6. **Promotions & Discount Engine (`/api/discounts`)**
   - Promo codes, automatic volume discounts, time-limited promotional offers.

7. **OAuth 2.0 Integration Endpoints**
   - Google & Facebook token verification and account linking endpoints (`/api/auth/google`, `/api/auth/facebook`).

8. **Production Email Delivery Integration**
   - Replacing debug console password reset output in `authController.js` with real Nodemailer or Resend SMTP delivery.

9. **Industry Module Satellites for Remaining 4 Modules**
   - Satellite schemas and driver logic for **Electronics** (serial/IMEI), **Bakery** (batch/expiration), **Restaurant** (recipe/ingredients), and **General Store**.

---

### 🔴 2. Backend Scoping & Architecture Gaps

1. **Staff Role Business Scoping in `requireBusiness` Middleware:**
   - Currently, `requireBusiness` resolves business context solely through `businesses.owner_user_id` (the `admin` owner).
   - The database requires a `business_id` column on the `users` table (or a `business_staff` relation table) so staff users (`role: 'user'`) can log in and be automatically scoped to their store.

2. **Granular Multi-Variant Stock Tracking:**
   - Clothing products currently store sizes and colors as comma-joined strings (`"S, M, L"`), sharing one global stock quantity.
   - Requires restructuring into individual product variant rows (unique SKU, size, color combination, and separate stock counts).

---

### 🔴 3. Disconnected Frontend Pages (Frontend UI to wire up to Backend)

1. **`POSSystemPage.jsx` (`/pos`):**
   - Connect barcode scanner and search input to `GET /api/inventory/search?q=`.
   - Connect checkout completion to `POST /api/sales`.
2. **`AdminProductsPage.jsx` (`/admin/products`):**
   - Replace `INITIAL_PRODUCTS` with `GET /api/inventory/items`.
   - Wire `AddProductForm` to `POST /api/inventory/items`.
   - Wire `EditProductModal` and `DeleteProductModal` to `PUT` and `DELETE /api/inventory/items/:id`.
   - Wire Category modals to `GET/POST/PUT/DELETE /api/categories`.
3. **`AdminSalesPage.jsx` & `AdminSalesHistoryPage.jsx` (`/admin/sales`, `/admin/sales/history`):**
   - Fetch real sales transactions from `GET /api/sales`.
   - Populate `ViewInvoiceModal` with live receipt data.
4. **`AdminSalesReturnsPage.jsx` (`/admin/sales/returns`):**
   - Wire return submission form to `POST /api/sales/returns`.
5. **`AdminReportsPage.jsx` & Sub-reports (`/admin/reports/*`):**
   - Replace hardcoded chart data arrays with responses from `/api/reports/*`.
6. **`AdminUserPage.jsx` (`/admin/user`):**
   - Connect store staff table and staff creation modal to `/api/users/staff`.
7. **`AdminBillingPage.jsx` (`/admin/billing`):**
   - Connect to `/api/business/billing` and subscription endpoints.
8. **`AdminDashboardPage.jsx` (`/admin`):**
   - Fetch store KPI metrics from backend analytics overview.
9. **Filing Requests from Business Admin Sidebar:**
   - Wire store owner request modal in `AdminSidebar.jsx` to `POST /api/requests`.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.x` or higher
- **MySQL**: `v8.0` or higher
- **Package Manager**: `npm` or `pnpm`

### 1. Database Setup
1. Open your MySQL client (e.g. MySQL Workbench, DBeaver) or terminal.
2. Execute `server/db/schema.sql` to initialize the database:
   ```bash
   cd server
   npm run db:reset
   ```
3. (Optional) Populate seed data for testing super admin, demo businesses, and requests:
   ```bash
   npm run db:seed
   ```

### 2. Environment Configuration
Create `.env` files in both root and `server/` directory:

**`server/.env`**:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=nexus_desktop
DB_PORT=3306

JWT_ACCESS_SECRET=your_jwt_access_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
```

**`/.env`**:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Running the Application
Start the backend server and frontend development server in separate terminal windows:

**Backend:**
```bash
cd server
npm install
npm run dev
```

**Frontend:**
```bash
npm install
npm run dev
```

Access the application in your browser at `http://localhost:5173`.

---

## 📁 Repository Directory Structure

```
Nexus_Desktop_Design/
├── public/                 # Static public assets
├── server/                 # Express backend server
│   ├── config/             # Database connection pool configuration
│   ├── controllers/        # Request handlers (auth, inventory, billing, pos, etc.)
│   ├── db/                 # MySQL schema.sql and seed scripts
│   ├── lib/                # Utility drivers (moduleSatellites logic)
│   ├── middleware/         # Auth, role check, business scoping & error handlers
│   ├── models/             # Database query models (raw SQL statements)
│   ├── routes/             # Express API route declarations
│   ├── app.js              # Express app setup and middleware configuration
│   └── server.js           # Server startup script
├── src/                    # React frontend application
│   ├── components/         # Reusable UI components & modals
│   │   ├── Admin/          # Modals & layouts for Business Admin
│   │   └── Super-User/     # Modals & sidebars for Super Admin
│   ├── context/            # React Context (AuthContext for session state)
│   ├── lib/                # Shared utilities & centralized apiFetch helper
│   ├── pages/              # Page routes
│   │   ├── Admin/          # Business owner pages (products, sales, reports, billing)
│   │   ├── Super-User/     # Super admin pages (shops, requests, billing, pos)
│   │   └── User/           # Cashier terminal page (POSSystemPage)
│   ├── App.jsx             # React Router route configuration
│   └── main.jsx            # Application entry point
├── package.json            # Frontend dependencies and scripts
├── README.md               # Project documentation
└── vite.config.js          # Vite configuration
```
