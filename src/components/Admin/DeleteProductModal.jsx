import React from 'react';

export default function DeleteProductModal({ isOpen, onClose, onConfirm, productName }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-[#f2ebd4] border border-[#0c3818]/20 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header Bar */}
        <div className="px-6 py-3.5 border-b border-[#0c3818]/15 bg-transparent">
          <h3 className="text-base font-extrabold text-[#a61c1c] tracking-wide">
            Delete Product
          </h3>
        </div>

        {/* Content Body */}
        <div className="p-6 flex flex-col items-center justify-center gap-6 text-center">
          <p className="text-sm font-black text-[#0c3818] leading-snug">
            Are you sure you want to delete {productName ? `"${productName}"` : 'this product'}?
          </p>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4 w-full">
            {/* Yes Button (Light green pill style matching screenshot) */}
            <button
              type="button"
              onClick={onConfirm}
              className="px-7 py-1.5 bg-[#c5e0b4] hover:bg-[#b3d69f] border border-[#385723]/30 text-[#0c3818] text-xs font-black rounded-lg transition duration-150 cursor-pointer min-w-[80px]"
            >
              Yes
            </button>

            {/* No Button (Light reddish-pink pill style matching screenshot) */}
            <button
              type="button"
              onClick={onClose}
              className="px-7 py-1.5 bg-[#fce4d6] hover:bg-[#f8d7c4] border border-[#c65911]/30 text-[#a61c1c] text-xs font-black rounded-lg transition duration-150 cursor-pointer min-w-[80px]"
            >
              No
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
