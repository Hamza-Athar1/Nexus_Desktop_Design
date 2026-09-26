import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  FileText,
  UserCircle,
  Receipt,
  MessageSquare,
  ArrowLeft,
  Sliders,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminSidebar({ activeTab, isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Determine active tab dynamically if not provided as a prop
  let currentActiveTab = activeTab;
  if (!currentActiveTab) {
    currentActiveTab = 'dashboard';
    if (location.pathname.includes('/admin/products')) currentActiveTab = 'products';
    else if (location.pathname.includes('/admin/categories')) currentActiveTab = 'categories';
    else if (location.pathname.includes('/admin/sales')) currentActiveTab = 'sales';
    else if (location.pathname.includes('/admin/reports')) currentActiveTab = 'reports';
    else if (location.pathname.includes('/admin/user')) currentActiveTab = 'user';
    else if (location.pathname.includes('/admin/requests')) currentActiveTab = 'requests';
    else if (location.pathname.includes('/admin/billing')) currentActiveTab = 'billing';
  }

  const handleNav = (tabId, path) => {
    navigate(path);
    if (onClose) onClose();
  };

  const navItemClass = (tabId) => {
    const isActive = currentActiveTab === tabId || (tabId === 'sales' && location.pathname.startsWith('/admin/sales'));
    return `w-full flex items-center gap-3 px-5 py-3.5 rounded-full text-left transition duration-200 cursor-pointer ${
      isActive
        ? 'bg-[#efeacb] text-[#0c3818] font-bold shadow-sm'
        : 'text-[#a2bc90] hover:bg-[#114720]/40 hover:text-[#efeacb]'
    }`;
  };

  const iconClass = (tabId) => {
    const isActive = currentActiveTab === tabId || (tabId === 'sales' && location.pathname.startsWith('/admin/sales'));
    return isActive ? 'text-[#0c3818]' : 'text-[#a2bc90]';
  };

  return (
    <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 flex flex-col shrink-0 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
      {/* Theme-aware Sidebar Navigation Area */}
      <div className="bg-[#0c3818] flex-1 p-5 flex flex-col gap-6 overflow-y-auto" style={{ backgroundColor: 'var(--color-primary, #0c3818)' }}>
        <div className="flex flex-col gap-2 items-start">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2.5 px-4.5 py-2 rounded-full border border-[#efeacb]/15 bg-[#efeacb]/10 text-[#a2bc90] hover:text-[#efeacb] hover:bg-[#efeacb]/20 transition-all duration-200 cursor-pointer text-xs font-black uppercase tracking-wider hover:-translate-x-0.5 active:scale-[0.98] select-none"
          >
            <ArrowLeft size={15} />
            <span>Go Back</span>
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex flex-col gap-2">
          {/* Dashboard */}
          <button
            onClick={() => handleNav('dashboard', '/admin')}
            className={navItemClass('dashboard')}
          >
            <LayoutDashboard size={20} className={iconClass('dashboard')} />
            <span className="text-sm tracking-wide">Dashboard</span>
          </button>

          {/* Manage Product */}
          <button
            onClick={() => handleNav('products', '/admin/products')}
            className={navItemClass('products')}
          >
            <Sliders size={20} className={iconClass('products')} />
            <span className="text-sm tracking-wide">Manage Product</span>
          </button>

          {/* Sales */}
          <div className="flex flex-col">
            <button
              onClick={() => handleNav('sales', '/admin/sales')}
              className={navItemClass('sales')}
            >
              <ShoppingCart size={20} className={iconClass('sales')} />
              <span className="text-sm tracking-wide">Sales</span>
            </button>

            {/* Submenu under Sales */}
            {location.pathname.startsWith('/admin/sales') && (
              <div className="flex flex-col gap-2 pl-9 mt-1.5 select-none">
                <button
                  onClick={() => handleNav('sales-history', '/admin/sales/history')}
                  className={`w-full flex items-center gap-2.5 py-1 text-left text-xs font-bold transition duration-200 cursor-pointer ${
                    location.pathname === '/admin/sales/history' ? 'text-[#efeacb]' : 'text-[#a2bc90] hover:text-[#efeacb]'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full transition-all ${
                    location.pathname === '/admin/sales/history'
                      ? 'bg-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.6)]'
                      : 'border border-[#a2bc90] bg-transparent'
                  }`} />
                  <span>Sales History</span>
                </button>

                <button
                  onClick={() => handleNav('sales-returns', '/admin/sales/returns')}
                  className={`w-full flex items-center gap-2.5 py-1 text-left text-xs font-bold transition duration-200 cursor-pointer ${
                    location.pathname === '/admin/sales/returns' ? 'text-[#efeacb]' : 'text-[#a2bc90] hover:text-[#efeacb]'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full transition-all ${
                    location.pathname === '/admin/sales/returns'
                      ? 'bg-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.6)]'
                      : 'border border-[#a2bc90] bg-transparent'
                  }`} />
                  <span>Return/Refunds</span>
                </button>
              </div>
            )}
          </div>

          {/* Reports */}
          <div className="flex flex-col">
            <button
              onClick={() => handleNav('reports', '/admin/reports')}
              className={navItemClass('reports')}
            >
              <FileText size={20} className={iconClass('reports')} />
              <span className="text-sm tracking-wide">Reports</span>
            </button>

            {/* Submenu under Reports */}
            {location.pathname.startsWith('/admin/reports') && (
              <div className="flex flex-col gap-2 pl-9 mt-1.5 select-none">
                <button
                  onClick={() => handleNav('reports-sales', '/admin/reports/sales')}
                  className={`w-full flex items-center gap-2.5 py-1 text-left text-xs font-bold transition duration-200 cursor-pointer ${
                    location.pathname === '/admin/reports/sales' ? 'text-[#efeacb]' : 'text-[#a2bc90] hover:text-[#efeacb]'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full transition-all ${
                    location.pathname === '/admin/reports/sales'
                      ? 'bg-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.6)]'
                      : 'border border-[#a2bc90] bg-transparent'
                  }`} />
                  <span>Sales Report</span>
                </button>

                <button
                  onClick={() => handleNav('reports-product', '/admin/reports/product')}
                  className={`w-full flex items-center gap-2.5 py-1 text-left text-xs font-bold transition duration-200 cursor-pointer ${
                    location.pathname === '/admin/reports/product' ? 'text-[#efeacb]' : 'text-[#a2bc90] hover:text-[#efeacb]'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full transition-all ${
                    location.pathname === '/admin/reports/product'
                      ? 'bg-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.6)]'
                      : 'border border-[#a2bc90] bg-transparent'
                  }`} />
                  <span>Product Report</span>
                </button>

                <button
                  onClick={() => handleNav('reports-profit', '/admin/reports/profit')}
                  className={`w-full flex items-center gap-2.5 py-1 text-left text-xs font-bold transition duration-200 cursor-pointer ${
                    location.pathname === '/admin/reports/profit' ? 'text-[#efeacb]' : 'text-[#a2bc90] hover:text-[#efeacb]'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full transition-all ${
                    location.pathname === '/admin/reports/profit'
                      ? 'bg-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.6)]'
                      : 'border border-[#a2bc90] bg-transparent'
                  }`} />
                  <span>Profit Report</span>
                </button>

                <button
                  onClick={() => handleNav('reports-stock', '/admin/reports/stock')}
                  className={`w-full flex items-center gap-2.5 py-1 text-left text-xs font-bold transition duration-200 cursor-pointer ${
                    location.pathname === '/admin/reports/stock' ? 'text-[#efeacb]' : 'text-[#a2bc90] hover:text-[#efeacb]'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full transition-all ${
                    location.pathname === '/admin/reports/stock'
                      ? 'bg-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.6)]'
                      : 'border border-[#a2bc90] bg-transparent'
                  }`} />
                  <span>Stock Report</span>
                </button>
              </div>
            )}
          </div>

          {/* User */}
          <button
            onClick={() => handleNav('user', '/admin/user')}
            className={navItemClass('user')}
          >
            <UserCircle size={20} className={iconClass('user')} />
            <span className="text-sm tracking-wide">User</span>
          </button>

          {/* Requests */}
          <button
            onClick={() => handleNav('requests', '/admin/requests')}
            className={navItemClass('requests')}
          >
            <MessageSquare size={20} className={iconClass('requests')} />
            <span className="text-sm tracking-wide">Requests</span>
          </button>

          {/* Billing */}
          <button
            onClick={() => handleNav('billing', '/admin/billing')}
            className={navItemClass('billing')}
          >
            <Receipt size={20} className={iconClass('billing')} />
            <span className="text-sm tracking-wide">Billing</span>
          </button>
        </nav>

        {/* Logout */}
        <div className="mt-auto pt-4 border-t border-[#efeacb]/10">
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center gap-3 px-5 py-3.5 rounded-full text-left transition duration-200 text-[#f4a98a] hover:bg-[#5c1a1a]/40 hover:text-[#f9c4af] active:scale-[0.98] cursor-pointer"
          >
            <LogOut size={20} className="text-[#f4a98a]" />
            <span className="text-sm tracking-wide">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
