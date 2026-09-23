import React, { useState, useEffect } from 'react';
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

import { getTopProductsReport, getCategoryDistributionReport } from '../../lib/reportService.js';

export default function AdminProductReportPage() {
  const { setHeaderDetails } = useOutletContext() || {};
  const { user } = useAuth();

  const [selectedPeriod, setSelectedPeriod] = useState('This Week');
  const [filterOpen, setFilterOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [topProductsData, setTopProductsData] = useState([]);
  const [categoryPieData, setCategoryPieData] = useState([]);
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
    async function loadReportData() {
      setIsLoading(true);
      try {
        const params = { period: selectedPeriod, startDate, endDate };
        const [topRes, pieRes] = await Promise.all([
          getTopProductsReport(params),
          getCategoryDistributionReport(params),
        ]);
        if (topRes.ok && Array.isArray(topRes.data?.topProducts)) {
          setTopProductsData(topRes.data.topProducts);
        }
        if (pieRes.ok && Array.isArray(pieRes.data?.categoryDistribution)) {
          setCategoryPieData(pieRes.data.categoryDistribution);
        }
      } catch {
        setTopProductsData([]);
        setCategoryPieData([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadReportData();
  }, [selectedPeriod, startDate, endDate]);

  const memoizedBarData = topProductsData;
  const memoizedPieData = categoryPieData;

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
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
