/**
 * Where each role lands after login, and where a signed-in user gets
 * bounced to if they hit a route their role doesn't allow.
 *
 * Role values match the backend's `users.role` ENUM exactly:
 * 'super_admin' | 'admin' | 'user'.
 */
export const ROLE_HOME = {
  user: '/modules',
  admin: '/admin',
  super_admin: '/super-admin',
};

export function roleHome(role) {
  return ROLE_HOME[role] || '/';
}
