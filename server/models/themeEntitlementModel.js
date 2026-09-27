import { pool } from '../config/db.js';

/**
 * Checks if a business owns (or has an active entitlement for) a given palette_id.
 * Preset/free (price = 0) themes can optionally be checked here or automatically entitled.
 */
export async function checkBusinessThemeOwnership(businessId, paletteId, conn = pool) {
  // Check if palette is price 0 (preset/free) or explicitly entitled
  const [pRows] = await conn.query('SELECT price FROM pos_palettes WHERE id = ? LIMIT 1', [paletteId]);
  if (!pRows.length) return false;

  // If price is 0 (Free/preset theme), automatically consider owned
  if (Number(pRows[0].price) === 0) return true;

  const [eRows] = await conn.query(
    'SELECT id FROM business_theme_entitlements WHERE business_id = ? AND palette_id = ? AND status = "active" LIMIT 1',
    [businessId, paletteId]
  );
  return eRows.length > 0;
}

/**
 * Creates an active entitlement for a business & palette.
 */
export async function grantThemeEntitlement(businessId, paletteId, price = 0, conn = pool) {
  const [result] = await conn.query(
    `INSERT INTO business_theme_entitlements (business_id, palette_id, purchase_price, status)
     VALUES (?, ?, ?, 'active')
     ON DUPLICATE KEY UPDATE status = 'active', purchase_price = VALUES(purchase_price), updated_at = NOW()`,
    [businessId, paletteId, price]
  );
  return result;
}

/**
 * Lists all palettes along with ownership and active status for a specific business.
 */
export async function getBusinessThemeCatalog(businessId) {
  // Get currently active palette for business
  const [bizRows] = await pool.query('SELECT palette_id FROM businesses WHERE id = ? LIMIT 1', [businessId]);
  const activePaletteId = bizRows[0]?.palette_id || 1;

  // Get all palettes
  const [palettes] = await pool.query('SELECT id, name, color_primary, color_accent, color_shade, color_light, is_preset, price FROM pos_palettes ORDER BY id ASC');

  // Get active entitlements for business
  const [entitlements] = await pool.query(
    'SELECT palette_id FROM business_theme_entitlements WHERE business_id = ? AND status = "active"',
    [businessId]
  );
  const ownedSet = new Set(entitlements.map((e) => Number(e.palette_id)));

  // Get pending theme purchase requests for business
  const [pendingRequests] = await pool.query(
    `SELECT details FROM shop_requests WHERE business_id = ? AND request_type = 'theme_purchase' AND status = 'Pending'`,
    [businessId]
  );

  const pendingPaletteIds = new Set();
  for (const r of pendingRequests) {
    try {
      const parsed = typeof r.details === 'string' && r.details.startsWith('{') ? JSON.parse(r.details) : null;
      if (parsed?.paletteId) pendingPaletteIds.add(Number(parsed.paletteId));
    } catch {
      // ignore
    }
  }

  return palettes.map((p) => {
    const isFree = Number(p.price) === 0;
    const isOwned = isFree || ownedSet.has(Number(p.id));
    const isActive = Number(p.id) === Number(activePaletteId);
    const isPending = !isOwned && pendingPaletteIds.has(Number(p.id));

    let purchaseStatus = 'available';
    if (isActive) purchaseStatus = 'active';
    else if (isOwned) purchaseStatus = 'owned';
    else if (isPending) purchaseStatus = 'pending';

    return {
      id: p.id,
      name: p.name,
      colorPrimary: p.color_primary,
      colorAccent: p.color_accent,
      colorShade: p.color_shade,
      colorLight: p.color_light,
      colors: [p.color_primary, p.color_accent, p.color_shade, p.color_light],
      isPreset: Boolean(p.is_preset),
      price: Number(p.price),
      owned: isOwned,
      active: isActive,
      pending: isPending,
      purchaseStatus,
    };
  });
}
