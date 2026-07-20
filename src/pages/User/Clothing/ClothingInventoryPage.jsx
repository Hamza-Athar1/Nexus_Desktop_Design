import { useEffect, useMemo, useState } from "react";
import { Search, Upload, Plus, ScanLine, Menu, Edit2, Trash2 } from "lucide-react";
import UserSidebar from "../../../components/User/UserSidebar";
import ItemFormModal from "../../../components/User/ItemFormModal";
import BarcodeScanModal from "../../../components/User/BarcodeScanModal";
import { apiFetch, apiFetchJson } from "../../../lib/api";

function getColorHex(colorName) {
  const map = {
    red: '#dc2626',
    blue: '#2563eb',
    navy: '#1e3a8a',
    green: '#16a34a',
    black: '#111827',
    white: '#f9fafb',
    yellow: '#ca8a04',
    pink: '#db2777',
    teal: '#0d9488',
    orange: '#ea580c',
    "dark-navy": '#1e293b',
  };
  return map[colorName.toLowerCase().trim()] || '#6b7280';
}

function StatusBadge({ stock, reorderLevel }) {
  if (stock === 0)
    return (
      <span className="whitespace-nowrap rounded-md border border-red-800 bg-red-900 px-2.5 py-0.5 text-[11px] font-bold text-red-200">
        Out of Stock
      </span>
    );
  if (stock <= (reorderLevel || 10))
    return (
      <span className="whitespace-nowrap rounded-md border border-amber-500 bg-amber-800 px-2.5 py-0.5 text-[11px] font-bold text-amber-100">
        Low Stock
      </span>
    );
  return (
    <span className="whitespace-nowrap rounded-md border border-white/20 bg-white/10 px-2.5 py-0.5 text-[11px] font-bold text-green-100">
      In Stock
    </span>
  );
}

function VariantGrid({ sizes = [], colors = [] }) {
  if (!sizes.length && !colors.length) {
    return <div className="text-[13px] text-green-300/60">No sizes/colors defined</div>;
  }
  const gridCols = `90px repeat(${Math.max(sizes.length, 1)}, 1fr)`;
  return (
    <div className="overflow-x-auto">
      <div className="mb-1.5 grid" style={{ gridTemplateColumns: gridCols }}>
        <div />
        {sizes.map((s) => (
          <div key={s} className="text-center text-[13px] font-bold text-emerald-100">
            {s}
          </div>
        ))}
      </div>
      {colors.map((c) => (
        <div key={c} className="mb-2 grid items-center" style={{ gridTemplateColumns: gridCols }}>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 shrink-0 rounded-full border border-white/25" style={{ background: getColorHex(c) }} />
            <span className="text-[13px] font-semibold text-green-100 capitalize">{c}</span>
          </div>
          {sizes.map((s) => (
            <div key={s} className="text-center text-[13px] font-semibold text-white">
              ✓
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function ProductCard({ product, onEdit, onDelete }) {
  const sizes = product.module_specific_fields?.sizes || [];
  const colors = product.module_specific_fields?.colors || [];

  return (
    <div className="flex min-w-0 flex-col gap-3.5 rounded-2xl border border-green-600/20 bg-[#1a4a1a] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="mb-0.5 text-[17px] font-extrabold text-white">{product.name}</p>
          <p className="text-[12px] font-medium text-green-300">
            SKU: {product.sku || "N/A"}&nbsp;&nbsp;·&nbsp;&nbsp;{product.category || "General"}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <span className="text-base font-extrabold text-white">Rs {Number(product.price).toLocaleString()}</span>
          <StatusBadge stock={product.stock_qty} reorderLevel={product.reorder_level} />
        </div>
      </div>

      <div className="h-px bg-green-300/10" />

      <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-[0.12em] text-green-500">
        <span>Size / Color Variants</span>
        <span className="text-white normal-case">Stock: {product.stock_qty}</span>
      </div>

      <VariantGrid sizes={sizes} colors={colors} />

      <div className="mt-0.5 flex gap-2.5">
        <button
          type="button"
          onClick={() => onEdit(product)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-[10px] border border-green-300/30 bg-white/[0.08] py-2.5 text-[13px] font-bold text-green-100 transition-colors hover:bg-white/[0.14]"
        >
          <Edit2 size={13} />
          Edit product
        </button>
        <button
          type="button"
          onClick={() => onDelete(product.id)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-[10px] border border-red-500/30 bg-red-950/20 py-2.5 text-[13px] font-bold text-red-200 transition-colors hover:bg-red-900/40"
        >
          <Trash2 size={13} />
          Delete
        </button>
      </div>
    </div>
  );
}

const CATEGORIES = ["Men", "Women", "Kids", "Accessories"];

export default function ClothingInventoryPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [items, setItems] = useState([]);
  const [loadStatus, setLoadStatus] = useState("loading"); // loading | loaded | error
  const [loadError, setLoadError] = useState("");
  const [modalMode, setModalMode] = useState(null); // null | 'add' | productObject
  const [prefillBarcode, setPrefillBarcode] = useState("");
  const [showScanModal, setShowScanModal] = useState(false);

  async function fetchItems() {
    setLoadStatus("loading");
    setLoadError("");
    try {
      const { ok, status, data } = await apiFetchJson('/inventory/items');
      if (!ok) {
        throw new Error(data?.message || `Failed to load inventory (status ${status})`);
      }
      setItems(Array.isArray(data.items) ? data.items : []);
      setLoadStatus("loaded");
    } catch (err) {
      console.error("fetchItems failed:", err);
      setLoadError(err.message || "Unable to reach the server");
      setLoadStatus("error");
    }
  }

  useEffect(() => {
    fetchItems();
  }, []);

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this clothing item?")) return;
    try {
      const res = await apiFetch(`/inventory/items/${id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || `Failed to delete item (status ${res.status})`);
      }
      setItems((prev) => prev.filter((it) => it.id !== id));
    } catch (err) {
      console.error("handleDelete failed:", err);
      alert(err.message || "Unable to delete item");
    }
  }

  function handleSaved() {
    setModalMode(null);
    setPrefillBarcode("");
    fetchItems();
  }

  const filtered = useMemo(() => {
    return items.filter((p) => {
      const matchesSearch = (p.name || "").toLowerCase().includes(query.toLowerCase());
      const matchesCat = activeFilter === "ALL" || p.category === activeFilter;
      return matchesSearch && matchesCat;
    });
  }, [items, query, activeFilter]);

  const totalProducts = items.length;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#eef2d8] font-[Inter,sans-serif]">

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <UserSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeNav="inventory"
        onNavChange={() => setSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">

        {/* ── Header ── */}
        <header className="flex h-[54px] shrink-0 items-center justify-between gap-3 border-b border-green-600/15 bg-[#0c3410] px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
              className="flex shrink-0 rounded p-1 text-[#c8d898] lg:hidden"
            >
              <Menu size={20} />
            </button>
            <span className="hidden whitespace-nowrap text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#efe9c4] sm:block">
              USER-DASHBOARD
            </span>
            <span className="hidden text-sm text-[#6ab850] sm:block">/</span>
            <span className="truncate text-[11px] font-semibold uppercase tracking-[0.04em] text-[#d8e0b4]">
              Inventory- Clothing
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#d8e0b4]">
              <span className="inline-block h-2 w-2 rounded-full bg-[#5dd456] shadow-[0_0_6px_#5dd456]" />
              <span className="hidden sm:inline">Online</span>
            </div>
            <button
              type="button"
              className="hidden whitespace-nowrap rounded-full border border-white/20 bg-transparent px-3.5 py-1.5 text-[12px] font-semibold text-[#e8e4b8] transition hover:border-white/40 md:block"
            >
              Clothing Module
            </button>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-green-600/30 bg-[#1f491d] text-[11px] font-extrabold text-[#e8f2d8]">
              AA
            </div>
          </div>
        </header>

        {/* ── Content ── */}
        <div className="flex min-h-0 flex-1 flex-col gap-[18px] overflow-hidden px-7 py-6">

          {/* Title row */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="m-0 text-3xl font-black leading-tight text-[#1a3a0a]">
                Clothing Inventory
              </h1>
              <p className="mt-1 text-[13px] font-medium text-[#4a6a2a]">
                {totalProducts} products &nbsp;·&nbsp; Size and color variant tracking
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowScanModal(true)}
                className="flex items-center gap-1.5 rounded-[10px] border border-[#6a9a4a] bg-[#eef2d8] px-4 py-2 text-[13px] font-bold text-[#1a3a0a] transition hover:bg-[#dde5b8]"
              >
                <ScanLine size={15} />
                Scan
              </button>
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-[10px] border border-[#6a9a4a] bg-[#eef2d8] px-4 py-2 text-[13px] font-bold text-[#1a3a0a] transition hover:bg-[#dde5b8]"
              >
                <Upload size={15} />
                Export
              </button>
              <button
                type="button"
                onClick={() => setModalMode('add')}
                className="flex items-center gap-1.5 rounded-[10px] border border-[#6a9a4a] bg-[#eef2d8] px-4 py-2 text-[13px] font-bold text-[#1a3a0a] transition hover:bg-[#dde5b8]"
              >
                <Plus size={15} />
                Add product
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-green-800/20" />

          {/* Search + filters */}
          <div className="flex flex-wrap items-center gap-3.5">
            <div className="flex min-w-[240px] max-w-[340px] flex-1 items-center gap-2.5 rounded-full border border-[#8aaa70] bg-[#eef2d8] px-4 py-2.5">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="text"
                placeholder="Search product by name"
                className="min-w-0 flex-1 bg-transparent text-[13px] font-semibold text-[#1a3a0a] placeholder-[#7a9a5a] outline-none"
              />
              <Search size={16} className="shrink-0 text-[#5a7a3a]" />
            </div>

            <div className="flex flex-wrap gap-2">
              {["ALL", ...CATEGORIES].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setActiveFilter(f)}
                  className={`rounded-full border px-[18px] py-[7px] text-[13px] font-bold transition-all ${activeFilter === f
                    ? "border-[#3a6a2a] bg-[#3a6a2a] text-white"
                    : "border-[#8aaa70] bg-transparent text-[#1a3a0a] hover:bg-[#8aaa70]/10"
                    }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Products grid */}
          <div className="grid flex-1 auto-rows-min grid-cols-[repeat(auto-fill,minmax(380px,1fr))] gap-5 overflow-y-auto pb-5 pr-1">
            {loadStatus === 'loading' && (
              <div className="col-span-full py-16 text-center text-[15px] font-semibold text-[#5a7a3a]">
                Loading inventory...
              </div>
            )}
            {loadStatus === 'error' && (
              <div className="col-span-full py-16 text-center text-[15px] font-semibold text-red-700">
                {loadError}
              </div>
            )}
            {loadStatus === 'loaded' && filtered.length === 0 && (
              <div className="col-span-full py-16 text-center text-[15px] font-semibold text-[#5a7a3a]">
                No products found.
              </div>
            )}
            {loadStatus === 'loaded' && filtered.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onEdit={(item) => setModalMode(item)}
                onDelete={handleDelete}
              />
            ))}
          </div>

        </div>
      </div>

      {modalMode !== null && (
        <ItemFormModal
          mode={modalMode === 'add' ? 'add' : 'edit'}
          initialItem={modalMode === 'add' ? null : modalMode}
          initialBarcode={prefillBarcode}
          moduleType="clothing"
          categories={CATEGORIES}
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
