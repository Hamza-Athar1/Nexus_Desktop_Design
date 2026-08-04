import {
  getProfile,
  updateProfile,
  updateEmail,
  verifyAndChangePassword,
  setTwofa,
  updatePreferences,
  getActiveSessions,
  revokeAllSessions,
  verifyPasswordAndDelete,
} from '../models/profileModel.js';
import { ApiError } from '../utils/ApiError.js';

// ── helpers ───────────────────────────────────────────────────────────────────

function serializeProfile(row) {
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    phone: row.phone ?? '',
    fullName: row.full_name ?? row.username,
    status: row.status,
    role: row.role,
    twofaEnabled: !!row.twofa_enabled,
    prefs: {
      securityAlerts: !!row.pref_security_alerts,
      newLogins:       !!row.pref_new_logins,
      billingUpdates:  !!row.pref_billing_updates,
      announcements:   !!row.pref_announcements,
    },
    memberSince: row.created_at ? new Date(row.created_at).toISOString().slice(0, 10) : null,
  };
}

function parseError(err) {
  const status = err.status ?? 500;
  throw new ApiError(status, err.message);
}

// ── GET /api/profile/me ───────────────────────────────────────────────────────
export async function getProfileHandler(req, res) {
  const row = await getProfile(req.user.id);
  if (!row) throw new ApiError(404, 'Profile not found');
  res.json({ ok: true, profile: serializeProfile(row) });
}

// ── PATCH /api/profile/me ─────────────────────────────────────────────────────
export async function updateProfileHandler(req, res) {
  const { fullName, phone } = req.body;
  const updated = await updateProfile(req.user.id, { fullName, phone });
  res.json({ ok: true, profile: serializeProfile(updated) });
}

// ── PATCH /api/profile/email ──────────────────────────────────────────────────
export async function updateEmailHandler(req, res) {
  const { newEmail } = req.body;
  if (!newEmail?.trim()) throw new ApiError(400, 'newEmail is required');
  if (!/\S+@\S+\.\S+/.test(newEmail)) throw new ApiError(400, 'Invalid email format');

  try {
    const updated = await updateEmail(req.user.id, { newEmail: newEmail.trim() });
    res.json({ ok: true, profile: serializeProfile(updated) });
  } catch (err) { parseError(err); }
}

// ── POST /api/profile/password ────────────────────────────────────────────────
export async function changePasswordHandler(req, res) {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    throw new ApiError(400, 'currentPassword and newPassword are required');
  }
  if (newPassword.length < 8) throw new ApiError(400, 'New password must be at least 8 characters');
  if (!/[A-Z]/.test(newPassword)) throw new ApiError(400, 'New password must contain an uppercase letter');
  if (!/[0-9^$@!%*?&]/.test(newPassword)) throw new ApiError(400, 'New password must contain a number or special character');

  try {
    await verifyAndChangePassword(req.user.id, { currentPassword, newPassword });
    res.json({ ok: true, message: 'Password updated. Please log in again.' });
  } catch (err) { parseError(err); }
}

// ── PATCH /api/profile/2fa ────────────────────────────────────────────────────
export async function toggle2faHandler(req, res) {
  const { enabled } = req.body;
  await setTwofa(req.user.id, !!enabled);
  res.json({ ok: true, twofaEnabled: !!enabled });
}

// ── PATCH /api/profile/preferences ───────────────────────────────────────────
export async function updatePreferencesHandler(req, res) {
  const { securityAlerts, newLogins, billingUpdates, announcements } = req.body;
  await updatePreferences(req.user.id, { securityAlerts, newLogins, billingUpdates, announcements });
  res.json({ ok: true, message: 'Preferences saved' });
}

// ── GET /api/profile/sessions ─────────────────────────────────────────────────
export async function getSessionsHandler(req, res) {
  const rows = await getActiveSessions(req.user.id);
  res.json({
    ok: true,
    sessions: rows.map(s => ({
      id: s.id,
      device: s.user_agent || 'Unknown device',
      rememberMe: !!s.remember_me,
      createdAt: s.created_at ? new Date(s.created_at).toISOString().slice(0, 10) : null,
      expiresAt: s.expires_at ? new Date(s.expires_at).toISOString().slice(0, 10) : null,
    })),
  });
}

// ── DELETE /api/profile/sessions ─────────────────────────────────────────────
export async function logoutAllHandler(req, res) {
  await revokeAllSessions(req.user.id);
  // Clear the caller's own cookies too
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.json({ ok: true, message: 'All sessions revoked' });
}

// ── DELETE /api/profile/account ───────────────────────────────────────────────
export async function deleteAccountHandler(req, res) {
  const { password } = req.body;
  if (!password) throw new ApiError(400, 'Password confirmation required');

  try {
    await verifyPasswordAndDelete(req.user.id, password);
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.json({ ok: true, message: 'Account deleted' });
  } catch (err) { parseError(err); }
}
