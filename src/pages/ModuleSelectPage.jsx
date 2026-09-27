import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ChevronRight, Check, Syringe, ShoppingCart, Monitor, Cookie, Utensils, Store, Shirt } from 'lucide-react';
import NexusLogo from '../components/NexusLogo';
import { apiFetchJson } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const MODULE_ICONS = {
  syringe: Syringe,
  cart: ShoppingCart,
  laptop: Monitor,
  bread: Cookie,
  utensils: Utensils,
  store: Store,
  shirt: Shirt,
};

const MODULE_COLORS = {
  pharmacy: { color: '#e8f5e9', accent: '#2e7d32', tag: 'Healthcare' },
  grocery: { color: '#e3f2fd', accent: '#1565c0', tag: 'Retail' },
  electronics: { color: '#ede7f6', accent: '#4527a0', tag: 'Tech' },
  bakery: { color: '#fff8e1', accent: '#e65100', tag: 'Food' },
  restaurant: { color: '#fce4ec', accent: '#c62828', tag: 'F&B' },
  'general-store': { color: '#f3e5f5', accent: '#6a1b9a', tag: 'Retail' },
  clothing: { color: '#e0f7fa', accent: '#00695c', tag: 'Fashion' },
};

export default function ModuleSelectPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);
  const [launched, setLaunched] = useState(false);
  const [launchError, setLaunchError] = useState('');

  // 1. If user is not yet associated with a business, redirect to registration onboarding
  useEffect(() => {
    if (user && !user.businessId) {
      navigate('/register-business', { replace: true });
    }
  }, [user, navigate]);

  // 2. Load platform modules catalog
  useEffect(() => {
    async function loadCatalog() {
      setLoading(true);
      try {
        const res = await apiFetchJson('/catalog/modules');
        if (res.ok && Array.isArray(res.data?.modules)) {
          setModules(res.data.modules);
          // Default selection to first available module
          const firstAvail = res.data.modules.find(m => m.is_available);
          if (firstAvail) setActive(firstAvail.code);
        } else {
          setLaunchError('Failed to load module catalog');
        }
      } catch {
        setLaunchError('Unable to connect to server');
      } finally {
        setLoading(false);
      }
    }
    loadCatalog();
  }, []);

  const selectedMod = modules.find(m => m.code === active);

  const handleLaunch = () => {
    if (!active) return;
    const mod = modules.find(m => m.code === active);
    if (mod && !mod.is_available) {
      setLaunchError(`${mod.name} is not available yet.`);
      return;
    }

    setLaunchError('');
    setLaunched(true);

    // Save module code locally for POS session workspace context
    localStorage.setItem('nexus_module', active);

    setTimeout(() => {
      navigate('/pos');
    }, 600);
  };

  const handleLogout = () => logout();

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center nexus-bg text-[#14391a]">
        <span className="loading-dots"><span /><span /><span /><span /></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col nexus-bg font-sans">
      {/* Navbar */}
      <header className="w-full nexus-navbar flex items-center justify-between px-4 sm:px-7 h-13.5 sm:h-14.5 shrink-0 shadow-[0_2px_16px_rgba(0,0,0,0.2)]">
        <div className="flex items-center gap-2">
          <NexusLogo size={30} variant="light" />
          <span className="text-white font-bold text-[14px] sm:text-[15px] tracking-[0.3px]">Nexus Desktop</span>
        </div>

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

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center px-4 sm:px-8 pt-7 sm:pt-12 pb-8 sm:pb-10 gap-6 sm:gap-9">
        <div className="text-center px-2">
          <h1 className="text-[20px] sm:text-[26px] font-extrabold text-[#1a2e1a] mb-1.5 tracking-tight">
            Choose Your Business Module
          </h1>
          <p className="text-[12.5px] sm:text-[13.5px] text-[#4a6a3a]">
            Select an available module from the platform catalog to get started
          </p>
        </div>

        {/* Module Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 w-full max-w-225" role="list">
          {modules.map(mod => {
            const isActive = active === mod.code;
            const style = MODULE_COLORS[mod.code] || { color: '#ffffff', accent: '#0c3818', tag: 'Module' };
            const IconComp = MODULE_ICONS[mod.icon] || Store;

            return (
              <button
                key={mod.code}
                id={`module-${mod.code}`}
                role="listitem"
                aria-pressed={isActive}
                onClick={() => setActive(mod.code)}
                style={{
                  border: `2px solid ${isActive ? style.accent : 'transparent'}`,
                  background: isActive ? style.color : '#ffffff',
                  boxShadow: isActive ? `0 8px 24px ${style.accent}30` : '0 2px 8px rgba(0,0,0,0.06)',
                  transform: isActive ? 'translateY(-3px)' : undefined,
                  opacity: mod.is_available ? 1 : 0.65,
                }}
                className={[
                  'relative flex flex-col items-center gap-2 sm:gap-2.5 px-3 sm:px-4 pt-4 sm:pt-6 pb-4 sm:pb-5 rounded-2xl',
                  'cursor-pointer transition-all outline-none group',
                  !isActive && mod.is_available && 'hover:-translate-y-0.75 hover:shadow-[0_8px_20px_rgba(0,0,0,0.10)]',
                ].join(' ')}
              >
                {/* Active Badge */}
                {isActive && (
                  <span
                    className="pop-in absolute top-2.5 right-2.5 flex items-center justify-center w-5 h-5 rounded-full"
                    style={{ background: style.accent }}
                  >
                    <Check size={11} color="#fff" strokeWidth={3} />
                  </span>
                )}

                {/* Unavailable Badge */}
                {!mod.is_available && (
                  <span className="absolute top-2.5 left-2.5 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 border border-amber-300">
                    More Soon
                  </span>
                )}

                {/* Icon bubble */}
                <span
                  className="flex items-center justify-center w-11.5 h-11.5 sm:w-14.5 sm:h-14.5 rounded-2xl text-[22px] sm:text-[28px] transition-colors"
                  style={{ background: isActive ? `${style.accent}18` : '#f4f6f0', color: style.accent }}
                >
                  <IconComp size={26} />
                </span>

                {/* Name */}
                <span
                  className="text-[12px] sm:text-[14px] font-bold text-center transition-colors"
                  style={{ color: isActive ? style.accent : '#1a2e1a' }}
                >
                  {mod.name}
                </span>

                {/* Tagline */}
                <span className="hidden sm:block text-[11px] text-gray-500 text-center leading-relaxed font-medium">
                  {mod.tagline || 'Business module'}
                </span>

                {/* Tag chip */}
                <span
                  className="mt-0.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition-all"
                  style={{
                    background: isActive ? `${style.accent}18` : '#f0f4ec',
                    color: isActive ? style.accent : '#6b7280',
                  }}
                >
                  {style.tag}
                </span>
              </button>
            );
          })}
        </div>

        {/* Action bar */}
        <div className="flex flex-col items-center gap-3 w-full max-w-full sm:max-w-105">
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

          <button
            id="launch-module-btn"
            onClick={handleLaunch}
            disabled={!active || !selectedMod?.is_available}
            className={[
              'w-full flex items-center justify-center gap-2 py-3.25 rounded-[10px]',
              'text-[14px] font-bold border-none transition-all',
              active && selectedMod?.is_available
                ? 'bg-nexus text-white cursor-pointer hover:bg-nexus-dark shadow-[0_4px_16px_rgba(30,92,30,0.3)] active:scale-[0.99]'
                : 'bg-[#c8d8b4] text-[#8a9a7a] cursor-not-allowed',
            ].join(' ')}
          >
            {launched ? (
              <>
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-white shrink-0 animate-ping" />
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