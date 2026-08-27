import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { TrendingUp, BarChart3, PieChart, Activity, ArrowLeft } from 'lucide-react';

export default function AdminReportsPage() {
  const { setHeaderDetails } = useOutletContext() || {};
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeReportDetail, setActiveReportDetail] = useState(null);

  useEffect(() => {
    if (setHeaderDetails) {
      setHeaderDetails({
        title: user?.businessName?.toUpperCase() || 'IMTIAZ SUPER MARKET',
        subtitle: null,
      });
    }
  }, [setHeaderDetails, user]);

  const reportCards = [
    {
      id: 'sales',
      title: 'Sales Report',
      icon: TrendingUp,
      iconBg: 'bg-[#fde8e4] text-[#8b1e10]',
      btnStyle: 'bg-[#fde8e4] hover:bg-[#fbd3cb] text-[#8b1e10] border-[#f8b4ab]',
      path: '/admin/reports/sales',
      description: 'View daily, weekly, and monthly sales trends, order volumes, and revenue distribution.',
      stats: [
        { label: 'Total Revenue', value: 'PKR 3,289,987' },
        { label: 'Avg Daily Sales', value: 'PKR 109,666' },
      ],
    },
    {
      id: 'product',
      title: 'Product Report',
      icon: BarChart3,
      iconBg: 'bg-[#e2ecf7] text-[#0f4c96]',
      btnStyle: 'bg-[#e2ecf7] hover:bg-[#c9dff7] text-[#0f4c96] border-[#b2d1f7]',
      path: '/admin/reports/product',
      description: 'Track top-performing items, sales by category, stock velocity, and product returns.',
      stats: [
        { label: 'Top Seller', value: 'Cooking Oil 1L' },
        { label: 'Active Products', value: '95 items' },
      ],
    },
    {
      id: 'stock',
      title: 'Stock Report',
      icon: PieChart,
      iconBg: 'bg-[#e2f0e6] text-[#125d2b]',
      btnStyle: 'bg-[#e2f0e6] hover:bg-[#cbebd5] text-[#125d2b] border-[#a6dcb8]',
      path: '/admin/reports/stock',
      description: 'Monitor current inventory levels, low-stock warnings, and restock forecasts.',
      stats: [
        { label: 'Low Stock Items', value: '12 items' },
        { label: 'Total In-Stock', value: '1,420 units' },
      ],
    },
    {
      id: 'profit',
      title: 'Profit Report',
      icon: Activity,
      iconBg: 'bg-[#f5e8fd] text-[#7e22ce]',
      btnStyle: 'bg-[#f5e8fd] hover:bg-[#ebd0fb] text-[#7e22ce] border-[#d8b4fe]',
      path: '/admin/reports/profit',
      description: 'Analyze net margin percentage, total profit breakdown, and store cost deductions.',
      stats: [
        { label: 'Net Profit Margin', value: '24.5%' },
        { label: 'Est. Net Income', value: 'PKR 805,000' },
      ],
    },
  ];

  const handleCardClick = (card) => {
    setActiveReportDetail(card);
  };

  return (
    <div className="flex flex-col gap-8 w-full pb-12">
      {/* ── Page Header Section ── */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-3xl lg:text-4xl font-black text-[#0c3818] tracking-tight uppercase">
          REPORTS OVERVIEW
        </h1>
        <p className="text-base sm:text-lg font-bold text-[#607455]">
          Select a report to view details and analytics
        </p>
      </div>

      {/* ── 4 Reports Cards Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {reportCards.map((card) => {
          const IconComp = card.icon;
          return (
            <div
              key={card.id}
              className="border-2 border-[#0c3818]/25 rounded-2xl md:rounded-3xl p-6 sm:p-7 bg-[#f9f7ea]/80 backdrop-blur-xs flex flex-col items-center justify-between text-center gap-6 shadow-xs hover:shadow-md hover:border-[#0c3818]/45 transition-all duration-200"
            >
              {/* Top Decorative / Icon */}
              <div className="flex flex-col items-center gap-3 w-full">
                {/* Big Center Icon Square */}
                <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center shadow-xs transition-transform duration-200 hover:scale-105 ${card.iconBg}`}>
                  <IconComp className="w-10 h-10 sm:w-12 sm:h-12 stroke-[2.2]" />
                </div>

                {/* Title */}
                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-[#0c3818] mt-2">
                  {card.title}
                </h3>
              </div>

              {/* View Report Button */}
              <button
                onClick={() => handleCardClick(card)}
                className={`w-full py-3 px-6 rounded-xl font-bold text-base sm:text-lg border transition duration-150 cursor-pointer shadow-xs active:scale-95 ${card.btnStyle}`}
              >
                View Report
              </button>
            </div>
          );
        })}
      </div>

      {/* ── Active Report Detail Analytics Drawer / Card (Shown when clicking View Report) ── */}
      {activeReportDetail && (
        <div className="mt-4 border-2 border-[#0c3818]/25 rounded-2xl md:rounded-3xl p-6 sm:p-8 bg-white/90 shadow-md flex flex-col gap-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-[#0c3818]/15 pb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveReportDetail(null)}
                className="p-2 rounded-full hover:bg-[#0c3818]/10 text-[#0c3818] transition cursor-pointer"
                title="Back"
              >
                <ArrowLeft size={20} />
              </button>
              <h2 className="text-2xl font-black text-[#0c3818]">
                {activeReportDetail.title} Analytics
              </h2>
            </div>
            <button
              onClick={() => navigate(activeReportDetail.path)}
              className="px-4 py-2 bg-[#0c3818] text-[#efeacb] text-xs font-bold rounded-xl hover:bg-[#114720] transition cursor-pointer"
            >
              Open Full View
            </button>
          </div>

          <p className="text-sm sm:text-base font-semibold text-[#607455]">
            {activeReportDetail.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {activeReportDetail.stats.map((st, i) => (
              <div key={i} className="p-4 bg-[#f9f7ea] border border-[#0c3818]/20 rounded-xl flex flex-col gap-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#607455]">
                  {st.label}
                </span>
                <span className="text-2xl font-black text-[#0c3818]">
                  {st.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
