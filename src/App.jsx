import { Routes, Route, Navigate } from 'react-router-dom';

// ── Route guards ─────────────────────────────────────────────────────────────
import ProtectedRoute          from './components/ProtectedRoute';
import RoleRoute               from './components/RoleRoute';

// ── Pages ──────────────────────────────────────────────────────────────────────
import LandingPage           from './pages/LandingPage';
import LoginPage              from './pages/LoginPage';
import AdminLoginPage         from './pages/AdminLoginPage';
import SignUpPage             from './pages/SignUpPage';
import RegisterBusinessPage   from './pages/RegisterBusinessPage';
import ForgotPasswordPage     from './pages/ForgotPasswordPage';
import ResetPasswordPage      from './pages/ResetPasswordPage';
import ModuleSelectPage       from './pages/ModuleSelectPage';
import POSSystemPage          from './pages/User/POSSystemPage';
import AdminDashboardPage     from './pages/Admin/AdminDashboardPage';
import AdminLayout            from './components/Admin/AdminLayout';
import AdminProductsPage      from './pages/Admin/AdminProductsPage';
import SuperAdminDashboardPage from './pages/Super-User/SuperAdminDashboardPage';
import SuperAdminLayout from './pages/Super-User/SuperAdminLayout';
import SuperAdminRequestsPage from './pages/Super-User/SuperAdminRequestsPage';
import SuperAdminUserManagementPage from './pages/Super-User/SuperAdminUserManagementPage';
import SuperAdminBillingPage from './pages/Super-User/SuperAdminBillingPage';
import SuperAdminPaymentPage from './pages/Super-User/SuperAdminPaymentPage';
import SuperAdminProfilePage from './pages/Super-User/SuperAdminProfilePage';
import SuperAdminPOSPage from './pages/Super-User/SuperAdminPOSPage';
import SuperAdminActivateAccountPage from './pages/Super-User/SuperAdminActivateAccountPage';

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <Routes>
      {/* ── Public routes ─────────────────── */}
      <Route path="/"                 element={<LandingPage />} />
      <Route path="/login"            element={<LoginPage />} />
      <Route path="/admin-login"      element={<AdminLoginPage />} />
      <Route path="/signup"           element={<SignUpPage />} />
      <Route path="/forgot-password"  element={<ForgotPasswordPage />} />
      <Route path="/reset-password"   element={<ResetPasswordPage />} />

      {/* ── Requires login, any role ──────── */}
      <Route element={<ProtectedRoute />}>
        <Route path="/register-business" element={<RegisterBusinessPage />} />
        <Route path="/modules"          element={<ModuleSelectPage />} />
        <Route path="/pos"              element={<POSSystemPage />} />
      </Route>

      {/* ── Requires admin (business owner) role ──────── */}
      <Route element={<RoleRoute allowedRoles={['admin', 'super_admin']} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="products" element={<AdminProductsPage />} />
        </Route>
      </Route>

      {/* ── Requires super_admin role ─────── */}
      <Route element={<RoleRoute allowedRoles={['super_admin']} />}>
        <Route path="/super-admin" element={<SuperAdminLayout />}>
          <Route index element={<SuperAdminDashboardPage />} />
          <Route path="requests" element={<SuperAdminRequestsPage />} />
          <Route path="users" element={<SuperAdminUserManagementPage />} />
          <Route path="activate/:shopId" element={<SuperAdminActivateAccountPage />} />
          <Route path="billing" element={<SuperAdminBillingPage />} />
          <Route path="payment" element={<SuperAdminPaymentPage />} />
          <Route path="profile" element={<SuperAdminProfilePage />} />
          <Route path="pos" element={<SuperAdminPOSPage />} />
        </Route>
      </Route>

      {/* ── Fallback ─────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
