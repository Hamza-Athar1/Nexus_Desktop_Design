import { useState } from 'react';
import BarcodeScanModal from './BarcodeScanModal';
import { ShoppingCart, X, ChevronDown, ScanBarcode } from 'lucide-react';
const CATEGORIES = ["Men's wear", "Women's wear", "Kids' wear", "Accessories"];
const BRANDS = ['Salt', 'Outfitters', 'Khaadi', 'Sana Safinaz', 'Custom'];
const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const COLORS = [
    { id: 'green', hex: '#63b361' },
    { id: 'dark-navy', hex: '#262f3d' },
    { id: 'red', hex: '#ea4335' },
    { id: 'blue', hex: '#1a73e8' },
];

function SelectField({ value, onChange, options }) {
    return (
        <div className="relative">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full appearance-none rounded-lg bg-[#5b7f4b] px-3.5 py-2.5 pr-9 text-[13px] font-semibold text-white outline-none cursor-pointer"
            >
                {options.map((o) => (
                    <option key={o} value={o} className="bg-[#415e34]">
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

export default function AddClothingModal({ onClose, onConfirm }) {
    const [productName, setProductName] = useState('');
    const [category, setCategory] = useState("Men's wear");
    const [brand, setBrand] = useState('Salt');
    const [salePrice, setSalePrice] = useState('');
    const [costPrice, setCostPrice] = useState('');
    const [stock, setStock] = useState('');
    const [lowStockLimit, setLowStockLimit] = useState('');
    const [selectedSizes, setSelectedSizes] = useState(['S', 'M', 'L']);
    const [selectedColors, setSelectedColors] = useState(['green', 'dark-navy', 'red', 'blue']);
    const [barcode, setBarcode] = useState('');
    const [showScanner, setShowScanner] = useState(false);

    const toggleSize = (size) => {
        if (selectedSizes.includes(size)) {
            setSelectedSizes(selectedSizes.filter((s) => s !== size));
        } else {
            setSelectedSizes([...selectedSizes, size]);
        }
    };

    const toggleColor = (colorId) => {
        if (selectedColors.includes(colorId)) {
            setSelectedColors(selectedColors.filter((c) => c !== colorId));
        } else {
            setSelectedColors([...selectedColors, colorId]);
        }
    };

    const handleBarcodeConfirm = (result) => {
        if (result?.name) setBarcode(result.name);
    };

    const handleAdd = () => {
        if (onConfirm) {
            onConfirm({
                name: productName,
                category,
                brand,
                price: salePrice,
                cost: costPrice,
                stock,
                lowStockLimit,
                sizes: selectedSizes,
                colors: selectedColors,
                barcode,
            });
        }
        if (onClose) onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={onClose}
        >
            <div
                className="relative flex w-full max-w-[430px] flex-col rounded-2xl bg-[#eff1cc] p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between pb-3">
                    <div className="flex items-center gap-2.5">
                        <ShoppingCart size={18} className="text-[#1a3d13]" />
                        <span className="text-[13px] font-extrabold uppercase tracking-[0.12em] text-[#1a3d13]">
                            Add Product - Clothing
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-[#5b7f4b]/50 px-3 py-1.5 text-[#1a3d13] transition hover:bg-[#dde0b5]"
                    >
                        <X size={14} />
                    </button>
                </div>

                {/* Divider line */}
                <div className="mb-4 border-t border-[#1a3d13]" />

                {/* Form container */}
                <div className="flex flex-col gap-3.5">
                    {/* Product Name */}
                    <div>
                        <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#1a3d13]">
                            Product Name
                        </label>
                        <div className="flex items-center gap-2 rounded-lg bg-[#5b7f4b] px-3.5 py-2.5">
                            <input
                                type="text"
                                placeholder="e.g.  Men's Polo Shirt"
                                value={productName}
                                onChange={(e) => setProductName(e.target.value)}
                                className="min-w-0 flex-1 bg-transparent text-[13px] font-semibold text-white placeholder-[#cad9c5] outline-none"
                            />
                        </div>
                    </div>

                    {/* Category & Brand */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#1a3d13]">
                                Category
                            </label>
                            <SelectField value={category} onChange={setCategory} options={CATEGORIES} />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#1a3d13]">
                                Brand
                            </label>
                            <SelectField value={brand} onChange={setBrand} options={BRANDS} />
                        </div>
                    </div>

                    {/* Sale Price & Cost Price */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#1a3d13]">
                                Sale Price
                            </label>
                            <div className="flex items-center gap-2 rounded-lg bg-[#5b7f4b] px-3.5 py-2.5">
                                <input
                                    type="text"
                                    placeholder="Rs 1,200"
                                    value={salePrice}
                                    onChange={(e) => setSalePrice(e.target.value)}
                                    className="min-w-0 flex-1 bg-transparent text-[13px] font-semibold text-white placeholder-[#cad9c5] outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#1a3d13]">
                                Cost Price
                            </label>
                            <div className="flex items-center gap-2 rounded-lg bg-[#5b7f4b] px-3.5 py-2.5">
                                <input
                                    type="text"
                                    placeholder="Rs 700"
                                    value={costPrice}
                                    onChange={(e) => setCostPrice(e.target.value)}
                                    className="min-w-0 flex-1 bg-transparent text-[13px] font-semibold text-white placeholder-[#cad9c5] outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Stock Per Variant & Low Stock Alert */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#1a3d13]">
                                Stock Per Variant
                            </label>
                            <div className="flex items-center gap-2 rounded-lg bg-[#5b7f4b] px-3.5 py-2.5">
                                <input
                                    type="text"
                                    placeholder="e.g. 50"
                                    value={stock}
                                    onChange={(e) => setStock(e.target.value)}
                                    className="min-w-0 flex-1 bg-transparent text-[13px] font-semibold text-white placeholder-[#cad9c5] outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#1a3d13]">
                                Low Stock Alert At
                            </label>
                            <div className="flex items-center gap-2 rounded-lg bg-[#5b7f4b] px-3.5 py-2.5">
                                <input
                                    type="text"
                                    placeholder="e.g. 5 per variant"
                                    value={lowStockLimit}
                                    onChange={(e) => setLowStockLimit(e.target.value)}
                                    className="min-w-0 flex-1 bg-transparent text-[13px] font-semibold text-white placeholder-[#cad9c5] outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Clothing Specific (Sizes & Colors) */}
                    <div className="rounded-xl border border-[#9bba8b] bg-[#dee1bb] p-3.5">
                        <div>
                            <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#1a3d13]">
                                Clothing-Specific: Sizes
                            </label>
                            <div className="flex gap-2">
                                {SIZES.map((size) => {
                                    const isSelected = selectedSizes.includes(size);
                                    return (
                                        <button
                                            key={size}
                                            type="button"
                                            onClick={() => toggleSize(size)}
                                            className={`flex h-8 w-11 items-center justify-center rounded border text-xs font-bold transition-all ${isSelected
                                                ? 'border-[#1a3d13] bg-[#1a3d13] text-white'
                                                : 'border-[#1a3d13]/40 bg-transparent text-[#1a3d13]'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="mt-3">
                            <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#1a3d13]">
                                Colors Available
                            </label>
                            <div className="flex gap-3">
                                {COLORS.map((col) => {
                                    const isSelected = selectedColors.includes(col.id);
                                    return (
                                        <button
                                            key={col.id}
                                            type="button"
                                            onClick={() => toggleColor(col.id)}
                                            className={`h-6 w-6 rounded-full border transition-all ${isSelected
                                                ? 'border-[#1a3d13] scale-110 ring-2 ring-[#1a3d13]/30'
                                                : 'border-transparent opacity-60 hover:opacity-100'
                                                }`}
                                            style={{ backgroundColor: col.hex }}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Barcode */}
                    <div>
                        <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#1a3d13]">
                            Barcode
                        </label>
                        <div className="flex items-center gap-2">
                            <div className="flex flex-1 items-center gap-2 rounded-lg bg-[#5b7f4b] px-3.5 py-2.5">
                                <input
                                    type="text"
                                    placeholder="Scan or enter barcode"
                                    value={barcode}
                                    onChange={(e) => setBarcode(e.target.value)}
                                    className="min-w-0 flex-1 bg-transparent text-[13px] text-white placeholder-[#cad9c5] outline-none"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowScanner(true)}
                                className="shrink-0 rounded-lg border border-[#5b7f4b] bg-transparent p-2.5 text-[#1a3d13] transition hover:bg-[#dde0b5]"
                            >
                                <ScanBarcode size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-1 grid grid-cols-2 gap-3.5">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border-2 border-[#1a3d13] py-2.5 text-sm font-extrabold text-[#1a3d13] hover:bg-[#1a3d13]/5 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleAdd}
                            className="rounded-xl bg-[#1a3d13] py-2.5 text-sm font-extrabold text-white hover:bg-[#27541e] transition-colors"
                        >
                            Add Product
                        </button>
                    </div>
                </div>
            </div>

            {showScanner && (
                <BarcodeScanModal
                    onClose={() => setShowScanner(false)}
                    onConfirm={handleBarcodeConfirm}
                />
            )}
        </div>
    );
}
