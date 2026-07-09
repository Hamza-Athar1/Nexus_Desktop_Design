import {
  findProfileByUserId,
  updateProfile,
  setSelectedModule,
} from '../models/businessProfileModel.js';

// Kept in sync with the MODULES list in ModuleSelectPage.jsx on the
// frontend — validated here too so an arbitrary string can't be saved
// as someone's "module".
const VALID_MODULES = [
  'pharmacy', 'grocery', 'electronics', 'bakery',
  'restaurant', 'general-store', 'clothing',
];

export async function getProfile(req, res) {
  try {
    const profile = await findProfileByUserId(req.user.id);
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    return res.status(200).json({ profile });
  } catch (err) {
    console.error('Get profile error:', err);
    return res.status(500).json({ message: 'Something went wrong' });
  }
}

export async function updateProfileHandler(req, res) {
  try {
    const {
      businessName, businessType, ownerName, phone,
      licenseNo, logoUrl, gstNumber, ntnNumber,
      fbrEnabled, autoGst,
    } = req.body;

    // Map camelCase (frontend/JS convention) to the snake_case columns
    // the model layer expects. Only defined fields get passed through,
    // so a partial update (e.g. just one toggle) doesn't wipe others.
    const fields = {
      business_name: businessName,
      business_type: businessType,
      owner_name: ownerName,
      phone,
      license_no: licenseNo,
      logo_url: logoUrl,
      gst_number: gstNumber,
      ntn_number: ntnNumber,
      fbr_enabled: fbrEnabled,
      auto_gst: autoGst,
    };

    const updated = await updateProfile(req.user.id, fields);
    return res.status(200).json({ message: 'Profile updated', profile: updated });
  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({ message: 'Something went wrong' });
  }
}

export async function selectModule(req, res) {
  try {
    const { moduleId } = req.body;

    if (!moduleId || !VALID_MODULES.includes(moduleId)) {
      return res.status(400).json({ message: 'Invalid module selected' });
    }

    const profile = await setSelectedModule(req.user.id, moduleId);
    return res.status(200).json({ message: 'Module selected', profile });
  } catch (err) {
    console.error('Select module error:', err);
    return res.status(500).json({ message: 'Something went wrong' });
  }
}