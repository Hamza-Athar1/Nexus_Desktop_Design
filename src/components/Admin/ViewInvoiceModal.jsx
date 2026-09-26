import React from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ViewInvoiceModal({ invoice, onClose }) {
  const { user } = useAuth();
  if (!invoice) return null;

  const receiptSettings = invoice.receiptSettings || user?.receiptSettings || {};
  const shopName = receiptSettings.shopName || invoice.shop_name || 'Nexus Shop';
  const shopAddress = receiptSettings.shopAddress || invoice.shop_address || 'Main Branch Address';
  const logoUrl = receiptSettings.logoUrl || invoice.logo_url || null;
  const fontSize = receiptSettings.fontSize ? `${receiptSettings.fontSize}px` : '15px';
  const isUrdu = receiptSettings.language === 'ur';

  const invoiceNo = invoice.invoice_number || invoice.invoiceNo || `INV-${invoice.id}`;
  const dateStr = invoice.created_at
    ? new Date(invoice.created_at).toLocaleString()
    : (invoice.date || new Date().toLocaleString());
  
  const rawItems = invoice.items || [];
  const totalItemsCount = invoice.itemCount || rawItems.reduce((acc, cur) => acc + Number(cur.quantity || cur.qty || 1), 0);
  const subtotal = Number(invoice.subtotal_amount ?? invoice.subtotal ?? rawItems.reduce((acc, cur) => acc + (Number(cur.unit_price || cur.price || 0) * Number(cur.quantity || cur.qty || 1)), 0));
  const tax = Number(invoice.tax_amount ?? invoice.tax ?? 0);
  const laborCharge = Number(invoice.laborCharge ?? 0);
  const total = Number(invoice.total_amount ?? invoice.amount ?? (subtotal + tax + laborCharge));
  const paidAmount = Number(invoice.paid_amount ?? invoice.paidAmount ?? total);
  const changeAmount = Number(invoice.change_amount ?? invoice.changeAmount ?? Math.max(0, paidAmount - total));
  const status = invoice.status || 'completed';

  const labels = isUrdu
    ? {
        date: 'تاریخ',
        items: 'آئٹم',
        itemName: 'آئٹم',
        qty: 'تعداد',
        price: 'قیمت',
        subtotal: 'ذیلی کل',
        tax: 'ٹیکس',
        labor: 'مزدوری',
        total: 'کل رقم',
        paid: 'ادا شدہ',
        change: 'بقایا',
        print: 'انواؤس پرنٹ کریں',
        noItems: 'کوئی آئٹم نہیں ہے',
        thankYou: 'ہمارے ساتھ خریداری کا شکریہ',
      }
    : {
        date: 'Date',
        items: 'Items',
        itemName: 'ITEM',
        qty: 'QTY',
        price: 'PRICE',
        subtotal: 'Subtotal',
        tax: 'Tax',
        labor: 'Labor Charge',
        total: 'TOTAL',
        paid: 'Paid Amount',
        change: 'Change',
        print: 'Print Invoice',
        noItems: 'No line items in invoice',
        thankYou: 'Thank you for shopping with us',
      };

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
        dir={isUrdu ? 'rtl' : 'ltr'}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Dark Green Top Header ── */}
        <div className="bg-[#0c3818] text-[#efeacb] p-5 sm:p-6 flex flex-col gap-2 relative">
          <button
            onClick={onClose}
            className={`absolute ${isUrdu ? 'left-4' : 'right-4'} top-4 text-[#efeacb]/70 hover:text-[#efeacb] p-1 rounded-full hover:bg-white/10 transition cursor-pointer`}
            title="Close modal"
          >
            <X size={20} />
          </button>

          {/* Business Logo & Shop Header */}
          <div className="flex flex-col items-center justify-center text-center pb-2 border-b border-[#efeacb]/20">
            {logoUrl && (
              <img src={logoUrl} alt="Shop Logo" className="h-12 w-auto max-w-[140px] object-contain mb-1 rounded bg-white/10 p-1" />
            )}
            <h1 className="text-xl sm:text-2xl font-black tracking-wide text-white">{shopName}</h1>
            {shopAddress && (
              <p className="text-xs text-[#efeacb]/80 whitespace-pre-line mt-0.5 max-w-[280px]">{shopAddress}</p>
            )}
          </div>

          {/* Date Line */}
          <div className="text-xs sm:text-sm font-semibold tracking-wide text-[#efeacb]/90 flex items-center justify-between pt-1">
            <span>{labels.date}: {dateStr}</span>
            <span className="uppercase text-[10px] font-extrabold px-2 py-0.5 rounded bg-white/10">{status}</span>
          </div>

          {/* Invoice Number & Item Count Pill */}
          <div className="flex items-center justify-between mt-1">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white" dir="ltr">
              {invoiceNo}
            </h2>

            <div className="bg-[#efeacb] text-[#0c3818] font-bold text-xs sm:text-sm px-3.5 py-1.5 rounded-lg shadow-xs select-none">
              {labels.items}: {totalItemsCount}
            </div>
          </div>
        </div>

        {/* ── Main Content Body ── */}
        <div className="p-5 sm:p-6 flex flex-col gap-5">
          {/* Item Table Header */}
          <div className="grid grid-cols-12 gap-2 font-bold text-[#0c3818] pb-2 border-b border-[#0c3818]/15 px-1" style={{ fontSize }}>
            <div className={`col-span-6 ${isUrdu ? 'text-right' : 'text-left'}`}>{labels.itemName}</div>
            <div className="col-span-3 text-center">{labels.qty}</div>
            <div className={`col-span-3 ${isUrdu ? 'text-left' : 'text-right'}`}>{labels.price}</div>
          </div>

          {/* Item Rows List */}
          <div className="flex flex-col gap-4 py-2 min-h-[90px] max-h-56 overflow-y-auto">
            {rawItems.length > 0 ? (
              rawItems.map((item, idx) => {
                const itemName = item.product_name || item.productName || item.name || item.product?.name || item.item_name || item.title || (item.product_id || item.productId ? `Product #${item.product_id || item.productId}` : `Item #${idx + 1}`);
                const itemQty = item.quantity ?? item.qty ?? 1;
                const itemPrice = Number(item.unit_price ?? item.price ?? 0);
                return (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center px-1">
                    <div className="col-span-6 flex items-center gap-3 min-w-0">
                      <div className="w-8 h-10 flex items-center justify-center shrink-0">
                        <svg className="w-7 h-10" viewBox="0 0 24 36" fill="none">
                          <rect x="9" y="0" width="6" height="4" rx="1" fill="#1b4d24" />
                          <rect x="7" y="4" width="10" height="4" fill="#2d6a37" />
                          <path d="M5 10C5 8.89543 5.89543 8 7 8H17C18.1046 8 19 8.89543 19 10V32C19 33.1046 18.1046 34 17 34H7C5.89543 34 5 33.1046 5 32V10Z" fill="#1e4620" />
                          <rect x="7" y="14" width="10" height="12" rx="1" fill="#ca8a04" />
                          <circle cx="12" cy="20" r="3" fill="#fef08a" />
                        </svg>
                      </div>
                      <span className="font-bold text-[#0c3818] truncate" style={{ fontSize }}>
                        {itemName}
                      </span>
                    </div>

                    <div className="col-span-3 flex justify-center">
                      <span className="bg-[#c5caa8] text-[#0c3818] font-bold px-3.5 py-1 rounded-md shadow-xs min-w-[36px] text-center" style={{ fontSize }}>
                        {itemQty}
                      </span>
                    </div>

                    <div className={`col-span-3 font-bold text-[#0c3818] ${isUrdu ? 'text-left' : 'text-right'}`} style={{ fontSize }}>
                      Rs {itemPrice * itemQty}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6 text-gray-500 font-medium" style={{ fontSize }}>{labels.noItems}</div>
            )}
          </div>

          {/* ── Financial Breakdown Divider ── */}
          <div className="border-t border-[#0c3818]/20 pt-4 flex flex-col gap-2.5">
            {/* Subtotal */}
            <div className="flex justify-between items-center font-bold text-[#0c3818]" style={{ fontSize }}>
              <span>{labels.subtotal}</span>
              <span dir="ltr">Rs. {subtotal}</span>
            </div>

            {tax > 0 && (
              <div className="flex justify-between items-center font-bold text-[#0c3818]" style={{ fontSize }}>
                <span>{labels.tax}</span>
                <span dir="ltr">Rs. {tax}</span>
              </div>
            )}

            {laborCharge > 0 && (
              <div className="flex justify-between items-center font-bold text-[#0c3818]" style={{ fontSize }}>
                <span>{labels.labor}</span>
                <span dir="ltr">Rs. {laborCharge}</span>
              </div>
            )}

            {/* Middle Divider */}
            <div className="border-t border-[#0c3818]/20 my-1" />

            {/* Total */}
            <div className="flex justify-between items-center text-[#8b1e10] font-black" style={{ fontSize }}>
              <span>{labels.total}</span>
              <span className="font-extrabold" dir="ltr" style={{ fontSize }}>
                Rs. {total.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Paid Amount */}
            <div className="flex justify-between items-center font-bold text-[#0c3818]" style={{ fontSize }}>
              <span>{labels.paid}</span>
              <span dir="ltr">Rs. {paidAmount}</span>
            </div>

            {/* Change */}
            {changeAmount > 0 && (
              <div className="flex justify-between items-center font-bold text-green-700" style={{ fontSize }}>
                <span>{labels.change}</span>
                <span dir="ltr">Rs. {changeAmount}</span>
              </div>
            )}
          </div>

          {/* Footer Note */}
          <div className="text-center font-semibold text-[#0c3818]/70 pt-2 border-t border-[#0c3818]/10" style={{ fontSize }}>
            {labels.thankYou}
          </div>

          {/* ── Print Invoice Button ── */}
          <div className="flex justify-center pt-2 pb-1">
            <button
              onClick={handlePrint}
              className="bg-[#0c3818] hover:bg-[#114720] text-[#efeacb] text-base sm:text-lg font-bold px-8 py-3 rounded-xl shadow-md transition duration-150 cursor-pointer active:scale-95 min-w-[200px]"
            >
              {labels.print}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

