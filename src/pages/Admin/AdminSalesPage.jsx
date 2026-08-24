import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { TrendingUp, ShoppingCart } from 'lucide-react';

export default function AdminSalesPage() {
  const { setHeaderDetails } = useOutletContext() || {};
  const { user } = useAuth();

  // Initial sales metrics state (with realistic default values matching screen reference)
  const [salesMetrics] = useState({
    today: {
      totalSales: 32987,
      totalInvoices: 98,
    },
    yesterday: {
      totalSales: 50456,
      totalInvoices: 155,
    },
    thisWeek: {
      totalSales: 991800,
      totalInvoices: 685,
    },
    thisMonth: {
      totalSales: 3289987,
      totalInvoices: 2200,
    },
  });

  useEffect(() => {
    if (setHeaderDetails) {
      setHeaderDetails({
        title: user?.businessName?.toUpperCase() || 'IMTIAZ SUPER MARKET',
        subtitle: null,
      });
    }
  }, [setHeaderDetails, user]);

  // Helper to format currency
  const formatCurrency = (val) => {
    if (val === undefined || val === null) return 'Rs 0';
    return `Rs ${val.toLocaleString('en-IN')}`;
  };

  const salesData = [
    {
      period: 'Today',
      titleColor: 'text-[#8b1e10]',
      sales: salesMetrics.today.totalSales,
      invoices: salesMetrics.today.totalInvoices,
      salesIconBg: 'bg-[#8b1e10] text-white',
      invoiceIconBg: 'bg-[#fce8e4] text-[#8b1e10]',
    },
    {
      period: 'Yesterday',
      titleColor: 'text-[#c28e0e]',
      sales: salesMetrics.yesterday.totalSales,
      invoices: salesMetrics.yesterday.totalInvoices,
      salesIconBg: 'bg-[#c28e0e] text-white',
      invoiceIconBg: 'bg-[#fef7df] text-[#c28e0e]',
    },
    {
      period: 'This Week',
      titleColor: 'text-[#125d2b]',
      sales: salesMetrics.thisWeek.totalSales,
      invoices: salesMetrics.thisWeek.totalInvoices,
      salesIconBg: 'bg-[#125d2b] text-white',
      invoiceIconBg: 'bg-[#e6f4ea] text-[#125d2b]',
    },
    {
      period: 'This Month',
      titleColor: 'text-[#0f4c96]',
      sales: salesMetrics.thisMonth.totalSales,
      invoices: salesMetrics.thisMonth.totalInvoices,
      salesIconBg: 'bg-[#0f4c96] text-white',
      invoiceIconBg: 'bg-[#e8f0fe] text-[#0f4c96]',
    },
  ];

  return (
    <div className="flex flex-col gap-5 lg:gap-6 w-full max-w-7xl mx-auto pb-10">
      {salesData.map((item, idx) => (
        <div
          key={idx}
          className="border-2 border-[#0c3818]/25 rounded-2xl md:rounded-3xl p-5 sm:p-7 md:p-8 bg-[#f5f7e8]/40 backdrop-blur-xs flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs hover:border-[#0c3818]/40 hover:shadow-md transition-all duration-200"
        >
          {/* Period Title */}
          <div className="w-full md:w-1/3 lg:w-1/4 flex items-center">
            <h2 className={`text-3xl sm:text-4xl md:text-5xl lg:text-[46px] font-black tracking-tight ${item.titleColor}`}>
              {item.period}
            </h2>
          </div>

          {/* Stat Cards Container */}
          <div className="w-full md:w-2/3 lg:w-3/4 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
            {/* Total Sales Card */}
            <div className="border-2 border-[#0c3818]/25 rounded-xl md:rounded-2xl p-4 sm:p-5 bg-white/90 flex items-center gap-4 sm:gap-5 shadow-xs hover:bg-white transition-all">
              <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${item.salesIconBg}`}>
                <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 stroke-[2.5]" />
              </div>
              <div className="flex flex-col justify-center min-w-0">
                <span className="text-[#0c3818] font-extrabold text-base sm:text-lg lg:text-xl tracking-tight">
                  Total Sales
                </span>
                <span className="text-[#0c3818] font-black text-2xl sm:text-3xl lg:text-4xl tracking-tight truncate mt-0.5">
                  {formatCurrency(item.sales)}
                </span>
              </div>
            </div>

            {/* Total Invoices Card */}
            <div className="border-2 border-[#0c3818]/25 rounded-xl md:rounded-2xl p-4 sm:p-5 bg-white/90 flex items-center gap-4 sm:gap-5 shadow-xs hover:bg-white transition-all">
              <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center shrink-0 ${item.invoiceIconBg}`}>
                <ShoppingCart className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 stroke-[2.5]" />
              </div>
              <div className="flex flex-col justify-center min-w-0">
                <span className="text-[#0c3818] font-extrabold text-base sm:text-lg lg:text-xl tracking-tight">
                  Total Invoices
                </span>
                <span className="text-[#0c3818] font-black text-2xl sm:text-3xl lg:text-4xl tracking-tight truncate mt-0.5">
                  {item.invoices}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
