import { useMemo, useState } from 'react';
import {
  Search,
  Barcode,
  Plus,
  ShoppingCart,
  Package,
  Pill,
  Droplet,
  Syringe,
  Minus,
  CreditCard,
  DollarSign,
  Menu,
  X,
  Bell,
} from 'lucide-react';
import NexusLogo from '../../components/NexusLogo';

const NAV_MAIN = [
  { id: 'dashboard', label: 'Dashboard', icon: ShoppingCart },
  { id: 'pos', label: 'POS System', icon: ShoppingCart },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'reports', label: 'Reports', icon: DollarSign },
];

const NAV_ACCOUNT = [
  { id: 'profile', label: 'Edit Profile', icon: Pill },
  { id: 'settings', label: 'Settings', icon: X },
];

const PRODUCT_CATEGORIES = ['All', 'Antibiotics', 'Painkillers', 'Syrups'];

const PRODUCTS = [
  {
    id: 1,
    name: 'Panadol 500 mg',
    price: '45',
    stock: 240,
    category: 'Painkillers',
    detail: 'Strip of 10',
    icon: Pill,
  },
  {
    id: 2,
    name: 'Vitamin C 500mg',
    price: '350',
    stock: 88,
    category: 'Syrups',
    detail: 'Bottle 60 tabs',
    icon: Syringe,
  },
  {
    id: 3,
    name: 'ORS Sachet',
    price: '80',
    stock: 12,
    category: 'Syrups',
    detail: 'Pack of 5',
    icon: Droplet,
  },
  {
    id: 4,
    name: 'Flagyl 400mg',
    price: '180',
    stock: 56,
    category: 'Antibiotics',
    detail: 'Strip of 10',
    icon: Syringe,
  },
  {
    id: 5,
    name: 'Augmentin 625mg',
    price: '45',
    stock: 240,
    category: 'Antibiotics',
    detail: 'Strip of 7',
    icon: Pill,
  },
  {
    id: 6,
    name: 'Vitamin C 500mg',
    price: '320',
    stock: 3,
    category: 'Syrups',
    detail: 'Strip of 10',
    icon: Droplet,
    lowStock: true,
  },
];

const INITIAL_CART = [
  { id: 1, name: 'Panadol 500mg', qty: 2, price: 45 },
  { id: 3, name: 'ORS Sachet', qty: 1, price: 80 },
  { id: 2, name: 'Vitamin C 500mg', qty: 1, price: 350 },
];

function SidebarButton({ icon: Icon, label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-full text-left transition-all duration-200 ${
        active ? 'bg-[#f0ebca] text-[#0f3719] shadow-[0_0_18px_rgba(15,55,25,0.12)]' : 'text-[#e9e2b4] hover:bg-[#ecf0d0]/20'
      }`}
    >
      <Icon size={16} className={active ? 'text-[#0f3719]' : 'text-[#e9e2b4]'} />
      {label}
    </button>
  );
}

function CategoryButton({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(label)}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
        active ? 'bg-[#f0ebca] text-[#0f3719]' : 'bg-[#eaf0cf]/80 text-[#123819] hover:bg-[#f2f5d0]'
      }`}
    >
      {label}
    </button>
  );
}

function ProductCard({ item, onAdd }) {
  const Icon = item.icon;
  return (
    <div className="rounded-[26px] bg-[#113b16] border border-[#1f551f]/80 p-5 shadow-[0_18px_40px_rgba(16,57,21,0.16)]">
      <div className="flex items-center justify-between mb-5">
        <span className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-[#1f5a24]/20 border border-[#2f7d36]/40 text-emerald-200">
          <Icon size={20} />
        </span>
        <button
          type="button"
          className="rounded-full border border-[#9cdc8d]/20 bg-[#d5e7b4]/15 px-3 py-1 text-xs font-bold uppercase text-[#e9f1da]"
          onClick={() => onAdd(item)}
        >
          Add
        </button>
      </div>
      <div className="space-y-2">
        <h3 className="text-base font-bold text-[#f0f6d7]">{item.name}</h3>
        <p className="text-xs text-[#b1c89d]">{item.detail}</p>
        <p className="text-lg font-black text-[#f4f7d8]">RS {item.price}</p>
        <p className={`text-sm ${item.lowStock ? 'text-[#f87171]' : 'text-[#a8c696]'}`}>Stock: {item.stock}{item.lowStock ? ' ⚠' : ''}</p>
      </div>
    </div>
  );
}

function CartItem({ item, onChange }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3 border-b border-[#d4e0b3]/20 last:border-b-0">
      <div>
        <p className="text-sm font-semibold text-[#152f16]">{item.name}</p>
        <p className="text-xs text-[#677754]">Rs {item.price}</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(item.id, item.qty - 1)}
          className="h-9 w-9 rounded-lg bg-[#153216] text-[#d8e3b8] flex items-center justify-center"
        >
          <Minus size={16} />
        </button>
        <span className="w-7 text-center text-sm font-bold text-[#142d17]">{item.qty}</span>
        <button
          type="button"
          onClick={() => onChange(item.id, item.qty + 1)}
          className="h-9 w-9 rounded-lg bg-[#153216] text-[#d8e3b8] flex items-center justify-center"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}

export default function POSSystemPage() {
  const [activeTab, setActiveTab] = useState('pos');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cartItems, setCartItems] = useState(INITIAL_CART);

  const filteredProducts = useMemo(
    () => PRODUCTS.filter((product) =>
      selectedCategory === 'All' ? true : product.category === selectedCategory
    ),
    [selectedCategory]
  );

  const cartTotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.qty * item.price, 0),
    [cartItems]
  );

  const handleQuantityChange = (id, qty) => {
    setCartItems((current) =>
      current
        .map((item) => (item.id === id ? { ...item, qty: Math.max(1, qty) } : item))
        .filter((item) => item.qty > 0)
    );
  };

  const handleAddToCart = (product) => {
    setCartItems((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...current, { id: product.id, name: product.name, qty: 1, price: Number(product.price) }];
    });
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#eef0d2] font-inter">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#143a16] border-r border-[#2e5d25]/45 p-5 transition-transform duration-300 lg:static ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <NexusLogo size={28} variant="light" />
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] font-bold text-[#e7e2b5]">User-Dashboard</p>
              <p className="text-[11px] text-[#c1c99f]">POS System</p>
            </div>
          </div>
          <button className="lg:hidden text-[#c9d6b0] hover:text-[#f2f4d3]" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3">
          <p className="text-[9px] uppercase tracking-[0.22em] font-bold text-[#aec18d]">Main</p>
          {NAV_MAIN.map((item) => (
            <SidebarButton
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={activeTab === item.id}
              onClick={() => setActiveTab(item.id)}
            />
          ))}

          <p className="mt-6 text-[9px] uppercase tracking-[0.22em] font-bold text-[#aec18d]">Account</p>
          {NAV_ACCOUNT.map((item) => (
            <SidebarButton
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={activeTab === item.id}
              onClick={() => setActiveTab(item.id)}
            />
          ))}
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-4 sm:px-6 h-15 shrink-0 bg-[#173914] border-b border-emerald-500/15">
          <div className="flex items-center gap-2">
            <button className="lg:hidden text-[#d9ddc4] hover:text-[#f7f4d8]" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={22} />
            </button>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold tracking-[0.18em] text-[#f4f2d8] uppercase">USER-DASHBOARD</span>
              <span className="text-[#8ec876]">/</span>
              <span className="text-[10px] font-bold tracking-[0.18em] text-[#f4f2d8] uppercase">POS System - Pharmacy</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="rounded-full bg-[#1f491d]/90 p-3 text-[#dbe4c6] hover:bg-[#2f602e] transition-colors">
              <Bell size={18} />
            </button>
            <div className="rounded-full bg-[#1f491d]/10 px-3 py-1.5 text-sm font-semibold text-[#e8f1d3] border border-emerald-400/20">
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                Online
              </span>
            </div>
            <button className="hidden sm:inline rounded-full border border-[#7cb968]/30 bg-[#1f491d]/90 px-4 py-1.5 text-sm font-semibold text-[#eef3d3] hover:bg-[#2d5f2d] transition-colors">
              Pharmacy Module
            </button>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#214d1d] border border-[#88d46f]/30 text-[11px] font-bold text-[#f8f9e2]">
              AK
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7">
          <div className="grid gap-4 xl:grid-cols-[1.4fr_0.6fr]">
            <div className="space-y-4">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex-1">
                  <label className="relative block rounded-[26px] border border-[#4d7b4a]/30 bg-[#eef2d7] px-4 py-3 shadow-[inset_0_2px_4px_rgba(255,255,255,0.35)]">
                    <input
                      type="text"
                      placeholder="Search product by name"
                      className="w-full bg-transparent text-sm text-[#1f3f1c] placeholder:text-[#7a946c] outline-none"
                    />
                    <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#486c46]" />
                  </label>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button className="rounded-[18px] border border-[#4d7b4a]/30 bg-[#eef2d7] px-5 py-3 text-sm font-semibold text-[#1d401d] shadow-[0_10px_25px_rgba(184,211,144,0.18)] hover:bg-[#f4f7d9] transition-colors flex items-center gap-2">
                    <Barcode size={18} /> Scan barcode
                  </button>
                  <button className="rounded-[18px] bg-[#1f5922] px-5 py-3 text-sm font-semibold text-[#eef3d4] shadow-[0_10px_25px_rgba(20,61,23,0.24)] hover:bg-[#276b2d] transition-colors flex items-center gap-2">
                    <Plus size={18} /> Add item
                  </button>
                </div>
              </div>

              <div className="rounded-[30px] border border-[#d6dea9]/60 bg-[#f3f6d9] p-4 shadow-[0_18px_40px_rgba(68,94,46,0.08)]">
                <div className="flex flex-wrap gap-3">
                  {PRODUCT_CATEGORIES.map((category) => (
                    <CategoryButton
                      key={category}
                      label={category}
                      active={selectedCategory === category}
                      onClick={setSelectedCategory}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredProducts.map((item) => (
                  <ProductCard key={item.id} item={item} onAdd={handleAddToCart} />
                ))}
              </div>
            </div>

            <aside className="rounded-4xl border border-[#a7be86]/40 bg-[#f1f4d7] p-5 shadow-[0_18px_40px_rgba(85,117,58,0.08)]">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.22em] font-bold text-[#516d49]">Cart</p>
                  <p className="text-sm text-[#2f4c24]">Review items</p>
                </div>
                <ShoppingCart size={20} className="text-[#4f7a45]" />
              </div>

              <div className="space-y-3">
                {cartItems.map((item) => (
                  <CartItem key={item.id} item={item} onChange={handleQuantityChange} />
                ))}
              </div>

              <div className="mt-6 space-y-3 text-sm text-[#4a6340]">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span>Rs {cartTotal}</span>
                </div>
                <div className="flex items-center justify-between text-[#7a8e69]">
                  <span>GST (17%)</span>
                  <span>Rs {Math.round(cartTotal * 0.17)}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-[#e4e8bf] px-4 py-3 font-bold text-[#22421f]">
                  <span>Total</span>
                  <span>Rs {Math.round(cartTotal * 1.17)}</span>
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                <button className="rounded-2xl border border-[#4c7b45] bg-[#eef4d8] px-4 py-3 text-sm font-semibold text-[#1e351d] hover:bg-[#f2f8e3] transition-colors">
                  Cash
                </button>
                <button className="rounded-2xl border border-[#4c7b45] bg-[#eef4d8] px-4 py-3 text-sm font-semibold text-[#1e351d] hover:bg-[#f2f8e3] transition-colors">
                  Card
                </button>
              </div>

              <button className="mt-4 w-full rounded-2xl bg-[#214f1f] px-4 py-3 text-sm font-bold text-[#eef4d8] shadow-[0_14px_26px_rgba(18,45,22,0.28)] hover:bg-[#2c6527] transition-colors">
                Generate Bill
              </button>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
