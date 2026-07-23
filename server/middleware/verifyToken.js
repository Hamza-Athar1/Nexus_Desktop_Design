import jwt from 'jsonwebtoken';

/**
 * Reads the httpOnly `accessToken` cookie, verifies it, and attaches
 * `req.user = { id, role }`. On failure (missing/expired/invalid) it
 * responds 401 — the frontend's `apiFetch` treats any 401 as a cue to
 * hit `/auth/refresh` and retry the original request once.
 */
export function verifyToken(req, res, next) {
  const token = req.cookies?.accessToken;

  if (!token) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = { id: decoded.id, role: decoded.role };
    return next();
  } catch {
    return res.status(401).json({ message: 'Access token expired or invalid' });
  }
}
