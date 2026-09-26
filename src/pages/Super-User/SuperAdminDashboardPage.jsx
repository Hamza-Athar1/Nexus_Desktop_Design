import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
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

import { getSuperAdminDashboardAnalytics } from '../../lib/reportService.js';
import { useAuth } from '../../context/AuthContext.jsx';



export default function SuperAdminDashboardPage() {
  const { user } = useAuth();
  const { setHeaderDetails } = useOutletContext() || {};

  const userName = user?.fullName || user?.full_name || user?.username || 'Super Admin';

  const [summary, setSummary] = useState({
    uptime: '99.9%',
    activeModules: 0,
    totalRevenue: 0,
    totalUsers: 0,
  });
  const [userGrowthData, setUserGrowthData] = useState([]);
  const [revenueTrendData, setRevenueTrendData] = useState([]);
  const [usagePosData, setUsagePosData] = useState([]);
  const [revenuePosData, setRevenuePosData] = useState([]);
  const [_isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (setHeaderDetails) {
      setHeaderDetails({
        title: `Welcome, ${userName}`,
        subtitle: 'System analytics',
      });
    }
  }, [setHeaderDetails, userName]);

  useEffect(() => {
    async function loadDashboardData() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await getSuperAdminDashboardAnalytics();
        if (res.ok && res.data) {
          const analytics = res.data.data || res.data;
          const { summary: sum, userGrowth, revenueTrend, usagePosData: uPos, revenuePosData: rPos } = analytics;
          if (sum) setSummary(sum);
          if (Array.isArray(userGrowth)) setUserGrowthData(userGrowth);
          if (Array.isArray(revenueTrend)) setRevenueTrendData(revenueTrend);
          if (Array.isArray(uPos)) setUsagePosData(uPos);
          if (Array.isArray(rPos)) setRevenuePosData(rPos);
        } else {
          setError(res.data?.message || 'Failed to load dashboard analytics');
        }
      } catch (err) {
        setError(err.message || 'Error connecting to analytics service');
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const summaryCards = [
    {
      id: 'uptime',
      title: 'SERVER UPTIME',
      value: summary.uptime,
      sub: 'All systems nominal',
      icon: Server,
    },
    {
      id: 'active',
      title: 'ACTIVE MODULES',
      value: String(summary.activeModules),
      sub: 'Active platform modules',
      subColor: 'text-[#d4b248]',
      icon: LayoutGrid,
    },
    {
      id: 'revenue',
      title: 'PLATFORM REVENUE',
      value: `Rs ${summary.totalRevenue.toLocaleString()}`,
      sub: 'Subscription revenue',
      icon: DollarSign,
    },
    {
      id: 'users',
      title: 'TOTAL USERS',
      value: String(summary.totalUsers),
      sub: 'Registered platform users',
      icon: Users,
    },
  ];

  const sortedUsage = [...usagePosData].sort((a, b) => (b.count || b.value || 0) - (a.count || a.value || 0));
  const mostUsedModule = sortedUsage[0]?.name ? `${sortedUsage[0].name} POS` : 'N/A';
  const leastUsedModule = sortedUsage[sortedUsage.length - 1]?.name ? `${sortedUsage[sortedUsage.length - 1].name} POS` : 'N/A';

  const totalRevenuePOS = revenuePosData.reduce((sum, item) => sum + (item.rawAmount || 0), 0);

  if (error) {
    return (
      <div className="flex-1 p-8 text-center bg-[#efeacb] rounded-2xl border border-[#bfbc9b]">
        <h2 className="text-xl font-bold text-red-700 mb-2">Analytics Error</h2>
        <p className="text-sm font-semibold text-[#152f16]">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col font-sans">
      {/* Dashboard Header */}
      <div className="mb-8 lg:hidden">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#152f16] font-serif mb-2">
          Welcome, {userName}
        </h1>
        <p className="text-base sm:text-lg text-[#55694a] font-medium">
          System analytics
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
          {summaryCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                className="bg-[#0b2b14] rounded-3xl border border-[#2e5c38]/40 p-6 flex items-center justify-between text-[#efeacb] hover:border-[#40804e]/60 transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1 hover:shadow-[0_12px_40px_rgb(0,0,0,0.18)]"
              >
                <div className="flex flex-col gap-2 flex-1 min-w-0 pr-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#a2bc90]/80">
                    {card.title}
                  </span>
                  <h3 className="text-3xl font-black text-white tracking-tight leading-none">
                    {card.value}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    {card.title.toLowerCase().includes('uptime') && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    )}
                    <span className={`text-xs font-semibold ${card.subColor || 'text-[#a2bc90]/70'}`}>
                      {card.sub}
                    </span>
                  </div>
                </div>

                {/* Decorative Divider Line */}
                <div className="flex-1 h-[1px] bg-gradient-to-r from-[#2e5c38]/50 via-[#2e5c38]/20 to-transparent mx-2 hidden lg:block" />

                {/* 3D Inset Icon Badge */}
                <div className="w-12 h-12 rounded-2xl bg-[#071c0d] border border-[#2e5c38]/40 flex items-center justify-center text-[#a2bc90] shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] shrink-0">
                  <Icon size={22} className="stroke-[1.75]" />
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
              <span>Real-time</span>
            </div>
          </div>

          <div className="h-[240px] w-full text-xs flex items-center justify-center">
            {userGrowthData.length === 0 ? (
              <span className="font-bold text-[#607455]">No user growth records found</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={userGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
            )}
          </div>
        </div>

        {/* Card 2: Platform Revenue Bar Chart */}
        <div className="bg-[#efeacb] rounded-[24px] border border-[#bfbc9b] p-6 shadow-sm flex flex-col justify-between min-h-[380px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#152f16]">
              PLATFORM REVENUE TREND (PKR in Thousands)
            </h3>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#137333]">
              <TrendingUp size={16} />
              <span>Real-time</span>
            </div>
          </div>

          <div className="h-[240px] w-full text-xs flex items-center justify-center">
            {revenueTrendData.length === 0 ? (
              <span className="font-bold text-[#607455]">No paid subscription invoices found</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#607455" strokeWidth={1} fontSize={10} tickLine={false} />
                  <YAxis
                    stroke="#607455"
                    strokeWidth={1}
                    fontSize={10}
                    tickLine={false}
                    tickFormatter={(tick) => `${tick}k`}
                  />
                  <Tooltip formatter={(value, _name, item) => [`PKR ${(item.payload.rawValue || value * 1000).toLocaleString()}`, 'Revenue']} />
                  <Bar dataKey="value" fill="#0d381c" radius={[4, 4, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Card 3: POS Module Share Pie Chart */}
        <div className="bg-[#efeacb] rounded-[24px] border border-[#bfbc9b] p-5 sm:p-6 shadow-sm flex flex-col justify-between min-h-[380px] gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#152f16]">
              ACTIVE MODULES SHARE
            </h3>
            <div className="flex items-center gap-1 border border-[#bfbc9b] rounded-lg px-2.5 py-1 bg-[#efeacb] text-xs font-bold text-[#152f16] whitespace-nowrap shrink-0">
              <span className="whitespace-nowrap">Platform Total</span>
              <ChevronDown size={14} className="shrink-0" />
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6 flex-1">
            {/* Pie Chart container */}
            <div className="w-[180px] h-[180px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={usagePosData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    stroke="#efeacb"
                    strokeWidth={2.5}
                  >
                    {usagePosData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legends list */}
            <div className="flex-1 w-full text-xs flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
              {usagePosData.map((item) => (
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
          <div className="border-t border-[#c8c2a3]/40 mt-4 pt-3 flex flex-col sm:flex-row gap-2.5 sm:gap-4 text-xs font-bold justify-between">
            <div className="flex items-center gap-2 bg-[#eae3c1] px-3 py-1.5 rounded-lg border border-[#bfbc9b]">
              <span className="w-1.5 h-3 bg-[#0d381c] rounded-full shrink-0" />
              <span className="text-[#607455] font-semibold">Most used:</span>
              <span className="text-[#0d381c]">{mostUsedModule}</span>
            </div>
            <div className="flex items-center gap-2 bg-[#eae3c1] px-3 py-1.5 rounded-lg border border-[#bfbc9b]">
              <span className="w-1.5 h-3 bg-[#e1dc7f] rounded-full shrink-0" />
              <span className="text-[#607455] font-semibold">Least used:</span>
              <span className="text-[#d9801c]">{leastUsedModule}</span>
            </div>
          </div>
        </div>

        {/* Card 4: Revenue as per POS Donut Chart & Table */}
        <div className="bg-[#efeacb] rounded-[24px] border border-[#bfbc9b] p-5 sm:p-6 shadow-sm flex flex-col justify-between min-h-[380px]">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-1.5 min-w-0">
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#152f16]">
                REVENUE AS PER POS
              </h3>
              <Info size={14} className="text-[#607455] cursor-pointer shrink-0" />
            </div>
            <div className="flex items-center gap-1 border border-[#bfbc9b] rounded-lg px-2.5 py-1 bg-[#efeacb] text-xs font-bold text-[#152f16] whitespace-nowrap shrink-0">
              <span className="whitespace-nowrap">Platform Total</span>
              <ChevronDown size={14} className="shrink-0" />
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6 flex-1">
            {/* Donut with Total in Center */}
            <div className="w-[180px] h-[180px] relative flex items-center justify-center shrink-0">
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-[9px] font-bold text-[#607455] tracking-widest uppercase">
                  TOTAL REVENUE
                </span>
                <span className="text-xs font-black text-[#0d381c] leading-tight px-1">
                  PKR {totalRevenuePOS.toLocaleString()}
                </span>
                <span className="text-[10px] font-bold text-[#607455]">100%</span>
              </div>

              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenuePosData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    stroke="#efeacb"
                    strokeWidth={2.5}
                  >
                    {revenuePosData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Revenue Table with custom progress bars */}
            <div className="flex-1 w-full text-xs flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-4">
              <div className="grid grid-cols-[1.5fr_1fr_0.5fr] text-[10px] font-bold text-[#607455] border-b border-[#c8c2a3]/40 pb-1">
                <span>POS Module</span>
                <span className="text-right">Revenue (PKR)</span>
                <span className="text-right">Share</span>
              </div>
              {revenuePosData.map((item) => (
                <div
                  key={item.name}
                  className="grid grid-cols-[1.5fr_1fr_0.5fr] items-center py-0.5 border-b border-[#c8c2a3]/10"
                >
                  <div className="flex flex-col pr-2">
                    <span className="font-semibold text-[#152f16]">{item.name}</span>
                    <div className="w-full bg-[#eae3c1] h-[3px] rounded-full mt-1 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${item.value}%`, backgroundColor: item.color }}
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
