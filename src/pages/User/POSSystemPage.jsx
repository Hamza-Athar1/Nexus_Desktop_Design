import { useMemo, useState } from 'react';
import {
  Search,
  ScanLine,
  Plus,
  ShoppingCart,
  Package,
  ReceiptText,
  BarChart3,
  User,
  Settings2,
  LayoutDashboard,
  Minus,
  CreditCard,
  Banknote,
  Pill,
  Droplets,
  Syringe,
  AlertTriangle,
  Menu,
  MonitorSmartphone,
} from 'lucide-react';
import NexusLogo from '../../components/NexusLogo';


const NAV_MAIN = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'pos', label: 'POS System', icon: MonitorSmartphone },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'billing', label: 'Billing', icon: ReceiptText },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
];

const NAV_ACCOUNT = [
  { id: 'profile', label: 'Edit Profile', icon: User },
  { id: 'settings', label: 'Settings', icon: Settings2 },
];

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

function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        width: '100%',
        padding: '9px 14px',
        borderRadius: '999px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: active ? '600' : '500',
        textAlign: 'left',
        transition: 'all 0.18s ease',
        background: active ? '#dce8b2' : 'transparent',
        color: active ? '#0f2f10' : '#b8c99a',
      }}
    >
      <Icon size={15} style={{ color: active ? '#0f2f10' : '#8aab70', flexShrink: 0 }} />
      {label}
    </button>
  );
}

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

// Main Component 

export default function POSSystemPage() {
  const [activeNav, setActiveNav] = useState('pos');
  const [category, setCategory] = useState('All');
  const [cartItems, setCartItems] = useState(INITIAL_CART);
  const [paymentMode, setPaymentMode] = useState('cash');

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

  // â”€â”€ Inline style objects â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%', overflow: 'hidden', fontFamily: 'Inter, sans-serif', background: '#cdd8a2' }}>

      {/* â”€â”€ Sidebar â”€ */}
      <aside style={{
        width: '210px', minWidth: '210px',
        background: '#132e14',
        display: 'flex', flexDirection: 'column',
        padding: '20px 14px',
        overflowY: 'auto',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px', paddingLeft: '4px' }}>
          <NexusLogo size={30} variant="light" />
          <div>
            <p style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '0.16em', color: '#e8e4b8', textTransform: 'uppercase', margin: 0 }}>
              User-Dashboard
            </p>
            <p style={{ fontSize: '10px', color: '#8aaa70', margin: 0 }}>POS System</p>
          </div>
        </div>

        {/* Main nav */}
        <p style={{ fontSize: '9px', fontWeight: '800', letterSpacing: '0.2em', color: '#6a8a55', textTransform: 'uppercase', padding: '0 14px', marginBottom: '6px', marginTop: 0 }}>
          Main
        </p>
        {NAV_MAIN.map(item => (
          <NavItem key={item.id} icon={item.icon} label={item.label} active={activeNav === item.id} onClick={() => setActiveNav(item.id)} />
        ))}

        {/* Account nav */}
        <p style={{ fontSize: '9px', fontWeight: '800', letterSpacing: '0.2em', color: '#6a8a55', textTransform: 'uppercase', padding: '0 14px', marginBottom: '6px', marginTop: '20px' }}>
          Account
        </p>
        {NAV_ACCOUNT.map(item => (
          <NavItem key={item.id} icon={item.icon} label={item.label} active={activeNav === item.id} onClick={() => setActiveNav(item.id)} />
        ))}

        {/* Spacer */}
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

      {/* â”€â”€ Right side â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€*/}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <header style={{
          background: '#173a17',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px', height: '54px', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.16em', color: '#e8e4b8', textTransform: 'uppercase' }}>
              USER-DASHBOARD
            </span>
            <span style={{ color: '#6ab850', fontSize: '14px' }}>/</span>
            <span style={{ fontSize: '11px', fontWeight: '600', color: '#c0cc90', letterSpacing: '0.04em' }}>
              POS System - Pharmacy
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Online badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600', color: '#d8eabb' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#5dd456', boxShadow: '0 0 6px #5dd456', display: 'inline-block' }} />
              Online
            </div>

            {/* Pharmacy Module btn */}
            <button
              type="button"
              style={{ padding: '6px 16px', borderRadius: '999px', border: '1.5px solid rgba(255,255,255,0.22)', background: 'transparent', color: '#e8e4b8', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
            >
              Pharmacy Module
            </button>

            {/* Avatar */}
            <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#1f491d', border: '1.5px solid rgba(110,185,80,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '800', color: '#e8f2d8' }}>
              AK
            </div>
          </div>
        </header>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', padding: '18px', gap: '14px' }}>

          {/* â”€â”€ Left column â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€*/}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto' }}>

            {/* Toolbar row */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {/* Search */}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px', background: '#e4ecba', border: '1.5px solid #c4d094', borderRadius: '14px', padding: '10px 16px' }}>
                <input
                  type="text"
                  placeholder="Search product by name"
                  style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: '13px', color: '#1a3a1a', fontFamily: 'Inter, sans-serif' }}
                />
                <Search size={16} style={{ color: '#5a7a45', flexShrink: 0 }} />
              </div>

              {/* Scan barcode */}
              <button
                type="button"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '14px', border: '1.5px solid #c4d094', background: '#e4ecba', color: '#1a3a1a', fontSize: '13px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                <ScanLine size={16} />
                Scan barcode
              </button>

              {/* Add item */}
              <button
                type="button"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', borderRadius: '14px', border: 'none', background: '#1a3d1a', color: '#e4ecba', fontSize: '13px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                <Plus size={15} />
                + Add item
              </button>
            </div>

            {/* Products section */}
            <div style={{ background: '#d8e4aa', borderRadius: '18px', padding: '16px', border: '1px solid #c4d494', flex: 1, minHeight: 0 }}>
              <p style={{ fontSize: '9px', fontWeight: '800', letterSpacing: '0.22em', color: '#5a7a45', textTransform: 'uppercase', margin: '0 0 12px' }}>
                Products
              </p>

              {/* Category pills */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                {CATEGORIES.map(cat => (
                  <CategoryPill key={cat} label={cat} active={category === cat} onClick={setCategory} />
                ))}
              </div>

              {/* Product grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {filtered.map(item => (
                  <ProductCard key={item.id} item={item} onAdd={handleAdd} />
                ))}
              </div>
            </div>
          </div>

          {/* â”€â”€ Cart panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€*/}
          <aside style={{ width: '238px', minWidth: '238px', background: '#e0ebb6', border: '1px solid #c8d498', borderRadius: '20px', padding: '18px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>

            {/* Cart header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <ShoppingCart size={16} style={{ color: '#2a5a2a' }} />
              <span style={{ fontSize: '13px', fontWeight: '800', letterSpacing: '0.12em', color: '#1a3a1a', textTransform: 'uppercase' }}>
                Cart
              </span>
            </div>

            <div style={divider} />

            {/* Cart items */}
            {cartItems.map((item, idx) => (
              <div key={item.id}>
                <CartRow item={item} onChange={handleQty} />
                {idx < cartItems.length - 1 && <div style={divider} />}
              </div>
            ))}

            <div style={divider} />

            {/* Totals */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#5a7a45', padding: '4px 0' }}>
              <span>Subtotal</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#7a9a65', padding: '2px 0' }}>
              <span>GST (17%)</span>
            </div>

            <div style={divider} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', fontWeight: '800', color: '#1a3a1a', padding: '6px 0' }}>
              <span>Total</span>
            </div>

            {/* Payment buttons */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <button type="button" style={payBtn(paymentMode === 'cash')} onClick={() => setPaymentMode('cash')}>
                <Banknote size={13} /> Cash
              </button>
              <button type="button" style={payBtn(paymentMode === 'card')} onClick={() => setPaymentMode('card')}>
                <CreditCard size={13} /> Card
              </button>
            </div>

            {/* Generate Bill */}
            <button
              type="button"
              style={{ marginTop: '10px', width: '100%', padding: '12px 0', borderRadius: '12px', border: 'none', background: '#1a3a1a', color: '#e4ecba', fontSize: '13px', fontWeight: '800', cursor: 'pointer', letterSpacing: '0.02em', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#234f23'}
              onMouseLeave={e => e.currentTarget.style.background = '#1a3a1a'}
            >
              Generate Bill
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}

