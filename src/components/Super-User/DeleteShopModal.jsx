import React from 'react';
import { Trash2 } from 'lucide-react';

export default function DeleteShopModal({ shop, onClose, onDelete }) {
  if (!shop) return null;

  const handleConfirm = () => {
    if (onDelete) {
      onDelete(shop.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-[#efeacb] rounded-[24px] border border-[#bfbc9b] p-8 w-full max-w-[440px] shadow-2xl flex flex-col text-[#152f16] gap-5 animate-in fade-in zoom-in duration-200">

        {/* Trash Icon */}
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#e6e2c3] text-[#8c1d1d]">
          <Trash2 size={32} strokeWidth={2.5} />
        </div>

        {/* Header */}
        <div>
          <h3 className="text-3xl font-bold font-serif text-[#152f16] leading-tight">
            Delete this account permanently?
          </h3>
          <p className="text-sm font-semibold text-[#55694a] mt-2.5 leading-relaxed">
            This removes {shop.business}, its billing history, and all POS data. This cannot be undone.
          </p>
        </div>



        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 bg-[#fdfcf3] border border-[#0d3b1b]/60 text-[#0d3b1b] text-base font-bold rounded-xl hover:bg-neutral-50 active:scale-[0.98] transition-all cursor-pointer text-center leading-none"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="w-full py-3.5 bg-[#f5ccb1] border border-[#d09d82] text-[#9c3a1a] text-base font-bold rounded-xl hover:bg-[#fadfcb] active:scale-[0.98] transition-all cursor-pointer text-center leading-none"
          >
            Delete Permanently
          </button>
        </div>
      </div>
    </div>
  );
}
