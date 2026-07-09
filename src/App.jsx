import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import ModuleSelectPage from "./pages/ModuleSelectPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import DashboardPage from "./pages/User/DashboardPage";
import POSSystemPage from "./pages/User/POSSystemPage";
import InventoryPage from "./pages/User/InventoryPage";
import ClothingInventoryPage from "./pages/User/ClothingInventoryPage";
import BillingPage from "./pages/User/BillingPage";
import EditProfilePage from "./pages/User/EditProfilePage";
import AdminDashboardPage from "./pages/Admin/AdminDashboardPage";
import SuperAdminDashboardPage from "./pages/Super-User/SuperAdminDashboardPage";
import ReportsPage from "./pages/User/ReportsPage";
import SettingsPage from "./pages/User/SettingsPage";

/** Reads the module the user chose on the Module Select page. */
function getModule() {
  return localStorage.getItem("nexus_module") || "";
}

/**
 * Smart router for /inventory:
 *  - clothing module  → ClothingInventoryPage
 *  - everything else  → InventoryPage  (Grocery default)
 */
function InventoryRouter() {
  const mod = getModule();
  if (mod === "clothing") return <ClothingInventoryPage />;
  return <InventoryPage />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/"               element={<LoginPage />} />
      <Route path="/signup"         element={<SignUpPage />} />
      <Route path="/modules"        element={<ModuleSelectPage />} />
      <Route path="/dashboard"      element={<DashboardPage />} />
      <Route path="/pos"            element={<POSSystemPage />} />
      <Route path="/inventory"      element={<InventoryRouter />} />
      <Route path="/billing"        element={<BillingPage />} />
      <Route path="/reports"        element={<ReportsPage />} />
      <Route path="/settings"       element={<SettingsPage />} />
      <Route path="/profile"        element={<EditProfilePage />} />
      <Route path="/admin"          element={<AdminDashboardPage />} />
      <Route path="/super-admin"    element={<SuperAdminDashboardPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="*"               element={<Navigate to="/" replace />} />
    </Routes>
  );
}
