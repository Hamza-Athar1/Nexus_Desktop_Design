import { useState } from 'react';
import {
  TrendingUp,
  Package,
  ClipboardCheck,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

// Mock data for the AreaChart
const SALES_OVERVIEW_DATA = [
  { name: '17 aug', sales: 15 },
  { name: '18 aug', sales: 17 },
  { name: '19 aug', sales: 22 },
  { name: '20 aug', sales: 25 },
  { name: '21 aug', sales: 34 },
  { name: '22 aug', sales: 40 },
];

const RECENT_SALES = [
  { invoice: 'INV-00026', date: '23 Aug 2026', amount: 'Rs 3,500' },
  { invoice: 'INV-00026', date: '23 Aug 2026', amount: 'Rs 1,700' },
  { invoice: 'INV-00026', date: '20 Aug 2026', amount: 'Rs 2,470' },
  { invoice: 'INV-00026', date: '18 Aug 2026', amount: 'Rs 4,500' },
];

export default function AdminDashboardPage() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('This week');

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* ── Statistics Cards Grid ── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Card 1: Total Sales */}
        <div className="bg-[#0c3818] rounded-[24px] border border-[#3f5a3b]/30 p-6 flex items-center gap-5 text-[#efeacb] shadow-sm hover:scale-[1.01] transition duration-200">
          <div className="w-14 h-14 rounded-full bg-[#fbcfe8] flex items-center justify-center shrink-0">
            <TrendingUp size={24} className="text-[#be123c]" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#a2bc90]">
              Total Sales
            </span>
            <h3 className="text-2xl font-black font-mono mt-0.5">
              Rs 28,785
            </h3>
            <span className="text-[10px] font-bold text-[#fbcfe8] block mt-1">
              +5% <span className="text-[#a2bc90]/70 font-normal">from yesterday</span>
            </span>
          </div>
        </div>

        {/* Card 2: Total Orders */}
        <div className="bg-[#0c3818] rounded-[24px] border border-[#3f5a3b]/30 p-6 flex items-center gap-5 text-[#efeacb] shadow-sm hover:scale-[1.01] transition duration-200">
          <div className="w-14 h-14 rounded-full bg-[#fef3c7] flex items-center justify-center shrink-0">
            <ShoppingCart size={24} className="text-[#b45309]" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#a2bc90]">
              Total Orders
            </span>
            <h3 className="text-2xl font-black font-mono mt-0.5">
              30
            </h3>
            <span className="text-[10px] font-bold text-[#fef3c7] block mt-1">
              -2% <span className="text-[#a2bc90]/70 font-normal">from yesterday</span>
            </span>
          </div>
        </div>

        {/* Card 3: Total Products */}
        <div className="bg-[#0c3818] rounded-[24px] border border-[#3f5a3b]/30 p-6 flex items-center gap-5 text-[#efeacb] shadow-sm hover:scale-[1.01] transition duration-200">
          <div className="w-14 h-14 rounded-full bg-[#ccfbf1] flex items-center justify-center shrink-0">
            <Package size={24} className="text-[#0f766e]" />
          </div>
          <div className="flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#a2bc90]">
              Total Products
            </span>
            <h3 className="text-2xl font-black font-mono mt-0.5">
              95
            </h3>
            <button className="text-xs font-extrabold text-[#efeacb] underline mt-2 hover:text-white transition block text-left cursor-pointer">
              View Products
            </button>
          </div>
        </div>

        {/* Card 4: Low Stock Items */}
        <div className="bg-[#0c3818] rounded-[24px] border border-[#3f5a3b]/30 p-6 flex items-center gap-5 text-[#efeacb] shadow-sm hover:scale-[1.01] transition duration-200">
          <div className="w-14 h-14 rounded-full bg-[#ffe4e6] flex items-center justify-center shrink-0">
            <ClipboardCheck size={24} className="text-[#e11d48]" />
          </div>
          <div className="flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#a2bc90]">
              Low Stock Items
            </span>
            <h3 className="text-2xl font-black font-mono mt-0.5">
              12
            </h3>
            <button className="text-xs font-extrabold text-[#efeacb] underline mt-2 hover:text-white transition block text-left cursor-pointer">
              View Items
            </button>
          </div>
        </div>
      </section>

      {/* ── Main Dashboard Layout (Charts & Tables) ── */}
      <section className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-8">

        {/* Sales Overview Card */}
        <div className="bg-white rounded-[24px] border border-[#bfbc9b]/40 p-6 shadow-xs flex flex-col gap-6">

          {/* Sales Overview Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold tracking-tight text-[#0c3818] font-serif">
              Sales Overview
            </h3>

            <div className="relative">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0c3818] text-[#efeacb] text-xs font-bold rounded-full hover:bg-[#114720] transition duration-200 cursor-pointer shadow-sm min-w-[110px] justify-between"
              >
                <span>{selectedFilter}</span>
                {filterOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>

              {filterOpen && (
                <div className="absolute right-0 top-full mt-1.5 bg-[#fbf9f0] border border-[#0c3818]/20 rounded-lg shadow-lg z-20 w-32 overflow-hidden flex flex-col divide-y divide-[#0c3818]/10 text-left">
                  {['Today', 'This Month', 'Last Month', 'This Year'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setSelectedFilter(opt);
                        setFilterOpen(false);
                      }}
                      className="px-4 py-2 text-left text-xs font-bold text-[#0c3818] hover:bg-[#efeacb] transition duration-150 cursor-pointer"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Area Chart Container */}
          <div className="h-[220px] w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={SALES_OVERVIEW_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0c3818" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0c3818" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#607455" strokeWidth={1} fontSize={10} tickLine={false} />
                <YAxis
                  stroke="#607455"
                  strokeWidth={1}
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val}K`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fcfbe8', borderColor: '#bfbc9b', borderRadius: '12px' }}
                  labelStyle={{ fontWeight: 'bold', color: '#0c3818' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#0c3818" strokeWidth={2} fillOpacity={1} fill="url(#salesGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Top Selling Products List */}
          <div className="flex flex-col gap-4 mt-2">
            <h4 className="text-sm font-black text-[#0c3818] uppercase tracking-wider">
              Top Selling Products ({selectedFilter})
            </h4>

            <div className="flex flex-col gap-3">
              {[
                { name: 'Cooking Oil 1L', sold: 45, image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=80&auto=format&fit=crop&q=60' },
                { name: 'Lewis Bread', sold: 36, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=80&auto=format&fit=crop&q=60' },
                { name: 'Ramen Noodles', sold: 28, image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=80&auto=format&fit=crop&q=60' },
              ].map((prod, i) => (
                <div key={i} className="flex items-center justify-between border-b border-[#bfbc9b]/15 pb-2 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <img src={prod.image} alt={prod.name} className="w-10 h-10 rounded-lg object-cover border border-[#bfbc9b]/25" />
                    <span className="text-sm font-extrabold text-[#0c3818]">{prod.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-[#0c3818] block">{prod.sold}</span>
                    <span className="text-[9px] font-bold text-[#607455]/80 uppercase tracking-widest">Qty Sold</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Sales Table Card */}
        <div className="bg-white rounded-[24px] border border-[#bfbc9b]/40 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-[#0c3818] font-serif mb-6">
              Recent Sales
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#bfbc9b]/40 text-[#607455] text-xs font-black uppercase tracking-wider">
                    <th className="pb-3 pr-4">Invoice #</th>
                    <th className="pb-3 px-4">Date</th>
                    <th className="pb-3 pl-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#bfbc9b]/25">
                  {RECENT_SALES.map((sale, i) => (
                    <tr key={i} className="text-[#0c3818] text-sm font-bold">
                      <td className="py-4.5 pr-4">{sale.invoice}</td>
                      <td className="py-4.5 px-4">{sale.date}</td>
                      <td className="py-4.5 pl-4 text-right font-black">{sale.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <button className="px-10 py-3.5 bg-[#0c3818] hover:bg-[#114720] text-white text-base font-extrabold rounded-lg transition duration-200 shadow-sm cursor-pointer">
              View All Sales
            </button>
          </div>
        </div>

      </section>
    </div>
  );
}