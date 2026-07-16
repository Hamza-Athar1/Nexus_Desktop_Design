import {
  Server,
  LayoutGrid,
  DollarSign,
  Users,
  Info,
  TrendingUp,
  ChevronDown,
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

export default function SuperAdminDashboardPage() {
  return (
    <div className="flex-1 flex flex-col">
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
                className="bg-[#0c3818] rounded-[24px] border border-[#3f5a3b] p-6 flex flex-col justify-between shadow-sm hover:scale-[1.01] transition duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] tracking-[0.25em] font-black text-[#a2bc90]">
                    {card.title}
                  </span>
                  <div className="p-2 rounded-xl bg-[#082813] text-[#eae3c1] shrink-0 border border-[#3f5a3b] shadow-inner">
                    <Icon size={16} />
                  </div>
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white tracking-tight mb-1">
                    {card.value}
                  </h3>
                  <p className={`text-xs font-bold ${card.subColor || 'text-[#a2bc90]/80'}`}>
                    {card.sub}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Analytics Charts Grid Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
        {/* Card 1: User Growth Area Chart */}
        <div className="bg-[#efeacb] rounded-[24px] border border-[#bfbc9b] p-6 shadow-sm flex flex-col justify-between min-h-[380px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#152f16]">
              USER GROWTH
            </h3>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#137333]">
              <TrendingUp size={16} />
              <span>+24%</span>
            </div>
          </div>

          <div className="h-[240px] w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={USER_GROWTH_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="userGrowthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d381c" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0d381c" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#607455" strokeWidth={1} fontSize={10} tickLine={false} />
                <YAxis stroke="#607455" strokeWidth={1} fontSize={10} tickLine={false} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#0d381c"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#userGrowthGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 2: Platform Revenue Bar Chart */}
        <div className="bg-[#efeacb] rounded-[24px] border border-[#bfbc9b] p-6 shadow-sm flex flex-col justify-between min-h-[380px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#152f16]">
              PLATFORM REVENUE TREND (M)
            </h3>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#137333]">
              <TrendingUp size={16} />
              <span>+14.2%</span>
            </div>
          </div>

          <div className="h-[240px] w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={REVENUE_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#607455" strokeWidth={1} fontSize={10} tickLine={false} />
                <YAxis
                  stroke="#607455"
                  strokeWidth={1}
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={formatYAxisRevenue}
                />
                <Tooltip formatter={(value) => [`${value}M`, 'Revenue']} />
                <Bar dataKey="value" fill="#0d381c" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 3: POS Module Share Pie Chart */}
        <div className="bg-[#efeacb] rounded-[24px] border border-[#bfbc9b] p-6 shadow-sm flex flex-col justify-between min-h-[380px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#152f16]">
              ACTIVE MODULES SHARE
            </h3>
            <div className="flex items-center gap-1 border border-[#bfbc9b] rounded-lg px-3 py-1 bg-[#efeacb] text-xs font-bold text-[#152f16]">
              <span>This Month</span>
              <ChevronDown size={14} />
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6 flex-1">
            {/* Pie Chart container */}
            <div className="w-[180px] h-[180px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={USAGE_POS_DATA}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    stroke="#efeacb"
                    strokeWidth={2.5}
                  >
                    {USAGE_POS_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legends list */}
            <div className="flex-1 w-full text-xs flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
              {USAGE_POS_DATA.map((item) => (
                <div key={item.name} className="flex items-center justify-between py-1 border-b border-[#c8c2a3]/20">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="font-semibold text-[#607455]">{item.name}</span>
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
    </div>
  );
}
