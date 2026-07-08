import { useState } from 'react';
import { ShoppingCart, X, ChevronDown, ScanBarcode, CalendarDays } from 'lucide-react';
import BarcodeScannerModal from './BarcodeScannerModal';

const CATEGORIES = ['Grain', 'Dairy', 'Meat', 'Bakery', 'Beverage', 'Snacks', 'Produce'];
const UNIT_TYPES = ['ML', 'L', 'G', 'KG', 'PCS', 'PKT', 'BOX'];
const SALE_PRICES = ['Rs 280/kg', 'Rs 300/kg', 'Rs 350/kg', 'Rs 400/kg', 'Custom'];
const COST_PRICES = ['Rs 200/kg', 'Rs 220/kg', 'Rs 250/kg', 'Rs 270/kg', 'Custom'];

// Dark green dropdown/select fields
function SelectField({ value, onChange, options }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-lg bg-[#4a6e3a] px-3.5 py-2.5 pr-9 text-[13px] font-semibold text-white outline-none cursor-pointer"
      >
        {options.map((o) => (
          <option key={o} value={o} className="bg-[#3a5a2a]">
            {o}
          </option>
        ))}
      </select>
      <ChevronDown
        size={15}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white"
      />
    </div>
  );
}

// Muted green input fields (Opening Stock, Cost Price, Barcode area)
function InputField({ placeholder, value, onChange, type = 'text' }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-[#7a9e6a] px-3.5 py-2.5">
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-w-0 flex-1 bg-transparent text-[13px] text-white placeholder-[#c8dab8] outline-none"
      />
    </div>
  );
}

export default function AddItemModal({ onClose }) {
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('Grain');
  const [unitType, setUnitType] = useState('ML');
  const [salePrice, setSalePrice] = useState('Rs 280/kg');
  const [costPrice, setCostPrice] = useState('Rs 200/kg');
  const [openingStock, setOpeningStock] = useState('');
  const [reorderLevel, setReorderLevel] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [barcode, setBarcode] = useState('');
  const [showScanner, setShowScanner] = useState(false);

  function handleBarcodeConfirm(result) {
    if (result?.name) setBarcode(result.name);
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      {/* Modal card — cream/parchment background */}
      <div
        className="relative flex w-full max-w-[390px] flex-col rounded-2xl bg-[#e8e8c0] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-2.5">
            <ShoppingCart size={18} className="text-[#3a6a2a]" />
            <span className="text-[13px] font-extrabold uppercase tracking-[0.12em] text-[#1a3a0a]">
              Add Item - Grocery
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

        {/* Divider line under header */}
        <div className="mx-5 mb-4 border-t border-[#3a6a2a]" />

        {/* Body */}
        <div className="flex flex-col gap-4 overflow-y-auto px-5 pb-5">
          {/* Product Name */}
          <div>
            <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#1a3a0a]">
              Product Name
            </label>
            {/* Product name input — darker muted green like dropdowns */}
            <div className="flex items-center gap-2 rounded-lg bg-[#4a6e3a] px-3.5 py-2.5">
              <input
                type="text"
                placeholder="e.g.  Basmati Rice"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="min-w-0 flex-1 bg-transparent text-[13px] font-semibold text-white placeholder-[#b0c898] outline-none"
              />
            </div>
          </div>

          {/* Category & Unit Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#1a3a0a]">
                Category
              </label>
              <SelectField value={category} onChange={setCategory} options={CATEGORIES} />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#1a3a0a]">
                Unit Type
              </label>
              <SelectField value={unitType} onChange={setUnitType} options={UNIT_TYPES} />
            </div>
          </div>

          {/* Sale Price & Cost Price (dropdowns) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#1a3a0a]">
                Sale Price (per unit)
              </label>
              <SelectField value={salePrice} onChange={setSalePrice} options={SALE_PRICES} />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#1a3a0a]">
                Cost Price
              </label>
              <SelectField value={costPrice} onChange={setCostPrice} options={COST_PRICES} />
            </div>
          </div>

          {/* Opening Stock & Reorder Level — muted green inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#1a3a0a]">
                Opening Stock
              </label>
              <InputField
                placeholder="e.g. 50 kg"
                value={openingStock}
                onChange={setOpeningStock}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#1a3a0a]">
                Cost Price
              </label>
              <InputField
                placeholder="e.g. 10 kg"
                value={reorderLevel}
                onChange={setReorderLevel}
              />
            </div>
          </div>

          {/* Grocery-Specific section — slightly lighter cream with rounded border */}
          <div className="rounded-xl border border-[#8aaa70] bg-[#d8dca8] p-3.5">
            <p className="mb-3 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#1a3a0a]">
              Grocery-Specific
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.08em] text-[#1a3a0a]">
                  Supplier Name
                </label>
                {/* Supplier Name — darker green fill like dropdowns */}
                <div className="rounded-lg bg-[#4a6e3a] px-3 py-2.5">
                  <input
                    type="text"
                    placeholder="Al-Madina Traders"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    className="w-full bg-transparent text-[13px] font-semibold text-white placeholder-[#b0c898] outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.08em] text-[#1a3a0a]">
                  Expiry Date
                </label>
                {/* Expiry Date — cream background with border */}
                <div className="flex items-center gap-2 rounded-lg border border-[#8aaa70] bg-[#e8e8c0] px-3 py-2.5">
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="min-w-0 flex-1 bg-transparent text-[13px] text-[#1a3a0a] outline-none [color-scheme:light]"
                  />
                  <CalendarDays size={14} className="shrink-0 text-[#3a6a2a]" />
                </div>
              </div>
            </div>
          </div>

          {/* Barcode */}
          <div>
            <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#1a3a0a]">
              Barcode
            </label>
            <div className="flex items-center gap-2">
              {/* Barcode text input — muted green fill */}
              <div className="flex flex-1 items-center gap-2 rounded-lg bg-[#7a9e6a] px-3.5 py-2.5">
                <input
                  type="text"
                  placeholder="Scan or enter barcode"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  className="min-w-0 flex-1 bg-transparent text-[13px] text-white placeholder-[#c8dab8] outline-none"
                />
              </div>
              {/* Scanner button — cream with border */}
              <button
                type="button"
                onClick={() => setShowScanner(true)}
                className="shrink-0 rounded-lg border border-[#5a7a4a] bg-[#e8e8c0] p-2.5 text-[#1a3a0a] transition hover:bg-[#d8d8a8]"
              >
                <ScanBarcode size={18} />
              </button>
            </div>
          </div>

          {/* Action buttons — both dark green filled */}
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
              className="rounded-xl bg-[#3a5a28] py-3 text-[13px] font-extrabold text-white transition hover:bg-[#4a6a38]"
            >
              Add to Inventory
            </button>
          </div>
        </div>
      </div>

      {showScanner && (
        <BarcodeScannerModal
          onClose={() => setShowScanner(false)}
          onConfirm={handleBarcodeConfirm}
        />
      )}
    </div>
  );
}
