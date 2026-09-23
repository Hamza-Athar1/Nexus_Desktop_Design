import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Search, Calendar, Eye, RotateCcw, X } from 'lucide-react';
import ViewInvoiceModal from '../../components/Admin/ViewInvoiceModal';
import { getSales, getSaleById, processReturn } from '../../lib/salesService.js';

export default function AdminSalesReturnsPage() {
  const { setHeaderDetails } = useOutletContext() || {};
  const { user } = useAuth();

  const [salesList, setSalesList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Return Process Modal State
  const [returnTargetSale, setReturnTargetSale] = useState(null);
  const [returnItems, setReturnItems] = useState([]); // [{ productId, product_name, original_quantity, returnable_quantity, return_quantity, unit_price }]
  const [restockToggle, setRestockToggle] = useState(true);
  const [returnReason, setReturnReason] = useState('Customer return');
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);

  useEffect(() => {
    if (setHeaderDetails) {
      setHeaderDetails({
        title: user?.businessName?.toUpperCase() || 'IMTIAZ SUPER MARKET',
        subtitle: null,
      });
    }
  }, [setHeaderDetails, user]);

  const fetchSalesData = async () => {
    setIsLoading(true);
    try {
      const res = await getSales();
      if (res.ok && res.data?.sales) {
        setSalesList(res.data.sales);
      } else {
        setSalesList([]);
      }
    } catch {
      setSalesList([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, []);

  const openReturnModal = async (saleHeader) => {
    try {
      const res = await getSaleById(saleHeader.id);
      if (res.ok && res.data?.sale) {
        const fullSale = res.data.sale;
        setReturnTargetSale(fullSale);
        setReturnItems(
          (fullSale.items || []).map((i) => {
            const retQty = Number(i.returned_quantity || i.returnedQuantity || 0);
            const origQty = Number(i.quantity || i.qty || 1);
            const returnable = Math.max(0, origQty - retQty);
            return {
              saleItemId: Number(i.id),
              productId: Number(i.product_id || i.productId),
              product_name: i.product_name || i.name || `Product #${i.product_id}`,
              original_quantity: origQty,
              returned_quantity: retQty,
              returnable_quantity: returnable,
              return_quantity: 0,
              unit_price: Number(i.unit_price || i.price || 0),
            };
          })
        );
        setRestockToggle(true);
        setReturnReason('Customer return');
      }
    } catch (err) {
      alert(`Error loading sale detail: ${err.message}`);
    }
  };

  const handleQuantityChange = (saleItemId, qtyVal) => {
    setReturnItems((prev) =>
      prev.map((item) => {
        if (item.saleItemId === saleItemId) {
          const parsed = Math.max(0, Math.min(item.returnable_quantity, parseInt(qtyVal) || 0));
          return { ...item, return_quantity: parsed };
        }
        return item;
      })
    );
  };

  const submitReturnRequest = async () => {
    const selected = returnItems.filter((i) => i.return_quantity > 0);
    if (selected.length === 0) {
      alert('Please enter a return quantity greater than 0 for at least one item.');
      return;
    }

    setIsSubmittingReturn(true);
    try {
      const payload = {
        saleId: Number(returnTargetSale.id),
        items: selected.map((i) => ({
          saleItemId: i.saleItemId,
          productId: i.productId,
          quantity: i.return_quantity,
        })),
        restock: restockToggle,
        reason: returnReason,
      };

      const res = await processReturn(payload);
      if (!res.ok) {
        throw new Error(res.data?.message || 'Return processing failed');
      }

      const refundAmt = res.data.refund?.totalRefundAmount ?? res.data.refund?.total_refund_amount ?? res.data.refundAmount ?? 0;
      alert(`Return Processed Successfully! Refund Amount: Rs. ${refundAmt}`);
      setReturnTargetSale(null);
      fetchSalesData(); // Refresh history with new status
    } catch (err) {
      alert(`Return Failed: ${err.message}`);
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  const handleViewDetails = async (sale) => {
    try {
      const res = await getSaleById(sale.id);
      if (res.ok && res.data?.sale) {
        setSelectedInvoice(res.data.sale);
      } else {
        setSelectedInvoice(sale);
      }
    } catch {
      setSelectedInvoice(sale);
    }
  };

  // Filter returns/sales based on search term
  const filteredSales = useMemo(() => {
    return salesList.filter((item) => {
      const invNo = item.invoice_number || item.invoiceNo || '';
      const term = searchTerm.toLowerCase();
      return invNo.toLowerCase().includes(term);
    });
  }, [salesList, searchTerm]);

  const returnedSalesCount = salesList.filter((s) => s.status === 'refunded' || s.status === 'partially_refunded').length;

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1600px] mx-auto pb-12">
      {/* ── Page Header / Sub-nav Title & Filter Controls ── */}
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-black text-[#0c3818] tracking-tight">Sales</h1>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <h2 className="text-2xl font-black text-[#0c3818] tracking-tight shrink-0">
            Sales & Returns Management
          </h2>

          {/* Search, Date Filters & TOTAL RETURNS Badge */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-72 min-w-[200px]">
              <input
                type="text"
                placeholder="Search by invoice number"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-[#0c3818]/30 rounded-xl px-4 py-2.5 pr-10 text-sm font-semibold text-[#0c3818] placeholder-[#607455]/70 focus:outline-none focus:border-[#0c3818] shadow-xs transition"
              />
              <Search
                size={18}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0c3818]/60 pointer-events-none"
              />
            </div>

            {/* Start Date */}
            <div className="relative w-full sm:w-44">
              <input
                type="text"
                placeholder="Start Date"
                onFocus={(e) => (e.target.type = 'date')}
                onBlur={(e) => {
                  if (!e.target.value) e.target.type = 'text';
                }}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-white border border-[#0c3818]/30 rounded-xl px-4 py-2.5 pr-10 text-sm font-semibold text-[#0c3818] placeholder-[#607455]/70 focus:outline-none focus:border-[#0c3818] shadow-xs transition"
              />
              <Calendar
                size={18}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0c3818]/60 pointer-events-none"
              />
            </div>

            {/* End Date */}
            <div className="relative w-full sm:w-44">
              <input
                type="text"
                placeholder="End Date"
                onFocus={(e) => (e.target.type = 'date')}
                onBlur={(e) => {
                  if (!e.target.value) e.target.type = 'text';
                }}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-white border border-[#0c3818]/30 rounded-xl px-4 py-2.5 pr-10 text-sm font-semibold text-[#0c3818] placeholder-[#607455]/70 focus:outline-none focus:border-[#0c3818] shadow-xs transition"
              />
              <Calendar
                size={18}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0c3818]/60 pointer-events-none"
              />
            </div>

            {/* TOTAL RETURNS Badge */}
            <div className="bg-[#fde8e8] border border-[#f8b4ab] text-[#8b1e10] rounded-xl px-4 py-2 flex items-center justify-center gap-2 shadow-xs shrink-0 select-none">
              <span className="text-xs sm:text-sm font-black uppercase tracking-wider">
                REFUNDED SALES
              </span>
              <span className="text-base sm:text-lg font-black leading-none ml-1">
                {returnedSalesCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Returns Table ── */}
      <div className="bg-white/70 border border-[#0c3818]/25 rounded-2xl overflow-hidden shadow-xs w-full">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[#e9e5cb] border-b border-[#0c3818]/20 text-[#0c3818] text-sm lg:text-base font-black">
                <th className="py-4 px-6">Invoice #</th>
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6 text-center">Total Amount (PKR)</th>
                <th className="py-4 px-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0c3818]/15 bg-white/60">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-[#0c3818] font-bold">
                    Loading sales records...
                  </td>
                </tr>
              ) : filteredSales.length > 0 ? (
                filteredSales.map((sale) => {
                  const invNo = sale.invoice_number || sale.invoiceNo || `INV-${sale.id}`;
                  const dateStr = sale.created_at
                    ? new Date(sale.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                    : (sale.date || '-');
                  const totalAmt = Number(sale.total_amount ?? sale.amount ?? 0);
                  const status = sale.status || 'completed';

                  return (
                    <tr
                      key={sale.id}
                      className="hover:bg-[#efeacb]/40 transition-colors text-[#0c3818] font-bold text-sm lg:text-base"
                    >
                      <td className="py-4.5 px-6 font-black tracking-tight">{invNo}</td>
                      <td className="py-4.5 px-6 text-[#0c3818]/90 font-semibold">{dateStr}</td>
                      <td className="py-4.5 px-6 text-center">
                        <span className={`text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                          status === 'refunded' ? 'bg-red-100 text-red-700' :
                          status === 'partially_refunded' ? 'bg-amber-100 text-amber-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {status}
                        </span>
                      </td>
                      <td className="py-4.5 px-6 text-center font-black text-base lg:text-lg">
                        {totalAmt.toLocaleString('en-IN')}
                      </td>
                      <td className="py-4.5 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {status !== 'refunded' && (
                            <button
                              onClick={() => openReturnModal(sale)}
                              title="Process Return"
                              className="px-3 py-1.5 rounded-lg bg-[#8b1e10] hover:bg-[#6c160c] text-white text-xs font-bold transition flex items-center gap-1 shadow-xs"
                            >
                              <RotateCcw size={14} />
                              Return
                            </button>
                          )}
                          <button
                            onClick={() => handleViewDetails(sale)}
                            title="View Invoice Details"
                            className="p-2 rounded-full hover:bg-[#0c3818]/10 text-[#0c3818] hover:text-[#10b981] transition cursor-pointer inline-flex items-center justify-center"
                          >
                            <Eye size={20} className="stroke-[2.2]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="py-10 text-center text-[#607455] font-bold">
                    No sales records found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Process Return Modal ── */}
      {returnTargetSale && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#f2edd4] border border-[#0c3818]/30 rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-[#0c3818]/20 pb-3">
              <div>
                <h3 className="text-xl font-black text-[#0c3818]">Process Sale Return</h3>
                <p className="text-xs font-bold text-gray-600">
                  Invoice: {returnTargetSale.invoice_number || `INV-${returnTargetSale.id}`}
                </p>
              </div>
              <button
                onClick={() => setReturnTargetSale(null)}
                className="text-gray-600 hover:text-gray-900 p-1"
              >
                <X size={20} />
              </button>
            </div>

            {/* Return items table */}
            <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1">
              {returnItems.map((item) => (
                <div key={item.saleItemId} className="bg-white p-3 rounded-xl border border-gray-200 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#0c3818] text-sm">{item.product_name}</span>
                    <span className="font-mono text-xs font-bold text-gray-600">Rs. {item.unit_price} / unit</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-medium text-gray-500">
                    <span>Purchased: {item.original_quantity} | Returned: {item.returned_quantity} | Returnable: {item.returnable_quantity}</span>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-[#0c3818]">Qty to Return:</span>
                      <input
                        type="number"
                        min="0"
                        max={item.returnable_quantity}
                        disabled={item.returnable_quantity === 0}
                        value={item.return_quantity}
                        onChange={(e) => handleQuantityChange(item.saleItemId, e.target.value)}
                        className="w-16 border border-gray-300 rounded px-2 py-1 text-center font-bold text-[#0c3818] outline-none focus:border-[#0c3818]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Restock & Reason Controls */}
            <div className="flex flex-col gap-3 pt-2 border-t border-[#0c3818]/20">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-[#0c3818]">
                <input
                  type="checkbox"
                  checked={restockToggle}
                  onChange={(e) => setRestockToggle(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0c3818] focus:ring-[#0c3818]"
                />
                Restock returned products into inventory (Restock = true)
              </label>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#0c3818]">Reason for Return:</label>
                <input
                  type="text"
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs font-medium text-[#0c3818] outline-none focus:border-[#0c3818]"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-3">
              <button
                onClick={() => setReturnTargetSale(null)}
                className="px-4 py-2 border border-gray-400 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={submitReturnRequest}
                disabled={isSubmittingReturn}
                className={`px-5 py-2 bg-[#8b1e10] hover:bg-[#6c160c] text-white text-xs font-extrabold rounded-xl transition ${
                  isSubmittingReturn ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmittingReturn ? 'Processing Return...' : 'Confirm Return & Refund'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Invoice Details Modal ── */}
      <ViewInvoiceModal
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
      />
    </div>
  );
}
