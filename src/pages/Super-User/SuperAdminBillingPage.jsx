import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { MoreHorizontal, TrendingUp, Clock, AlertTriangle, Building2, DollarSign } from 'lucide-react';
import { apiFetchJson } from '../../lib/api';
import BillingDetailsModal   from '../../components/Super-User/BillingDetailsModal';
import InitiateInvoiceModal  from '../../components/Super-User/InitiateInvoiceModal';
import BlockShopModal        from '../../components/Super-User/BlockShopModal';
import SuspendShopModal      from '../../components/Super-User/SuspendShopModal';

// ── helpers ───────────────────────────────────────────────────────────────────
function fmtDate(iso) {
  if (!iso) return '--';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function comma(n) {
  return Number(n).toLocaleString('en-PK', { maximumFractionDigits: 0 });
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function SuperAdminBillingPage() {
  const navigate = useNavigate();
  const { setHeaderDetails } = useOutletContext() || {};
  useEffect(() => {
    if (setHeaderDetails) {
      setHeaderDetails({
        title: 'Billing',
        subtitle: (
          <>
            <span>Revenue overview</span>
            <span className="text-[#14391a]/30">•</span>
            <span>{new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}</span>
          </>
        )
      });
    }
  }, [setHeaderDetails]);

  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState({
    collectedThisMonth: 0,
    pendingSum: 0,
    overdueSum: 0,
    totalInvoices: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeDropdownId, setActiveDropdownId] = useState(null);

  // Modal state
  const [selectedInvoiceId, setSelectedInvoiceId]   = useState(null);
  const [initiatingShop, setInitiatingShop]         = useState(null);
  const [blockingShop, setBlockingShop]             = useState(null);
  const [suspendingShop, setSuspendingShop]         = useState(null);

  // ── Data loading ─────────────────────────────────────────────────────────
  const loadInvoices = useCallback(async () => {
    setLoading(true);
    const { ok, data } = await apiFetchJson('/admin/billing');
    if (ok) { setInvoices(data.invoices); setError(''); }
    else setError('Failed to load billing data.');
    setLoading(false);
  }, []);

  const loadStats = useCallback(async () => {
    const { ok, data } = await apiFetchJson('/admin/billing/stats');
    if (ok) setStats(data.stats);
  }, []);

  useEffect(() => {
    loadInvoices();
    loadStats();
  }, [loadInvoices, loadStats]);

  // ── Filter counts ─────────────────────────────────────────────────────────
  const totalCount     = invoices.length;
  const paidCount      = invoices.filter(i => i.status === 'paid').length;
  const dueCount       = invoices.filter(i => i.status === 'pending').length;
  const defaulterCount = invoices.filter(i => i.status === 'overdue').length;

  const filteredInvoices = invoices.filter(i => {
    if (activeFilter === 'all')       return true;
    if (activeFilter === 'paid')      return i.status === 'paid';
    if (activeFilter === 'due')       return i.status === 'pending';
    if (activeFilter === 'defaulter') return i.status === 'overdue';
    return true;
  });

  // ── Action handlers ───────────────────────────────────────────────────────
  const handleBlockShop = async (businessId, reason) => {
    const { ok } = await apiFetchJson(`/admin/shops/${businessId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'blocked', reason }),
    });
    if (ok) { setBlockingShop(null); loadInvoices(); loadStats(); }
  };

  const handleSuspendShop = async (businessId, reason) => {
    const { ok } = await apiFetchJson(`/admin/shops/${businessId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'suspended', reason }),
    });
    if (ok) { setSuspendingShop(null); loadInvoices(); loadStats(); }
  };

  const handleRevokeAccount = (businessId) => {
    setActiveDropdownId(null);
    navigate(`/super-admin/activate/${businessId}`);
  };

  // ── Tab pill helper ───────────────────────────────────────────────────────
  const tabCls = (key) =>
    `px-5 py-2.5 rounded-[12px] font-bold text-sm border transition duration-200 cursor-pointer ${
      activeFilter === key
        ? 'bg-[#113819] text-white border-[#113819] shadow-sm'
        : 'bg-[#faf8ed] text-[#14391a] border-[#14391a]/30 hover:bg-[#eae4c9]'
    }`;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col font-sans select-none text-[#14391a]">
      {/* Header */}
      <div className="mb-6 lg:hidden">
        <h1 className="text-4xl sm:text-[44px] font-extrabold tracking-tight text-[#14391a] mb-1 leading-none">
          Billing
        </h1>
        <p className="text-sm sm:text-base text-[#14391a]/70 font-semibold flex items-center gap-4 mt-2">
          <span>Revenue overview</span>
          <span>{new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}</span>
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {/* Card 1: Collected this month */}
        <div className="bg-[#0b2b14] rounded-3xl border border-[#2e5c38]/40 p-6 flex items-center justify-between text-[#efeacb] hover:border-[#40804e]/60 transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1 hover:shadow-[0_12px_40px_rgb(0,0,0,0.18)]">
          <div className="flex flex-col gap-2 flex-1 min-w-0 pr-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#a2bc90]/80">
              Collected this month
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-semibold text-white/70">Rs</span>
              <h3 className="text-2xl font-black text-white tracking-tight leading-none">
                {comma(stats.collectedThisMonth)}
              </h3>
            </div>
            <span className="text-[10px] font-medium text-[#a2bc90]/50 mt-1">
              Current cycle
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#071c0d] border border-[#2e5c38]/40 flex items-center justify-center text-[#a2bc90] shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] shrink-0">
            <TrendingUp size={20} className="stroke-[1.75]" />
          </div>
        </div>

        {/* Card 2: Pending */}
        <div className="bg-[#0b2b14] rounded-3xl border border-[#2e5c38]/40 p-6 flex items-center justify-between text-[#efeacb] hover:border-[#40804e]/60 transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1 hover:shadow-[0_12px_40px_rgb(0,0,0,0.18)]">
          <div className="flex flex-col gap-2 flex-1 min-w-0 pr-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#a2bc90]/80">
              Pending
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-semibold text-[#d2a233]/70">Rs</span>
              <h3 className="text-2xl font-black text-[#d2a233] tracking-tight leading-none">
                {comma(stats.pendingSum)}
              </h3>
            </div>
            <span className="text-[10px] font-medium text-[#a2bc90]/50 mt-1">
              Awaiting payment
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#071c0d] border border-[#2e5c38]/40 flex items-center justify-center text-[#d2a233] shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] shrink-0">
            <Clock size={20} className="stroke-[1.75]" />
          </div>
        </div>

        {/* Card 3: Overdue */}
        <div className="bg-[#0b2b14] rounded-3xl border border-[#2e5c38]/40 p-6 flex items-center justify-between text-[#efeacb] hover:border-[#40804e]/60 transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1 hover:shadow-[0_12px_40px_rgb(0,0,0,0.18)]">
          <div className="flex flex-col gap-2 flex-1 min-w-0 pr-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#a2bc90]/80">
              Overdue
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-semibold text-[#e5432d]/70">Rs</span>
              <h3 className="text-2xl font-black text-[#e5432d] tracking-tight leading-none">
                {comma(stats.overdueSum)}
              </h3>
            </div>
            <span className="text-[10px] font-medium text-[#e5432d]/80 mt-1 animate-pulse">
              Action required
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#071c0d] border border-[#2e5c38]/40 flex items-center justify-center text-[#e5432d] shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] shrink-0">
            <AlertTriangle size={20} className="stroke-[1.75]" />
          </div>
        </div>

        {/* Card 4: Total businesses */}
        <div className="bg-[#0b2b14] rounded-3xl border border-[#2e5c38]/40 p-6 flex items-center justify-between text-[#efeacb] hover:border-[#40804e]/60 transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1 hover:shadow-[0_12px_40px_rgb(0,0,0,0.18)]">
          <div className="flex flex-col gap-2 flex-1 min-w-0 pr-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#a2bc90]/80">
              Total businesses
            </span>
            <h3 className="text-2xl font-black text-white tracking-tight leading-none">
              {stats.totalInvoices}
            </h3>
            <span className="text-[10px] font-medium text-[#a2bc90]/50 mt-1">
              Active merchants
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#071c0d] border border-[#2e5c38]/40 flex items-center justify-center text-[#a2bc90] shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] shrink-0">
            <Building2 size={20} className="stroke-[1.75]" />
          </div>
        </div>

        {/* Card 5: Total Revenue */}
        <div className="bg-[#0b2b14] rounded-3xl border border-[#2e5c38]/40 p-6 flex items-center justify-between text-[#efeacb] hover:border-[#40804e]/60 transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1 hover:shadow-[0_12px_40px_rgb(0,0,0,0.18)]">
          <div className="flex flex-col gap-2 flex-1 min-w-0 pr-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#a2bc90]/80">
              Total Revenue
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-semibold text-white/70">Rs</span>
              <h3 className="text-2xl font-black text-white tracking-tight leading-none">
                {comma(stats.totalRevenue)}
              </h3>
            </div>
            <span className="text-[10px] font-medium text-[#a2bc90]/50 mt-1">
              Lifetime sales
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#071c0d] border border-[#2e5c38]/40 flex items-center justify-center text-[#a2bc90] shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] shrink-0">
            <DollarSign size={20} className="stroke-[1.75]" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-3.5 mb-7">
        <button type="button" onClick={() => setActiveFilter('all')} className={tabCls('all')}>
          All {totalCount}
        </button>
        <button type="button" onClick={() => setActiveFilter('paid')} className={tabCls('paid')}>
          Paid {paidCount}
        </button>
        <button type="button" onClick={() => setActiveFilter('due')} className={tabCls('due')}>
          Due {dueCount}
        </button>
        <button type="button" onClick={() => setActiveFilter('defaulter')} className={tabCls('defaulter')}>
          Defaulter {defaulterCount}
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#ede7cd] rounded-[18px] border border-[#14391a]/20 shadow-xs">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-[#e4dcbc] border-b border-[#14391a]/15 text-[13px] font-extrabold uppercase tracking-wider text-[#14391a]">
              <th className="py-4.5 px-6">INVOICE</th>
              <th className="py-4.5 px-6">BUSINESS</th>
              <th className="py-4.5 px-6">POS MODULE</th>
              <th className="py-4.5 px-6">AMOUNT</th>
              <th className="py-4.5 px-6">METHOD</th>
              <th className="py-4.5 px-6">DUE DATE</th>
              <th className="py-4.5 px-6 text-center">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#14391a]/10 bg-[#fbf9f0]">
            {loading && (
              <tr>
                <td colSpan="7" className="py-8 text-center text-sm text-[#14391a]/60 font-medium">
                  Loading billing data…
                </td>
              </tr>
            )}
            {error && !loading && (
              <tr>
                <td colSpan="7" className="py-8 text-center text-sm text-[#99221b] font-medium">
                  {error}{' '}
                  <button type="button" onClick={() => { loadInvoices(); loadStats(); }} className="underline cursor-pointer">
                    Retry
                  </button>
                </td>
              </tr>
            )}
            {!loading && !error && filteredInvoices.map(row => (
              <tr key={row.id} className="hover:bg-[#e9e3cb]/30 transition text-sm text-[#14391a]">
                <td className="py-4.5 px-6 font-extrabold">{row.invoiceNumber}</td>
                <td className="py-4.5 px-6 font-extrabold">{row.businessName}</td>
                <td className="py-4.5 px-6 font-bold text-[#14391a]/85">{row.moduleName}</td>

                {/* Amount badge */}
                <td className="py-4.5 px-6">
                  {row.status === 'paid' ? (
                    <div className="inline-flex flex-col items-center justify-center px-3.5 py-1.5 bg-[#cbebc7] border border-[#14391a]/30 rounded-[10px] text-[13px] font-extrabold text-[#14391a] leading-tight text-center">
                      <span>Paid Rs</span><span>{row.amount}</span>
                    </div>
                  ) : row.status === 'overdue' ? (
                    <div className="inline-flex flex-col items-center justify-center px-3.5 py-1.5 bg-[#f7d6d3] border border-[#d65f57] rounded-[10px] text-[13px] font-extrabold text-[#99221b] leading-tight text-center">
                      <span>Overdue</span><span>Rs {row.amount}</span>
                    </div>
                  ) : (
                    <div className="inline-flex flex-col items-center justify-center px-3.5 py-1.5 bg-[#f6edc1] border border-[#cca839] rounded-[10px] text-[13px] font-extrabold text-[#78590d] leading-tight text-center">
                      <span>Pending</span><span>Rs {row.amount}</span>
                    </div>
                  )}
                </td>

                <td className="py-4.5 px-6 font-bold text-[#14391a]/80">{row.method}</td>
                <td className="py-4.5 px-6 font-bold">{fmtDate(row.dueDate)}</td>

                {/* Actions */}
                <td className="py-4.5 px-6 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedInvoiceId(row.id)}
                      className="px-4 py-2 bg-[#fcfbfa] hover:bg-white text-[#14391a] border border-[#14391a]/40 text-xs font-extrabold rounded-[10px] shadow-2xs transition cursor-pointer"
                    >
                      View details
                    </button>

                    {/* ··· Dropdown */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setActiveDropdownId(activeDropdownId === row.id ? null : row.id)}
                        className="p-1.5 bg-[#fcfbfa] hover:bg-white text-[#14391a] border border-[#14391a]/40 rounded-[10px] shadow-2xs transition cursor-pointer flex items-center justify-center"
                      >
                        <MoreHorizontal size={16} />
                      </button>

                      {activeDropdownId === row.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setActiveDropdownId(null)} />
                          <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-[#14391a]/15 rounded-xl shadow-xl z-50 p-2 flex flex-col text-left">
                            <button
                              type="button"
                              onClick={() => {
                                setInitiatingShop({ id: row.businessId, business: row.businessName });
                                setActiveDropdownId(null);
                              }}
                              className="w-full text-left px-3 py-2 text-xs font-bold text-[#14391a] hover:bg-gray-50 rounded-lg transition cursor-pointer"
                            >
                              Initiate Invoice
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSuspendingShop({ id: row.businessId, business: row.businessName });
                                setActiveDropdownId(null);
                              }}
                              className="w-full text-left px-3 py-2 text-xs font-bold text-[#14391a] hover:bg-gray-50 rounded-lg transition cursor-pointer"
                            >
                              Suspend Account
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setBlockingShop({ id: row.businessId, business: row.businessName });
                                setActiveDropdownId(null);
                              }}
                              className="w-full text-left px-3 py-2 text-xs font-bold text-[#b45309] hover:bg-amber-50 rounded-lg transition cursor-pointer"
                            >
                              Block Account
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRevokeAccount(row.businessId)}
                              className="w-full text-left px-3 py-2 text-xs font-bold text-[#14391a] hover:bg-gray-50 rounded-lg transition cursor-pointer border-t border-gray-100 mt-1 pt-2"
                            >
                              Revoke account
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}

            {!loading && !error && filteredInvoices.length === 0 && (
              <tr>
                <td colSpan="7" className="py-8 text-center text-sm text-[#14391a]/70 font-medium">
                  No billing records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <BillingDetailsModal
        invoiceId={selectedInvoiceId}
        onClose={() => setSelectedInvoiceId(null)}
      />
      <InitiateInvoiceModal
        shop={initiatingShop}
        onClose={() => setInitiatingShop(null)}
        onDone={() => { loadInvoices(); loadStats(); }}
      />
      <BlockShopModal
        shop={blockingShop}
        onClose={() => setBlockingShop(null)}
        onBlock={handleBlockShop}
      />
      <SuspendShopModal
        shop={suspendingShop}
        onClose={() => setSuspendingShop(null)}
        onSuspend={handleSuspendShop}
      />
    </div>
  );
}
