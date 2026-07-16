import { useState } from 'react';
import {
  Server,
  LayoutGrid,
  DollarSign,
  Users,
  Menu,
  Info,
  TrendingUp,
  ChevronDown,
  ArrowUpRight,
  TrendingDown,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import SuperAdminSidebar from '../../components/SuperAdminSidebar';

// ─── Data Definitions ─────────────────────────────────────────────────────────

const SUMMARY_CARDS = [
  {
    id: 'uptime',
    title: 'SERVER UPTIME',
    value: '99.9%',
    sub: 'All systems nominal',
    icon: Server,
  },
  {
    id: 'active',
    title: 'ACTIVE MODULES',
    value: '7',
    sub: '1 update pending',
    subColor: 'text-[#d4b248]', // highlight yellow
    icon: LayoutGrid,
  },
  {
    id: 'revenue',
    title: 'PLATFORM REVENUE',
    value: 'Rs 18.4M',
    sub: '14% vs last month',
    icon: DollarSign,
  },
  {
    id: 'users',
    title: 'TOTAL USERS',
    value: '348',
    sub: '+14% this month',
    icon: Users,
  },
];

const USER_GROWTH_DATA = [
  { name: 'Jan', users: 300 },
  { name: 'Feb', users: 380 },
  { name: 'Mar', users: 600 },
  { name: 'Apr', users: 750 },
  { name: 'May', users: 1000 },
  { name: 'Jun', users: 1248 },
];

const REVENUE_TREND_DATA = [
  { name: 'Jan', value: 38 },
  { name: 'Feb', value: 55 },
  { name: 'March', value: 98 },
  { name: 'April', value: 130 },
  { name: 'May', value: 150 },
  { name: 'June', value: 210 },
];

const USAGE_POS_DATA = [
  { name: 'Pharmacy', value: 30, color: '#0d381c' },
  { name: 'Grocery', value: 20, color: '#276834' },
  { name: 'Electronics', value: 18, color: '#4eaf65' },
  { name: 'Bakery', value: 12, color: '#e5b61b' },
  { name: 'Restaurant', value: 10, color: '#d9801c' },
  { name: 'General Store', value: 8, color: '#baa78c' },
  { name: 'Clothing', value: 2, color: '#e1dc7f' },
];

const REVENUE_POS_DATA = [
  { name: 'Pharmacy', value: 30, amount: 'PKR 73,500', color: '#0d381c', barColor: 'bg-[#0d381c]' },
  { name: 'Grocery', value: 20, amount: 'PKR 49,000', color: '#276834', barColor: 'bg-[#276834]' },
  { name: 'Restaurant', value: 18, amount: 'PKR 44,100', color: '#4eaf65', barColor: 'bg-[#4eaf65]' },
  { name: 'Clothing', value: 14, amount: 'PKR 34,300', color: '#d9801c', barColor: 'bg-[#d9801c]' },
  { name: 'Electronics', value: 10, amount: 'PKR 24,500', color: '#e5b61b', barColor: 'bg-[#e5b61b]' },
  { name: 'Bakery', value: 7, amount: 'PKR 17,150', color: '#baa78c', barColor: 'bg-[#baa78c]' },
  { name: 'General Store', value: 1, amount: 'PKR 2,450', color: '#e1dc7f', barColor: 'bg-[#e1dc7f]' },
];

// Custom formatting for Tooltip values
const formatYAxisRevenue = (tick) => {
  return `${tick}k`;
};

const INITIAL_REQUESTS = [
  {
    id: 1,
    business: 'Al-Karam Pharmacy',
    posModule: 'Pharmacy POS',
    requestType: 'Billing limit increase',
    submitted: '2 days ago',
    status: 'Pending',
    daysAgo: 2,
  },
  {
    id: 2,
    business: 'Fairy parcel Co.',
    posModule: 'Gifting POS',
    requestType: 'New module activation',
    submitted: '1 days ago',
    status: 'Pending',
    daysAgo: 1,
  },
  {
    id: 3,
    business: 'Green valley Grocers',
    posModule: 'Grocery POS',
    requestType: 'Plan upgrade request',
    submitted: '4 days ago',
    status: 'Pending',
    daysAgo: 4,
  },
  {
    id: 4,
    business: 'Rafi Restaurant Co.',
    posModule: 'Restaurant POS',
    requestType: 'Staff account request',
    submitted: '5 days ago',
    status: 'Pending',
    daysAgo: 5,
  },
  {
    id: 5,
    business: 'Pixel Tech Solutions',
    posModule: 'Electronics POS',
    requestType: 'Custom tax receipt setup',
    submitted: '6 days ago',
    status: 'Suggestion',
    daysAgo: 6,
  },
  {
    id: 6,
    business: 'The Giftery',
    posModule: 'Gifting POS',
    requestType: 'Payment method change',
    submitted: '17 days ago',
    status: 'Approved',
    daysAgo: 17,
  },
  {
    id: 7,
    business: 'Piato Bakery',
    posModule: 'Bakery POS',
    requestType: 'Refund Request',
    submitted: '30 days ago',
    status: 'Approved',
    daysAgo: 30,
  },
  {
    id: 8,
    business: 'Parien House',
    posModule: 'Clothing POS',
    requestType: 'Plan Upgrade request',
    submitted: '28 days ago',
    status: 'Approved',
    daysAgo: 28,
  },
];

export default function SuperAdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [posFilter, setPosFilter] = useState('All modules');
  const [statusFilter, setStatusFilter] = useState('Pending');
  const [timeFilter, setTimeFilter] = useState('Last 7 days');
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isSubmittedOpen, setIsSubmittedOpen] = useState(false);
  const [customDate, setCustomDate] = useState('');

  const filteredRequests = requests.filter((r) => {
    const matchPos = posFilter === 'All modules' || r.posModule === posFilter;
    const matchStatus = statusFilter === 'All status' || r.status === statusFilter;
    let matchTime = false;
    if (timeFilter === 'All time') {
      matchTime = true;
    } else if (timeFilter === 'Last 7 days') {
      matchTime = r.daysAgo <= 7;
    } else if (timeFilter === 'Last 30 days') {
      matchTime = r.daysAgo <= 30;
    } else if (timeFilter === 'This quarter') {
      matchTime = r.daysAgo <= 90;
    } else if (timeFilter === 'Custom') {
      if (!customDate) {
        matchTime = true;
      } else {
        const today = new Date('2026-07-16T00:00:00');
        const selected = new Date(`${customDate}T00:00:00`);
        const diffTime = today.getTime() - selected.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        matchTime = r.daysAgo === diffDays;
      }
    }
    return matchPos && matchStatus && matchTime;
  });

  const pendingCount = requests.filter((r) => r.status === 'Pending').length;

  const handleAction = (id, newStatus) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
  };

  return (
    <div className="flex min-h-screen bg-[#eae3c1] text-[#152f16] font-sans">
      {/* Mobile Drawer Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Component */}
      <SuperAdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden p-6 lg:p-10">
        {/* Mobile Header Top-Bar */}
        <header className="lg:hidden flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-lg border border-[#c8c2a3] bg-[#efeacb] text-[#152f16] hover:bg-[#eae3c1] transition"
          >
            <Menu size={24} />
          </button>
          <span className="font-serif font-black text-[#0c3818] tracking-wider text-sm">
            NEXUS DESKTOP
          </span>
        </header>

        {activeTab === 'dashboard' ? (
          <>
            {/* Dashboard Header */}
            <div className="mb-8">
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#152f16] font-serif mb-2">
                Welcome, Aiesha
              </h1>
              <p className="text-base sm:text-lg text-[#55694a] font-medium">
                System analytics · 29 June 2026
              </p>
            </div>

            {/* Platform Summary Section */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-5">
                <h2 className="text-xs uppercase tracking-[0.2em] font-black text-[#607455] shrink-0">
                  PLATFORM SUMMARY
                </h2>
                <div className="h-[1px] bg-[#c8c2a3] flex-1" />
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                {SUMMARY_CARDS.map((card) => {
                  const Icon = card.icon;
                  return (
                    <div
                      key={card.id}
                      className="bg-[#0b3a1a] rounded-[24px] p-6 text-white border border-[#1b4d2a]/30 shadow-md relative overflow-hidden flex flex-col justify-between h-[155px]"
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-[10px] tracking-[0.18em] font-black text-[#a2bc90]">
                          {card.title}
                        </span>
                        <div className="border border-[#3c6b4b] rounded-lg p-1.5 flex items-center justify-center bg-[#072813]">
                          <Icon size={16} className="text-[#a2bc90]" />
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-3xl font-bold tracking-tight leading-none mb-1">
                          {card.value}
                        </p>
                        <p className={`text-xs font-semibold ${card.subColor || 'text-[#a2bc90]'}`}>
                          {card.sub}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Main Visualizations Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Card 1: User Growth Area Chart */}
              <div className="bg-[#efeacb] rounded-[24px] border border-[#bfbc9b] p-6 shadow-sm flex flex-col justify-between min-h-[380px]">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[#152f16]">
                      USER GROWTH
                    </h3>
                    <p className="text-xs text-[#607455]">Total users over time</p>
                  </div>
                  <div className="flex items-center gap-1 border border-[#bfbc9b] rounded-lg px-3 py-1 bg-[#efeacb] text-xs font-bold text-[#152f16]">
                    <span>This Month</span>
                    <ChevronDown size={14} />
                  </div>
                </div>

                <div className="flex-1 w-full h-[220px] relative">
                  {/* Floating Overlay for June Highlight */}
                  <div className="absolute right-[4%] top-[10%] z-10 bg-[#eae3c1] border border-[#bfbc9b] p-2.5 rounded-xl shadow-sm text-left max-w-[150px]">
                    <p className="text-[10px] uppercase font-bold text-[#607455] leading-none mb-1">
                      Total users
                    </p>
                    <p className="text-lg font-black text-[#0d381c] leading-none mb-1">1,248</p>
                    <p className="text-[10px] font-bold text-[#276834] flex items-center gap-0.5">
                      <span>+12.5%</span>
                      <span className="text-neutral-500 font-normal">vs last month</span>
                    </p>
                  </div>

                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={USER_GROWTH_DATA}
                      margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#276834" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#276834" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="name"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: '#152f16', fontSize: 11, fontWeight: 'bold' }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        domain={[0, 1800]}
                        ticks={[0, 300, 600, 900, 1200, 1500, 1800]}
                        tick={{ fill: '#152f16', fontSize: 11, fontWeight: 'bold' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#efeacb',
                          borderColor: '#bfbc9b',
                          borderRadius: '8px',
                          color: '#152f16',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="users"
                        stroke="#276834"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorUsers)"
                        dot={{ r: 4, stroke: '#276834', strokeWidth: 2, fill: '#efeacb' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Card 2: Revenue Trend Bar Chart */}
              <div className="bg-[#efeacb] rounded-[24px] border border-[#bfbc9b] p-6 shadow-sm flex flex-col justify-between min-h-[380px]">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[#152f16]">
                      REVENUE TREND
                    </h3>
                    <p className="text-xs text-[#607455]">Monthly Revenue (PKR)</p>
                  </div>
                  <div className="flex items-center gap-1 border border-[#bfbc9b] rounded-lg px-3 py-1 bg-[#efeacb] text-xs font-bold text-[#152f16]">
                    <span>This Month</span>
                    <ChevronDown size={14} />
                  </div>
                </div>

                <div className="flex-1 w-full h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={REVENUE_TREND_DATA}
                      margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
                    >
                      <XAxis
                        dataKey="name"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: '#152f16', fontSize: 11, fontWeight: 'bold' }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        domain={[0, 250]}
                        ticks={[0, 50, 100, 150, 200, 250]}
                        tickFormatter={formatYAxisRevenue}
                        tick={{ fill: '#152f16', fontSize: 11, fontWeight: 'bold' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#efeacb',
                          borderColor: '#bfbc9b',
                          borderRadius: '8px',
                          color: '#152f16',
                        }}
                        formatter={(val) => [`${val}k PKR`, 'Revenue']}
                      />
                      <Bar
                        dataKey="value"
                        fill="#276834"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={40}
                        label={{
                          position: 'top',
                          fill: '#152f16',
                          fontSize: 11,
                          fontWeight: 'bold',
                          formatter: (val) => `${val}k`,
                        }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Card 3: Usage as per POS Pie Chart */}
              <div className="bg-[#efeacb] rounded-[24px] border border-[#bfbc9b] p-6 shadow-sm flex flex-col justify-between min-h-[380px]">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[#152f16]">
                      USAGE AS PER POS
                    </h3>
                    <p className="text-xs text-[#607455]">
                      Distribution of active businesses using each POS module.
                    </p>
                  </div>
                  <div className="flex items-center gap-1 border border-[#bfbc9b] rounded-lg px-3 py-1 bg-[#efeacb] text-xs font-bold text-[#152f16]">
                    <span>This Month</span>
                    <ChevronDown size={14} />
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-6 flex-1">
                  <div className="w-[180px] h-[180px] flex items-center justify-center shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={USAGE_POS_DATA}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          stroke="#efeacb"
                          strokeWidth={2}
                        >
                          {USAGE_POS_DATA.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Legend list */}
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-1 gap-2 w-full text-xs">
                    {USAGE_POS_DATA.map((item) => (
                      <div key={item.name} className="flex items-center justify-between border-b border-[#c8c2a3]/30 pb-1">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-sm shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="font-semibold text-[#152f16]">{item.name}</span>
                        </div>
                        <span className="font-bold text-[#152f16]">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer metadata */}
                <div className="border-t border-[#c8c2a3]/40 mt-4 pt-3 flex flex-wrap gap-4 text-xs font-bold justify-between">
                  <div className="flex items-center gap-2 bg-[#eae3c1] px-3 py-1.5 rounded-lg border border-[#bfbc9b]">
                    <span className="w-1.5 h-3 bg-[#0d381c] rounded-full" />
                    <span className="text-[#607455] font-semibold">Most used modules</span>
                    <span className="text-[#0d381c]">Pharmacy POS</span>
                  </div>
                  <div className="flex items-center gap-2 bg-[#eae3c1] px-3 py-1.5 rounded-lg border border-[#bfbc9b]">
                    <span className="w-1.5 h-3 bg-[#e1dc7f] rounded-full" />
                    <span className="text-[#607455] font-semibold">Least used modules</span>
                    <span className="text-[#d9801c]">Clothing POS</span>
                  </div>
                </div>
              </div>

              {/* Card 4: Revenue as per POS Donut Chart & Table */}
              <div className="bg-[#efeacb] rounded-[24px] border border-[#bfbc9b] p-6 shadow-sm flex flex-col justify-between min-h-[380px]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[#152f16]">
                      REVENUE AS PER POS
                    </h3>
                    <Info size={14} className="text-[#607455] cursor-pointer" />
                  </div>
                  <div className="flex items-center gap-1 border border-[#bfbc9b] rounded-lg px-3 py-1 bg-[#efeacb] text-xs font-bold text-[#152f16]">
                    <span>This Month</span>
                    <ChevronDown size={14} />
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-6 flex-1">
                  {/* Donut with Total in Center */}
                  <div className="w-[180px] h-[180px] relative flex items-center justify-center shrink-0">
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                      <span className="text-[9px] font-bold text-[#607455] tracking-widest uppercase">
                        TOTAL REVENUE
                      </span>
                      <span className="text-sm font-black text-[#0d381c] leading-tight">
                        PKR 245,000
                      </span>
                      <span className="text-[10px] font-bold text-[#607455]">100%</span>
                    </div>

                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={REVENUE_POS_DATA}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          stroke="#efeacb"
                          strokeWidth={2.5}
                        >
                          {REVENUE_POS_DATA.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Revenue Table with custom progress bars */}
                  <div className="flex-1 w-full text-xs flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
                    <div className="grid grid-cols-[1.5fr_1fr_0.5fr] text-[10px] font-bold text-[#607455] border-b border-[#c8c2a3]/40 pb-1">
                      <span>POS Module</span>
                      <span className="text-right">Revenue (PKR)</span>
                      <span className="text-right">Share</span>
                    </div>
                    {REVENUE_POS_DATA.map((item) => (
                      <div
                        key={item.name}
                        className="grid grid-cols-[1.5fr_1fr_0.5fr] items-center py-0.5 border-b border-[#c8c2a3]/10"
                      >
                        <div className="flex flex-col pr-2">
                          <span className="font-semibold text-[#152f16]">{item.name}</span>
                          <div className="w-full bg-[#eae3c1] h-[3px] rounded-full mt-1 overflow-hidden">
                            <div
                              className={`h-full ${item.barColor} rounded-full`}
                              style={{ width: `${item.value}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-right font-bold text-[#152f16]">{item.amount}</span>
                        <span className="text-right font-semibold text-[#152f16]">
                          {item.value}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : activeTab === 'requests' ? (
          <div className="flex-1 flex flex-col">
            {/* Requests Header */}
            <div className="mb-8">
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#152f16] font-serif mb-2">
                Requests
              </h1>
              <p className="text-base sm:text-lg text-[#55694a] font-medium">
                {pendingCount} pending across all POS modules
              </p>
            </div>

            {/* Request Summary section header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-5">
                <h2 className="text-xs uppercase tracking-[0.2em] font-black text-[#607455] shrink-0">
                  REQUEST SUMMARY
                </h2>
                <div className="h-[1px] bg-[#c8c2a3] flex-1" />
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                {/* POS Module filter */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-[#152f16] font-serif">POS module</label>
                  <div className="relative">
                    <select
                      value={posFilter}
                      onChange={(e) => setPosFilter(e.target.value)}
                      className="w-full appearance-none border border-[#bfbc9b] rounded-xl px-4 py-3 bg-white text-[#152f16] font-semibold text-sm cursor-pointer outline-none pr-10"
                    >
                      <option value="All modules">All modules</option>
                      <option value="Pharmacy POS">Pharmacy POS</option>
                      <option value="Gifting POS">Gifting POS</option>
                      <option value="Grocery POS">Grocery POS</option>
                      <option value="Restaurant POS">Restaurant POS</option>
                    </select>
                    <ChevronDown size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#607455] pointer-events-none" />
                  </div>
                </div>

                {/* Status filter */}
                <div className="flex flex-col gap-2 relative">
                  <label className="text-sm font-bold text-[#152f16] font-serif">Status</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsStatusOpen(!isStatusOpen)}
                      className="w-full flex items-center justify-between border border-[#bfbc9b] rounded-xl px-4 py-3 bg-white text-[#152f16] font-semibold text-sm cursor-pointer outline-none text-left"
                    >
                      <span>
                        {statusFilter === 'Pending' && 'Pending review'}
                        {statusFilter === 'Approved' && 'Approved review'}
                        {statusFilter === 'Rejected' && 'Rejected review'}
                        {statusFilter === 'Suggestion' && 'Suggestion review'}
                        {statusFilter === 'All status' && 'All statuses'}
                      </span>
                      <span className="text-[#0c3818] text-xs transition-transform duration-200">
                        {isStatusOpen ? '▲' : '▼'}
                      </span>
                    </button>

                    {isStatusOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setIsStatusOpen(false)}
                        />
                        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-[#bfbc9b]/60 rounded-xl shadow-lg p-1.5 flex flex-col gap-0.5">
                          {/* Option: Pending review */}
                          <button
                            type="button"
                            onClick={() => {
                              setStatusFilter('Pending');
                              setIsStatusOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-semibold transition cursor-pointer ${statusFilter === 'Pending'
                                ? 'bg-[#f4ebd0]/50 text-[#0c3818]'
                                : 'text-[#0c3818] hover:bg-[#eae3c1]/20'
                              }`}
                          >
                            <span className="flex items-center justify-center shrink-0">
                              {statusFilter === 'Pending' ? (
                                <span className="w-5 h-5 rounded-full border-2 border-[#0c3818] flex items-center justify-center">
                                  <span className="w-2.5 h-2.5 rounded-full bg-[#0c3818]" />
                                </span>
                              ) : (
                                <span className="w-5 h-5 rounded-full border-2 border-[#0c3818]/40" />
                              )}
                            </span>
                            <span>Pending review</span>
                          </button>

                          {/* Option: Approved review */}
                          <button
                            type="button"
                            onClick={() => {
                              setStatusFilter('Approved');
                              setIsStatusOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-semibold transition cursor-pointer ${statusFilter === 'Approved'
                                ? 'bg-[#f4ebd0]/50 text-[#0c3818]'
                                : 'text-[#0c3818] hover:bg-[#eae3c1]/20'
                              }`}
                          >
                            <span className="flex items-center justify-center shrink-0">
                              {statusFilter === 'Approved' ? (
                                <span className="w-5 h-5 rounded-full border-2 border-[#0c3818] flex items-center justify-center">
                                  <span className="w-2.5 h-2.5 rounded-full bg-[#0c3818]" />
                                </span>
                              ) : (
                                <span className="w-5 h-5 rounded-full border-2 border-[#0c3818]/40" />
                              )}
                            </span>
                            <span>Approved review</span>
                          </button>

                          {/* Option: Rejected review */}
                          <button
                            type="button"
                            onClick={() => {
                              setStatusFilter('Rejected');
                              setIsStatusOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-semibold transition cursor-pointer ${statusFilter === 'Rejected'
                                ? 'bg-[#f4ebd0]/50 text-[#0c3818]'
                                : 'text-[#0c3818] hover:bg-[#eae3c1]/20'
                              }`}
                          >
                            <span className="flex items-center justify-center shrink-0">
                              {statusFilter === 'Rejected' ? (
                                <span className="w-5 h-5 rounded-full border-2 border-[#0c3818] flex items-center justify-center">
                                  <span className="w-2.5 h-2.5 rounded-full bg-[#0c3818]" />
                                </span>
                              ) : (
                                <span className="w-5 h-5 rounded-full border-2 border-[#0c3818]/40" />
                              )}
                            </span>
                            <span>Rejected review</span>
                          </button>

                          {/* Option: Suggestion review */}
                          <button
                            type="button"
                            onClick={() => {
                              setStatusFilter('Suggestion');
                              setIsStatusOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-semibold transition cursor-pointer ${statusFilter === 'Suggestion'
                                ? 'bg-[#f4ebd0]/50 text-[#0c3818]'
                                : 'text-[#0c3818] hover:bg-[#eae3c1]/20'
                              }`}
                          >
                            <span className="flex items-center justify-center shrink-0">
                              {statusFilter === 'Suggestion' ? (
                                <span className="w-5 h-5 rounded-full border-2 border-[#0c3818] flex items-center justify-center">
                                  <span className="w-2.5 h-2.5 rounded-full bg-[#0c3818]" />
                                </span>
                              ) : (
                                <span className="w-5 h-5 rounded-full border-2 border-[#0c3818]/40" />
                              )}
                            </span>
                            <span>Suggestion review</span>
                          </button>

                          <div className="h-[1px] bg-[#c8c2a3]/30 my-1" />

                          {/* Option: All statuses */}
                          <button
                            type="button"
                            onClick={() => {
                              setStatusFilter('All status');
                              setIsStatusOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-semibold transition cursor-pointer ${statusFilter === 'All status'
                                ? 'bg-[#f4ebd0]/50 text-[#0c3818]'
                                : 'text-[#0c3818] hover:bg-[#eae3c1]/20'
                              }`}
                          >
                            <span className="flex items-center justify-center shrink-0">
                              {statusFilter === 'All status' ? (
                                <span className="w-5 h-5 rounded-full border-2 border-[#0c3818] flex items-center justify-center">
                                  <span className="w-2.5 h-2.5 rounded-full bg-[#0c3818]" />
                                </span>
                              ) : (
                                <span className="w-5 h-5 rounded-full border-2 border-[#0c3818]/40" />
                              )}
                            </span>
                            <span>All statuses</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Timeframe filter */}
                <div className="flex flex-col gap-2 relative">
                  <label className="text-sm font-bold text-[#152f16] font-serif">Submitted</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsSubmittedOpen(!isSubmittedOpen)}
                      className="w-full flex items-center justify-between border border-[#bfbc9b] rounded-xl px-4 py-3 bg-white text-[#152f16] font-semibold text-sm cursor-pointer outline-none text-left"
                    >
                      <span>{timeFilter === 'Custom' ? 'Custom Range' : timeFilter}</span>
                      <span className="text-[#0c3818] text-xs transition-transform duration-200">
                        {isSubmittedOpen ? '▲' : '▼'}
                      </span>
                    </button>

                    {isSubmittedOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setIsSubmittedOpen(false)}
                        />
                        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-[#bfbc9b]/60 rounded-xl shadow-lg p-1.5 flex flex-col gap-0.5">
                          {/* Option: Last 7 days */}
                          <button
                            type="button"
                            onClick={() => {
                              setTimeFilter('Last 7 days');
                              setIsSubmittedOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-semibold transition cursor-pointer ${timeFilter === 'Last 7 days'
                                ? 'bg-[#f4ebd0]/50 text-[#0c3818]'
                                : 'text-[#0c3818] hover:bg-[#eae3c1]/20'
                              }`}
                          >
                            <span className="flex items-center justify-center shrink-0">
                              {timeFilter === 'Last 7 days' ? (
                                <span className="w-5 h-5 rounded-full border-2 border-[#0c3818] flex items-center justify-center">
                                  <span className="w-2.5 h-2.5 rounded-full bg-[#0c3818]" />
                                </span>
                              ) : (
                                <span className="w-5 h-5 rounded-full border-2 border-[#0c3818]/40" />
                              )}
                            </span>
                            <span>Last 7 days</span>
                          </button>

                          {/* Option: Last 30 days */}
                          <button
                            type="button"
                            onClick={() => {
                              setTimeFilter('Last 30 days');
                              setIsSubmittedOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-semibold transition cursor-pointer ${timeFilter === 'Last 30 days'
                                ? 'bg-[#f4ebd0]/50 text-[#0c3818]'
                                : 'text-[#0c3818] hover:bg-[#eae3c1]/20'
                              }`}
                          >
                            <span className="flex items-center justify-center shrink-0">
                              {timeFilter === 'Last 30 days' ? (
                                <span className="w-5 h-5 rounded-full border-2 border-[#0c3818] flex items-center justify-center">
                                  <span className="w-2.5 h-2.5 rounded-full bg-[#0c3818]" />
                                </span>
                              ) : (
                                <span className="w-5 h-5 rounded-full border-2 border-[#0c3818]/40" />
                              )}
                            </span>
                            <span>Last 30 days</span>
                          </button>

                          {/* Option: This quarter */}
                          <button
                            type="button"
                            onClick={() => {
                              setTimeFilter('This quarter');
                              setIsSubmittedOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-semibold transition cursor-pointer ${timeFilter === 'This quarter'
                                ? 'bg-[#f4ebd0]/50 text-[#0c3818]'
                                : 'text-[#0c3818] hover:bg-[#eae3c1]/20'
                              }`}
                          >
                            <span className="flex items-center justify-center shrink-0">
                              {timeFilter === 'This quarter' ? (
                                <span className="w-5 h-5 rounded-full border-2 border-[#0c3818] flex items-center justify-center">
                                  <span className="w-2.5 h-2.5 rounded-full bg-[#0c3818]" />
                                </span>
                              ) : (
                                <span className="w-5 h-5 rounded-full border-2 border-[#0c3818]/40" />
                              )}
                            </span>
                            <span>This quarter</span>
                          </button>

                          {/* Option: All time */}
                          <button
                            type="button"
                            onClick={() => {
                              setTimeFilter('All time');
                              setIsSubmittedOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-semibold transition cursor-pointer ${timeFilter === 'All time'
                                ? 'bg-[#f4ebd0]/50 text-[#0c3818]'
                                : 'text-[#0c3818] hover:bg-[#eae3c1]/20'
                              }`}
                          >
                            <span className="flex items-center justify-center shrink-0">
                              {timeFilter === 'All time' ? (
                                <span className="w-5 h-5 rounded-full border-2 border-[#0c3818] flex items-center justify-center">
                                  <span className="w-2.5 h-2.5 rounded-full bg-[#0c3818]" />
                                </span>
                              ) : (
                                <span className="w-5 h-5 rounded-full border-2 border-[#0c3818]/40" />
                              )}
                            </span>
                            <span>All time</span>
                          </button>

                          <div className="h-[1px] bg-[#c8c2a3]/30 my-1" />

                          {/* Custom Range Input section */}
                          <div className="flex flex-col gap-1 px-3 py-1.5 text-left">
                            <span className="text-[10px] font-bold text-[#607455]">Custom Range</span>
                            <div className="relative flex items-center mt-1">
                              <input
                                type="date"
                                value={customDate}
                                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                                onChange={(e) => {
                                  setCustomDate(e.target.value);
                                  setTimeFilter('Custom');
                                }}
                                className="w-full bg-[#fefdf5] border border-[#bfbc9b] rounded-lg px-2.5 py-1.5 text-xs text-[#152f16] outline-none font-semibold cursor-pointer"
                              />
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Filter Tags Row */}
              <div className="flex flex-wrap items-center gap-3 mb-6 text-sm">
                <span className="font-serif font-black text-[#a68334] mr-2">
                  {filteredRequests.length} {filteredRequests.length === 1 ? 'result' : 'results'}
                </span>
                
                {posFilter !== 'All modules' && (
                  <span className="inline-flex items-center gap-1.5 bg-[#fcfbf4] border border-[#bfbca0] rounded-lg px-2.5 py-1 text-xs font-semibold text-[#152f16] shadow-sm">
                    <span>{posFilter}</span>
                    <button
                      type="button"
                      onClick={() => setPosFilter('All modules')}
                      className="hover:text-red-600 font-bold cursor-pointer text-[10px]"
                    >
                      ✕
                    </button>
                  </span>
                )}

                {statusFilter !== 'All status' && (
                  <span className="inline-flex items-center gap-1.5 bg-[#fcfbf4] border border-[#bfbca0] rounded-lg px-2.5 py-1 text-xs font-semibold text-[#152f16] shadow-sm">
                    <span>
                      {statusFilter === 'Pending' ? 'Pending' :
                       statusFilter === 'Approved' ? 'Approved' :
                       statusFilter === 'Rejected' ? 'Rejected' : 'Suggestion'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setStatusFilter('All status')}
                      className="hover:text-red-600 font-bold cursor-pointer text-[10px]"
                    >
                      ✕
                    </button>
                  </span>
                )}

                {timeFilter !== 'All time' && (
                  <span className="inline-flex items-center gap-1.5 bg-[#fcfbf4] border border-[#bfbca0] rounded-lg px-2.5 py-1 text-xs font-semibold text-[#152f16] shadow-sm">
                    <span>
                      {timeFilter === 'Last 7 days' ? '7 Days' :
                       timeFilter === 'Last 30 days' ? '30 Days' :
                       timeFilter === 'This quarter' ? 'Quarter' : 'Custom'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setTimeFilter('All time')}
                      className="hover:text-red-600 font-bold cursor-pointer text-[10px]"
                    >
                      ✕
                    </button>
                  </span>
                )}

                {(posFilter !== 'All modules' || statusFilter !== 'All status' || timeFilter !== 'All time') && (
                  <button
                    type="button"
                    onClick={() => {
                      setPosFilter('All modules');
                      setStatusFilter('All status');
                      setTimeFilter('All time');
                      setCustomDate('');
                    }}
                    className="text-[#b91c1c] font-black text-xs hover:underline cursor-pointer ml-1"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Table section */}
              <div className="bg-[#efeacb] rounded-[24px] border border-[#bfbc9b] overflow-hidden shadow-sm">
                {/* Desktop View Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-[#eae3c1] border-b border-[#bfbc9b] text-[11px] font-black uppercase tracking-wider text-[#152f16]">
                        <th className="py-4 px-6">Business</th>
                        <th className="py-4 px-6">POS Module</th>
                        <th className="py-4 px-6">Request Type</th>
                        <th className="py-4 px-6">Submitted</th>
                        <th className="py-4 px-6 text-center">Status</th>
                        <th className="py-4 px-6 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#c8c2a3]/30 bg-white">
                      {filteredRequests.map((row) => (
                        <tr key={row.id} className="bg-white hover:bg-[#efeacb]/20 transition text-sm text-[#152f16]">
                          <td className="py-4 px-6 font-bold">{row.business}</td>
                          <td className="py-4 px-6 font-semibold">{row.posModule}</td>
                          <td className="py-4 px-6 font-semibold">{row.requestType}</td>
                          <td className="py-4 px-6 text-[#152f16]">{row.submitted}</td>
                          <td className="py-4 px-6 text-center">
                            <div className="flex justify-center">
                              <span className={`inline-block font-bold px-3 py-1 rounded-lg border text-xs text-center w-24 ${
                                row.status === 'Pending' ? 'bg-[#f6edd2] text-[#a68334] border-[#dfc480]' :
                                row.status === 'Approved' ? 'bg-[#e6f4ea] text-[#137333] border-[#85c796]' :
                                row.status === 'Rejected' ? 'bg-[#fbebeb] text-[#a93b3b] border-[#d89f9f]' :
                                'bg-[#fdf3d6] text-[#b06000] border-[#dcb35c]'
                              }`}>
                                {row.status === 'Pending' ? 'Pending' : row.status === 'Suggestion' ? 'Suggestion' : row.status}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <div className="flex justify-center gap-2">
                              {row.status === 'Pending' ? (
                                <>
                                  <button
                                    onClick={() => handleAction(row.id, 'Rejected')}
                                    className="px-3 py-1.5 bg-[#fbebeb] text-[#a93b3b] border border-[#d89f9f] text-xs font-semibold rounded-lg hover:bg-[#fae3e3] transition cursor-pointer"
                                  >
                                    Reject
                                  </button>
                                  <button
                                    onClick={() => handleAction(row.id, 'Approved')}
                                    className="px-3 py-1.5 bg-[#e6f4ea] text-[#137333] border border-[#85c796] text-xs font-semibold rounded-lg hover:bg-[#d2edd9] transition cursor-pointer"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleAction(row.id, 'Suggestion')}
                                    className="px-3 py-1.5 bg-[#fdf3d6] text-[#b06000] border border-[#dcb35c] text-xs font-semibold rounded-lg hover:bg-[#faeabf] transition cursor-pointer"
                                  >
                                    Suggestion
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    className="px-3.5 py-1.5 bg-white text-[#137333] border border-[#c8c2a3] text-xs font-bold rounded-lg hover:bg-neutral-50 transition cursor-pointer"
                                  >
                                    View details
                                  </button>
                                  <button
                                    type="button"
                                    className="px-3.5 py-1.5 bg-white text-[#137333] border border-[#c8c2a3] text-xs font-bold rounded-lg hover:bg-neutral-50 transition cursor-pointer"
                                  >
                                    Update
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredRequests.length === 0 && (
                        <tr>
                          <td colSpan="6" className="py-8 text-center text-sm text-[#607455] font-medium">
                            No requests found matching the filter criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View Stacked Cards */}
                <div className="md:hidden divide-y divide-[#c8c2a3]/30 bg-white">
                  {filteredRequests.map((row) => (
                    <div key={row.id} className="p-5 flex flex-col gap-3 bg-white">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-bold text-base text-[#152f16]">{row.business}</p>
                          <p className="text-xs text-[#607455] font-semibold">{row.posModule}</p>
                        </div>
                        <span className={`inline-block font-bold px-3 py-1 rounded-lg border text-xs text-center ${
                          row.status === 'Pending' ? 'bg-[#f6edd2] text-[#a68334] border-[#dfc480]' :
                          row.status === 'Approved' ? 'bg-[#e6f4ea] text-[#137333] border-[#85c796]' :
                          row.status === 'Rejected' ? 'bg-[#fbebeb] text-[#a93b3b] border-[#d89f9f]' :
                          'bg-[#fdf3d6] text-[#b06000] border-[#dcb35c]'
                        }`}>
                          {row.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs bg-[#eae3c1]/40 p-3 rounded-xl border border-[#c8c2a3]/20">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-[#607455]">Request Type</p>
                          <p className="font-semibold mt-0.5 text-[#152f16]">{row.requestType}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-[#607455]">Submitted</p>
                          <p className="font-semibold mt-0.5 text-[#152f16]">{row.submitted}</p>
                        </div>
                      </div>

                      {row.status === 'Pending' ? (
                        <div className="flex gap-2 mt-1">
                          <button
                            onClick={() => handleAction(row.id, 'Rejected')}
                            className="flex-1 py-2 bg-[#fbebeb] text-[#a93b3b] border border-[#d89f9f] text-xs font-semibold rounded-lg text-center cursor-pointer"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleAction(row.id, 'Approved')}
                            className="flex-1 py-2 bg-[#e6f4ea] text-[#137333] border border-[#85c796] text-xs font-semibold rounded-lg text-center cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction(row.id, 'Suggestion')}
                            className="flex-1 py-2 bg-[#fdf3d6] text-[#b06000] border border-[#dcb35c] text-xs font-semibold rounded-lg text-center cursor-pointer"
                          >
                            Suggestion
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2 mt-1">
                          <button
                            type="button"
                            className="flex-1 py-2 bg-white text-[#137333] border border-[#c8c2a3] text-xs font-bold rounded-lg text-center cursor-pointer"
                          >
                            View details
                          </button>
                          <button
                            type="button"
                            className="flex-1 py-2 bg-white text-[#137333] border border-[#c8c2a3] text-xs font-bold rounded-lg text-center cursor-pointer"
                          >
                            Update
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  {filteredRequests.length === 0 && (
                    <div className="py-8 text-center text-sm text-[#607455] font-medium">
                      No requests found matching the filter criteria.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Placeholder screens for other sidebar tabs */
          <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-[#bfbc9b] rounded-3xl bg-[#efeacb]/40 p-10 text-center">
            <h2 className="text-2xl font-bold font-serif text-[#152f16] mb-2 uppercase">
              {activeTab} Management
            </h2>
            <p className="text-[#607455] max-w-md">
              The {activeTab} section is currently set up under the system admin scope. Access can
              be extended dynamically.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
