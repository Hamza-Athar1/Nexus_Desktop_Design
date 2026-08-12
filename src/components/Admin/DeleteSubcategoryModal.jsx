import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

/**
 * DeleteSubcategoryModal - Confirmation modal for deleting a subcategory.
 * Matches Screenshot 6 in the design spec.
 */
export default function DeleteSubcategoryModal({ isOpen, onClose, subcategory, onDelete }) {
  if (!isOpen || !subcategory) return null;

  const handleConfirm = () => {
    if (onDelete) {
      onDelete(subcategory.id);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs select-none animate-in fade-in duration-150">
      {/* Backdrop */}
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

        {/* Content */}
        <div className="flex flex-col items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-100 border border-red-200 text-red-700 flex items-center justify-center shadow-xs">
            <AlertTriangle size={20} />
          </div>

          <div className="flex flex-col gap-1.5">
            <h3 className="text-xl font-black text-[#8b1e1e] tracking-tight">
              Delete Subcategory?
            </h3>
            <p className="text-xs font-semibold text-[#0c3818]/80 leading-relaxed">
              Are you sure you want to delete <span className="font-extrabold text-[#0c3818]">"{subcategory.name}"</span>? This action will permanently remove this subcategory. Associated items may be unassigned.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#0c3818]/10">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-white border border-[#0c3818]/30 hover:bg-gray-50 text-[#0c3818] text-xs font-extrabold rounded-xl transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-6 py-2.5 bg-[#8b1e1e] hover:bg-[#a92525] text-white text-xs font-extrabold rounded-xl transition shadow-md hover:shadow-lg cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
