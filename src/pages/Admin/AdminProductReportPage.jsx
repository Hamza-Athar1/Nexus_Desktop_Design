import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Calendar, ChevronDown } from 'lucide-react';
import {
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const TOP_PRODUCTS_DATA = [
  { name: 'Cooking Oil', sales: 280 },
  { name: 'Olpers', sales: 235 },
  { name: 'Ramen', sales: 190 },
  { name: 'Rice', sales: 115 },
  { name: 'Takis', sales: 96 },
];

const CATEGORY_PIE_DATA = [
  { name: 'Snacks', value: 20, color: '#FFA533' },
  { name: 'Beverages', value: 18, color: '#3B82F6' },
  { name: 'Grocery & Dairy', value: 28, color: '#8B5CF6' },
  { name: 'Fruit & Vegetable', value: 20, color: '#FF7676' },
  { name: 'Meat & Fish', value: 14, color: '#38BDF8' },
];

// Custom label for Pie Chart slices to render leader lines & text like the screenshot
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  outerRadius,
  name,
}) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 22;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#0c3818"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize={12}
      fontWeight="bold"
    >
      {name}
    </text>
  );
};

export default function AdminProductReportPage() {
  const { setHeaderDetails } = useOutletContext() || {};
  const { user } = useAuth();

  const [selectedPeriod, setSelectedPeriod] = useState('This Week');
  const [filterOpen, setFilterOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (setHeaderDetails) {
      setHeaderDetails({
        title: user?.businessName?.toUpperCase() || 'IMTIAZ SUPER MARKET',
        subtitle: null,
      });
    }
  }, [setHeaderDetails, user]);

  const memoizedBarData = useMemo(() => TOP_PRODUCTS_DATA, []);
  const memoizedPieData = useMemo(() => CATEGORY_PIE_DATA, []);

  return (
    <div className="flex flex-col gap-6 w-full pb-12">
      {/* ── Top Title & Controls Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black text-[#0c3818] tracking-tight">
            Product Report
          </h1>
          <p className="text-base sm:text-lg font-bold text-[#607455] mt-1">
            Summary of product sales
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

      {/* ── Main Layout: Top 5 Selling Products (Left) & Sales By Category (Right) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Card: Top 5 Selling Products (Horizontal Bar Chart) */}
        <div className="lg:col-span-6 border-2 border-[#0c3818]/25 rounded-2xl md:rounded-3xl p-6 bg-[#f9f7ea]/80 backdrop-blur-xs shadow-xs flex flex-col gap-6 justify-between">
          <h2 className="text-xl sm:text-2xl font-black text-[#0c3818] tracking-tight">
            Top 5 Selling Products
          </h2>

          <div className="flex-1 min-h-[320px] sm:min-h-[360px] w-full flex flex-col justify-center">
            {/* Custom Horizontal Bars matching design exactly */}
            <div className="flex flex-col gap-5 my-auto py-2">
              {memoizedBarData.map((item, idx) => {
                const percentage = (item.sales / 300) * 100;
                return (
                  <div key={idx} className="flex items-center gap-4 text-sm font-bold text-[#0c3818]">
                    {/* Item Name */}
                    <span className="w-28 text-left font-black text-sm sm:text-base truncate shrink-0">
                      {item.name}
                    </span>

                    {/* Bar Track & Value */}
                    <div className="flex-1 flex items-center gap-3">
                      <div className="w-full bg-black/5 rounded-r-md h-9 flex items-center">
                        <div
                          className="bg-[#0c3818] hover:bg-[#114720] h-full rounded-r-md transition-all duration-500 shadow-xs"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="font-black text-sm sm:text-base text-[#0c3818] shrink-0 min-w-[36px]">
                        {item.sales}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* X-Axis Numbers Scale at Bottom */}
            <div className="border-t border-[#0c3818]/15 pt-3 mt-4 flex justify-between pl-32 pr-12 text-xs sm:text-sm font-bold text-[#0c3818]/80 select-none">
              <span>0</span>
              <span>50</span>
              <span>100</span>
              <span>150</span>
              <span>200</span>
              <span>250</span>
              <span>300</span>
            </div>
          </div>
        </div>

        {/* Right Card: Sales By Category (Pie Chart) */}
        <div className="lg:col-span-6 border-2 border-[#0c3818]/25 rounded-2xl md:rounded-3xl p-6 bg-[#f9f7ea]/80 backdrop-blur-xs shadow-xs flex flex-col gap-6 justify-between">
          <h2 className="text-xl sm:text-2xl font-black text-[#0c3818] tracking-tight">
            Sales By Category
          </h2>

          <div className="flex-1 min-h-[320px] sm:min-h-[360px] w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={memoizedPieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={105}
                  innerRadius={0}
                  dataKey="value"
                  labelLine={true}
                  label={renderCustomizedLabel}
                >
                  {memoizedPieData.map((entry, index) => (
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
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(value) => <span className="text-xs font-extrabold text-[#0c3818]">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
