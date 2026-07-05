import jwt from 'jsonwebtoken';

// Access token: short-lived, carries the claims routes/middleware check
// on every request (id, username, role).
export function generateAccessToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN }
  );
}

// Refresh token: long-lived, only used to silently mint a new access
// token when it expires. Kept minimal on purpose — just enough to
// identify the user, not full claims.
export function generateRefreshToken(user) {
  return jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
  );
}

// Shared cookie options. sameSite/secure matter once this is deployed
// over HTTPS — 'lax' + secure:false is fine for local dev over http.
const isProd = process.env.NODE_ENV === 'production';

export const accessTokenCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'lax',
  maxAge: 15 * 60 * 1000, // 15 minutes, in ms — keep in sync with JWT_ACCESS_EXPIRES_IN
};

export const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days, in ms — keep in sync with JWT_REFRESH_EXPIRES_IN
};