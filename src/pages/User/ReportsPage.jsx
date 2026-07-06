import { useState } from 'react';
import {
  BarChart2, FileText, Calendar, Download, Filter, Menu, 
  TrendingUp, TrendingDown, PieChart, Package, DollarSign,
  Receipt, Activity, Clock,CreditCard
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart as RePieChart,
  Pie,
  Cell,
} from 'recharts';
import UserSidebar from '../../components/UserSidebar';

function Badge({ children, variant = 'primary' }) {
  const styles = {
    primary: 'bg-[#163d15] text-[#eaf7d9]',
    secondary: 'bg-[#eaf1ce] text-[#163d15]',
    success: 'bg-emerald-500/20 text-emerald-700 border border-emerald-400/30',
    danger: 'bg-red-500/20 text-red-700 border border-red-400/30',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wide ${styles[variant]}`}>
      {children}
    </span>
  );
}

function StatCard({ icon: Icon, title, value, change, trend = 'up', variant = 'dark' }) {
  const isDark = variant === 'dark';
  const trendIcon = trend === 'up' ? TrendingUp : TrendingDown;
  const trendColor = trend === 'up' ? 'text-emerald-400' : 'text-red-400';
  
  return (
    <div className={`rounded-2xl p-4 ${isDark ? 'bg-[#0f3d13]/95 border border-emerald-500/20' : 'bg-[#f3edc7] border border-[#cfc089]'}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-emerald-300/80' : 'text-[#6a8f4b]'}`}>{title}</p>
          <p className={`text-2xl font-black mt-1 ${isDark ? 'text-[#f7f4d9]' : 'text-[#163d15]'}`}>{value}</p>
        </div>
        <div className={`p-2 rounded-xl ${isDark ? 'bg-emerald-500/10' : 'bg-[#163d15]/5'}`}>
          <Icon size={18} className={isDark ? 'text-emerald-400' : 'text-[#163d15]'} />
        </div>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <span className={`text-[11px] font-semibold flex items-center gap-1 ${trendColor}`}>
          <trendIcon size={14} />
          {change}
        </span>
        <span className={`text-[10px] ${isDark ? 'text-emerald-300/60' : 'text-[#6a8f4b]'}`}>vs last month</span>
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] font-bold tracking-[0.12em] text-[#123e20] uppercase">{children}</span>
      <div className="flex-1 h-px bg-emerald-400/10" />
    </div>
  );
}

export default function ReportsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('reports');
  const [range, setRange] = useState('30d');

  const chartData = [
    { day: '1', sales: 4000 },
    { day: '2', sales: 3000 },
    { day: '3', sales: 2000 },
    { day: '4', sales: 2780 },
    { day: '5', sales: 1890 },
    { day: '6', sales: 2390 },
    { day: '7', sales: 3490 },
    { day: '8', sales: 4200 },
    { day: '9', sales: 3800 },
    { day: '10', sales: 4500 },
    { day: '11', sales: 3200 },
    { day: '12', sales: 2800 },
    { day: '13', sales: 5100 },
    { day: '14', sales: 4300 },
    { day: '15', sales: 3600 },
  ];

  const categoryData = [
    { name: 'Antibiotics', value: 45 },
    { name: 'Painkillers', value: 30 },
    { name: 'Vitamins', value: 25 },
  ];

  const paymentData = [
    { name: 'Cash', value: 68 },
    { name: 'Card', value: 32 },
  ];

  const COLORS = ['#4ade80', '#fbbf24', '#60a5fa'];
  const PAYMENT_COLORS = ['#4ade80', '#60a5fa'];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f3edd0] font-['Inter',sans-serif]">
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <UserSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activeNav={activeNav} onNavChange={(id) => { setActiveNav(id); setSidebarOpen(false); }} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-[#234f24]/20 bg-[#0b3a11] px-4">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setSidebarOpen(true)} className="shrink-0 rounded-lg p-1.5 text-[#c8d898] hover:bg-[#1f491d] transition-colors lg:hidden" aria-label="Open menu">
              <Menu size={18} />
            </button>
            <span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#e9e6cf]/70">USER-DASHBOARD / Reports - Pharmacy</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#d8e0b4]">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#5dd456] shadow-[0_0_6px_#5dd456]" />
              <span className="hidden sm:inline">Online</span>
            </div>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1f491d] border border-[rgba(110,185,80,0.3)] text-[10px] font-extrabold text-[#e8f2d8]">AK</div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <h1 className="text-xl font-extrabold text-[#163d15] tracking-tight">Reports</h1>
                <p className="text-sm text-[#6a8f4b] mt-0.5">Sales analytics • Pharmacy module</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="flex bg-[#eaf1ce] rounded-xl p-1 border border-[#d8c98c]">
                  {['7d', '30d', '90d', '180d', '365d'].map((r) => (
                    <button
                      key={r}
                      onClick={() => setRange(r)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        range === r 
                          ? 'bg-[#163d15] text-[#f3efcf]' 
                          : 'text-[#163d15] hover:bg-[#163d15]/10'
                      }`}
                    >
                      {r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : r === '90d' ? '3 months' : r === '180d' ? '6 months' : '1 year'}
                    </button>
                  ))}
                </div>
                <button className="rounded-xl bg-[#163d15] px-4 py-1.5 text-sm font-bold text-[#f3efcf] flex items-center gap-1.5 hover:bg-[#1f4a1d] transition-colors">
                  <Download size={14} />
                  Export
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard 
                icon={DollarSign} 
                title="Total Revenue" 
                value="Rs 2.4M" 
                change="+18%" 
                trend="up" 
              />
              <StatCard 
                icon={Receipt} 
                title="Total Bills" 
                value="1,042" 
                change="+9%" 
                trend="up" 
              />
              <StatCard 
                icon={Activity} 
                title="Avg Bill Value" 
                value="Rs 2,304" 
                change="+8%" 
                trend="up" 
              />
              <StatCard 
                icon={Package} 
                title="Items Sold" 
                value="8,340" 
                change="-3%" 
                trend="down" 
              />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Sales Chart */}
              <div className="lg:col-span-2 rounded-2xl bg-[#0f3d13]/95 p-5 border border-emerald-500/20 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BarChart2 size={16} className="text-emerald-400" />
                    <h3 className="text-xs font-bold text-[#e8f0d0] uppercase tracking-wider">Daily Sales - June 2026</h3>
                  </div>
                  <Badge variant="primary">{range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '3 Months' : range === '180d' ? '6 Months' : '1 Year'}</Badge>
                </div>
                <div className="rounded-xl bg-emerald-500/5 p-2">
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1a4a1e" />
                        <XAxis dataKey="day" stroke="#8aaa6a" fontSize={10} />
                        <YAxis stroke="#8aaa6a" fontSize={10} />
                        <Tooltip 
                          contentStyle={{ 
                            background: '#0b3a11', 
                            border: '1px solid #1a4a1e',
                            borderRadius: '8px',
                            color: '#e8f0d0',
                            fontSize: '12px'
                          }} 
                        />
                        <Bar dataKey="sales" fill="#4ade80" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-6 mt-3 text-[10px] text-[#8aaa6a]">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Cream bar = highest sales day
                  </span>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {/* Top Categories */}
                <div className="rounded-2xl bg-[#f3edc7] p-5 border border-[#cfc089] shadow-sm">
                  <h4 className="text-xs font-bold text-[#163d15] mb-3 flex items-center gap-2 uppercase tracking-wider">
                    <PieChart size={14} />
                    Top Categories
                  </h4>
                  <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={30}
                          outerRadius={50}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            background: '#f3edc7', 
                            border: '1px solid #cfc089',
                            borderRadius: '8px',
                            color: '#163d15',
                            fontSize: '12px'
                          }} 
                        />
                      </RePieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-4 mt-2">
                    {categoryData.map((item, index) => (
                      <div key={item.name} className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                        <span className="text-[10px] font-semibold text-[#163d15]">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Split */}
                <div className="rounded-2xl bg-[#f3edc7] p-5 border border-[#cfc089] shadow-sm">
                  <h4 className="text-xs font-bold text-[#163d15] mb-3 flex items-center gap-2 uppercase tracking-wider">
                    <CreditCard size={14} />
                    Payment Split
                  </h4>
                  <div className="h-24">
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie
                          data={paymentData}
                          cx="50%"
                          cy="50%"
                          innerRadius={20}
                          outerRadius={40}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {paymentData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PAYMENT_COLORS[index % PAYMENT_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            background: '#f3edc7', 
                            border: '1px solid #cfc089',
                            borderRadius: '8px',
                            color: '#163d15',
                            fontSize: '12px'
                          }} 
                        />
                      </RePieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-6 mt-1">
                    {paymentData.map((item, index) => (
                      <div key={item.name} className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PAYMENT_COLORS[index] }} />
                        <span className="text-[10px] font-semibold text-[#163d15]">{item.name} {item.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Plan Indicator */}
            <div className="flex items-center justify-center gap-3 px-3 py-1.5 bg-[#163d15]/10 rounded-full mx-auto w-fit">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#6a8f4b]">Plan</span>
              <Badge variant="primary">Pro</Badge>
              <span className="text-[9px] font-semibold text-[#6a8f4b]">18 days left</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}