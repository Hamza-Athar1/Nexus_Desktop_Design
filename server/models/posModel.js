/**
 * posModel.js — DB layer for Super Admin POS Management page.
 *
 * Tables: pos_palettes, pos_modules
 */
import { pool } from '../config/db.js';

// ── Palette helpers ───────────────────────────────────────────────────────────

/** Serialise a palette DB row → frontend shape */
function serPalette(row) {
  return {
    id:       row.id,
    name:     row.name,
    isPreset: Boolean(row.is_preset),
    colors: [row.color_primary, row.color_accent, row.color_shade, row.color_light],
  };
}

/** All palettes (preset first) */
export async function listPalettes() {
  const [rows] = await pool.query(
    'SELECT * FROM pos_palettes ORDER BY is_preset DESC, id ASC'
  );
  return rows.map(serPalette);
}

/** Create a custom palette */
export async function createPalette({ name, colorPrimary, colorAccent, colorShade, colorLight }) {
  const [existing] = await pool.query('SELECT id FROM pos_palettes WHERE name = ?', [name]);
  if (existing.length) throw Object.assign(new Error('Palette name already exists'), { status: 409 });

  const [result] = await pool.query(
    `INSERT INTO pos_palettes (name, color_primary, color_accent, color_shade, color_light, is_preset)
     VALUES (?, ?, ?, ?, ?, 0)`,
    [name, colorPrimary, colorAccent, colorShade, colorLight]
  );
  const [rows] = await pool.query('SELECT * FROM pos_palettes WHERE id = ?', [result.insertId]);
  return serPalette(rows[0]);
}

/** Delete a custom palette (refuse if preset) */
export async function deletePalette(id) {
  const [rows] = await pool.query('SELECT is_preset FROM pos_palettes WHERE id = ?', [id]);
  if (!rows.length) throw Object.assign(new Error('Palette not found'), { status: 404 });
  if (rows[0].is_preset) throw Object.assign(new Error('Cannot delete a preset palette'), { status: 400 });
  // Null-out any POS modules referencing this palette
  await pool.query('UPDATE pos_modules SET palette_id = NULL WHERE palette_id = ?', [id]);
  await pool.query('DELETE FROM pos_palettes WHERE id = ?', [id]);
}

// ── POS module helpers ────────────────────────────────────────────────────────

const MOD_SELECT = `
  SELECT
    m.id,
    m.name,
    m.price_cents,
    m.status,
    m.created_at,
    p.id            AS palette_id,
    p.name          AS palette_name,
    p.color_primary,
    p.color_accent,
    p.color_shade,
    p.color_light,
    p.is_preset
  FROM pos_modules m
  LEFT JOIN pos_palettes p ON p.id = m.palette_id
`;

function serModule(row) {
  return {
    id:         row.id,
    name:       row.name,
    priceCents: row.price_cents,
    priceLabel: `Rs ${Number(row.price_cents / 100).toLocaleString()}/mo`,
    status:     row.status,
    createdAt:  row.created_at,
    palette: row.palette_id ? {
      id:       row.palette_id,
      name:     row.palette_name,
      isPreset: Boolean(row.is_preset),
      colors:   [row.color_primary, row.color_accent, row.color_shade, row.color_light],
    } : null,
  };
}

export async function listPosModules() {
  const [rows] = await pool.query(MOD_SELECT + ' ORDER BY m.created_at ASC');
  return rows.map(serModule);
}

export async function getPosStats() {
  const [[stats]] = await pool.query(`
    SELECT
      COUNT(*)                                      AS total,
      SUM(status = 'active')                        AS active,
      SUM(palette_id IS NOT NULL)                   AS themed
    FROM pos_modules
  `);
  return {
    total:  Number(stats.total),
    active: Number(stats.active),
    themed: Number(stats.themed),
  };
}

export async function createPosModule({ name, priceCents, paletteId }) {
  const [ex] = await pool.query('SELECT id FROM pos_modules WHERE name = ?', [name]);
  if (ex.length) throw Object.assign(new Error('POS name already exists'), { status: 409 });

  const [result] = await pool.query(
    `INSERT INTO pos_modules (name, price_cents, palette_id, status)
     VALUES (?, ?, ?, 'active')`,
    [name, priceCents, paletteId || null]
  );
  const [rows] = await pool.query(MOD_SELECT + ' WHERE m.id = ?', [result.insertId]);
  return serModule(rows[0]);
}

export async function updatePosModule(id, { name, priceCents, paletteId, status }) {
  const [ex] = await pool.query('SELECT id FROM pos_modules WHERE id = ?', [id]);
  if (!ex.length) throw Object.assign(new Error('POS module not found'), { status: 404 });

  const fields = [];
  const params = [];
  if (name       !== undefined) { fields.push('name = ?');        params.push(name); }
  if (priceCents !== undefined) { fields.push('price_cents = ?'); params.push(priceCents); }
  if (paletteId  !== undefined) { fields.push('palette_id = ?');  params.push(paletteId || null); }
  if (status     !== undefined) { fields.push('status = ?');      params.push(status); }

  if (fields.length) {
    await pool.query(`UPDATE pos_modules SET ${fields.join(', ')} WHERE id = ?`, [...params, id]);
  }
  const [rows] = await pool.query(MOD_SELECT + ' WHERE m.id = ?', [id]);
  return serModule(rows[0]);
}

export async function deletePosModule(id) {
  const [ex] = await pool.query('SELECT id FROM pos_modules WHERE id = ?', [id]);
  if (!ex.length) throw Object.assign(new Error('POS module not found'), { status: 404 });
  await pool.query('DELETE FROM pos_modules WHERE id = ?', [id]);
}
