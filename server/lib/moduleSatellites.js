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

const WEIGHED_UNITS = new Set(['KG', 'G', 'L', 'ML', 'LITRE', 'LITER', 'GRAM']);

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
          brand: f.brand || null,
          expiry_date: f.expiry_date || null,
          is_perishable: f.is_perishable ? 1 : (f.expiry_date ? 1 : 0),
          is_weighed: f.is_weighed !== undefined ? (f.is_weighed ? 1 : 0) : (WEIGHED_UNITS.has((f.unit || '').toUpperCase()) ? 1 : 0),
          package_size: f.package_size || null,
          country_of_origin: f.country_of_origin || null,
        }),
        fromRow: (row) => ({
          brand: row?.brand || undefined,
          expiry_date: row?.expiry_date || undefined,
          is_perishable: row?.is_perishable ? true : false,
          is_weighed: row?.is_weighed ? true : false,
          package_size: row?.package_size || undefined,
          country_of_origin: row?.country_of_origin || undefined,
        }),
      };

    case 'pharmacy':
      return {
        table: 'pharmacy_products',
        toRow: (f) => ({
          generic_name: f.generic_name || null,
          brand_name: f.brand_name || null,
          manufacturer: f.manufacturer || null,
          batch_number: f.batch_number || f.batch_no || null,
          expiry_date: f.expiry_date || null,
          dosage_form: f.dosage_form || null,
          strength: f.strength || null,
          requires_prescription: f.requires_prescription ? 1 : 0,
          is_controlled: f.is_controlled ? 1 : 0,
          storage_conditions: f.storage_conditions || null,
        }),
        fromRow: (row) => ({
          generic_name: row?.generic_name || undefined,
          brand_name: row?.brand_name || undefined,
          manufacturer: row?.manufacturer || undefined,
          batch_number: row?.batch_number || undefined,
          batch_no: row?.batch_number || undefined,
          expiry_date: row?.expiry_date || undefined,
          dosage_form: row?.dosage_form || undefined,
          strength: row?.strength || undefined,
          requires_prescription: row?.requires_prescription ? true : false,
          is_controlled: row?.is_controlled ? true : false,
          storage_conditions: row?.storage_conditions || undefined,
        }),
      };

    case 'clothing':
      return {
        table: 'clothing_products',
        toRow: (f) => ({
          brand: f.brand || null,
          size: Array.isArray(f.sizes) ? f.sizes.join(', ') : (f.size || null),
          color: Array.isArray(f.colors) ? f.colors.join(', ') : (f.color || null),
          material: f.material || null,
          gender: ['men', 'women', 'unisex', 'kids'].includes(f.gender) ? f.gender : 'unisex',
          season: f.season || null,
        }),
        fromRow: (row) => ({
          brand: row?.brand || undefined,
          size: row?.size || undefined,
          color: row?.color || undefined,
          sizes: row?.size ? row.size.split(',').map((s) => s.trim()).filter(Boolean) : [],
          colors: row?.color ? row.color.split(',').map((c) => c.trim()).filter(Boolean) : [],
          material: row?.material || undefined,
          gender: row?.gender || 'unisex',
          season: row?.season || undefined,
        }),
      };

    case 'electronics':
      return {
        table: 'electronics_products',
        toRow: (f) => ({
          brand: f.brand || null,
          model_number: f.model_number || null,
          serial_number: f.serial_number || null,
          warranty_months: Number(f.warranty_months) || 0,
          power_rating: f.power_rating || null,
          condition_type: ['new', 'refurbished', 'used'].includes(f.condition_type) ? f.condition_type : 'new',
        }),
        fromRow: (row) => ({
          brand: row?.brand || undefined,
          model_number: row?.model_number || undefined,
          serial_number: row?.serial_number || undefined,
          warranty_months: row?.warranty_months || 0,
          power_rating: row?.power_rating || undefined,
          condition_type: row?.condition_type || 'new',
        }),
      };

    case 'bakery':
      return {
        table: 'bakery_products',
        toRow: (f) => ({
          baked_on: f.baked_on || null,
          best_before: f.best_before || f.expiry_date || null,
          shelf_life_hours: Number(f.shelf_life_hours) || null,
          contains_allergens: f.contains_allergens || null,
          is_custom_order: f.is_custom_order ? 1 : 0,
        }),
        fromRow: (row) => ({
          baked_on: row?.baked_on || undefined,
          best_before: row?.best_before || undefined,
          expiry_date: row?.best_before || undefined,
          shelf_life_hours: row?.shelf_life_hours || undefined,
          contains_allergens: row?.contains_allergens || undefined,
          is_custom_order: row?.is_custom_order ? true : false,
        }),
      };

    case 'restaurant':
      return {
        table: 'restaurant_products',
        toRow: (f) => ({
          course_type: f.course_type || null,
          preparation_minutes: Number(f.preparation_minutes) || null,
          is_vegetarian: f.is_vegetarian ? 1 : 0,
          spice_level: ['none', 'mild', 'medium', 'hot'].includes(f.spice_level) ? f.spice_level : 'none',
          contains_allergens: f.contains_allergens || null,
          is_stock_tracked: f.is_stock_tracked !== undefined ? (f.is_stock_tracked ? 1 : 0) : 0,
        }),
        fromRow: (row) => ({
          course_type: row?.course_type || undefined,
          preparation_minutes: row?.preparation_minutes || undefined,
          is_vegetarian: row?.is_vegetarian ? true : false,
          spice_level: row?.spice_level || 'none',
          contains_allergens: row?.contains_allergens || undefined,
          is_stock_tracked: row?.is_stock_tracked ? true : false,
        }),
      };

    case 'general_store':
    case 'general':
      return {
        table: 'general_store_products',
        toRow: (f) => ({
          brand: f.brand || null,
          package_size: f.package_size || null,
          expiry_date: f.expiry_date || null,
        }),
        fromRow: (row) => ({
          brand: row?.brand || undefined,
          package_size: row?.package_size || undefined,
          expiry_date: row?.expiry_date || undefined,
        }),
      };

    default:
      return null;
  }
}

