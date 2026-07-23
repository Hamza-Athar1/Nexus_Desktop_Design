/**
 * roleCheck('admin', 'super_admin') — must run after verifyToken.
 *
 * Role values match the `users.role` ENUM exactly: 'super_admin' | 'admin' | 'user'.
 * NOTE FOR THE FRONTEND: LoginPage.jsx's ROLE_REDIRECTS map currently uses
 * the string 'super-admin' (hyphen) while the schema/backend use
 * 'super_admin' (underscore) — that mismatch needs a small frontend patch
 * before role-based redirects will work correctly. Flagging it here since
 * it'll bite silently otherwise.
 */
export function roleCheck(...allowedRoles) {
  return function checkRole(req, res, next) {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to do that' });
    }
    return next();
  };
}
