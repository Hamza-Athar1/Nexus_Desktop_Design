import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Menu, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from './AdminSidebar';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [time, setTime] = useState(new Date());

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
    <div className="flex min-h-screen bg-[#efeacb] text-[#0c3818] font-sans">
      {/* Mobile Drawer Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Right Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        
        {/* Top Header */}
        <header className="bg-[#efeacb] border-b border-[#0c3818]/20 px-4 sm:px-8 py-4 flex items-center justify-between shrink-0 min-h-[72px] lg:min-h-[96px]">
          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg border border-[#0c3818]/20 text-[#0c3818] hover:bg-[#0c3818]/10 cursor-pointer shrink-0 mr-2 sm:mr-4"
          >
            <Menu size={24} />
          </button>

          {/* Center: Business Name */}
          <h1 className="text-xl sm:text-2xl lg:text-[40px] font-black tracking-tight text-[#0c3818] font-serif uppercase text-left flex-1 max-w-4xl px-2">
            {user?.businessName || 'IMTIAZ SUPER MARKET'}
          </h1>

          {/* Right: Clock & Logout */}
          <div className="flex items-center gap-4 lg:gap-8 select-none">
            {/* Real-time Clock */}
            <div className="hidden md:flex flex-col text-right text-[#0c3818]">
              <span className="text-xl font-bold tracking-wide leading-none">
                {formatTime(time)}
              </span>
              <span className="text-[10px] font-extrabold tracking-widest text-[#607455] mt-1">
                {formatDay(time)}
              </span>
              <span className="text-xs font-bold text-[#607455] mt-0.5">
                {formatDate(time)}
              </span>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 lg:px-6 lg:py-3.5 bg-[#0c3818] hover:bg-[#114720] text-[#efeacb] hover:text-white text-xs lg:text-sm font-extrabold rounded-lg transition duration-200 shadow-sm cursor-pointer border border-[#efeacb]/10"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">ADMIN LOGOUT</span>
              <span className="sm:hidden">LOGOUT</span>
            </button>
          </div>
        </header>

        {/* Child Router Content Wrapper */}
        <main className="flex-1 p-6 lg:p-10 flex flex-col gap-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
