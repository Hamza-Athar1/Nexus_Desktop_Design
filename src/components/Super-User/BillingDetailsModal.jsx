import React from 'react';
import { Check } from 'lucide-react';

export default function BillingDetailsModal({ shop, onClose }) {
  if (!shop) return null;

  // Mock payment history data if not fully present on shop object
  const history = shop.paymentHistory || [
    {
      id: 1,
      amount: '4,500',
      date: 'Jul 18, 2026',
      method: 'Card',
      invoice: shop.invoice || 'INV-0232',
    },
    {
      id: 2,
      amount: '4,500',
      date: 'Jun 20, 2026',
      method: 'Card',
      invoice: 'INV-0201',
    },
    {
      id: 3,
      amount: '4,500',
      date: 'May 19, 2026',
      method: 'JazzCash',
      invoice: 'INV-0170',
    },
  ];

  const totalBilled = shop.totalBilledToDate || 'Rs 54,000';
  const statusDisplay = shop.status === 'paid' ? 'Paid' : shop.status === 'overdue' ? 'Overdue' : 'Pending';
  const ownerName = shop.owner || 'Saad Haider';
  const username = shop.username || shop.owner?.toLowerCase().replace(/\s+/g, '.') || 'saad.haider';
  const businessName = shop.business || 'Fairy Parcel Co.';
  const nextDueDate = shop.dueDate || 'Sep 02, 2026';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />
      
      {/* Modal Dialog */}
      <div className="relative bg-[#ece5c8] rounded-[28px] border border-[#14391a]/15 p-7 w-full max-w-[460px] shadow-2xl flex flex-col text-[#14391a]">
        
        {/* Header: Name & Handle/Business */}
        <div className="mb-6">
          <h2 className="text-3xl font-extrabold tracking-tight text-[#14391a]">
            {ownerName}
          </h2>
          <p className="text-sm font-bold text-[#14391a]/80 mt-0.5">
            @{username} . {businessName}
          </p>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          {/* Card 1: Total billed to date */}
          <div className="bg-[#fefce8]/90 rounded-2xl p-4 border border-[#14391a]/10 flex flex-col justify-between">
            <span className="text-xs font-semibold text-[#14391a]/90">Total billed to date</span>
            <span className="text-2xl font-extrabold text-[#14391a] mt-2 tracking-tight">
              {totalBilled}
            </span>
          </div>

          {/* Card 2: Status */}
          <div className="bg-[#fefce8]/90 rounded-2xl p-4 border border-[#14391a]/10 flex flex-col justify-between">
            <span className="text-xs font-semibold text-[#14391a]/90">Status</span>
            <span className={`text-2xl font-extrabold mt-2 tracking-tight ${
              statusDisplay === 'Paid' ? 'text-[#16a34a]' : statusDisplay === 'Overdue' ? 'text-[#dc2626]' : 'text-[#ca8a04]'
            }`}>
              {statusDisplay}
            </span>
          </div>
        </div>

        {/* Next Due Date */}
        <div className="flex justify-between items-center text-sm font-extrabold text-[#14391a] mb-6 px-1">
          <span>Next due date</span>
          <span>{nextDueDate}</span>
        </div>

        {/* PAYMENT HISTORY */}
        <div className="mb-6">
          <h3 className="text-xs font-extrabold tracking-wider text-[#14391a] uppercase mb-3 px-1">
            PAYMENT HISTORY
          </h3>

          <div className="space-y-3">
            {history.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                {/* Icon Check Badge */}
                <div className="w-10 h-10 rounded-xl bg-[#c5d8a4] flex items-center justify-center text-[#14391a] shrink-0">
                  <Check size={20} strokeWidth={3} />
                </div>

                {/* Amount and Meta */}
                <div className="flex flex-col">
                  <span className="text-base font-extrabold text-[#14391a] leading-tight">
                    Rs {item.amount}
                  </span>
                  <span className="text-xs font-semibold text-[#14391a]/70">
                    {item.date} . {item.method} . {item.invoice}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3.5 bg-[#14391a] hover:bg-[#0f2a13] text-white text-base font-extrabold rounded-2xl shadow-md active:scale-[0.99] transition-all cursor-pointer text-center leading-none"
        >
          Close
        </button>

      </div>
    </div>
  );
}
