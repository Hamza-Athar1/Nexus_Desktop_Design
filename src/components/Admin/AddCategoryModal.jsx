import React, { useState, useRef } from 'react';
import { X, Upload } from 'lucide-react';

export default function AddCategoryModal({ isOpen, onClose, onSave }) {
  const [categoryName, setCategoryName] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!categoryName.trim()) return;
    if (onSave) {
      onSave({
        name: categoryName.trim(),
        image: imagePreview
      });
    }
    // Reset and close
    setCategoryName('');
    setImagePreview(null);
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

        {/* Modal Header */}
        <div className="flex flex-col gap-1 pr-6">
          <h3 className="text-xl font-black text-[#0c3818]">Add New Category</h3>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Category Name Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-[#0c3818]">
              Category Name<span className="text-red-500 ml-0.5">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Enter category name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="w-full bg-white border border-[#0c3818]/25 rounded-xl px-4 py-2.5 text-xs font-bold text-[#0c3818] placeholder-gray-400 focus:outline-none focus:border-[#0c3818]"
            />
          </div>

          {/* Category Image Area */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-[#0c3818]">
              Category Image<span className="text-red-500 ml-0.5">*</span>
            </label>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-48 h-44 border-2 border-[#0c3818] rounded-2xl bg-[#0c3818] text-[#efeacb] hover:bg-[#114720] flex flex-col items-center justify-center p-4 cursor-pointer transition text-center mx-auto relative overflow-hidden group shadow-sm"
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
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center rounded-xl">
                    <span className="text-white text-xs font-bold bg-[#0c3818] px-3 py-1 rounded-md">Change</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                    <Upload size={24} className="text-[#efeacb]" />
                  </div>
                  <div className="flex flex-col items-center text-[11px] leading-tight font-bold">
                    <span>Click to upload image</span>
                    <span className="text-[10px] opacity-75 font-semibold mt-0.5">PNG, JPG up to 2MB</span>
                  </div>
                </div>
              )}
            </div>
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
