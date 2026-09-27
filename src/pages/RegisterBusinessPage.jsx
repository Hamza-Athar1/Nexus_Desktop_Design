import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Syringe, ShoppingCart, Monitor, Cookie, Utensils, Store, Shirt } from 'lucide-react';
import { apiFetch, apiFetchJson } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import RegistrationPendingModal from '../components/RegistrationPendingModal';

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
  const [palettesCatalog, setPalettesCatalog] = useState([]);
  const [selectedPaletteId, setSelectedPaletteId] = useState(null);
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
  const [planCode, setPlanCode] = useState('retention_6m');
  const [platform, setPlatform] = useState('web_app'); // web_app | mobile_pos | both
  const [paymentMethod, setPaymentMethod] = useState('card'); // card | bank_transfer | jazzcash_easypaisa
  const [selectedBackupCodes, setSelectedBackupCodes] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [pendingModalData, setPendingModalData] = useState(null);

  // Step 4 Form State (Payment Proof & First Staff)
  const [proofFile, setProofFile] = useState(null);
  const [proofPreviewUrl, setProofPreviewUrl] = useState('');
  const [uploadingProof, setUploadingProof] = useState(false);
  const [uploadedProofUrl, setUploadedProofUrl] = useState('');

  const [firstStaffForm, setFirstStaffForm] = useState({
    username: '',
    fullName: '',
    password: '',
    confirmPassword: '',
    showPassword: false,
  });

  // Handle proof file selection and real server upload
  const handleProofFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('File size exceeds 5MB limit.');
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setProofPreviewUrl(localUrl);
    setProofFile(file);
    setErrorMsg('');

    // Trigger immediate backend upload
    const formData = new FormData();
    formData.append('proofFile', file);

    setUploadingProof(true);
    try {
      const res = await apiFetch('/registration/upload-proof', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.message || 'Payment proof upload failed.');
      } else {
        setUploadedProofUrl(data.proofUrl);
      }
    } catch {
      setErrorMsg('Failed to connect to upload server.');
    } finally {
      setUploadingProof(false);
    }
  };

  const handleRemoveProof = () => {
    setProofFile(null);
    setProofPreviewUrl('');
    setUploadedProofUrl('');
    setErrorMsg('');
  };

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
        const [typesRes, modulesRes, plansRes, backupRes, palettesRes, draftRes] = await Promise.all([
          apiFetchJson('/catalog/business-types'),
          apiFetchJson('/catalog/modules'),
          apiFetchJson('/catalog/plans'),
          apiFetchJson('/catalog/backup-modules'),
          apiFetchJson('/catalog/palettes'),
          apiFetchJson('/registration/draft'),
        ]);
        if (cancelled) return;

        if (typesRes.ok) setBusinessTypes(typesRes.data.businessTypes || []);
        if (modulesRes.ok) setModules(modulesRes.data.modules || []);
        if (plansRes.ok) setPlans(plansRes.data.plans || []);
        if (palettesRes.ok) setPalettesCatalog(palettesRes.data.palettes || []);

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
          if (p.paletteId) setSelectedPaletteId(p.paletteId);
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
            paletteId: selectedPaletteId,
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
  const selectedPalette = palettesCatalog.find((p) => p.id === selectedPaletteId);
  const themeCost = selectedPalette ? Number(selectedPalette.price || 0) : 0;
  const totalCost = retentionCost + modulesCost + themeCost;

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
      let finalProofUrl = uploadedProofUrl;
      if (!finalProofUrl && proofFile) {
        try {
          const formData = new FormData();
          formData.append('proofFile', proofFile);
          const uploadRes = await apiFetch('/registration/upload-proof', {
            method: 'POST',
            body: formData,
          });
          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            finalProofUrl = uploadData.proofUrl;
            setUploadedProofUrl(uploadData.proofUrl);
          }
        } catch {
          // Continue if upload failed, finish handler will error or process as null
        }
      }

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
            paletteId: selectedPaletteId,
          },
          moduleCode: selectedModule,
          subscription: { planCode, platform, paymentMethod, backupModuleCodes: selectedBackupCodes },
          paymentProofUrl: finalProofUrl || null,
          firstStaff: firstStaffForm.username && firstStaffForm.password ? {
            username: firstStaffForm.username,
            fullName: firstStaffForm.fullName,
            password: firstStaffForm.password,
          } : null,
        }),
      });

      if (!ok) {
        setErrorMsg(data.message || 'Something went wrong. Please try again.');
        setSubmitting(false);
        return;
      }

      // Pulls the freshly created businessId into AuthContext so
      // ProtectedRoute checks see business setup as finished.
      await refreshUser();
      setPendingModalData({
        businessName: businessForm.businessName,
        paymentProofStatus: data?.business?.paymentProofStatus || 'not_submitted',
      });
      setSubmitting(false);
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
    <div className="min-h-screen w-full flex flex-col items-center justify-center py-8 px-4 sm:px-6 lg:px-8 nexus-bg text-[#14391a]">
      <div className="max-w-4xl w-full space-y-6">

        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-wide">
            Register your business
          </h1>
          <p className="text-sm md:text-base font-semibold opacity-90">
            Tell us about your business to finish setting up Nexus
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-4 md:gap-8 overflow-x-auto pb-2 scrollbar-none border-b border-[#14391a]/15 text-xs md:text-sm font-semibold">
          <div
            onClick={() => step > 1 && setStep(1)}
            className={`flex items-center gap-2 pb-2 cursor-pointer whitespace-nowrap transition-all ${step === 1 ? 'border-b-2 border-[#14391a]' : 'text-[#14391a]/70'
              }`}
          >
            <span className="w-5 h-5 rounded-full bg-[#14391a] text-white flex items-center justify-center text-[10px]">1</span>
            <span>Business details</span>
          </div>

          <div
            onClick={() => step > 2 && setStep(2)}
            className={`flex items-center gap-2 pb-2 cursor-pointer whitespace-nowrap transition-all ${step === 2 ? 'border-b-2 border-[#14391a]' : 'text-[#14391a]/70'
              }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 2 || step > 2 ? 'bg-[#14391a] text-white' : 'border border-[#14391a]/30'
              }`}>2</span>
            <span>Module Selection</span>
          </div>

          <div
            onClick={() => step > 3 && setStep(3)}
            className={`flex items-center gap-2 pb-2 cursor-pointer whitespace-nowrap transition-all ${step === 3 ? 'border-b-2 border-[#14391a]' : 'text-[#14391a]/70'
              }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 3 || step > 3 ? 'bg-[#14391a] text-white' : 'border border-[#14391a]/30'
              }`}>3</span>
            <span>Backup & Plan</span>
          </div>

          <div className={`flex items-center gap-2 pb-2 whitespace-nowrap transition-all ${step === 4 ? 'border-b-2 border-[#14391a]' : 'text-[#14391a]/50'
            }`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 4 ? 'bg-[#14391a] text-white' : 'border border-[#14391a]/30'
              }`}>4</span>
            <span>Proof & First Staff</span>
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
                        className={`flex-1 py-3.5 rounded-lg text-xs md:text-sm font-bold text-center border transition-all duration-200 cursor-pointer ${businessForm.isRegistered
                          ? 'bg-[#14391a] border-[#14391a] text-white shadow-sm'
                          : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                          }`}
                      >
                        Yes, registered
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBusinessChange('isRegistered', false)}
                        className={`flex-1 py-3.5 rounded-lg text-xs md:text-sm font-bold text-center border transition-all duration-200 cursor-pointer ${!businessForm.isRegistered
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
                      maxLength={13}
                      className={`w-full px-4 py-2.5 rounded-lg border text-xs md:text-sm outline-none transition-all ${businessForm.isRegistered
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
                      className={`w-full px-4 py-2.5 rounded-lg border text-xs md:text-sm outline-none transition-all ${businessForm.isRegistered
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full" role="list">
                {modules.map((mod) => {
                  const IconComponent = MODULE_ICONS[mod.icon] || Store;
                  const isActive = selectedModule === mod.code;
                  const isAvailable = Boolean(mod.is_available);

                  const MODULE_IMAGES = {
                    grocery: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80',
                    pharmacy: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=500&auto=format&fit=crop&q=80',
                    clothing: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&auto=format&fit=crop&q=80',
                    electronics: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=500&auto=format&fit=crop&q=80',
                    bakery: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80',
                    restaurant: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&auto=format&fit=crop&q=80',
                    general_store: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=500&auto=format&fit=crop&q=80',
                  };

                  const MODULE_DESCRIPTIONS = {
                    grocery: 'Manage groceries, fresh goods, inventory, and retail barcodes.',
                    pharmacy: 'Manage medicines, prescription tracking, and pharmacy inventory.',
                    clothing: 'Manage clothing items, sizes, colors, and variant tags.',
                    electronics: 'Manage electronics, hardware items, serial numbers, and warranties.',
                    bakery: 'Manage fresh baked goods, daily batches, and confectionery sales.',
                    restaurant: 'Manage restaurant menus, dining tables, orders, and kitchen bills.',
                    general_store: 'Manage multi-category inventory and quick general store checkout.',
                  };

                  const imgUrl = MODULE_IMAGES[mod.code] || MODULE_IMAGES.general_store;
                  const desc = MODULE_DESCRIPTIONS[mod.code] || mod.tagline || 'Manage products and point of sale inventory.';

                  return (
                    <div
                      key={mod.code}
                      onClick={() => isAvailable && setSelectedModule(mod.code)}
                      className={`relative flex flex-col rounded-2xl border-2 overflow-hidden transition-all duration-200 select-none ${
                        !isAvailable
                          ? 'border-dashed border-gray-300 opacity-60 cursor-not-allowed bg-gray-50'
                          : isActive
                          ? 'border-[#14391a] bg-white shadow-xl ring-2 ring-[#14391a]/30 cursor-pointer'
                          : 'border-gray-200/80 bg-white hover:border-[#14391a]/40 hover:shadow-md cursor-pointer'
                      }`}
                    >
                      {/* Image Header */}
                      <div className="relative h-28 w-full overflow-hidden bg-gray-100">
                        <img
                          src={imgUrl}
                          alt={mod.name}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/90 backdrop-blur-xs text-[#14391a] shadow-xs">
                          <IconComponent size={16} />
                        </div>
                        <span className="absolute bottom-2 left-3 text-white font-extrabold text-sm drop-shadow-sm">
                          {mod.name}
                        </span>
                      </div>

                      {/* Content Body */}
                      <div className="p-3.5 flex flex-col justify-between flex-1 gap-3">
                        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                          {desc}
                        </p>

                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          <span className={`text-[10px] font-bold tracking-wider uppercase ${
                            isActive ? 'text-[#14391a]' : 'text-gray-400'
                          }`}>
                            {isAvailable ? (isActive ? 'Selected' : 'Click to select') : 'Coming Soon'}
                          </span>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isActive ? 'border-[#14391a] bg-[#14391a]' : 'border-gray-300'
                          }`}>
                            {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Visual Theme Palette Selection */}
              {palettesCatalog.length > 0 && (
                <div className="space-y-4 pt-4">
                  <div>
                    <h3 className="text-base font-extrabold text-[#14391a]">
                      Select Visual Theme
                    </h3>
                    <p className="text-xs text-[#14391a]/70">
                      Choose a theme for your POS interface. Premium themes include additional monthly pricing.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {palettesCatalog.map((p) => {
                      const isSel = selectedPaletteId === p.id;
                      const priceVal = Number(p.price || 0);
                      const primary = p.colors?.[0] || '#14391a';
                      const accent = p.colors?.[1] || '#4caf50';
                      const shade = p.colors?.[2] || '#81c784';
                      const light = p.colors?.[3] || '#e8f5e9';

                      return (
                        <div
                          key={p.id}
                          onClick={() => setSelectedPaletteId(p.id)}
                          className={`rounded-xl border-2 p-4 cursor-pointer transition-all duration-200 flex flex-col justify-between select-none ${
                            isSel
                              ? 'border-[#14391a] bg-white shadow-md ring-2 ring-[#14391a]/20'
                              : 'border-gray-200 bg-[#fbfbf6] hover:border-[#14391a]/40 hover:bg-white'
                          }`}
                        >
                          <div className="space-y-3">
                            {/* Visual Preview Header */}
                            <div className="rounded-lg p-2.5 border border-black/10 flex gap-2 items-center" style={{ backgroundColor: light }}>
                              <div className="w-5 h-12 rounded flex flex-col justify-between p-1" style={{ backgroundColor: primary }}>
                                <div className="w-full h-1.5 rounded bg-white/40" />
                                <div className="w-full h-1.5 rounded bg-white/40" />
                              </div>
                              <div className="flex-1 flex flex-col gap-1.5">
                                <div className="h-3 rounded w-3/4" style={{ backgroundColor: shade }} />
                                <div className="flex gap-1">
                                  <div className="h-4 rounded-md flex-1 text-[8px] font-black text-white flex items-center justify-center" style={{ backgroundColor: accent }}>
                                    POS
                                  </div>
                                  <div className="h-4 rounded-md w-1/3" style={{ backgroundColor: primary }} />
                                </div>
                              </div>
                            </div>

                            {/* Info */}
                            <div>
                              <div className="flex justify-between items-center">
                                <span className="font-extrabold text-sm text-[#14391a]">{p.name}</span>
                                {p.isPreset && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-200 text-gray-700">Preset</span>}
                              </div>
                              <span className="text-xs font-bold text-[#8b1e10] block mt-0.5">
                                {priceVal > 0 ? `+ Rs ${priceVal}/mo` : 'Included Free'}
                              </span>
                            </div>
                          </div>

                          <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
                            <span className="text-[11px] font-bold text-gray-500">
                              {isSel ? 'Selected' : 'Click to select'}
                            </span>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSel ? 'border-[#14391a] bg-[#14391a]' : 'border-gray-300'}`}>
                              {isSel && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

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
                    className={`flex-1 py-3 text-xs md:text-sm font-bold text-center transition-all ${platform === 'web_app' ? 'bg-[#14391a] text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                  >
                    Web app
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlatform('mobile_pos')}
                    className={`flex-1 py-3 border-x border-gray-200 text-xs md:text-sm font-bold text-center transition-all ${platform === 'mobile_pos' ? 'bg-[#14391a] text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                  >
                    Mobile POS
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlatform('both')}
                    className={`flex-1 py-3 text-xs md:text-sm font-bold text-center transition-all ${platform === 'both' ? 'bg-[#14391a] text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
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
                        className={`p-4 rounded-lg border text-left transition-all ${isSelected
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
                      className={`p-3 rounded-lg border text-center transition-all ${planCode === p.code
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
                    className={`py-3 rounded-lg border text-center transition-all text-xs md:text-sm font-bold ${paymentMethod === 'card' ? 'bg-[#14391a] border-[#14391a] text-white' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                      }`}
                  >
                    Debit/ credit card
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bank_transfer')}
                    className={`py-3 rounded-lg border text-center transition-all text-xs md:text-sm font-bold ${paymentMethod === 'bank_transfer' ? 'bg-[#14391a] border-[#14391a] text-white' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                      }`}
                  >
                    Bank transfer
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('jazzcash_easypaisa')}
                    className={`py-3 rounded-lg border text-center transition-all text-xs md:text-sm font-bold ${paymentMethod === 'jazzcash_easypaisa' ? 'bg-[#14391a] border-[#14391a] text-white' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
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
                <div className="flex justify-between text-xs md:text-sm font-semibold">
                  <span>Theme ({selectedPalette?.name || 'Default'})</span>
                  <span>{themeCost > 0 ? `Rs ${themeCost}` : 'Free'}</span>
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
                    onClick={async () => {
                      if (!planCode || !paymentMethod) {
                        setErrorMsg('Please select a plan and payment method.');
                        return;
                      }
                      setErrorMsg('');
                      await saveDraft(4);
                      setStep(4);
                    }}
                    className="px-6 py-2.5 bg-[#14391a] hover:bg-[#0f2a13] text-white text-xs md:text-sm font-bold rounded-lg shadow-md active:scale-[0.99] transition-all duration-200 cursor-pointer"
                  >
                    Continue to Proof & Staff
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* STEP 4: PAYMENT PROOF & FIRST STAFF */}
          {step === 4 && (
            <div className="bg-white rounded-xl shadow-[0_15px_30px_rgba(20,57,26,0.06)] border border-[#14391a]/5 p-6 md:p-8 space-y-6 animate-fade-in">

              {/* Bank Details & Payment Proof Upload */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <h2 className="text-sm md:text-base font-bold tracking-wider text-[#14391a] uppercase">
                    STEP 4: PAYMENT PROOF & FIRST STAFF
                  </h2>
                  <p className="text-xs md:text-sm text-gray-500">
                    Transfer payment to Super Admin account and upload proof (optional screenshot).
                  </p>
                </div>

                {/* Bank Account Details Card */}
                <div className="bg-[#fcfbf4] border border-[#14391a]/15 rounded-xl p-4 space-y-2">
                  <h3 className="text-xs font-bold text-[#14391a] uppercase tracking-wider">Super Admin Payment Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs md:text-sm">
                    <div><span className="text-gray-500">Bank Name:</span> <strong>Meezan Bank Ltd.</strong></div>
                    <div><span className="text-gray-500">Account Title:</span> <strong>Nexus POS Solutions</strong></div>
                    <div><span className="text-gray-500">IBAN:</span> <strong className="font-mono">PK36MEZN0099340102938101</strong></div>
                    <div><span className="text-gray-500">JazzCash / EasyPaisa:</span> <strong className="font-mono">0300-1234567</strong></div>
                  </div>
                </div>

                {/* File Upload Component */}
                <div className="space-y-2">
                  <label className="text-xs md:text-sm font-bold text-[#14391a] block">
                    Upload Payment Receipt Screenshot (JPG, PNG, WEBP, PDF - Max 5MB)
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <label className="flex items-center gap-2 px-4 py-2.5 bg-[#e5dcba] hover:bg-[#d8cdab] text-[#14391a] text-xs font-bold rounded-lg cursor-pointer transition border border-[#14391a]/20">
                      <span>Choose File</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,application/pdf"
                        onChange={handleProofFileChange}
                        className="hidden"
                      />
                    </label>
                    {uploadingProof && <span className="text-xs font-bold text-[#14391a]">Uploading file to server…</span>}
                    {uploadedProofUrl && (
                      <span className="text-xs font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded border border-green-200">
                        ✓ Proof Uploaded Successfully
                      </span>
                    )}
                    {(proofFile || uploadedProofUrl || proofPreviewUrl) && (
                      <button
                        type="button"
                        onClick={handleRemoveProof}
                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-lg border border-red-200 transition cursor-pointer"
                      >
                        Remove Proof
                      </button>
                    )}
                  </div>

                  {/* Proof Preview */}
                  {proofPreviewUrl && (
                    <div className="mt-3 p-2 border border-gray-200 rounded-xl bg-gray-50 max-w-xs">
                      <p className="text-[10px] font-bold text-gray-400 mb-1">Receipt Preview:</p>
                      <img src={proofPreviewUrl} alt="Receipt Preview" className="max-h-36 object-contain rounded-lg shadow-xs" />
                    </div>
                  )}
                </div>
              </div>

              <div className="w-full h-px bg-gray-200 my-4" />

              {/* First Staff Member Setup (Optional) */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xs md:text-sm font-bold tracking-wider text-[#14391a] uppercase">
                    First Staff Member Account (Optional)
                  </h3>
                  <p className="text-xs text-gray-500">
                    Create the first cashier account for your store now, or add staff later from Admin Settings.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#14391a]">Staff Username</label>
                    <input
                      type="text"
                      placeholder="e.g. cashier1"
                      value={firstStaffForm.username}
                      onChange={(e) => setFirstStaffForm((prev) => ({ ...prev, username: e.target.value }))}
                      className="w-full px-3.5 py-2 rounded-lg border border-gray-200 text-xs md:text-sm outline-none focus:border-[#14391a]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#14391a]">Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Ali Khan"
                      value={firstStaffForm.fullName}
                      onChange={(e) => setFirstStaffForm((prev) => ({ ...prev, fullName: e.target.value }))}
                      className="w-full px-3.5 py-2 rounded-lg border border-gray-200 text-xs md:text-sm outline-none focus:border-[#14391a]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#14391a]">Staff Password</label>
                    <input
                      type={firstStaffForm.showPassword ? 'text' : 'password'}
                      placeholder="Enter password"
                      value={firstStaffForm.password}
                      onChange={(e) => setFirstStaffForm((prev) => ({ ...prev, password: e.target.value }))}
                      className="w-full px-3.5 py-2 rounded-lg border border-gray-200 text-xs md:text-sm outline-none focus:border-[#14391a]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#14391a]">Confirm Password</label>
                    <div className="flex gap-2">
                      <input
                        type={firstStaffForm.showPassword ? 'text' : 'password'}
                        placeholder="Re-enter password"
                        value={firstStaffForm.confirmPassword}
                        onChange={(e) => setFirstStaffForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full px-3.5 py-2 rounded-lg border border-gray-200 text-xs md:text-sm outline-none focus:border-[#14391a]"
                      />
                      <button
                        type="button"
                        onClick={() => setFirstStaffForm((prev) => ({ ...prev, showPassword: !prev.showPassword }))}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50"
                      >
                        {firstStaffForm.showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full h-px bg-gray-150 pt-2" />

              {/* Step 4 Footer Actions */}
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
                    onClick={() => setStep(3)}
                    className="px-6 py-2.5 bg-[#e6e2b8] hover:bg-[#dcd8ae] text-[#14391a] text-xs md:text-sm font-bold rounded-lg border border-[#14391a]/15 shadow-sm active:scale-[0.99] transition-all duration-200 cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={(e) => {
                      if (firstStaffForm.username || firstStaffForm.password) {
                        if (!firstStaffForm.username.trim() || !firstStaffForm.password) {
                          setErrorMsg('Staff username and password are required.');
                          return;
                        }
                        if (firstStaffForm.password !== firstStaffForm.confirmPassword) {
                          setErrorMsg('Staff passwords do not match.');
                          return;
                        }
                      }
                      handleFinishSetup(e);
                    }}
                    className="px-6 py-2.5 bg-[#14391a] hover:bg-[#0f2a13] text-white text-xs md:text-sm font-bold rounded-lg shadow-md active:scale-[0.99] transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Setting up…' : 'Finish & Submit Registration'}
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>

      {/* Registration Success & Super Admin Pending Review Modal */}
      <RegistrationPendingModal
        isOpen={Boolean(pendingModalData)}
        registrationData={pendingModalData}
        onClose={() => {
          setPendingModalData(null);
          navigate('/admin-login');
        }}
      />
    </div>
  );
}
