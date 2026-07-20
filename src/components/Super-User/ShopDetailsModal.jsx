import React from 'react';

export default function ShopDetailsModal({ selectedShop, onClose }) {
  if (!selectedShop) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-[#efeacb] rounded-[24px] border border-[#bfbc9b] p-8 w-full max-w-[440px] shadow-2xl flex flex-col text-[#152f16]">
        {/* Modal Header */}
        <div className="mb-5">
          <h3 className="text-3xl font-bold font-serif text-[#152f16] leading-tight">
            {selectedShop.business}
          </h3>
          <p className="text-sm font-semibold text-[#55694a] mt-1">
            {selectedShop.address.includes('Gulshan') ? 'Gulshan-e-Iqbal, Karachi' : selectedShop.address.split(',').slice(-2).join(',').trim()}
          </p>
        </div>

        {/* POS Purchased Cards */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="bg-[#fdfcf3] border border-[#e6e2c3] rounded-2xl p-4 flex flex-col">
            <span className="text-xs font-bold text-[#152f16] tracking-tight">POS purchased</span>
            <span className="text-4xl font-extrabold text-[#152f16] mt-2 leading-none">
              {selectedShop.posPurchased || 5}
            </span>
          </div>
          <div className="bg-[#fdfcf3] border border-[#e6e2c3] rounded-2xl p-4 flex flex-col">
            <span className="text-xs font-bold text-[#152f16] tracking-tight">POS purchased</span>
            <span className="text-4xl font-extrabold text-[#152f16] mt-2 leading-none">
              {selectedShop.posActive || 2}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#bfbc9b]/40 mb-5"></div>

        {/* Details List */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex justify-between items-center text-sm">
            <span className="font-bold text-[#55694a]">Selected POS module</span>
            <span className="font-extrabold text-[#152f16]">{selectedShop.posModule}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="font-bold text-[#55694a]">Owner</span>
            <span className="font-extrabold text-[#152f16]">{selectedShop.owner}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="font-bold text-[#55694a]">Registered on</span>
            <span className="font-extrabold text-[#152f16]">{selectedShop.regDate}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="font-bold text-[#55694a]">Bill this month</span>
            <span className="font-extrabold text-[#152f16]">
              {selectedShop.billStatus === 'paid' ? `Paid - Rs ${selectedShop.amount}` : selectedShop.billThisMonth}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="font-bold text-[#55694a]">Bill expires</span>
            <span className="font-extrabold text-[#152f16]">{selectedShop.expires}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="font-bold text-[#55694a]">Last bill paid</span>
            <span className="font-extrabold text-[#152f16]">{selectedShop.lastPaid}</span>
          </div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-4 bg-[#0d3b1b] text-[#efeacb] text-lg font-bold rounded-xl hover:bg-[#072410] active:scale-[0.98] transition-all cursor-pointer text-center leading-none"
        >
          Close
        </button>
      </div>
    </div>
  );
}
