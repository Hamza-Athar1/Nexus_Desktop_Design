import React, { useState, useRef } from 'react';
import { Upload, ChevronDown, ChevronUp } from 'lucide-react';

export default function AddProductForm({ onCancel, onSave, categories = ['Meat & Fish', 'Fruits & Vegetables', 'Bread & Baked', 'Frozen Food'] }) {
  const [formData, setFormData] = useState({
    category: '',
    name: '',
    purchasePrice: '',
    sellingPrice: '',
    stockQuantity: '',
    minStockLevel: '',
    image: null,
  });

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) {
      onSave({
        ...formData,
        imagePreview: imagePreview || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=150&auto=format&fit=crop&q=60'
      });
    }
  };

  return (
    <div className="flex flex-col gap-6 2xl:gap-8 w-full max-w-5xl 2xl:max-w-7xl mx-auto pb-10">
      {/* Top Header Title */}
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl 2xl:text-4xl font-black text-[#0c3818]">Add New Products</h2>
        <p className="text-xs 2xl:text-sm text-[#0c3818]/60 font-semibold">Fill in the product details below</p>
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
                  {categories.map((cat) => (
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
                  ))}
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

            {/* Stock Quantity Pair */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 2xl:gap-6">
              {/* Stock Quantity */}
              <div className="flex flex-col gap-1.5 2xl:gap-2">
                <label className="text-xs 2xl:text-sm font-black text-[#0c3818]">
                  Stock Quantity<span className="text-red-500 ml-0.5">*</span>
                </label>
                <input
                  type="number"
                  required
                  placeholder="Enter stock quantity"
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
                  required
                  placeholder="Enter min stock level"
                  value={formData.minStockLevel}
                  onChange={(e) => handleChange('minStockLevel', e.target.value)}
                  className="w-full bg-white border border-[#0c3818]/25 rounded-xl px-4 py-2.5 2xl:px-5 2xl:py-3.5 text-xs 2xl:text-sm font-bold text-[#0c3818] placeholder-gray-400 focus:outline-none focus:border-[#0c3818]"
                />
              </div>
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

