import {
  LayoutDashboard,
  GitPullRequest,
  Users,
  Receipt,
  CreditCard,
  UserCircle,
  Settings,
  ArrowLeft,
  X,
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'requests', label: 'Requests', icon: GitPullRequest },
  { id: 'users', label: 'User management', icon: Users },
  { id: 'billing', label: 'Billing', icon: Receipt },
  { id: 'payment', label: 'Payment', icon: CreditCard },
  { id: 'profile', label: 'Profile Management', icon: UserCircle },
  { id: 'pos', label: 'POS management', icon: Settings },
];

function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-full text-left transition duration-200 ${active
        ? 'bg-[#eae2bf] text-[#0c3818] font-bold shadow-sm'
        : 'text-[#a2bc90] hover:bg-[#114720]/40 hover:text-[#eae2bf]'
        }`}
    >
      <Icon size={20} className={active ? 'text-[#0c3818]' : 'text-[#a2bc90]'} />
      <span className="text-sm tracking-wide">{label}</span>
    </button>
  );
}

export default function SuperAdminSidebar({ isOpen, onClose, activeTab, onTabChange }) {
  const handleNav = (id) => {
    onTabChange(id);
    if (onClose) onClose();
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-72 flex flex-col transition-transform duration-300 lg:static ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
    >
      {/* Beige Logo Area */}
      <div className="bg-[#eae3c1] p-6 flex flex-col items-start justify-center border-b border-[#c8c2a3]/30 h-40 shrink-0 relative">
        <img src="/Nexus_superadmin.png" alt="Nexus Logo" className="h-48 w-auto object-contain" />
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden absolute top-4 right-4 text-[#0c3818] hover:text-black"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Dark Green Sidebar Navigation Area */}
      <div className="bg-[#0c3818] flex-1 p-5 flex flex-col gap-6 overflow-y-auto">
        {/* Top ellipsis and back arrow */}
        <div className="flex flex-col gap-2 items-start">
          <button
            onClick={onClose}
            className="flex items-center justify-center w-10 h-10 rounded-lg border border-[#3f5a3b] bg-[#082813] text-white hover:bg-[#114720] transition duration-200"
          >
            <ArrowLeft size={18} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-2">
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={activeTab === item.id}
              onClick={() => handleNav(item.id)}
            />
          ))}
        </nav>
      </div>
    </aside>
  );
}
