import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  TrendingUp,
  ShoppingCart,
  BarChart3,
  Activity,
  Calendar,
  ChevronDown,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

const SALES_CHART_DATA = [
  { name: '17 Jun', sales: 22000 },
  { name: '18 Jun', sales: 10000 },
  { name: '19 Jun', sales: 32000 },
  { name: '20 Jun', sales: 46000 },
  { name: '21 Jun', sales: 37000 },
  { name: '22 Jun', sales: 25000 },
  { name: '23 Jun', sales: 45000 },
];

import { getSales } from '../../lib/salesService.js';

export default function AdminSalesReportPage() {
  const { setHeaderDetails } = useOutletContext() || {};
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selectedPeriod, setSelectedPeriod] = useState('This Week');
  const [filterOpen, setFilterOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [salesList, setSalesList] = useState([]);
  const [_isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (setHeaderDetails) {
      setHeaderDetails({
        title: user?.businessName?.toUpperCase() || 'IMTIAZ SUPER MARKET',
        subtitle: null,
      });
    }
  }, [setHeaderDetails, user]);

  useEffect(() => {
    async function loadSales() {
      setIsLoading(true);
      try {
        const res = await getSales();
        if (res.ok && Array.isArray(res.data?.sales)) {
          setSalesList(res.data.sales);
        }
      } catch {
        setSalesList([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadSales();
  }, []);

  const totalSalesRevenue = useMemo(() => {
    return salesList.reduce((acc, s) => acc + Number(s.total_amount || 0), 0);
  }, [salesList]);

  const totalOrdersCount = salesList.length;

  const avgOrderVal = totalOrdersCount > 0 ? (totalSalesRevenue / totalOrdersCount) : 0;

  const recentSalesFormatted = useMemo(() => {
    return salesList.map((s) => ({
      invoiceNo: s.invoice_number || `INV-${s.id}`,
      date: new Date(s.sold_at || s.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      amount: `Rs. ${Number(s.total_amount).toLocaleString()}`,
    }));
  }, [salesList]);

  const metricsData = [
    {
      label: 'TOTAL SALES',
      value: `Rs ${totalSalesRevenue.toLocaleString()}`,
      icon: TrendingUp,
      iconBg: 'bg-[#fde8e4] text-[#8b1e10]',
      statusPill: { text: 'Live Total', bg: 'bg-[#fde8e4] text-[#8b1e10] border-[#f8b4ab]' },
    },
    {
      label: 'TOTAL ORDERS',
      value: `${totalOrdersCount}`,
      icon: ShoppingCart,
      iconBg: 'bg-[#fef7df] text-[#c28e0e]',
      statusPill: { text: 'Completed', bg: 'bg-[#fef7df] text-[#c28e0e] border-[#fde047]' },
    },
    {
      label: 'AVG ORDER VALUE',
      value: `Rs. ${avgOrderVal.toFixed(2)}`,
      icon: BarChart3,
      iconBg: 'bg-[#fef3d6] text-[#b45309]',
      statusPill: { text: 'Authoritative', bg: 'bg-[#fef3d6] text-[#b45309] border-[#fde047]' },
    },
    {
      label: 'TOTAL TRANSACTIONS',
      value: `${totalOrdersCount}`,
      icon: Activity,
      iconBg: 'bg-[#fde8e4] text-[#8b1e10]',
      statusPill: { text: 'Business Scoped', bg: 'bg-[#fde8e4] text-[#8b1e10] border-[#f8b4ab]' },
    },
  ];

  const memoizedChartData = useMemo(() => SALES_CHART_DATA, []);

  return (
    <div className="flex flex-col gap-6 w-full pb-12">
      {/* ── Top Title & Controls Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black text-[#0c3818] tracking-tight">
            Sales Report
          </h1>
          <p className="text-base sm:text-lg font-bold text-[#607455] mt-1">
            Overview of sales performance
          </p>
        </div>

        {/* Filter Controls (Dropdown + Start Date + End Date) */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Period Select Dropdown */}
          <div className="relative">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center gap-2.5 px-4 py-2.5 bg-white border border-[#0c3818]/30 text-[#0c3818] text-sm font-bold rounded-xl hover:bg-[#efeacb]/30 transition duration-150 cursor-pointer shadow-xs min-w-[130px] justify-between"
            >
              <span>{selectedPeriod}</span>
              <ChevronDown size={16} className="text-[#0c3818]/70" />
            </button>

            {filterOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-[#0c3818]/20 rounded-xl shadow-lg z-30 w-36 overflow-hidden flex flex-col divide-y divide-[#0c3818]/10 text-left">
                {['Today', 'This Week', 'This Month', 'This Year'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setSelectedPeriod(opt);
                      setFilterOpen(false);
                    }}
                    className="px-4 py-2.5 text-left text-xs font-bold text-[#0c3818] hover:bg-[#efeacb] transition duration-150 cursor-pointer"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Start Date */}
          <div className="relative w-full sm:w-44">
            <input
              type="text"
              placeholder="Start Date"
              onFocus={(e) => (e.target.type = 'date')}
              onBlur={(e) => {
                if (!e.target.value) e.target.type = 'text';
              }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-white border border-[#0c3818]/30 rounded-xl px-4 py-2.5 pr-10 text-sm font-semibold text-[#0c3818] placeholder-[#607455]/70 focus:outline-none focus:border-[#0c3818] shadow-xs transition"
            />
            <Calendar
              size={18}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0c3818]/60 pointer-events-none"
            />
          </div>

          {/* End Date */}
          <div className="relative w-full sm:w-44">
            <input
              type="text"
              placeholder="End Date"
              onFocus={(e) => (e.target.type = 'date')}
              onBlur={(e) => {
                if (!e.target.value) e.target.type = 'text';
              }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-white border border-[#0c3818]/30 rounded-xl px-4 py-2.5 pr-10 text-sm font-semibold text-[#0c3818] placeholder-[#607455]/70 focus:outline-none focus:border-[#0c3818] shadow-xs transition"
            />
            <Calendar
              size={18}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0c3818]/60 pointer-events-none"
            />
          </div>
        </div>
      </div>

      {/* ── 4 Top Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {metricsData.map((item, idx) => {
          const IconComponent = item.icon;
          return (
            <div
              key={idx}
              className="border-2 border-[#0c3818]/25 rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-white via-[#fcfbf4] to-white flex items-center justify-between shadow-xs hover:border-[#0c3818]/45 hover:shadow-md transition-all duration-200 relative overflow-hidden"
            >
              {/* Icon Container */}
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${item.iconBg}`}>
                <IconComponent className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
              </div>

              {/* Middle Gap Visual Enhancer: Decorative Gradient Accent Line & Status Pill */}
              <div className="flex-1 flex items-center gap-2 mx-3 min-w-0">
                <div className="flex-1 h-[2px] bg-gradient-to-r from-[#0c3818]/20 via-[#0c3818]/8 to-transparent rounded-full" />
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-2xs whitespace-nowrap hidden xl:inline-block ${item.statusPill.bg}`}>
                  {item.statusPill.text}
                </span>
                <div className="flex-1 h-[2px] bg-gradient-to-r from-transparent via-[#0c3818]/8 to-[#0c3818]/20 rounded-full" />
              </div>

              {/* Right Stats Text */}
              <div className="flex flex-col text-right min-w-0 shrink-0">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#607455]">
                  {item.label}
                </span>
                <span className="text-xl sm:text-2xl lg:text-3xl font-black text-[#0c3818] tracking-tight mt-0.5 truncate">
                  {item.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Main Layout: Bar Chart (Left) & Recent Sales Table (Right) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Sales Overview Bar Chart (Left 7 cols) */}
        <div className="lg:col-span-7 border-2 border-[#0c3818]/25 rounded-2xl md:rounded-3xl p-6 bg-[#f9f7ea]/80 backdrop-blur-xs shadow-xs flex flex-col justify-between gap-6">
          <h2 className="text-xl sm:text-2xl font-black text-[#0c3818] tracking-tight">
            Sales Overview
          </h2>

          <div className="h-[280px] sm:h-[320px] w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={memoizedChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid stroke="#0c3818" strokeOpacity={0.06} strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#0c3818"
                  fontSize={12}
                  fontWeight="bold"
                  tickLine={false}
                  axisLine={{ stroke: '#0c3818', strokeOpacity: 0.2 }}
                />
                <YAxis
                  stroke="#0c3818"
                  fontSize={12}
                  fontWeight="bold"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => (val === 0 ? '0' : `${val / 1000}K`)}
                  domain={[0, 50000]}
                  ticks={[0, 10000, 20000, 30000, 40000, 50000]}
                />
                <Tooltip
                  cursor={{ fill: '#0c3818', fillOpacity: 0.05 }}
                  contentStyle={{
                    backgroundColor: '#efeacb',
                    borderColor: '#0c3818',
                    borderRadius: '12px',
                    color: '#0c3818',
                    fontWeight: 'bold',
                  }}
                  formatter={(val) => [`PKR ${val.toLocaleString()}`, 'Sales']}
                />
                <Bar
                  dataKey="sales"
                  fill="#0c3818"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Sales Table (Right 5 cols) */}
        <div className="lg:col-span-5 border-2 border-[#0c3818]/25 rounded-2xl md:rounded-3xl p-6 bg-[#f9f7ea]/80 backdrop-blur-xs shadow-xs flex flex-col justify-between gap-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#0c3818] tracking-tight mb-4">
              Recent Sales
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#0c3818]/20 text-[#0c3818] text-xs sm:text-sm font-black">
                    <th className="pb-3 pr-2">Invoice #</th>
                    <th className="pb-3 px-2">Date</th>
                    <th className="pb-3 pl-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#0c3818]/15">
                  {recentSalesFormatted.length > 0 ? (
                    recentSalesFormatted.map((sale, i) => (
                      <tr key={i} className="text-[#0c3818] text-sm font-bold hover:bg-[#efeacb]/40 transition">
                        <td className="py-4 pr-2 font-black tracking-tight">{sale.invoiceNo}</td>
                        <td className="py-4 px-2 text-[#0c3818]/85">{sale.date}</td>
                        <td className="py-4 pl-2 text-right font-black text-[#0c3818]">
                          {sale.amount}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-xs text-gray-400 font-semibold">
                        No sales recorded yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 flex justify-center">
            <button
              onClick={() => navigate('/admin/sales/history')}
              className="px-8 py-3 bg-[#0c3818] hover:bg-[#114720] text-[#efeacb] text-base font-extrabold rounded-xl transition duration-150 shadow-xs cursor-pointer active:scale-95"
            >
              View All Sales
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
