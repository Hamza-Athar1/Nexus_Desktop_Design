import { pool } from '../config/db.js';

export async function getReceiptSettingsByBusiness(businessId, conn = pool) {
  const [rows] = await conn.query(
    `SELECT
       s.shop_name     AS shopName,
       s.shop_address  AS shopAddress,
       s.font_size     AS fontSize,
       s.language      AS language,
       s.logo_url      AS logoUrl
     FROM business_receipt_settings s
     WHERE s.business_id = ?
     LIMIT 1`,
    [businessId]
  );

  if (rows.length > 0) {
    return rows[0];
  }

  // Fallback to business default name if no row exists yet
  const [bizRows] = await conn.query('SELECT name, shop_address FROM businesses WHERE id = ? LIMIT 1', [businessId]);
  const defaultName = bizRows[0]?.name || 'My Store';
  const defaultAddress = bizRows[0]?.shop_address || 'Main Branch Address';

  return {
    shopName: defaultName,
    shopAddress: defaultAddress,
    fontSize: 15,
    language: 'en',
    logoUrl: null,
  };
}

export async function upsertReceiptSettings(businessId, { shopName, shopAddress, fontSize, language, logoUrl }, conn = pool) {
  const [existing] = await conn.query('SELECT id FROM business_receipt_settings WHERE business_id = ? LIMIT 1', [businessId]);

  if (existing.length > 0) {
    await conn.query(
      `UPDATE business_receipt_settings
       SET shop_name = ?, shop_address = ?, font_size = ?, language = ?, logo_url = ?, updated_at = NOW()
       WHERE business_id = ?`,
      [shopName, shopAddress, fontSize, language, logoUrl, businessId]
    );
  } else {
    await conn.query(
      `INSERT INTO business_receipt_settings (business_id, shop_name, shop_address, font_size, language, logo_url)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [businessId, shopName, shopAddress, fontSize, language, logoUrl]
    );
  }

  return getReceiptSettingsByBusiness(businessId, conn);
}
