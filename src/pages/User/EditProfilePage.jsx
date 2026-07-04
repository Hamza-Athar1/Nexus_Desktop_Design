import { useState } from 'react';
import { Menu } from 'lucide-react';
import UserSidebar from '../../components/UserSidebar';

function Input({ label, value, onChange, placeholder }) {
  return (
    <div>
      <p className="text-[11px] font-bold text-[#163d15] mb-1">{label}</p>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border-none bg-[#eaf1ce] px-3 py-2 text-sm text-[#163d15] outline-none"
      />
    </div>
  );
}

function Toggle({ label, checked, onChange, hint }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-[#163d15]/5 p-3">
      <div>
        <p className="text-[12px] font-bold text-[#163d15]">{label}</p>
        {hint && <p className="text-[12px] text-[#6a8f4b] mt-1">{hint}</p>}
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
        <span className={`w-11 h-6 rounded-full transition-colors ${checked ? 'bg-emerald-400' : 'bg-gray-300'}`} />
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
    <div className="flex h-screen w-full overflow-hidden bg-[#f1e8c4] font-[Inter,sans-serif]">
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <UserSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activeNav={activeNav} onNavChange={(id) => { setActiveNav(id); setSidebarOpen(false); }} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-13.5 shrink-0 items-center justify-between gap-2 border-b border-emerald-500/15 bg-[#0c3410] px-3 sm:gap-4 sm:px-5">
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setSidebarOpen(true)} className="shrink-0 rounded p-1 text-[#c8d898] lg:hidden" aria-label="Open menu">
              <Menu size={20} />
            </button>
            <span className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#efe9c4]">USER-DASHBOARD</span>
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
                  <button className="rounded-lg bg-[#1a3d1a] px-4 py-2 text-sm font-bold text-[#e4ecba]">Save changes</button>
                  <button className="rounded-lg border border-[#c8d49a] px-4 py-2 text-sm font-bold text-[#163d15]">Discard</button>
                </div>
              </div>

              <section className="rounded-2xl bg-[#eaf1ce] p-5">
                <h3 className="text-sm font-bold text-[#163d15] mb-3">Customer Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="col-span-1 sm:col-span-2">
                    <Input label="Business Name" value={businessName} onChange={setBusinessName} placeholder="Enter Name" />
                  </div>
                  <Input label="Owner Name" value={ownerName} onChange={setOwnerName} placeholder="Owner name" />
                  <Input label="Phone Number" value={phone} onChange={setPhone} placeholder="03XX-XXXXXXX" />
                  <Input label="Email Address" value={email} onChange={setEmail} placeholder="example@gmail.com" />
                  <Input label="License No." value={licenseNo} onChange={setLicenseNo} placeholder="PH-XXXX" />
                </div>
              </section>

              <section className="rounded-2xl bg-[#eaf1ce] p-5">
                <h3 className="text-sm font-bold text-[#163d15] mb-3">Tax & Compliance</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="GST Number" value={gst} onChange={setGst} placeholder="01-23-4567-890-12" />
                  <Input label="NTN Number" value={ntn} onChange={setNtn} placeholder="12345678-9" />
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3">
                  <Toggle label="FBR digital invoicing" checked={fbrEnabled} onChange={setFbrEnabled} hint="Auto-report invoices to FBR in real time" />
                  <Toggle label="Auto-apply GST on bills" checked={autoGst} onChange={setAutoGst} hint="Add 17% GST to every generated invoice" />
                </div>
              </section>
            </div>

            <aside className="space-y-6">
              <div className="rounded-2xl bg-[#eaf1ce] p-5 border border-[#d8c98c]">
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

              <div className="rounded-2xl bg-[#eaf1ce] p-5 border border-[#d8c98c]">
                <p className="text-sm font-bold text-[#163d15]">Bill Summary</p>
                <p className="text-sm text-[#6a8f4b] mt-2">Pro Plan</p>
                <p className="text-xs text-[#163d15] mt-1">Renews July 17, 2026</p>
                <div className="mt-3 border-t pt-3">
                  <p className="text-[13px]">18 days remaining</p>
                  <button className="mt-3 w-full rounded-lg border border-[#c8d49a] py-2 text-sm font-bold text-[#163d15]">Manage Subscription</button>
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
