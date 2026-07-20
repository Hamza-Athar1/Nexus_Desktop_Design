import React, { useState } from 'react';
import { Ban, ChevronDown } from 'lucide-react';

export default function BlockShopModal({ shop, onClose, onBlock }) {
  const [reason, setReason] = useState('Policy violation');

  if (!shop) return null;

  const handleConfirm = () => {
    if (onBlock) {
      onBlock(shop.id, reason);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-[#efeacb] rounded-[24px] border border-[#bfbc9b] p-8 w-full max-w-[440px] shadow-2xl flex flex-col text-[#152f16] gap-5 animate-in fade-in zoom-in duration-200">
        
        {/* Ban Icon */}
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#e6e2c3] text-[#8c1d1d]">
          <Ban size={32} strokeWidth={2.5} />
        </div>

        {/* Header */}
        <div>
          <h3 className="text-3xl font-bold font-serif text-[#152f16] leading-tight">
            Block {shop.business}
          </h3>
          <p className="text-sm font-semibold text-[#55694a] mt-2.5 leading-relaxed">
            This shop will lose access to all POS modules immediately. Their data stays saved, but they can't log in until unblocked.
          </p>
        </div>

        {/* Inputs */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-bold text-[#152f16]">Reason for blocking</label>
          <div className="relative">
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-[#fdfcf3] border border-[#c8c2a3]/60 rounded-xl pl-4 pr-10 py-3 text-sm text-[#152f16] font-semibold outline-none appearance-none cursor-pointer focus:ring-1 focus:ring-[#0d3b1b]/30"
            >
              <option value="Policy violation">Policy violation</option>
              <option value="Billing issue">Billing issue</option>
              <option value="Abusive behavior">Abusive behavior</option>
              <option value="Other">Other</option>
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#152f16]">
              <ChevronDown size={18} />
            </div>
          </div>
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
            Block shop
          </button>
        </div>
      </div>
    </div>
  );
}
