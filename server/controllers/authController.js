import { createTrialSubscription } from '../models/subscriptionModel.js';
import { createProfileForUser } from '../models/businessProfileModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {
  findUserByEmail,
  findUserByUsername,
  findUserById,
  createUser,
  saveRefreshToken,
  findRefreshToken,
  deleteRefreshToken,
} from '../models/userModel.js';
import {
  generateAccessToken,
  generateRefreshToken,
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
} from '../utils/generateTokens.js';

const SALT_ROUNDS = 10;

export async function signup(req, res) {
  try {
    const { businessName, businessType, email, username, password } = req.body;

    // ── Validation ─────────────────────────────────────
    if (!businessName?.trim() || !businessType?.trim() || !email?.trim() || !username?.trim() || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ message: 'A valid email is required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // ── Duplicate checks ─────────────────────────────────
    const existingEmail = await findUserByEmail(email);
    if (existingEmail) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }
    const existingUsername = await findUserByUsername(username);
    if (existingUsername) {
      return res.status(409).json({ message: 'This username is already taken' });
    }

    // ── Create user ───────────────────────────────────
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const newUser = await createUser({ businessName, businessType, email, username, passwordHash });
    await createProfileForUser(newUser.id, { businessName, businessType });
    await createTrialSubscription(newUser.id);
    // Never send password_hash back to the client
    // eslint-disable-next-line no-unused-vars
    const { password_hash, ...safeUser } = newUser;


    return res.status(201).json({
      message: 'Account created successfully',
      user: safeUser,
    });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
}

export async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username?.trim() || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const user = await findUserByUsername(username);
    if (!user) {
      // Deliberately vague — don't reveal whether it was the username
      // or password that was wrong.
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // ── Issue tokens ───────────────────────────────────
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const expiresAt = new Date(Date.now() + refreshTokenCookieOptions.maxAge);
    await saveRefreshToken(user.id, refreshToken, expiresAt);

    res.cookie('accessToken', accessToken, accessTokenCookieOptions);
    res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions);

    return res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        businessName: user.business_name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
}

// req.user is set by the verifyToken middleware — this route just
// confirms who's currently logged in based on the access token cookie.
// Used by the frontend on page load/refresh to restore session state
// without asking the user to log in again.
export async function getMe(req, res) {
  try {
    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        businessName: user.business_name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('GetMe error:', err);
    return res.status(500).json({ message: 'Something went wrong' });
  }
}

export async function logout(req, res) {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      await deleteRefreshToken(token); // dead in the DB, so it can't be replayed even if someone kept a copy
    }

    res.clearCookie('accessToken', accessTokenCookieOptions);
    res.clearCookie('refreshToken', refreshTokenCookieOptions);

    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json({ message: 'Something went wrong' });
  }
}

// Called by the frontend when a protected request comes back 401 with
// an expired access token. Uses the refresh token to silently issue a
// fresh access token (and a fresh, rotated refresh token) instead of
// forcing the user to log in again.
export async function refresh(req, res) {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // 1. Verify the JWT itself is validly signed and not expired
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch {
      return res.status(401).json({ message: 'Session expired, please log in again' });
    }

    // 2. Confirm it hasn't been revoked (logout, or already rotated away)
    const storedToken = await findRefreshToken(token);
    if (!storedToken) {
      return res.status(401).json({ message: 'Session expired, please log in again' });
    }

    const user = await findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Session expired, please log in again' });
    }

    // 3. Rotate: kill the old refresh token, issue a new access + refresh pair
    await deleteRefreshToken(token);

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    const expiresAt = new Date(Date.now() + refreshTokenCookieOptions.maxAge);
    await saveRefreshToken(user.id, newRefreshToken, expiresAt);

    res.cookie('accessToken', newAccessToken, accessTokenCookieOptions);
    res.cookie('refreshToken', newRefreshToken, refreshTokenCookieOptions);

    return res.status(200).json({ message: 'Token refreshed' });
  } catch (err) {
    console.error('Refresh error:', err);
    return res.status(500).json({ message: 'Something went wrong' });
  }
}