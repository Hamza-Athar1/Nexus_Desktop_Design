import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage       from './pages/LoginPage';
import SignUpPage      from './pages/SignUpPage';
import ModuleSelectPage from './pages/ModuleSelectPage';


export default function App() {
  return (
    <Routes>
      <Route path="/"        element={<LoginPage />} />
      <Route path="/signup"  element={<SignUpPage />} />
      <Route path="/modules" element={<ModuleSelectPage />} />
      <Route path="*"        element={<Navigate to="/" replace />} />
    </Routes>
  );
}
