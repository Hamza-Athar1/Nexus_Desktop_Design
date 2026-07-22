import React, { useState, useRef } from 'react';
import { Calendar } from 'lucide-react';

const INITIAL_PAYMENTS = [
  {
    id: 1,
    invoice: 'INV-0231',
    user: 'Piato Bakery',
    module: 'BAKERY POS',
    amount: '4,500',
    status: 'paid', // paid | overdue | pending
    date: '2026-07-14',
  },
  {
    id: 2,
    invoice: 'INV-0789',
    user: 'Fairy Parcel Co.',
    module: 'GROCERY POS',
    amount: '6,000',
    status: 'paid',
    date: '2026-07-02',
  },
  {
    id: 3,
    invoice: 'INV-0801',
    user: 'Green valley Grocers',
    module: 'GROCERY POS',
    amount: '5,200',
    status: 'overdue',
    date: '2026-06-25',
  },
  {
    id: 4,
    invoice: 'INV-0211',
    user: 'Rafi Restaurant Co.',
    module: 'CLOTHING POS',
    amount: '2,800',
    status: 'pending',
    date: '2026-01-23',
  },
  {
    id: 5,
    invoice: 'INV-0222',
    user: 'Sunrise Market',
    module: 'PHARMACY POS',
    amount: '3,000',
    status: 'paid',
    date: '2025-12-02',
  },
  {
    id: 6,
    invoice: 'INV-0232',
    user: 'Dvago',
    module: 'PHARMACY POS',
    amount: '2,600',
    status: 'paid',
    date: '2026-04-19',
  },
  {
    id: 7,
    invoice: 'INV-1100',
    user: 'Sowears',
    module: 'CLOTHING POS',
    amount: '8,800',
    status: 'overdue',
    date: '2026-08-15',
  },
];

export default function SuperAdminPaymentPage() {
  const [payments] = useState(INITIAL_PAYMENTS);
  const [selectedPos, setSelectedPos] = useState('All POS - Overview');
  const [timeFilter, setTimeFilter] = useState('all'); // 'all', '6months', '12months'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startDateFocus, setStartDateFocus] = useState(false);
  const [endDateFocus, setEndDateFocus] = useState(false);
  const [appliedStartDate, setAppliedStartDate] = useState('');
  const [appliedEndDate, setAppliedEndDate] = useState('');

  const startDateRef = useRef(null);
  const endDateRef = useRef(null);

  const [showPosDropdown, setShowPosDropdown] = useState(false);

  // Handle Apply button click for custom date range
  const handleApplyDateFilter = () => {
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
  };

  // Filtered payment records
  const filteredPayments = payments.filter((item) => {
    // Filter by selected POS Module
    if (selectedPos !== 'All POS - Overview') {
      if (item.module.toLowerCase() !== selectedPos.toLowerCase()) return false;
    }

    // 1. Time Filter (6 months vs 12 months vs All)
    if (timeFilter === '6months') {
      const itemDate = new Date(item.date);
      const cutoffDate = new Date('2026-01-01');
      if (itemDate < cutoffDate) return false;
    } else if (timeFilter === '12months') {
      const itemDate = new Date(item.date);
      const cutoffDate = new Date('2025-07-01');
      if (itemDate < cutoffDate) return false;
    }

    // 2. Custom Date Range Filter (Applied Start Date & End Date)
    if (appliedStartDate) {
      if (item.date < appliedStartDate) return false;
    }
    if (appliedEndDate) {
      if (item.date > appliedEndDate) return false;
    }

    return true;
  });

  const isModuleOverview = selectedPos === 'All POS - Overview';

  const posOptions = [
    'All POS - Overview',
    'Bakery POS',
    'Grocery POS',
    'Pharmacy POS',
    'Clothing POS',
    'Electronics POS',
    'Restaurant POS',
    'General Store POS'
  ];

  return (
    <div className="flex-1 flex flex-col font-sans select-none text-[#14391a]">
      {/* Header section */}
      <div className="mb-6">
        <h1 className="text-4xl sm:text-[44px] font-extrabold tracking-tight text-[#14391a] mb-1 leading-none">
          Payment
        </h1>
        <p className="text-sm sm:text-base text-[#14391a]/70 font-semibold flex items-center gap-2 mt-2">
          <span>Payment overview</span>
          <span className="text-[#14391a]/30">•</span>
          <span>Last 6 months</span>
        </p>
      </div>

      {/* Filter Action Controls Toolbar */}
      <div className="flex flex-wrap items-center gap-3.5 mb-7 relative z-30">
        {/* Custom Interactive POS selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowPosDropdown(!showPosDropdown)}
            className="bg-[#fdfce8]/90 border border-[#14391a]/20 text-[#14391a] text-sm font-extrabold rounded-[10px] pl-4 pr-10 py-2.5 outline-none cursor-pointer focus:ring-1 focus:ring-[#14391a]/30 min-w-[210px] text-left flex items-center justify-between"
          >
            <span>{selectedPos}</span>
            <span className="text-xs font-bold ml-2">▼</span>
          </button>
          
          {showPosDropdown && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowPosDropdown(false)} />
              <div className="absolute left-0 top-full mt-1 w-[240px] bg-[#fbf9f0] border border-[#14391a]/15 rounded-xl shadow-xl z-50 p-2.5 flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                {posOptions.map((opt) => {
                  const isSelected = selectedPos === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setSelectedPos(opt);
                        setShowPosDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-[13.5px] font-bold rounded-lg transition cursor-pointer flex items-center gap-3 ${
                        isSelected 
                          ? 'bg-[#e4dcbc] text-[#14391a]' 
                          : 'text-[#14391a] hover:bg-gray-100'
                      }`}
                    >
                      {/* Custom Radio Icon */}
                      <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-[#14391a]' : 'border-[#14391a]/40'
                      }`}>
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#14391a]" />
                        )}
                      </span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setTimeFilter('all')}
          className={`px-5 py-2.5 rounded-[10px] font-extrabold text-sm border transition duration-200 cursor-pointer ${timeFilter === 'all'
            ? 'bg-[#113819] text-white border-[#113819] shadow-xs'
            : 'bg-[#faf8ed] text-[#14391a] border-[#14391a]/30 hover:bg-[#eae4c9]'
            }`}
        >
          All
        </button>

        <button
          type="button"
          onClick={() => setTimeFilter('6months')}
          className={`px-5 py-2.5 rounded-[10px] font-extrabold text-sm border transition duration-200 cursor-pointer ${timeFilter === '6months'
            ? 'bg-[#113819] text-white border-[#113819] shadow-xs'
            : 'bg-[#faf8ed] text-[#14391a] border-[#14391a]/30 hover:bg-[#eae4c9]'
            }`}
        >
          6 months
        </button>

        <button
          type="button"
          onClick={() => setTimeFilter('12months')}
          className={`px-5 py-2.5 rounded-[10px] font-extrabold text-sm border transition duration-200 cursor-pointer ${timeFilter === '12months'
            ? 'bg-[#113819] text-white border-[#113819] shadow-xs'
            : 'bg-[#faf8ed] text-[#14391a] border-[#14391a]/30 hover:bg-[#eae4c9]'
            }`}
        >
          12 months
        </button>

        {/* Start Date Picker */}
        <div className="relative flex items-center">
          <input
            ref={startDateRef}
            type={startDateFocus || startDate ? 'date' : 'text'}
            onFocus={() => setStartDateFocus(true)}
            onBlur={() => setStartDateFocus(false)}
            placeholder="Start Date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-4 py-2.5 pr-9 bg-[#faf8ed] text-[#14391a] text-sm font-extrabold border border-[#14391a]/30 rounded-[10px] focus:outline-none placeholder:text-[#14391a]/70 w-[170px] cursor-pointer"
          />
          <button
            type="button"
            onClick={() => {
              setStartDateFocus(true);
              setTimeout(() => {
                if (startDateRef.current) {
                  startDateRef.current.focus();
                  if (typeof startDateRef.current.showPicker === 'function') {
                    startDateRef.current.showPicker();
                  }
                }
              }, 0);
            }}
            className="absolute right-3 text-[#14391a]/70 hover:text-[#14391a] cursor-pointer flex items-center justify-center p-0.5"
          >
            <Calendar size={16} />
          </button>
        </div>

        {/* End Date Picker */}
        <div className="relative flex items-center">
          <input
            ref={endDateRef}
            type={endDateFocus || endDate ? 'date' : 'text'}
            onFocus={() => setEndDateFocus(true)}
            onBlur={() => setEndDateFocus(false)}
            placeholder="End Date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-4 py-2.5 pr-9 bg-[#faf8ed] text-[#14391a] text-sm font-extrabold border border-[#14391a]/30 rounded-[10px] focus:outline-none placeholder:text-[#14391a]/70 w-[170px] cursor-pointer"
          />
          <button
            type="button"
            onClick={() => {
              setEndDateFocus(true);
              setTimeout(() => {
                if (endDateRef.current) {
                  endDateRef.current.focus();
                  if (typeof endDateRef.current.showPicker === 'function') {
                    endDateRef.current.showPicker();
                  }
                }
              }, 0);
            }}
            className="absolute right-3 text-[#14391a]/70 hover:text-[#14391a] cursor-pointer flex items-center justify-center p-0.5"
          >
            <Calendar size={16} />
          </button>
        </div>

        {/* Apply Button */}
        <button
          type="button"
          onClick={handleApplyDateFilter}
          className="px-5 py-2.5 bg-[#a3c9df] hover:bg-[#b5daef] active:scale-95 text-[#14391a] border border-[#14391a]/30 text-sm font-extrabold rounded-[10px] transition cursor-pointer"
        >
          Apply
        </button>
      </div>

      {/* KPI Cards (ONLY visible when a specific POS Module is selected, NOT when All POS - Overview) */}
      {!isModuleOverview && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* Card 1: POS since */}
          <div className="bg-[#113819] text-white rounded-[14px] p-5 shadow-lg shadow-[#113819]/15 flex flex-col justify-between h-[104px]">
            <span className="text-[13px] font-semibold text-white/95">POS since</span>
            <div>
              <span className="text-[22px] font-extrabold tracking-tight block leading-tight">2024-08-02</span>
            </div>
          </div>

          {/* Card 2: Time using POS */}
          <div className="bg-[#113819] text-white rounded-[14px] p-5 shadow-lg shadow-[#113819]/15 flex flex-col justify-between h-[104px]">
            <span className="text-[13px] font-semibold text-white/95">Time using POS</span>
            <div>
              <span className="text-[22px] font-extrabold tracking-tight text-[#d2a233] block leading-tight">1 year 11 months</span>
            </div>
          </div>

          {/* Card 3: Payments made */}
          <div className="bg-[#113819] text-white rounded-[14px] p-5 shadow-lg shadow-[#113819]/15 flex flex-col justify-between h-[104px]">
            <span className="text-[13px] font-semibold text-white/95">Payments made</span>
            <div>
              <span className="text-[22px] font-extrabold tracking-tight block leading-tight">14</span>
            </div>
          </div>

          {/* Card 4: Total paid */}
          <div className="bg-[#113819] text-white rounded-[14px] p-5 shadow-lg shadow-[#113819]/15 flex flex-col justify-between h-[104px]">
            <span className="text-[13px] font-semibold text-white/95">Total paid</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-extrabold text-[#d2a233]">Rs</span>
              <span className="text-2xl font-extrabold tracking-tight text-[#d2a233]">54,000</span>
            </div>
          </div>
        </div>
      )}

      {/* Payment Data Table */}
      <div className="bg-[#ede7cd] rounded-[18px] border border-[#14391a]/20 shadow-xs">
        <div>
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#e4dcbc] border-b border-[#14391a]/15 text-[14px] font-extrabold tracking-wider text-[#14391a]">
                <th className="py-4.5 px-6">{isModuleOverview ? 'User' : 'Invoice'}</th>
                <th className="py-4.5 px-6">Amount</th>
                <th className="py-4.5 px-6">Status</th>
                <th className="py-4.5 px-6">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#14391a]/10 bg-[#fbf9f0]">
              {filteredPayments.map((row) => (
                <tr key={row.id} className="hover:bg-[#e9e3cb]/30 transition text-sm text-[#14391a]">
                  {/* First Column Toggle (User vs Invoice) */}
                  <td className="py-4.5 px-6 font-extrabold text-[#14391a]">
                    {isModuleOverview ? row.user : row.invoice}
                  </td>
                  <td className="py-4.5 px-6 font-bold">Rs {row.amount}</td>
                  <td className="py-4.5 px-6">
                    <span className={`inline-block px-3 py-1 rounded-[6px] text-[11px] font-extrabold uppercase ${row.status === 'paid' ? 'bg-[#cbebc7] text-[#14391a]' : row.status === 'overdue' ? 'bg-[#f7d6d3] text-[#99221b]' : 'bg-[#f6edc1] text-[#78590d]'}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="py-4.5 px-6 font-bold">{row.date}</td>
                </tr>
              ))}
              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-sm text-[#14391a]/70 font-medium">
                    No payment records found matching your query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
