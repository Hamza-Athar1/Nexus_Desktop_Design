/**
 * tokens.js — JWT issuing/verification and httpOnly cookie option builders.
 *
 * Contract with the frontend (src/lib/api.js / AuthContext.jsx):
 *  - Access token lives in an httpOnly `accessToken` cookie, short-lived.
 *  - Refresh token lives in an httpOnly `refreshToken` cookie, long-lived,
 *    and is ROTATED on every use (old session row is revoked, a new one
 *    is inserted) so a stolen refresh token has a limited window.
 *  - We never store the raw refresh token — only its sha256 hash, in
 *    `sessions.refresh_token_hash` — so a leaked database dump doesn't
 *    hand out usable sessions.
 */

import jwt from 'jsonwebtoken';
import crypto from 'crypto';

/**
 * JWTs are deterministic: signing the same payload with the same
 * expiresIn twice within the same second produces byte-identical
 * tokens. That's fine for access tokens (never stored), but refresh
 * tokens are stored by their sha256 hash under a UNIQUE constraint
 * (`sessions.refresh_token_hash`) — two logins/refreshes in the same
 * second would collide and throw ER_DUP_ENTRY. A random `jti` per
 * token avoids that.
 */
function jti() {
  return crypto.randomBytes(16).toString('hex');
}

const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES || '15m';
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES || '7d';
const REFRESH_EXPIRES_REMEMBER = process.env.JWT_REFRESH_EXPIRES_REMEMBER || '30d';

const isProd = process.env.NODE_ENV === 'production';

/** ms equivalents, kept in lockstep with the *_EXPIRES strings above. */
const MS = {
  access: 15 * 60 * 1000,
  refresh: 7 * 24 * 60 * 60 * 1000,
  refreshRemember: 30 * 24 * 60 * 60 * 1000,
};

/**
 * @param {{id:number, role:string}} user
 */
export function generateAccessToken(user) {
  return jwt.sign({ id: user.id, role: user.role, jti: jti() }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRES,
  });
}

/**
 * @param {{id:number}} user
 * @param {boolean} rememberMe
 */
export function generateRefreshToken(user, rememberMe = false) {
  return jwt.sign({ id: user.id, jti: jti() }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: rememberMe ? REFRESH_EXPIRES_REMEMBER : REFRESH_EXPIRES,
  });
}

/** sha256 hex digest — what actually gets stored/looked-up in `sessions`. */
export function hashToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

export const accessTokenCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'lax',
  path: '/',
  maxAge: MS.access,
};

/** @param {boolean} rememberMe */
export function refreshTokenCookieOptions(rememberMe = false) {
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: rememberMe ? MS.refreshRemember : MS.refresh,
  };
}

/** @param {boolean} rememberMe */
export function refreshExpiresAt(rememberMe = false) {
  return new Date(Date.now() + (rememberMe ? MS.refreshRemember : MS.refresh));
}
