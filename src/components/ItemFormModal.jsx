import { useState } from 'react';
import { Package, X } from 'lucide-react';
import { API_BASE_URL } from '../lib/api';

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

function TextField({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#1a3a0a]">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg bg-[#4a6e3a] px-3.5 py-2.5 text-[13px] font-semibold text-white placeholder-[#b0c898] outline-none"
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#1a3a0a]">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-lg bg-[#4a6e3a] px-3.5 py-2.5 text-[13px] font-semibold text-white outline-none cursor-pointer"
      >
        {options.map((o) => (
          <option key={o} value={o} className="bg-[#3a5a2a]">{o}</option>
        ))}
      </select>
    </div>
  );
}

/**
 * Shared item form for both Grocery and Clothing inventory.
 *
 * mode: 'add' | 'edit'
 * initialItem: the raw item object from the API when editing, null when adding
 * moduleType: 'grocery' | 'clothing' — controls which extra fields section renders
 * categories: array of category option strings for the dropdown
 * unitOptions: array of unit strings (grocery only)
 * onClose(): called to dismiss without saving
 * onSaved(): called after a successful create/update, so the parent can refetch
 */
export default function ItemFormModal({
  mode,
  initialItem,
  initialBarcode = '',
  moduleType = 'grocery',
  categories = [],
  unitOptions = [],
  onClose,
  onSaved,
}) {
  const isEdit = mode === 'edit';
  const extra = initialItem?.module_specific_fields || {};

  const [name, setName] = useState(initialItem?.name || '');
  const [sku, setSku] = useState(initialItem?.sku || '');
  const [barcode, setBarcode] = useState(initialItem?.barcode || initialBarcode || '');
  const [category, setCategory] = useState(initialItem?.category || categories[0] || '');
  const [price, setPrice] = useState(initialItem?.price != null ? String(initialItem.price) : '');
  const [stockQty, setStockQty] = useState(initialItem?.stock_qty != null ? String(initialItem.stock_qty) : '');
  const [reorderLevel, setReorderLevel] = useState(initialItem?.reorder_level != null ? String(initialItem.reorder_level) : '');

  // Grocery-specific
  const [unit, setUnit] = useState(extra.unit || unitOptions[0] || '');
  const [supplierName, setSupplierName] = useState(extra.supplier_name || '');
  const [expiryDate, setExpiryDate] = useState(extra.expiry_date || '');

  // Clothing-specific
  const [selectedSizes, setSelectedSizes] = useState(extra.sizes || []);
  const [colorsInput, setColorsInput] = useState((extra.colors || []).join(', '));

  // Pharmacy-specific
  const [batchNo, setBatchNo] = useState(extra.batch_no || '');
  const [manufacturer, setManufacturer] = useState(extra.manufacturer || '');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function toggleSize(size) {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  }

  function buildModuleSpecificFields() {
    if (moduleType === 'clothing') {
      return {
        sizes: selectedSizes,
        colors: colorsInput.split(',').map((c) => c.trim()).filter(Boolean),
      };
    }
    if (moduleType === 'pharmacy') {
      return {
        batch_no: batchNo || undefined,
        manufacturer: manufacturer || undefined,
        expiry_date: expiryDate || undefined,
      };
    }
    return {
      unit,
      supplier_name: supplierName || undefined,
      expiry_date: expiryDate || undefined,
    };
  }

  async function handleSubmit() {
    setError('');

    if (!name.trim()) {
      setError('Item name is required');
      return;
    }
    const priceNum = Number(price);
    if (price !== '' && (Number.isNaN(priceNum) || priceNum < 0)) {
      setError('Price must be a valid non-negative number');
      return;
    }

    setSubmitting(true);

    const payload = {
      name: name.trim(),
      sku: sku.trim() || undefined,
      barcode: barcode.trim() || undefined,
      category,
      price: price === '' ? 0 : priceNum,
      stockQty: stockQty === '' ? 0 : Number(stockQty),
      reorderLevel: reorderLevel === '' ? 0 : Number(reorderLevel),
      moduleSpecificFields: buildModuleSpecificFields(),
    };

    try {
      const url = isEdit
        ? `${API_BASE_URL}/inventory/items/${initialItem.id}`
        : `${API_BASE_URL}/inventory/items`;
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || `Failed to save item (status ${res.status})`);
      }

      onSaved?.();
    } catch (err) {
      console.error('ItemFormModal submit failed:', err);
      setError(err.message || 'Unable to reach the server');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="relative flex w-full max-w-[420px] flex-col rounded-2xl bg-[#e8e8c0] shadow-2xl max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-2.5">
            <Package size={18} className="text-[#3a6a2a]" />
            <span className="text-[13px] font-extrabold uppercase tracking-[0.12em] text-[#1a3a0a]">
              {isEdit ? 'Edit Item' : 'Add Item'} - {moduleType === 'clothing' ? 'Clothing' : moduleType === 'pharmacy' ? 'Pharmacy' : 'Grocery'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#5a7a4a] px-2.5 py-1.5 text-[#1a3a0a] transition hover:bg-[#d0d8a0]"
          >
            <X size={14} />
          </button>
        </div>

        <div className="mx-5 mb-4 border-t border-[#3a6a2a]" />

        <div className="flex flex-col gap-4 overflow-y-auto px-5 pb-5">
          <TextField label="Item Name" value={name} onChange={setName} placeholder={moduleType === 'pharmacy' ? 'e.g. Panadol 500mg' : moduleType === 'clothing' ? 'e.g. T-Shirt' : 'e.g. Basmati Rice'} />

          <div className="grid grid-cols-2 gap-3">
            <TextField label="SKU" value={sku} onChange={setSku} placeholder={moduleType === 'pharmacy' ? 'e.g. PHA-001' : moduleType === 'clothing' ? 'e.g. CLO-001' : 'e.g. GRO-001'} />
            <TextField label="Barcode" value={barcode} onChange={setBarcode} placeholder="Optional" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <SelectField label="Category" value={category} onChange={setCategory} options={categories} />
            {(moduleType === 'grocery' || moduleType === 'pharmacy') && (
              <SelectField label="Unit Type" value={unit} onChange={setUnit} options={unitOptions} />
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <TextField label="Price (Rs)" value={price} onChange={setPrice} placeholder="0" type="number" />
            <TextField label="Stock Qty" value={stockQty} onChange={setStockQty} placeholder="0" type="number" />
            <TextField label="Reorder Level" value={reorderLevel} onChange={setReorderLevel} placeholder="0" type="number" />
          </div>

          {/* Module-specific section */}
          {moduleType === 'grocery' ? (
            <div className="rounded-xl border border-[#8aaa70] bg-[#d8dca8] p-3.5">
              <p className="mb-3 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#1a3a0a]">
                Grocery-Specific
              </p>
              <div className="grid grid-cols-2 gap-3">
                <TextField label="Supplier Name" value={supplierName} onChange={setSupplierName} placeholder="Al-Madina Traders" />
                <TextField label="Expiry Date" value={expiryDate} onChange={setExpiryDate} type="date" />
              </div>
            </div>
          ) : moduleType === 'pharmacy' ? (
            <div className="rounded-xl border border-[#8aaa70] bg-[#d8dca8] p-3.5">
              <p className="mb-3 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#1a3a0a]">
                Pharmacy-Specific
              </p>
              <div className="grid grid-cols-3 gap-2.5">
                <TextField label="Batch No" value={batchNo} onChange={setBatchNo} placeholder="e.g. B-123" />
                <TextField label="Manufacturer" value={manufacturer} onChange={setManufacturer} placeholder="e.g. GSK" />
                <TextField label="Expiry Date" value={expiryDate} onChange={setExpiryDate} type="date" />
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-[#8aaa70] bg-[#d8dca8] p-3.5">
              <p className="mb-3 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#1a3a0a]">
                Clothing-Specific
              </p>
              <div className="mb-3">
                <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[#1a3a0a]">Sizes</p>
                <div className="flex flex-wrap gap-1.5">
                  {SIZE_OPTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSize(s)}
                      className={`rounded-lg border px-3 py-1.5 text-[12px] font-bold transition ${selectedSizes.includes(s)
                        ? 'border-[#3a6a2a] bg-[#3a6a2a] text-white'
                        : 'border-[#8aaa70] bg-[#e8e8c0] text-[#1a3a0a]'
                        }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <TextField
                label="Colors (comma separated)"
                value={colorsInput}
                onChange={setColorsInput}
                placeholder="Red, Navy, Black"
              />
            </div>
          )}

          {error && (
            <p className="text-[12px] font-semibold text-red-700">{error}</p>
          )}

          <div className="mt-1 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-[#3a5a28] py-3 text-[13px] font-extrabold text-white transition hover:bg-[#4a6a38]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="rounded-xl bg-[#3a5a28] py-3 text-[13px] font-extrabold text-white transition hover:bg-[#4a6a38] disabled:opacity-60"
            >
              {submitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Add to Inventory'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}