import React, { useState, useEffect } from 'react';
import { X, Layers } from 'lucide-react';

/**
 * EditSubcategoryModal - Modal for updating an existing subcategory name.
 * Matches Screenshot 3 in the design spec.
 */
export default function EditSubcategoryModal({ isOpen, onClose, subcategory, onSave }) {
  const [name, setName] = useState('');

  useEffect(() => {
    if (subcategory) {
      setName(subcategory.name || '');
    }
  }, [subcategory]);

  if (!isOpen || !subcategory) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (onSave) {
      onSave(subcategory.id, name.trim());
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs select-none animate-in fade-in duration-150">
      {/* Backdrop click to close */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative bg-[#fbf9f0] border border-[#0c3818]/20 rounded-3xl w-full max-w-md p-6 sm:p-7 shadow-2xl flex flex-col gap-5 text-[#0c3818] z-10">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 p-1 rounded-full text-[#0c3818]/60 hover:text-[#0c3818] hover:bg-[#efeacb] transition cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex flex-col gap-1 pr-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#0c3818] text-[#efeacb] flex items-center justify-center font-bold text-sm shadow-sm">
              <Layers size={16} />
            </div>
            <h3 className="text-xl font-extrabold tracking-tight text-[#0c3818]">Edit Subcategory</h3>
          </div>
          <p className="text-xs text-[#0c3818]/70 font-semibold mt-1">
            Update subcategory title and settings
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-[#0c3818]">
              Subcategory Name<span className="text-red-500 ml-0.5">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Oil & Ghee"
              className="w-full bg-white border border-[#0c3818]/25 rounded-xl px-4 py-3 text-xs font-bold text-[#0c3818] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0c3818]/40 shadow-xs"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#0c3818]/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-white border border-[#0c3818]/30 hover:bg-gray-50 text-[#0c3818] text-xs font-extrabold rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#0c3818] hover:bg-[#114720] text-[#efeacb] text-xs font-extrabold rounded-xl transition shadow-md hover:shadow-lg cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
