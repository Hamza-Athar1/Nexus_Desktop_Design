import { useState } from 'react';
import { Menu, User, Building2, Phone, Mail, FileText, CreditCard, Calendar, ChevronDown, Save, X } from 'lucide-react';
import UserSidebar from '../../../components/User/UserSidebar';

function Input({ label, value, onChange, placeholder, icon: Icon, variant = 'light' }) {
  const isDark = variant === 'dark';
  return (
    <div>
      <p className={`text-[11px] font-semibold mb-1.5 ${isDark ? 'text-[#e8f0d0]/80' : 'text-[#163d15]'}`}>{label}</p>
      <div className={`relative rounded-xl ${isDark ? 'bg-[#1a4a1e]/60' : 'bg-[#eaf1ce]'} border ${isDark ? 'border-emerald-500/20' : 'border-[#c8d49a]/50'} overflow-hidden focus-within:border-emerald-400 transition-colors`}>
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8aaa6a]">
            <Icon size={16} />
          </div>
        )}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full ${Icon ? 'pl-9' : 'pl-4'} pr-4 py-2.5 text-sm outline-none bg-transparent ${isDark ? 'text-[#e8f0d0] placeholder:text-[#6a8f4b]/60' : 'text-[#163d15] placeholder:text-[#6a8f4b]'}`}
        />
      </div>
    </div>
  );
}

function Toggle({ label, checked, onChange, hint, variant = 'light' }) {
  const isDark = variant === 'dark';
  return (
    <div className={`flex items-start justify-between gap-4 rounded-xl p-4 ${isDark ? 'bg-[#1a4a1e]/40 border border-emerald-500/10' : 'bg-[#163d15]/5'}`}>
      <div className="flex-1">
        <p className={`text-[13px] font-semibold ${isDark ? 'text-[#e8f0d0]' : 'text-[#163d15]'}`}>{label}</p>
        {hint && <p className={`text-[11px] mt-1 ${isDark ? 'text-[#8aaa6a]/70' : 'text-[#6a8f4b]'}`}>{hint}</p>}
      </div>
      <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
        <span className={`w-12 h-6 rounded-full transition-colors duration-200 ${checked ? 'bg-emerald-400' : (isDark ? 'bg-[#2a4a2a]' : 'bg-gray-300')}`} />
        <span className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
      </label>
    </div>
  );
}

function Badge({ children, variant = 'primary' }) {
  const styles = {
    primary: 'bg-[#163d15] text-[#eaf7d9]',
    secondary: 'bg-[#eaf1ce] text-[#163d15]',
    success: 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30',
  };
  return (
    <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${styles[variant]}`}>
      {children}
    </span>
  );
}

function StatItem({ label, value }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-[#163d15]/5 last:border-0">
      <span className="text-xs text-[#6a8f4b]">{label}</span>
      <span className="text-xs font-semibold text-[#163d15]">{value}</span>
    </div>
  );
}

export default function EditProfilePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('profile');

  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('Dr. Ahmed');
  const [phone, setPhone] = useState('03XX-XXXXXXX');
  const [email, setEmail] = useState('example@gmail.com');
  const [licenseNo, setLicenseNo] = useState('PH-XXXX');
  const [gst, setGst] = useState('01-23-4567-890-12');
  const [ntn, setNtn] = useState('12345678-9');
  const [fbrEnabled, setFbrEnabled] = useState(true);
  const [autoGst, setAutoGst] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f3edd0] font-sans">
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <UserSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activeNav={activeNav} onNavChange={(id) => { setActiveNav(id); setSidebarOpen(false); }} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-[#234f24]/20 bg-[#0b3a11] px-4">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setSidebarOpen(true)} className="shrink-0 rounded-lg p-1.5 text-[#c8d898] hover:bg-[#1f491d] transition-colors lg:hidden" aria-label="Open menu">
              <Menu size={18} />
            </button>
            <span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#e9e6cf]/70">USER-DASHBOARD / Edit Profile - Pharmacy</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1f491d] border border-[rgba(110,185,80,0.3)] text-[10px] font-extrabold text-[#e8f2d8]">
              AK
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-4">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <h1 className="text-xl font-extrabold text-[#163d15] tracking-tight">Edit Profile</h1>
                  <p className="text-sm text-[#6a8f4b] mt-0.5">Manage your business information and account settings</p>
                </div>
                <div className="flex gap-2">
                  <button className="rounded-xl bg-linear-to-b from-[#15421b] to-[#103616] px-4 py-2 text-sm font-bold text-[#f3efcf] shadow-sm hover:shadow-md transition-all flex items-center gap-1.5">
                    <Save size={14} />
                    Save changes
                  </button>
                  <button className="rounded-xl border border-[#c8d49a] px-3 py-2 text-sm font-bold text-[#163d15] hover:bg-[#163d15]/5 transition-colors flex items-center gap-1.5">
                    <X size={14} />
                    Discard
                  </button>
                </div>
              </div>

              {/* Customer Details */}
              <section className="rounded-2xl bg-[#0f3d13]/95 p-5 text-[#e8f0d0] border border-emerald-500/20 shadow-lg">
                <h3 className="text-xs font-bold text-[#e8f0d0] mb-3 flex items-center gap-2 uppercase tracking-wider">
                  <Building2 size={14} className="text-emerald-400" />
                  Customer Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="col-span-1 sm:col-span-2">
                    <Input 
                      label="Business Name" 
                      value={businessName} 
                      onChange={setBusinessName} 
                      placeholder="Enter Name" 
                      icon={Building2}
                      variant="dark" 
                    />
                  </div>
                  <Input 
                    label="Owner Name" 
                    value={ownerName} 
                    onChange={setOwnerName} 
                    placeholder="Dr. Ahmed" 
                    icon={User}
                    variant="dark" 
                  />
                  <Input 
                    label="Phone Number" 
                    value={phone} 
                    onChange={setPhone} 
                    placeholder="03XX-XXXXXXX" 
                    icon={Phone}
                    variant="dark" 
                  />
                  <Input 
                    label="Email Address" 
                    value={email} 
                    onChange={setEmail} 
                    placeholder="example@gmail.com" 
                    icon={Mail}
                    variant="dark" 
                  />
                  <Input 
                    label="License No." 
                    value={licenseNo} 
                    onChange={setLicenseNo} 
                    placeholder="PH-XXXX" 
                    icon={FileText}
                    variant="dark" 
                  />
                </div>
              </section>

              {/* Tax & Compliance */}
              <section className="rounded-2xl bg-[#0f3d13]/95 p-5 text-[#e8f0d0] border border-emerald-500/20 shadow-lg">
                <h3 className="text-xs font-bold text-[#e8f0d0] mb-3 flex items-center gap-2 uppercase tracking-wider">
                  <CreditCard size={14} className="text-emerald-400" />
                  Tax & Compliance
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input 
                    label="GST Number" 
                    value={gst} 
                    onChange={setGst} 
                    placeholder="01-23-4567-890-12" 
                    variant="dark" 
                  />
                  <Input 
                    label="NTN Number" 
                    value={ntn} 
                    onChange={setNtn} 
                    placeholder="12345678-9" 
                    variant="dark" 
                  />
                </div>

                <div className="mt-3 space-y-2">
                  <Toggle 
                    label="FBR digital invoicing" 
                    checked={fbrEnabled} 
                    onChange={setFbrEnabled} 
                    hint="Auto-report invoices to FBR in real time" 
                    variant="dark" 
                  />
                  <Toggle 
                    label="Auto-apply GST on bills" 
                    checked={autoGst} 
                    onChange={setAutoGst} 
                    hint="Add 17% GST to every generated invoice" 
                    variant="dark" 
                  />
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <aside className="space-y-4">
              {/* Profile Card */}
              <div className="rounded-2xl bg-[#f3edc7] p-5 border border-[#cfc089] shadow-sm">
                <div className="flex justify-center">
                  <div className="h-20 w-20 rounded-2xl bg-linear-to-br from-[#163d15] to-[#1f4a1d] flex items-center justify-center text-2xl font-bold text-[#eaf7d9] shadow-md">
                    AS
                  </div>
                </div>
                <p className="text-center text-base font-extrabold text-[#163d15] mt-3">Al-Shifa Pharmacy</p>
                <p className="text-center text-xs text-[#6a8f4b]">Ahmed Khan · Karachi</p>
                <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
                  <Badge variant="primary">Pro Plan</Badge>
                  <Badge variant="secondary">FBR ON</Badge>
                </div>
                <div className="mt-3 pt-3 border-t border-[#163d15]/10 space-y-0.5">
                  <StatItem label="Member Since" value="Jan 2025" />
                  <StatItem label="Total bills" value="1,042" />
                  <StatItem label="Last login" value="Today 06:29" />
                </div>
              </div>

              {/* Billing Summary */}
              <div className="rounded-2xl bg-[#f3edc7] p-5 border border-[#cfc089] shadow-sm">
                <h4 className="text-xs font-bold text-[#163d15] flex items-center gap-2 uppercase tracking-wider">
                  <CreditCard size={14} />
                  Bill Summary
                </h4>
                <div className="mt-2">
                  <p className="text-sm font-semibold text-[#163d15]">Pro Plan</p>
                  <p className="text-xs text-[#6a8f4b] mt-0.5 flex items-center gap-1.5">
                    <Calendar size={12} />
                    Renews July 17, 2026
                  </p>
                  <div className="mt-3 pt-3 border-t border-[#163d15]/10">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-[#163d15]">18 days remaining</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 text-[10px] font-bold">Active</span>
                    </div>
                    <button className="mt-3 w-full rounded-xl border-2 border-[#163d15] py-2 text-sm font-bold text-[#163d15] hover:bg-[#163d15] hover:text-[#eaf7d9] transition-all flex items-center justify-center gap-2">
                      Manage Subscription
                      <ChevronDown size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer Plan Indicator */}
              <div className="hidden lg:flex items-center justify-center gap-3 px-3 py-1.5 bg-[#163d15]/10 rounded-full">
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#6a8f4b]">Plan</span>
                <Badge variant="primary">Pro</Badge>
                <span className="text-[9px] font-semibold text-[#6a8f4b]">18 days left</span>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}