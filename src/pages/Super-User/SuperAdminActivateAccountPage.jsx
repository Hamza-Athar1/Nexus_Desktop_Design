import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Database,
  Monitor,
  ShieldCheck,
  Sparkles,
  Clock,
  Store,
  User,
  CreditCard,
  Layers,
  AlertCircle,
} from 'lucide-react';
import { apiFetchJson } from '../../lib/api';

export default function SuperAdminActivateAccountPage() {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Shop state
  const [shop, setShop] = useState(location.state?.shop || null);
  const [loadingShop, setLoadingShop] = useState(!location.state?.shop);
  const [loadError, setLoadError] = useState('');

  // Form State
  // Default start date: today
  const todayStr = new Date().toISOString().split('T')[0];
  // Default end date: 1 month from today
  const defaultEnd = new Date();
  defaultEnd.setMonth(defaultEnd.getMonth() + 1);
  const defaultEndStr = defaultEnd.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(defaultEndStr);

  // POS configuration
  const [posCount, setPosCount] = useState(shop?.posPurchased || 1);
  const [posTerminals, setPosTerminals] = useState([
    { id: 'pos_1', name: 'Main Counter Register', active: true },
    { id: 'pos_2', name: 'Express Checkout POS', active: false },
    { id: 'pos_3', name: 'Backoffice / Secondary POS', active: false },
  ]);

  // Backup Modules state
  const [selectedBackups, setSelectedBackups] = useState({
    sales_pos: true,
    inventory: true,
    customers: false,
  });
  const [backupFrequency, setBackupFrequency] = useState('daily'); // 'daily' | 'weekly' | 'monthly'

  // Pricing constants (PKR)
  const BASE_MONTHLY_PLAN = 2200; // Base plan rate per month
  const POS_UNIT_MONTHLY = 500;   // Rate per extra POS terminal per month
  const BACKUP_MODULE_RATES = {
    sales_pos: 150,
    inventory: 150,
    customers: 100,
  };

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Load shop details if not provided in location state
  useEffect(() => {
    if (!shop && shopId) {
      setLoadingShop(true);
      apiFetchJson(`/admin/shops/${shopId}`)
        .then(({ ok, data }) => {
          if (ok && data?.shop) {
            setShop(data.shop);
            if (data.shop.posPurchased) setPosCount(data.shop.posPurchased);
          } else {
            setLoadError(data?.message || 'Shop details could not be loaded');
          }
        })
        .catch(() => setLoadError('Unable to reach the server'))
        .finally(() => setLoadingShop(false));
    }
  }, [shopId, shop]);

  // ── Calculation Logic ──────────────────────────────────────────────────────
  const durationMetrics = useMemo(() => {
    if (!startDate || !endDate) return { days: 0, months: 1 };
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    const days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    // Fraction of 30-day month
    const months = Math.max(0.1, Number((days / 30).toFixed(2)));
    return { days, months };
  }, [startDate, endDate]);

  const pricingBreakdown = useMemo(() => {
    const { months } = durationMetrics;

    // Base subscription cost
    const baseCost = Math.round(BASE_MONTHLY_PLAN * months);

    // POS Terminals cost
    const posCost = Math.round(posCount * POS_UNIT_MONTHLY * months);

    // Backup modules cost
    let backupCostPerMonth = 0;
    if (selectedBackups.sales_pos) backupCostPerMonth += BACKUP_MODULE_RATES.sales_pos;
    if (selectedBackups.inventory) backupCostPerMonth += BACKUP_MODULE_RATES.inventory;
    if (selectedBackups.customers) backupCostPerMonth += BACKUP_MODULE_RATES.customers;

    // Frequency multiplier
    const freqMultiplier = backupFrequency === 'daily' ? 1.0 : backupFrequency === 'weekly' ? 0.85 : 0.7;
    const backupCost = Math.round(backupCostPerMonth * freqMultiplier * months);

    const grandTotal = baseCost + posCost + backupCost;

    return {
      baseCost,
      posCost,
      backupCost,
      grandTotal,
    };
  }, [durationMetrics, posCount, selectedBackups, backupFrequency]);

  // Toggle backup module
  const toggleBackup = (key) => {
    setSelectedBackups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Toggle terminal selection
  const handlePosCountChange = (newCount) => {
    const val = Math.max(1, Math.min(10, newCount));
    setPosCount(val);
    setPosTerminals((prev) =>
      prev.map((t, idx) => ({ ...t, active: idx < val }))
    );
  };

  // Handle Submit Activation
  const handleConfirmActivation = async () => {
    setActionError('');
    setSuccessMsg('');
    setSubmitting(true);

    try {
      const payload = {
        status: 'active',
        reason: 'Account activated with verified preferences',
        billDueDate: endDate,
        billAmount: pricingBreakdown.grandTotal,
        posPurchased: posCount,
        posActive: posCount,
      };

      const { ok, data } = await apiFetchJson(`/admin/shops/${shopId}/status`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });

      if (ok) {
        setSuccessMsg('Account successfully activated with configured preferences!');
        setTimeout(() => {
          navigate('/super-admin/users', { replace: true });
        }, 1500);
      } else {
        setActionError(data?.message || 'Failed to activate account. Please try again.');
      }
    } catch {
      setActionError('Unable to reach server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingShop) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px] text-[#152f16]">
        <div className="flex items-center gap-3 text-base font-bold">
          <div className="w-6 h-6 border-3 border-[#0c3818] border-t-transparent rounded-full animate-spin" />
          Loading account details…
        </div>
      </div>
    );
  }

  if (loadError || !shop) {
    return (
      <div className="flex-1 p-6 max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <AlertCircle size={22} className="text-red-600" />
            <span className="font-semibold">{loadError || 'Shop not found'}</span>
          </div>
          <button
            onClick={() => navigate('/super-admin/users')}
            className="px-4 py-2 bg-white border border-red-300 text-red-800 rounded-xl font-bold text-sm hover:bg-red-100 transition cursor-pointer"
          >
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-[#fbf8eb] text-[#152f16] p-4 sm:p-7 space-y-6">

      {/* ── Top Header Navigation ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#0c3818]/15 pb-5">
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-full border border-[#0c3818]/20 bg-white text-[#0c3818] hover:bg-[#0c3818] hover:text-[#efeacb] transition duration-200 shadow-sm cursor-pointer"
            title="Go Back"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold font-serif tracking-tight text-[#0c3818]">
                Activate Account & Preferences
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-[#efeacb] text-[#0c3818] border border-[#0c3818]/20">
                Setup Billing
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#0c3818]/70 mt-0.5">
              Configure subscription duration, POS terminals, and backup preferences for account activation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2.5 rounded-xl border border-[#0c3818]/20 bg-white text-[#0c3818] font-bold text-xs hover:bg-[#0c3818]/5 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmActivation}
            disabled={submitting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0c3818] text-[#efeacb] font-bold text-xs hover:bg-[#144921] transition shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
          >
            <ShieldCheck size={16} />
            {submitting ? 'Activating…' : 'Confirm & Activate Account'}
          </button>
        </div>
      </div>

      {/* ── Status Messages ───────────────────────────────────────────────────── */}
      {actionError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold flex items-center gap-2.5 shadow-sm">
          <AlertCircle size={18} />
          <span>{actionError}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm font-semibold flex items-center gap-2.5 shadow-sm animate-pulse">
          <CheckCircle2 size={18} className="text-green-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ── Shop Information Summary Banner ──────────────────────────────────── */}
      <div className="bg-white border border-[#0c3818]/15 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-[#0c3818] text-[#efeacb] flex items-center justify-center font-extrabold text-xl shadow-md shrink-0">
            <Store size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold font-serif text-[#0c3818]">{shop.business}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#e6f4ea] text-[#137333] border border-[#85c796]">
                {shop.posModule || 'Grocery POS'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#0c3818]/75 mt-1 font-medium">
              <span className="flex items-center gap-1">
                <User size={13} className="text-[#0c3818]/50" /> Owner: <strong className="text-[#0c3818]">{shop.owner}</strong>
              </span>
              <span>•</span>
              <span>{shop.ownerEmail || 'No email registered'}</span>
              <span>•</span>
              <span>{shop.cityRegion || 'Location not specified'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-[#fbf8eb] px-4 py-2.5 rounded-xl border border-[#0c3818]/10 text-xs self-stretch md:self-auto justify-between md:justify-start">
          <span className="text-[#0c3818]/70 font-semibold">Current Account Status:</span>
          <span className="capitalize font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
            {shop.status || 'pending'}
          </span>
        </div>
      </div>

      {/* ── Main Grid Layout ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column (2 Cols): Configuration Forms */}
        <div className="lg:col-span-2 space-y-6">

          {/* Section 1: Start & End Date Definition */}
          <div className="bg-white border border-[#0c3818]/15 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#0c3818]/10 pb-3">
              <div className="flex items-center gap-2.5 text-[#0c3818]">
                <Calendar size={20} className="text-[#0c3818]" />
                <h3 className="text-lg font-bold font-serif">1. Define Subscription Period (Dates)</h3>
              </div>
              <span className="text-xs font-bold text-[#0c3818] bg-[#efeacb] px-3 py-1 rounded-full border border-[#0c3818]/15">
                {durationMetrics.days} Days ({durationMetrics.months} Mo)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0c3818]/80 mb-1.5">
                  Subscription Start Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-[#fbf8eb] border border-[#0c3818]/20 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[#0c3818] focus:outline-none focus:ring-2 focus:ring-[#0c3818]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0c3818]/80 mb-1.5">
                  Subscription End Date (Due Date)
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-[#fbf8eb] border border-[#0c3818]/20 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[#0c3818] focus:outline-none focus:ring-2 focus:ring-[#0c3818]"
                  />
                </div>
              </div>
            </div>
            <p className="text-[11.5px] text-[#0c3818]/65 italic">
              * Changing the start or end date directly adjusts the duration calculation and live monthly billing total.
            </p>
          </div>

          {/* Section 2: POS Terminals Selection */}
          <div className="bg-white border border-[#0c3818]/15 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#0c3818]/10 pb-3">
              <div className="flex items-center gap-2.5 text-[#0c3818]">
                <Monitor size={20} className="text-[#0c3818]" />
                <h3 className="text-lg font-bold font-serif">2. POS Terminal Licenses & Selection</h3>
              </div>
              <span className="text-xs font-bold text-[#0c3818] bg-[#efeacb] px-3 py-1 rounded-full border border-[#0c3818]/15">
                Rs {POS_UNIT_MONTHLY} / POS / Mo
              </span>
            </div>

            <div className="flex items-center justify-between bg-[#fbf8eb] p-4 rounded-xl border border-[#0c3818]/10">
              <div>
                <span className="text-sm font-bold text-[#0c3818] block">Purchased POS Quantity</span>
                <span className="text-xs text-[#0c3818]/70">Set total active POS terminals allowed for this account</span>
              </div>
              <div className="flex items-center gap-2 bg-white border border-[#0c3818]/20 rounded-xl p-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => handlePosCountChange(posCount - 1)}
                  className="w-8 h-8 rounded-lg bg-[#efeacb] text-[#0c3818] font-black hover:bg-[#0c3818] hover:text-white transition cursor-pointer flex items-center justify-center text-base"
                >
                  -
                </button>
                <span className="w-8 text-center font-extrabold text-sm text-[#0c3818]">{posCount}</span>
                <button
                  type="button"
                  onClick={() => handlePosCountChange(posCount + 1)}
                  className="w-8 h-8 rounded-lg bg-[#efeacb] text-[#0c3818] font-black hover:bg-[#0c3818] hover:text-white transition cursor-pointer flex items-center justify-center text-base"
                >
                  +
                </button>
              </div>
            </div>

            {/* List of active terminals */}
            <div className="space-y-2 pt-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#0c3818]/80">
                Assigned POS Terminals
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {posTerminals.map((t, idx) => (
                  <div
                    key={t.id}
                    className={`p-3.5 rounded-xl border transition-all text-xs font-semibold flex items-center justify-between ${
                      idx < posCount
                        ? 'bg-[#e6f4ea] border-[#85c796] text-[#137333]'
                        : 'bg-gray-50 border-gray-200 text-gray-400 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Monitor size={15} />
                      <span>{t.name}</span>
                    </div>
                    {idx < posCount ? (
                      <CheckCircle2 size={15} className="text-[#137333]" />
                    ) : (
                      <span className="text-[10px] uppercase font-black tracking-wider">Inactive</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Backup Options & Retention */}
          <div className="bg-white border border-[#0c3818]/15 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#0c3818]/10 pb-3">
              <div className="flex items-center gap-2.5 text-[#0c3818]">
                <Database size={20} className="text-[#0c3818]" />
                <h3 className="text-lg font-bold font-serif">3. Selected Backup Modules & Frequency</h3>
              </div>
              <span className="text-xs font-bold text-[#0c3818] bg-[#efeacb] px-3 py-1 rounded-full border border-[#0c3818]/15">
                Cloud Backup
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Sales & POS Backup */}
              <div
                onClick={() => toggleBackup('sales_pos')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedBackups.sales_pos
                    ? 'bg-[#0c3818]/5 border-[#0c3818] text-[#0c3818] shadow-sm'
                    : 'bg-[#fbf8eb] border-[#0c3818]/15 text-[#0c3818]/60 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Layers size={18} />
                  <input
                    type="checkbox"
                    checked={selectedBackups.sales_pos}
                    onChange={() => {}}
                    className="accent-[#0c3818] w-4 h-4"
                  />
                </div>
                <h4 className="font-bold text-xs">Sales & POS Data</h4>
                <p className="text-[11px] text-[#0c3818]/70 mt-1">Receipts, sales & payment logs</p>
                <span className="inline-block mt-2 text-[10.5px] font-black text-[#0c3818] bg-[#efeacb] px-2 py-0.5 rounded">
                  +Rs 150/mo
                </span>
              </div>

              {/* Inventory Backup */}
              <div
                onClick={() => toggleBackup('inventory')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedBackups.inventory
                    ? 'bg-[#0c3818]/5 border-[#0c3818] text-[#0c3818] shadow-sm'
                    : 'bg-[#fbf8eb] border-[#0c3818]/15 text-[#0c3818]/60 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Database size={18} />
                  <input
                    type="checkbox"
                    checked={selectedBackups.inventory}
                    onChange={() => {}}
                    className="accent-[#0c3818] w-4 h-4"
                  />
                </div>
                <h4 className="font-bold text-xs">Inventory Records</h4>
                <p className="text-[11px] text-[#0c3818]/70 mt-1">Products, stock movements & suppliers</p>
                <span className="inline-block mt-2 text-[10.5px] font-black text-[#0c3818] bg-[#efeacb] px-2 py-0.5 rounded">
                  +Rs 150/mo
                </span>
              </div>

              {/* Customer Backup */}
              <div
                onClick={() => toggleBackup('customers')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedBackups.customers
                    ? 'bg-[#0c3818]/5 border-[#0c3818] text-[#0c3818] shadow-sm'
                    : 'bg-[#fbf8eb] border-[#0c3818]/15 text-[#0c3818]/60 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <User size={18} />
                  <input
                    type="checkbox"
                    checked={selectedBackups.customers}
                    onChange={() => {}}
                    className="accent-[#0c3818] w-4 h-4"
                  />
                </div>
                <h4 className="font-bold text-xs">Customer History</h4>
                <p className="text-[11px] text-[#0c3818]/70 mt-1">Customer list & loyalty points</p>
                <span className="inline-block mt-2 text-[10.5px] font-black text-[#0c3818] bg-[#efeacb] px-2 py-0.5 rounded">
                  +Rs 100/mo
                </span>
              </div>
            </div>

            {/* Backup Schedule Frequency */}
            <div className="pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#0c3818]/80 mb-1.5">
                Backup Schedule Frequency
              </label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                {[
                  { id: 'daily', label: 'Daily Backup (Standard)' },
                  { id: 'weekly', label: 'Weekly Backup (15% Off)' },
                  { id: 'monthly', label: 'Monthly Backup (30% Off)' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setBackupFrequency(f.id)}
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      backupFrequency === f.id
                        ? 'bg-[#0c3818] text-[#efeacb] border-[#0c3818]'
                        : 'bg-[#fbf8eb] text-[#0c3818] border-[#0c3818]/20 hover:bg-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Live Billing Breakdown Card */}
        <div className="space-y-6">
          <div className="bg-[#0c3818] text-[#efeacb] rounded-2xl p-6 shadow-xl space-y-5 sticky top-6 border border-[#efeacb]/20">
            <div className="flex items-center justify-between border-b border-[#efeacb]/15 pb-4">
              <div className="flex items-center gap-2">
                <CreditCard size={22} className="text-[#efeacb]" />
                <h3 className="text-xl font-bold font-serif">Billing Summary</h3>
              </div>
              <Sparkles size={18} className="text-[#efeacb]/70" />
            </div>

            {/* Duration metrics */}
            <div className="bg-[#efeacb]/10 p-3.5 rounded-xl border border-[#efeacb]/15 flex items-center justify-between text-xs font-semibold">
              <span className="text-[#efeacb]/80 flex items-center gap-1.5">
                <Clock size={14} /> Total Period:
              </span>
              <span className="font-extrabold text-[#efeacb]">{durationMetrics.days} Days (~{durationMetrics.months} Months)</span>
            </div>

            {/* Line items */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-[#efeacb]/10">
                <span className="text-[#efeacb]/80">Base Plan ({shop.posModule})</span>
                <span className="font-bold">Rs {pricingBreakdown.baseCost.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-[#efeacb]/10">
                <span className="text-[#efeacb]/80">POS Terminals ({posCount} Units)</span>
                <span className="font-bold">Rs {pricingBreakdown.posCost.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-[#efeacb]/10">
                <span className="text-[#efeacb]/80">Backup Add-ons ({backupFrequency})</span>
                <span className="font-bold">Rs {pricingBreakdown.backupCost.toLocaleString()}</span>
              </div>
            </div>

            {/* Grand Total */}
            <div className="pt-2 border-t border-[#efeacb]/20 flex items-baseline justify-between">
              <div>
                <span className="text-xs uppercase font-extrabold tracking-wider text-[#efeacb]/70 block">
                  Grand Total Price
                </span>
                <span className="text-[11px] text-[#efeacb]/60">Due on {endDate || 'Activation'}</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black font-serif text-[#efeacb]">
                  Rs {pricingBreakdown.grandTotal.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Activate CTA Button */}
            <button
              type="button"
              onClick={handleConfirmActivation}
              disabled={submitting}
              className="w-full py-3.5 px-4 rounded-xl bg-[#efeacb] text-[#0c3818] font-extrabold text-sm hover:bg-white transition-all shadow-lg hover:shadow-xl cursor-pointer flex items-center justify-center gap-2 border border-[#0c3818]/20 disabled:opacity-50"
            >
              <ShieldCheck size={18} />
              {submitting ? 'Processing Activation…' : 'Activate Account Now'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
