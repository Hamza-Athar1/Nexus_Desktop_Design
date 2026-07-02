import {
  LayoutDashboard,
  Package,
  ReceiptText,
  BarChart3,
  User,
  Settings2,
  MonitorSmartphone,
  X,
} from 'lucide-react';
import NexusLogo from './NexusLogo';

const NAV_MAIN = [
  { id: 'dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { id: 'pos',       label: 'POS System', icon: MonitorSmartphone },
  { id: 'inventory', label: 'Inventory',  icon: Package },
  { id: 'billing',   label: 'Billing',    icon: ReceiptText },
  { id: 'reports',   label: 'Reports',    icon: BarChart3 },
];

const NAV_ACCOUNT = [
  { id: 'profile',  label: 'Edit Profile', icon: User },
  { id: 'settings', label: 'Settings',     icon: Settings2 },
];

function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        width: '100%',
        padding: '9px 14px',
        borderRadius: '999px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: active ? '600' : '500',
        textAlign: 'left',
        transition: 'all 0.18s ease',
        background: active ? '#dce8b2' : 'transparent',
        color: active ? '#0f2f10' : '#b8c99a',
      }}
    >
      <Icon size={15} style={{ color: active ? '#0f2f10' : '#8aab70', flexShrink: 0 }} />
      {label}
    </button>
  );
}

/**
 * UserSidebar — responsive off-canvas sidebar for User Dashboard pages.
 *
 * Props:
 *   isOpen      {boolean}  — whether the mobile drawer is open
 *   onClose     {function} — called when the close button or a nav item is tapped
 *   activeNav   {string}   — id of the currently active nav item
 *   onNavChange {function} — called with the new nav id when a nav item is clicked
 */
export default function UserSidebar({ isOpen, onClose, activeNav, onNavChange }) {
  const handleNav = (id) => {
    onNavChange(id);
    onClose();
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex flex-col overflow-y-auto transition-transform duration-300 lg:static lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
      style={{ width: '210px', minWidth: '210px', background: '#132e14', padding: '20px 14px' }}
    >
      {/* Logo + close button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <NexusLogo size={30} variant="light" />
          <div>
            <p style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '0.16em', color: '#e8e4b8', textTransform: 'uppercase', margin: 0 }}>
              User-Dashboard
            </p>
            <p style={{ fontSize: '10px', color: '#8aaa70', margin: 0 }}>POS System</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="lg:hidden"
          style={{ background: 'none', border: 'none', color: '#8aaa70', cursor: 'pointer', padding: '4px', lineHeight: 1 }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Main nav */}
      <p style={{ fontSize: '9px', fontWeight: '800', letterSpacing: '0.2em', color: '#6a8a55', textTransform: 'uppercase', padding: '0 14px', marginBottom: '6px', marginTop: 0 }}>
        Main
      </p>
      {NAV_MAIN.map(item => (
        <NavItem
          key={item.id}
          icon={item.icon}
          label={item.label}
          active={activeNav === item.id}
          onClick={() => handleNav(item.id)}
        />
      ))}

      {/* Account nav */}
      <p style={{ fontSize: '9px', fontWeight: '800', letterSpacing: '0.2em', color: '#6a8a55', textTransform: 'uppercase', padding: '0 14px', marginBottom: '6px', marginTop: '20px' }}>
        Account
      </p>
      {NAV_ACCOUNT.map(item => (
        <NavItem
          key={item.id}
          icon={item.icon}
          label={item.label}
          active={activeNav === item.id}
          onClick={() => handleNav(item.id)}
        />
      ))}

      <div style={{ flex: 1 }} />

      {/* PRO plan box */}
      <div style={{ border: '1px solid #2a4a2a', borderRadius: '14px', padding: '14px', background: 'rgba(255,255,255,0.04)' }}>
        <p style={{ fontSize: '9px', fontWeight: '700', letterSpacing: '0.16em', color: '#6a8a55', textTransform: 'uppercase', margin: '0 0 2px' }}>Plan</p>
        <p style={{ fontSize: '18px', fontWeight: '900', color: '#e8e4b8', margin: '0 0 10px' }}>PRO</p>
        <div style={{ height: '4px', borderRadius: '999px', background: 'rgba(255,255,255,0.12)', marginBottom: '8px', overflow: 'hidden' }}>
          <div style={{ width: '65%', height: '100%', borderRadius: '999px', background: '#6ab850' }} />
        </div>
        <p style={{ fontSize: '11px', color: '#8aaa70', margin: 0 }}>18 days left</p>
      </div>
    </aside>
  );
}
