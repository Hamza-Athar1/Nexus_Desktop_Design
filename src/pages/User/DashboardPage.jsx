import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingCart, Archive, Receipt, BarChart2,
  UserCircle, Settings, Bell, Plus, FileText,
  TrendingUp, Package, Crown, Clock, AlertTriangle, Check,
  Menu, X, ChevronRight,
} from 'lucide-react';
import NexusLogo from '../../components/NexusLogo';
import UserSidebar from '../../components/UserSidebar';

// Navigation configuration
const NAV_MAIN = [
  { id: 'dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { id: 'pos',       label: 'POS System', icon: ShoppingCart    },
  { id: 'inventory', label: 'Inventory',  icon: Archive         },
  { id: 'billing',   label: 'Billing',    icon: Receipt         },
  { id: 'reports',   label: 'Reports',    icon: BarChart2       },
];

const NAV_ACCOUNT = [
  { id: 'profile',  label: 'Edit Profile', icon: UserCircle },
  { id: 'settings', label: 'Settings',     icon: Settings   },
];

// Mock data
const RECENT_ACTIVITY = [
  { id: 1, text: 'Bill #1042 created - Rs 3,200', time: '2m',  color: '#4ade80' },
  { id: 2, text: 'Panadol 500mg restocked',        time: '18m', color: '#4ade80' },
  { id: 3, text: 'Low stock - Augmentin',           time: '1h',  color: '#facc15' },
  { id: 4, text: 'Bill #1041 created - Rs 1,800',  time: '2h',  color: '#4ade80' },
];

const LOW_STOCK_ITEMS = [
  { name: 'Augmentin 625mg', qty: 8,  max: 100, color: '#ef4444' },
  { name: 'Panadol CF',      qty: 16, max: 100, color: '#facc15' },
  { name: 'ORD Sachet',      qty: 28, max: 100, color: '#facc15' },
  { name: 'Disprin 300mg',   qty: 55, max: 100, color: '#4ade80' },
];

// Date constants
const DAYS = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 
  'Thursday', 'Friday', 'Saturday'
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Utility functions
const padNumber = (n) => String(n).padStart(2, '0');

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

// Custom hook for real-time clock
function useClock() {
  const [time, setTime] = useState(new Date());
  
  useEffect(() => {
    const intervalId = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(intervalId);
  }, []);
  
  return time;
}

// Section Label Component
function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] font-bold tracking-[0.12em] text-[#123e20] uppercase">
        {children}
      </span>
      <div className="flex-1 h-px bg-emerald-400/10" />
    </div>
  );
}

// Statistics Card Component
function StatCard({ title, icon: Icon, children }) {
  return (
    <div className="flex-1 min-w-70 sm:min-w-0 bg-[#0d3b15]/95 border border-emerald-500/20 rounded-2xl p-4 sm:p-[18px_20px] flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold tracking-[0.12em] text-emerald-300/80 uppercase">
          {title}
        </span>
        <Icon size={16} className="text-emerald-400/40" />
      </div>
      {children}
    </div>
  );
}

// Quick Action Card Component
function QuickActionCard({ icon: Icon, label, sub, onClick }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <button 
      onClick={onClick} 
      onMouseEnter={() => setIsHovered(true)} 
      onMouseLeave={() => setIsHovered(false)}
      className={`
        flex-1 min-w-50 sm:min-w-0 rounded-2xl p-4 flex items-center gap-4
        cursor-pointer transition-all duration-200 text-left
        ${isHovered 
          ? 'bg-[#214f2d]/90 border-emerald-400/35' 
          : 'bg-[#113715]/90 border-emerald-500/20'
        }
        border
      `}
    >
      <span className={`
        flex items-center justify-center w-10 h-10 rounded-xl
        shrink-0 transition-colors duration-200
        ${isHovered 
          ? 'bg-emerald-400/20 border-emerald-400/20' 
          : 'bg-emerald-400/10 border-emerald-400/20'
        }
        border
      `}>
        <Icon size={18} className="text-emerald-400" />
      </span>
      <div>
        <p className="text-sm font-bold text-[#f7f4d9] m-0">{label}</p>
        <p className="text-[11px] text-[#c8d39d] m-0">{sub}</p>
      </div>
    </button>
  );
}

// Main Dashboard Component
export default function DashboardPage() {
  const navigate = useNavigate();
  const currentTime = useClock();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar on window resize (for desktop)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar when clicking on mobile nav item
  const handleNavClick = (id) => {
    setActiveTab(id);
    setIsSidebarOpen(false);
  };

  const hours = padNumber(currentTime.getHours());
  const minutes = padNumber(currentTime.getMinutes());
  const dayName = DAYS[currentTime.getDay()];
  const dateStr = `${currentTime.getDate()} ${MONTHS[currentTime.getMonth()]} ${currentTime.getFullYear()}`;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f1e8c4] font-inter">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar (shared component) */}
      <UserSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeNav={activeTab}
        onNavChange={(id) => handleNavClick(id)}
      />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Header / Topbar */}
        <header className="flex items-center justify-between px-4 sm:px-6 h-15 shrink-0 bg-[#0c3410] border-b border-emerald-500/15">
          <div className="flex items-center gap-2">
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden text-[#d9ddc4] hover:text-[#f7f4d8] transition-colors"
            >
              <Menu size={22} />
            </button>
            <NexusLogo size={22} variant="light" />
            <span className="hidden sm:inline text-[#e5e1c0] text-[10px] font-bold tracking-[0.18em] uppercase">
              USER-DASHBOARD
            </span>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Notification Bell */}
            <button className="relative bg-none border-none cursor-pointer text-[#d9ddc4] flex items-center hover:text-[#f7f4d8] transition-colors">
              <Bell size={18} />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400" />
            </button>
            
            {/* Online Status - Hidden on very small screens */}
            <div className="hidden sm:flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-full bg-[#356837]/15 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              <span className="text-xs text-emerald-300 font-semibold">Online</span>
            </div>
            
            {/* Module Selector - Hidden on small screens */}
            <button className="hidden md:block px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#dee1c4] bg-transparent cursor-pointer border border-emerald-500/20 hover:bg-[#c7d8b0]/20 transition-colors">
              Pharmacy Module
            </button>
            
            {/* User Avatar */}
            <div className="w-8.5 h-8.5 rounded-full bg-linear-to-br from-[#1d5e2f] to-[#114923] border-2 border-emerald-500/20 flex items-center justify-center text-xs font-bold text-[#f6f1d4] shrink-0">
              AK
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7 flex flex-col gap-4 sm:gap-6">
          {/* Greeting Section */}
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-[30px] font-black text-[#123e20] mb-1.5 leading-tight">
                {getGreeting()}, Ahmed
              </h1>
              <p className="text-xs sm:text-[13px] text-[#41603d] m-0 flex items-center gap-2 flex-wrap">
                <span>{dayName}</span>
                <span className="w-1 h-1 rounded-full bg-[#f1eac0]/50 inline-block" />
                <span>{dateStr}</span>
                <span className="hidden sm:inline w-1 h-1 rounded-full bg-[#f1eac0]/50" />
                <span className="hidden sm:inline">Pharmacy module</span>
              </p>
            </div>
            
            {/* Live Clock */}
            <div className="flex items-center gap-2 shrink-0 px-3 sm:px-4 py-2 rounded-xl bg-[#285f34]/10 border border-emerald-500/20">
              <span className="text-sm sm:text-base font-mono font-bold text-[#123e20] tracking-wider">
                {hours}:{minutes}
              </span>
              <span className="text-[10px] sm:text-[11px] text-[#123e20] font-semibold">PKT</span>
            </div>
          </div>

          {/* Summary Cards */}
          <section className="flex flex-col gap-3">
            <SectionLabel>Summary</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <StatCard title="Today's Sales" icon={ShoppingCart}>
                <div>
                  <p className="text-2xl sm:text-[28px] font-black text-[#f7f4d9] mb-1">Rs 84,200</p>
                  <p className="text-xs text-emerald-400 font-semibold m-0 flex items-center gap-1">
                    <TrendingUp size={13} />+12% vs yesterday
                  </p>
                </div>
              </StatCard>
              
              <StatCard title="Inventory" icon={Archive}>
                <div>
                  <p className="text-2xl sm:text-[28px] font-black text-[#f7f4d9] mb-1">1,340</p>
                  <p className="text-xs text-amber-400 font-semibold m-0 flex items-center gap-1">
                    <AlertTriangle size={12} />8 items low stock
                  </p>
                </div>
              </StatCard>
              
              <StatCard title="Subscription" icon={Crown}>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg w-fit bg-emerald-400/10 border border-emerald-400/20">
                    <Check size={13} className="text-emerald-400" />
                    <span className="text-[13px] font-bold text-emerald-400">PRO ACTIVE</span>
                  </div>
                  <p className="text-[11px] text-[#c7d6a7] m-0">Renews Jul 17, 2026</p>
                </div>
              </StatCard>
            </div>
          </section>

          {/* Quick Actions */}
          <section className="flex flex-col gap-3">
            <SectionLabel>Quick Actions</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <QuickActionCard 
                icon={Plus}      
                label="Add item"     
                sub="Add to inventory" 
                onClick={() => handleNavClick('inventory')} 
              />
              <QuickActionCard 
                icon={FileText}  
                label="Create bill"  
                sub="New transactions" 
                onClick={() => handleNavClick('billing')}   
              />
              <QuickActionCard 
                icon={BarChart2} 
                label="View reports" 
                sub="Sales analytics"  
                onClick={() => handleNavClick('reports')}   
              />
            </div>
          </section>

          {/* Bottom Panels: Recent Activity & Low Stock */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-2">
            {/* Recent Activity Panel */}
            <div className="bg-[#0f3d13]/90 border border-emerald-500/20 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-4">
                <Clock size={14} className="text-emerald-300" />
                <span className="text-[10px] font-bold tracking-[0.12em] text-emerald-300/80 uppercase">
                  Recent Activity
                </span>
              </div>
              <ul className="list-none m-0 p-0 flex flex-col gap-3">
                {RECENT_ACTIVITY.map((item) => (
                  <li key={item.id} className="flex items-center gap-2.5">
                    <span 
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="flex-1 text-xs sm:text-[13px] text-[#d3d7b8]">{item.text}</span>
                    <span className="text-[10px] sm:text-[11px] text-[#b9c595] shrink-0">{item.time}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Low Stock Panel */}
            <div className="bg-[#0f3d13]/90 border border-emerald-500/20 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-4">
                <Package size={14} className="text-emerald-300" />
                <span className="text-[10px] font-bold tracking-[0.12em] text-emerald-300/80 uppercase">
                  Low Stock
                </span>
              </div>
              <ul className="list-none m-0 p-0 flex flex-col gap-3.5">
                {LOW_STOCK_ITEMS.map((item) => (
                  <li key={item.name} className="flex flex-col gap-1.5">
                    <div className="flex justify-between">
                      <span className="text-xs sm:text-[13px] text-[#d3d7b8]">{item.name}</span>
                      <span className="text-xs font-bold" style={{ color: item.color }}>
                        {item.qty}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/[0.07] overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500 ease-out"
                        style={{ 
                          width: `${(item.qty / item.max) * 100}%`, 
                          backgroundColor: item.color 
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}