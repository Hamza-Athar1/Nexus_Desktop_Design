import React, { useState, useRef } from 'react';
import { Upload, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AddProductForm({ onCancel, onSave, categories = [] }) {
  const { user } = useAuth();
  const moduleCode = user?.moduleCode || user?.businessModule || '';

  const [formData, setFormData] = useState({
    category: '',
    name: '',
    sku: '',
    barcode: '',
    unit: moduleCode === 'grocery' ? 'kg' : 'pcs',
    purchasePrice: '',
    sellingPrice: '',
    stockQuantity: '',
    minStockLevel: '',
    image: null,
    // Vertical fields
    brand: '',
    expiry_date: '',
    batch_no: '',
    manufacturer: '',
    generic_name: '',
    model_number: '',
    serial_number: '',
    warranty_months: '',
    baked_on: '',
    contains_allergens: '',
    course_type: 'main',
    preparation_minutes: '',
    is_vegetarian: false,
    package_size: '',
  });

  const [clothingVariants, setClothingVariants] = useState([
    { size: 'S', color: 'Black', sku: '', barcode: '', stock: 5, price: '' },
    { size: 'M', color: 'Black', sku: '', barcode: '', stock: 8, price: '' },
  ]);

  const [imagePreview, setImagePreview] = useState(null);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleVariantChange = (index, field, value) => {
    setClothingVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  };

  const addVariantRow = () => {
    setClothingVariants((prev) => [
      ...prev,
      { size: 'L', color: 'Black', sku: '', barcode: '', stock: 0, price: '' },
    ]);
  };

  const removeVariantRow = (index) => {
    setClothingVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) {
      const moduleFields = {};
      if (formData.brand) moduleFields.brand = formData.brand;
      if (formData.expiry_date) moduleFields.expiry_date = formData.expiry_date;
      if (formData.batch_no) moduleFields.batch_no = formData.batch_no;
      if (formData.manufacturer) moduleFields.manufacturer = formData.manufacturer;
      if (formData.generic_name) moduleFields.generic_name = formData.generic_name;
      if (formData.model_number) moduleFields.model_number = formData.model_number;
      if (formData.serial_number) moduleFields.serial_number = formData.serial_number;
      if (formData.warranty_months) moduleFields.warranty_months = formData.warranty_months;
      if (formData.baked_on) moduleFields.baked_on = formData.baked_on;
      if (formData.contains_allergens) moduleFields.contains_allergens = formData.contains_allergens;
      if (formData.course_type) moduleFields.course_type = formData.course_type;
      if (formData.preparation_minutes) moduleFields.preparation_minutes = formData.preparation_minutes;
      if (formData.is_vegetarian) moduleFields.is_vegetarian = formData.is_vegetarian;
      if (formData.package_size) moduleFields.package_size = formData.package_size;

      onSave({
        ...formData,
        moduleSpecificFields: moduleFields,
        variants: moduleCode === 'clothing' ? clothingVariants : [],
        imagePreview: imagePreview || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=150&auto=format&fit=crop&q=60'
      });
    }
  };

  return (
    <div className="flex flex-col gap-6 2xl:gap-8 w-full max-w-5xl 2xl:max-w-7xl mx-auto pb-10">
      {/* Top Header Title */}
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl 2xl:text-4xl font-black text-[#0c3818]">Add New Products ({moduleCode.toUpperCase()})</h2>
        <p className="text-xs 2xl:text-sm text-[#0c3818]/60 font-semibold">Fill in the product details and module attributes below</p>
      </div>

      {/* Main Container Card */}
      <div className="bg-[#fbf9f0]/90 border border-[#0c3818]/15 rounded-3xl p-6 sm:p-10 2xl:p-14 shadow-xs">
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-8 2xl:gap-14 items-start">
          {/* Left Column: Image Upload Area */}
          <div className="flex flex-col items-center gap-2 w-full md:w-64 2xl:w-80 shrink-0">
            <label className="self-start text-sm 2xl:text-base font-black text-[#0c3818] mb-1">
              Product Image
            </label>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-56 2xl:h-72 border-2 border-dashed border-[#0c3818]/25 rounded-2xl bg-white/60 hover:bg-white flex flex-col items-center justify-center p-4 cursor-pointer transition text-center group relative overflow-hidden"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/png, image/jpeg, image/jpg"
                className="hidden"
              />

              {imagePreview ? (
                <div className="w-full h-full flex flex-col items-center justify-center relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-contain rounded-xl"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center rounded-xl">
                    <span className="text-white text-xs 2xl:text-sm font-bold bg-[#0c3818] px-3 py-1.5 rounded-lg">Change Image</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 text-[#0c3818]/50 group-hover:text-[#0c3818]">
                  <div className="w-14 h-14 2xl:w-16 2xl:h-16 rounded-full bg-[#efeacb]/60 flex items-center justify-center">
                    <Upload size={28} className="text-[#0c3818]/70 2xl:w-8 2xl:h-8" />
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-xs 2xl:text-sm font-extrabold text-[#0c3818]">Click to upload image</span>
                    <span className="text-[11px] 2xl:text-xs font-semibold text-[#0c3818]/50">PNG, JPG up to 2MB</span>
                  </div>
                </div>
              )}
            </div>
            {imagePreview && (
              <span className="text-[11px] 2xl:text-xs font-semibold text-[#0c3818]/60 mt-1">
                Click to change image
              </span>
            )}
          </div>

          {/* Right Column: Inputs Form Grid */}
          <div className="flex-1 flex flex-col gap-5 2xl:gap-7 w-full">
            {/* Category Dropdown */}
            <div className="flex flex-col gap-1.5 2xl:gap-2 relative">
              <label className="text-xs 2xl:text-sm font-black text-[#0c3818]">Category</label>
              <button
                type="button"
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                className="w-full bg-white border border-[#0c3818]/25 rounded-xl px-4 py-2.5 2xl:px-5 2xl:py-3.5 text-xs 2xl:text-sm font-bold text-left flex items-center justify-between text-[#0c3818] focus:outline-none focus:border-[#0c3818]"
              >
                <span className={formData.category ? 'text-[#0c3818]' : 'text-gray-400'}>
                  {formData.category || 'Select Category'}
                </span>
                {categoryDropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {categoryDropdownOpen && (
                <div className="absolute left-0 top-full mt-1 w-full bg-white border border-[#0c3818]/20 rounded-xl shadow-lg z-30 overflow-hidden flex flex-col divide-y divide-gray-100">
                  {categories.length > 0 ? (
                    categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          handleChange('category', cat);
                          setCategoryDropdownOpen(false);
                        }}
                        className="px-4 py-2.5 2xl:px-5 2xl:py-3.5 text-left text-xs 2xl:text-sm font-bold text-[#0c3818] hover:bg-[#efeacb]/40 transition cursor-pointer"
                      >
                        {cat}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-xs font-semibold text-gray-500 italic">
                      No categories available
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Product Name */}
            <div className="flex flex-col gap-1.5 2xl:gap-2">
              <label className="text-xs 2xl:text-sm font-black text-[#0c3818]">
                Product Name<span className="text-red-500 ml-0.5">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Enter Product name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full bg-white border border-[#0c3818]/25 rounded-xl px-4 py-2.5 2xl:px-5 2xl:py-3.5 text-xs 2xl:text-sm font-bold text-[#0c3818] placeholder-gray-400 focus:outline-none focus:border-[#0c3818]"
              />
            </div>

            {/* SKU and Barcode Pair */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 2xl:gap-6">
              <div className="flex flex-col gap-1.5 2xl:gap-2">
                <label className="text-xs 2xl:text-sm font-black text-[#0c3818]">SKU</label>
                <input
                  type="text"
                  placeholder="Auto-generated if empty"
                  value={formData.sku}
                  onChange={(e) => handleChange('sku', e.target.value)}
                  className="w-full bg-white border border-[#0c3818]/25 rounded-xl px-4 py-2.5 2xl:px-5 2xl:py-3.5 text-xs 2xl:text-sm font-bold text-[#0c3818] placeholder-gray-400 focus:outline-none focus:border-[#0c3818]"
                />
              </div>
              <div className="flex flex-col gap-1.5 2xl:gap-2">
                <label className="text-xs 2xl:text-sm font-black text-[#0c3818]">Barcode</label>
                <input
                  type="text"
                  placeholder="Scan or enter barcode"
                  value={formData.barcode}
                  onChange={(e) => handleChange('barcode', e.target.value)}
                  className="w-full bg-white border border-[#0c3818]/25 rounded-xl px-4 py-2.5 2xl:px-5 2xl:py-3.5 text-xs 2xl:text-sm font-bold text-[#0c3818] placeholder-gray-400 focus:outline-none focus:border-[#0c3818]"
                />
              </div>
            </div>

            {/* Price Pair */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 2xl:gap-6">
              {/* Purchase Price */}
              <div className="flex flex-col gap-1.5 2xl:gap-2">
                <label className="text-xs 2xl:text-sm font-black text-[#0c3818]">Purchase Price (PKR)</label>
                <input
                  type="number"
                  placeholder="Enter purchase price"
                  value={formData.purchasePrice}
                  onChange={(e) => handleChange('purchasePrice', e.target.value)}
                  className="w-full bg-white border border-[#0c3818]/25 rounded-xl px-4 py-2.5 2xl:px-5 2xl:py-3.5 text-xs 2xl:text-sm font-bold text-[#0c3818] placeholder-gray-400 focus:outline-none focus:border-[#0c3818]"
                />
              </div>

              {/* Selling Price */}
              <div className="flex flex-col gap-1.5 2xl:gap-2">
                <label className="text-xs 2xl:text-sm font-black text-[#0c3818]">
                  Selling Price (PKR)<span className="text-red-500 ml-0.5">*</span>
                </label>
                <input
                  type="number"
                  required
                  placeholder="Enter selling price"
                  value={formData.sellingPrice}
                  onChange={(e) => handleChange('sellingPrice', e.target.value)}
                  className="w-full bg-white border border-[#0c3818]/25 rounded-xl px-4 py-2.5 2xl:px-5 2xl:py-3.5 text-xs 2xl:text-sm font-bold text-[#0c3818] placeholder-gray-400 focus:outline-none focus:border-[#0c3818]"
                />
              </div>
            </div>

            {/* Stock Quantity Pair & Unit */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 2xl:gap-6">
              {/* Stock Quantity */}
              <div className="flex flex-col gap-1.5 2xl:gap-2">
                <label className="text-xs 2xl:text-sm font-black text-[#0c3818]">
                  Stock Quantity<span className="text-red-500 ml-0.5">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="e.g. 50 or 2.5"
                  value={formData.stockQuantity}
                  onChange={(e) => handleChange('stockQuantity', e.target.value)}
                  className="w-full bg-white border border-[#0c3818]/25 rounded-xl px-4 py-2.5 2xl:px-5 2xl:py-3.5 text-xs 2xl:text-sm font-bold text-[#0c3818] placeholder-gray-400 focus:outline-none focus:border-[#0c3818]"
                />
              </div>

              {/* Minimum Stock Level */}
              <div className="flex flex-col gap-1.5 2xl:gap-2">
                <label className="text-xs 2xl:text-sm font-black text-[#0c3818]">
                  Minimum Stock Level<span className="text-red-500 ml-0.5">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="Enter min stock level"
                  value={formData.minStockLevel}
                  onChange={(e) => handleChange('minStockLevel', e.target.value)}
                  className="w-full bg-white border border-[#0c3818]/25 rounded-xl px-4 py-2.5 2xl:px-5 2xl:py-3.5 text-xs 2xl:text-sm font-bold text-[#0c3818] placeholder-gray-400 focus:outline-none focus:border-[#0c3818]"
                />
              </div>

              {/* Unit Selection */}
              <div className="flex flex-col gap-1.5 2xl:gap-2">
                <label className="text-xs 2xl:text-sm font-black text-[#0c3818]">Measurement Unit</label>
                <select
                  value={formData.unit}
                  onChange={(e) => handleChange('unit', e.target.value)}
                  className="w-full bg-white border border-[#0c3818]/25 rounded-xl px-4 py-2.5 2xl:px-5 2xl:py-3.5 text-xs 2xl:text-sm font-bold text-[#0c3818] outline-none"
                >
                  <option value="pcs">Pieces (pcs)</option>
                  <option value="kg">Kilogram (kg)</option>
                  <option value="g">Gram (g)</option>
                  <option value="litre">Litre (L)</option>
                  <option value="ml">Millilitre (ml)</option>
                  <option value="dozen">Dozen</option>
                  <option value="pack">Pack</option>
                </select>
              </div>
            </div>

            {/* ── VERTICAL SPECIFIC FIELDS ── */}
            <div className="border-t border-[#0c3818]/15 pt-5 flex flex-col gap-4">
              <h3 className="text-sm font-black text-[#0c3818] uppercase tracking-wide">
                Module-Specific Attributes ({moduleCode})
              </h3>

              {moduleCode === 'grocery' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-black text-[#0c3818]">Brand</label>
                    <input
                      type="text"
                      placeholder="e.g. Nestle, Olpers"
                      value={formData.brand}
                      onChange={(e) => handleChange('brand', e.target.value)}
                      className="w-full bg-white border border-[#0c3818]/25 rounded-xl px-3 py-2 text-xs font-bold text-[#0c3818]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-black text-[#0c3818]">Expiry Date</label>
                    <input
                      type="date"
                      value={formData.expiry_date}
                      onChange={(e) => handleChange('expiry_date', e.target.value)}
                      className="w-full bg-white border border-[#0c3818]/25 rounded-xl px-3 py-2 text-xs font-bold text-[#0c3818]"
                    />
                  </div>
                </div>
              )}

              {moduleCode === 'pharmacy' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-black text-[#0c3818]">Generic Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Paracetamol"
                      value={formData.generic_name}
                      onChange={(e) => handleChange('generic_name', e.target.value)}
                      className="w-full bg-white border border-[#0c3818]/25 rounded-xl px-3 py-2 text-xs font-bold text-[#0c3818]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-black text-[#0c3818]">Batch Number</label>
                    <input
                      type="text"
                      placeholder="e.g. BATCH-9012"
                      value={formData.batch_no}
                      onChange={(e) => handleChange('batch_no', e.target.value)}
                      className="w-full bg-white border border-[#0c3818]/25 rounded-xl px-3 py-2 text-xs font-bold text-[#0c3818]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-black text-[#0c3818]">Expiry Date</label>
                    <input
                      type="date"
                      value={formData.expiry_date}
                      onChange={(e) => handleChange('expiry_date', e.target.value)}
                      className="w-full bg-white border border-[#0c3818]/25 rounded-xl px-3 py-2 text-xs font-bold text-[#0c3818]"
                    />
                  </div>
                </div>
              )}

              {moduleCode === 'electronics' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-black text-[#0c3818]">Brand</label>
                    <input
                      type="text"
                      placeholder="e.g. Samsung, Apple"
                      value={formData.brand}
                      onChange={(e) => handleChange('brand', e.target.value)}
                      className="w-full bg-white border border-[#0c3818]/25 rounded-xl px-3 py-2 text-xs font-bold text-[#0c3818]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-black text-[#0c3818]">Model Number</label>
                    <input
                      type="text"
                      placeholder="e.g. SM-G990B"
                      value={formData.model_number}
                      onChange={(e) => handleChange('model_number', e.target.value)}
                      className="w-full bg-white border border-[#0c3818]/25 rounded-xl px-3 py-2 text-xs font-bold text-[#0c3818]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-black text-[#0c3818]">Serial / IMEI</label>
                    <input
                      type="text"
                      placeholder="Optional serial tracking"
                      value={formData.serial_number}
                      onChange={(e) => handleChange('serial_number', e.target.value)}
                      className="w-full bg-white border border-[#0c3818]/25 rounded-xl px-3 py-2 text-xs font-bold text-[#0c3818]"
                    />
                  </div>
                </div>
              )}

              {moduleCode === 'clothing' && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-[#0c3818]">Clothing Variants (Size / Color / Stock)</label>
                    <button
                      type="button"
                      onClick={addVariantRow}
                      className="flex items-center gap-1 text-xs font-bold text-[#0c3818] bg-[#efeacb] px-3 py-1 rounded-lg hover:bg-[#e4ddb6]"
                    >
                      <Plus size={12} /> Add Variant
                    </button>
                  </div>
                  <div className="space-y-2">
                    {clothingVariants.map((varItem, idx) => (
                      <div key={idx} className="flex flex-wrap items-center gap-2 bg-white p-2.5 rounded-xl border border-[#0c3818]/20">
                        <input
                          type="text"
                          placeholder="Size (e.g. S, M, L)"
                          value={varItem.size}
                          onChange={(e) => handleVariantChange(idx, 'size', e.target.value)}
                          className="w-24 border border-gray-300 rounded-lg px-2 py-1 text-xs font-bold"
                        />
                        <input
                          type="text"
                          placeholder="Color (e.g. Black)"
                          value={varItem.color}
                          onChange={(e) => handleVariantChange(idx, 'color', e.target.value)}
                          className="w-28 border border-gray-300 rounded-lg px-2 py-1 text-xs font-bold"
                        />
                        <input
                          type="number"
                          placeholder="Stock"
                          value={varItem.stock}
                          onChange={(e) => handleVariantChange(idx, 'stock', e.target.value)}
                          className="w-24 border border-gray-300 rounded-lg px-2 py-1 text-xs font-bold"
                        />
                        <button
                          type="button"
                          onClick={() => removeVariantRow(idx)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {moduleCode === 'bakery' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-black text-[#0c3818]">Baked On</label>
                    <input
                      type="date"
                      value={formData.baked_on}
                      onChange={(e) => handleChange('baked_on', e.target.value)}
                      className="w-full bg-white border border-[#0c3818]/25 rounded-xl px-3 py-2 text-xs font-bold text-[#0c3818]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-black text-[#0c3818]">Allergens</label>
                    <input
                      type="text"
                      placeholder="e.g. Nuts, Dairy, Gluten"
                      value={formData.contains_allergens}
                      onChange={(e) => handleChange('contains_allergens', e.target.value)}
                      className="w-full bg-white border border-[#0c3818]/25 rounded-xl px-3 py-2 text-xs font-bold text-[#0c3818]"
                    />
                  </div>
                </div>
              )}

              {moduleCode === 'restaurant' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-black text-[#0c3818]">Course Type</label>
                    <select
                      value={formData.course_type}
                      onChange={(e) => handleChange('course_type', e.target.value)}
                      className="w-full bg-white border border-[#0c3818]/25 rounded-xl px-3 py-2 text-xs font-bold text-[#0c3818]"
                    >
                      <option value="starter">Starter</option>
                      <option value="main">Main Course</option>
                      <option value="dessert">Dessert</option>
                      <option value="beverage">Beverage</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-black text-[#0c3818]">Prep Time (mins)</label>
                    <input
                      type="number"
                      placeholder="e.g. 15"
                      value={formData.preparation_minutes}
                      onChange={(e) => handleChange('preparation_minutes', e.target.value)}
                      className="w-full bg-white border border-[#0c3818]/25 rounded-xl px-3 py-2 text-xs font-bold text-[#0c3818]"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-5">
                    <input
                      type="checkbox"
                      id="veg_check"
                      checked={formData.is_vegetarian}
                      onChange={(e) => handleChange('is_vegetarian', e.target.checked)}
                      className="w-4 h-4 text-[#0c3818] rounded"
                    />
                    <label htmlFor="veg_check" className="text-xs font-bold text-[#0c3818]">Vegetarian</label>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-4 2xl:gap-6 mt-6 2xl:mt-8">
              <button
                type="button"
                onClick={onCancel}
                className="px-8 py-2.5 2xl:px-10 2xl:py-3.5 bg-white border border-[#0c3818]/40 hover:bg-gray-50 text-[#0c3818] text-xs 2xl:text-sm font-extrabold rounded-xl transition cursor-pointer min-w-[110px] 2xl:min-w-[140px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-2.5 2xl:px-10 2xl:py-3.5 bg-[#0c3818] hover:bg-[#114720] text-[#efeacb] hover:text-white text-xs 2xl:text-sm font-extrabold rounded-xl transition cursor-pointer min-w-[130px] 2xl:min-w-[170px]"
              >
                Save Product
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}


