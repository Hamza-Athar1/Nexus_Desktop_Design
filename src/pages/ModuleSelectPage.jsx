import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ChevronRight, Check } from 'lucide-react';
import NexusLogo from '../components/NexusLogo';
import { apiFetch } from '../lib/api';
import { useAuth } from '../context/AuthContext';

/* ── Module definitions ───────────────────────────────────────────── */
const MODULES = [
  { id: 'pharmacy', name: 'Pharmacy', desc: 'Manage medicines & prescriptions', icon: '💊', color: '#e8f5e9', accent: '#2e7d32', tag: 'Healthcare' },
  { id: 'grocery', name: 'Grocery', desc: 'Stock, sales & inventory tracking', icon: '🛒', color: '#e3f2fd', accent: '#1565c0', tag: 'Retail' },
  { id: 'electronics', name: 'Electronics', desc: 'Devices, repairs & warranties', icon: '💻', color: '#ede7f6', accent: '#4527a0', tag: 'Tech' },
  { id: 'bakery', name: 'Bakery', desc: 'Orders, recipes & daily production', icon: '🧁', color: '#fff8e1', accent: '#e65100', tag: 'Food' },
  { id: 'restaurant', name: 'Restaurant', desc: 'Tables, menu & kitchen orders', icon: '🍽️', color: '#fce4ec', accent: '#c62828', tag: 'F&B' },
  { id: 'general-store', name: 'General Store', desc: 'All-purpose retail management', icon: '🏪', color: '#f3e5f5', accent: '#6a1b9a', tag: 'Retail' },
  { id: 'clothing', name: 'Clothing', desc: 'Sizes, styles & fashion inventory', icon: '👕', color: '#e0f7fa', accent: '#00695c', tag: 'Fashion' },
];

export default function ModuleSelectPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [active, setActive] = useState(null);
  const [launched, setLaunched] = useState(false);
  const [launchError, setLaunchError] = useState('');

  const selectedMod = MODULES.find(m => m.id === active);

  const handleLaunch = async () => {
    if (!active) return;

    setLaunchError('');
    setLaunched(true);

    try {
      const res = await apiFetch('/business/select-module', {
        method: 'POST',
        body: JSON.stringify({ moduleId: active }),
      });

      const data = await res.json();

      if (!res.ok) {
        setLaunched(false);
        setLaunchError(data.message || 'Could not save your module selection');
        return;
      }

      // Persist the chosen module locally so InventoryRouter and other
      // pages can read it without an extra round-trip.
      localStorage.setItem('nexus_module', active);

      setTimeout(() => navigate('/dashboard'), 900);
    } catch {
      setLaunched(false);
      setLaunchError('Unable to reach the server. Please try again.');
    }
  };

  const handleLogout = () => logout();

  return (
    <div className="min-h-screen w-full flex flex-col nexus-bg">

      {/* ── Navbar ──────────────────────────────────────────────────── */}
      <header className="w-full nexus-navbar flex items-center justify-between px-4 sm:px-7 h-13.5 sm:h-14.5 shrink-0 shadow-[0_2px_16px_rgba(0,0,0,0.2)]">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <NexusLogo size={30} variant="light" />
          <span className="text-white font-bold text-[14px] sm:text-[15px] tracking-[0.3px]">Nexus Desktop</span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-[12px] text-white/60">Choose a module to continue</span>
          <button
            id="logout-btn"
            onClick={handleLogout}
            className="flex items-center gap-1.5 bg-white/12 border border-white/20 rounded-lg text-white text-[13px] font-medium px-3 sm:px-3.5 py-1.5 cursor-pointer hover:bg-white/20 transition-all"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </header>

      {/* ── Main ────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center px-4 sm:px-8 pt-7 sm:pt-12 pb-8 sm:pb-10 gap-6 sm:gap-9">

        {/* Page title */}
        <div className="text-center px-2">
          <h1 className="text-[20px] sm:text-[26px] font-extrabold text-[#1a2e1a] mb-1.5 tracking-tight">
            Choose Your Business Module
          </h1>
          <p className="text-[12.5px] sm:text-[13.5px] text-[#4a6a3a]">
            Select a module that matches your business to get started
          </p>
        </div>

        {/* Module grid
            NOTE: per-module accent colors (border, shadow, bg) are dynamic,
            so a minimal inline style is kept only for those 2-3 properties.
            All structural/layout/typography uses Tailwind. */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 w-full max-w-225" role="list">
          {MODULES.map(mod => {
            const isActive = active === mod.id;
            return (
              <button
                key={mod.id}
                id={`module-${mod.id}`}
                role="listitem"
                aria-pressed={isActive}
                onClick={() => setActive(mod.id)}
                /* dynamic accent colours stay as inline since they vary per-module */
                style={{
                  border: `2px solid ${isActive ? mod.accent : 'transparent'}`,
                  background: isActive ? mod.color : '#ffffff',
                  boxShadow: isActive ? `0 8px 24px ${mod.accent}30` : '0 2px 8px rgba(0,0,0,0.06)',
                  transform: isActive ? 'translateY(-3px)' : undefined,
                }}
                className={[
                  'relative flex flex-col items-center gap-2 sm:gap-2.5 px-3 sm:px-4 pt-4 sm:pt-6 pb-4 sm:pb-5 rounded-2xl',
                  'cursor-pointer transition-all outline-none group',
                  !isActive && 'hover:-translate-y-0.75 hover:shadow-[0_8px_20px_rgba(0,0,0,0.10)]',
                ].join(' ')}
              >
                {/* Checkmark badge */}
                {isActive && (
                  <span
                    className="pop-in absolute top-2.5 right-2.5 flex items-center justify-center w-5 h-5 rounded-full"
                    style={{ background: mod.accent }}
                  >
                    <Check size={11} color="#fff" strokeWidth={3} />
                  </span>
                )}

                {/* Icon bubble */}
                <span
                  className="flex items-center justify-center w-11.5 h-11.5 sm:w-14.5 sm:h-14.5 rounded-2xl text-[22px] sm:text-[28px] transition-colors"
                  style={{ background: isActive ? `${mod.accent}18` : '#f4f6f0' }}
                  role="img"
                  aria-label={mod.name}
                >
                  {mod.icon}
                </span>

                {/* Name */}
                <span
                  className="text-[12px] sm:text-[14px] font-bold text-center transition-colors"
                  style={{ color: isActive ? mod.accent : '#1a2e1a' }}
                >
                  {mod.name}
                </span>

                {/* Description */}
                <span className="hidden sm:block text-[11px] text-gray-500 text-center leading-relaxed">
                  {mod.desc}
                </span>

                {/* Tag chip */}
                <span
                  className="mt-0.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition-all"
                  style={{
                    background: isActive ? `${mod.accent}18` : '#f0f4ec',
                    color: isActive ? mod.accent : '#6b7280',
                  }}
                >
                  {mod.tag}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Bottom action bar ──────────────────────────────────── */}
        <div className="flex flex-col items-center gap-3 w-full max-w-full sm:max-w-105">
          {/* Selection status */}
          <div className="h-7 flex items-center justify-center">
            {launchError ? (
              <p className="fade-up text-[13px] text-red-600 font-semibold">{launchError}</p>
            ) : selectedMod ? (
              <p className="fade-up text-[13px] text-nexus font-semibold">
                ✓ {selectedMod.name} selected
              </p>
            ) : (
              <p className="text-[13px] text-[#8a9a7a]">Select a module above to continue</p>
            )}
          </div>

          {/* Launch button */}
          <button
            id="launch-module-btn"
            onClick={handleLaunch}
            disabled={!active}
            className={[
              'w-full flex items-center justify-center gap-2 py-3.25 rounded-[10px]',
              'text-[14px] font-bold border-none transition-all',
              active
                ? 'bg-nexus text-white cursor-pointer hover:bg-nexus-dark shadow-[0_4px_16px_rgba(30,92,30,0.3)] active:scale-[0.99]'
                : 'bg-[#c8d8b4] text-[#8a9a7a] cursor-not-allowed',
            ].join(' ')}
          >
            {launched ? (
              <>
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-white shrink-0" />
                Launching&nbsp;
                <span className="loading-dots"><span /><span /><span /><span /></span>
              </>
            ) : (
              <>
                Launch {selectedMod ? selectedMod.name : 'Module'}
                <ChevronRight size={16} />
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}