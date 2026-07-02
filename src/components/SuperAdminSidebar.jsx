import {
  LayoutDashboard,
  Users,
  FileText,
  Server,
  Sparkles,
  ShieldCheck,
  Settings,
  X,
} from 'lucide-react';
import NexusLogo from './NexusLogo';

const NAV_MAIN = [
  { id: 'dashboard', label: 'Dashboard',   icon: LayoutDashboard },
  { id: 'users',     label: 'All Users',   icon: Users },
  { id: 'logs',      label: 'System logs', icon: FileText },
  { id: 'backend',   label: 'Backend',     icon: Server },
  { id: 'updates',   label: 'Updates',     icon: Sparkles },
  { id: 'modules',   label: 'Modules',     icon: LayoutDashboard },
];

const NAV_ACCOUNT = [
  { id: 'security', label: 'Security', icon: ShieldCheck },
  { id: 'settings', label: 'Settings', icon: Settings },
];

function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition ${
        active ? 'bg-[#f4f0cc] text-[#153216]' : 'text-[#d7e0b8] hover:bg-[#c7d4a4]/20'
      }`}
    >
      <Icon size={16} className={active ? 'text-[#153216]' : 'text-[#c7d4a6]'} />
      <span className="font-semibold text-sm">{label}</span>
    </button>
  );
}

/**
 * SuperAdminSidebar — responsive off-canvas sidebar for the Super Admin Dashboard.
 *
 * Props:
 *   isOpen      {boolean}  — whether the mobile drawer is open
 *   onClose     {function} — called when the close button or a nav item is tapped
 *   activeTab   {string}   — id of the currently active nav item
 *   onTabChange {function} — called with the new tab id when a nav item is clicked
 */
export default function SuperAdminSidebar({ isOpen, onClose, activeTab, onTabChange }) {
  const handleNav = (id) => {
    onTabChange(id);
    onClose();
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#143913] border-r border-[#356028]/40 p-5 transition-transform duration-300 lg:static ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Logo + close button */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <NexusLogo size={28} variant="light" />
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] font-bold text-[#e8e2b4]">Super Admin</p>
            <p className="text-[11px] text-[#c9d5ad]">Dashboard</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="lg:hidden text-[#cfd9b6] hover:text-[#f2f2d1]"
        >
          <X size={20} />
        </button>
      </div>

      {/* Main nav */}
      <div className="space-y-3">
        <p className="text-[9px] uppercase tracking-[0.22em] font-bold text-[#b2c18f]">Main</p>
        {NAV_MAIN.map(item => (
          <NavItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={activeTab === item.id}
            onClick={() => handleNav(item.id)}
          />
        ))}

        <p className="mt-6 text-[9px] uppercase tracking-[0.22em] font-bold text-[#b2c18f]">Account</p>
        {NAV_ACCOUNT.map(item => (
          <NavItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={activeTab === item.id}
            onClick={() => handleNav(item.id)}
          />
        ))}
      </div>
    </aside>
  );
}
