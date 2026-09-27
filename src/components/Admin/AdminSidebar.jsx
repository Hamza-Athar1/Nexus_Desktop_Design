import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  FileText,
  UserCircle,
  Receipt,
  MessageSquare,
  Sliders,
} from 'lucide-react';
import { SidebarContainer, NavSectionGroup, NavItem } from '../BaseSidebar';

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
    else if (location.pathname.includes('/admin/requests')) currentActiveTab = 'requests';
    else if (location.pathname.includes('/admin/billing')) currentActiveTab = 'billing';
  }

  const handleNav = (tabId, path) => {
    navigate(path);
    if (onClose) onClose();
  };

  return (
    <SidebarContainer isOpen={isOpen} brandName="Nexus Business" roleTag="Business Admin">
      {/* Overview Group */}
      <NavSectionGroup title="Overview">
        <NavItem
          icon={LayoutDashboard}
          label="Dashboard"
          active={currentActiveTab === 'dashboard'}
          onClick={() => handleNav('dashboard', '/admin')}
        />
      </NavSectionGroup>

      {/* Operations Group */}
      <NavSectionGroup title="Operations">
        <NavItem
          icon={ShoppingCart}
          label="POS Terminal"
          active={currentActiveTab === 'pos'}
          onClick={() => handleNav('pos', '/pos')}
        />
        <NavItem
          icon={Sliders}
          label="Products"
          active={currentActiveTab === 'products'}
          onClick={() => handleNav('products', '/admin/products')}
        />
      </NavSectionGroup>

      {/* Sales & Analytics Group */}
      <NavSectionGroup title="Sales & Analytics">
        <div className="flex flex-col">
          <NavItem
            icon={ShoppingCart}
            label="Sales"
            active={currentActiveTab === 'sales' || location.pathname.startsWith('/admin/sales')}
            onClick={() => handleNav('sales', '/admin/sales')}
          />
          {/* Submenu under Sales */}
          {location.pathname.startsWith('/admin/sales') && (
            <div className="flex flex-col gap-1.5 pl-9 mt-1 select-none">
              <button
                type="button"
                onClick={() => handleNav('sales-history', '/admin/sales/history')}
                className={`w-full flex items-center gap-2.5 py-1 text-left text-xs font-bold transition duration-200 cursor-pointer ${
                  location.pathname === '/admin/sales/history' ? 'text-[#efeacb]' : 'text-[#a2bc90] hover:text-[#efeacb]'
                }`}
              >
                <span className={`w-2 h-2 rounded-full transition-all ${
                  location.pathname === '/admin/sales/history'
                    ? 'bg-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.6)]'
                    : 'border border-[#a2bc90] bg-transparent'
                }`} />
                <span>Sales History</span>
              </button>

              <button
                type="button"
                onClick={() => handleNav('sales-returns', '/admin/sales/returns')}
                className={`w-full flex items-center gap-2.5 py-1 text-left text-xs font-bold transition duration-200 cursor-pointer ${
                  location.pathname === '/admin/sales/returns' ? 'text-[#efeacb]' : 'text-[#a2bc90] hover:text-[#efeacb]'
                }`}
              >
                <span className={`w-2 h-2 rounded-full transition-all ${
                  location.pathname === '/admin/sales/returns'
                    ? 'bg-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.6)]'
                    : 'border border-[#a2bc90] bg-transparent'
                }`} />
                <span>Returns / Refunds</span>
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <NavItem
            icon={FileText}
            label="Reports"
            active={currentActiveTab === 'reports' || location.pathname.startsWith('/admin/reports')}
            onClick={() => handleNav('reports', '/admin/reports')}
          />
          {/* Submenu under Reports */}
          {location.pathname.startsWith('/admin/reports') && (
            <div className="flex flex-col gap-1.5 pl-9 mt-1 select-none">
              <button
                type="button"
                onClick={() => handleNav('reports-sales', '/admin/reports/sales')}
                className={`w-full flex items-center gap-2.5 py-1 text-left text-xs font-bold transition duration-200 cursor-pointer ${
                  location.pathname === '/admin/reports/sales' ? 'text-[#efeacb]' : 'text-[#a2bc90] hover:text-[#efeacb]'
                }`}
              >
                <span className={`w-2 h-2 rounded-full transition-all ${
                  location.pathname === '/admin/reports/sales'
                    ? 'bg-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.6)]'
                    : 'border border-[#a2bc90] bg-transparent'
                }`} />
                <span>Sales Report</span>
              </button>

              <button
                type="button"
                onClick={() => handleNav('reports-product', '/admin/reports/product')}
                className={`w-full flex items-center gap-2.5 py-1 text-left text-xs font-bold transition duration-200 cursor-pointer ${
                  location.pathname === '/admin/reports/product' ? 'text-[#efeacb]' : 'text-[#a2bc90] hover:text-[#efeacb]'
                }`}
              >
                <span className={`w-2 h-2 rounded-full transition-all ${
                  location.pathname === '/admin/reports/product'
                    ? 'bg-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.6)]'
                    : 'border border-[#a2bc90] bg-transparent'
                }`} />
                <span>Product Report</span>
              </button>

              <button
                type="button"
                onClick={() => handleNav('reports-profit', '/admin/reports/profit')}
                className={`w-full flex items-center gap-2.5 py-1 text-left text-xs font-bold transition duration-200 cursor-pointer ${
                  location.pathname === '/admin/reports/profit' ? 'text-[#efeacb]' : 'text-[#a2bc90] hover:text-[#efeacb]'
                }`}
              >
                <span className={`w-2 h-2 rounded-full transition-all ${
                  location.pathname === '/admin/reports/profit'
                    ? 'bg-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.6)]'
                    : 'border border-[#a2bc90] bg-transparent'
                }`} />
                <span>Profit Report</span>
              </button>

              <button
                type="button"
                onClick={() => handleNav('reports-stock', '/admin/reports/stock')}
                className={`w-full flex items-center gap-2.5 py-1 text-left text-xs font-bold transition duration-200 cursor-pointer ${
                  location.pathname === '/admin/reports/stock' ? 'text-[#efeacb]' : 'text-[#a2bc90] hover:text-[#efeacb]'
                }`}
              >
                <span className={`w-2 h-2 rounded-full transition-all ${
                  location.pathname === '/admin/reports/stock'
                    ? 'bg-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.6)]'
                    : 'border border-[#a2bc90] bg-transparent'
                }`} />
                <span>Stock Report</span>
              </button>
            </div>
          )}
        </div>
      </NavSectionGroup>

      {/* Management & Account Group */}
      <NavSectionGroup title="Management">
        <NavItem
          icon={UserCircle}
          label="Staff & Account"
          active={currentActiveTab === 'user'}
          onClick={() => handleNav('user', '/admin/user')}
        />
        <NavItem
          icon={MessageSquare}
          label="Requests"
          active={currentActiveTab === 'requests'}
          onClick={() => handleNav('requests', '/admin/requests')}
        />
        <NavItem
          icon={Receipt}
          label="Billing & Settings"
          active={currentActiveTab === 'billing'}
          onClick={() => handleNav('billing', '/admin/billing')}
        />
      </NavSectionGroup>
    </SidebarContainer>
  );
}
