import { useState } from 'react';
import { Menu, Sun, Moon, Check, Save } from 'lucide-react';
import UserSidebar from '../../components/UserSidebar';

function SectionTitle({ children }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] font-bold tracking-[0.12em] text-[#0f3a18] uppercase">{children}</span>
      <div className="flex-1 h-px bg-emerald-400/10" />
    </div>
  );
}

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('settings');

  const [theme, setTheme] = useState('forest');
  const [mode, setMode] = useState('light');
  const [autoClear, setAutoClear] = useState(true);
  const [showImages, setShowImages] = useState(false);
  const [requirePassword, setRequirePassword] = useState(false);
  const [lowStockThreshold, setLowStockThreshold] = useState(10);

  const saveChanges = () => {
    // placeholder for persist logic
    alert('Settings saved');
  };

  const colorOptions = [
    { id: 'forest', color: '#0f5a2b' },
    { id: 'navy', color: '#1f4b6b' },
    { id: 'crimson', color: '#8b1e2f' },
    { id: 'royal', color: '#5b3fbf' },
    { id: 'midnight', color: '#0b0f1a' },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f3edd0] font-inter">
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <UserSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activeNav={activeNav} onNavChange={(id) => { setActiveNav(id); setSidebarOpen(false); }} />

      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-4 sm:px-6 h-15 shrink-0 bg-[#0b3a11] border-b border-[#234f24]/15">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-[#d9ddc4] hover:text-[#f7f4d8]"><Menu size={22} /></button>
            <div className="text-[#e9e6cf] text-[10px] font-bold tracking-[0.18em] uppercase">USER-DASHBOARD</div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#356837]/15 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              <span className="text-xs text-emerald-300 font-semibold">Online</span>
            </div>
            <div className="w-8.5 h-8.5 rounded-full bg-linear-to-br from-[#1d5e2f] to-[#114923] border-2 border-[#2f7840]/20 flex items-center justify-center text-xs font-bold text-[#f6f1d4]">AK</div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7 flex flex-col gap-4 sm:gap-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-[28px] font-black text-[#0f3a18] mb-1.5">Settings</h1>
              <p className="text-xs text-[#3f5e39] m-0">Customize your Nexus POS experience</p>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={saveChanges} className="flex items-center gap-2 bg-[#f3edc7] px-4 py-2 rounded-lg border border-[#d8c98c] text-[#163d15] font-bold">
                <Save size={16} /> Save changes
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-4">
              <SectionTitle>Theme</SectionTitle>
              <div className="bg-[#0d3b15]/85 p-4 rounded-2xl border border-[#cfc089]">
                <div className="mb-3 text-sm font-bold text-[#eaf1ce]">Color Theme</div>
                <div className="flex items-center gap-3 mb-4">
                  {colorOptions.map(opt => (
                    <button key={opt.id} onClick={() => setTheme(opt.id)} className={`w-9 h-9 rounded-md border ${theme===opt.id? 'ring-2 ring-emerald-400':''}`} style={{ background: opt.color }} aria-label={opt.id} />
                  ))}
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <button onClick={() => setMode('light')} className={`flex items-center gap-2 px-3 py-2 rounded-md ${mode==='light'? 'bg-[#1a3d1a] text-[#e4ecba]':'bg-transparent text-[#163d15] border border-[#c8d49a]'}`}><Sun size={16} /> Light Mode</button>
                  <button onClick={() => setMode('dark')} className={`flex items-center gap-2 px-3 py-2 rounded-md ${mode==='dark'? 'bg-[#1a3d1a] text-[#e4ecba]':'bg-transparent text-[#163d15] border border-[#c8d49a]'}`}><Moon size={16} /> Dark Mode</button>
                </div>
              </div>

              <SectionTitle>POS Behaviour</SectionTitle>
              <div className="bg-[#0d3b15]/85 p-4 rounded-2xl border border-[#cfc089] space-y-3">
                <label className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-[#eaf1ce]">Auto clear cart after bill</div>
                    <div className="text-xs text-[#96c76e]">Empty cart automatically after generating bill</div>
                  </div>
                  <input type="checkbox" checked={autoClear} onChange={(e)=>setAutoClear(e.target.checked)} className="w-5 h-5" />
                </label>

                <label className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-[#eaf1ce]">Show product images</div>
                    <div className="text-xs text-[#96c76e]">Display product images in POS grid</div>
                  </div>
                  <input type="checkbox" checked={showImages} onChange={(e)=>setShowImages(e.target.checked)} className="w-5 h-5" />
                </label>

                <label className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-[#eaf1ce]">Require password on open</div>
                    <div className="text-xs text-[#96c76e]">Lock POS on idle, require PIN to resume</div>
                  </div>
                  <input type="checkbox" checked={requirePassword} onChange={(e)=>setRequirePassword(e.target.checked)} className="w-5 h-5" />
                </label>

                <div className="flex items-center gap-3">
                  <div className="text-sm text-[#eaf1ce]">Low stock threshold</div>
                  <input type="number" value={lowStockThreshold} onChange={(e)=>setLowStockThreshold(Number(e.target.value))} className="w-20 rounded-md px-2 py-1 border border-[#c8d49a] bg-white text-[#163d15]" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <SectionTitle>Notifications</SectionTitle>
              <div className="bg-[#f3edc7] p-4 rounded-2xl border border-[#cfc089] space-y-3">
                <label className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-[#163d15]">Low stock alerts</div>
                    <div className="text-xs text-[#6a8f4b]">Alert when items fall below minimum quantity</div>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5" />
                </label>

                <label className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-[#163d15]">Daily sales summary</div>
                    <div className="text-xs text-[#6a8f4b]">End of day sales notification</div>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5" />
                </label>

                <label className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-[#163d15]">Subscription reminder</div>
                    <div className="text-xs text-[#6a8f4b]">Alert 7 days before plan expires</div>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5" />
                </label>
              </div>

              <SectionTitle>Sound and Display</SectionTitle>
              <div className="bg-[#f3edc7] p-4 rounded-2xl border border-[#cfc089] space-y-3">
                <label className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-[#163d15]">Bill Confirmation sound</div>
                    <div className="text-xs text-[#6a8f4b]">Play sound when bill is generated</div>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5" />
                </label>

                <label className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-[#163d15]">Barcode scan beep</div>
                    <div className="text-xs text-[#6a8f4b]">Beep on successful barcode scan</div>
                  </div>
                  <input type="checkbox" className="w-5 h-5" />
                </label>

                <label className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-[#163d15]">Desktop notifications</div>
                    <div className="text-xs text-[#6a8f4b]">Show system tray notification</div>
                  </div>
                  <input type="checkbox" className="w-5 h-5" />
                </label>
              </div>

              <SectionTitle>Language and Region</SectionTitle>
              <div className="bg-[#f3edc7] p-4 rounded-2xl border border-[#cfc089] space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <select className="rounded-md px-3 py-2 border border-[#c8d49a] bg-white text-[#163d15]">
                    <option>English</option>
                  </select>
                  <select className="rounded-md px-3 py-2 border border-[#c8d49a] bg-white text-[#163d15]">
                    <option>PKR - Rs</option>
                  </select>
                  <select className="rounded-md px-3 py-2 border border-[#c8d49a] bg-white text-[#163d15]">
                    <option>PKT</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
