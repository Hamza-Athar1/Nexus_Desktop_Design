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
import { useNavigate, useLocation, Link } from 'react-router-dom';
import NexusLogo from './NexusLogo';

const NAV_MAIN = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'pos', label: 'POS System', icon: MonitorSmartphone },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'billing', label: 'Billing', icon: ReceiptText },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
];

const NAV_ACCOUNT = [
  { id: 'profile', label: 'Edit Profile', icon: User },
  { id: 'settings', label: 'Settings', icon: Settings2 },
];

function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-full border-none px-3 py-2.5 text-[13px] font-semibold text-left transition-all duration-200 ${
        active
          ? 'bg-[#f0ebca] text-[#0f3719] shadow-[0_0_18px_rgba(15,55,25,0.12)]'
          : 'bg-transparent text-[#e9e2b4] hover:bg-[#ecf0d0]/20'
      }`}
    >
      <Icon size={16} className={`shrink-0 ${active ? 'text-[#0f3719]' : 'text-[#e9e2b4]'}`} />
      {label}
    </button>
  );
}

export default function UserSidebar({ isOpen, onClose, activeNav, onNavChange }) {
  const navigate = useNavigate();
  const location = useLocation();

  const pathMap = {
    dashboard: '/dashboard',
    pos: '/pos',
    inventory: '/inventory',
    billing: '/billing',
    reports: '/reports',
    profile: '/profile',
    settings: '/settings',
  };

  const mapPathToId = (path) => {
    if (path.startsWith('/dashboard')) return 'dashboard';
    if (path.startsWith('/pos')) return 'pos';
    if (path.startsWith('/inventory')) return 'inventory';
    if (path.startsWith('/billing')) return 'billing';
    if (path.startsWith('/reports')) return 'reports';
    if (path.startsWith('/profile')) return 'profile';
    if (path.startsWith('/settings')) return 'settings';
    return null;
  };

  const handleNav = (id) => {
    if (onNavChange) onNavChange(id);
    if (onClose) onClose();
    const to = pathMap[id];
    if (to) navigate(to);
  };

  const activeFromPath = mapPathToId(location.pathname || '');
  const activeKey = activeFromPath || activeNav;

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex h-full w-[210px] min-w-[210px] flex-col overflow-y-auto border-r border-[#2f5e2c]/50 bg-[#113d1a] transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex h-15 shrink-0 items-center justify-between gap-2.5 border-b border-[#2f5e2c]/30 bg-[#143915] px-5">
        <div className="flex items-center gap-2.5">
          <NexusLogo size={26} variant="light" />
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#efe9c4]">
            User-Dashboard
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-[#d9ddc4] transition-colors hover:text-[#f7f4d8] lg:hidden"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex flex-1 flex-col overflow-y-auto p-5">
        <p className="mb-2 mt-0 px-2 text-[9px] font-bold uppercase tracking-[0.18em] text-[#efe9c4]">
          Main
        </p>
        {NAV_MAIN.map((item) => (
          <NavItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={activeKey === item.id}
            onClick={() => handleNav(item.id)}
          />
        ))}

        <p className="mb-2 mt-5 px-2 text-[9px] font-bold uppercase tracking-[0.18em] text-[#efe9c4]">
          Account
        </p>
        {NAV_ACCOUNT.map((item) => (
          <NavItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={activeKey === item.id}
            onClick={() => handleNav(item.id)}
          />
        ))}

        <div className="flex-1" />

        <div className="mb-4 rounded-2xl border border-emerald-500/20 bg-[#163d15]/90 p-3.5">
          <p className="mb-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-300/70">
            Plan
          </p>
          <p className="mb-2 text-xl font-black leading-tight text-[#eff0d0]">PRO</p>
          <div className="mb-1.5 h-1 overflow-hidden rounded-full bg-[#dbe2bb]/70">
            <div className="h-full rounded-full bg-emerald-400" style={{ width: '82%' }} />
          </div>
          <p className="m-0 text-[11px] text-[#c8d2a2]">18 days left</p>
        </div>
      </nav>
    </aside>
  );
}
