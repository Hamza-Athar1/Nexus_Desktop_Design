import { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  FileText,
  Server,
  Sparkles,
  ShieldCheck,
  Settings,
  Bell,
  Menu,
  X,
} from 'lucide-react';
import NexusLogo from '../../components/NexusLogo';

const NAV_MAIN = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'users', label: 'All Users', icon: Users },
  { id: 'logs', label: 'System logs', icon: FileText },
  { id: 'backend', label: 'Backened', icon: Server },
  { id: 'updates', label: 'Updates', icon: Sparkles },
  { id: 'modules', label: 'Modules', icon: LayoutDashboard },
];

const NAV_ACCOUNT = [
  { id: 'security', label: 'Security', icon: ShieldCheck },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const SUMMARY_CARDS = [
  {
    id: 'uptime',
    title: 'Server Uptime',
    value: '99.9%',
    sub: 'All systems nominal',
  },
  {
    id: 'active',
    title: 'Active Modules',
    value: '7',
    sub: '1 update pending',
  },
  {
    id: 'revenue',
    title: 'Platform Revenue',
    value: 'Rs 18.4M',
    sub: '14% vs last month',
  },
  {
    id: 'errors',
    title: 'System Errors',
    value: '2',
    sub: 'ACTION REQUIRED',
    highlight: true,
  },
];

const APPROVAL_QUEUE = [
  {
    id: 1,
    module: 'Pharmacy',
    users: 84,
    version: 'v2.4.1',
    status: 'Live',
    action: 'Update',
    badge: 'bg-[#1f621f] text-[#d4f1c4] border border-[#6cb56f]/40',
    actionClass: 'bg-[#d7eaba] text-[#1f4d1f] border border-[#c7d59f] hover:bg-[#e7f2c8]',
  },
  {
    id: 2,
    module: 'Grocery',
    users: 62,
    version: 'v2.4.1',
    status: 'Live',
    action: 'Update',
    badge: 'bg-[#1f621f] text-[#d4f1c4] border border-[#6cb56f]/40',
    actionClass: 'bg-[#d7eaba] text-[#1f4d1f] border border-[#c7d59f] hover:bg-[#e7f2c8]',
  },
  {
    id: 3,
    module: 'Clothing',
    users: 38,
    version: 'v2.5.0',
    status: 'Update',
    action: 'Deploy',
    badge: 'bg-[#e7ca5f] text-[#1f3f1a] border border-[#d4b56c]/30',
    actionClass: 'bg-[#1e5b24] text-[#d8e8c3] border border-[#4e8a4d]/30 hover:bg-[#27622d]',
  },
];

const SYSTEM_LOGS = [
  {
    title: 'System Logs',
    entries: [
      { label: 'Module Clothing v2.5.0 uploaded', time: '10m' },
      { label: 'DB backup completed', time: '3h' },
      { label: 'API timeout - endpoint', time: '1h' },
    ],
  },
  {
    title: 'System Logs',
    entries: [
      { label: 'API server', status: 'Online', statusColor: 'text-emerald-300' },
      { label: 'Database', status: 'Online', statusColor: 'text-emerald-300' },
      { label: 'Backup server', status: 'Syncing', statusColor: 'text-amber-300' },
    ],
  },
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAYS = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday',
  'Thursday', 'Friday', 'Saturday',
];


function StatCard({ title, value, sub, highlight }) {
  const baseStyles = highlight
    ? 'bg-[#1d4014]/95 border border-amber-400/20 text-[#f5e8ac]'
    : 'bg-[#143818]/90 border border-emerald-500/20 text-[#e9f0d1]';

  return (
    <div className={`rounded-[30px] p-5 shadow-[0_20px_45px_rgba(22,53,20,0.1)] ${baseStyles}`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#cbd1b4]">{title}</span>
      </div>
      <p className="text-[32px] sm:text-[36px] font-black leading-none mb-3">{value}</p>
      <p className={`text-sm font-semibold ${highlight ? 'text-[#f8da79]' : 'text-[#b9c7a0]'}`}>{sub}</p>
    </div>
  );
}

function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition ${active ? 'bg-[#f4f0cc] text-[#153216]' : 'text-[#d7e0b8] hover:bg-[#c7d4a4]/20'
        }`}
    >
      <Icon size={16} className={active ? 'text-[#153216]' : 'text-[#c7d4a6]'} />
      <span className="font-semibold text-sm">{label}</span>
    </button>
  );
}

function QueueRow({ row }) {
  return (
    <div className="grid grid-cols-[1.4fr_0.65fr_0.65fr_0.85fr_0.85fr] gap-2 px-4 py-3.5 items-center text-sm text-[#eef7dc] bg-[#16390f] border-b border-[#70a85d]/10 last:border-b-0">
      <span className="font-medium text-[#f4f9e4]">{row.module}</span>
      <span className="text-[#c4d6ab]/90">{row.users}</span>
      <span className={`text-sm font-semibold ${row.version === 'v2.5.0' ? 'text-[#f0c444]' : 'text-[#c4d6ab]/90'}`}>{row.version}</span>
      <div className="flex justify-center">
        <span className={`inline-flex justify-center rounded-full px-3 py-1 text-[11px] font-semibold ${row.badge}`}>{row.status}</span>
      </div>
      <div className="flex justify-center">
        <button className={`inline-flex justify-center rounded-full px-4 py-1.5 text-[12px] font-semibold ${row.actionClass}`}>
          {row.action}
        </button>
      </div>
    </div>
  );
}

function LogCard({ title, entries }) {
  return (
    <div className="rounded-[30px] bg-[#0c3310]/95 border border-emerald-500/15 p-5 shadow-[0_18px_40px_rgba(16,50,16,0.12)]">
      <p className="text-[10px] uppercase tracking-[0.22em] font-bold text-[#b5c69c] mb-4">{title}</p>
      <div className="space-y-3">
        {entries.map((entry, index) => (
          <div key={index} className="flex items-center justify-between text-sm text-[#d7e2bb]">
            <span className="flex-1 pr-3">{entry.label}</span>
            {entry.time ? (
              <span className="text-[11px] text-[#aebd90]/90">{entry.time}</span>
            ) : (
              <span className={`${entry.statusColor} text-[11px] font-semibold`}>{entry.status}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SuperAdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const now = new Date();
  const dateStr = `${DAYS[now.getDay()]} · ${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`;

  return (
    <div className="flex min-h-screen overflow-hidden bg-[#e7e4c1] text-[#142e16]">
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#143913] border-r border-[#356028]/40 p-5 transition-transform duration-300 lg:static ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <NexusLogo size={28} variant="light" />
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] font-bold text-[#e8e2b4]">Super Admin</p>
              <p className="text-[11px] text-[#c9d5ad]">Dashboard</p>
            </div>
          </div>
          <button className="lg:hidden text-[#cfd9b6] hover:text-[#f2f2d1]" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3">
          <p className="text-[9px] uppercase tracking-[0.22em] font-bold text-[#b2c18f]">Main</p>
          {NAV_MAIN.map((item) => (
            <NavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={activeTab === item.id}
              onClick={() => setActiveTab(item.id)}
            />
          ))}

          <p className="mt-6 text-[9px] uppercase tracking-[0.22em] font-bold text-[#b2c18f]">Account</p>
          {NAV_ACCOUNT.map((item) => (
            <NavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={activeTab === item.id}
              onClick={() => setActiveTab(item.id)}
            />
          ))}
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="flex items-center justify-between gap-2 sm:gap-4 px-4 sm:px-5 py-3 sm:py-4 bg-[#1d490f] border-b border-[#456d2a] shadow-[0_8px_20px_rgba(15,44,15,0.15)] text-[#f1f4d6]">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button className="lg:hidden shrink-0 text-[#c7d6a7] hover:text-[#edf6d8]" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={22} />
            </button>
            <div className="hidden sm:block rounded-full bg-[#1a4212]/90 px-3 sm:px-4 py-2 text-[10px] uppercase tracking-[0.18em] sm:tracking-[0.24em] font-bold border border-[#84c55f]/20 whitespace-nowrap">
              <span className="hidden lg:inline">SUPER ADMIN-DASHBOARD</span>
              <span className="lg:hidden">SUPER ADMIN</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button className="rounded-full bg-[#204917]/90 p-2.5 sm:p-3 text-[#e6f1d8] hover:bg-[#2d5c22] transition-colors">
              <Bell size={17} />
            </button>
            <button
              title="Backend access"
              className="rounded-full bg-[#f1eab5] px-2.5 sm:px-4 py-2 text-sm font-semibold text-[#22511d] border border-[#c8c27d] hover:bg-[#e5dfa0] transition-colors flex items-center gap-2"
            >
              <Server size={14} className="shrink-0" />
              <span className="hidden sm:inline">Backend access</span>
            </button>
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-[#254e1c] border-2 border-[#89d267]/30 text-[11px] font-bold text-[#f7f7db] shrink-0">
              AZ
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-5 sm:p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-[30px] sm:text-[36px] lg:text-[42px] font-black text-[#152f16] leading-tight">
                Welcome, Aiesha
              </h1>
              <p className="mt-2 text-sm text-[#3f582f]">System analytics · {dateStr}</p>
            </div>
            <button className="rounded-full border border-[#8aa75b] bg-[#f4ecc0] px-5 py-2 text-sm font-semibold text-[#1f401f] shadow-sm hover:bg-[#ede5af] transition-colors">
              All system nominal
            </button>
          </div>

          <section className="grid grid-cols-1 gap-4 xl:grid-cols-4 mb-6">
            {SUMMARY_CARDS.map((card) => (
              <StatCard key={card.id} title={card.title} value={card.value} sub={card.sub} highlight={card.highlight} />
            ))}
          </section>

          <section className="rounded-[36px] bg-[#f1edc8] border border-[#d6d1a1] p-5 shadow-[0_20px_60px_rgba(41,80,32,0.08)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-5">
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] font-bold text-[#657a4f] mb-2">Approval Queue</p>
                <h2 className="text-xl font-black text-[#194118]">Module updates awaiting review</h2>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-[#2f4f2e]">
                <span className="inline-flex items-center rounded-full bg-[#ecf3d0] px-3 py-2 font-semibold border border-[#c9d9a4]">7 modules active</span>
                <span className="inline-flex items-center rounded-full bg-[#eef3d3] px-3 py-2 font-semibold border border-[#d6dcb0]">2 actions pending</span>
              </div>
            </div>

            <div className="hidden lg:block rounded-[28px] overflow-hidden border border-[#acc285]/20">
              <div className="grid grid-cols-[1.4fr_0.65fr_0.65fr_0.85fr_0.85fr] gap-2 px-4 py-3 bg-[#2f7c2c] text-[10px] uppercase tracking-[0.22em] font-bold text-[#eef8e5]">
                <span>Module</span>
                <span>Users</span>
                <span>Version</span>
                <span className="text-center">Status</span>
                <span className="text-center">Action</span>
              </div>
              {APPROVAL_QUEUE.map((row) => (
                <QueueRow key={row.id} row={row} />
              ))}
            </div>

            <div className="lg:hidden space-y-4">
              {APPROVAL_QUEUE.map((row) => (
                <div key={row.id} className="rounded-[30px] border border-[#8db26d]/20 bg-[#152d12] p-4 text-[#e5edcd] shadow-[0_12px_30px_rgba(16,45,15,0.15)]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-[#f4f9e4]">{row.module}</span>
                    <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${row.badge}`}>{row.status}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm text-[#c7d2a8]">
                    <div className="rounded-2xl bg-[#193412]/80 p-3">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-[#97ad7b]">Users</p>
                      <p className="font-bold text-[#eef3d0]">{row.users}</p>
                    </div>
                    <div className="rounded-2xl bg-[#193412]/80 p-3">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-[#97ad7b]">Version</p>
                      <p className={`font-bold ${row.version === 'v2.5.0' ? 'text-[#f4cc3e]' : 'text-[#eef3d0]'}`}>{row.version}</p>
                    </div>
                  </div>
                  <button className={`mt-4 w-full rounded-full px-4 py-2 text-sm font-semibold transition-colors ${row.actionClass}`}>
                    {row.action}
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-4 mt-6">
            {SYSTEM_LOGS.map((card, index) => (
              <LogCard key={index} title={card.title} entries={card.entries} />
            ))}
          </section>
        </main>
      </div>
    </div>
  );
}
