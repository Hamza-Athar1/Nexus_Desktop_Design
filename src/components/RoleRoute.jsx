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
 *    element={<RoleRoute allowedRoles={['admin', 'super_admin']} />}
 *  >
 *    <Route index element={<AdminDashboardPage />} />
 *  </Route>
 *  ```
 */

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { roleHome } from '../lib/roleRedirects';

function FullScreenLoader() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center nexus-bg">
      <span className="loading-dots"><span /><span /><span /><span /></span>
    </div>
  );
}

/**
 * @param {{
 *   allowedRoles?: Array<'user'|'admin'|'super_admin'>,
 *   children?: React.ReactNode,
 * }} props
 */
export default function RoleRoute({ allowedRoles = [], children }) {
  const { isReady, isAuthenticated, user } = useAuth();

  if (!isReady) return <FullScreenLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    return <Navigate to={roleHome(user.role)} replace />;
  }

  return children ?? <Outlet />;
}
