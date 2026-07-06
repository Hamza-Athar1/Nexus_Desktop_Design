import { useState } from 'react';
import {
  BarChart2, FileText, Calendar, Download, Filter, Menu
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import UserSidebar from '../../components/UserSidebar';

function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] font-bold tracking-[0.12em] text-[#123e20] uppercase">{children}</span>
      <div className="flex-1 h-px bg-emerald-400/10" />
    </div>
  );
}

function StatTile({ title, value }) {
  return (
    <div className="flex-1 bg-[#0d3b15]/95 border border-emerald-500/20 rounded-2xl p-4 flex flex-col gap-2">
      <span className="text-[10px] font-bold text-emerald-300/80 uppercase">{title}</span>
      <div className="text-2xl font-black text-[#f7f4d9]">{value}</div>
    </div>
  );
}

export default function ReportsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('reports');
  const [range, setRange] = useState('30d');

  const mockReports = [
    { id: 1, name: 'Daily Sales', date: '2026-07-01', size: '24 KB' },
    { id: 2, name: 'Inventory Valuation', date: '2026-06-29', size: '48 KB' },
    { id: 3, name: 'Tax Summary', date: '2026-06-28', size: '12 KB' },
  ];

  const chartData = [
    { name: 'Day 1', sales: 4000 },
    { name: 'Day 2', sales: 3000 },
    { name: 'Day 3', sales: 2000 },
    { name: 'Day 4', sales: 2780 },
    { name: 'Day 5', sales: 1890 },
    { name: 'Day 6', sales: 2390 },
    { name: 'Day 7', sales: 3490 },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f1e8c4] font-inter">
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <UserSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activeNav={activeNav} onNavChange={(id) => { setActiveNav(id); setSidebarOpen(false); }} />

      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-4 sm:px-6 h-15 shrink-0 bg-[#0c3410] border-b border-emerald-500/15">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-[#d9ddc4] hover:text-[#f7f4d8]">
              <Menu size={22} />
            </button>
            <div className="text-[#e5e1c0] text-[10px] font-bold tracking-[0.18em] uppercase">USER-DASHBOARD</div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#356837]/15 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              <span className="text-xs text-emerald-300 font-semibold">Online</span>
            </div>
            <div className="w-8.5 h-8.5 rounded-full bg-linear-to-br from-[#1d5e2f] to-[#114923] border-2 border-emerald-500/20 flex items-center justify-center text-xs font-bold text-[#f6f1d4]">AK</div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7 flex flex-col gap-4 sm:gap-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-[28px] font-black text-[#123e20] mb-1.5">Reports</h1>
              <p className="text-xs text-[#41603d] m-0">Analytics and exports for your store</p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-[#eaf1ce] rounded-lg p-2 border border-[#d8c98c] flex-1">
                <select value={range} onChange={(e) => setRange(e.target.value)} className="w-full sm:w-auto flex-1 bg-transparent outline-none text-sm text-[#163d15]">
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                </select>
                <button className="w-full sm:w-auto px-3 py-2 rounded-md bg-[#1a3d1a] text-[#e4ecba] flex items-center justify-center gap-2"><Filter size={14} /> Filter</button>
              </div>
              <button className="w-full sm:w-auto px-3 py-2 rounded-lg bg-[#1a3d1a] text-[#e4ecba] flex items-center justify-center gap-2"><Download size={14} /> Export</button>
            </div>
          </div>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 flex flex-col gap-4">
              <SectionLabel>Overview</SectionLabel>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <StatTile title="Total Sales" value="Rs 124,800" />
                <StatTile title="Bills" value="1,240" />
                <StatTile title="Avg. Order" value="Rs 100" />
              </div>

              <div className="mt-2 bg-[#0f3d13]/90 border border-emerald-500/20 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-emerald-300">
                    <BarChart2 size={16} />
                    <span className="text-[10px] font-bold uppercase">Sales chart</span>
                  </div>
                  <div className="text-[11px] text-[#b9c595]">{range === '7d' ? 'Last 7 days' : range === '30d' ? 'Last 30 days' : 'Last 90 days'}</div>
                </div>
                <div className="rounded-lg bg-white/5 p-2">
                  <div className="h-40 sm:h-56 md:h-64 lg:h-56">
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#0b2a11" />
                      <XAxis dataKey="name" stroke="#cfe3b8" />
                      <YAxis stroke="#cfe3b8" />
                      <Tooltip contentStyle={{ background: '#0b2a11', border: 'none', color: '#cfe3b8' }} />
                      <Legend />
                      <Bar dataKey="sales" fill="#4ade80" />
                    </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            <aside className="flex flex-col gap-4">
              <div className="bg-[#eaf1ce] rounded-2xl p-4 border border-[#d8c98c]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-[#163d15]">Saved Reports</span>
                  <button className="text-sm text-[#1a3d1a] font-bold">New</button>
                </div>
                <ul className="flex flex-col gap-2">
                  {mockReports.map(r => (
                    <li key={r.id} className="flex items-center justify-between text-sm text-[#163d15] gap-2">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-[#1a3d1a]" />
                        <div>
                          <div className="font-bold">{r.name}</div>
                          <div className="text-[12px] text-[#6a8f4b]">{r.date} · {r.size}</div>
                        </div>
                      </div>
                      <button className="text-sm text-[#163d15] bg-[#f3edc7] px-2 py-1 rounded-md sm:px-3 sm:py-1">Download</button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#0f3d13]/90 border border-emerald-500/20 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar size={14} className="text-emerald-300" />
                  <span className="text-[10px] font-bold tracking-[0.12em] text-emerald-300/80 uppercase">Quick Exports</span>
                </div>
                <div className="grid gap-2">
                  <button className="w-full rounded-lg bg-gradient-to-b from-[#15421b] to-[#103616] py-3 text-[13px] font-bold text-[#f3efcf] shadow-sm border border-emerald-600/20 hover:from-[#1b5d24] hover:to-[#14421a] transition-colors">
                    Export Sales CSV
                  </button>
                  <button className="w-full rounded-lg bg-transparent py-3 text-[13px] font-bold text-[#bcd59a] border border-emerald-400/20 hover:bg-white/2 transition-colors">
                    Export Inventory
                  </button>
                </div>
              </div>
            </aside>
          </section>
        </main>
      </div>
    </div>
  );
}
