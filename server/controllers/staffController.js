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

  if (!username?.trim() || !email?.trim() || !password) {
    throw new ApiError(400, 'Username, email, and password are required');
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
  const staff = await createStaffMember(req.businessId, {
    username: username.trim(),
    email: email.trim(),
    phone: phone?.trim() || null,
    passwordHash,
  });

  res.status(201).json({ staff });
}

/** PUT /api/staff/:id — update staff user */
export async function putStaff(req, res) {
  const { id } = req.params;
  const { username, email, phone, status } = req.body;

  const existing = await findStaffById(req.businessId, id);
  if (!existing) {
    throw new ApiError(404, 'Staff member not found');
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

  const updated = await updateStaffMember(req.businessId, id, {
    username: username?.trim(),
    email: email?.trim(),
    phone: phone?.trim(),
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
