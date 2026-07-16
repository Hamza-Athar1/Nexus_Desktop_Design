import { Routes, Route, Navigate } from 'react-router-dom';

// ── Pages ──────────────────────────────────────────────────────────────────────
import LandingPage           from './pages/LandingPage';
import LoginPage              from './pages/LoginPage';
import SignUpPage             from './pages/SignUpPage';
import RegisterBusinessPage   from './pages/RegisterBusinessPage';
import ForgotPasswordPage     from './pages/ForgotPasswordPage';
import ModuleSelectPage       from './pages/ModuleSelectPage';
import DashboardPage          from './pages/User/Shared/DashboardPage';
import POSSystemPage          from './pages/User/Grocery/POSSystemPage';
import InventoryPage          from './pages/User/Grocery/InventoryPage';
import ClothingInventoryPage  from './pages/User/Clothing/ClothingInventoryPage';
import BillingPage            from './pages/User/Grocery/BillingPage';
import ReportsPage            from './pages/User/Shared/ReportsPage';
import SettingsPage           from './pages/User/Shared/SettingsPage';
import EditProfilePage        from './pages/User/Shared/EditProfilePage';
import AdminDashboardPage     from './pages/Admin/AdminDashboardPage';
import SuperAdminDashboardPage from './pages/Super-User/SuperAdminDashboardPage';
import SuperAdminLayout from './pages/Super-User/SuperAdminLayout';
import SuperAdminRequestsPage from './pages/Super-User/SuperAdminRequestsPage';
import SuperAdminPlaceholderPage from './pages/Super-User/SuperAdminPlaceholderPage';




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
      {/* ── All Routes Open ──────────────── */}
      <Route path="/"                 element={<LandingPage />} />
      <Route path="/login"            element={<LoginPage />} />
      <Route path="/signup"           element={<SignUpPage />} />
      <Route path="/register-business" element={<RegisterBusinessPage />} />
      <Route path="/forgot-password"  element={<ForgotPasswordPage />} />
      <Route path="/modules"          element={<ModuleSelectPage />} />
      <Route path="/dashboard"        element={<DashboardPage />} />
      <Route path="/pos"              element={<POSSystemPage />} />
      <Route path="/inventory"        element={<InventoryRouter />} />
      <Route path="/billing"          element={<BillingPage />} />
      <Route path="/reports"          element={<ReportsPage />} />
      <Route path="/settings"         element={<SettingsPage />} />
      <Route path="/profile"          element={<EditProfilePage />} />
      <Route path="/admin"            element={<AdminDashboardPage />} />
      <Route path="/super-admin" element={<SuperAdminLayout />}>
        <Route index element={<SuperAdminDashboardPage />} />
        <Route path="requests" element={<SuperAdminRequestsPage />} />
        <Route path="users" element={<SuperAdminPlaceholderPage tab="users" />} />
        <Route path="billing" element={<SuperAdminPlaceholderPage tab="billing" />} />
        <Route path="payment" element={<SuperAdminPlaceholderPage tab="payment" />} />
        <Route path="profile" element={<SuperAdminPlaceholderPage tab="profile" />} />
        <Route path="pos" element={<SuperAdminPlaceholderPage tab="pos" />} />
      </Route>

      {/* ── Fallback ─────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
