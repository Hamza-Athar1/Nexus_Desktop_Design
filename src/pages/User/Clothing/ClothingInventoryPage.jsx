import { useMemo, useState } from "react";
import { Search, Upload, Plus, ScanLine, Menu, Edit2 } from "lucide-react";
import UserSidebar from "../../../components/UserSidebar";
import AddClothingModal from "../../../components/AddClothingModal";

const PRODUCTS = [
  {
    id: 1, name: "Men's Polo Shirt", sku: "CLT-001", category: "Men",
    categoryLabel: "Men's wear", price: "Rs 1,200", status: "in-stock",
    sizes: ["S", "M", "L", "XL", "XXL"],
    variants: [
      { color: "Navy", dot: "#2563eb", qty: { S: 12, M: 4, L: 18, XL: 9, XXL: 0 } },
      { color: "Red", dot: "#dc2626", qty: { S: 4, M: 15, L: 11, XL: 6, XXL: 3 } },
      { color: "Black", dot: "#1c1917", qty: { S: 2, M: 3, L: 20, XL: 14, XXL: 7 } },
    ],
  },
  {
    id: 2, name: "Men's Polo Shirt", sku: "CLT-001", category: "Men",
    categoryLabel: "Men's wear", price: "Rs 1,200", status: "low-stock",
    sizes: ["S", "M", "L", "XL"],
    variants: [
      { color: "Pink", dot: "#ec4899", qty: { S: 2, M: 8, L: 5, XL: 0 } },
      { color: "Teal", dot: "#14b8a6", qty: { S: 6, M: 10, L: 3, XL: 7 } },
    ],
  },
  {
    id: 3, name: "Women's Floral Kurti", sku: "CLT-002", category: "Women",
    categoryLabel: "Women's wear", price: "Rs 1,850", status: "in-stock",
    sizes: ["S", "M", "L", "XL"],
    variants: [
      { color: "White", dot: "#e5e7eb", qty: { S: 5, M: 9, L: 7, XL: 2 } },
      { color: "Yellow", dot: "#eab308", qty: { S: 3, M: 6, L: 12, XL: 4 } },
    ],
  },
  {
    id: 4, name: "Kids T-Shirt", sku: "CLT-003", category: "Kids",
    categoryLabel: "Kids' wear", price: "Rs 650", status: "low-stock",
    sizes: ["XS", "S", "M", "L"],
    variants: [
      { color: "Blue", dot: "#3b82f6", qty: { XS: 1, S: 0, M: 3, L: 2 } },
      { color: "Green", dot: "#22c55e", qty: { XS: 0, S: 2, M: 5, L: 1 } },
    ],
  },
];

function StatusBadge({ status }) {
  if (status === "in-stock")
    return (
      <span className="whitespace-nowrap rounded-md border border-white/20 bg-white/10 px-2.5 py-0.5 text-[11px] font-bold text-green-100">
        In Stock
      </span>
    );
  if (status === "low-stock")
    return (
      <span className="whitespace-nowrap rounded-md border border-amber-500 bg-amber-800 px-2.5 py-0.5 text-[11px] font-bold text-amber-100">
        Low Stock
      </span>
    );
  return (
    <span className="whitespace-nowrap rounded-md border border-red-800 bg-red-900 px-2.5 py-0.5 text-[11px] font-bold text-red-200">
      Out of Stock
    </span>
  );
}

function VariantGrid({ sizes, variants }) {
  const gridCols = `90px repeat(${sizes.length}, 1fr)`;
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
      {variants.map((v) => (
        <div key={v.color} className="mb-2 grid items-center" style={{ gridTemplateColumns: gridCols }}>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 shrink-0 rounded-full border border-white/25" style={{ background: v.dot }} />
            <span className="text-[13px] font-semibold text-green-100">{v.color}</span>
          </div>
          {sizes.map((s) => (
            <div key={s} className={`text-center text-[13px] font-semibold ${v.qty[s] === 0 ? "text-amber-400" : "text-white"}`}>
              {v.qty[s] ?? "-"}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function ProductCard({ product }) {
  return (
    <div className="flex min-w-0 flex-col gap-3.5 rounded-2xl border border-green-600/20 bg-[#1a4a1a] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="mb-0.5 text-[17px] font-extrabold text-white">{product.name}</p>
          <p className="text-[12px] font-medium text-green-300">
            SKU: {product.sku}&nbsp;&nbsp;{product.categoryLabel}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <span className="text-base font-extrabold text-white">{product.price}</span>
          <StatusBadge status={product.status} />
        </div>
      </div>

      <div className="h-px bg-green-300/10" />

      <p className="-mb-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-green-500">
        Size / Color Variant Grid
      </p>

      <VariantGrid sizes={product.sizes} variants={product.variants} />

      <div className="mt-0.5 flex gap-2.5">
        {[
          { icon: <Edit2 size={13} />, label: "Edit variant" },
          { icon: <Plus size={14} />, label: "Add variant" },
        ].map(({ icon, label }) => (
          <button
            key={label}
            type="button"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-[10px] border border-green-300/30 bg-white/[0.08] py-2.5 text-[13px] font-bold text-green-100 transition-colors hover:bg-white/[0.14]"
          >
            {icon}
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

const FILTERS = ["ALL", "Men", "Women", "Kids"];
const TOTAL = 480;

export default function ClothingInventoryPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [showAddModal, setShowAddModal] = useState(false);

  const filtered = useMemo(() => {
    return PRODUCTS.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(query.toLowerCase());
      const matchesCat = activeFilter === "ALL" || p.category === activeFilter;
      return matchesSearch && matchesCat;
    });
  }, [query, activeFilter]);

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
                {TOTAL} products &nbsp;·&nbsp; Size and color variant tracking
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
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
                onClick={() => setShowAddModal(true)}
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
              {FILTERS.map((f) => (
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
            {filtered.length === 0 ? (
              <div className="col-span-full py-16 text-center text-[15px] font-semibold text-[#5a7a3a]">
                No products found.
              </div>
            ) : (
              filtered.map((p) => <ProductCard key={p.id} product={p} />)
            )}
          </div>

        </div>
      </div>

      {showAddModal && (
        <AddClothingModal
          onClose={() => setShowAddModal(false)}
          onConfirm={(data) => console.log("New product added:", data)}
        />
      )}
    </div>
  );
}
