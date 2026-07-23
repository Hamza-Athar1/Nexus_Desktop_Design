import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Syringe, ShoppingCart, Monitor, Cookie, Utensils, Store, Shirt } from 'lucide-react';
import { apiFetch, apiFetchJson } from '../lib/api';
import { useAuth } from '../context/AuthContext';

/** Maps `modules.icon` (a plain string from the catalog) to a lucide component. */
const MODULE_ICONS = {
  syringe: Syringe,
  cart: ShoppingCart,
  laptop: Monitor,
  bread: Cookie,
  utensils: Utensils,
  store: Store,
  shirt: Shirt,
};

export default function RegisterBusinessPage() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  // Wizard Step State — 1: Business details, 2: Module Selection, 3: Backup & Plan.
  // (There is no "Account" step here — that's /signup. See server/README.md
  // Phase 3 "Known gaps" for why.)
  const [step, setStep] = useState(1);

  // Catalog data, fetched once on mount.
  const [businessTypes, setBusinessTypes] = useState([]);
  const [modules, setModules] = useState([]);
  const [plans, setPlans] = useState([]);
  const [backupModulesCatalog, setBackupModulesCatalog] = useState([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);

  // Step 1 Form State
  const [businessForm, setBusinessForm] = useState({
    businessName: '',
    businessTypeCode: '',
    businessLocation: '',
    isRegistered: true,
    nicNumber: '',
    cityRegion: '',
    shopAddress: '',
  });

  // Step 2 Form State
  const [selectedModule, setSelectedModule] = useState('');

  // Step 3 Form State — values match the backend's ENUMs directly
  // (see server/README.md Phase 3 "Known gaps" for the mapping this replaces).
  const [planCode, setPlanCode] = useState('retention_6m');
  const [platform, setPlatform] = useState('web_app'); // web_app | mobile_pos | both
  const [paymentMethod, setPaymentMethod] = useState('card'); // card | bank_transfer | jazzcash_easypaisa
  const [selectedBackupCodes, setSelectedBackupCodes] = useState([]);

  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // ── Already onboarded? Don't let them redo the wizard. ──────────────────
  useEffect(() => {
    if (user?.businessId) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // ── Load catalog + resume any saved draft ────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function loadEverything() {
      try {
        const [typesRes, modulesRes, plansRes, backupRes, draftRes] = await Promise.all([
          apiFetchJson('/catalog/business-types'),
          apiFetchJson('/catalog/modules'),
          apiFetchJson('/catalog/plans'),
          apiFetchJson('/catalog/backup-modules'),
          apiFetchJson('/registration/draft'),
        ]);
        if (cancelled) return;

        if (typesRes.ok) setBusinessTypes(typesRes.data.businessTypes || []);
        if (modulesRes.ok) setModules(modulesRes.data.modules || []);
        if (plansRes.ok) setPlans(plansRes.data.plans || []);

        let backupCodesDefault = [];
        if (backupRes.ok) {
          const list = backupRes.data.backupModules || [];
          setBackupModulesCatalog(list);
          backupCodesDefault = list.map((m) => m.code); // default: everything selected
        }
        setSelectedBackupCodes(backupCodesDefault);

        const draft = draftRes.ok ? draftRes.data.draft : null;
        if (draft?.payload) {
          const p = draft.payload;
          if (p.business) setBusinessForm((prev) => ({ ...prev, ...p.business }));
          if (p.moduleCode) setSelectedModule(p.moduleCode);
          if (p.subscription?.planCode) setPlanCode(p.subscription.planCode);
          if (p.subscription?.platform) setPlatform(p.subscription.platform);
          if (p.subscription?.paymentMethod) setPaymentMethod(p.subscription.paymentMethod);
          if (p.subscription?.backupModuleCodes) setSelectedBackupCodes(p.subscription.backupModuleCodes);
          // Backend draft steps are 2/3/4 (step 1 = account, handled by /signup).
          // Frontend steps are 1/2/3 — shift down by one.
          if (draft.current_step) setStep(Math.max(1, draft.current_step - 1));
        }
      } catch {
        // Catalog failed to load — the wizard still renders, just with
        // empty option lists; step validation stops the user from
        // continuing with nothing selected rather than crashing here.
      } finally {
        if (!cancelled) setLoadingCatalog(false);
      }
    }

    loadEverything();
    return () => { cancelled = true; };
  }, []);

  // ── Draft autosave — fire-and-forget, never blocks wizard progress ──────
  async function saveDraft(backendStep) {
    try {
      await apiFetch('/registration/draft', {
        method: 'PUT',
        body: JSON.stringify({
          step: backendStep,
          payload: {
            business: businessForm,
            moduleCode: selectedModule,
            subscription: { planCode, platform, paymentMethod, backupModuleCodes: selectedBackupCodes },
          },
        }),
      });
    } catch {
      // Best-effort UX sugar — a failed draft save shouldn't stop the wizard.
    }
  }

  // Handlers for Step 1
  const handleBusinessChange = (field, value) => {
    setBusinessForm((prev) => ({ ...prev, [field]: value }));
    setErrorMsg('');
  };

  const handleBusinessSubmit = async (e) => {
    e.preventDefault();
    if (
      !businessForm.businessName.trim() ||
      !businessForm.businessTypeCode ||
      !businessForm.businessLocation.trim()
    ) {
      setErrorMsg('Business Name, Type, and Location are required.');
      return;
    }
    if (businessForm.isRegistered) {
      if (!businessForm.nicNumber.trim() || !businessForm.cityRegion.trim()) {
        setErrorMsg('NIC number and City/region are required for registered businesses.');
        return;
      }
    }
    setErrorMsg('');
    await saveDraft(2);
    setStep(2);
  };

  // Handlers for Step 2
  const handleModuleSelectSubmit = async (e) => {
    e.preventDefault();
    if (!selectedModule) {
      setErrorMsg('Please select a business module.');
      return;
    }
    const mod = modules.find((m) => m.code === selectedModule);
    if (mod && !mod.is_available) {
      setErrorMsg(`${mod.name} isn't available yet.`);
      return;
    }

    localStorage.setItem('nexus_module', selectedModule);
    setErrorMsg('');
    await saveDraft(3);
    setStep(3);
  };

  // Handlers for Step 3
  function toggleBackupModule(code) {
    setSelectedBackupCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  }

  // Cost calculation — driven entirely by fetched catalog data, not
  // hardcoded prices, so it never drifts from what the backend will charge.
  const selectedPlan = plans.find((p) => p.code === planCode);
  const retentionCost = selectedPlan ? Number(selectedPlan.monthly_price) : 0;
  const modulesCost = backupModulesCatalog
    .filter((m) => selectedBackupCodes.includes(m.code))
    .reduce((sum, m) => sum + Number(m.monthly_price), 0);
  const totalCost = retentionCost + modulesCost;

  const handleFinishSetup = async (e) => {
    e.preventDefault();
    if (!planCode) {
      setErrorMsg('Please choose a backup retention plan.');
      return;
    }
    if (!paymentMethod) {
      setErrorMsg('Please choose a payment method.');
      return;
    }

    setErrorMsg('');
    setSubmitting(true);
    try {
      const { ok, data } = await apiFetchJson('/registration/finish', {
        method: 'POST',
        body: JSON.stringify({
          // businessForm's field names are the wizard's own internal
          // state shape (businessLocation, businessTypeCode, etc.) —
          // map explicitly to what POST /registration/finish expects
          // rather than spreading the whole object and hoping they match.
          business: {
            businessName: businessForm.businessName,
            businessTypeCode: businessForm.businessTypeCode,
            location: businessForm.businessLocation,
            cityRegion: businessForm.cityRegion,
            shopAddress: businessForm.shopAddress,
            isRegistered: businessForm.isRegistered,
            nicNumber: businessForm.nicNumber,
          },
          moduleCode: selectedModule,
          subscription: { planCode, platform, paymentMethod, backupModuleCodes: selectedBackupCodes },
        }),
      });

      if (!ok) {
        setErrorMsg(data.message || 'Something went wrong. Please try again.');
        setSubmitting(false);
        return;
      }

      // Pulls the freshly created businessId into AuthContext so
      // ProtectedRoute/dashboard checks see onboarding as complete.
      await refreshUser();
      navigate('/dashboard');
    } catch {
      setErrorMsg('Unable to reach the server. Please try again.');
      setSubmitting(false);
    }
  };

  if (loadingCatalog) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center nexus-bg text-[#14391a]">
        <span className="loading-dots"><span /><span /><span /><span /></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start py-8 px-4 sm:px-6 lg:px-8 nexus-bg text-[#14391a]">
      <div className="max-w-4xl w-full space-y-6">

        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-wide">
            Register your business
          </h1>
          <p className="text-sm md:text-base font-semibold opacity-90">
            Tell us abour your business to finish setting up nexus
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-4 md:gap-8 overflow-x-auto pb-2 scrollbar-none border-b border-[#14391a]/15 text-xs md:text-sm font-semibold">
          <div
            onClick={() => step > 1 && setStep(1)}
            className={`flex items-center gap-2 pb-2 cursor-pointer whitespace-nowrap transition-all ${
              step === 1 ? 'border-b-2 border-[#14391a]' : 'text-[#14391a]/70'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-[#14391a] text-white flex items-center justify-center text-[10px]">1</span>
            <span>Business details</span>
          </div>

          <div
            onClick={() => step > 2 && setStep(2)}
            className={`flex items-center gap-2 pb-2 cursor-pointer whitespace-nowrap transition-all ${
              step === 2 ? 'border-b-2 border-[#14391a]' : 'text-[#14391a]/70'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              step === 2 || step > 2 ? 'bg-[#14391a] text-white' : 'border border-[#14391a]/30'
            }`}>2</span>
            <span>Module Selection</span>
          </div>

          <div className={`flex items-center gap-2 pb-2 whitespace-nowrap transition-all ${
            step === 3 ? 'border-b-2 border-[#14391a]' : 'text-[#14391a]/50'
          }`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              step === 3 ? 'bg-[#14391a] text-white' : 'border border-[#14391a]/30'
            }`}>3</span>
            <span>Backup & Plan</span>
          </div>
        </div>

        {/* Form Card / Selection Area */}
        <div className="bg-transparent md:bg-transparent rounded-xl overflow-hidden">

          {errorMsg && (
            <div className="mb-6">
              <div role="alert" className="px-4 py-2.5 rounded-lg bg-red-50 border border-red-200 text-xs md:text-sm text-red-600 text-center font-medium animate-fade-in">
                {errorMsg}
              </div>
            </div>
          )}

          {/* STEP 1: BUSINESS DETAILS */}
          {step === 1 && (
            <div className="bg-white rounded-xl shadow-[0_15px_30px_rgba(20,57,26,0.06)] border border-[#14391a]/5 p-6 md:p-8 animate-fade-in">
              <form onSubmit={handleBusinessSubmit} className="space-y-6">

                <div className="space-y-1">
                  <h2 className="text-sm md:text-base font-bold tracking-wider text-[#14391a] uppercase">
                    BUSINESS DETAILS
                  </h2>
                  <p className="text-xs md:text-sm text-gray-500">
                    Tell us where the shop is based
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">

                  {/* Business Name (Spans full width) */}
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs md:text-sm font-bold text-[#14391a]">
                      Business Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Fairy Parcel Co"
                      value={businessForm.businessName}
                      onChange={(e) => handleBusinessChange('businessName', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#14391a] focus:ring-1 focus:ring-[#14391a] text-xs md:text-sm outline-none transition-all"
                    />
                  </div>

                  {/* Business Type */}
                  <div className="space-y-1">
                    <label className="text-xs md:text-sm font-bold text-[#14391a]">
                      Business type
                    </label>
                    <select
                      value={businessForm.businessTypeCode}
                      onChange={(e) => handleBusinessChange('businessTypeCode', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#14391a] focus:ring-1 focus:ring-[#14391a] text-xs md:text-sm outline-none transition-all bg-white"
                    >
                      <option value="">Select a type</option>
                      {businessTypes.map((bt) => (
                        <option key={bt.code} value={bt.code}>{bt.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Business Location */}
                  <div className="space-y-1">
                    <label className="text-xs md:text-sm font-bold text-[#14391a]">
                      Business location
                    </label>
                    <input
                      type="text"
                      placeholder="City, area"
                      value={businessForm.businessLocation}
                      onChange={(e) => handleBusinessChange('businessLocation', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#14391a] focus:ring-1 focus:ring-[#14391a] text-xs md:text-sm outline-none transition-all"
                    />
                  </div>

                  {/* Shop Address */}
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs md:text-sm font-bold text-[#14391a]">
                      Shop address
                    </label>
                    <input
                      type="text"
                      placeholder="Shop number, street, area, landmark"
                      value={businessForm.shopAddress}
                      onChange={(e) => handleBusinessChange('shopAddress', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#14391a] focus:ring-1 focus:ring-[#14391a] text-xs md:text-sm outline-none transition-all"
                    />
                    <p className="text-[10px] md:text-xs text-gray-400">
                      This is where any physical backup devices or invoices would be delivered
                    </p>
                  </div>

                  {/* Is your business registered? (Spans full width) */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs md:text-sm font-bold text-[#14391a]">
                      Is your business registered?
                    </label>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => handleBusinessChange('isRegistered', true)}
                        className={`flex-1 py-3.5 rounded-lg text-xs md:text-sm font-bold text-center border transition-all duration-200 cursor-pointer ${
                          businessForm.isRegistered
                            ? 'bg-[#14391a] border-[#14391a] text-white shadow-sm'
                            : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        Yes, registered
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBusinessChange('isRegistered', false)}
                        className={`flex-1 py-3.5 rounded-lg text-xs md:text-sm font-bold text-center border transition-all duration-200 cursor-pointer ${
                          !businessForm.isRegistered
                            ? 'bg-[#14391a] border-[#14391a] text-white shadow-sm'
                            : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        Not registered
                      </button>
                    </div>
                  </div>

                  {/* NIC Number */}
                  <div className="space-y-1">
                    <label className="text-xs md:text-sm font-bold text-[#14391a]">
                      NIC number
                    </label>
                    <input
                      type="text"
                      placeholder="45504-XXXXXXX-X"
                      value={businessForm.nicNumber}
                      onChange={(e) => handleBusinessChange('nicNumber', e.target.value)}
                      disabled={!businessForm.isRegistered}
                      className={`w-full px-4 py-2.5 rounded-lg border text-xs md:text-sm outline-none transition-all ${
                        businessForm.isRegistered
                          ? 'border-gray-200 focus:border-[#14391a] focus:ring-1 focus:ring-[#14391a] bg-white text-black'
                          : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                      }`}
                    />
                  </div>

                  {/* City/region */}
                  <div className="space-y-1">
                    <label className="text-xs md:text-sm font-bold text-[#14391a]">
                      City/region
                    </label>
                    <input
                      type="text"
                      placeholder="e.g Karachi,sindh"
                      value={businessForm.cityRegion}
                      onChange={(e) => handleBusinessChange('cityRegion', e.target.value)}
                      disabled={!businessForm.isRegistered}
                      className={`w-full px-4 py-2.5 rounded-lg border text-xs md:text-sm outline-none transition-all ${
                        businessForm.isRegistered
                          ? 'border-gray-200 focus:border-[#14391a] focus:ring-1 focus:ring-[#14391a] bg-white text-black'
                          : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                      }`}
                    />
                  </div>

                </div>

                <div className="w-full h-px bg-gray-150 pt-2" />

                {/* Footer Buttons */}
                <div className="flex flex-row items-center justify-between">
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="text-xs md:text-sm font-bold text-gray-700 hover:text-black transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#14391a] hover:bg-[#0f2a13] text-white text-xs md:text-sm font-bold rounded-lg shadow-md active:scale-[0.99] transition-all duration-200 cursor-pointer"
                  >
                    Continue
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* STEP 2: MODULE SELECTION */}
          {step === 2 && (
            <div className="space-y-8 animate-fade-in">

              <div className="text-center">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-mono tracking-tight text-[#14391a]">
                  Choose Your Business Module
                </h2>
                <p className="text-sm md:text-base text-[#14391a]/80 mt-2">
                  Select a module that matches your business
                </p>
              </div>

              {/* Module Grid — sourced from GET /api/catalog/modules */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full" role="list">
                {modules.map((mod) => {
                  const IconComponent = MODULE_ICONS[mod.icon] || Store;
                  const isActive = selectedModule === mod.code;
                  const isAvailable = Boolean(mod.is_available);
                  return (
                    <button
                      key={mod.code}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => isAvailable && setSelectedModule(mod.code)}
                      className={`flex flex-col items-center justify-center p-6 rounded-lg border text-center transition-all duration-200 gap-3 h-44 select-none ${
                        !isAvailable
                          ? 'border-dashed border-[#14391a]/30 opacity-50 cursor-not-allowed bg-transparent text-[#14391a]'
                          : isActive
                            ? 'bg-[#14391a] border-[#14391a] text-white shadow-lg cursor-pointer'
                            : 'bg-[#e5dcba]/30 border-[#14391a]/20 hover:border-[#14391a]/40 text-[#14391a] hover:bg-[#e5dcba]/40 cursor-pointer'
                      }`}
                    >
                      <IconComponent size={28} className={isActive ? 'text-white' : 'text-[#14391a]'} />
                      <span className="text-sm font-bold">{mod.name}</span>
                      <span className={`text-[9px] font-mono tracking-wider ${isActive ? 'text-white/70' : 'text-[#14391a]/60'}`}>
                        {isAvailable ? mod.tagline : 'MORE SOON'}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="w-full h-px bg-gray-300 pt-2" />

              {/* Footer Actions */}
              <div className="flex flex-row items-center justify-between pb-4">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="text-xs md:text-sm font-bold text-gray-700 hover:text-black transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-6 py-2.5 bg-[#e6e2b8] hover:bg-[#dcd8ae] text-[#14391a] text-xs md:text-sm font-bold rounded-lg border border-[#14391a]/15 shadow-sm active:scale-[0.99] transition-all duration-200 cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleModuleSelectSubmit}
                    className="px-6 py-2.5 bg-[#14391a] hover:bg-[#0f2a13] text-white text-xs md:text-sm font-bold rounded-lg shadow-md active:scale-[0.99] transition-all duration-200 cursor-pointer"
                  >
                    Continue
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* STEP 3: BACKUP & PLAN */}
          {step === 3 && (
            <div className="bg-white rounded-xl shadow-[0_15px_30px_rgba(20,57,26,0.06)] border border-[#14391a]/5 p-6 md:p-8 space-y-6 animate-fade-in">

              <div className="space-y-1">
                <h2 className="text-sm md:text-base font-bold tracking-wider text-[#14391a] uppercase">
                  BACKUP & PLAN
                </h2>
                <p className="text-xs md:text-sm text-gray-500">
                  Choose what gets backed up, how often, and the plan that covers it.
                </p>
              </div>

              {/* Platform Selector */}
              <div className="space-y-2 pt-2">
                <label className="text-xs md:text-sm font-bold text-[#14391a] block">
                  Which platform will you run Nexus desktop on?
                </label>
                <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setPlatform('web_app')}
                    className={`flex-1 py-3 text-xs md:text-sm font-bold text-center transition-all ${
                      platform === 'web_app' ? 'bg-[#14391a] text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    Web app
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlatform('mobile_pos')}
                    className={`flex-1 py-3 border-x border-gray-200 text-xs md:text-sm font-bold text-center transition-all ${
                      platform === 'mobile_pos' ? 'bg-[#14391a] text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    Mobile POS
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlatform('both')}
                    className={`flex-1 py-3 text-xs md:text-sm font-bold text-center transition-all ${
                      platform === 'both' ? 'bg-[#14391a] text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    Both
                  </button>
                </div>
                <p className="text-[10px] md:text-xs text-gray-400">
                  This decides which apps sync automatically with your backups
                </p>
              </div>

              {/* Selected Modules for Backup — sourced from GET /api/catalog/backup-modules */}
              <div className="space-y-2 pt-2">
                <label className="text-xs md:text-sm font-bold text-[#14391a] block">
                  Selected modules for backup.
                </label>
                <p className="text-[10px] md:text-xs text-gray-400">
                  These records are selected - each adds a small amount to your monthly cost.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {backupModulesCatalog.map((m) => {
                    const isSelected = selectedBackupCodes.includes(m.code);
                    return (
                      <button
                        key={m.code}
                        type="button"
                        onClick={() => toggleBackupModule(m.code)}
                        className={`p-4 rounded-lg border text-left transition-all ${
                          isSelected
                            ? 'bg-[#e5dcba]/20 border-[#14391a] text-[#14391a] shadow-sm'
                            : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50'
                        }`}
                      >
                        <span className="font-bold text-xs md:text-sm block">{m.name}</span>
                        <span className="text-[10px] opacity-80 mt-1 block">{m.description}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Backup Retention / Plan — sourced from GET /api/catalog/plans */}
              <div className="space-y-2 pt-2">
                <label className="text-xs md:text-sm font-bold text-[#14391a] block">
                  How long should backups be kept?
                </label>
                <div className="grid grid-cols-3 gap-3 md:gap-4">
                  {plans.map((p) => (
                    <button
                      key={p.code}
                      type="button"
                      onClick={() => setPlanCode(p.code)}
                      className={`p-3 rounded-lg border text-center transition-all ${
                        planCode === p.code
                          ? 'bg-[#14391a] border-[#14391a] text-white shadow-sm'
                          : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-xs md:text-sm font-bold block">{p.name}</span>
                      <span className="text-[9px] md:text-[10px] mt-0.5 block opacity-80">
                        Rs {p.monthly_price}/mo
                      </span>
                    </button>
                  ))}
                </div>
                <p className="text-[10px] md:text-xs text-gray-400">
                  Longer retention means you can restore older data if something goes wrong.
                </p>
              </div>

              {/* Payment Method */}
              <div className="space-y-2 pt-2">
                <label className="text-xs md:text-sm font-bold text-[#14391a] block">
                  Payment method
                </label>
                <p className="text-[10px] md:text-xs text-gray-400">
                  How you'd like to pay the monthly cost?
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`py-3 rounded-lg border text-center transition-all text-xs md:text-sm font-bold ${
                      paymentMethod === 'card' ? 'bg-[#14391a] border-[#14391a] text-white' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    Debit/ credit card
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bank_transfer')}
                    className={`py-3 rounded-lg border text-center transition-all text-xs md:text-sm font-bold ${
                      paymentMethod === 'bank_transfer' ? 'bg-[#14391a] border-[#14391a] text-white' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    Bank transfer
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('jazzcash_easypaisa')}
                    className={`py-3 rounded-lg border text-center transition-all text-xs md:text-sm font-bold ${
                      paymentMethod === 'jazzcash_easypaisa' ? 'bg-[#14391a] border-[#14391a] text-white' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    JazzCash/Easypaisa
                  </button>
                </div>
              </div>

              {/* Estimated monthly cost card */}
              <div className="bg-[#e5dcba]/50 border border-[#14391a]/10 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-xs md:text-sm font-semibold">
                  <span>Backup retention ({selectedPlan?.name || '—'})</span>
                  <span>Rs {retentionCost}</span>
                </div>
                <div className="flex justify-between text-xs md:text-sm font-semibold">
                  <span>Selected modules</span>
                  <span>Rs {modulesCost}</span>
                </div>
                <div className="w-full h-px bg-[#14391a]/15 my-1" />
                <div className="flex justify-between text-sm md:text-base font-bold">
                  <span>Estimated monthly cost</span>
                  <span>Rs {totalCost}</span>
                </div>
              </div>

              <div className="w-full h-px bg-gray-150 pt-2" />

              {/* Footer Actions */}
              <div className="flex flex-row items-center justify-between">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="text-xs md:text-sm font-bold text-gray-700 hover:text-black transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-6 py-2.5 bg-[#e6e2b8] hover:bg-[#dcd8ae] text-[#14391a] text-xs md:text-sm font-bold rounded-lg border border-[#14391a]/15 shadow-sm active:scale-[0.99] transition-all duration-200 cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={handleFinishSetup}
                    className="px-6 py-2.5 bg-[#14391a] hover:bg-[#0f2a13] text-white text-xs md:text-sm font-bold rounded-lg shadow-md active:scale-[0.99] transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Setting up…' : 'Finish setup'}
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
