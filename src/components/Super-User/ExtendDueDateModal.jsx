import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export default function ExtendDueDateModal({ extendingShop, onClose, onSave }) {
  const [currentDueDate, setCurrentDueDate] = useState('');
  const [newDueDate, setNewDueDate] = useState('Jul 28, 2026');
  const [extendReason, setExtendReason] = useState('');

  useEffect(() => {
    if (extendingShop) {
      setCurrentDueDate(extendingShop.expires.includes('days ago') ? 'Jul 14, 2026' : extendingShop.expires);
      setNewDueDate('Jul 28, 2026');
      setExtendReason('');
    }
  }, [extendingShop]);

  if (!extendingShop) return null;

  const handleSave = () => {
    onSave(extendingShop.id, newDueDate, extendReason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-[#efeacb] rounded-[24px] border border-[#bfbc9b] p-8 w-full max-w-[440px] shadow-2xl flex flex-col text-[#152f16] gap-5 animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div>
          <h3 className="text-3xl font-bold font-serif text-[#152f16] leading-tight">
            Extend billing due date
          </h3>
          <p className="text-sm font-semibold text-[#55694a] mt-1">
            {extendingShop.business} - {extendingShop.billStatus === 'overdue' ? `${extendingShop.billThisMonth}` : 'Rs 4,500 overdue'}
          </p>
        </div>

        {/* Form Fields */}
        <div className="flex flex-col gap-4">
          {/* Current due date & POS module (New extension date selector) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-[#152f16]">Current due date</label>
              <input
                type="text"
                readOnly
                value={currentDueDate}
                className="w-full bg-[#fdfcf3] border border-[#c8c2a3]/60 rounded-xl px-4 py-3 text-sm text-[#152f16] font-semibold outline-none cursor-default opacity-80"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              {/* Keep the label 'POS module' exactly as in the mockup screenshot */}
              <label className="text-sm font-bold text-[#152f16]">POS module</label>
              <div className="relative">
                <select
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full bg-[#fdfcf3] border border-[#c8c2a3]/60 rounded-xl pl-4 pr-10 py-3 text-sm text-[#152f16] font-semibold outline-none appearance-none cursor-pointer focus:ring-1 focus:ring-[#0d3b1b]/30"
                >
                  <option value="Jul 28, 2026">Jul 28, 2026</option>
                  <option value="Aug 14, 2026">Aug 14, 2026</option>
                  <option value="Aug 28, 2026">Aug 28, 2026</option>
                  <option value="Sep 12, 2026">Sep 12, 2026</option>
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#152f16]">
                  <ChevronDown size={18} />
                </div>
              </div>
            </div>
          </div>

          {/* Reason (Optional) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-[#152f16]">Reason (Optional)</label>
            <textarea
              placeholder="Add a note for this grace period...."
              value={extendReason}
              onChange={(e) => setExtendReason(e.target.value)}
              className="w-full min-h-[100px] bg-[#fdfcf3] border border-[#c8c2a3]/60 rounded-xl p-4 text-sm text-[#152f16] font-semibold outline-none placeholder-[#607455]/60 focus:ring-1 focus:ring-[#0d3b1b]/30 resize-none"
            />
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
            onClick={handleSave}
            className="w-full py-3.5 bg-[#fbc000] text-[#0d3b1b] text-base font-bold rounded-xl hover:bg-[#e2ac00] active:scale-[0.98] transition-all cursor-pointer text-center leading-none"
          >
            Extend due date
          </button>
        </div>
      </div>
    </div>
  );
}
