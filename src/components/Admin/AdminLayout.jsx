import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Menu, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from './AdminSidebar';

export default function AdminLayout() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [time, setTime] = useState(new Date());
  const [headerDetails, setHeaderDetails] = useState({ title: '', subtitle: null });

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const formatDay = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#efeacb] text-[#0c3818] font-sans items-center">
      <div className="w-full max-w-[2560px] flex flex-col min-h-screen">
        {/* Mobile Drawer Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* 1: Unified Top Header/Navbar (Full Width) */}
        <header className="bg-transparent px-3 sm:px-6 lg:pr-2 lg:px-0 py-4 sm:py-6 lg:py-8 flex items-center justify-between shrink-0 min-h-[64px] lg:min-h-[96px] w-full z-30 max-w-full overflow-hidden">
          {/* Left Side: Hamburger on mobile, Logo on desktop */}
          <div className="flex items-center gap-2 sm:gap-3 lg:w-72 2xl:w-80 lg:shrink-0 min-w-0">
            {/* Mobile Menu Button (Hamburger) */}
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg border border-[#0c3818]/20 text-[#0c3818] hover:bg-[#0c3818]/10 cursor-pointer shrink-0"
            >
              <Menu size={22} />
            </button>

            {/* Desktop Logo (exactly as wide as the sidebar) */}
            <div className="hidden lg:flex items-center justify-center w-72 2xl:w-80 h-full py-1">
              <img src="/Nexus_superadmin.png" alt="Nexus Logo" className="h-28 2xl:h-36 w-auto object-contain" />
            </div>

            {/* Mobile Title */}
            <span className="lg:hidden font-serif font-black text-[#0c3818] tracking-tight text-xs sm:text-sm truncate">
              NEXUS DESKTOP
            </span>
          </div>

          {/* Center: Dynamic Page Title & Subtitle (centered horizontally on desktop) */}
          <div className="hidden lg:flex flex-col items-center justify-center text-center flex-1">
            <h1 className="text-4xl lg:text-[44px] 2xl:text-6xl font-black tracking-tight text-[#0c3818] leading-none mb-1">
              {headerDetails.title}
            </h1>
            {headerDetails.subtitle && (
              <div className="text-xs sm:text-sm 2xl:text-base text-[#607455] font-semibold mt-2 flex items-center justify-center gap-2">
                {headerDetails.subtitle}
              </div>
            )}
          </div>

          {/* Right Side: Clock & Logout */}
          <div className="flex items-center justify-end gap-2 sm:gap-3 lg:w-72 2xl:w-80 lg:shrink-0 select-none pr-1 sm:pr-2 lg:pr-6 shrink-0">
            {/* Real-time Clock */}
            <div className="hidden md:flex flex-col text-right text-[#0c3818]">
              <span className="text-xl 2xl:text-2xl font-bold tracking-wide leading-none">
                {formatTime(time)}
              </span>
              <span className="text-[10px] 2xl:text-xs font-extrabold tracking-widest text-[#607455] mt-1">
                {formatDay(time)}
              </span>
              <span className="text-xs 2xl:text-sm font-bold text-[#607455] mt-0.5">
                {formatDate(time)}
              </span>
            </div>

            {/* Mobile Store Title Badge (shown on tablets/wider mobile) */}
            {headerDetails.title && (
              <div className="hidden sm:block lg:hidden font-extrabold text-xs text-[#0c3818]/90 px-2.5 py-1 bg-[#efeacb] rounded-lg border border-[#0c3818]/20 truncate max-w-[140px]">
                {headerDetails.title}
              </div>
            )}

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 lg:px-6 lg:py-3.5 bg-[#0c3818] hover:bg-[#114720] text-[#efeacb] hover:text-white text-xs lg:text-sm font-extrabold rounded-lg transition duration-200 shadow-sm cursor-pointer border border-[#efeacb]/10 shrink-0"
              title="Admin Logout"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">ADMIN LOGOUT</span>
              <span className="sm:hidden text-[11px]">LOGOUT</span>
            </button>
          </div>
        </header>

        {/* Bottom Container: Splits into Sidebar (2) and Main Content (3) */}
        <div className="flex-1 flex min-h-0 relative">
          {/* Left Sidebar */}
          <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

          {/* Child Router Content Wrapper */}
          <main className="flex-1 px-6 lg:px-10 2xl:px-16 flex flex-col gap-8 overflow-y-auto min-w-0">
            <Outlet context={{ setHeaderDetails }} />
          </main>
        </div>
      </div>
    </div>
  );
}

