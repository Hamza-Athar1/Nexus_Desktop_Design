import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage          from './pages/LoginPage';
import SignUpPage         from './pages/SignUpPage';
import ModuleSelectPage  from './pages/ModuleSelectPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardPage     from './pages/User/DashboardPage';
import AdminDashboardPage from './pages/Admin/AdminDashboardPage';
import SuperAdminDashboardPage from './pages/Super-User/SuperAdminDashboardPage';


export default function App() {
  return (
    <Routes>
      <Route path="/"                element={<LoginPage />} />
      <Route path="/signup"          element={<SignUpPage />} />
      <Route path="/modules"         element={<ModuleSelectPage />} />
      <Route path="/dashboard"        element={<DashboardPage />} />
      <Route path="/admin"            element={<AdminDashboardPage />} />
      <Route path="/super-admin"      element={<SuperAdminDashboardPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="*"                element={<Navigate to="/" replace />} />
    </Routes>
  );
}
