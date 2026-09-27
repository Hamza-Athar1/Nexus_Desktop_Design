import bcrypt from 'bcrypt';
import { ApiError } from '../utils/ApiError.js';
import { findUserByEmail, findUserByUsername } from '../models/userModel.js';
import {
  findStaffByBusiness,
  findStaffById,
  createStaffMember,
  updateStaffMember,
  deleteStaffMember,
} from '../models/staffModel.js';

const SALT_ROUNDS = 10;

/** GET /api/staff — list store staff */
export async function getStaff(req, res) {
  const staff = await findStaffByBusiness(req.businessId);
  res.json({ staff });
}

/** POST /api/staff — create new staff user */
export async function postStaff(req, res) {
  const { username, email, phone, password } = req.body;

  if (!username?.trim() || !password) {
    throw new ApiError(400, 'Username and password are required');
  }
  if (password.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters');
  }

  const cleanUsername = username.trim().toLowerCase();
  const staffEmail = email?.trim() || `${cleanUsername}_${Date.now()}@staff.local`;
  const cleanPhone = phone?.trim() ? phone.trim().replace(/[\s-]/g, '') : '00000000000';

  if (email?.trim() && await findUserByEmail(email.trim())) {
    throw new ApiError(409, 'An account with this email already exists');
  }
  if (await findUserByUsername(username.trim())) {
    throw new ApiError(409, 'This username is already taken');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const staff = await createStaffMember(req.businessId, {
    username: username.trim(),
    email: staffEmail,
    phone: cleanPhone,
    passwordHash,
  });

  res.status(201).json({ staff });
}

/** PUT /api/staff/:id — update staff user */
export async function putStaff(req, res) {
  const { id } = req.params;
  const { username, email, phone, password, status } = req.body;

  const existing = await findStaffById(req.businessId, id);
  if (!existing) {
    throw new ApiError(404, 'Staff member not found');
  }

  let cleanPhone;
  if (phone !== undefined && phone !== null && phone.trim() !== '') {
    cleanPhone = phone.trim().replace(/[\s-]/g, '');
  }

  if (email && email.trim() !== existing.email) {
    const emailMatch = await findUserByEmail(email.trim());
    if (emailMatch) {
      throw new ApiError(409, 'An account with this email already exists');
    }
  }

  if (username && username.trim() !== existing.username) {
    const userMatch = await findUserByUsername(username.trim());
    if (userMatch) {
      throw new ApiError(409, 'This username is already taken');
    }
  }

  let passwordHash;
  if (password && password.length >= 6) {
    passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  } else if (password && password.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters');
  }

  const updated = await updateStaffMember(req.businessId, id, {
    username: username?.trim(),
    email: email?.trim(),
    phone: cleanPhone,
    passwordHash,
    status,
  });

  res.json({ staff: updated });
}

/** DELETE /api/staff/:id — delete staff user */
export async function deleteStaff(req, res) {
  const { id } = req.params;
  const existing = await findStaffById(req.businessId, id);
  if (!existing) {
    throw new ApiError(404, 'Staff member not found');
  }

  await deleteStaffMember(req.businessId, id);
  res.json({ message: 'Staff member removed successfully' });
}
