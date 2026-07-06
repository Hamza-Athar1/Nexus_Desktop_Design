import { useState } from 'react';
import { Menu } from 'lucide-react';
import UserSidebar from '../../components/UserSidebar';

function Input({ label, value, onChange, placeholder, variant = 'light' }) {
  const isDark = variant === 'dark';
  return (
    <div>
      <p className={`text-[11px] font-bold mb-1 ${isDark ? 'text-[#e8f0d0]' : 'text-[#163d15]'}`}>{label}</p>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-lg border-none px-3 py-2 text-sm outline-none ${isDark ? 'bg-[#f3edc7] text-[#163d15]' : 'bg-[#eaf1ce] text-[#163d15]'}`}
      />
    </div>
  );
}

function Toggle({ label, checked, onChange, hint, variant = 'light' }) {
  const isDark = variant === 'dark';
  return (
    <div className={`flex items-center justify-between gap-3 rounded-lg p-3 ${isDark ? 'bg-[#113d1a]/80' : 'bg-[#163d15]/5'}`}>
      <div>
        <p className={`text-[12px] font-bold ${isDark ? 'text-[#e8f0d0]' : 'text-[#163d15]'}`}>{label}</p>
        {hint && <p className={`text-[12px] mt-1 ${isDark ? 'text-[#d1e6c6]' : 'text-[#6a8f4b]'}`}>{hint}</p>}
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
        <span className={`w-11 h-6 rounded-full transition-colors ${checked ? 'bg-emerald-400' : (isDark ? 'bg-[#254823]' : 'bg-gray-300')}`} />
        <span className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </label>
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
    <div className="flex h-screen w-full overflow-hidden bg-[#f3edd0] font-[Inter,sans-serif]">
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <UserSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activeNav={activeNav} onNavChange={(id) => { setActiveNav(id); setSidebarOpen(false); }} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-13.5 shrink-0 items-center justify-between gap-2 border-b border-[#234f24]/15 bg-[#0b3a11] px-3 sm:gap-4 sm:px-5">
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setSidebarOpen(true)} className="shrink-0 rounded p-1 text-[#c8d898] lg:hidden" aria-label="Open menu">
              <Menu size={20} />
            </button>
            <span className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#e9e6cf]">USER-DASHBOARD</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(110,185,80,0.3)] bg-[#1f491d] text-[11px] font-extrabold text-[#e8f2d8]">AK</div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-extrabold text-[#163d15]">Edit Profile</h1>
                  <p className="text-sm text-[#6a8f4b] mt-1">Manage your business information and account settings</p>
                </div>
                  <div className="flex gap-3">
                    <button className="rounded-2xl bg-gradient-to-b from-[#15421b] to-[#103616] px-4 py-3 text-sm font-bold text-[#f3efcf] shadow-sm">Save changes</button>
                    <button className="rounded-lg border border-[#c8d49a] px-4 py-2 text-sm font-bold text-[#163d15]">Discard</button>
                  </div>
              </div>

              <section className="rounded-2xl bg-[#0f3d13]/95 p-5 text-[#e8f0d0] border border-emerald-500/20 shadow-md">
                <h3 className="text-sm font-bold text-[#e8f0d0] mb-3">Customer Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="col-span-1 sm:col-span-2">
                    <Input label="Business Name" value={businessName} onChange={setBusinessName} placeholder="Enter Name" variant="dark" />
                  </div>
                  <Input label="Owner Name" value={ownerName} onChange={setOwnerName} placeholder="Owner name" variant="dark" />
                  <Input label="Phone Number" value={phone} onChange={setPhone} placeholder="03XX-XXXXXXX" variant="dark" />
                  <Input label="Email Address" value={email} onChange={setEmail} placeholder="example@gmail.com" variant="dark" />
                  <Input label="License No." value={licenseNo} onChange={setLicenseNo} placeholder="PH-XXXX" variant="dark" />
                </div>
              </section>

              <section className="rounded-2xl bg-[#0f3d13]/95 p-5 text-[#e8f0d0] border border-emerald-500/20 shadow-md">
                <h3 className="text-sm font-bold text-[#e8f0d0] mb-3">Tax & Compliance</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="GST Number" value={gst} onChange={setGst} placeholder="01-23-4567-890-12" variant="dark" />
                  <Input label="NTN Number" value={ntn} onChange={setNtn} placeholder="12345678-9" variant="dark" />
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3">
                  <Toggle label="FBR digital invoicing" checked={fbrEnabled} onChange={setFbrEnabled} hint="Auto-report invoices to FBR in real time" variant="dark" />
                  <Toggle label="Auto-apply GST on bills" checked={autoGst} onChange={setAutoGst} hint="Add 17% GST to every generated invoice" variant="dark" />
                </div>
              </section>
            </div>

            <aside className="space-y-6">
              <div className="rounded-2xl bg-[#f3edc7] p-5 border border-[#cfc089]">
                <div className="h-20 w-20 rounded-md bg-[#163d15] mx-auto" />
                <p className="text-center text-lg font-bold text-[#163d15] mt-3">Al-Shifa Pharmacy</p>
                <p className="text-center text-sm text-[#6a8f4b]">Ahmed Khan · Karachi</p>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <span className="px-2 py-1 rounded bg-[#163d15] text-xs text-[#eaf7d9] font-bold">PRO PLAN</span>
                  <span className="px-2 py-1 rounded bg-[#eaf1ce] text-xs text-[#163d15] font-bold">FBR ON</span>
                </div>
                <div className="mt-4 text-sm text-[#163d15]">
                  <div className="flex justify-between"><span>Member Since</span><span>Jan 2025</span></div>
                  <div className="flex justify-between"><span>Total bills</span><span>1,042</span></div>
                  <div className="flex justify-between"><span>Last login</span><span>Today 06:29</span></div>
                </div>
              </div>

              <div className="rounded-2xl bg-[#f3edc7] p-5 border border-[#cfc089]">
                <p className="text-sm font-bold text-[#163d15]">Bill Summary</p>
                <p className="text-sm text-[#6a8f4b] mt-2">Pro Plan</p>
                <p className="text-xs text-[#163d15] mt-1">Renews July 17, 2026</p>
                <div className="mt-3 border-t pt-3">
                  <p className="text-[13px]">18 days remaining</p>
                  <button className="mt-3 w-full rounded-2xl border border-[#c8d49a] py-2 text-sm font-bold text-[#163d15]">Manage Subscription</button>
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
