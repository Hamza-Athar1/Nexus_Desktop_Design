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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />
      
      {/* Modal Dialog */}
      <div className="relative bg-[#ece5c8] rounded-[24px] border border-[#14391a]/15 p-8 w-full max-w-[460px] shadow-2xl flex flex-col text-[#14391a] gap-5 animate-in fade-in zoom-in duration-200">
        
        {/* Ban Icon (CircleSlash) */}
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#c5d8a4]/40 text-[#99221b]">
          <Ban size={36} strokeWidth={2.5} />
        </div>

        {/* Header */}
        <div>
          <h3 className="text-3xl font-black tracking-tight text-[#14391a] leading-none">
            Block {shop.business}
          </h3>
          <p className="text-sm font-bold text-[#14391a]/85 mt-3 leading-relaxed">
            This shop will lose access to all POS modules immediately. Their data stays saved, but they can't log in until unblocked.
          </p>
        </div>

        {/* Reason Select Dropdown */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-extrabold text-[#14391a]">Reason for blocking</label>
          <div className="relative">
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-[#fdfce8]/90 border border-[#14391a]/20 rounded-xl pl-4 pr-10 py-3 text-sm text-[#14391a] font-extrabold outline-none appearance-none cursor-pointer focus:ring-1 focus:ring-[#14391a]/30"
            >
              <option value="Policy violation">Policy violation</option>
              <option value="Billing issue">Billing issue</option>
              <option value="Abusive behavior">Abusive behavior</option>
              <option value="Other">Other</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#14391a]/80">
              <ChevronDown size={18} strokeWidth={3} />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 bg-[#fdfce8]/90 border border-[#14391a]/40 text-[#14391a] text-base font-extrabold rounded-xl hover:bg-white active:scale-[0.98] transition-all cursor-pointer text-center leading-none"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="w-full py-3.5 bg-[#f5cbaf] border border-[#cf9b7f] text-[#99221b] text-base font-extrabold rounded-xl hover:bg-[#fadfcb] active:scale-[0.98] transition-all cursor-pointer text-center leading-none"
          >
            Block Account
          </button>
        </div>
      </div>
    </div>
  );
}
