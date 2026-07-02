import { useMemo, useState } from 'react';
import {
  Search,
  ScanLine,
  Plus,
  ShoppingCart,
  Minus,
  CreditCard,
  Banknote,
  Pill,
  Droplets,
  Syringe,
  AlertTriangle,
  Menu,
  X,
  Package,
  BarChart3,
  UserCircle2,
  LogOut,
} from 'lucide-react';
import NexusLogo from '../../components/NexusLogo';

const CATEGORIES = ['All', 'Antibiotics', 'Painkillers', 'Syrups'];

const PRODUCTS = [
  { id: 1, name: 'Panadol 500 mg', price: 45, stock: 240, cat: 'Painkillers', detail: 'Strip of 10', icon: Pill },
  { id: 2, name: 'Vitamin C 500mg', price: 350, stock: 88, cat: 'Syrups', detail: 'Bottle 60 tabs', icon: Syringe },
  { id: 3, name: 'ORS Sachet', price: 80, stock: 12, cat: 'Syrups', detail: 'Pack of 5', icon: Droplets },
  { id: 4, name: 'Flagyl 400mg', price: 180, stock: 56, cat: 'Antibiotics', detail: 'Strip of 10', icon: Syringe },
  { id: 5, name: 'Augmentin 625mg', price: 45, stock: 240, cat: 'Antibiotics', detail: 'Strip of 7', icon: Pill },
  { id: 6, name: 'Vitamin C 500mg', price: 320, stock: 3, cat: 'Syrups', detail: 'Strip of 10', icon: Droplets, lowStock: true },
];

const INITIAL_CART = [
  { id: 1, name: 'Panadol 500mg', qty: 2, price: 45 },
  { id: 3, name: 'ORS Sachet', qty: 1, price: 80 },
  { id: 2, name: 'Vitamic C 500mg', qty: 1, price: 350 },
];

const NAV_MAIN = [
  { id: 'pos', label: 'POS', icon: ShoppingCart },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
];

const NAV_ACCOUNT = [
  { id: 'profile', label: 'Profile', icon: UserCircle2 },
  { id: 'logout', label: 'Logout', icon: LogOut },
];

function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-xl px-3 py-2 text-left text-[12px] font-semibold transition-colors ${
        active ? 'bg-white/10 text-[#f0f4d7]' : 'text-[#8aaa70] hover:bg-white/5 hover:text-[#d6e6a8]'
      }`}
    >
      <Icon size={15} />
      <span>{label}</span>
    </button>
  );
}

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

function ProductCard({ item, onAdd }) {
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={() => onAdd(item)}
      className="group flex cursor-pointer flex-col gap-3.5 rounded-[20px] border border-[#2a5a2a] bg-[#1a3d1a] p-4.5 text-left shadow-[0_2px_8px_rgba(0,0,0,0.12)] transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(0,0,0,0.28)]"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-[14px] border border-white/10 bg-white/10 text-[#a8d888]">
        <Icon size={20} />
      </div>

      <div>
        <p className="mb-0.75 text-[15px] font-bold text-[#e8f0d0]">{item.name}</p>
        <p className="mb-2 text-[12px] text-[#7aaa65]">{item.detail}</p>
        <p className="mb-1 text-[20px] font-black text-[#f0f5d8]">RS {item.price}</p>
        <p className={`flex items-center gap-1 text-[12px] ${item.lowStock ? 'text-[#f87171]' : 'text-[#88bb70]'}`}>
          Stock: {item.stock}
          {item.lowStock && <AlertTriangle size={12} />}
        </p>
      </div>
    </button>
  );
}

function CartRow({ item, onChange }) {
  return (
    <div className="py-2.5">
      <p className="mb-2 text-[13px] font-semibold text-[#1a3a1a]">{item.name}</p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(item.id, item.qty - 1)}
          className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-lg border-none bg-[#1a3a1a] text-[#d0e8b0]"
        >
          <Minus size={13} />
        </button>
        <span className="w-6 text-center text-[13px] font-bold text-[#1a3a1a]">{item.qty}</span>
        <button
          type="button"
          onClick={() => onChange(item.id, item.qty + 1)}
          className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-lg border-none bg-[#1a3a1a] text-[#d0e8b0]"
        >
          <Plus size={13} />
        </button>
      </div>
    </div>
  );
}

export default function POSSystemPage() {
  const [activeNav, setActiveNav] = useState('pos');
  const [category, setCategory] = useState('All');
  const [cartItems, setCartItems] = useState(INITIAL_CART);
  const [paymentMode, setPaymentMode] = useState('cash');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const filtered = useMemo(() => PRODUCTS.filter((p) => category === 'All' || p.cat === category), [category]);

  const subtotal = useMemo(() => cartItems.reduce((s, i) => s + i.qty * i.price, 0), [cartItems]);
  const gst = Math.round(subtotal * 0.17);
  const total = subtotal + gst;
  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);

  const handleQty = (id, qty) =>
    setCartItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i)).filter((i) => i.qty > 0));

  const handleAdd = (product) =>
    setCartItems((prev) => {
      const exists = prev.find((i) => i.id === product.id);
      if (exists) return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { id: product.id, name: product.name, qty: 1, price: product.price }];
    });

  const dividerClass = 'my-[6px] h-px bg-[#c8d498]';
  const payBtnClass = (active) =>
    `flex flex-1 items-center justify-center gap-[6px] rounded-[10px] border px-0 py-[8px] text-[12px] font-bold transition-all duration-150 ${
      active ? 'border-[#1a3a1a] bg-[rgba(26,58,26,0.1)] text-[#1a3a1a]' : 'border-[#c0cc90] bg-transparent text-[#1a3a1a]'
    }`;

  const CartPanelContent = (
    <>
      <div className="mb-2.5 flex items-center gap-2">
        <ShoppingCart size={16} className="text-[#2a5a2a]" />
        <span className="text-[13px] font-extrabold uppercase tracking-[0.12em] text-[#1a3a1a]">Cart</span>
      </div>

      <div className={dividerClass} />

      {cartItems.map((item, idx) => (
        <div key={item.id}>
          <CartRow item={item} onChange={handleQty} />
          {idx < cartItems.length - 1 && <div className={dividerClass} />}
        </div>
      ))}

      <div className={dividerClass} />

      <div className="flex items-center justify-between px-0 py-1 text-[12px] text-[#5a7a45]">
        <span>Subtotal</span>
        <span>Rs {subtotal}</span>
      </div>
      <div className="flex items-center justify-between px-0 py-0.5 text-[12px] text-[#7a9a65]">
        <span>GST (17%)</span>
        <span>Rs {gst}</span>
      </div>

      <div className={dividerClass} />

      <div className="flex items-center justify-between px-0 py-1.5 text-[14px] font-extrabold text-[#1a3a1a]">
        <span>Total</span>
        <span>Rs {total}</span>
      </div>

      <div className="mt-2.5 flex gap-2">
        <button type="button" className={payBtnClass(paymentMode === 'cash')} onClick={() => setPaymentMode('cash')}>
          <Banknote size={13} /> Cash
        </button>
        <button type="button" className={payBtnClass(paymentMode === 'card')} onClick={() => setPaymentMode('card')}>
          <CreditCard size={13} /> Card
        </button>
      </div>

      <button type="button" className="mt-2.5 w-full rounded-xl border-none bg-[#1a3a1a] px-0 py-3 text-[13px] font-extrabold tracking-[0.02em] text-[#e4ecba] transition-colors duration-150 hover:bg-[#234f23]" onClick={() => setCartOpen(false)}>
        Generate Bill
      </button>
    </>
  );

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#cdd8a2] font-[Inter,sans-serif]">
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      {cartOpen && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setCartOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-50 flex w-52.5 min-w-52.5 flex-col overflow-y-auto bg-[#132e14] px-3.5 py-5 transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="mb-7 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <NexusLogo size={30} variant="light" />
            <div>
              <p className="m-0 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#e8e4b8]">User-Dashboard</p>
              <p className="m-0 text-[10px] text-[#8aaa70]">POS System</p>
            </div>
          </div>
          <button type="button" onClick={() => setSidebarOpen(false)} className="rounded p-1 text-[#8aaa70] lg:hidden" aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <p className="mb-1.5 mt-0 px-3.5 text-[9px] font-extrabold uppercase tracking-[0.2em] text-[#6a8a55]">Main</p>
        {NAV_MAIN.map((item) => (
          <NavItem key={item.id} icon={item.icon} label={item.label} active={activeNav === item.id} onClick={() => { setActiveNav(item.id); setSidebarOpen(false); }} />
        ))}

        <p className="mb-1.5 mt-5 px-3.5 text-[9px] font-extrabold uppercase tracking-[0.2em] text-[#6a8a55]">Account</p>
        {NAV_ACCOUNT.map((item) => (
          <NavItem key={item.id} icon={item.icon} label={item.label} active={activeNav === item.id} onClick={() => { setActiveNav(item.id); setSidebarOpen(false); }} />
        ))}

        <div className="flex-1" />

        <div className="rounded-[14px] border border-[#2a4a2a] bg-white/5 p-3.5">
          <p className="mb-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-[#6a8a55]">Plan</p>
          <p className="mb-2.5 text-[18px] font-black text-[#e8e4b8]">PRO</p>
          <div className="mb-2 h-1 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-[65%] rounded-full bg-[#6ab850]" />
          </div>
          <p className="m-0 text-[11px] text-[#8aaa70]">18 days left</p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-13.5 shrink-0 items-center justify-between gap-2 border-b border-white/10 bg-[#173a17] px-3 sm:gap-4 sm:px-5">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button type="button" onClick={() => setSidebarOpen(true)} className="shrink-0 rounded p-1 text-[#c8d898] lg:hidden" aria-label="Open menu">
              <Menu size={20} />
            </button>
            <div className="flex min-w-0 items-center gap-1.5 overflow-hidden sm:gap-2">
              <span className="hidden whitespace-nowrap text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#e8e4b8] sm:block">USER-DASHBOARD</span>
              <span className="hidden text-[14px] text-[#6ab850] sm:block">/</span>
              <span className="truncate text-[11px] font-semibold uppercase tracking-[0.04em] text-[#c0cc90]">POS System - Pharmacy</span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#d8eabb]">
              <span className="inline-block h-2 w-2 rounded-full bg-[#5dd456] shadow-[0_0_6px_#5dd456]" />
              <span className="hidden sm:inline">Online</span>
            </div>

            <button type="button" className="hidden whitespace-nowrap rounded-full border border-white/20 bg-transparent px-3.5 py-1.5 text-[12px] font-semibold text-[#e8e4b8] md:block">
              Pharmacy Module
            </button>

            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[rgba(110,185,80,0.3)] bg-[#1f491d] text-[11px] font-extrabold text-[#e8f2d8]">
              AK
            </div>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 gap-3 overflow-hidden p-3 sm:p-4">
          <div className="flex min-w-0 flex-1 flex-col gap-3 overflow-y-auto">
            <div className="flex flex-wrap gap-2">
              <div className="flex min-w-45 flex-1 items-center gap-2 rounded-[14px] border border-[#c4d094] bg-[#e4ecba] px-3.5 py-2.25">
                <input type="text" placeholder="Search product by name" className="min-w-0 flex-1 border-none bg-transparent text-[13px] text-[#1a3a1a] outline-none" />
                <Search size={15} className="shrink-0 text-[#5a7a45]" />
              </div>

              <button type="button" className="flex items-center gap-1.5 whitespace-nowrap rounded-[14px] border border-[#c4d094] bg-[#e4ecba] px-3.5 py-2.25 text-[12px] font-bold text-[#1a3a1a] sm:text-[13px]">
                <ScanLine size={15} />
                <span className="hidden xs:inline">Scan barcode</span>
                <span className="xs:hidden">Scan</span>
              </button>

              <button type="button" className="flex items-center gap-1.5 whitespace-nowrap rounded-[14px] border-none bg-[#1a3d1a] px-3.5 py-2.25 text-[12px] font-bold text-[#e4ecba] sm:text-[13px]">
                <Plus size={15} />
                <span className="hidden xs:inline">+ Add item</span>
                <span className="xs:hidden">Add</span>
              </button>
            </div>

            <div className="min-h-0 flex-1 rounded-[18px] border border-[#c4d494] bg-[#d8e4aa] p-3 sm:p-4">
              <p className="mb-2.5 text-[9px] font-extrabold uppercase tracking-[0.22em] text-[#5a7a45]">Products</p>

              <div className="mb-3 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {CATEGORIES.map((cat) => (
                  <CategoryPill key={cat} label={cat} active={category === cat} onClick={setCategory} />
                ))}
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
                {filtered.map((item) => (
                  <ProductCard key={item.id} item={item} onAdd={handleAdd} />
                ))}
              </div>
            </div>
          </div>

          <aside className="hidden w-59.5 shrink-0 flex-col overflow-y-auto rounded-[20px] border border-[#c8d498] bg-[#e0ebb6] p-4.5 lg:flex">
            {CartPanelContent}
          </aside>
        </div>
      </div>

      <div className={`fixed inset-x-0 bottom-0 z-50 max-h-[82vh] overflow-y-auto rounded-[20px_20px_0_0] border border-[#c8d498] bg-[#e0ebb6] px-4.5 py-5 transition-transform duration-300 lg:hidden ${cartOpen ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="mb-4 flex justify-center">
          <div className="h-1 w-9 rounded-full bg-[#b0c490]" />
        </div>
        {CartPanelContent}
      </div>

      <button type="button" onClick={() => setCartOpen((prev) => !prev)} className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full border-none bg-[#1a3a1a] px-4.5 py-3 text-[13px] font-bold text-[#e4ecba] shadow-xl lg:hidden">
        <ShoppingCart size={17} />
        Cart
        {cartCount > 0 && <span className="ml-0.5 rounded-full bg-[#6ab850] px-1.75 py-px text-[11px] font-extrabold text-white">{cartCount}</span>}
      </button>
    </div>
  );
}
