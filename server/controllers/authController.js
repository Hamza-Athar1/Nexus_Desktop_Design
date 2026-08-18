import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { ApiError } from '../utils/ApiError.js';
import { withTransaction } from '../config/db.js';
import { findOAuthAccount, createOAuthAccount } from '../models/oauthModel.js';
import {
  findUserByEmail,
  findUserByUsername,
  findUserByIdentifier,
  findUserById,
  findBusinessIdForOwner,
  createUser,
  updateLastLogin,
  updatePasswordHash,
} from '../models/userModel.js';
import {
  createSession,
  findActiveSessionByToken,
  revokeSessionByToken,
  revokeAllSessionsForUser,
} from '../models/sessionModel.js';
import {
  recordLoginAttempt,
  countRecentFailedAttempts,
} from '../models/loginAttemptModel.js';
import {
  createPasswordReset,
  findValidPasswordReset,
  markPasswordResetUsed,
} from '../models/passwordResetModel.js';
import {
  generateAccessToken,
  generateRefreshToken,
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
  refreshExpiresAt,
} from '../utils/tokens.js';

const SALT_ROUNDS = 10;

/** Shapes a DB user row into what the frontend's AuthContext expects. */
async function toAuthUser(user) {
  const businessId = await findBusinessIdForOwner(user.id);
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    phone: user.phone,
    role: user.role, // 'super_admin' | 'admin' | 'user'
    status: user.status,
    businessId, // null until the registration wizard finishes — drives frontend routing
  };
}

async function issueSession(res, user, rememberMe) {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user, rememberMe);
  const expiresAt = refreshExpiresAt(rememberMe);

  await createSession({ userId: user.id, refreshToken, rememberMe, expiresAt });

  res.cookie('accessToken', accessToken, accessTokenCookieOptions);
  res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions(rememberMe));
}

function clearAuthCookies(res) {
  res.clearCookie('accessToken', accessTokenCookieOptions);
  res.clearCookie('refreshToken', refreshTokenCookieOptions(false));
}

// ── POST /api/auth/signup ─────────────────────────────────────────────────
// Matches SignUpPage.jsx: username, email, password, phoneNumber, city.
// Creates the `users` row only — the business itself is created later by
// the registration wizard (Phase 3). We log the user in immediately so
// the wizard has an authenticated session to attach the business to.
export async function signup(req, res) {
  const { username, email, password, phoneNumber, city } = req.body;

  if (!username?.trim() || !email?.trim() || !password || !phoneNumber?.trim() || !city?.trim()) {
    throw new ApiError(400, 'All fields are required');
  }
  if (!/\S+@\S+\.\S+/.test(email)) {
    throw new ApiError(400, 'A valid email is required');
  }
  if (password.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters');
  }

  if (await findUserByEmail(email.trim())) {
    throw new ApiError(409, 'An account with this email already exists');
  }
  if (await findUserByUsername(username.trim())) {
    throw new ApiError(409, 'This username is already taken');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await createUser({
    username: username.trim(),
    email: email.trim(),
    phone: phoneNumber.trim(),
    cityRegion: city.trim(),
    passwordHash,
    role: 'admin', // every self-signup owns a business — see users table comment in schema
    status: 'active',
  });

  await issueSession(res, user, false);

  return res.status(201).json({
    message: 'Account created successfully',
    user: await toAuthUser(user),
  });
}

// ── POST /api/auth/login ──────────────────────────────────────────────────
export async function login(req, res) {
  const { username, password, remember } = req.body;

  if (!username?.trim() || !password) {
    throw new ApiError(400, 'Username and password are required');
  }

  const identifier = username.trim();

  const recentFailures = await countRecentFailedAttempts(identifier);
  if (recentFailures >= 5) {
    throw new ApiError(429, 'Too many failed attempts. Please try again in a few minutes.');
  }

  const user = await findUserByIdentifier(identifier);
  const passwordMatches = user ? await bcrypt.compare(password, user.password_hash) : false;

  if (!user || !passwordMatches) {
    await recordLoginAttempt(identifier, false);
    // Deliberately vague — don't reveal whether it was the identifier or password.
    throw new ApiError(401, 'Invalid username or password');
  }

  if (user.status === 'suspended' || user.status === 'blocked') {
    await recordLoginAttempt(identifier, false);
    throw new ApiError(403, 'This account has been suspended. Contact support for help.');
  }

  await recordLoginAttempt(identifier, true);
  await updateLastLogin(user.id);
  await issueSession(res, user, Boolean(remember));

  return res.status(200).json({
    message: 'Login successful',
    user: await toAuthUser(user),
  });
}

// ── GET /api/auth/me ───────────────────────────────────────────────────────
// req.user is set by verifyToken from the access token cookie.
export async function getMe(req, res) {
  const user = await findUserById(req.user.id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  return res.status(200).json({ user: await toAuthUser(user) });
}

// ── POST /api/auth/logout ─────────────────────────────────────────────────
export async function logout(req, res) {
  const token = req.cookies?.refreshToken;
  if (token) {
    await revokeSessionByToken(token);
  }
  clearAuthCookies(res);
  return res.status(200).json({ message: 'Logged out successfully' });
}

// ── POST /api/auth/refresh ────────────────────────────────────────────────
// Called by src/lib/api.js whenever a request comes back 401. Rotates the
// refresh token: the old session row is revoked (not deleted, for audit
// trail) and a new one takes its place.
export async function refresh(req, res) {
  const token = req.cookies?.refreshToken;
  if (!token) {
    throw new ApiError(401, 'Not authenticated');
  }

  const session = await findActiveSessionByToken(token);
  if (!session) {
    throw new ApiError(401, 'Session expired, please log in again');
  }

  const user = await findUserById(session.user_id);
  if (!user) {
    throw new ApiError(401, 'Session expired, please log in again');
  }

  await revokeSessionByToken(token);
  await issueSession(res, user, Boolean(session.remember_me));

  return res.status(200).json({ message: 'Token refreshed' });
}

// ── POST /api/auth/forgot-password ────────────────────────────────────────
// Always responds 200 with the same generic message, whether or not the
// email exists — prevents attackers from using this endpoint to enumerate
// registered accounts.
export async function forgotPassword(req, res) {
  const { email } = req.body;
  if (!email?.trim()) {
    throw new ApiError(400, 'Email is required');
  }

  const user = await findUserByEmail(email.trim());
  if (user) {
    const rawToken = crypto.randomBytes(32).toString('hex');
    await createPasswordReset(user.id, rawToken);

    // TODO: wire up an actual email provider (e.g. Resend/Nodemailer) once
    // one is chosen. For now the reset link is logged so the flow is
    // testable end-to-end in development.
    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${rawToken}`;
    console.log(`[password-reset] ${user.email} → ${resetLink}`);
  }

  return res.status(200).json({
    message: 'If an account exists for that email, a reset link has been sent.',
  });
}

// ── POST /api/auth/reset-password ─────────────────────────────────────────
export async function resetPassword(req, res) {
  const { token, password } = req.body;
  if (!token || !password) {
    throw new ApiError(400, 'Token and new password are required');
  }
  if (password.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters');
  }

  const reset = await findValidPasswordReset(token);
  if (!reset) {
    throw new ApiError(400, 'This reset link is invalid or has expired');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  await updatePasswordHash(reset.user_id, passwordHash);
  await markPasswordResetUsed(reset.id);
  await revokeAllSessionsForUser(reset.user_id); // force re-login everywhere

  return res.status(200).json({ message: 'Password updated. Please log in again.' });
}

// ── POST /api/auth/google ──────────────────────────────────────────────────
export async function googleLogin(req, res) {
  const { credential } = req.body;
  if (!credential) {
    throw new ApiError(400, 'Credential token is required');
  }

  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  
  let payload;
  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (err) {
    console.error('Google token verification failed:', err);
    throw new ApiError(401, 'Invalid Google token');
  }

  const { sub: googleUserId, email, email_verified } = payload;
  
  if (!email) {
    throw new ApiError(400, 'Email address not provided by Google account');
  }

  // 1. Check if OAuth account exists
  let oauthAccount = await findOAuthAccount('google', googleUserId);
  let user;

  if (oauthAccount) {
    // Retrieve associated user
    user = await findUserById(oauthAccount.user_id);
    if (!user) {
      throw new ApiError(404, 'User associated with Google account not found');
    }
  } else {
    // 2. Check if a user with that email already exists
    user = await findUserByEmail(email);
    
    if (user) {
      // Security check: Never automatically link Google OAuth to a super_admin account
      if (user.role === 'super_admin') {
        throw new ApiError(403, 'This account is a privileged administrator account. Please log in using your password.');
      }

      // User exists, but doesn't have this OAuth account linked. Let's link it.
      await createOAuthAccount({
        userId: user.id,
        provider: 'google',
        providerUid: googleUserId,
        providerEmail: email
      });
    } else {
      // 3. New sign up! Create a new user and link the OAuth account.
      // Generate a unique username.
      const baseUsername = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').slice(0, 20);
      let username = baseUsername;
      let suffix = 1;
      while (await findUserByUsername(username)) {
        username = `${baseUsername}${suffix}`;
        suffix++;
      }

      user = await withTransaction(async (conn) => {
        const newUser = await createUser({
          username,
          email,
          phone: null,
          cityRegion: 'N/A',
          passwordHash: null,
          role: 'admin',
          status: 'active',
          emailVerifiedAt: email_verified ? new Date() : null,
        }, conn);

        await createOAuthAccount({
          userId: newUser.id,
          provider: 'google',
          providerUid: googleUserId,
          providerEmail: email
        }, conn);

        return newUser;
      });
    }
  }

  if (user.status === 'suspended' || user.status === 'blocked') {
    throw new ApiError(403, 'This account has been suspended. Contact support for help.');
  }

  await updateLastLogin(user.id);
  await issueSession(res, user, false);

  return res.status(200).json({
    message: 'Google login successful',
    user: await toAuthUser(user),
  });
}

