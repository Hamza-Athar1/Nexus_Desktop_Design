import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Eye, 
  EyeOff, 
  Syringe, 
  ShoppingCart, 
  Monitor, 
  Cookie, 
  Utensils, 
  Store, 
  Shirt, 
  Plus 
} from 'lucide-react';

const MODULES = [
  { id: 'pharmacy', name: 'Pharmacy', desc: 'MEDICINE AND RX', icon: Syringe },
  { id: 'grocery', name: 'Grocery', desc: 'DAILY ESSENTIALS', icon: ShoppingCart },
  { id: 'electronics', name: 'Electronics', desc: 'DEVICES AND PARTS', icon: Monitor },
  { id: 'bakery', name: 'Bakery', desc: 'FRESH GOODS', icon: Cookie },
  { id: 'restaurant', name: 'Restaurant', desc: 'DINE AND SERVE', icon: Utensils },
  { id: 'general-store', name: 'General Store', desc: 'MULTI-CATEGORY', icon: Store },
  { id: 'clothing', name: 'Clothing', desc: 'APPAREL AND WEAR', icon: Shirt },
];

export default function RegisterBusinessPage() {
  const navigate = useNavigate();

  // Wizard Step State
  const [step, setStep] = useState(1); // 1: Account, 2: Business details, 3: Module Selection, 4: Backup & Plan

  // Step 1 Form States
  const [accountForm, setAccountForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    city: '',
    shopAddress: '',
    agreed: false,
  });

  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Step 2 Form States
  const [businessForm, setBusinessForm] = useState({
    businessName: '',
    businessType: '',
    businessLocation: '',
    isRegistered: true,
    nicNumber: '',
    cityRegion: '',
  });

  // Step 3 Form State
  const [selectedModule, setSelectedModule] = useState('pharmacy');

  // Step 4 Form States
  const [platform, setPlatform] = useState('web'); // web | mobile | both
  const [backupSales, setBackupSales] = useState(true);
  const [backupInventory, setBackupInventory] = useState(true);
  const [retention, setRetention] = useState('6month'); // 3month | 6month | 12month (displays as 3 month in image)
  const [paymentMethod, setPaymentMethod] = useState('card'); // card | bank | jazzcash

  const [errorMsg, setErrorMsg] = useState('');

  // Handlers for Step 1
  const handleAccountChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setAccountForm((prev) => ({ ...prev, [field]: value }));
    setErrorMsg('');
  };

  const handleAccountSubmit = (e) => {
    e.preventDefault();
    if (
      !accountForm.username.trim() ||
      !accountForm.email.trim() ||
      !accountForm.password ||
      !accountForm.confirmPassword ||
      !accountForm.phoneNumber.trim() ||
      !accountForm.city.trim() ||
      !accountForm.shopAddress.trim()
    ) {
      setErrorMsg('All fields are required.');
      return;
    }
    if (accountForm.password !== accountForm.confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (!accountForm.agreed) {
      setErrorMsg('You must agree to the Terms of services and privacy Policy.');
      return;
    }

    setErrorMsg('');
    setStep(2);
  };

  // Handlers for Step 2
  const handleBusinessChange = (field, value) => {
    setBusinessForm((prev) => ({ ...prev, [field]: value }));
    setErrorMsg('');
  };

  const handleBusinessSubmit = (e) => {
    e.preventDefault();
    if (
      !businessForm.businessName.trim() ||
      !businessForm.businessType.trim() ||
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
    setStep(3);
  };

  // Handlers for Step 3
  const handleModuleSelectSubmit = (e) => {
    e.preventDefault();
    if (!selectedModule) {
      setErrorMsg('Please select a business module.');
      return;
    }

    localStorage.setItem('nexus_module', selectedModule);
    setErrorMsg('');
    setStep(4);
  };

  // Cost Calculations
  const getRetentionCost = () => {
    if (retention === '3month') return 1500;
    if (retention === '6month') return 2200;
    return 1500; // default / 3 month
  };

  const getModulesCost = () => {
    let cost = 0;
    if (backupSales) cost += 150;
    if (backupInventory) cost += 150;
    return cost;
  };

  const retentionCost = getRetentionCost();
  const modulesCost = getModulesCost();
  const totalCost = retentionCost + modulesCost;

  const handleFinishSetup = (e) => {
    e.preventDefault();
    // Finish setup and redirect to dashboard
    navigate('/dashboard');
  };

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
            <span>Account</span>
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
            <span>Business details</span>
          </div>

          <div 
            onClick={() => step > 3 && setStep(3)}
            className={`flex items-center gap-2 pb-2 cursor-pointer whitespace-nowrap transition-all ${
              step === 3 ? 'border-b-2 border-[#14391a]' : 'text-[#14391a]/70'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              step === 3 || step > 3 ? 'bg-[#14391a] text-white' : 'border border-[#14391a]/30'
            }`}>3</span>
            <span>Module Selection</span>
          </div>

          <div className={`flex items-center gap-2 pb-2 whitespace-nowrap transition-all ${
            step === 4 ? 'border-b-2 border-[#14391a]' : 'text-[#14391a]/50'
          }`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              step === 4 ? 'bg-[#14391a] text-white' : 'border border-[#14391a]/30'
            }`}>4</span>
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

          {/* STEP 1: ACCOUNT DETAILS */}
          {step === 1 && (
            <div className="bg-white rounded-xl shadow-[0_15px_30px_rgba(20,57,26,0.06)] border border-[#14391a]/5 p-6 md:p-8">
              <form onSubmit={handleAccountSubmit} className="space-y-6">
                
                <div className="space-y-1">
                  <h2 className="text-sm md:text-base font-bold tracking-wider text-[#14391a] uppercase">
                    ACCOUNT DETAILS
                  </h2>
                  <p className="text-xs md:text-sm text-gray-500">
                    Create your login and tell us here the shop is based
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {/* Username */}
                  <div className="space-y-1">
                    <label className="text-xs md:text-sm font-bold text-[#14391a]">
                      Username
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. greenleaf_admin"
                      value={accountForm.username}
                      onChange={handleAccountChange('username')}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#14391a] focus:ring-1 focus:ring-[#14391a] text-xs md:text-sm outline-none transition-all"
                    />
                  </div>

                  {/* Email Address */}
                  <div className="space-y-1">
                    <label className="text-xs md:text-sm font-bold text-[#14391a]">
                      Email address
                    </label>
                    <input
                      type="email"
                      placeholder="you@business.com"
                      value={accountForm.email}
                      onChange={handleAccountChange('email')}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#14391a] focus:ring-1 focus:ring-[#14391a] text-xs md:text-sm outline-none transition-all"
                    />
                  </div>

                  {/* Password */}
                  <div className="space-y-1">
                    <label className="text-xs md:text-sm font-bold text-[#14391a]">
                      Password
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type={showPass ? 'text' : 'password'}
                        placeholder="At least 8 characters"
                        value={accountForm.password}
                        onChange={handleAccountChange('password')}
                        className="w-full px-4 py-2.5 pr-10 rounded-lg border border-gray-200 focus:border-[#14391a] focus:ring-1 focus:ring-[#14391a] text-xs md:text-sm outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 text-[#14391a]/60 hover:text-[#14391a] transition-colors cursor-pointer bg-transparent border-none p-0 flex items-center"
                      >
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1">
                    <label className="text-xs md:text-sm font-bold text-[#14391a]">
                      Phone number
                    </label>
                    <input
                      type="text"
                      placeholder="03XX-XXXXXX"
                      value={accountForm.phoneNumber}
                      onChange={handleAccountChange('phoneNumber')}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#14391a] focus:ring-1 focus:ring-[#14391a] text-xs md:text-sm outline-none transition-all"
                    />
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1">
                    <label className="text-xs md:text-sm font-bold text-[#14391a]">
                      Confirm Password
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type={showConfirmPass ? 'text' : 'password'}
                        placeholder="Re-enter password"
                        value={accountForm.confirmPassword}
                        onChange={handleAccountChange('confirmPassword')}
                        className="w-full px-4 py-2.5 pr-10 rounded-lg border border-gray-200 focus:border-[#14391a] focus:ring-1 focus:ring-[#14391a] text-xs md:text-sm outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        className="absolute right-3 text-[#14391a]/60 hover:text-[#14391a] transition-colors cursor-pointer bg-transparent border-none p-0 flex items-center"
                      >
                        {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* City/region */}
                  <div className="space-y-1">
                    <label className="text-xs md:text-sm font-bold text-[#14391a]">
                      City/region
                    </label>
                    <input
                      type="text"
                      placeholder="e.g Karachi,sindh"
                      value={accountForm.city}
                      onChange={handleAccountChange('city')}
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
                      value={accountForm.shopAddress}
                      onChange={handleAccountChange('shopAddress')}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#14391a] focus:ring-1 focus:ring-[#14391a] text-xs md:text-sm outline-none transition-all"
                    />
                    <p className="text-[10px] md:text-xs text-gray-400">
                      This is where any physical backup devices or invoices would be delivered
                    </p>
                  </div>
                </div>

                {/* Terms Checkbox */}
                <div className="flex items-center gap-2 pt-2 text-xs md:text-sm font-semibold">
                  <input
                    id="agree-terms"
                    type="checkbox"
                    checked={accountForm.agreed}
                    onChange={handleAccountChange('agreed')}
                    className="w-4 h-4 rounded border-gray-300 text-[#14391a] accent-[#14391a] cursor-pointer"
                  />
                  <label htmlFor="agree-terms" className="cursor-pointer select-none">
                    I agree to the <span className="underline">Terms of services and privacy Policy</span>
                  </label>
                </div>

                <div className="w-full h-px bg-gray-100 pt-2" />

                {/* Footer Buttons */}
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
                      onClick={() => navigate('/signup')}
                      className="px-6 py-2.5 bg-[#e6e2b8] hover:bg-[#dcd8ae] text-[#14391a] text-xs md:text-sm font-bold rounded-lg border border-[#14391a]/15 shadow-sm active:scale-[0.99] transition-all duration-200 cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-[#14391a] hover:bg-[#0f2a13] text-white text-xs md:text-sm font-bold rounded-lg shadow-md active:scale-[0.99] transition-all duration-200 cursor-pointer"
                    >
                      Continue
                    </button>
                  </div>
                </div>

              </form>
            </div>
          )}

          {/* STEP 2: BUSINESS DETAILS */}
          {step === 2 && (
            <div className="bg-white rounded-xl shadow-[0_15px_30px_rgba(20,57,26,0.06)] border border-[#14391a]/5 p-6 md:p-8 animate-fade-in">
              <form onSubmit={handleBusinessSubmit} className="space-y-6">
                
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
                    <input
                      type="text"
                      placeholder="Pharmacy"
                      value={businessForm.businessType}
                      onChange={(e) => handleBusinessChange('businessType', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#14391a] focus:ring-1 focus:ring-[#14391a] text-xs md:text-sm outline-none transition-all"
                    />
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
                  
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-6 py-2.5 bg-[#e6e2b8] hover:bg-[#dcd8ae] text-[#14391a] text-xs md:text-sm font-bold rounded-lg border border-[#14391a]/15 shadow-sm active:scale-[0.99] transition-all duration-200 cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-[#14391a] hover:bg-[#0f2a13] text-white text-xs md:text-sm font-bold rounded-lg shadow-md active:scale-[0.99] transition-all duration-200 cursor-pointer"
                    >
                      Continue
                    </button>
                  </div>
                </div>

              </form>
            </div>
          )}

          {/* STEP 3: MODULE SELECTION */}
          {step === 3 && (
            <div className="space-y-8 animate-fade-in">
              
              {/* Header inside Selection Area */}
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-mono tracking-tight text-[#14391a]">
                  Choose Your Business Module
                </h2>
                <p className="text-sm md:text-base text-[#14391a]/80 mt-2">
                  Select a module that matches your business
                </p>
              </div>

              {/* Module Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full" role="list">
                {MODULES.map((mod) => {
                  const IconComponent = mod.icon;
                  const isActive = selectedModule === mod.id;
                  return (
                    <button
                      key={mod.id}
                      type="button"
                      onClick={() => setSelectedModule(mod.id)}
                      className={`flex flex-col items-center justify-center p-6 rounded-lg border text-center transition-all duration-200 cursor-pointer select-none gap-3 h-44 ${
                        isActive 
                          ? 'bg-[#14391a] border-[#14391a] text-white shadow-lg' 
                          : 'bg-[#e5dcba]/30 border-[#14391a]/20 hover:border-[#14391a]/40 text-[#14391a] hover:bg-[#e5dcba]/40'
                      }`}
                    >
                      <IconComponent size={28} className={isActive ? 'text-white' : 'text-[#14391a]'} />
                      <span className="text-sm font-bold">{mod.name}</span>
                      <span className={`text-[9px] font-mono tracking-wider ${isActive ? 'text-white/70' : 'text-[#14391a]/60'}`}>
                        {mod.desc}
                      </span>
                    </button>
                  );
                })}

                {/* More Soon (Disabled/Dashed placeholder) */}
                <div className="flex flex-col items-center justify-center p-6 rounded-lg border border-dashed border-[#14391a]/40 text-center gap-2 h-44 select-none opacity-60">
                  <Plus size={24} className="text-[#14391a]" />
                  <span className="text-xs font-bold text-[#14391a] font-mono tracking-wider">MORE SOON</span>
                </div>
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
                    onClick={() => setStep(2)}
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

          {/* STEP 4: BACKUP & PLAN */}
          {step === 4 && (
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
                    onClick={() => setPlatform('web')}
                    className={`flex-1 py-3 text-xs md:text-sm font-bold text-center transition-all ${
                      platform === 'web'
                        ? 'bg-[#14391a] text-white'
                        : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    Web app
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlatform('mobile')}
                    className={`flex-1 py-3 border-x border-gray-200 text-xs md:text-sm font-bold text-center transition-all ${
                      platform === 'mobile'
                        ? 'bg-[#14391a] text-white'
                        : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    Mobile POS
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlatform('both')}
                    className={`flex-1 py-3 text-xs md:text-sm font-bold text-center transition-all ${
                      platform === 'both'
                        ? 'bg-[#14391a] text-white'
                        : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    Both
                  </button>
                </div>
                <p className="text-[10px] md:text-xs text-gray-400">
                  This decides which apps sync automatically with your backups
                </p>
              </div>

              {/* Selected Modules for Backup */}
              <div className="space-y-2 pt-2">
                <label className="text-xs md:text-sm font-bold text-[#14391a] block">
                  Selected modules for backup.
                </label>
                <p className="text-[10px] md:text-xs text-gray-400">
                  These records are selected - each adds a small amount to your monthly cost.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Sales Backup Option */}
                  <button
                    type="button"
                    onClick={() => setBackupSales(!backupSales)}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      backupSales
                        ? 'bg-[#e5dcba]/20 border-[#14391a] text-[#14391a] shadow-sm'
                        : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    <span className="font-bold text-xs md:text-sm block">Sales & POS data</span>
                    <span className="text-[10px] opacity-80 mt-1 block">Daily transactions, receipts, refunds.</span>
                  </button>

                  {/* Inventory Backup Option */}
                  <button
                    type="button"
                    onClick={() => setBackupInventory(!backupInventory)}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      backupInventory
                        ? 'bg-[#e5dcba]/20 border-[#14391a] text-[#14391a] shadow-sm'
                        : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    <span className="font-bold text-xs md:text-sm block">Inventory records</span>
                    <span className="text-[10px] opacity-80 mt-1 block">Daily transactions, receipts, refunds.</span>
                  </button>
                </div>
              </div>

              {/* Backup Retention */}
              <div className="space-y-2 pt-2">
                <label className="text-xs md:text-sm font-bold text-[#14391a] block">
                  How long should backups be kept?
                </label>
                <div className="grid grid-cols-3 gap-3 md:gap-4">
                  {/* 3 Months */}
                  <button
                    type="button"
                    onClick={() => setRetention('3month')}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      retention === '3month'
                        ? 'bg-[#14391a] border-[#14391a] text-white shadow-sm'
                        : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-xs md:text-sm font-bold block">3 month</span>
                    <span className="text-[9px] md:text-[10px] mt-0.5 block opacity-80">Rs 1,500/mo</span>
                  </button>

                  {/* 6 Months */}
                  <button
                    type="button"
                    onClick={() => setRetention('6month')}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      retention === '6month'
                        ? 'bg-[#14391a] border-[#14391a] text-white shadow-sm'
                        : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-xs md:text-sm font-bold block">6 month</span>
                    <span className="text-[9px] md:text-[10px] mt-0.5 block opacity-80">Rs 2,200/mo</span>
                  </button>

                  {/* Duplicate 3 Months / Alternative Option */}
                  <button
                    type="button"
                    onClick={() => setRetention('3month_dup')}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      retention === '3month_dup'
                        ? 'bg-[#14391a] border-[#14391a] text-white shadow-sm'
                        : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-xs md:text-sm font-bold block">3 month</span>
                    <span className="text-[9px] md:text-[10px] mt-0.5 block opacity-80">Rs 1,500/mo</span>
                  </button>
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
                      paymentMethod === 'card'
                        ? 'bg-[#14391a] border-[#14391a] text-white'
                        : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    Debit/ credit card
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bank')}
                    className={`py-3 rounded-lg border text-center transition-all text-xs md:text-sm font-bold ${
                      paymentMethod === 'bank'
                        ? 'bg-[#14391a] border-[#14391a] text-white'
                        : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    Bank transfer
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('jazzcash')}
                    className={`py-3 rounded-lg border text-center transition-all text-xs md:text-sm font-bold ${
                      paymentMethod === 'jazzcash'
                        ? 'bg-[#14391a] border-[#14391a] text-white'
                        : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    JazzCash/Easypaisa
                  </button>
                </div>
              </div>

              {/* Estimated monthly cost card */}
              <div className="bg-[#e5dcba]/50 border border-[#14391a]/10 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-xs md:text-sm font-semibold">
                  <span>Backup retention ({retention.replace('dup', '')})</span>
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
                    onClick={() => setStep(3)}
                    className="px-6 py-2.5 bg-[#e6e2b8] hover:bg-[#dcd8ae] text-[#14391a] text-xs md:text-sm font-bold rounded-lg border border-[#14391a]/15 shadow-sm active:scale-[0.99] transition-all duration-200 cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleFinishSetup}
                    className="px-6 py-2.5 bg-[#14391a] hover:bg-[#0f2a13] text-white text-xs md:text-sm font-bold rounded-lg shadow-md active:scale-[0.99] transition-all duration-200 cursor-pointer"
                  >
                    Finish setup
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
