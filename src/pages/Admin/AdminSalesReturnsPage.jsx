import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Search, Calendar, Eye } from 'lucide-react';
import ViewInvoiceModal from '../../components/Admin/ViewInvoiceModal';

const INITIAL_RETURNS_HISTORY = [
  {
    id: '1',
    returnNo: 'RE-00015',
    invoiceNo: 'INV-00080',
    date: '20 Aug 2026 09:30 PM',
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
    returnNo: 'RE-00009',
    invoiceNo: 'INV-00081',
    date: '20 Aug 2026 09:00 PM',
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
    returnNo: 'RE-00065',
    invoiceNo: 'INV-00082',
    date: '20 Aug 2026 08:45 PM',
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
    returnNo: 'RE-00030',
    invoiceNo: 'INV-00083',
    date: '20 Aug 2026 08:15 PM',
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
    returnNo: 'RE-00022',
    invoiceNo: 'INV-00084',
    date: '20 Aug 2026 06:37 PM',
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
    returnNo: 'RE-00087',
    invoiceNo: 'INV-00085',
    date: '20 Aug 2026 06:06 PM',
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
    returnNo: 'RE-00054',
    invoiceNo: 'INV-00086',
    date: '20 Aug 2026 05:15 PM',
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

export default function AdminSalesReturnsPage() {
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

  // Filter returns based on search term (matching invoiceNo or returnNo)
  const filteredReturns = useMemo(() => {
    return INITIAL_RETURNS_HISTORY.filter((item) => {
      const term = searchTerm.toLowerCase();
      return (
        item.invoiceNo.toLowerCase().includes(term) ||
        item.returnNo.toLowerCase().includes(term)
      );
    });
  }, [searchTerm]);

  const totalReturnsCount = 10; // Matching screenshot total returns badge

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1600px] mx-auto pb-12">
      {/* ── Page Header / Sub-nav Title & Filter Controls ── */}
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-black text-[#0c3818] tracking-tight">Sales</h1>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <h2 className="text-2xl font-black text-[#0c3818] tracking-tight shrink-0">
            Sales History
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
                TOTAL RETURNS
              </span>
              <span className="text-base sm:text-lg font-black leading-none ml-1">
                {totalReturnsCount}
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
                <th className="py-4 px-6">Return #</th>
                <th className="py-4 px-6">Invoice #</th>
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6 text-center">Total Amount (PKR)</th>
                <th className="py-4 px-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0c3818]/15 bg-white/60">
              {filteredReturns.length > 0 ? (
                filteredReturns.map((ret) => (
                  <tr
                    key={ret.id}
                    className="hover:bg-[#efeacb]/40 transition-colors text-[#0c3818] font-bold text-sm lg:text-base"
                  >
                    <td className="py-4.5 px-6 font-black tracking-tight">{ret.returnNo}</td>
                    <td className="py-4.5 px-6 font-black tracking-tight">{ret.invoiceNo}</td>
                    <td className="py-4.5 px-6 text-[#0c3818]/90 font-semibold">{ret.date}</td>
                    <td className="py-4.5 px-6 text-center font-black text-base lg:text-lg">
                      {ret.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-4.5 px-6 text-center">
                      <button
                        onClick={() => setSelectedInvoice(ret)}
                        title="View Return Details"
                        className="p-2 rounded-full hover:bg-[#0c3818]/10 text-[#0c3818] hover:text-[#10b981] transition cursor-pointer inline-flex items-center justify-center"
                      >
                        <Eye size={22} className="stroke-[2.2]" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-10 text-center text-[#607455] font-bold">
                    No return records found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
