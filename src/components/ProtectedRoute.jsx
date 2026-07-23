/**
 * ProtectedRoute.jsx
 *
 * Wraps any route that requires an authenticated session.
 *
 * Behaviour:
 *  • While the auth state is being restored (initial page load), renders a
 *    full-screen loading spinner so the user never sees a flash of the login
 *    page before the cookie is validated.
 *  • Once ready, redirects unauthenticated visitors to `/login`.
 *  • Authenticated users pass through and see `children` (or `<Outlet />`).
 */

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function FullScreenLoader() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center nexus-bg">
      <span className="loading-dots"><span /><span /><span /><span /></span>
    </div>
  );
}

/**
 * @param {{ children?: React.ReactNode }} props
 *   Pass `children` to protect a single element, or leave empty to
 *   protect a nested `<Route>` tree via `<Outlet />`.
 */
export default function ProtectedRoute({ children }) {
  const { isReady, isAuthenticated } = useAuth();

  if (!isReady) return <FullScreenLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children ?? <Outlet />;
}
