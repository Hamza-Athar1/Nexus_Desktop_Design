import React, { useState } from 'react';
import { Search, X, RotateCcw, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { getSales, getSaleById, processReturn } from '../../lib/salesService.js';

export default function CashierReturnModal({ isOpen, onClose, onReturnSuccess }) {
  const [searchInvoice, setSearchInvoice] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const [sale, setSale] = useState(null);
  const [returnItems, setReturnItems] = useState([]);
  const [restockToggle, setRestockToggle] = useState(true);
  const [returnReason, setReturnReason] = useState('Customer return');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  if (!isOpen) return null;

  const handleReset = () => {
    setSearchInvoice('');
    setIsSearching(false);
    setSearchError(null);
    setSale(null);
    setReturnItems([]);
    setRestockToggle(true);
    setReturnReason('Customer return');
    setIsSubmitting(false);
    setSubmitSuccess(null);
    setSubmitError(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const loadSaleDetails = async (saleId) => {
    try {
      const res = await getSaleById(saleId);
      if (res.ok && res.data?.sale) {
        const fullSale = res.data.sale;
        setSale(fullSale);

        const preparedItems = (fullSale.items || []).map((i) => {
          const origQty = Number(i.quantity ?? i.qty ?? 0);
          const retQty = Number(i.returned_quantity ?? i.returnedQuantity ?? 0);
          const returnable = Math.max(0, origQty - retQty);
          const unitPrice = Number(i.unit_price ?? i.unitPrice ?? i.price ?? i.sale_price ?? 0);
          const discountAmt = Number(i.discount_amount ?? i.discountAmount ?? 0);
          const taxAmt = Number(i.tax_amount ?? i.taxAmount ?? 0);
          // Effective per-unit refund price (unit price - discount + per-unit tax)
          const perUnitRefund = origQty > 0 ? (unitPrice - discountAmt) + (taxAmt / origQty) : unitPrice;

          return {
            saleItemId: Number(i.id),
            productId: Number(i.product_id ?? i.productId ?? 0),
            variantId: i.variant_id ? Number(i.variant_id) : (i.variantId ? Number(i.variantId) : null),
            product_name: i.product_name || i.productName || i.name || `Product #${i.product_id || i.productId}`,
            sku: i.sku || '',
            barcode: i.barcode || '',
            original_quantity: origQty,
            returned_quantity: retQty,
            returnable_quantity: returnable,
            return_quantity: 0,
            unit_price: unitPrice,
            per_unit_refund: perUnitRefund,
          };
        });
        setReturnItems(preparedItems);
      } else {
        setSearchError('Failed to fetch complete invoice details.');
      }
    } catch (err) {
      setSearchError(err.message || 'Error loading invoice details.');
    }
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    const queryStr = searchInvoice.trim();
    if (!queryStr) return;

    setIsSearching(true);
    setSearchError(null);
    setSale(null);
    setReturnItems([]);
    setSubmitSuccess(null);
    setSubmitError(null);

    try {
      let matchedSale = null;
      const digitsOnly = queryStr.replace(/\D+/g, '');

      // 1. Search via getSales API
      const res = await getSales({ search: queryStr, limit: 10 });
      if (res.ok && Array.isArray(res.data?.sales) && res.data.sales.length > 0) {
        const sales = res.data.sales;
        const qLower = queryStr.toLowerCase();
        matchedSale =
          sales.find((s) => s.invoice_number?.toLowerCase() === qLower) ||
          sales.find((s) => s.invoice_number?.toLowerCase().includes(qLower)) ||
          (digitsOnly ? sales.find((s) => String(s.id) === digitsOnly) : null) ||
          sales[0];
      }

      // 2. Direct sale ID lookup fallback (e.g. if user types INV-300 or 300)
      if (!matchedSale && digitsOnly) {
        try {
          const detailRes = await getSaleById(digitsOnly);
          if (detailRes.ok && detailRes.data?.sale) {
            matchedSale = detailRes.data.sale;
          }
        } catch {
          // Ignore 404
        }
      }

      if (matchedSale) {
        await loadSaleDetails(matchedSale.id);
      } else {
        setSearchError(`No invoice found matching "${queryStr}" for your shop.`);
      }
    } catch (err) {
      setSearchError(err.message || 'Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleQuantityChange = (saleItemId, qtyVal) => {
    setReturnItems((prev) =>
      prev.map((item) => {
        if (item.saleItemId === saleItemId) {
          const parsed = Math.max(0, Math.min(item.returnable_quantity, parseInt(qtyVal, 10) || 0));
          return { ...item, return_quantity: parsed };
        }
        return item;
      })
    );
  };

  const selectedReturnItems = returnItems.filter((i) => i.return_quantity > 0);

  const estimatedRefundTotal = selectedReturnItems.reduce(
    (sum, i) => sum + i.return_quantity * i.per_unit_refund,
    0
  );

  const handleSubmitReturn = async () => {
    if (!sale) return;
    if (selectedReturnItems.length === 0) {
      setSubmitError('Please select at least one item and enter a return quantity greater than 0.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      const payload = {
        saleId: Number(sale.id),
        items: selectedReturnItems.map((i) => ({
          saleItemId: i.saleItemId,
          productId: i.productId,
          quantity: i.return_quantity,
        })),
        restock: restockToggle,
        reason: returnReason,
      };

      const res = await processReturn(payload);
      if (!res.ok) {
        throw new Error(res.data?.message || 'Return processing failed.');
      }

      const refundData = res.data.refund || {};
      const actualRefundAmt = refundData.totalRefundAmount ?? refundData.total_refund_amount ?? estimatedRefundTotal;

      setSubmitSuccess({
        message: 'Return Processed Successfully!',
        invoiceNumber: sale.invoice_number,
        refundAmount: actualRefundAmt,
        refundId: refundData.refundId || refundData.id || null,
        itemsReturnedCount: selectedReturnItems.length,
      });

      // Reload updated sale status & quantities from backend
      await loadSaleDetails(sale.id);

      if (onReturnSuccess) {
        onReturnSuccess();
      }
    } catch (err) {
      setSubmitError(err.message || 'Failed to process return.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div
        className="bg-[#efe9c4] border-2 border-[#0f2e13]/20 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-[#0f2e13]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0f2e13] text-[#efe9c4]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#efe9c4]/10 rounded-xl">
              <RotateCcw className="w-5 h-5 text-[#efe9c4]" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-wide uppercase">Cashier Item Return</h2>
              <p className="text-xs text-[#efe9c4]/70 font-medium">
                Search customer invoice, compare items, and process item return
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-[#efe9c4]/80 hover:text-[#efe9c4] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Invoice Search Form */}
          <form onSubmit={handleSearch} className="flex gap-3 items-center">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Enter Invoice Number (e.g. INV-20260927-0001)"
                value={searchInvoice}
                onChange={(e) => setSearchInvoice(e.target.value)}
                className="w-full bg-white border border-[#0f2e13]/20 rounded-xl px-4 py-3 pr-10 text-sm font-bold placeholder-[#0f2e13]/40 focus:outline-none focus:ring-2 focus:ring-[#0f2e13] shadow-xs"
              />
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0f2e13]/50 pointer-events-none" />
            </div>
            <button
              type="submit"
              disabled={isSearching || !searchInvoice.trim()}
              className="bg-[#0f2e13] text-[#efe9c4] font-black text-xs uppercase px-6 py-3 rounded-xl hover:bg-[#0f2e13]/90 disabled:opacity-50 transition cursor-pointer flex items-center gap-2 shrink-0 shadow-xs"
            >
              {isSearching ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Searching...
                </>
              ) : (
                'Search Invoice'
              )}
            </button>
          </form>

          {/* Search Error */}
          {searchError && (
            <div className="p-4 bg-red-100 border border-red-300 rounded-xl text-red-800 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{searchError}</span>
            </div>
          )}

          {/* Submit Success Banner */}
          {submitSuccess && (
            <div className="p-4 bg-emerald-100 border border-emerald-400 rounded-xl text-emerald-900 text-xs font-bold flex flex-col gap-1">
              <div className="flex items-center gap-2 font-black text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                {submitSuccess.message}
              </div>
              <p>
                Invoice: <span className="font-extrabold">{submitSuccess.invoiceNumber}</span> | Refund Total: <span className="font-black text-emerald-800">Rs. {submitSuccess.refundAmount.toLocaleString()}</span>
              </p>
            </div>
          )}

          {/* Submit Error Banner */}
          {submitError && (
            <div className="p-4 bg-red-100 border border-red-300 rounded-xl text-red-800 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Loaded Sale Details */}
          {sale && (
            <div className="space-y-6">
              {/* Sale Info Summary Card */}
              <div className="bg-white p-4 rounded-xl border border-[#0f2e13]/15 shadow-xs grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold">
                <div>
                  <span className="text-[#0f2e13]/60 uppercase tracking-wider text-[10px] block font-extrabold">Invoice Number</span>
                  <span className="font-mono font-black text-[#0f2e13] text-sm">{sale.invoice_number}</span>
                </div>
                <div>
                  <span className="text-[#0f2e13]/60 uppercase tracking-wider text-[10px] block font-extrabold">Sale Date</span>
                  <span>{new Date(sale.sold_at).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[#0f2e13]/60 uppercase tracking-wider text-[10px] block font-extrabold">Customer</span>
                  <span>{sale.customer_name || 'Walk-in Customer'}</span>
                </div>
                <div>
                  <span className="text-[#0f2e13]/60 uppercase tracking-wider text-[10px] block font-extrabold">Status</span>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    sale.status === 'refunded'
                      ? 'bg-red-100 text-red-700'
                      : sale.status === 'partially_refunded'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {sale.status === 'partially_refunded' ? 'Partially Returned' : sale.status}
                  </span>
                </div>
                <div>
                  <span className="text-[#0f2e13]/60 uppercase tracking-wider text-[10px] block font-extrabold">Subtotal</span>
                  <span>Rs. {Number(sale.subtotal || 0).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[#0f2e13]/60 uppercase tracking-wider text-[10px] block font-extrabold">Tax / Discount</span>
                  <span>Rs. {Number(sale.tax_amount || 0).toLocaleString()} / -Rs. {Number(sale.discount_amount || 0).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[#0f2e13]/60 uppercase tracking-wider text-[10px] block font-extrabold">Total Paid</span>
                  <span className="font-black">Rs. {Number(sale.total_amount || 0).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[#0f2e13]/60 uppercase tracking-wider text-[10px] block font-extrabold">Payment Method</span>
                  <span className="uppercase font-bold">{sale.payments?.[0]?.method || 'Cash'}</span>
                </div>
              </div>

              {/* Items Comparison & Selection Table */}
              <div className="bg-white rounded-xl border border-[#0f2e13]/15 overflow-hidden shadow-xs">
                <div className="px-4 py-3 bg-[#0f2e13]/5 border-b border-[#0f2e13]/10 flex justify-between items-center">
                  <h3 className="font-black text-xs uppercase text-[#0f2e13]">Purchased Items vs Return Selection</h3>
                  <span className="text-[11px] text-[#0f2e13]/70 font-semibold">
                    {returnItems.length} item(s) on invoice
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0f2e13]/10 text-[#0f2e13] uppercase font-black tracking-wider text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3">Item Details</th>
                        <th className="py-2.5 px-3 text-right">Unit Price</th>
                        <th className="py-2.5 px-3 text-center">Purchased</th>
                        <th className="py-2.5 px-3 text-center">Returned</th>
                        <th className="py-2.5 px-3 text-center">Available</th>
                        <th className="py-2.5 px-3 text-center w-32">Return Qty</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#0f2e13]/10 font-semibold">
                      {returnItems.map((item) => {
                        const isFullyReturned = item.returnable_quantity <= 0;
                        return (
                          <tr key={item.saleItemId} className={isFullyReturned ? 'bg-gray-50 opacity-60' : 'hover:bg-[#0f2e13]/5'}>
                            <td className="py-2.5 px-3">
                              <p className="font-bold text-[#0f2e13]">{item.product_name}</p>
                              {(item.sku || item.barcode) && (
                                <p className="text-[10px] text-[#0f2e13]/60 font-mono">
                                  {item.barcode ? `BC: ${item.barcode}` : `SKU: ${item.sku}`}
                                </p>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold">
                              Rs. {item.unit_price.toLocaleString()}
                            </td>
                            <td className="py-2.5 px-3 text-center font-bold">{item.original_quantity}</td>
                            <td className="py-2.5 px-3 text-center font-bold text-amber-700">{item.returned_quantity}</td>
                            <td className="py-2.5 px-3 text-center font-bold">
                              {isFullyReturned ? (
                                <span className="inline-block px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full text-[10px] font-bold">
                                  0 (Returned)
                                </span>
                              ) : (
                                <span className="text-emerald-700 font-extrabold">{item.returnable_quantity}</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              {isFullyReturned ? (
                                <span className="text-[10px] font-bold text-gray-400">N/A</span>
                              ) : (
                                <input
                                  type="number"
                                  min="0"
                                  max={item.returnable_quantity}
                                  value={item.return_quantity}
                                  onChange={(e) => handleQuantityChange(item.saleItemId, e.target.value)}
                                  className="w-20 text-center bg-white border border-[#0f2e13]/30 rounded-lg py-1 text-xs font-black focus:outline-none focus:ring-2 focus:ring-[#0f2e13]"
                                />
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Selected Return Summary & Execution Controls */}
              {selectedReturnItems.length > 0 && (
                <div className="bg-white p-5 rounded-xl border border-[#0f2e13]/20 space-y-4 shadow-xs">
                  <h4 className="font-black text-xs uppercase text-[#0f2e13] border-b border-[#0f2e13]/10 pb-2">
                    Return Confirmation Summary
                  </h4>

                  <div className="space-y-2">
                    {selectedReturnItems.map((item) => (
                      <div key={item.saleItemId} className="flex justify-between items-center text-xs font-semibold">
                        <span>
                          {item.product_name} <span className="font-black text-[#0f2e13]">({item.return_quantity} × Rs. {item.unit_price.toLocaleString()})</span>
                        </span>
                        <span className="font-mono font-bold text-emerald-800">
                          Rs. {(item.return_quantity * item.per_unit_refund).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-3 border-t border-[#0f2e13]/15">
                    <div className="flex flex-col gap-2 flex-1">
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                          <input
                            type="checkbox"
                            checked={restockToggle}
                            onChange={(e) => setRestockToggle(e.target.checked)}
                            className="rounded border-[#0f2e13]/30 text-[#0f2e13] focus:ring-[#0f2e13]"
                          />
                          Restock returned items to inventory
                        </label>
                      </div>
                      <input
                        type="text"
                        placeholder="Reason for return (optional)"
                        value={returnReason}
                        onChange={(e) => setReturnReason(e.target.value)}
                        className="bg-white border border-[#0f2e13]/20 rounded-lg px-3 py-1.5 text-xs font-semibold text-[#0f2e13] focus:outline-none focus:ring-1 focus:ring-[#0f2e13]"
                      />
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0 w-full sm:w-auto">
                      <div className="text-right">
                        <span className="text-[10px] font-black uppercase text-[#0f2e13]/60 block">Estimated Refund Total</span>
                        <span className="text-xl font-black text-emerald-800">Rs. {estimatedRefundTotal.toLocaleString()}</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleSubmitReturn}
                        disabled={isSubmitting}
                        className="w-full sm:w-auto bg-emerald-700 text-white font-black text-xs uppercase px-6 py-2.5 rounded-xl hover:bg-emerald-800 disabled:opacity-50 transition cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                      >
                        {isSubmitting ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" /> Processing Return...
                          </>
                        ) : (
                          'Confirm & Process Return'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#0f2e13]/5 border-t border-[#0f2e13]/10 flex justify-between items-center text-xs font-bold text-[#0f2e13]/70">
          <span>Returns are strictly business-scoped and validated server-side.</span>
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-white border border-[#0f2e13]/20 rounded-xl hover:bg-gray-100 text-[#0f2e13] cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
