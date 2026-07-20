import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Upload,
  Plus,
  Edit2,
  Trash2,
  ScanLine,
  Menu,
} from 'lucide-react';
import UserSidebar from '../../../components/User/UserSidebar';
import ItemFormModal from '../../../components/User/ItemFormModal';
import BarcodeScanModal from '../../../components/User/BarcodeScanModal';
import { apiFetch, apiFetchJson } from '../../../lib/api';

export default function InventoryPage() {
  const moduleType = localStorage.getItem('nexus_module') || 'grocery';
  const isPharmacy = moduleType === 'pharmacy';

  const [activeNav, setActiveNav] = useState('inventory');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');

  // Modal state: null = closed, 'add' = creating, or the item object being edited
  const [modalMode, setModalMode] = useState(null);
  const [prefillBarcode, setPrefillBarcode] = useState('');
  const [showScanModal, setShowScanModal] = useState(false);

  const [items, setItems] = useState([]);
  const [loadStatus, setLoadStatus] = useState('loading'); // loading | loaded | error
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');

  async function fetchItems() {
    setLoadStatus('loading');
    setLoadError('');
    try {
      const { ok, status, data } = await apiFetchJson('/inventory/items');
      if (!ok) {
        throw new Error(data?.message || `Failed to load inventory (status ${status})`);
      }
      setItems(Array.isArray(data.items) ? data.items : []);
      setLoadStatus('loaded');
    } catch (err) {
      console.error('fetchItems failed:', err);
      setLoadError(err.message || 'Unable to reach the server');
      setLoadStatus('error');
    }
  }

  useEffect(() => {
    fetchItems();
  }, []);

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    setActionError('');
    try {
      const res = await apiFetch(`/inventory/items/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || `Failed to delete item (status ${res.status})`);
      }
      setItems((prev) => prev.filter((it) => it.id !== id));
    } catch (err) {
      console.error('handleDelete failed:', err);
      setActionError(err.message || 'Unable to delete item');
    }
  }

  // Called by ItemFormModal after it successfully creates/updates on
  // the server — just refetch the whole list so we're always showing
  // exactly what the DB has, no manual state-patching to get wrong.
  function handleSaved() {
    setModalMode(null);
    fetchItems();
  }

  // ── Derived stats (from real data, not mock) ──────────────────
  const totalItems = items.reduce((s, it) => s + (it.stock_qty || 0), 0);
  const weightBased = items
    .filter((it) => it.module_specific_fields?.unit === 'KG')
    .reduce((s, it) => s + (it.stock_qty || 0), 0);
  const lowStockCount = items.filter(
    (it) => it.stock_qty > 0 && it.stock_qty <= (it.reorder_level || 10)
  ).length;
  const outOfStockCount = items.filter((it) => it.stock_qty === 0).length;

  const filtered = useMemo(() => {
    return items.filter((it) => {
      const matchesQuery = (it.name || '').toLowerCase().includes(query.toLowerCase());
      const unit = it.module_specific_fields?.unit;
      if (activeFilter === 'Low Stock') {
        return matchesQuery && it.stock_qty > 0 && it.stock_qty <= (it.reorder_level || 10);
      }
      if (activeFilter === 'by weight') return matchesQuery && unit === 'KG';
      if (activeFilter === 'by unit') return matchesQuery && unit !== 'KG';
      return matchesQuery;
    });
  }, [items, query, activeFilter]);

  const filters = ['ALL', 'Low Stock', 'by weight', 'by unit'];

  function getStockColor(stock) {
    if (stock === 0) return 'text-[#ff6b35]';
    if (stock <= 10) return 'text-[#f5c842]';
    return 'text-white';
  }

  function StatusBadge({ stock, reorderLevel }) {
    if (stock === 0) return (
      <span className="whitespace-nowrap rounded-full border border-[#c8a87a] bg-[#8a4a1a] px-3 py-1 text-[11px] font-bold text-[#ffdcb0]">
        Out of Stock
      </span>
    );
    if (stock <= (reorderLevel || 10)) return (
      <span className="whitespace-nowrap rounded-full border border-[#a09040] bg-[#6a6a20] px-3 py-1 text-[11px] font-bold text-[#f0e080]">
        Low Stock
      </span>
    );
    return (
      <span className="whitespace-nowrap rounded-full border border-[#8aaa70] bg-transparent px-3 py-1 text-[11px] font-bold text-[#d8f0b8]">
        In Stock
      </span>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#e8e8c0] font-[Inter,sans-serif]">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <UserSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeNav={activeNav}
        onNavChange={(id) => { setActiveNav(id); setSidebarOpen(false); }}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* ── Top header ── */}
        <header className="flex h-13.5 shrink-0 items-center justify-between gap-2 border-b border-emerald-500/15 bg-[#0c3410] px-3 sm:gap-4 sm:px-5">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="shrink-0 rounded p-1 text-[#c8d898] lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <div className="flex min-w-0 items-center gap-1.5 overflow-hidden sm:gap-2">
              <span className="hidden whitespace-nowrap text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#efe9c4] sm:block">
                USER-DASHBOARD
              </span>
              <span className="hidden text-[14px] text-[#6ab850] sm:block">/</span>
              <span className="truncate text-[11px] font-semibold uppercase tracking-[0.04em] text-[#d8e0b4]">
                Inventory - {isPharmacy ? 'Pharmacy' : 'Grocery'}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#d8e0b4]">
              <span className="inline-block h-2 w-2 rounded-full bg-[#5dd456] shadow-[0_0_6px_#5dd456]" />
              <span className="hidden sm:inline">Online</span>
            </div>
            <button
              type="button"
              className="hidden whitespace-nowrap rounded-full border border-white/20 bg-transparent px-3.5 py-1.5 text-[12px] font-semibold text-[#e8e4b8] md:block"
            >
              {isPharmacy ? 'Pharmacy' : 'Grocery'} Module
            </button>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[rgba(110,185,80,0.3)] bg-[#1f491d] text-[11px] font-extrabold text-[#e8f2d8]">
              AK
            </div>
          </div>
        </header>

        {/* ── Main content area ── */}
        <div className="flex min-h-0 flex-1 gap-3 overflow-hidden p-3 sm:p-4">
          <div className="flex min-w-0 flex-1 flex-col gap-4 overflow-y-auto pb-24 lg:pb-4">

            {/* Page title + action buttons */}
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-extrabold text-[#1a3a0a] sm:text-3xl">Inventory</h2>
                <p className="mt-0.5 text-[13px] text-[#4a6a2a]">
                  {totalItems.toLocaleString()} total items · {isPharmacy ? 'Batch number and expiry tracking' : 'Per-weight and unit billing'}
                </p>
              </div>

              <div className="flex items-center gap-2 sm:gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowScanModal(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-[#5a7a3a] bg-[#e8e8c0] px-3 py-2 text-[13px] font-bold text-[#1a3a0a] transition hover:bg-[#d8d8a8]"
                >
                  <ScanLine size={14} />
                  <span className="hidden sm:inline">Scan</span>
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-lg border border-[#5a7a3a] bg-[#e8e8c0] px-3 py-2 text-[13px] font-bold text-[#1a3a0a] transition hover:bg-[#d8d8a8]"
                >
                  <Upload size={14} />
                  <span className="hidden sm:inline">Export</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModalMode('add')}
                  className="flex items-center gap-1.5 rounded-lg border border-[#5a7a3a] bg-[#e8e8c0] px-3 py-2 text-[13px] font-bold text-[#1a3a0a] transition hover:bg-[#d8d8a8]"
                >
                  <Plus size={14} />
                  <span className="hidden sm:inline">Add item</span>
                </button>
              </div>
            </div>

            {actionError && (
              <div className="rounded-lg border border-red-400 bg-red-50 px-4 py-2 text-[13px] font-semibold text-red-700">
                {actionError}
              </div>
            )}

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <div className="rounded-xl bg-[#1a3a0a] p-4 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-wide text-[#a8c888]">Total Items</p>
                <p className="mt-2 text-3xl font-extrabold text-white">{totalItems.toLocaleString()}</p>
              </div>
              <div className="rounded-xl bg-[#1a3a0a] p-4 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-wide text-[#a8c888]">Weight-Based</p>
                <p className="mt-2 text-3xl font-extrabold text-white">{weightBased.toLocaleString()}</p>
              </div>
              <div className="rounded-xl bg-[#1a3a0a] p-4 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-wide text-[#a8c888]">Low Stock</p>
                <p className="mt-2 text-3xl font-extrabold text-[#f5c842]">{lowStockCount}</p>
              </div>
              <div className="rounded-xl bg-[#1a3a0a] p-4 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-wide text-[#ff9060]">Out of Stock</p>
                <p className="mt-2 text-3xl font-extrabold text-[#ff6b35]">{outOfStockCount}</p>
              </div>
            </div>

            {/* Search + filter row */}
            <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <div className="flex w-full items-center gap-3 rounded-full border border-[#8aaa70] bg-[#e8e8c0] px-4 py-2.5 sm:flex-1">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  type="text"
                  placeholder={isPharmacy ? 'Search medicine by name' : 'Search product by name'}
                  className="min-w-0 flex-1 bg-transparent text-[13px] text-[#1a3a0a] placeholder-[#7a9a5a] outline-none"
                />
                <Search size={16} className="shrink-0 text-[#5a7a3a]" />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {filters.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setActiveFilter(f)}
                    className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[12px] font-bold transition ${activeFilter === f
                      ? 'border-[#3a6a2a] bg-[#3a6a2a] text-white'
                      : 'border-[#8aaa70] bg-transparent text-[#1a3a0a]'
                      }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Inventory table */}
            <div className="mt-2 overflow-hidden rounded-2xl bg-[#1a3a0a] shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] table-auto text-left">
                  <thead>
                    <tr className="bg-[#2a5a18]">
                      <th className="px-5 py-3.5 text-[11px] font-extrabold uppercase tracking-widest text-[#c8e0a0]">Product</th>
                      <th className="px-5 py-3.5 text-[11px] font-extrabold uppercase tracking-widest text-[#c8e0a0]">Category</th>
                      <th className="px-5 py-3.5 text-[11px] font-extrabold uppercase tracking-widest text-[#c8e0a0]">Price</th>
                      <th className="px-5 py-3.5 text-[11px] font-extrabold uppercase tracking-widest text-[#c8e0a0]">Stock</th>
                      <th className="px-5 py-3.5 text-[11px] font-extrabold uppercase tracking-widest text-[#c8e0a0]">Status</th>
                      <th className="px-5 py-3.5 text-[11px] font-extrabold uppercase tracking-widest text-[#c8e0a0]">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadStatus === 'loading' && (
                      <tr><td colSpan={6} className="px-5 py-6 text-center text-[13px] text-[#c8e0a0]">Loading inventory…</td></tr>
                    )}
                    {loadStatus === 'error' && (
                      <tr><td colSpan={6} className="px-5 py-6 text-center text-[13px] text-[#ff9060]">{loadError}</td></tr>
                    )}
                    {loadStatus === 'loaded' && filtered.length === 0 && (
                      <tr><td colSpan={6} className="px-5 py-6 text-center text-[13px] text-[#c8e0a0]">No items yet — add your first one.</td></tr>
                    )}
                    {filtered.map((it, i) => (
                      <tr
                        key={it.id}
                        className={`border-t border-[#2a5a18] ${i % 2 === 0 ? 'bg-[#1a3a0a]' : 'bg-[#1f4410]'}`}
                      >
                        <td className="px-5 py-3.5 text-[13px] font-semibold text-white">{it.name}</td>
                        <td className="px-5 py-3.5 text-[13px] font-semibold text-[#c8e0a0]">{it.category || '—'}</td>
                        <td className="px-5 py-3.5 text-[13px] text-[#d8f0b0]">
                          Rs {Number(it.price).toLocaleString()}
                          {it.module_specific_fields?.unit ? `/${it.module_specific_fields.unit}` : ''}
                        </td>
                        <td className={`px-5 py-3.5 text-[13px] font-bold ${getStockColor(it.stock_qty)}`}>
                          {it.stock_qty} {it.module_specific_fields?.unit || ''}
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusBadge stock={it.stock_qty} reorderLevel={it.reorder_level} />
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setModalMode(it)}
                              className="rounded-lg border border-[#5a8a4a] bg-transparent p-1.5 text-[#c8e0a0] transition hover:bg-[#2a5a18]"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(it.id)}
                              className="rounded-lg border border-[#c04040] bg-transparent p-1.5 text-[#f08080] transition hover:bg-[#4a1a1a]"
                            >
                              <Trash2 size={13} />
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

          {/* ── Right aside (desktop only) ── */}
          <aside className="hidden w-56 shrink-0 flex-col overflow-y-auto rounded-2xl border border-[#8aaa70] bg-[#d8d8a8] p-4 lg:flex">
            <div className="mb-3">
              <p className="text-[13px] font-extrabold text-[#1a3a0a]">Summary</p>
              <p className="mt-0.5 text-[12px] text-[#5a7a3a]">Overview of inventory</p>
            </div>

            <div className="mb-3 grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-[#8aaa70] bg-[#e8e8c0] p-3">
                <p className="text-[10px] text-[#5a7a3a]">Total Items</p>
                <p className="text-[18px] font-extrabold text-[#1a3a0a]">{totalItems}</p>
              </div>
              <div className="rounded-xl border border-[#8aaa70] bg-[#e8e8c0] p-3">
                <p className="text-[10px] text-[#5a7a3a]">Weight</p>
                <p className="text-[18px] font-extrabold text-[#1a3a0a]">{weightBased}</p>
              </div>
              <div className="rounded-xl border border-[#8aaa70] bg-[#e8e8c0] p-3">
                <p className="text-[10px] text-[#5a7a3a]">Low Stock</p>
                <p className="text-[18px] font-extrabold text-[#b08000]">{lowStockCount}</p>
              </div>
              <div className="rounded-xl border border-[#8aaa70] bg-[#e8e8c0] p-3">
                <p className="text-[10px] text-[#5a7a3a]">Out of Stock</p>
                <p className="text-[18px] font-extrabold text-[#c04030]">{outOfStockCount}</p>
              </div>
            </div>

            <div className="mt-auto">
              <button
                type="button"
                onClick={() => setModalMode('add')}
                className="w-full rounded-xl bg-[#1a3a0a] py-3 text-[13px] font-extrabold text-[#e8e8c0] transition hover:bg-[#2a5a18]"
              >
                Add Item
              </button>
            </div>
          </aside>

          {/* ── Mobile summary bar ── */}
          <div className="fixed bottom-4 left-4 right-4 z-50 lg:hidden">
            <div className="flex items-center justify-between gap-3 rounded-full bg-[#1a3a0a] px-4 py-3 shadow-lg">
              <div className="text-sm font-bold text-[#e8e8c0]">
                {totalItems.toLocaleString()} items in stock
              </div>
              <button
                type="button"
                onClick={() => setModalMode('add')}
                className="flex items-center gap-1.5 rounded-full bg-[#4a7a2a] px-4 py-2 text-sm font-bold text-white"
              >
                <Plus size={14} /> Add
              </button>
            </div>
          </div>
        </div>
      </div>

      {modalMode !== null && (
        <ItemFormModal
          mode={modalMode === 'add' ? 'add' : 'edit'}
          initialItem={modalMode === 'add' ? null : modalMode}
          initialBarcode={prefillBarcode}
          moduleType={moduleType}
          categories={isPharmacy
            ? ['Tablets', 'Syrups', 'Injections', 'Ointments', 'General']
            : ['Grain', 'Dairy', 'Meat', 'Bakery', 'Beverage', 'Snacks', 'Produce']
          }
          unitOptions={isPharmacy
            ? ['PCS', 'STRIP', 'BOX', 'BOTTLE']
            : ['ML', 'L', 'G', 'KG', 'PCS', 'PKT', 'BOX']
          }
          onClose={() => { setModalMode(null); setPrefillBarcode(''); }}
          onSaved={handleSaved}
        />
      )}

      {showScanModal && (
        <BarcodeScanModal
          onClose={() => setShowScanModal(false)}
          onAddNew={(code) => {
            setShowScanModal(false);
            setPrefillBarcode(code);
            setModalMode('add');
          }}
        />
      )}
    </div>
  );
}