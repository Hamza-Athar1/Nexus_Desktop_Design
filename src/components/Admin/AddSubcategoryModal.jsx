import React, { useState } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';

export default function AddSubcategoryModal({ isOpen, onClose, onSave, categories = ['Grocery & Dairy', 'Fruit & Vegetables', 'Meat & Fish', 'Beverages'] }) {
  const [parentCategory, setParentCategory] = useState('');
  const [subcategoryName, setSubcategoryName] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!parentCategory || !subcategoryName.trim()) return;
    if (onSave) {
      onSave({
        parentCategory,
        name: subcategoryName.trim(),
      });
    }
    // Reset and close
    setParentCategory('');
    setSubcategoryName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-[#fbf9f0] border border-[#0c3818]/20 rounded-3xl w-full max-w-md p-6 sm:p-7 shadow-2xl relative flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Close Icon Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 p-1 rounded-full text-[#0c3818]/60 hover:text-[#0c3818] hover:bg-[#efeacb] transition cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Modal Title & Subtitle */}
        <div className="flex flex-col gap-1 pr-6">
          <h3 className="text-xl font-black text-[#0c3818]">Add New Subcategory</h3>
          <p className="text-xs font-semibold text-[#0c3818]/60">Create a subcategory under an existing category</p>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Parent Category Field */}
          <div className="flex flex-col gap-1.5 relative">
            <label className="text-xs font-black text-[#0c3818]">
              Parent Category<span className="text-red-500 ml-0.5">*</span>
            </label>
            
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full bg-white border border-[#0c3818]/25 rounded-xl px-4 py-2.5 text-xs font-bold text-left flex items-center justify-between text-[#0c3818] focus:outline-none focus:border-[#0c3818]"
            >
              <span className={parentCategory ? 'text-[#0c3818]' : 'text-gray-400'}>
                {parentCategory || 'Select Category'}
              </span>
              {dropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {dropdownOpen && (
              <div className="absolute left-0 top-full mt-1 w-full bg-white border border-[#0c3818]/20 rounded-xl shadow-lg z-30 overflow-hidden flex flex-col divide-y divide-gray-100">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setParentCategory(cat);
                      setDropdownOpen(false);
                    }}
                    className={`px-4 py-2.5 text-left text-xs font-bold text-[#0c3818] hover:bg-[#efeacb]/40 transition cursor-pointer ${
                      parentCategory === cat ? 'bg-[#0c3818]/10' : ''
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Subcategory Name Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-[#0c3818]">
              Subcategory Name<span className="text-red-500 ml-0.5">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Rice, Flour & Grains"
              value={subcategoryName}
              onChange={(e) => setSubcategoryName(e.target.value)}
              className="w-full bg-white border border-[#0c3818]/25 rounded-xl px-4 py-2.5 text-xs font-bold text-[#0c3818] placeholder-gray-400 focus:outline-none focus:border-[#0c3818]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-white border border-[#0c3818]/30 hover:bg-gray-50 text-[#0c3818] text-xs font-extrabold rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#0c3818] hover:bg-[#114720] text-[#efeacb] hover:text-white text-xs font-extrabold rounded-xl transition cursor-pointer"
            >
              Save Subcategory
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
