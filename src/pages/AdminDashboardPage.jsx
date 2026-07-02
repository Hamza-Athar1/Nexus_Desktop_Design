import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, CreditCard, ReceiptText, UserCog,
  Grid2x2, ShieldCheck, Settings, Bell, AlertTriangle,
  TrendingUp, UserCheck, DollarSign, Clock, Check,
  Menu, X, MoreHorizontal,
} from 'lucide-react';
import NexusLogo from '../components/NexusLogo';

// Navigation configuration
const NAV_MAIN = [
  { id: 'dashboard',     label: 'Dashboard',    icon: LayoutDashboard },
  { id: 'users',         label: 'Users',         icon: Users           },
  { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard      },
  { id: 'payments',      label: 'Payments',      icon: ReceiptText     },
  { id: 'fbr',           label: 'FBR users',     icon: UserCog         },
  { id: 'modules',       label: 'Modules',       icon: Grid2x2         },
];

const NAV_ACCOUNT = [
  { id: 'security', label: 'Security', icon: ShieldCheck },
  { id: 'settings', label: 'Settings', icon: Settings    },
];

// Initial approval queue data
const INITIAL_QUEUE = [
  { 
    id: 1, 
    business: 'AL-Shifa Pharmacy', 
    module: 'Pharmacy', 
    plan: 'PRO',   
    planBg: 'rgba(74,222,128,0.14)', 
    planText: '#4ade80', 
    status: 'pending' 
  },
  { 
    id: 2, 
    business: 'Karachi Grocers',   
    module: 'Grocery',  
    plan: 'BASIC', 
    planBg: 'rgba(59,130,246,0.14)', 
    planText: '#60a5fa', 
    status: 'pending' 
  },
  { 
    id: 3, 
    business: 'Style Hub',         
    module: 'Clothing', 
    plan: 'TRIAL', 
    planBg: 'rgba(251,191,36,0.14)', 
    planText: '#fbbf24', 
    status: 'pending' 
  },
];

// Date helpers
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 
  'Thursday', 'Friday', 'Saturday'
];

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
function StatCard({ title, icon: Icon, value, sub, subColor, highlight }) {
  return (
    <div className={`
      flex-1 min-w-62.5 sm:min-w-0 rounded-2xl p-4 sm:p-[18px_20px] flex flex-col gap-2.5
      ${highlight 
        ? 'bg-[#0d3b13]/95 border border-emerald-500/20 shadow-[0_0_18px_rgba(74,222,128,0.08)]' 
        : 'bg-[#0d3b13]/95 border border-emerald-500/20'
      }
    `}>
      <div className="flex items-center justify-between">
        <span className={`
          text-[10px] font-bold tracking-[0.12em] uppercase
          ${highlight ? 'text-emerald-300/80' : 'text-emerald-300/80'}
        `}>
          {title}
        </span>
        <Icon size={16} className={highlight ? 'text-emerald-400/45' : 'text-emerald-400/40'} />
      </div>
      <p className="text-2xl sm:text-[30px] font-black text-[#eef0d0] leading-none m-0">
        {value}
      </p>
      <p 
        className="text-xs font-semibold m-0 flex items-center gap-1"
        style={{ color: subColor }}
      >
        {sub}
      </p>
    </div>
  );
}

// Plan Badge Component
function PlanBadge({ plan, bg, text }) {
  return (
    <span 
      className="inline-block px-2 sm:px-3 py-0.5 rounded-md text-[10px] sm:text-xs font-bold tracking-[0.04em]"
      style={{ 
        backgroundColor: bg, 
        color: text,
        border: `1px solid ${text}55`
      }}
    >
      {plan}
    </span>
  );
}

// Quick Link Component
function QuickLink({ label, sub, icon: Icon, onClick }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <button 
      onClick={onClick} 
      onMouseEnter={() => setIsHovered(true)} 
      onMouseLeave={() => setIsHovered(false)}
      className={`
        flex-1 min-w-40 rounded-2xl p-4 flex items-center gap-3.5
        cursor-pointer transition-all duration-200 text-left
        ${isHovered 
          ? 'bg-[#16421b]/90 border-emerald-400/35' 
          : 'bg-[#0c3010]/90 border-emerald-500/20'
        }
        border
      `}
    >
      <span className={`
        flex items-center justify-center w-9.5 h-9.5 rounded-xl
        shrink-0 transition-colors duration-200
        ${isHovered 
          ? 'bg-emerald-400/20 border-emerald-400/15' 
          : 'bg-emerald-400/8 border-emerald-400/15'
        }
        border
      `}>
        <Icon size={17} className="text-emerald-400" />
      </span>
      <div>
        <p className="text-[13px] font-bold text-[#eef0d0] m-0">{label}</p>
        <p className="text-[11px] text-[#d9ddc4]/80 m-0">{sub}</p>
      </div>
    </button>
  );
}

// Mobile Queue Card Component
function MobileQueueCard({ row, onApprove, onReject }) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div className="bg-[#0d3b14]/90 border border-emerald-500/20 rounded-xl p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="text-sm font-bold text-[#f3f1d5] mb-1">{row.business}</h4>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-emerald-300/80 font-medium">{row.module}</span>
            <PlanBadge plan={row.plan} bg={row.planBg} text={row.planText} />
          </div>
        </div>
        <button 
          onClick={() => setShowActions(!showActions)}
          className="text-[#c9d4a0] hover:text-[#eef0d2] transition-colors"
        >
          <MoreHorizontal size={18} />
        </button>
      </div>
      
      <div className="flex items-center justify-between">
        <span>
          {row.status === 'approved' ? (
            <span className="text-xs font-semibold text-emerald-400/65 flex items-center gap-1">
              <Check size={12} />Approved
            </span>
          ) : (
            <span className="text-xs font-medium text-[#d6d9bb]/75">Pending</span>
          )}
        </span>
        
        {showActions && row.status === 'pending' && (
          <div className="flex gap-2">
            <button 
              onClick={() => {
                onApprove(row.id);
                setShowActions(false);
              }}
              className="px-3 py-1 rounded-md text-xs font-bold cursor-pointer bg-emerald-400/10 text-emerald-400 border border-emerald-400/25 transition-all hover:bg-emerald-400/20"
            >
              Approve
            </button>
            <button 
              onClick={() => {
                onReject(row.id);
                setShowActions(false);
              }}
              className="px-3 py-1 rounded-md text-xs font-bold cursor-pointer bg-red-500/10 text-red-400 border border-red-500/20 transition-all hover:bg-red-500/20"
            >
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Main Dashboard Component
export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [approvalQueue, setApprovalQueue] = useState(INITIAL_QUEUE);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const now = new Date();
  const pendingCount = approvalQueue.filter(q => q.status === 'pending').length;
  const dateStr = `${DAYS[now.getDay()]} · ${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`;

  const handleApprove = (id) => {
    setApprovalQueue(queue => 
      queue.map(item => 
        item.id === id ? { ...item, status: 'approved' } : item
      )
    );
  };

  const handleReject = (id) => {
    setApprovalQueue(queue => queue.filter(item => item.id !== id));
  };

  const handleNavClick = (id) => {
    setActiveTab(id);
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#efe7be] font-inter">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-70 sm:w-[320px] lg:w-50 shrink-0 
        flex flex-col h-full 
        bg-[#113d1a]
        border-r border-[#2f5e2c]/50
        transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo Section */}
        <div className="flex items-center justify-between gap-2.5 px-4.5 h-16 shrink-0 border-b border-[#2f5e2c]/30 bg-[#143915]">
          <div className="flex items-center gap-2.5">
            <NexusLogo size={26} variant="light" />
            <span className="text-[#efe9c4] text-[10px] font-bold tracking-[0.18em] uppercase">
              Admin-Dashboard
            </span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-[#d9ddc4] hover:text-[#f7f4d8] transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-5 flex flex-col gap-0.5">
          <p className="text-[9px] font-bold tracking-[0.18em] text-[#efe9c4] uppercase px-2 mb-2">
            Main
          </p>
          {NAV_MAIN.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => handleNavClick(id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-full text-[13px] font-semibold
                  border-none cursor-pointer transition-all duration-200
                  ${isActive 
                    ? 'bg-[#f0ebca] text-[#0f3719] shadow-[0_0_18px_rgba(15,55,25,0.12)]' 
                    : 'bg-transparent text-[#e9e2b4] hover:bg-[#ecf0d0]/20'
                  }
                `}
              >
                <Icon 
                  size={15} 
                  className={`shrink-0 ${isActive ? 'text-[#0f3719]' : 'text-[#e9e2b4]'}`} 
                />
                {label}
              </button>
            );
          })}
          
          <p className="text-[9px] font-bold tracking-[0.18em] text-[#efe9c4] uppercase px-2 mb-2 mt-5">
            Account
          </p>
          {NAV_ACCOUNT.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => handleNavClick(id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium
                  border-none cursor-pointer transition-all duration-200
                  ${isActive 
                    ? 'bg-[#1e5c1e] text-[#eef0d0] shadow-[0_0_14px_rgba(74,222,128,0.15)]' 
                    : 'bg-transparent text-[#d9ddc4] hover:bg-[#eff1d3]/50'
                  }
                `}
              >
                <Icon 
                  size={15} 
                  className={`shrink-0 ${isActive ? 'text-emerald-400' : 'text-current'}`} 
                />
                {label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-4 sm:px-7 h-16 shrink-0 bg-[#0b3510] border-b border-emerald-500/15">
          <div className="flex items-center gap-2">
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden text-[#dae0c2] hover:text-[#f7f4d8] transition-colors"
            >
              <Menu size={22} />
            </button>
            <NexusLogo size={22} variant="light" />
            <span className="hidden sm:inline text-[#d9ddc4] text-[10px] font-bold tracking-[0.18em] uppercase">
              ADMIN-DASHBOARD
            </span>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3.5">
            <button className="relative bg-none border-none cursor-pointer text-[#d9ddc4] flex items-center hover:text-[#f7f5d8] transition-colors">
              <Bell size={18} />
              {pendingCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-yellow-400" />
              )}
            </button>
            
            {pendingCount > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-yellow-400/10 border border-yellow-400/30">
                <AlertTriangle size={13} className="text-yellow-400" />
                <span className="text-xs text-yellow-400 font-semibold">
                  {pendingCount} pending
                </span>
              </div>
            )}
            
            {/* Mobile Pending Badge */}
            {pendingCount > 0 && (
              <div className="sm:hidden flex items-center justify-center w-6 h-6 rounded-full bg-yellow-400/20 border border-yellow-400/30">
                <span className="text-[10px] text-yellow-400 font-bold">
                  {pendingCount}
                </span>
              </div>
            )}
            
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-[#1f6a2d] to-[#0f5224] border-2 border-emerald-500/20 flex items-center justify-center text-[10px] sm:text-xs font-bold text-[#f7f4d9] shrink-0">
              AA
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7 flex flex-col gap-4 sm:gap-6">
          {/* Welcome Section */}
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-[32px] font-black text-[#133d1b] mb-1.5 leading-tight">
                Welcome, Ali
              </h1>
              <p className="text-xs sm:text-[13px] text-[#415f38] m-0">
                Control Centre · {dateStr}
              </p>
            </div>
            <button className="px-4 sm:px-5 py-2 rounded-full text-xs sm:text-[13px] font-bold cursor-pointer bg-transparent border border-[#123e20] text-[#123e20] flex items-center gap-1.5 shrink-0 hover:bg-emerald-400/5 transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              System healthy
            </button>
          </div>

          {/* Platform Summary */}
          <section className="flex flex-col gap-3">
            <SectionLabel>Platform Summary</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
              <StatCard 
                title="Total Users" 
                icon={Users} 
                value="248" 
                sub={<><TrendingUp size={12} />&nbsp;+14 this month</>} 
                subColor="#4ade80" 
              />
              <StatCard 
                title="Active Subs" 
                icon={UserCheck} 
                value="201" 
                sub="81% of users" 
                subColor="rgba(255,255,255,0.45)" 
              />
              <StatCard 
                title="Revenue" 
                icon={DollarSign} 
                value="2.4M" 
                sub={<><TrendingUp size={12} />&nbsp;+8% MoM</>} 
                subColor="#4ade80" 
              />
              <StatCard 
                title="Pending" 
                icon={Clock} 
                value={String(pendingCount)} 
                sub="ACTION REQUIRED" 
                subColor="#ef4444" 
                highlight={true} 
              />
            </div>
          </section>

          {/* Approval Queue */}
          <section className="flex flex-col gap-3">
            <SectionLabel>Approval Queue</SectionLabel>
            
            {/* Desktop Table View */}
            <div className="hidden lg:block bg-[#0f3e15]/95 border border-emerald-500/20 rounded-2xl overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-[1.4fr_1fr_0.8fr_0.9fr_1.1fr] px-6 py-3 border-b border-emerald-500/15 bg-[#1f532a]/20">
                {['Business', 'Module', 'Plan', 'Status', 'Action'].map((header) => (
                  <span 
                    key={header} 
                    className="text-[10px] font-bold tracking-[0.12em] text-emerald-400/60 uppercase"
                  >
                    {header}
                  </span>
                ))}
              </div>
              
              {/* Empty State */}
              {approvalQueue.length === 0 && (
                <div className="px-6 py-8 text-center text-[#d6d9bb]/75 text-[13px]">
                  No pending approvals
                </div>
              )}
              
              {/* Queue Items */}
              {approvalQueue.map((row, index) => (
                <div 
                  key={row.id} 
                  className={`
                    grid grid-cols-[1.4fr_1fr_0.8fr_0.9fr_1.1fr] px-6 py-4 items-center
                    ${index < approvalQueue.length - 1 ? 'border-b border-emerald-400/5' : ''}
                  `}
                >
                  <span className="text-sm font-bold text-[#eef0d0]">{row.business}</span>
                  <span className="text-[13px] text-emerald-400/75 font-medium">{row.module}</span>
                  <span>
                    <PlanBadge plan={row.plan} bg={row.planBg} text={row.planText} />
                  </span>
                  <span>
                    {row.status === 'approved' ? (
                      <span className="text-[13px] font-semibold text-emerald-400/65 flex items-center gap-1">
                        <Check size={13} />Approved
                      </span>
                    ) : (
                      <span className="text-[13px] font-medium text-[#d9ddc4]/70">Pending</span>
                    )}
                  </span>
                  <div className="flex gap-2">
                    {row.status === 'approved' ? (
                      <span className="text-[13px] font-semibold text-emerald-400/65 flex items-center gap-1">
                        <Check size={13} />Approved
                      </span>
                    ) : (
                      <>
                        <button 
                          onClick={() => handleApprove(row.id)} 
                          className="px-3 py-1 rounded-md text-xs font-bold cursor-pointer bg-emerald-400/10 text-emerald-400 border border-emerald-400/25 transition-all hover:bg-emerald-400/20"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleReject(row.id)}  
                          className="px-3 py-1 rounded-md text-xs font-bold cursor-pointer bg-red-500/10 text-red-400 border border-red-500/20 transition-all hover:bg-red-500/20"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden flex flex-col gap-3">
              {approvalQueue.length === 0 && (
                <div className="py-8 text-center text-[#dce4c7]/80 text-[13px]">
                  No pending approvals
                </div>
              )}
              {approvalQueue.map((row) => (
                <MobileQueueCard 
                  key={row.id}
                  row={row}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              ))}
            </div>
          </section>

          {/* Quick Actions */}
          <section className="flex flex-col gap-3">
            <SectionLabel>Quick Actions</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <QuickLink 
                label="Manage Users"  
                sub="View and edit accounts" 
                icon={Users}       
                onClick={() => handleNavClick('users')} 
              />
              <QuickLink 
                label="Subscriptions" 
                sub="Plans and renewals"      
                icon={CreditCard}  
                onClick={() => handleNavClick('subscriptions')} 
              />
              <QuickLink 
                label="Payment Logs"  
                sub="Transaction history"     
                icon={ReceiptText} 
                onClick={() => handleNavClick('payments')} 
              />
              <QuickLink 
                label="Module Config" 
                sub="Enable and disable"      
                icon={Grid2x2}     
                onClick={() => handleNavClick('modules')} 
              />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}