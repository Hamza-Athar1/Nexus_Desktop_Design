import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  FileText,
  UserCircle,
  ArrowLeft,
  Sliders,
  X,
} from 'lucide-react';

export default function AdminSidebar({ activeTab, isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active tab dynamically if not provided as a prop
  let currentActiveTab = activeTab;
  if (!currentActiveTab) {
    currentActiveTab = 'dashboard';
    if (location.pathname.includes('/admin/products')) currentActiveTab = 'products';
    else if (location.pathname.includes('/admin/categories')) currentActiveTab = 'categories';
    else if (location.pathname.includes('/admin/sales')) currentActiveTab = 'sales';
    else if (location.pathname.includes('/admin/reports')) currentActiveTab = 'reports';
    else if (location.pathname.includes('/admin/user')) currentActiveTab = 'user';
  }

  const handleNav = (tabId, path) => {
    navigate(path);
    if (onClose) onClose();
  };

  const navItemClass = (tabId) => {
    const isActive = currentActiveTab === tabId;
    return `w-full flex items-center gap-3 px-5 py-3.5 rounded-full text-left transition duration-200 cursor-pointer ${
      isActive
        ? 'bg-[#efeacb] text-[#0c3818] font-bold shadow-sm'
        : 'text-[#a2bc90] hover:bg-[#114720]/40 hover:text-[#efeacb]'
    }`;
  };

  const iconClass = (tabId) => {
    const isActive = currentActiveTab === tabId;
    return isActive ? 'text-[#0c3818]' : 'text-[#a2bc90]';
  };

  return (
    <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 flex flex-col shrink-0 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
      {/* Dark Green Sidebar Navigation Area */}
      <div className="bg-[#0c3818] flex-1 p-5 flex flex-col gap-6 overflow-y-auto">
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
          <div className="flex flex-col">
            <button
              onClick={() => handleNav('products', '/admin/products')}
              className={navItemClass('products')}
            >
              <Sliders size={20} className={iconClass('products')} />
              <span className="text-sm tracking-wide">Manage Product</span>
            </button>

            {/* Submenu under Manage Product */}
            {(currentActiveTab === 'products' || currentActiveTab === 'categories') && (
              <div className="flex flex-col gap-1.5 pl-9 mt-1.5 select-none">
                <button
                  onClick={() => handleNav('products', '/admin/products')}
                  className={`w-full flex items-center gap-2 py-1 text-left text-xs font-bold transition duration-200 cursor-pointer ${
                    currentActiveTab === 'products' ? 'text-[#efeacb]' : 'text-[#a2bc90] hover:text-[#efeacb]'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full bg-current`} />
                  <span>Product</span>
                </button>

                <button
                  onClick={() => handleNav('categories', '/admin/categories')}
                  className={`w-full flex items-center gap-2 py-1 text-left text-xs font-bold transition duration-200 cursor-pointer ${
                    currentActiveTab === 'categories' ? 'text-[#efeacb]' : 'text-[#a2bc90] hover:text-[#efeacb]'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full bg-current`} />
                  <span>Categories</span>
                </button>
              </div>
            )}
          </div>

          {/* Sales */}
          <button
            onClick={() => handleNav('sales', '/admin/sales')}
            className={navItemClass('sales')}
          >
            <ShoppingCart size={20} className={iconClass('sales')} />
            <span className="text-sm tracking-wide">Sales</span>
          </button>

          {/* Reports */}
          <button
            onClick={() => handleNav('reports', '/admin/reports')}
            className={navItemClass('reports')}
          >
            <FileText size={20} className={iconClass('reports')} />
            <span className="text-sm tracking-wide">Reports</span>
          </button>

          {/* User */}
          <button
            onClick={() => handleNav('user', '/admin/user')}
            className={navItemClass('user')}
          >
            <UserCircle size={20} className={iconClass('user')} />
            <span className="text-sm tracking-wide">User</span>
          </button>
        </nav>
      </div>
    </aside>
  );
}
