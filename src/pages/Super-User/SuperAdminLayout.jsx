import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import SuperAdminSidebar from '../../components/Super-User/SuperAdminSidebar';
import { Menu } from 'lucide-react';

export default function SuperAdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [headerDetails, setHeaderDetails] = useState({ title: '', subtitle: null });

  return (
    <div className="flex flex-col min-h-screen bg-[#eae3c1] text-[#152f16] font-sans">

      {/* Mobile Drawer Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 1: Unified Top Header/Navbar (Full Width) */}
      <header className="bg-transparent px-3 sm:px-6 lg:px-0 py-3 sm:py-4 lg:py-6 flex items-center justify-between shrink-0 min-h-[64px] lg:min-h-[96px] w-full z-30 max-w-full overflow-hidden">

        {/* Left Side: Hamburger on mobile, Logo on desktop */}
        <div className="flex items-center gap-2 sm:gap-3 lg:w-72 lg:shrink-0 min-w-0">
          {/* Mobile Menu Button (Hamburger) */}
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg border border-[#c8c2a3] bg-[#efeacb] text-[#152f16] hover:bg-[#eae3c1] transition cursor-pointer shrink-0"
          >
            <Menu size={22} />
          </button>

          {/* Desktop Logo */}
          <div className="hidden lg:flex items-center justify-center w-72 h-full py-1">
            <img src="/Nexus_superadmin.png" alt="Nexus Logo" className="h-28 w-auto object-contain" />
          </div>

          {/* Mobile Title */}
          <span className="lg:hidden font-serif font-black text-[#0c3818] tracking-tight text-xs sm:text-sm truncate max-w-[110px] sm:max-w-none">
            NEXUS SUPERADMIN
          </span>
        </div>

        {/* Center: Page Title & Subtitle (centered horizontally on desktop) */}
        <div className="hidden lg:flex flex-col items-center justify-center text-center flex-1">
          <h1 className="text-3xl lg:text-[40px] 2xl:text-[44px] font-black tracking-tight text-[#152f16] leading-none mb-1">
            {headerDetails.title}
          </h1>
          {headerDetails.subtitle && (
            <div className="text-xs sm:text-sm text-[#55694a] font-semibold mt-1 flex items-center justify-center gap-2">
              {headerDetails.subtitle}
            </div>
          )}
        </div>

        {/* Right Side Spacer on Desktop */}
        <div className="hidden lg:block lg:w-72 lg:shrink-0" />

        {/* Mobile View Page Title Indicator */}
        {headerDetails.title && (
          <div className="lg:hidden font-extrabold text-xs text-[#152f16]/90 px-2.5 py-1 bg-[#efeacb] rounded-lg border border-[#0c3818]/15 truncate max-w-[130px] sm:max-w-[200px] shrink-0 ml-2">
            {headerDetails.title}
          </div>
        )}
      </header>

      {/* Bottom Container: Splits into Sidebar (2) and Main Content (3) */}
      <div className="flex-1 flex min-h-0 relative">
        {/* 2: Sidebar Component */}
        <SuperAdminSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* 3: Main Content Area */}
        <main className="flex-1 px-5 py-1 flex flex-col gap-8 overflow-y-auto min-w-0">
          <Outlet context={{ setHeaderDetails }} />
        </main>
      </div>
    </div>
  );
}
