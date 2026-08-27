import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Search, Calendar, Eye, TrendingUp, ShoppingCart } from 'lucide-react';
import ViewInvoiceModal from '../../components/Admin/ViewInvoiceModal';

const INITIAL_SALES_HISTORY = [
  {
    id: '1',
    invoiceNo: 'INV-00080',
    date: '20 Aug 2026  09:30 PM',
    amount: 3137,
    subtotal: 3000,
    laborCharge: 137,
    paidAmount: 3000,
    itemCount: 1,
    items: [
      { name: 'Cooking Oil 2L', qty: 1, price: 3000 },
    ],
  },
  {
    id: '2',
    invoiceNo: 'INV-00081',
    date: '20 Aug 2026  09:00 PM',
    amount: 7000,
    subtotal: 7000,
    laborCharge: 0,
    paidAmount: 7000,
    itemCount: 2,
    items: [
      { name: 'Nestle Milk Pak 1L (Pack of 12)', qty: 2, price: 3500 },
    ],
  },
  {
    id: '3',
    invoiceNo: 'INV-00082',
    date: '20 Aug 2026  08:45 PM',
    amount: 5000,
    subtotal: 5000,
    laborCharge: 0,
    paidAmount: 5000,
    itemCount: 2,
    items: [
      { name: 'Lipton Yellow Label Tea 950g', qty: 2, price: 2500 },
    ],
  },
  {
    id: '4',
    invoiceNo: 'INV-00083',
    date: '20 Aug 2026  08:15 PM',
    amount: 2800,
    subtotal: 2800,
    laborCharge: 0,
    paidAmount: 3000,
    itemCount: 2,
    items: [
      { name: 'Surf Excel Washing Powder 2kg', qty: 1, price: 1400 },
      { name: 'Ariel Powder 1kg', qty: 1, price: 1400 },
    ],
  },
  {
    id: '5',
    invoiceNo: 'INV-00084',
    date: '20 Aug 2026  06:37 PM',
    amount: 3000,
    subtotal: 3000,
    laborCharge: 0,
    paidAmount: 3000,
    itemCount: 2,
    items: [
      { name: 'Tapal Danedar Tea 900g', qty: 2, price: 1500 },
    ],
  },
  {
    id: '6',
    invoiceNo: 'INV-00085',
    date: '20 Aug 2026  06:06 PM',
    amount: 8650,
    subtotal: 8650,
    laborCharge: 0,
    paidAmount: 9000,
    itemCount: 4,
    items: [
      { name: 'Cooking Oil 5L', qty: 2, price: 3200 },
      { name: 'Sugar 5kg', qty: 1, price: 750 },
      { name: 'Wheat Flour 10kg', qty: 1, price: 1500 },
    ],
  },
  {
    id: '7',
    invoiceNo: 'INV-00086',
    date: '20 Aug 2026  05:15 PM',
    amount: 3400,
    subtotal: 3400,
    laborCharge: 0,
    paidAmount: 3500,
    itemCount: 8,
    items: [
      { name: 'Olpers Milk 1L', qty: 6, price: 350 },
      { name: 'Bread Family Pack', qty: 2, price: 650 },
    ],
  },
];

export default function AdminSalesHistoryPage() {
  const { setHeaderDetails } = useOutletContext() || {};
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    if (setHeaderDetails) {
      setHeaderDetails({
        title: user?.businessName?.toUpperCase() || 'IMTIAZ SUPER MARKET',
        subtitle: null,
      });
    }
  }, [setHeaderDetails, user]);

  // Filter invoices based on search term
  const filteredInvoices = useMemo(() => {
    return INITIAL_SALES_HISTORY.filter((item) => {
      const matchesSearch = item.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [searchTerm]);

  const totalInvoicesCount = 98; // Matching the screen summary

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1600px] mx-auto pb-12">
      {/* ── Page Header / Sub-nav Title & Filter Controls ── */}
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-black text-[#0c3818] tracking-tight">Sales</h1>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <h2 className="text-2xl font-black text-[#0c3818] tracking-tight shrink-0">
            Sales History
          </h2>

          {/* Search and Date Filter Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-72">
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
          </div>
        </div>
      </div>

      {/* ── Main Content Area: Table (Left) + Stats Cards (Right) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Sales Table (Left 9 columns) */}
        <div className="lg:col-span-9 bg-white/70 border border-[#0c3818]/25 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[640px]">
              <thead>
                <tr className="bg-[#e9e5cb] border-b border-[#0c3818]/20 text-[#0c3818] text-sm lg:text-base font-black">
                  <th className="py-4 px-6">Invoice #</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6 text-center">Total Amount (PKR)</th>
                  <th className="py-4 px-6 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0c3818]/15 bg-white/60">
                {filteredInvoices.length > 0 ? (
                  filteredInvoices.map((inv) => (
                    <tr
                      key={inv.id}
                      className="hover:bg-[#efeacb]/40 transition-colors text-[#0c3818] font-bold text-sm lg:text-base"
                    >
                      <td className="py-4.5 px-6 font-black tracking-tight">{inv.invoiceNo}</td>
                      <td className="py-4.5 px-6 text-[#0c3818]/90 font-semibold">{inv.date}</td>
                      <td className="py-4.5 px-6 text-center font-black text-base lg:text-lg">
                        {inv.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-4.5 px-6 text-center">
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          title="View Invoice Details"
                          className="p-2 rounded-full hover:bg-[#0c3818]/10 text-[#0c3818] hover:text-[#10b981] transition cursor-pointer inline-flex items-center justify-center"
                        >
                          <Eye size={22} className="stroke-[2.2]" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-10 text-center text-[#607455] font-bold">
                      No invoices found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Side Cards (Right 3 columns) */}
        <div className="lg:col-span-3 flex flex-col sm:flex-row lg:flex-col gap-6">
          {/* Card 1: Total Sales */}
          <div className="flex-1 bg-gradient-to-r from-white via-[#fcfbf4] to-white border-2 border-[#0c3818]/25 rounded-2xl p-6 lg:p-8 flex flex-col items-center justify-center text-center shadow-xs hover:border-[#0c3818]/45 hover:shadow-md transition duration-200 relative overflow-hidden">
            <div className="w-14 h-14 bg-[#8b1e10] text-white rounded-2xl flex items-center justify-center mb-3 shadow-xs">
              <TrendingUp size={28} className="stroke-[2.5]" />
            </div>
            <span className="text-[#607455] font-extrabold text-xs lg:text-sm uppercase tracking-wider">
              Total Sales
            </span>
            <span className="text-[#0c3818] font-black text-2xl lg:text-3xl tracking-tight mt-1">
              Rs 32,987
            </span>
          </div>

          {/* Card 2: Total Invoices */}
          <div className="flex-1 bg-gradient-to-r from-white via-[#fcfbf4] to-white border-2 border-[#0c3818]/25 rounded-2xl p-6 lg:p-8 flex flex-col items-center justify-center text-center shadow-xs hover:border-[#0c3818]/45 hover:shadow-md transition duration-200 relative overflow-hidden">
            <div className="w-14 h-14 bg-[#fce8e4] text-[#8b1e10] rounded-2xl flex items-center justify-center mb-3 shadow-xs">
              <ShoppingCart size={28} className="stroke-[2.5]" />
            </div>
            <span className="text-[#607455] font-extrabold text-xs lg:text-sm uppercase tracking-wider">
              Total Invoices
            </span>
            <span className="text-[#0c3818] font-black text-2xl lg:text-3xl tracking-tight mt-1">
              {totalInvoicesCount}
            </span>
          </div>
        </div>

      </div>

      {/* ── Invoice Details Modal ── */}
      <ViewInvoiceModal
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
      />
    </div>
  );
}
