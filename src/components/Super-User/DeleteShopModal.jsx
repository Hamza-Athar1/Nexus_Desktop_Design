import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';

export default function DeleteShopModal({ shop, onClose, onDelete }) {
  const [confirmText, setConfirmText] = useState('');

  useEffect(() => {
    if (shop) {
      setConfirmText('');
    }
  }, [shop]);

  if (!shop) return null;

  const handleConfirm = () => {
    if (confirmText === 'DELETE' && onDelete) {
      onDelete(shop.id);
    }
  };

  const isDeleteDisabled = confirmText !== 'DELETE';

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

        {/* Inputs */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-bold text-[#152f16]">Type "DELETE" to confirm</label>
          <input
            type="text"
            placeholder="DELETE"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="w-full bg-[#fdfcf3] border border-[#c8c2a3]/60 rounded-xl px-4 py-3 text-sm text-[#152f16] font-semibold outline-none focus:ring-1 focus:ring-[#0d3b1b]/30 uppercase"
          />
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
            disabled={isDeleteDisabled}
            className="w-full py-3.5 bg-[#f5ccb1] border border-[#d09d82] text-[#9c3a1a] text-base font-bold rounded-xl hover:bg-[#fadfcb] active:scale-[0.98] transition-all cursor-pointer text-center leading-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Delete Permanently
          </button>
        </div>
      </div>
    </div>
  );
}
