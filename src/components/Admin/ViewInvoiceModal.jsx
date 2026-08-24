import React from 'react';
import { X } from 'lucide-react';

export default function ViewInvoiceModal({ invoice, onClose }) {
  if (!invoice) return null;

  const totalItemsCount = invoice.itemCount || (invoice.items ? invoice.items.reduce((acc, cur) => acc + (cur.qty || 1), 0) : 1);
  const subtotal = invoice.subtotal || invoice.items?.reduce((acc, cur) => acc + (cur.price * cur.qty), 0) || invoice.amount;
  const laborCharge = invoice.laborCharge || 137;
  const total = invoice.amount || (subtotal + laborCharge);
  const paidAmount = invoice.paidAmount || subtotal;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-[#f2edd4] border border-[#0c3818]/30 rounded-2xl sm:rounded-3xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col my-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Dark Green Top Header ── */}
        <div className="bg-[#0c3818] text-[#efeacb] p-5 sm:p-6 flex flex-col gap-2 relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-[#efeacb]/70 hover:text-[#efeacb] p-1 rounded-full hover:bg-white/10 transition cursor-pointer"
            title="Close modal"
          >
            <X size={20} />
          </button>

          {/* Date Line */}
          <div className="text-xs sm:text-sm font-semibold tracking-wide text-[#efeacb]/90 flex items-center gap-3">
            <span>Date:</span>
            <span>{invoice.date}</span>
          </div>

          {/* Invoice Number & Item Count Pill */}
          <div className="flex items-center justify-between mt-1">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {invoice.invoiceNo}
            </h2>

            <div className="bg-[#efeacb] text-[#0c3818] font-bold text-xs sm:text-sm px-3.5 py-1.5 rounded-lg shadow-xs select-none">
              Item: {totalItemsCount}
            </div>
          </div>
        </div>

        {/* ── Main Content Body ── */}
        <div className="p-5 sm:p-6 flex flex-col gap-5">
          {/* Item Table Header */}
          <div className="grid grid-cols-12 gap-2 text-sm sm:text-base font-bold text-[#0c3818] pb-2 border-b border-[#0c3818]/15 px-1">
            <div className="col-span-6 text-left">Item Name</div>
            <div className="col-span-3 text-center">QTY</div>
            <div className="col-span-3 text-right">Price</div>
          </div>

          {/* Item Rows List */}
          <div className="flex flex-col gap-4 py-2 min-h-[90px]">
            {invoice.items && invoice.items.length > 0 ? (
              invoice.items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center px-1">
                  {/* Item Image + Title */}
                  <div className="col-span-6 flex items-center gap-3 min-w-0">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-8 h-10 object-contain shrink-0"
                      />
                    ) : (
                      /* Default Oil Bottle / Item Icon matching screenshot */
                      <div className="w-8 h-10 flex items-center justify-center shrink-0">
                        <svg className="w-7 h-10" viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="9" y="0" width="6" height="4" rx="1" fill="#1b4d24" />
                          <rect x="7" y="4" width="10" height="4" fill="#2d6a37" />
                          <path d="M5 10C5 8.89543 5.89543 8 7 8H17C18.1046 8 19 8.89543 19 10V32C19 33.1046 18.1046 34 17 34H7C5.89543 34 5 33.1046 5 32V10Z" fill="#1e4620" />
                          <rect x="7" y="14" width="10" height="12" rx="1" fill="#ca8a04" />
                          <circle cx="12" cy="20" r="3" fill="#fef08a" />
                        </svg>
                      </div>
                    )}
                    <span className="font-bold text-[#0c3818] text-sm sm:text-base truncate">
                      {item.name}
                    </span>
                  </div>

                  {/* Quantity Badge */}
                  <div className="col-span-3 flex justify-center">
                    <span className="bg-[#c5caa8] text-[#0c3818] font-bold text-sm sm:text-base px-3.5 py-1 rounded-md shadow-xs min-w-[36px] text-center">
                      {item.qty}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="col-span-3 text-right font-bold text-[#0c3818] text-sm sm:text-base">
                    Rs {item.price}
                  </div>
                </div>
              ))
            ) : (
              <div className="grid grid-cols-12 gap-2 items-center px-1">
                <div className="col-span-6 flex items-center gap-3">
                  <div className="w-8 h-10 flex items-center justify-center shrink-0">
                    <svg className="w-7 h-10" viewBox="0 0 24 36" fill="none">
                      <rect x="9" y="0" width="6" height="4" fill="#1b4d24" />
                      <rect x="5" y="10" width="14" height="24" rx="2" fill="#1e4620" />
                      <rect x="7" y="14" width="10" height="12" fill="#ca8a04" />
                    </svg>
                  </div>
                  <span className="font-bold text-[#0c3818] text-base">Cooking Oil 2L</span>
                </div>
                <div className="col-span-3 flex justify-center">
                  <span className="bg-[#c5caa8] text-[#0c3818] font-bold text-base px-3.5 py-1 rounded-md">1</span>
                </div>
                <div className="col-span-3 text-right font-bold text-[#0c3818] text-base">Rs 3000</div>
              </div>
            )}
          </div>

          {/* ── Financial Breakdown Divider ── */}
          <div className="border-t border-[#0c3818]/20 pt-4 flex flex-col gap-2.5">
            {/* Subtotal */}
            <div className="flex justify-between items-center text-sm sm:text-base font-bold text-[#0c3818]">
              <span>Subtotal</span>
              <span>Rs.{subtotal}</span>
            </div>

            {/* Labor Charge */}
            <div className="flex justify-between items-center text-sm sm:text-base font-bold text-[#0c3818]">
              <span>Labor Charge</span>
              <span>Rs.{laborCharge}</span>
            </div>

            {/* Middle Divider */}
            <div className="border-t border-[#0c3818]/20 my-1" />

            {/* Total (Highlighted in Dark Red) */}
            <div className="flex justify-between items-center text-base sm:text-lg text-[#8b1e10] font-black">
              <span>Total</span>
              <span className="text-xl sm:text-2xl">
                Rs.{total.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Paid Amount */}
            <div className="flex justify-between items-center text-sm sm:text-base font-bold text-[#0c3818]">
              <span>Paid Amount</span>
              <span>Rs.{paidAmount}</span>
            </div>
          </div>

          {/* ── Print Invoice Button ── */}
          <div className="flex justify-center pt-3 pb-1">
            <button
              onClick={handlePrint}
              className="bg-[#0c3818] hover:bg-[#114720] text-[#efeacb] text-base sm:text-lg font-bold px-8 py-3 rounded-xl shadow-md transition duration-150 cursor-pointer active:scale-95 min-w-[200px]"
            >
              Print Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
