import { Routes, Route, Navigate } from 'react-router-dom';

// ── Pages ──────────────────────────────────────────────────────────────────────
import LoginPage              from './pages/LoginPage';
import SignUpPage             from './pages/SignUpPage';
import ForgotPasswordPage     from './pages/ForgotPasswordPage';
import ModuleSelectPage       from './pages/ModuleSelectPage';
import DashboardPage          from './pages/User/DashboardPage';
import POSSystemPage          from './pages/User/POSSystemPage';
import InventoryPage          from './pages/User/InventoryPage';
import ClothingInventoryPage  from './pages/User/ClothingInventoryPage';
import BillingPage            from './pages/User/BillingPage';
import ReportsPage            from './pages/User/ReportsPage';
import SettingsPage           from './pages/User/SettingsPage';
import EditProfilePage        from './pages/User/EditProfilePage';
import AdminDashboardPage     from './pages/Admin/AdminDashboardPage';
import SuperAdminDashboardPage from './pages/Super-User/SuperAdminDashboardPage';

// ── Route guards ───────────────────────────────────────────────────────────────
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute      from './components/RoleRoute';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Reads the module the user chose on the Module Select page. */
function getModule() {
  return localStorage.getItem('nexus_module') || '';
}

/**
 * Smart router for /inventory:
 *  - clothing module → ClothingInventoryPage
 *  - everything else → InventoryPage (Grocery / General default)
 */
function InventoryRouter() {
  return getModule() === 'clothing' ? <ClothingInventoryPage /> : <InventoryPage />;
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <Routes>
      {/* ── Public routes — accessible without authentication ──────────────── */}
      <Route path="/"                 element={<LoginPage />} />
      <Route path="/signup"           element={<SignUpPage />} />
      <Route path="/forgot-password"  element={<ForgotPasswordPage />} />

      {/* ── Authenticated — any logged-in user ────────────────────────────── */}
      <Route element={<ProtectedRoute />}>
        <Route path="/modules"    element={<ModuleSelectPage />} />
        <Route path="/dashboard"  element={<DashboardPage />} />
        <Route path="/pos"        element={<POSSystemPage />} />
        <Route path="/inventory"  element={<InventoryRouter />} />
        <Route path="/billing"    element={<BillingPage />} />
        <Route path="/reports"    element={<ReportsPage />} />
        <Route path="/settings"   element={<SettingsPage />} />
        <Route path="/profile"    element={<EditProfilePage />} />
      </Route>

      {/* ── Admin — role: admin OR super-admin ────────────────────────────── */}
      <Route element={<RoleRoute allowedRoles={['admin', 'super-admin']} />}>
        <Route path="/admin" element={<AdminDashboardPage />} />
      </Route>

      {/* ── Super-admin — role: super-admin only ──────────────────────────── */}
      <Route element={<RoleRoute allowedRoles={['super-admin']} />}>
        <Route path="/super-admin" element={<SuperAdminDashboardPage />} />
      </Route>

      {/* ── Fallback — unknown paths redirect to login ─────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
