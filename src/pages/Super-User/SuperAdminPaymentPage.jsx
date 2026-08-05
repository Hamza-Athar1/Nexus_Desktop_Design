import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { apiFetchJson } from '../../lib/api';

// POS module options: label shown in the UI, code sent to the API
const MODULE_OPTIONS = [
  { label: 'All POS - Overview', code: '' },
  { label: 'Bakery POS',        code: 'bakery' },
  { label: 'Grocery POS',       code: 'grocery' },
  { label: 'Pharmacy POS',      code: 'pharmacy' },
  { label: 'Clothing POS',      code: 'clothing' },
  { label: 'Electronics POS',   code: 'electronics' },
  { label: 'Restaurant POS',    code: 'restaurant' },
  { label: 'General Store POS', code: 'general_store' },
];

function subtractMonths(n) {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d.toISOString().slice(0, 10);
}

export default function SuperAdminPaymentPage() {
  const { setHeaderDetails } = useOutletContext() || {};
  const [payments, setPayments]         = useState([]);
  const [moduleStats, setModuleStats]   = useState(null);
  const [loadingData, setLoadingData]   = useState(true);

  const [selectedMod, setSelectedMod]   = useState(MODULE_OPTIONS[0]);
  const [timeFilter, setTimeFilter]     = useState('all');
  const [startDate, setStartDate]       = useState('');
  const [endDate, setEndDate]           = useState('');
  const [appliedStart, setAppliedStart] = useState('');
  const [appliedEnd, setAppliedEnd]     = useState('');

  const [startFocus, setStartFocus] = useState(false);
  const [endFocus,   setEndFocus]   = useState(false);
  const [showModDrop, setShowModDrop] = useState(false);

  const startRef = useRef(null);
  const endRef   = useRef(null);

  useEffect(() => {
    if (setHeaderDetails) {
      setHeaderDetails({
        title: 'Payment',
        subtitle: (
          <>
            <span>Payment overview</span>
            <span className="text-[#14391a]/30">•</span>
            <span>{timeFilter === 'all' ? 'All time' : timeFilter === '6months' ? 'Last 6 months' : 'Last 12 months'}</span>
          </>
        )
      });
    }
  }, [timeFilter, setHeaderDetails]);

  const isOverview = selectedMod.code === '';

  // ── Data fetching ─────────────────────────────────────────────────────────
  const buildParams = useCallback(() => {
    const p = new URLSearchParams();
    if (selectedMod.code) p.set('moduleCode', selectedMod.code);

    if (appliedStart) {
      p.set('startDate', appliedStart);
    } else if (timeFilter === '6months') {
      p.set('startDate', subtractMonths(6));
    } else if (timeFilter === '12months') {
      p.set('startDate', subtractMonths(12));
    }

    if (appliedEnd) p.set('endDate', appliedEnd);
    return p.toString();
  }, [selectedMod, timeFilter, appliedStart, appliedEnd]);

  const loadPayments = useCallback(async () => {
    setLoadingData(true);
    const qs = buildParams();
    const { ok, data } = await apiFetchJson(`/admin/payment${qs ? '?' + qs : ''}`);
    if (ok) setPayments(data.payments);
    setLoadingData(false);
  }, [buildParams]);

  const loadModuleStats = useCallback(async () => {
    if (!selectedMod.code) { setModuleStats(null); return; }
    const { ok, data } = await apiFetchJson(`/admin/payment/stats?moduleCode=${selectedMod.code}`);
    if (ok) setModuleStats(data.stats);
  }, [selectedMod]);

  useEffect(() => { loadPayments(); },     [loadPayments]);
  useEffect(() => { loadModuleStats(); }, [loadModuleStats]);

  const handleApply = () => {
    setAppliedStart(startDate);
    setAppliedEnd(endDate);
  };

  // ── Tab helper ────────────────────────────────────────────────────────────
  const timeCls = (key) =>
    `px-5 py-2.5 rounded-[10px] font-extrabold text-sm border transition duration-200 cursor-pointer ${
      timeFilter === key
        ? 'bg-[#113819] text-white border-[#113819] shadow-xs'
        : 'bg-[#faf8ed] text-[#14391a] border-[#14391a]/30 hover:bg-[#eae4c9]'
    }`;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col font-sans select-none text-[#14391a]">
      {/* Header */}
      <div className="mb-6 lg:hidden">
        <h1 className="text-4xl sm:text-[44px] font-extrabold tracking-tight text-[#14391a] mb-1 leading-none">
          Payment
        </h1>
        <p className="text-sm sm:text-base text-[#14391a]/70 font-semibold flex items-center gap-2 mt-2">
          <span>Payment overview</span>
          <span className="text-[#14391a]/30">•</span>
          <span>{timeFilter === 'all' ? 'All time' : timeFilter === '6months' ? 'Last 6 months' : 'Last 12 months'}</span>
        </p>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-wrap items-center gap-3.5 mb-7 relative z-30">
        {/* POS module dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowModDrop(!showModDrop)}
            className="bg-[#fdfce8]/90 border border-[#14391a]/20 text-[#14391a] text-sm font-extrabold rounded-[10px] pl-4 pr-10 py-2.5 outline-none cursor-pointer focus:ring-1 focus:ring-[#14391a]/30 min-w-[210px] text-left flex items-center justify-between"
          >
            <span>{selectedMod.label}</span>
            <span className="text-xs font-bold ml-2">▼</span>
          </button>
          {showModDrop && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowModDrop(false)} />
              <div className="absolute left-0 top-full mt-1 w-[240px] bg-[#fbf9f0] border border-[#14391a]/15 rounded-xl shadow-xl z-50 p-2.5 flex flex-col gap-1.5">
                {MODULE_OPTIONS.map(opt => {
                  const isSel = selectedMod.code === opt.code;
                  return (
                    <button
                      key={opt.code}
                      type="button"
                      onClick={() => { setSelectedMod(opt); setShowModDrop(false); }}
                      className={`w-full text-left px-3 py-2 text-[13.5px] font-bold rounded-lg transition cursor-pointer flex items-center gap-3 ${
                        isSel ? 'bg-[#e4dcbc] text-[#14391a]' : 'text-[#14391a] hover:bg-gray-100'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isSel ? 'border-[#14391a]' : 'border-[#14391a]/40'}`}>
                        {isSel && <span className="w-1.5 h-1.5 rounded-full bg-[#14391a]" />}
                      </span>
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Time filter buttons */}
        <button type="button" onClick={() => { setTimeFilter('all'); setAppliedStart(''); setAppliedEnd(''); }} className={timeCls('all')}>All</button>
        <button type="button" onClick={() => { setTimeFilter('6months'); setAppliedStart(''); setAppliedEnd(''); }} className={timeCls('6months')}>6 months</button>
        <button type="button" onClick={() => { setTimeFilter('12months'); setAppliedStart(''); setAppliedEnd(''); }} className={timeCls('12months')}>12 months</button>

        {/* Start date */}
        <div className="relative flex items-center">
          <input
            ref={startRef}
            type={startFocus || startDate ? 'date' : 'text'}
            onFocus={() => setStartFocus(true)}
            onBlur={() => setStartFocus(false)}
            placeholder="Start Date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="px-4 py-2.5 pr-9 bg-[#faf8ed] text-[#14391a] text-sm font-extrabold border border-[#14391a]/30 rounded-[10px] focus:outline-none placeholder:text-[#14391a]/70 w-[170px] cursor-pointer"
          />
          <button type="button" onClick={() => { setStartFocus(true); setTimeout(() => { startRef.current?.focus(); startRef.current?.showPicker?.(); }, 0); }}
            className="absolute right-3 text-[#14391a]/70 hover:text-[#14391a] cursor-pointer flex items-center justify-center p-0.5">
            <Calendar size={16} />
          </button>
        </div>

        {/* End date */}
        <div className="relative flex items-center">
          <input
            ref={endRef}
            type={endFocus || endDate ? 'date' : 'text'}
            onFocus={() => setEndFocus(true)}
            onBlur={() => setEndFocus(false)}
            placeholder="End Date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="px-4 py-2.5 pr-9 bg-[#faf8ed] text-[#14391a] text-sm font-extrabold border border-[#14391a]/30 rounded-[10px] focus:outline-none placeholder:text-[#14391a]/70 w-[170px] cursor-pointer"
          />
          <button type="button" onClick={() => { setEndFocus(true); setTimeout(() => { endRef.current?.focus(); endRef.current?.showPicker?.(); }, 0); }}
            className="absolute right-3 text-[#14391a]/70 hover:text-[#14391a] cursor-pointer flex items-center justify-center p-0.5">
            <Calendar size={16} />
          </button>
        </div>

        <button
          type="button"
          onClick={handleApply}
          className="px-5 py-2.5 bg-[#a3c9df] hover:bg-[#b5daef] active:scale-95 text-[#14391a] border border-[#14391a]/30 text-sm font-extrabold rounded-[10px] transition cursor-pointer"
        >
          Apply
        </button>
      </div>

      {/* KPI Cards — only when a specific module is selected */}
      {!isOverview && moduleStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-[#113819] text-white rounded-[14px] p-5 shadow-lg shadow-[#113819]/15 flex flex-col justify-between h-[104px]">
            <span className="text-[13px] font-semibold text-white/95">POS since</span>
            <span className="text-[22px] font-extrabold tracking-tight block leading-tight">
              {moduleStats.posSince ?? '--'}
            </span>
          </div>
          <div className="bg-[#113819] text-white rounded-[14px] p-5 shadow-lg shadow-[#113819]/15 flex flex-col justify-between h-[104px]">
            <span className="text-[13px] font-semibold text-white/95">Time using POS</span>
            <span className="text-[22px] font-extrabold tracking-tight text-[#d2a233] block leading-tight">
              {moduleStats.timeUsingPOS ?? '--'}
            </span>
          </div>
          <div className="bg-[#113819] text-white rounded-[14px] p-5 shadow-lg shadow-[#113819]/15 flex flex-col justify-between h-[104px]">
            <span className="text-[13px] font-semibold text-white/95">Payments made</span>
            <span className="text-[22px] font-extrabold tracking-tight block leading-tight">
              {moduleStats.paymentsMade}
            </span>
          </div>
          <div className="bg-[#113819] text-white rounded-[14px] p-5 shadow-lg shadow-[#113819]/15 flex flex-col justify-between h-[104px]">
            <span className="text-[13px] font-semibold text-white/95">Total paid</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-extrabold text-[#d2a233]">Rs</span>
              <span className="text-2xl font-extrabold tracking-tight text-[#d2a233]">
                {Number(moduleStats.totalPaid).toLocaleString('en-PK', { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Payments table */}
      <div className="bg-[#ede7cd] rounded-[18px] border border-[#14391a]/20 shadow-xs">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-[#e4dcbc] border-b border-[#14391a]/15 text-[14px] font-extrabold tracking-wider text-[#14391a]">
              <th className="py-4.5 px-6">{isOverview ? 'Business' : 'Invoice'}</th>
              <th className="py-4.5 px-6">Amount</th>
              <th className="py-4.5 px-6">Status</th>
              <th className="py-4.5 px-6">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#14391a]/10 bg-[#fbf9f0]">
            {loadingData && (
              <tr>
                <td colSpan="4" className="py-8 text-center text-sm text-[#14391a]/60 font-medium">
                  Loading payments…
                </td>
              </tr>
            )}
            {!loadingData && payments.map(row => (
              <tr key={row.id} className="hover:bg-[#e9e3cb]/30 transition text-sm text-[#14391a]">
                <td className="py-4.5 px-6 font-extrabold">
                  {isOverview ? row.businessName : row.invoiceNumber}
                </td>
                <td className="py-4.5 px-6 font-bold">Rs {row.amount}</td>
                <td className="py-4.5 px-6">
                  <span className={`inline-block px-3 py-1 rounded-[6px] text-[11px] font-extrabold uppercase ${
                    row.status === 'paid'    ? 'bg-[#cbebc7] text-[#14391a]' :
                    row.status === 'overdue' ? 'bg-[#f7d6d3] text-[#99221b]' :
                                               'bg-[#f6edc1] text-[#78590d]'
                  }`}>
                    {row.status}
                  </span>
                </td>
                <td className="py-4.5 px-6 font-bold">{row.date}</td>
              </tr>
            ))}
            {!loadingData && payments.length === 0 && (
              <tr>
                <td colSpan="4" className="py-8 text-center text-sm text-[#14391a]/70 font-medium">
                  No payment records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
