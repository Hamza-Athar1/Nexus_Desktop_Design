import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import SuperAdminSidebar from '../../components/Super-User/SuperAdminSidebar';
import { Menu } from 'lucide-react';

export default function SuperAdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#eae3c1] text-[#152f16] font-sans">
      {/* Mobile Drawer Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Component */}
      <SuperAdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden p-6 lg:p-10">
        {/* Mobile Header Top-Bar */}
        <header className="lg:hidden flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-lg border border-[#c8c2a3] bg-[#efeacb] text-[#152f16] hover:bg-[#eae3c1] transition"
          >
            <Menu size={24} />
          </button>
          <span className="font-serif font-black text-[#0c3818] tracking-wider text-sm">
            NEXUS DESKTOP
          </span>
        </header>

        <Outlet />
      </div>
    </div>
  );
}
