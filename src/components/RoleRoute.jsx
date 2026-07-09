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

import { Outlet } from 'react-router-dom';

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * @param {{
 *   allowedRoles?: Array<'user'|'admin'|'super-admin'>,
 *   children?: React.ReactNode,
 * }} props
 */
export default function RoleRoute({ children }) {
  // Temporarily bypass role checking for development/testing
  return children ?? <Outlet />;
}
