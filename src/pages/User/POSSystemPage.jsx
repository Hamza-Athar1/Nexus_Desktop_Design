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
} from 'lucide-react';
import NexusLogo from '../../components/NexusLogo';
import UserSidebar from '../../components/UserSidebar';



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


// Sub-components

function CategoryPill({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(label)}
      style={{
        padding: '6px 18px',
        borderRadius: '999px',
        border: active ? '1.5px solid #3b7a3b' : '1.5px solid #c8d49a',
        background: active ? '#c8d49a' : 'transparent',
        color: active ? '#0f2f10' : '#3a5a2a',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.16s ease',
      }}
    >
      {label}
    </button>
  );
}

function ProductCard({ item, onAdd }) {
  const Icon = item.icon;
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={() => onAdd(item)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#1a3d1a',
        borderRadius: '20px',
        border: '1px solid #2a5a2a',
        padding: '18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        cursor: 'pointer',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hovered ? '0 10px 28px rgba(0,0,0,0.28)' : '0 2px 8px rgba(0,0,0,0.12)',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      }}
    >
      <div
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '14px',
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#a8d888',
        }}
      >
        <Icon size={20} />
      </div>

      <div>
        <p style={{ color: '#e8f0d0', fontWeight: '700', fontSize: '15px', margin: '0 0 3px' }}>
          {item.name}
        </p>
        <p style={{ color: '#7aaa65', fontSize: '12px', margin: '0 0 8px' }}>
          {item.detail}
        </p>
        <p style={{ color: '#f0f5d8', fontWeight: '900', fontSize: '20px', margin: '0 0 4px' }}>
          RS {item.price}
        </p>
        <p style={{
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          margin: 0,
          color: item.lowStock ? '#f87171' : '#88bb70',
        }}>
          Stock: {item.stock}
          {item.lowStock && <AlertTriangle size={12} />}
        </p>
      </div>
    </div>
  );
}

function CartRow({ item, onChange }) {
  return (
    <div style={{ padding: '10px 0' }}>
      <p style={{ fontSize: '13px', fontWeight: '600', color: '#1a3a1a', margin: '0 0 8px' }}>
        {item.name}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          type="button"
          onClick={() => onChange(item.id, item.qty - 1)}
          style={{
            width: '30px', height: '30px', borderRadius: '8px',
            background: '#1a3a1a', border: 'none', color: '#d0e8b0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0,
          }}
        >
          <Minus size={13} />
        </button>
        <span style={{ width: '24px', textAlign: 'center', fontSize: '13px', fontWeight: '700', color: '#1a3a1a' }}>
          {item.qty}
        </span>
        <button
          type="button"
          onClick={() => onChange(item.id, item.qty + 1)}
          style={{
            width: '30px', height: '30px', borderRadius: '8px',
            background: '#1a3a1a', border: 'none', color: '#d0e8b0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0,
          }}
        >
          <Plus size={13} />
        </button>
      </div>
    </div>
  );
}

//  Main Component 

export default function POSSystemPage() {
  const [activeNav, setActiveNav] = useState('pos');
  const [category, setCategory] = useState('All');
  const [cartItems, setCartItems] = useState(INITIAL_CART);
  const [paymentMode, setPaymentMode] = useState('cash');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const filtered = useMemo(
    () => PRODUCTS.filter(p => category === 'All' || p.cat === category),
    [category]
  );

  const subtotal = useMemo(
    () => cartItems.reduce((s, i) => s + i.qty * i.price, 0),
    [cartItems]
  );
  const gst = Math.round(subtotal * 0.17);
  const total = subtotal + gst;
  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);

  const handleQty = (id, qty) =>
    setCartItems(prev =>
      prev.map(i => i.id === id ? { ...i, qty: Math.max(1, qty) } : i).filter(i => i.qty > 0)
    );

  const handleAdd = (product) =>
    setCartItems(prev => {
      const exists = prev.find(i => i.id === product.id);
      if (exists) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { id: product.id, name: product.name, qty: 1, price: product.price }];
    });

  const divider = { height: '1px', background: '#c8d498', margin: '6px 0' };

  const payBtn = (active) => ({
    flex: 1,
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
    padding: '8px 0',
    borderRadius: '10px',
    border: active ? '1.5px solid #1a3a1a' : '1.5px solid #c0cc90',
    background: active ? 'rgba(26,58,26,0.1)' : 'transparent',
    color: '#1a3a1a',
    fontSize: '12px', fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.15s',
  });

  //  Cart panel inner content (shared between drawer + sidebar) 
  const CartPanelContent = (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <ShoppingCart size={16} style={{ color: '#2a5a2a' }} />
        <span style={{ fontSize: '13px', fontWeight: '800', letterSpacing: '0.12em', color: '#1a3a1a', textTransform: 'uppercase' }}>
          Cart
        </span>
      </div>

      <div style={divider} />

      {cartItems.map((item, idx) => (
        <div key={item.id}>
          <CartRow item={item} onChange={handleQty} />
          {idx < cartItems.length - 1 && <div style={divider} />}
        </div>
      ))}

      <div style={divider} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#5a7a45', padding: '4px 0' }}>
        <span>Subtotal</span>
        <span>Rs {subtotal}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#7a9a65', padding: '2px 0' }}>
        <span>GST (17%)</span>
        <span>Rs {gst}</span>
      </div>

      <div style={divider} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', fontWeight: '800', color: '#1a3a1a', padding: '6px 0' }}>
        <span>Total</span>
        <span>Rs {total}</span>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
        <button type="button" style={payBtn(paymentMode === 'cash')} onClick={() => setPaymentMode('cash')}>
          <Banknote size={13} /> Cash
        </button>
        <button type="button" style={payBtn(paymentMode === 'card')} onClick={() => setPaymentMode('card')}>
          <CreditCard size={13} /> Card
        </button>
      </div>

      <button
        type="button"
        style={{ marginTop: '10px', width: '100%', padding: '12px 0', borderRadius: '12px', border: 'none', background: '#1a3a1a', color: '#e4ecba', fontSize: '13px', fontWeight: '800', cursor: 'pointer', letterSpacing: '0.02em', transition: 'background 0.15s' }}
        onMouseEnter={e => e.currentTarget.style.background = '#234f23'}
        onMouseLeave={e => e.currentTarget.style.background = '#1a3a1a'}
      >
        Generate Bill
      </button>
    </>
  );

  return (
    <div className="flex h-screen w-full overflow-hidden font-[Inter,sans-serif]" style={{ background: '#cdd8a2' }}>

      {/*  Mobile overlays ”€ */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      {cartOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setCartOpen(false)} />
      )}

      {/*  Sidebar ”€ */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col overflow-y-auto transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ width: '210px', minWidth: '210px', background: '#132e14', padding: '20px 14px' }}
      >
        {/* Logo + close */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <NexusLogo size={30} variant="light" />
            <div>
              <p style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '0.16em', color: '#e8e4b8', textTransform: 'uppercase', margin: 0 }}>
                User-Dashboard
              </p>
              <p style={{ fontSize: '10px', color: '#8aaa70', margin: 0 }}>POS System</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
            style={{ background: 'none', border: 'none', color: '#8aaa70', cursor: 'pointer', padding: '4px', lineHeight: 1 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Main nav */}
        <p style={{ fontSize: '9px', fontWeight: '800', letterSpacing: '0.2em', color: '#6a8a55', textTransform: 'uppercase', padding: '0 14px', marginBottom: '6px', marginTop: 0 }}>
          Main
        </p>
        {NAV_MAIN.map(item => (
          <NavItem key={item.id} icon={item.icon} label={item.label} active={activeNav === item.id} onClick={() => { setActiveNav(item.id); setSidebarOpen(false); }} />
        ))}

        {/* Account nav */}
        <p style={{ fontSize: '9px', fontWeight: '800', letterSpacing: '0.2em', color: '#6a8a55', textTransform: 'uppercase', padding: '0 14px', marginBottom: '6px', marginTop: '20px' }}>
          Account
        </p>
        {NAV_ACCOUNT.map(item => (
          <NavItem key={item.id} icon={item.icon} label={item.label} active={activeNav === item.id} onClick={() => { setActiveNav(item.id); setSidebarOpen(false); }} />
        ))}

        <div style={{ flex: 1 }} />

        {/* PRO plan box */}
        <div style={{ border: '1px solid #2a4a2a', borderRadius: '14px', padding: '14px', background: 'rgba(255,255,255,0.04)' }}>
          <p style={{ fontSize: '9px', fontWeight: '700', letterSpacing: '0.16em', color: '#6a8a55', textTransform: 'uppercase', margin: '0 0 2px' }}>Plan</p>
          <p style={{ fontSize: '18px', fontWeight: '900', color: '#e8e4b8', margin: '0 0 10px' }}>PRO</p>
          <div style={{ height: '4px', borderRadius: '999px', background: 'rgba(255,255,255,0.12)', marginBottom: '8px', overflow: 'hidden' }}>
            <div style={{ width: '65%', height: '100%', borderRadius: '999px', background: '#6ab850' }} />
          </div>
          <p style={{ fontSize: '11px', color: '#8aaa70', margin: 0 }}>18 days left</p>
        </div>
      </aside>

      {/*  Right side  */}
      <div className="flex flex-1 min-w-0 flex-col overflow-hidden">

        {/* Header */}
        <header
          className="flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-5 shrink-0"
          style={{ background: '#173a17', borderBottom: '1px solid rgba(255,255,255,0.06)', height: '54px' }}
        >
          {/* Left: hamburger + breadcrumb */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden shrink-0"
              style={{ background: 'none', border: 'none', color: '#c8d898', cursor: 'pointer', padding: '4px', lineHeight: 1 }}
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 overflow-hidden">
              <span className="hidden sm:block text-[11px] font-[800] tracking-[0.16em] uppercase whitespace-nowrap" style={{ color: '#e8e4b8' }}>
                USER-DASHBOARD
              </span>
              <span className="hidden sm:block" style={{ color: '#6ab850', fontSize: '14px' }}>/</span>
              <span className="text-[11px] font-[600] truncate" style={{ color: '#c0cc90', letterSpacing: '0.04em' }}>
                POS System - Pharmacy
              </span>
            </div>
          </div>

          {/* Right: online + module btn + avatar */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="flex items-center gap-1.5 text-[12px] font-[600]" style={{ color: '#d8eabb' }}>
              <span className="w-2 h-2 rounded-full inline-block" style={{ background: '#5dd456', boxShadow: '0 0 6px #5dd456' }} />
              <span className="hidden sm:inline">Online</span>
            </div>

            <button
              type="button"
              className="hidden md:block text-[12px] font-[600]"
              style={{ padding: '6px 14px', borderRadius: '999px', border: '1.5px solid rgba(255,255,255,0.22)', background: 'transparent', color: '#e8e4b8', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              Pharmacy Module
            </button>

            <div
              className="flex items-center justify-center rounded-full shrink-0"
              style={{ width: '32px', height: '32px', background: '#1f491d', border: '1.5px solid rgba(110,185,80,0.3)', fontSize: '11px', fontWeight: '800', color: '#e8f2d8' }}
            >
              AK
            </div>
          </div>
        </header>

        {/* Content wrapper */}
        <div className="flex flex-1 min-h-0 overflow-hidden p-3 sm:p-4 gap-3">

          {/*  Left column  */}
          <div className="flex flex-1 min-w-0 flex-col gap-3 overflow-y-auto">

            {/* Toolbar */}
            <div className="flex flex-wrap gap-2">
              {/* Search  full width on mobile, flex-1 on sm */}
              <div
                className="flex items-center gap-2 flex-1 min-w-[180px]"
                style={{ background: '#e4ecba', border: '1.5px solid #c4d094', borderRadius: '14px', padding: '9px 14px' }}
              >
                <input
                  type="text"
                  placeholder="Search product by name"
                  style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: '13px', color: '#1a3a1a', fontFamily: 'Inter, sans-serif', minWidth: 0 }}
                />
                <Search size={15} style={{ color: '#5a7a45', flexShrink: 0 }} />
              </div>

              {/* Scan barcode */}
              <button
                type="button"
                className="flex items-center gap-1.5 text-[12px] sm:text-[13px] font-[700]"
                style={{ padding: '9px 14px', borderRadius: '14px', border: '1.5px solid #c4d094', background: '#e4ecba', color: '#1a3a1a', cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                <ScanLine size={15} />
                <span className="hidden xs:inline">Scan barcode</span>
                <span className="xs:hidden">Scan</span>
              </button>

              {/* Add item */}
              <button
                type="button"
                className="flex items-center gap-1.5 text-[12px] sm:text-[13px] font-[700]"
                style={{ padding: '9px 14px', borderRadius: '14px', border: 'none', background: '#1a3d1a', color: '#e4ecba', cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                <Plus size={15} />
                <span className="hidden xs:inline">+ Add item</span>
                <span className="xs:hidden">Add</span>
              </button>
            </div>

            {/* Products section */}
            <div className="flex-1 min-h-0 rounded-[18px] p-3 sm:p-4" style={{ background: '#d8e4aa', border: '1px solid #c4d494' }}>
              <p style={{ fontSize: '9px', fontWeight: '800', letterSpacing: '0.22em', color: '#5a7a45', textTransform: 'uppercase', margin: '0 0 10px' }}>
                Products
              </p>

              {/* Category pills  horizontally scrollable on mobile */}
              <div className="flex gap-2 mb-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                {CATEGORIES.map(cat => (
                  <CategoryPill key={cat} label={cat} active={category === cat} onClick={setCategory} />
                ))}
              </div>

              {/* Product grid  1 col  2 col  3 col */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                {filtered.map(item => (
                  <ProductCard key={item.id} item={item} onAdd={handleAdd} />
                ))}
              </div>
            </div>
          </div>

          {/*  Cart panel  desktop static sidebar  */}
          <aside
            className="hidden lg:flex flex-col overflow-y-auto flex-shrink-0"
            style={{ width: '238px', background: '#e0ebb6', border: '1px solid #c8d498', borderRadius: '20px', padding: '18px' }}
          >
            {CartPanelContent}
          </aside>
        </div>
      </div>

      {/*  Mobile cart drawer (slide up from bottom)  */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 lg:hidden transition-transform duration-300 ${cartOpen ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ background: '#e0ebb6', border: '1px solid #c8d498', borderRadius: '20px 20px 0 0', padding: '20px 18px', maxHeight: '82vh', overflowY: 'auto' }}
      >
        {/* Drawer handle */}
        <div className="flex justify-center mb-4">
          <div style={{ width: '36px', height: '4px', borderRadius: '999px', background: '#b0c490' }} />
        </div>
        {CartPanelContent}
      </div>

      {/*  Floating cart button (mobile only)  */}
      <button
        type="button"
        onClick={() => setCartOpen(prev => !prev)}
        className="fixed bottom-5 right-5 z-50 lg:hidden flex items-center gap-2 shadow-xl"
        style={{ background: '#1a3a1a', color: '#e4ecba', border: 'none', borderRadius: '999px', padding: '12px 18px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
      >
        <ShoppingCart size={17} />
        Cart
        {cartCount > 0 && (
          <span
            style={{ background: '#6ab850', color: '#fff', fontSize: '11px', fontWeight: '800', borderRadius: '999px', padding: '1px 7px', marginLeft: '2px' }}
          >
            {cartCount}
          </span>
        )}
      </button>
    </div>
  );
}

