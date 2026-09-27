import 'dotenv/config';
import { pool } from './config/db.js';
import { findBusinessWithModuleByUser, updateBusinessPalette } from './models/businessModel.js';
import { listPalettes } from './models/posModel.js';

const RESULTS = [];

function recordTest(name, passed, details = '') {
  RESULTS.push({ name, passed, details });
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status}: ${name}${details ? ' - ' + details : ''}`);
}

async function runThemeTests() {
  console.log('====================================================');
  console.log('    TESTING TENANT THEME FEATURE INTEGRATION        ');
  console.log('====================================================\n');

  try {
    // 1. Get test business
    const [bizRows] = await pool.query('SELECT b.id, b.owner_user_id, b.palette_id FROM businesses b JOIN users u ON u.id = b.owner_user_id LIMIT 2');
    if (bizRows.length < 2) {
      recordTest('Business Availability', false, 'Need at least 2 businesses to test theme multi-tenancy');
      return;
    }

    const bizA = bizRows[0];
    const bizB = bizRows[1];

    const palettes = await listPalettes();
    if (palettes.length < 2) {
      recordTest('Palettes Available', false, 'Need at least 2 palettes in DB');
      return;
    }

    const paletteA = palettes[0];
    const paletteB = palettes[1];

    // 2. Test Palette Assignment & Persistence for Tenant A
    await updateBusinessPalette(bizA.id, paletteA.id);
    const userA = await findBusinessWithModuleByUser(bizA.owner_user_id);
    if (userA && Number(userA.resolved_palette_id) === Number(paletteA.id) && userA.color_primary === paletteA.colors[0]) {
      recordTest('Tenant Theme Assignment & Resolution', true, `Tenant A assigned palette "${paletteA.name}" (${paletteA.colors[0]})`);
    } else {
      recordTest('Tenant Theme Assignment & Resolution', false, `Failed to assign or resolve palette for Tenant A (got ${userA?.resolved_palette_id} vs ${paletteA.id})`);
    }

    // 3. Test Multi-Tenant Isolation
    await updateBusinessPalette(bizB.id, paletteB.id);
    const userA_recheck = await findBusinessWithModuleByUser(bizA.owner_user_id);
    const userB = await findBusinessWithModuleByUser(bizB.owner_user_id);

    if (Number(userA_recheck.resolved_palette_id) === Number(paletteA.id) && Number(userB.resolved_palette_id) === Number(paletteB.id) && Number(userA_recheck.resolved_palette_id) !== Number(userB.resolved_palette_id)) {
      recordTest('Multi-Tenant Theme Isolation', true, `Tenant A (${userA_recheck.palette_name}) and Tenant B (${userB.palette_name}) remain strictly isolated`);
    } else {
      recordTest('Multi-Tenant Theme Isolation', false, 'Cross-tenant theme contamination detected!');
    }

    // 4. Test Fallback Behavior (Clear palette_id)
    await updateBusinessPalette(bizA.id, null);
    const userA_fallback = await findBusinessWithModuleByUser(bizA.owner_user_id);
    if (userA_fallback && userA_fallback.color_primary) {
      recordTest('Theme Fallback Resolution', true, `Cleared explicit palette_id; resolved default fallback palette "${userA_fallback.palette_name}"`);
    } else {
      recordTest('Theme Fallback Resolution', false, 'Fallback palette resolution failed');
    }

    // 5. Test Deterministic Module ID Relationship (b.module_id -> modules.id)
    const [modCheck] = await pool.query('SELECT b.module_id, m.name FROM businesses b JOIN modules m ON m.id = b.module_id WHERE b.id = ?', [bizA.id]);
    if (userA_fallback && Number(userA_fallback.module_id) === Number(modCheck[0].module_id)) {
      recordTest('Deterministic Module ID Resolution', true, `Business module resolved directly via FK businesses.module_id=${modCheck[0].module_id} -> modules.id ("${modCheck[0].name}")`);
    } else {
      recordTest('Deterministic Module ID Resolution', false, 'Module ID resolution mismatch');
    }

    // Restore original state
    await updateBusinessPalette(bizA.id, bizA.palette_id);
    await updateBusinessPalette(bizB.id, bizB.palette_id);

  } catch (err) {
    console.error('❌ Exception during theme test suite execution:', err);
    recordTest('Theme Test Execution', false, err.message);
  }
}

runThemeTests().then(() => pool.end());
