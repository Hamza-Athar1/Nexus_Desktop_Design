// Restricts a route to one or more roles. Must run AFTER verifyToken,
// since it relies on req.user being already set from the access token.
//
// Usage: router.get('/admin/users', verifyToken, roleCheck('admin', 'super-admin'), getUsers)
export function roleCheck(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      // Defensive check — should never actually hit this if verifyToken
      // ran first, but fails safely rather than assuming req.user exists.
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to access this resource' });
    }

    next();
  };
}