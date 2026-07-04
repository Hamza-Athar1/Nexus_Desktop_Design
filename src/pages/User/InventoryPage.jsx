import { useMemo, useState } from 'react';
import {
  Search,
  Upload,
  Plus,
  Edit2,
  Trash,
  ChevronDown,
  Menu,
  AlertTriangle,
} from 'lucide-react';
import UserSidebar from '../../components/UserSidebar';

const PRODUCTS = [
  { id: 1, name: 'Panadol 500mg', price: 45, stock: 240, cat: 'Painkillers', detail: 'Strip of 10' },
  { id: 2, name: 'Augmentin 625mg', price: 320, stock: 3, cat: 'Antibiotics', detail: 'Strip of 7' },
  { id: 3, name: 'Vitamin C 500mg', price: 350, stock: 8, cat: 'Vitamins', detail: 'Bottle 60 tabs' },
  { id: 4, name: 'ORS Sachet', price: 80, stock: 12, cat: 'Rehydration', detail: 'Pack of 5' },
];

function CategoryPill({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(label)}
      className={`cursor-pointer rounded-full border px-4.5 py-1.5 text-[13px] font-semibold transition-all duration-150 ${
        active ? 'border-[#3b7a3b] bg-[#c8d49a] text-[#0f2f10]' : 'border-[#c8d49a] bg-transparent text-[#3a5a2a]'
      }`}
    >
      {label}
    </button>
  );
}

export default function InventoryPage() {
  const [activeNav, setActiveNav] = useState('inventory');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');

  const categories = useMemo(() => ['All', ...Array.from(new Set(PRODUCTS.map((p) => p.cat)))], []);

  const filtered = useMemo(
    () =>
      PRODUCTS.filter(
        (p) => (category === 'All' || p.cat === category) && p.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [category, query],
  );

  const totalItems = PRODUCTS.length;
  const lowStock = PRODUCTS.filter((p) => p.stock > 0 && p.stock <= 10).length;
  const outStock = PRODUCTS.filter((p) => p.stock === 0).length;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f1e8c4] font-[Inter,sans-serif]">
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <UserSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeNav={activeNav}
        onNavChange={(id) => {
          setActiveNav(id);
          setSidebarOpen(false);
        }}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-13.5 shrink-0 items-center justify-between gap-2 border-b border-emerald-500/15 bg-[#0c3410] px-3 sm:gap-4 sm:px-5">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button type="button" onClick={() => setSidebarOpen(true)} className="shrink-0 rounded p-1 text-[#c8d898] lg:hidden" aria-label="Open menu">
              <Menu size={20} />
            </button>
            <div className="flex min-w-0 items-center gap-1.5 overflow-hidden sm:gap-2">
              <span className="hidden whitespace-nowrap text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#efe9c4] sm:block">USER-DASHBOARD</span>
              <span className="hidden text-[14px] text-[#6ab850] sm:block">/</span>
              <span className="truncate text-[11px] font-semibold uppercase tracking-[0.04em] text-[#d8e0b4]">Inventory - Pharmacy</span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#d8e0b4]">
              <span className="inline-block h-2 w-2 rounded-full bg-[#5dd456] shadow-[0_0_6px_#5dd456]" />
              <span className="hidden sm:inline">Online</span>
            </div>

            <button type="button" className="hidden whitespace-nowrap rounded-full border border-white/20 bg-transparent px-3.5 py-1.5 text-[12px] font-semibold text-[#e8e4b8] md:block">
              Pharmacy Module
            </button>

            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[rgba(110,185,80,0.3)] bg-[#1f491d] text-[11px] font-extrabold text-[#e8f2d8]">AK</div>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 gap-3 overflow-hidden p-3 sm:p-4">
          <div className="flex min-w-0 flex-1 flex-col gap-4 overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-extrabold text-[#163d15]">Inventory</h2>
                <p className="mt-1 text-sm text-[#6a8f4b]">{totalItems.toLocaleString()} total items · {lowStock} low stock</p>
              </div>

              <div className="flex items-center gap-3">
                <button type="button" className="flex items-center gap-2 rounded-lg border border-[#c4d094] bg-[#e4ecba] px-4 py-2 text-[13px] font-bold text-[#1a3a1a]">
                  <Upload size={14} /> Export
                </button>
                <button type="button" className="flex items-center gap-2 rounded-lg bg-[#1a3d1a] px-4 py-2 text-[13px] font-bold text-[#e4ecba]">
                  <Plus size={14} /> Add item
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="rounded-lg bg-[#163d15] p-4 text-[#eaf7d9] shadow-sm">
                <p className="text-[11px] font-bold uppercase text-[#cfe3b8]">Total Items</p>
                <p className="mt-2 text-2xl font-extrabold">{totalItems}</p>
              </div>
              <div className="rounded-lg bg-[#163d15] p-4 text-[#eaf7d9] shadow-sm">
                <p className="text-[11px] font-bold uppercase text-[#cfe3b8]">Categories</p>
                <p className="mt-2 text-2xl font-extrabold">{categories.length - 1}</p>
              </div>
              <div className="rounded-lg bg-[#163d15] p-4 text-[#eaf7d9] shadow-sm">
                <p className="text-[11px] font-bold uppercase text-[#cfe3b8]">Low Stock</p>
                <p className="mt-2 text-2xl font-extrabold">{lowStock}</p>
              </div>
              <div className="rounded-lg bg-[#7a1a1a] p-4 text-[#ffdcdc] shadow-sm">
                <p className="text-[11px] font-bold uppercase text-[#ffdcdc]">Out of Stock</p>
                <p className="mt-2 text-2xl font-extrabold">{outStock}</p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="flex-1 rounded-full border border-[#c4d094] bg-[#f7f1c8] px-4 py-2 flex items-center gap-3">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  type="text"
                  placeholder="Search product by name"
                  className="min-w-0 flex-1 bg-transparent text-[13px] text-[#1a3a1a] outline-none"
                />
                <Search size={16} className="text-[#5a7a45]" />
              </div>

              <div className="hidden sm:flex items-center gap-2">
                <button type="button" className="rounded-full border border-[#c8d49a] bg-transparent px-3 py-1 text-[12px] font-bold text-[#1a3a1a]">ALL</button>
                <button type="button" className="rounded-full border border-[#c8d49a] bg-transparent px-3 py-1 text-[12px] font-bold text-[#1a3a1a]">Low Stock</button>
                <button type="button" className="rounded-full border border-[#c8d49a] bg-transparent px-3 py-1 text-[12px] font-bold text-[#1a3a1a]">Out of Stock</button>
                <button type="button" className="rounded-full border border-[#c8d49a] bg-transparent px-3 py-1 text-[12px] font-bold text-[#1a3a1a]">Category</button>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-[#163d15] p-4 shadow-[0_20px_40px_rgba(15,55,25,0.08)]">
              <div className="overflow-x-auto rounded-lg bg-[#113d1a] p-1">
                <table className="w-full table-auto text-left">
                  <thead>
                    <tr className="bg-[#2f7f38] text-[13px] text-white">
                      <th className="px-6 py-3">Product</th>
                      <th className="px-6 py-3">Category</th>
                      <th className="px-6 py-3">Price</th>
                      <th className="px-6 py-3">Stock</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p) => (
                      <tr key={p.id} className="border-t border-[#274c26] bg-[#113d1a]">
                        <td className="px-6 py-4 text-[14px] font-semibold text-[#e8f0d0]">{p.name}</td>
                        <td className="px-6 py-4 text-[13px] text-[#9fc07a]">{p.cat}</td>
                        <td className="px-6 py-4 text-[13px] text-[#f0f5d8]">Rs {p.price}</td>
                        <td className={`px-4 sm:px-6 py-4 text-[13px] ${p.stock <= 10 ? 'text-[#f87171]' : 'text-[#88bb70]'}`}>{p.stock}</td>
                        <td className="px-4 sm:px-6 py-4">
                          {p.stock === 0 ? (
                            <span className="rounded-full bg-[#7a1a1a] px-3 py-1 text-[12px] font-bold text-[#ffdcdc]">Out of Stock</span>
                          ) : p.stock <= 10 ? (
                            <span className="rounded-full bg-[#f87171] px-3 py-1 text-[12px] font-bold text-white">Low Stock</span>
                          ) : (
                            <span className="rounded-full bg-[#e6f6df] px-3 py-1 text-[12px] font-bold text-[#1a3a1a]">In Stock</span>
                          )}
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button type="button" className="rounded-md border border-[#bcd89b] bg-transparent p-2 text-[#e8f0d0]">
                              <Edit2 size={14} />
                            </button>
                            <button type="button" className="rounded-md border border-[#f3b0a0] bg-transparent p-2 text-[#ffdcdc]">
                              <Trash size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <aside className="hidden w-59.5 shrink-0 flex-col overflow-y-auto rounded-[20px] border border-[#d8c98c] bg-[#f3edc7] p-4.5 lg:flex">
            <div className="mb-3 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#e8f0d0]" />
              <div>
                <p className="m-0 text-[12px] font-extrabold text-[#1a3a1a]">Summary</p>
                <p className="m-0 text-[12px] text-[#7a9a65]">Overview of inventory</p>
              </div>
            </div>

            <div className="mb-3 grid grid-cols-2 gap-2">
              <div className="rounded-[10px] border border-[#c8d49a] bg-[#eaf1ce] p-3">
                <p className="text-[11px] text-[#6a8f4b]">Total Items</p>
                <p className="text-[18px] font-extrabold text-[#1a3a1a]">{totalItems}</p>
              </div>
              <div className="rounded-[10px] border border-[#c8d49a] bg-[#eaf1ce] p-3">
                <p className="text-[11px] text-[#6a8f4b]">Categories</p>
                <p className="text-[18px] font-extrabold text-[#1a3a1a]">{categories.length - 1}</p>
              </div>
              <div className="rounded-[10px] border border-[#c8d49a] bg-[#eaf1ce] p-3">
                <p className="text-[11px] text-[#6a8f4b]">Low Stock</p>
                <p className="text-[18px] font-extrabold text-[#1a3a1a]">{lowStock}</p>
              </div>
              <div className="rounded-[10px] border border-[#c8d49a] bg-[#eaf1ce] p-3">
                <p className="text-[11px] text-[#6a8f4b]">Out of Stock</p>
                <p className="text-[18px] font-extrabold text-[#1a3a1a]">{outStock}</p>
              </div>
            </div>

            <div className="mt-auto">
              <button type="button" className="w-full rounded-xl border-none bg-[#1a3a1a] px-0 py-3 text-[13px] font-extrabold text-[#e4ecba]">Manage Items</button>
            </div>
          </aside>

          {/* Mobile summary bar */}
          <div className="fixed bottom-4 left-4 right-4 z-50 lg:hidden">
            <div className="flex items-center justify-between gap-3 rounded-full bg-[#1a3a1a] p-3 shadow-lg">
              <div className="text-sm font-bold text-[#e4ecba]">Total: Rs {filtered.reduce((s,p)=>s + p.price,0)}</div>
              <button className="rounded-full bg-[#6ab850] px-4 py-2 text-sm font-bold text-white">View</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
