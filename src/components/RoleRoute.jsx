/**
 * RoleRoute.jsx
 *
 * Extends `ProtectedRoute` with role-based access control.
 *
 * Behaviour:
 *  • Inherits all loading and unauthenticated behaviour from `ProtectedRoute`.
 *  • Once the user is confirmed, checks whether their role appears in the
 *    `allowedRoles` list.
 *  • Wrong role → redirects to the user's own dashboard instead of showing
 *    a blank 403, creating a better UX.
 *
 * Usage:
 *  ```jsx
 *  <Route
 *    path="/admin"
 *    element={<RoleRoute allowedRoles={['admin', 'super-admin']} />}
 *  >
 *    <Route index element={<AdminDashboardPage />} />
 *  </Route>
 *  ```
 */

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';

/** Maps each role to the page the user should land on if access is denied. */
const ROLE_HOME = {
  'user': '/dashboard',
  'admin': '/admin',
  'super-admin': '/super-admin',
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * @param {{
 *   allowedRoles: Array<'user'|'admin'|'super-admin'>,
 *   children?: React.ReactNode,
 * }} props
 */
export default function RoleRoute({ allowedRoles, children }) {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      {/* ProtectedRoute guarantees `user` is non-null at this point. */}
      {user && !allowedRoles.includes(user.role) ? (
        // Redirect the user to their own home page rather than a raw 403.
        <Navigate to={ROLE_HOME[user.role] ?? '/'} replace />
      ) : (
        children ?? <Outlet />
      )}
    </ProtectedRoute>
  );
}
