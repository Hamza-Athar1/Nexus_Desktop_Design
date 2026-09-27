import React from 'react';
import { ArrowLeft, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Common Floating Sidebar Panel Container for Nexus Desktop
 * 
 * Provides:
 * 1. Modern Floating Panel aesthetic (rounded corners, subtle margin & border, gentle elevation)
 * 2. Dedicated Logo / Branding Header with subtle theme-aware divider
 * 3. Fixed Top & Bottom regions with scrollable middle navigation content
 * 4. Theme-aware colors derived from --color-primary and theme system
 */
export function SidebarContainer({ isOpen, children, logoSrc = "/Nexus_superadmin.png", brandName = "Nexus Desktop", roleTag }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <aside
      className={`fixed lg:static inset-y-0 left-0 z-50 w-72 flex flex-col shrink-0 transition-all duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      <div 
        className="flex-1 m-3 lg:m-4 lg:mr-2 rounded-2xl flex flex-col overflow-hidden shadow-lg border border-black/10 transition-colors duration-300"
        style={{ backgroundColor: 'var(--color-primary, #0c3818)' }}
      >
        {/* BRANDING / LOGO HEADER */}
        <div className="p-4 sm:p-5 flex flex-col items-center justify-center shrink-0 border-b border-white/10 bg-black/10 select-none">
          <img
            src={logoSrc}
            alt={brandName}
            className="h-14 sm:h-16 w-auto object-contain transition-transform duration-300 hover:scale-105"
          />
          <div className="mt-2 text-center">
            <h2 className="text-sm font-extrabold tracking-wider text-[#efeacb] uppercase font-mono">
              {brandName}
            </h2>
            {roleTag && (
              <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/15 text-[#a2bc90]">
                {roleTag}
              </span>
            )}
          </div>
        </div>

        {/* TOP ACTIONS (e.g. Go Back button) */}
        <div className="px-4 pt-4 pb-2 shrink-0 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl border border-[#efeacb]/15 bg-[#efeacb]/10 text-[#a2bc90] hover:text-[#efeacb] hover:bg-[#efeacb]/20 transition-all duration-200 cursor-pointer text-xs font-bold uppercase tracking-wider hover:-translate-x-0.5 active:scale-[0.98] select-none"
          >
            <ArrowLeft size={14} />
            <span>Go Back</span>
          </button>
        </div>

        {/* MIDDLE SCROLLABLE NAVIGATION CONTENT */}
        <div className="flex-1 px-3 py-2 overflow-y-auto custom-scrollbar flex flex-col gap-4">
          {children}
        </div>

        {/* BOTTOM ACCOUNT / SYSTEM ACTIONS */}
        <div className="p-3 shrink-0 border-t border-white/10 bg-black/10">
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition duration-200 text-[#f4a98a] hover:bg-red-950/40 hover:text-[#f9c4af] active:scale-[0.98] cursor-pointer text-xs font-bold tracking-wide"
          >
            <LogOut size={18} className="text-[#f4a98a] shrink-0" />
            <span>Logout Account</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

/**
 * Logical Nav Section Header
 */
export function NavSectionGroup({ title, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      {title && (
        <span className="px-3 text-[11px] font-bold uppercase tracking-wider text-[#a2bc90]/70 select-none">
          {title}
        </span>
      )}
      <div className="flex flex-col gap-1">
        {children}
      </div>
    </div>
  );
}

/**
 * Unified Navigation Item with Pill Indicator and Theme Active State
 */
export function NavItem({ icon: Icon, label, active, onClick, badgeCount, badgeBgClass }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all duration-200 cursor-pointer relative group ${
        active
          ? 'bg-[#efeacb] text-[#0c3818] font-bold shadow-sm pl-4'
          : 'text-[#a2bc90] hover:bg-white/10 hover:text-[#efeacb]'
      }`}
    >
      {/* Active Left Pill Indicator */}
      {active && (
        <span className="absolute left-1 top-2 bottom-2 w-1 rounded-full bg-[#0c3818]" />
      )}

      <div className="flex items-center gap-3 min-w-0">
        <Icon size={19} className={`shrink-0 transition-colors ${active ? 'text-[#0c3818]' : 'text-[#a2bc90] group-hover:text-[#efeacb]'}`} />
        <span className="text-xs sm:text-sm tracking-wide truncate">{label}</span>
      </div>

      {typeof badgeCount === 'number' && badgeCount > 0 && (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
          active
            ? 'bg-[#0c3818] text-[#efeacb]'
            : badgeBgClass || 'bg-amber-500 text-black'
        }`}>
          {badgeCount}
        </span>
      )}
    </button>
  );
}
