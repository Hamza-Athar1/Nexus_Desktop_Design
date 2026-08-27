import React, { useEffect, useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { TrendingUp, BarChart3, ShoppingCart } from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';

const STOCK_DONUT_DATA = [
  { name: 'In Stock', value: 78, color: '#f94e2b' },
  { name: 'Low Stock', value: 14, color: '#eab308' },
  { name: 'Out of Stock', value: 10, color: '#0d9488' },
];

const LOW_STOCK_ITEMS = [
  { name: 'Cooking Oil', category: 'Grocery', qty: '10' },
  { name: 'Takis', category: 'Snacks', qty: '18' },
  { name: 'Fish', category: 'Meat & Fish', qty: '04' },
  { name: 'Rice', category: 'Grocery', qty: '10' },
  { name: 'Olpers', category: 'Dairy', qty: '09' },
];

export default function AdminStockReportPage() {
  const { setHeaderDetails } = useOutletContext() || {};
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (setHeaderDetails) {
      setHeaderDetails({
        title: user?.businessName?.toUpperCase() || 'IMTIAZ SUPER MARKET',
        subtitle: null,
      });
    }
  }, [setHeaderDetails, user]);

  const metricsData = [
    {
      label: 'TOTAL STOCK ITEMS',
      value: '26',
      icon: TrendingUp,
      iconBg: 'bg-[#e2f0e6] text-[#125d2b]',
      statusPill: { text: 'Optimal', bg: 'bg-[#e2f0e6] text-[#125d2b] border-[#a6dcb8]' },
    },
    {
      label: 'LOW STOCK ITEMS',
      value: '108',
      icon: BarChart3,
      iconBg: 'bg-[#fef3d6] text-[#b45309]',
      statusPill: { text: 'Restock Soon', bg: 'bg-[#fef3d6] text-[#b45309] border-[#fde047]' },
    },
    {
      label: 'OUT OF STOCK ITEMS',
      value: '12',
      icon: ShoppingCart,
      iconBg: 'bg-[#fde8e4] text-[#8b1e10]',
      statusPill: { text: 'Action Needed', bg: 'bg-[#fde8e4] text-[#8b1e10] border-[#f8b4ab]' },
    },
  ];

  const memoizedDonutData = useMemo(() => STOCK_DONUT_DATA, []);

  return (
    <div className="flex flex-col gap-6 w-full pb-12">
      {/* ── Top Title Header ── */}
      <div>
        <h1 className="text-3xl lg:text-4xl font-black text-[#0c3818] tracking-tight">
          Stock Report
        </h1>
        <p className="text-base sm:text-lg font-bold text-[#607455] mt-1">
          Current stock status overview
        </p>
      </div>

      {/* ── 3 Top Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
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
              <div className="flex-1 flex items-center gap-3 mx-4 sm:mx-6 min-w-0">
                <div className="flex-1 h-[2px] bg-gradient-to-r from-[#0c3818]/20 via-[#0c3818]/8 to-transparent rounded-full" />
                <span className={`px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider border shadow-2xs whitespace-nowrap hidden md:inline-block ${item.statusPill.bg}`}>
                  {item.statusPill.text}
                </span>
                <div className="flex-1 h-[2px] bg-gradient-to-r from-transparent via-[#0c3818]/8 to-[#0c3818]/20 rounded-full" />
              </div>

              {/* Right Stats Text */}
              <div className="flex flex-col text-right min-w-0 shrink-0">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#607455]">
                  {item.label}
                </span>
                <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0c3818] tracking-tight mt-0.5 truncate">
                  {item.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Main Layout: Stock Status Donut (Left) & Low Stock Items Table (Right) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Card: Stock Status (Donut Chart) */}
        <div className="lg:col-span-7 border-2 border-[#0c3818]/25 rounded-2xl md:rounded-3xl p-6 bg-[#f9f7ea]/80 backdrop-blur-xs shadow-xs flex flex-col justify-between gap-6">
          <h2 className="text-xl sm:text-2xl font-black text-[#0c3818] tracking-tight uppercase">
            STOCK STATUS
          </h2>

          <div className="flex-1 min-h-[300px] sm:min-h-[340px] w-full flex flex-col sm:flex-row items-center justify-around gap-6">
            {/* Donut Chart */}
            <div className="w-full sm:w-3/5 h-[260px] sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={memoizedDonutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={115}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {memoizedDonutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#efeacb',
                      borderColor: '#0c3818',
                      borderRadius: '12px',
                      color: '#0c3818',
                      fontWeight: 'bold',
                    }}
                    formatter={(val, name) => [`${val}%`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Custom Right-Side Legend Matching Screenshot */}
            <div className="flex flex-col gap-5 w-full sm:w-2/5 justify-center pl-2 sm:pl-4 select-none">
              {memoizedDonutData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between gap-4 font-black text-sm sm:text-base text-[#0c3818]">
                  <div className="flex items-center gap-3">
                    <span
                      className="w-4 h-4 rounded-xs shadow-xs shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-extrabold text-[#0c3818]/90">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Card: Low Stock Items Table */}
        <div className="lg:col-span-5 border-2 border-[#0c3818]/25 rounded-2xl md:rounded-3xl p-6 bg-[#f9f7ea]/80 backdrop-blur-xs shadow-xs flex flex-col justify-between gap-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#0c3818] tracking-tight uppercase mb-4">
              LOW STOCK ITEMS
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#0c3818]/20 text-[#0c3818] text-xs sm:text-sm font-black">
                    <th className="pb-3 pr-2">Item Name</th>
                    <th className="pb-3 px-2">Category</th>
                    <th className="pb-3 pl-2 text-right">QTY</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#0c3818]/15">
                  {LOW_STOCK_ITEMS.map((item, i) => (
                    <tr key={i} className="text-[#0c3818] text-sm font-bold hover:bg-[#efeacb]/40 transition">
                      <td className="py-3.5 pr-2 font-black tracking-tight">{item.name}</td>
                      <td className="py-3.5 px-2 text-[#0c3818]/85">{item.category}</td>
                      <td className="py-3.5 pl-2 text-right font-black text-[#0c3818]">
                        {item.qty}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 flex justify-center">
            <button
              onClick={() => navigate('/admin/products')}
              className="px-8 py-3 bg-[#0c3818] hover:bg-[#114720] text-[#efeacb] text-base font-extrabold rounded-xl transition duration-150 shadow-xs cursor-pointer active:scale-95"
            >
              View All Stock
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
