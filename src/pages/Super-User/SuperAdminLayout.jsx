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
      <header className="bg-transparent px-6 lg:px-0 py-4 lg:py-6 flex items-center justify-between shrink-0 min-h-[72px] lg:min-h-[96px] w-full z-30">

        {/* Left Side: Hamburger on mobile, Logo on desktop */}
        <div className="flex items-center lg:w-72 lg:shrink-0">
          {/* Mobile Menu Button (Hamburger) */}
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg border border-[#c8c2a3] bg-[#efeacb] text-[#152f16] hover:bg-[#eae3c1] transition cursor-pointer mr-4"
          >
            <Menu size={24} />
          </button>

          {/* Desktop Logo (exactly as wide as the sidebar) */}
          <div className="hidden lg:flex items-center justify-center w-72 h-full py-1">
            <img src="/Nexus_superadmin.png" alt="Nexus Logo" className="h-28 w-auto object-contain" />
          </div>

          {/* Mobile Title */}
          <span className="lg:hidden font-serif font-black text-[#0c3818] tracking-wider text-sm">
            NEXUS DESKTOP
          </span>
        </div>

        {/* Center: Page Title & Subtitle (centered horizontally on desktop) */}
        <div className="hidden lg:flex flex-col items-center justify-center text-center flex-1">
          <h1 className="text-4xl lg:text-[44px] font-black tracking-tight text-[#152f16] leading-none mb-1">
            {headerDetails.title}
          </h1>
          {headerDetails.subtitle && (
            <div className="text-xs sm:text-sm text-[#55694a] font-semibold mt-2 flex items-center justify-center gap-2">
              {headerDetails.subtitle}
            </div>
          )}
        </div>

        {/* Right Side: Spacer on desktop to balance out the logo and keep center title centered */}
        <div className="hidden lg:block lg:w-72 lg:shrink-0" />

        {/* Mobile View Page Title Indicator */}
        <div className="lg:hidden font-extrabold text-sm text-[#152f16]/80 px-3 py-1 bg-[#efeacb]/50 rounded-lg border border-[#0c3818]/10">
          {headerDetails.title}
        </div>
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
