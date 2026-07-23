/**
 * moduleSatellites.js — bridges ItemFormModal.jsx's `moduleSpecificFields`
 * payload to the right 1:1 satellite table for the business's module.
 *
 * Only 'grocery', 'pharmacy', and 'clothing' are wired up here, because
 * those are the only modules with an actual inventory UI right now
 * (InventoryPage.jsx falls back to the grocery layout for
 * electronics/bakery/restaurant/general_store too — see
 * InventoryPage.jsx's `isPharmacy` check). A business registered under
 * one of those other four modules will get its `products` row created
 * fine, just with no satellite row — nothing in module_specific_fields
 * to map yet, since no one has designed that module's form. Add a case
 * here (and a real form in the frontend) when one of them gets built.
 */

const WEIGHED_UNITS = new Set(['KG', 'G', 'L', 'ML']);

/**
 * @param {string} moduleCode
 * @returns {{
 *   table: string,
 *   toRow: (fields: object) => object,   // moduleSpecificFields -> satellite columns
 *   fromRow: (row: object) => object,    // satellite columns -> module_specific_fields shape the UI expects
 * } | null}
 */
export function getSatelliteHandler(moduleCode) {
  switch (moduleCode) {
    case 'grocery':
      return {
        table: 'grocery_products',
        toRow: (f) => ({
          brand: null,
          expiry_date: f.expiry_date || null,
          is_perishable: f.expiry_date ? 1 : 0,
          is_weighed: WEIGHED_UNITS.has((f.unit || '').toUpperCase()) ? 1 : 0,
          package_size: null,
          country_of_origin: null,
        }),
        fromRow: (row) => ({
          expiry_date: row?.expiry_date || undefined,
        }),
      };

    case 'pharmacy':
      return {
        table: 'pharmacy_products',
        toRow: (f) => ({
          generic_name: null,
          brand_name: null,
          manufacturer: f.manufacturer || null,
          batch_number: f.batch_no || null,
          expiry_date: f.expiry_date || null,
          dosage_form: null,
          strength: null,
          requires_prescription: 0,
          is_controlled: 0,
          storage_conditions: null,
        }),
        fromRow: (row) => ({
          manufacturer: row?.manufacturer || undefined,
          batch_no: row?.batch_number || undefined,
          expiry_date: row?.expiry_date || undefined,
        }),
      };

    case 'clothing':
      return {
        table: 'clothing_products',
        // clothing_products models ONE size + ONE color per product row
        // (schema comment: "size VARCHAR(24) -- S, M, L, 32, 8.5"). The UI
        // lets someone pick several sizes/colors for a single product
        // listing (a multi-variant mental model the schema doesn't have
        // yet — true per-variant stock would mean one product row per
        // size/color combo). Rather than silently drop the extra
        // selections, we store them comma-joined and split them back out
        // on read, so the UI's existing sizes[]/colors[] rendering keeps
        // working. This is a stopgap, not per-variant stock tracking —
        // see server/README.md.
        toRow: (f) => ({
          brand: f.brand || null,
          size: Array.isArray(f.sizes) ? f.sizes.join(', ') : null,
          color: Array.isArray(f.colors) ? f.colors.join(', ') : null,
          material: null,
          gender: 'unisex',
          season: null,
        }),
        fromRow: (row) => ({
          brand: row?.brand || undefined,
          sizes: row?.size ? row.size.split(',').map((s) => s.trim()).filter(Boolean) : [],
          colors: row?.color ? row.color.split(',').map((c) => c.trim()).filter(Boolean) : [],
        }),
      };

    default:
      return null;
  }
}
