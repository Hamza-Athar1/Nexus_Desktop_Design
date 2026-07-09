import { useState } from 'react';
import { Menu, Sun, Moon, Check, Save, Palette, Bell, Globe, ShoppingCart } from 'lucide-react';
import UserSidebar from '../../components/UserSidebar';


function SettingsToggle({ label, description, checked, onChange, variant = 'dark' }) {
  const isDark = variant === 'dark';
  return (
    <label className={`flex items-start justify-between gap-4 py-2.5 border-b ${isDark ? 'border-emerald-500/10' : 'border-[#163d15]/10'} last:border-0 cursor-pointer`}>
      <div className="flex-1">
        <div className={`text-[13px] font-semibold ${isDark ? 'text-[#e8f0d0]' : 'text-[#163d15]'}`}>{label}</div>
        {description && <div className={`text-[11px] mt-0.5 ${isDark ? 'text-[#8aaa6a]/70' : 'text-[#6a8f4b]'}`}>{description}</div>}
      </div>
      <div className="relative inline-flex items-center flex-shrink-0 mt-0.5">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
        <span className={`w-11 h-6 rounded-full transition-colors duration-200 ${checked ? 'bg-emerald-400' : (isDark ? 'bg-[#2a4a2a]' : 'bg-gray-300')}`} />
        <span className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </div>
    </label>
  );
}

function ColorOption({ id, color, selected, onClick }) {
  return (
    <button 
      onClick={() => onClick(id)} 
      className={`w-10 h-10 rounded-xl border-2 transition-all ${selected ? 'border-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.3)] ring-2 ring-emerald-400/50' : 'border-transparent hover:border-emerald-400/50'}`} 
      style={{ background: color }} 
      aria-label={id}
    />
  );
}

function SelectField({ label, value, options, onChange, variant = 'dark' }) {
  const isDark = variant === 'dark';
  return (
    <div>
      <p className={`text-[11px] font-semibold mb-1.5 ${isDark ? 'text-[#e8f0d0]/80' : 'text-[#163d15]'}`}>{label}</p>
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-xl px-4 py-2.5 text-sm outline-none border ${isDark ? 'bg-[#1a4a1e]/60 border-emerald-500/20 text-[#e8f0d0]' : 'bg-[#eaf1ce] border-[#c8d49a]/50 text-[#163d15]'}`}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
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
  const [lowStockAlerts, setLowStockAlerts] = useState(true);
  const [dailySalesSummary, setDailySalesSummary] = useState(true);
  const [subscriptionReminder, setSubscriptionReminder] = useState(true);
  const [billSound, setBillSound] = useState(true);
  const [barcodeBeep, setBarcodeBeep] = useState(false);
  const [desktopNotifications, setDesktopNotifications] = useState(false);
  const [language, setLanguage] = useState('en');
  const [currency, setCurrency] = useState('pkr');
  const [timezone, setTimezone] = useState('pkt');

  const saveChanges = () => {
    alert('Settings saved successfully!');
  };

  const colorOptions = [
    { id: 'forest', color: '#0F4A15' },
    { id: 'navy', color: '#1a365d' },
    { id: 'crimson', color: '#7f1d1d' },
    { id: 'royal', color: '#4c1d95' },
    { id: 'midnight', color: '#0f172a' },
  ];

  const themeNames = {
    forest: 'Forest green',
    navy: 'Navy blue',
    crimson: 'Crimson red',
    royal: 'Royal purple',
    midnight: 'Midnight black'
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f3edd0] font-['Inter',sans-serif]">
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <UserSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activeNav={activeNav} onNavChange={(id) => { setActiveNav(id); setSidebarOpen(false); }} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-[#234f24]/20 bg-[#0b3a11] px-4">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setSidebarOpen(true)} className="shrink-0 rounded-lg p-1.5 text-[#c8d898] hover:bg-[#1f491d] transition-colors lg:hidden" aria-label="Open menu">
              <Menu size={18} />
            </button>
            <span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#e9e6cf]/70">USER-DASHBOARD / Settings - Pharmacy</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#d8e0b4]">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#5dd456] shadow-[0_0_6px_#5dd456]" />
              <span className="hidden sm:inline">Online</span>
            </div>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1f491d] border border-[rgba(110,185,80,0.3)] text-[10px] font-extrabold text-[#e8f2d8]">AK</div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <h1 className="text-xl font-extrabold text-[#163d15] tracking-tight">Settings</h1>
                <p className="text-sm text-[#6a8f4b] mt-0.5">Customize your Nexus POS experience</p>
              </div>
              <button onClick={saveChanges} className="rounded-xl bg-gradient-to-b from-[#15421b] to-[#103616] px-5 py-2 text-sm font-bold text-[#f3efcf] shadow-sm hover:shadow-md transition-all flex items-center gap-2">
                <Save size={16} />
                Save changes
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Left Column */}
              <div className="space-y-4">
                {/* Theme */}
                <section className="rounded-2xl bg-[#0f3d13]/95 p-5 border border-emerald-500/20 shadow-lg">
                  <h3 className="text-xs font-bold text-[#e8f0d0] mb-3 flex items-center gap-2 uppercase tracking-wider">
                    <Palette size={14} className="text-emerald-400" />
                    Theme
                  </h3>
                  
                  <div className="mb-4">
                    <p className="text-[11px] font-semibold text-[#e8f0d0]/80 mb-2">Color Theme</p>
                    <div className="flex items-center gap-2">
                      {colorOptions.map(opt => (
                        <ColorOption 
                          key={opt.id} 
                          id={opt.id} 
                          color={opt.color} 
                          selected={theme === opt.id} 
                          onClick={setTheme} 
                        />
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-[11px] font-semibold text-[#e8f0d0]/80 mb-2">Interface Mode</p>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setMode('light')} 
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${
                          mode === 'light' 
                            ? 'bg-[#eaf1ce] text-[#163d15] border-[#eaf1ce] shadow-[0_0_20px_rgba(52,211,153,0.15)]' 
                            : 'bg-transparent text-[#e8f0d0] border-emerald-500/30 hover:border-emerald-500/50 hover:bg-emerald-500/5'
                        }`}
                      >
                        <Sun size={16} /> Light Mode
                        {mode === 'light' && <Check size={14} className="ml-1" />}
                      </button>
                      <button 
                        onClick={() => setMode('dark')} 
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${
                          mode === 'dark' 
                            ? 'bg-[#1a4a1e] text-[#e8f0d0] border-[#1a4a1e] shadow-[0_0_20px_rgba(52,211,153,0.15)]' 
                            : 'bg-transparent text-[#e8f0d0] border-emerald-500/30 hover:border-emerald-500/50 hover:bg-emerald-500/5'
                        }`}
                      >
                        <Moon size={16} /> Dark Mode
                        {mode === 'dark' && <Check size={14} className="ml-1" />}
                      </button>
                    </div>
                  </div>

                  <div className="rounded-xl bg-[#1a4a1e]/60 p-3 border border-emerald-500/10">
                    <p className="text-[11px] text-[#8aaa6a]">
                      <span className="font-semibold">Accent Color Preview</span>
                      <span className="mx-2">•</span>
                      <span style={{ color: colorOptions.find(c => c.id === theme)?.color }}>
                        {themeNames[theme]} - {colorOptions.find(c => c.id === theme)?.color}
                      </span>
                    </p>
                  </div>
                </section>

                {/* POS Behaviour */}
                <section className="rounded-2xl bg-[#0f3d13]/95 p-5 border border-emerald-500/20 shadow-lg">
                  <h3 className="text-xs font-bold text-[#e8f0d0] mb-3 flex items-center gap-2 uppercase tracking-wider">
                    <ShoppingCart size={14} className="text-emerald-400" />
                    POS Behaviour
                  </h3>
                  
                  <div className="space-y-0">
                    <SettingsToggle 
                      label="Auto clear cart after bill" 
                      description="Empty cart automatically after generating bill"
                      checked={autoClear}
                      onChange={setAutoClear}
                    />
                    <SettingsToggle 
                      label="Show product images" 
                      description="Display product images in POS grid"
                      checked={showImages}
                      onChange={setShowImages}
                    />
                    <SettingsToggle 
                      label="Require password on open" 
                      description="Lock POS on idle, require PIN to resume"
                      checked={requirePassword}
                      onChange={setRequirePassword}
                    />
                    <div className="flex items-center gap-3 pt-2.5">
                      <div className="flex-1">
                        <p className="text-[11px] font-semibold text-[#e8f0d0]/80">Low stock threshold</p>
                        <p className="text-[10px] text-[#8aaa6a]/70">Alert when quantity falls below this number</p>
                      </div>
                      <input 
                        type="number" 
                        value={lowStockThreshold} 
                        onChange={(e) => setLowStockThreshold(Number(e.target.value))} 
                        className="w-20 rounded-xl px-3 py-2 text-sm border border-emerald-500/20 bg-[#1a4a1e]/60 text-[#e8f0d0] outline-none focus:border-emerald-400" 
                      />
                    </div>
                  </div>
                </section>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {/* Notifications */}
                <section className="rounded-2xl bg-[#f3edc7] p-5 border border-[#cfc089] shadow-sm">
                  <h3 className="text-xs font-bold text-[#163d15] mb-3 flex items-center gap-2 uppercase tracking-wider">
                    <Bell size={14} />
                    Notifications
                  </h3>
                  
                  <div className="mb-4">
                    <p className="text-[11px] font-semibold text-[#163d15]/80 mb-2">In-App Alerts</p>
                    <div className="space-y-0">
                      <SettingsToggle 
                        label="Low stock alerts" 
                        description="Alert when items fall below minimum quantity"
                        checked={lowStockAlerts}
                        onChange={setLowStockAlerts}
                        variant="light"
                      />
                      <SettingsToggle 
                        label="Daily sales summary" 
                        description="End of day sales notification"
                        checked={dailySalesSummary}
                        onChange={setDailySalesSummary}
                        variant="light"
                      />
                      <SettingsToggle 
                        label="Subscription reminder" 
                        description="Alert 7 days before plan expires"
                        checked={subscriptionReminder}
                        onChange={setSubscriptionReminder}
                        variant="light"
                      />
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold text-[#163d15]/80 mb-2">Sound and Display</p>
                    <div className="space-y-0">
                      <SettingsToggle 
                        label="Bill Confirmation sound" 
                        description="Play sound when bill is generated"
                        checked={billSound}
                        onChange={setBillSound}
                        variant="light"
                      />
                      <SettingsToggle 
                        label="Barcode scan beep" 
                        description="Beep on successful barcode scan"
                        checked={barcodeBeep}
                        onChange={setBarcodeBeep}
                        variant="light"
                      />
                      <SettingsToggle 
                        label="Desktop notifications" 
                        description="Show system tray notification"
                        checked={desktopNotifications}
                        onChange={setDesktopNotifications}
                        variant="light"
                      />
                    </div>
                  </div>
                </section>

                {/* Language and Region */}
                <section className="rounded-2xl bg-[#f3edc7] p-5 border border-[#cfc089] shadow-sm">
                  <h3 className="text-xs font-bold text-[#163d15] mb-3 flex items-center gap-2 uppercase tracking-wider">
                    <Globe size={14} />
                    Language and Region
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <SelectField 
                      label="Language" 
                      value={language} 
                      onChange={setLanguage}
                      options={[
                        { value: 'en', label: 'English' },
                        { value: 'ur', label: 'Urdu' },
                        { value: 'ar', label: 'Arabic' },
                      ]}
                      variant="light"
                    />
                    <SelectField 
                      label="Currency" 
                      value={currency} 
                      onChange={setCurrency}
                      options={[
                        { value: 'pkr', label: 'PKR - Rs' },
                        { value: 'usd', label: 'USD - $' },
                        { value: 'eur', label: 'EUR - €' },
                      ]}
                      variant="light"
                    />
                    <SelectField 
                      label="Timezone" 
                      value={timezone} 
                      onChange={setTimezone}
                      options={[
                        { value: 'pkt', label: 'PKT' },
                        { value: 'gmt', label: 'GMT' },
                        { value: 'est', label: 'EST' },
                      ]}
                      variant="light"
                    />
                  </div>
                </section>

                {/* Footer Plan Indicator */}
                <div className="flex items-center justify-center gap-3 px-3 py-1.5 bg-[#163d15]/10 rounded-full">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#6a8f4b]">Plan</span>
                  <span className="px-2.5 py-0.5 rounded-lg bg-[#163d15] text-[#eaf7d9] text-[9px] font-bold uppercase tracking-wide">Pro</span>
                  <span className="text-[9px] font-semibold text-[#6a8f4b]">18 days left</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}