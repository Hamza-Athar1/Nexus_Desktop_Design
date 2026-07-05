import jwt from 'jsonwebtoken';

// Reads the accessToken httpOnly cookie, verifies it, and attaches the
// decoded payload ({ id, username, role }) to req.user for downstream
// route handlers to use. If missing/invalid/expired, blocks the request.
export function verifyToken(req, res, next) {
  const token = req.cookies?.accessToken;

  if (!token) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    // Covers both an invalid signature and a naturally expired token.
    // The frontend should react to this specific status by attempting
    // a token refresh (built in a later step) before giving up.
    return res.status(401).json({ message: 'Session expired, please log in again' });
  }
}