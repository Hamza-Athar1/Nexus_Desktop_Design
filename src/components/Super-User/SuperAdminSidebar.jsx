import {
  LayoutDashboard,
  GitPullRequest,
  Users,
  UserCheck,
  Receipt,
  CreditCard,
  UserCircle,
  Palette,
  ArrowLeft,
  LogOut,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiFetchJson } from '../../lib/api';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'users', label: 'User Management', icon: Users },
  { id: 'approvals', label: 'User Approvals', icon: UserCheck, hasBadge: true },
  { id: 'billing', label: 'Billing', icon: Receipt },
  { id: 'payment', label: 'Payment', icon: CreditCard },
  { id: 'requests', label: 'Requests', icon: GitPullRequest },
  { id: 'profile', label: 'Settings', icon: UserCircle },
  { id: 'pos', label: 'Theme Management', icon: Palette },
];

function NavItem({ icon: Icon, label, active, onClick, badgeCount }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-full text-left transition duration-200 ${active
        ? 'bg-[#eae2bf] text-[#0c3818] font-bold shadow-sm'
        : 'text-[#a2bc90] hover:bg-[#114720]/40 hover:text-[#eae2bf]'
        }`}
    >
      <div className="flex items-center gap-3">
        <Icon size={20} className={active ? 'text-[#0c3818]' : 'text-[#a2bc90]'} />
        <span className="text-sm tracking-wide">{label}</span>
      </div>
      {typeof badgeCount === 'number' && badgeCount > 0 && (
        <span className={`px-2 py-0.5 rounded-full text-xs font-black ${active ? 'bg-[#0c3818] text-[#efeacb]' : 'bg-[#e5a024] text-black'}`}>
          {badgeCount}
        </span>
      )}
    </button>
  );
}

export default function SuperAdminSidebar({ isOpen, onClose, activeTab, onTabChange }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);

  useEffect(() => {
    let active = true;
    async function fetchPendingCount() {
      try {
        const { ok, data } = await apiFetchJson('/admin/requests?status=Pending');
        if (ok && active && Array.isArray(data?.requests)) {
          const regPending = data.requests.filter(r => r.requestType === 'registration');
          setPendingApprovalsCount(regPending.length);
        }
      } catch {
        // keep 0 on failure
      }
    }
    fetchPendingCount();
    return () => { active = false; };
  }, [location.pathname]);

  // Determine active tab dynamically if not explicitly provided as a prop
  let currentActiveTab = activeTab;
  if (!currentActiveTab) {
    currentActiveTab = 'dashboard';
    if (location.pathname.includes('/super-admin/approvals')) currentActiveTab = 'approvals';
    else if (location.pathname.includes('/super-admin/requests')) currentActiveTab = 'requests';
    else if (location.pathname.includes('/super-admin/users')) currentActiveTab = 'users';
    else if (location.pathname.includes('/super-admin/billing')) currentActiveTab = 'billing';
    else if (location.pathname.includes('/super-admin/payment')) currentActiveTab = 'payment';
    else if (location.pathname.includes('/super-admin/profile')) currentActiveTab = 'profile';
    else if (location.pathname.includes('/super-admin/pos')) currentActiveTab = 'pos';
  }

  const handleNav = (id) => {
    if (onTabChange) {
      onTabChange(id);
    } else {
      if (id === 'dashboard') navigate('/super-admin');
      else navigate(`/super-admin/${id}`);
    }
    if (onClose) onClose();
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-72 flex flex-col transition-transform duration-300 lg:static ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
    >

      {/* Dark Green Sidebar Navigation Area */}
      <div className="bg-[#0c3818] flex-1 p-5 flex flex-col gap-6 overflow-y-auto">
        {/* Top ellipsis and back arrow */}
        <div className="flex flex-col gap-2 items-start">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2.5 px-4.5 py-2 rounded-full border border-[#efeacb]/15 bg-[#efeacb]/10 text-[#a2bc90] hover:text-[#efeacb] hover:bg-[#efeacb]/20 transition-all duration-200 cursor-pointer text-xs font-black uppercase tracking-wider hover:-translate-x-0.5 active:scale-[0.98] select-none"
          >
            <ArrowLeft size={15} />
            <span>Go Back</span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-2">
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={currentActiveTab === item.id}
              badgeCount={item.hasBadge ? pendingApprovalsCount : undefined}
              onClick={() => handleNav(item.id)}
            />
          ))}
        </nav>

        {/* Logout */}
        <div className="mt-auto pt-4 border-t border-[#efeacb]/10">
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-full text-left transition duration-200 text-[#f4a98a] hover:bg-[#5c1a1a]/40 hover:text-[#f9c4af] active:scale-[0.98] cursor-pointer"
          >
            <LogOut size={20} className="text-[#f4a98a]" />
            <span className="text-sm tracking-wide">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
