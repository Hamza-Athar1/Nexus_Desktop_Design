import { useState } from 'react';
import { Package, X, Scan, ShoppingCart, Shirt, Pill, ChevronDown, Calendar } from 'lucide-react';
import { apiFetch } from '../../lib/api';
import BarcodeScanModal from './BarcodeScanModal';

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

function TextField({ label, value, onChange, placeholder, type = 'text', showChevron = false }) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#1a3a0a]">
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg bg-[#5f7d5c] px-3.5 py-2.5 text-[13px] font-semibold text-white placeholder-[#b3c7aa] outline-none"
        />
        {showChevron && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-white">
            <ChevronDown size={14} className="stroke-[3] opacity-80" />
          </div>
        )}
      </div>
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#1a3a0a]">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-lg bg-[#5f7d5c] px-3.5 py-2.5 pr-10 text-[13px] font-semibold text-white outline-none cursor-pointer"
        >
          {options.map((o) => (
            <option key={o} value={o} className="bg-[#3a5a2a] text-white">
              {o}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-white">
          <ChevronDown size={14} className="stroke-[3] opacity-80" />
        </div>
      </div>
    </div>
  );
}

function DateField({ label, value, onChange }) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#1a3a0a]">
        {label}
      </label>
      <div className="relative">
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg bg-[#5f7d5c] px-3.5 py-2.5 pr-10 text-[13px] font-semibold text-white outline-none cursor-pointer [color-scheme:dark]"
        />
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-white">
          <Calendar size={14} className="opacity-80" />
        </div>
      </div>
    </div>
  );
}

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

  // Cost Price (kept in module specific fields or custom)
  const [costPrice, setCostPrice] = useState(extra.cost_price != null ? String(extra.cost_price) : '');

  // Grocery-specific
  const [unit, setUnit] = useState(extra.unit || unitOptions[0] || '');
  const [supplierName, setSupplierName] = useState(extra.supplier_name || '');
  const [expiryDate, setExpiryDate] = useState(extra.expiry_date || '');

  // Clothing-specific
  const [selectedSizes, setSelectedSizes] = useState(extra.sizes || []);
  const [brand, setBrand] = useState(extra.brand || 'Salt');
  const [selectedColors, setSelectedColors] = useState(extra.colors || []);

  // Pharmacy-specific
  const [batchNo, setBatchNo] = useState(extra.batch_no || '');
  const [manufacturer, setManufacturer] = useState(extra.manufacturer || '');

  const [submitting, setSubmitting] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [error, setError] = useState('');

  const BRAND_OPTIONS = ['Salt', 'Outfitters', 'Khaadi', 'Sana Safinaz', 'Custom'];
  const CLOTHING_SIZE_OPTIONS = ['S', 'M', 'L', 'XL', 'XXL'];
  const CLOTHING_COLORS = [
    { name: 'Green', hex: '#70b567' },
    { name: 'Navy', hex: '#273240' },
    { name: 'Red', hex: '#e54747' },
    { name: 'Blue', hex: '#3086e4' },
  ];

  // Get dynamic header entity and action text
  const headerActionText = isEdit ? 'Edit' : 'Add';
  const headerEntityText = moduleType === 'clothing' ? 'Product' : 'Item';
  const titleText = `${headerActionText} ${headerEntityText} - ${moduleType.toUpperCase()}`;

  // Get dynamic submit button text
  const submitButtonText = submitting
    ? 'Saving…'
    : isEdit
    ? 'Save Changes'
    : moduleType === 'clothing'
    ? 'Add Product'
    : 'Add to Inventory';

  function toggleSize(size) {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  }

  function buildModuleSpecificFields() {
    const baseFields = {
      cost_price: costPrice ? Number(costPrice) : undefined,
    };

    if (moduleType === 'clothing') {
      return {
        ...baseFields,
        sizes: selectedSizes,
        colors: selectedColors,
        brand,
      };
    }
    if (moduleType === 'pharmacy') {
      return {
        ...baseFields,
        batch_no: batchNo || undefined,
        manufacturer: manufacturer || undefined,
        expiry_date: expiryDate || undefined,
      };
    }
    return {
      ...baseFields,
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

    if (isEdit && !window.confirm("Are you sure you want to save these changes?")) {
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
      const path = isEdit
        ? `/inventory/items/${initialItem.id}`
        : '/inventory/items';
      const res = await apiFetch(path, {
        method: isEdit ? 'PUT' : 'POST',
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

  // Get dynamic header icon
  let HeaderIcon = Package;
  if (moduleType === 'grocery') HeaderIcon = ShoppingCart;
  else if (moduleType === 'clothing') HeaderIcon = ShoppingCart; // Mockup shows ShoppingCart for clothing
  else if (moduleType === 'pharmacy') HeaderIcon = Pill;

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
            <HeaderIcon size={18} className="text-[#3a6a2a]" />
            <span className="text-[13px] font-extrabold uppercase tracking-[0.12em] text-[#1a3a0a]">
              {titleText}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#7f9774] px-3.5 py-1.5 text-[#1a3a0a] transition hover:bg-[#d0d8a0] cursor-pointer"
          >
            <X size={14} className="stroke-[2.5]" />
          </button>
        </div>

        <div className="mx-5 mb-4 border-t border-[#3a6a2a]" />

        <div className="flex flex-col gap-4 overflow-y-auto px-5 pb-5">
          <TextField
            label="Product Name"
            value={name}
            onChange={setName}
            placeholder={
              moduleType === 'pharmacy'
                ? 'e.g. Panadol 500mg'
                : moduleType === 'clothing'
                ? "e.g. Men's Polo Shirt"
                : 'e.g. Basmati Rice'
            }
          />

          <div className="grid grid-cols-2 gap-4">
            <SelectField label="Category" value={category} onChange={setCategory} options={categories} />
            {moduleType === 'clothing' ? (
              <SelectField label="Brand" value={brand} onChange={setBrand} options={BRAND_OPTIONS} />
            ) : (
              <SelectField label="Unit Type" value={unit} onChange={setUnit} options={unitOptions} />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <TextField
              label={moduleType === 'clothing' ? 'Sale Price' : 'Sale Price (Per Unit)'}
              value={price}
              onChange={setPrice}
              placeholder={moduleType === 'clothing' ? 'Rs 1,200' : moduleType === 'grocery' ? 'Rs 280/kg' : '0'}
              type="text"
              showChevron={true}
            />
            <TextField
              label="Cost Price"
              value={costPrice}
              onChange={setCostPrice}
              placeholder={moduleType === 'clothing' ? 'Rs 700' : moduleType === 'grocery' ? 'Rs 200/kg' : '0'}
              type="text"
              showChevron={true}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <TextField
              label={moduleType === 'clothing' ? 'Stock Per Variant' : 'Opening Stock'}
              value={stockQty}
              onChange={setStockQty}
              placeholder={moduleType === 'clothing' ? 'e.g. 50' : moduleType === 'grocery' ? 'e.g. 50 kg' : '0'}
              type="text"
            />
            <TextField
              label={moduleType === 'clothing' ? 'Low Stock Alert At' : moduleType === 'grocery' ? 'Cost Price' : 'Reorder Level'}
              value={reorderLevel}
              onChange={setReorderLevel}
              placeholder={moduleType === 'clothing' ? 'e.g. 5 per variant' : moduleType === 'grocery' ? 'e.g. 10 kg' : '0'}
              type="text"
            />
          </div>

          {/* Module-specific section */}
          {moduleType === 'grocery' ? (
            <div className="rounded-xl border border-[#8aaa70] bg-[#d8dca8] p-3.5">
              <p className="mb-3 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#1a3a0a]">
                Grocery-Specific
              </p>
              <div className="grid grid-cols-2 gap-4">
                <TextField label="Supplier Name" value={supplierName} onChange={setSupplierName} placeholder="Al-Madina Traders" />
                <DateField label="Expiry Date" value={expiryDate} onChange={setExpiryDate} />
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
                <DateField label="Expiry Date" value={expiryDate} onChange={setExpiryDate} />
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-[#8aaa70] bg-[#d8dca8] p-3.5">
              <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#1a3a0a]">
                Clothing-Specific: Sizes
              </p>
              <div className="mb-3.5">
                <div className="flex flex-wrap gap-2">
                  {CLOTHING_SIZE_OPTIONS.map((s) => {
                    const isSelected = selectedSizes.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleSize(s)}
                        className={`rounded px-3 py-1 text-[12px] font-bold border transition cursor-pointer ${
                          isSelected
                            ? 'border-[#355c34] bg-[#355c34] text-white'
                            : 'border-[#355c34] bg-transparent text-[#355c34]'
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#1a3a0a]">
                Colors Available
              </p>
              <div className="flex gap-3">
                {CLOTHING_COLORS.map((c) => {
                  const isSelected = selectedColors.includes(c.name);
                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => {
                        setSelectedColors(prev =>
                          prev.includes(c.name)
                            ? prev.filter(x => x !== c.name)
                            : [...prev, c.name]
                        );
                      }}
                      className={`h-6 w-6 rounded-full border border-white/20 transition-all cursor-pointer ${
                        isSelected ? 'ring-2 ring-[#355c34] ring-offset-2 ring-offset-[#d8dca8]' : 'opacity-60 hover:opacity-90'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#1a3a0a]">
              Barcode
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Scan or enter barcode"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="min-w-0 flex-1 rounded-lg bg-[#5f7d5c] px-3.5 py-2.5 text-[13px] font-semibold text-white placeholder-[#b3c7aa] outline-none"
              />
              <button
                type="button"
                onClick={() => setShowScanner(true)}
                className="rounded-lg border border-[#5f7d5c] p-2 text-[#5f7d5c] hover:bg-[#d8dca8] transition shrink-0 flex items-center justify-center h-[38px] w-[38px] cursor-pointer"
              >
                <Scan size={18} />
              </button>
            </div>
          </div>

          {error && (
            <p className="text-[12px] font-semibold text-red-700">{error}</p>
          )}

          <div className="mt-1 grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-[#355c34] py-3 text-[13px] font-extrabold text-white transition hover:bg-[#436e42] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="rounded-xl bg-[#355c34] py-3 text-[13px] font-extrabold text-white transition hover:bg-[#436e42] disabled:opacity-60 cursor-pointer"
            >
              {submitButtonText}
            </button>
          </div>
        </div>
      </div>

      {showScanner && (
        <BarcodeScanModal
          onClose={() => setShowScanner(false)}
          onConfirm={(result) => {
            if (result?.name) setBarcode(result.name);
          }}
        />
      )}
    </div>
  );
}
