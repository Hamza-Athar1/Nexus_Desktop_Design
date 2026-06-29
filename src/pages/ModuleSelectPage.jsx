import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ChevronRight, Check } from 'lucide-react';
import NexusLogo from '../components/NexusLogo';

/* ── Module definitions with richer metadata ──────────────────────── */
const MODULES = [
  {
    id: 'pharmacy',
    name: 'Pharmacy',
    desc: 'Manage medicines & prescriptions',
    icon: '💊',
    color: '#e8f5e9',
    accent: '#2e7d32',
    tag: 'Healthcare',
  },
  {
    id: 'grocery',
    name: 'Grocery',
    desc: 'Stock, sales & inventory tracking',
    icon: '🛒',
    color: '#e3f2fd',
    accent: '#1565c0',
    tag: 'Retail',
  },
  {
    id: 'electronics',
    name: 'Electronics',
    desc: 'Devices, repairs & warranties',
    icon: '💻',
    color: '#ede7f6',
    accent: '#4527a0',
    tag: 'Tech',
  },
  {
    id: 'bakery',
    name: 'Bakery',
    desc: 'Orders, recipes & daily production',
    icon: '🧁',
    color: '#fff8e1',
    accent: '#e65100',
    tag: 'Food',
  },
  {
    id: 'restaurant',
    name: 'Restaurant',
    desc: 'Tables, menu & kitchen orders',
    icon: '🍽️',
    color: '#fce4ec',
    accent: '#c62828',
    tag: 'F&B',
  },
  {
    id: 'general-store',
    name: 'General Store',
    desc: 'All-purpose retail management',
    icon: '🏪',
    color: '#f3e5f5',
    accent: '#6a1b9a',
    tag: 'Retail',
  },
  {
    id: 'clothing',
    name: 'Clothing',
    desc: 'Sizes, styles & fashion inventory',
    icon: '👕',
    color: '#e0f7fa',
    accent: '#00695c',
    tag: 'Fashion',
  },
];

export default function ModuleSelectPage() {
  const navigate = useNavigate();
  const [active, setActive] = useState(null);
  const [launched, setLaunched] = useState(false);

  const selectedMod = MODULES.find(m => m.id === active);

  const handleLaunch = () => {
    if (!active) return;
    setLaunched(true);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #eaf0cc 0%, #d6e4a2 45%, #cade8e 100%)',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* ── Top Navigation Bar ────────────────────────────────────── */}
      <header
        style={{
          width: '100%',
          background: 'linear-gradient(90deg, #1a4a1a 0%, #1e5c1e 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 28px',
          height: '58px',
          flexShrink: 0,
          boxShadow: '0 2px 16px rgba(0,0,0,0.2)',
        }}
      >
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <NexusLogo size={34} variant="light" />
          <span
            style={{
              color: '#fff',
              fontWeight: 700,
              fontSize: '15px',
              letterSpacing: '0.3px',
            }}
          >
            Nexus Desktop
          </span>
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span
            style={{
              fontSize: '12px',
              color: 'rgba(255,255,255,0.6)',
            }}
          >
            Choose a module to continue
          </span>
          <button
            id="logout-btn"
            onClick={() => navigate('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 500,
              padding: '6px 14px',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </header>

      {/* ── Main content ──────────────────────────────────────────── */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '48px 32px 40px',
          gap: '36px',
        }}
      >
        {/* Page title */}
        <div style={{ textAlign: 'center' }}>
          <h1
            style={{
              fontSize: '26px',
              fontWeight: 800,
              color: '#1a2e1a',
              marginBottom: '6px',
              letterSpacing: '-0.3px',
            }}
          >
            Choose Your Business Module
          </h1>
          <p style={{ fontSize: '13.5px', color: '#4a6a3a' }}>
            Select a module that matches your business to get started
          </p>
        </div>

        {/* Module grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 180px)',
            gap: '16px',
          }}
          role="list"
        >
          {MODULES.map(mod => {
            const isActive = active === mod.id;
            return (
              <button
                key={mod.id}
                id={`module-${mod.id}`}
                role="listitem"
                aria-pressed={isActive}
                onClick={() => setActive(mod.id)}
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '24px 16px 20px',
                  borderRadius: '16px',
                  border: isActive ? `2px solid ${mod.accent}` : '2px solid transparent',
                  background: isActive ? mod.color : '#ffffff',
                  boxShadow: isActive
                    ? `0 8px 24px ${mod.accent}30`
                    : '0 2px 8px rgba(0,0,0,0.06)',
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                  transition: 'all 0.2s ease',
                  transform: isActive ? 'translateY(-3px)' : 'translateY(0)',
                  outline: 'none',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.10)';
                    e.currentTarget.style.borderColor = `${mod.accent}55`;
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                    e.currentTarget.style.borderColor = 'transparent';
                  }
                }}
              >
                {/* Selected checkmark badge */}
                {isActive && (
                  <span
                    className="pop-in"
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: mod.accent,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Check size={11} color="#fff" strokeWidth={3} />
                  </span>
                )}

                {/* Icon bubble */}
                <span
                  style={{
                    width: '58px',
                    height: '58px',
                    borderRadius: '16px',
                    background: isActive ? `${mod.accent}18` : '#f4f6f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                    transition: 'background 0.2s',
                  }}
                  role="img"
                  aria-label={mod.name}
                >
                  {mod.icon}
                </span>

                {/* Name */}
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: isActive ? mod.accent : '#1a2e1a',
                    transition: 'color 0.2s',
                    textAlign: 'center',
                  }}
                >
                  {mod.name}
                </span>

                {/* Description */}
                <span
                  style={{
                    fontSize: '11px',
                    color: '#6b7280',
                    textAlign: 'center',
                    lineHeight: 1.5,
                  }}
                >
                  {mod.desc}
                </span>

                {/* Tag chip */}
                <span
                  style={{
                    marginTop: '2px',
                    padding: '2px 10px',
                    borderRadius: '20px',
                    background: isActive ? `${mod.accent}18` : '#f0f4ec',
                    color: isActive ? mod.accent : '#6b7280',
                    fontSize: '10px',
                    fontWeight: 600,
                    transition: 'all 0.2s',
                  }}
                >
                  {mod.tag}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Bottom action bar ─────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            width: '100%',
            maxWidth: '420px',
          }}
        >
          {/* Selection hint or selected module name */}
          <div
            style={{
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {selectedMod ? (
              <p
                className="fade-up"
                style={{ fontSize: '13px', color: '#2e5c1e', fontWeight: 600 }}
              >
                ✓ {selectedMod.name} selected
              </p>
            ) : (
              <p style={{ fontSize: '13px', color: '#8a9a7a' }}>
                Select a module above to continue
              </p>
            )}
          </div>

          {/* Launch button */}
          <button
            id="launch-module-btn"
            onClick={handleLaunch}
            disabled={!active}
            style={{
              width: '100%',
              padding: '13px',
              borderRadius: '10px',
              background: active ? '#1e5c1e' : '#c8d8b4',
              color: active ? '#fff' : '#8a9a7a',
              border: 'none',
              fontWeight: 700,
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
              cursor: active ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s',
              boxShadow: active ? '0 4px 16px rgba(30,92,30,0.3)' : 'none',
            }}
            onMouseEnter={e => { if (active) e.currentTarget.style.background = '#14391a'; }}
            onMouseLeave={e => { if (active) e.currentTarget.style.background = '#1e5c1e'; }}
            onMouseDown={e => { if (active) e.currentTarget.style.transform = 'scale(0.99)'; }}
            onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            {launched ? (
              <>
                <span
                  style={{
                    display: 'inline-block',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: '#fff',
                    flexShrink: 0,
                  }}
                />
                Launching&nbsp;
                <span className="loading-dots">
                  <span /><span /><span /><span />
                </span>
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
