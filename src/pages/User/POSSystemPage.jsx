import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Trash2, Barcode, RotateCcw, Monitor, Grid, Zap, LayoutGrid, SlidersHorizontal, Plus, Keyboard, ShoppingBag, Check } from 'lucide-react';
import { apiFetchJson } from '../../lib/api.js';
import { createSale } from '../../lib/salesService.js';
import { scanBarcodeApi } from '../../lib/inventoryService.js';
import ViewInvoiceModal from '../../components/Admin/ViewInvoiceModal.jsx';
import BarcodeScannerModal from '../../components/BarcodeScannerModal.jsx';
import CashierReturnModal from '../../components/User/CashierReturnModal.jsx';
import POSLayoutSelectorModal from '../../components/User/POSLayoutSelectorModal.jsx';
import { getCustomers } from '../../lib/customerService.js';
import { useAuth } from '../../context/AuthContext';

function POSClock() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDateTime = useMemo(() => {
    const optionsDate = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
    const optionsTime = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
    const dateStr = currentTime.toLocaleDateString('en-US', optionsDate);
    const timeStr = currentTime.toLocaleTimeString('en-US', optionsTime);
    return `${dateStr} ${timeStr}`;
  }, [currentTime]);

  return <p className="text-xs font-bold text-[#0d3410]/90 font-mono">{formattedDateTime}</p>;
}

export default function POSSystemPage() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const receiptSettings = user?.receiptSettings || {};
  const displayShopName = receiptSettings.shopName || user?.businessName || 'Imtiaz Super Market';
  const displayLogo = receiptSettings.logoUrl || '/Nexus_superadmin.png';

  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // Real Customers State
  const [customerList, setCustomerList] = useState([{ id: null, name: 'Walk-in Customer' }]);
  const [activeCustomerIndex, setActiveCustomerIndex] = useState(0);

  // POS Layout preference state derived from server user preference
  const [posLayout, setPosLayout] = useState(() => user?.posLayout || 'grid');
  const [isLayoutModalOpen, setIsLayoutModalOpen] = useState(false);

  useEffect(() => {
    if (user?.posLayout) {
      setPosLayout(user.posLayout);
    }
  }, [user?.posLayout]);

  // Cart / Invoice state per customer
  const [carts, setCarts] = useState({ 0: [] });
  const [laborCharges, setLaborCharges] = useState({ 0: 0 });

  // Invoice numbers / checkout state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [_checkoutError, setCheckoutError] = useState(null);
  const [completedSale, setCompletedSale] = useState(null);

  // Search input & Category filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Scan simulation & camera scanner state
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [barcodeScanError, setBarcodeScanError] = useState(null);
  const [barcodeScanSuccess, setBarcodeScanSuccess] = useState(null);

  // Fetch real inventory products from backend
  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    setFetchError(null);
    try {
      const res = await apiFetchJson('/inventory/items');
      if (res.ok && Array.isArray(res.data?.items)) {
        setProducts(res.data.items);
      } else {
        setProducts([]);
        setFetchError(res.data?.message || 'Failed to fetch inventory from backend');
      }
    } catch (err) {
      setProducts([]);
      setFetchError(err.message || 'Server connection error');
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Fetch real customers from backend
  const fetchCustomers = async () => {
    try {
      const res = await getCustomers();
      if (res.ok && Array.isArray(res.data?.customers) && res.data.customers.length > 0) {
        setCustomerList([{ id: null, name: 'Walk-in Customer' }, ...res.data.customers]);
      } else {
        setCustomerList([{ id: null, name: 'Walk-in Customer' }]);
      }
    } catch {
      setCustomerList([{ id: null, name: 'Walk-in Customer' }]);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCustomers();
  }, []);

  // Extract unique categories from products
  const categories = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      const cat = p.category || p.category_name;
      if (cat) set.add(cat);
    });
    return ['All', ...Array.from(set)];
  }, [products]);

  // Filter products by category and search term
  const displayedProducts = useMemo(() => {
    let list = products;
    if (selectedCategory !== 'All') {
      list = list.filter((p) => (p.category || p.category_name) === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.barcode && p.barcode.toLowerCase().includes(q)) ||
          (p.sku && p.sku.toLowerCase().includes(q))
      );
    }
    return list;
  }, [products, selectedCategory, searchQuery]);

  const currentCart = useMemo(() => carts[activeCustomerIndex] || [], [carts, activeCustomerIndex]);
  const currentLabor = laborCharges[activeCustomerIndex] || 0;

  // Subtotal, Tax, Total calculations
  const subtotal = useMemo(() => {
    return currentCart.reduce((sum, item) => sum + Number(item.price || item.sale_price) * item.qty, 0);
  }, [currentCart]);

  const taxAmount = useMemo(() => {
    const totalTax = currentCart.reduce((sum, item) => {
      const lineSub = Number(item.price || item.sale_price || 0) * item.qty;
      const lineTax = lineSub * (Number(item.tax_rate || 0) / 100);
      return sum + lineTax;
    }, 0);
    return Math.round(totalTax * 100) / 100;
  }, [currentCart]);

  const total = useMemo(() => {
    return Math.round((subtotal + taxAmount + Number(currentLabor)) * 100) / 100;
  }, [subtotal, taxAmount, currentLabor]);

  // Real Barcode Lookup Handler
  const handleBarcodeLookup = async (barcodeVal) => {
    if (!barcodeVal || !barcodeVal.trim()) return;
    const cleanBarcode = barcodeVal.trim();
    setBarcodeScanError(null);
    setBarcodeScanSuccess(null);

    try {
      const res = await scanBarcodeApi(cleanBarcode);
      if (res.ok && res.data?.item) {
        const matchedItem = res.data.item;
        const matchedVariant = matchedItem.matched_variant || null;
        addItemToCart(matchedItem, matchedVariant);

        const displayName =
          matchedVariant && (matchedVariant.size || matchedVariant.color)
            ? `${matchedItem.name} (${[matchedVariant.size, matchedVariant.color].filter(Boolean).join('/')})`
            : matchedItem.name;

        setBarcodeScanSuccess(`Scanned & Added: ${displayName}`);
        return true;
      } else {
        setBarcodeScanError(`Barcode not found: "${cleanBarcode}"`);
        return false;
      }
    } catch (err) {
      setBarcodeScanError(err.message || `No item found matching barcode "${cleanBarcode}"`);
      return false;
    }
  };

  // Add item to cart helper with stock check
  const addItemToCart = (product, selectedVariant = null) => {
    const variant = selectedVariant || product.matched_variant || null;
    const prodId = Number(product.id);
    const varId = variant ? Number(variant.id) : null;
    const itemKey = varId ? `${prodId}-v${varId}` : `${prodId}`;

    const prodName =
      variant && (variant.size || variant.color)
        ? `${product.name} (${[variant.size, variant.color].filter(Boolean).join(' / ')})`
        : product.name;

    const prodPrice = Number(
      variant
        ? variant.sale_price || product.sale_price || product.price || 0
        : product.sale_price ?? product.price ?? 0
    );
    const prodStock = Number(
      variant ? variant.stock_quantity : product.stock_quantity ?? product.stock ?? 9999
    );
    const prodTaxRate = Number(product.tax_rate ?? product.taxRate ?? product.module_specific_fields?.tax_rate ?? 0);

    if (prodStock <= 0) {
      alert(`Cannot add "${prodName}": Out of Stock.`);
      return;
    }

    setCarts((prev) => {
      const activeCart = prev[activeCustomerIndex] || [];
      const existingItemIndex = activeCart.findIndex(
        (item) => (item.key ? item.key === itemKey : item.id === prodId && item.variantId === varId)
      );

      let newCart;
      if (existingItemIndex >= 0) {
        const currentQty = activeCart[existingItemIndex].qty;
        if (currentQty + 1 > prodStock) {
          alert(`Cannot add more than available stock (${prodStock} units).`);
          return prev;
        }
        newCart = activeCart.map((item, idx) =>
          idx === existingItemIndex ? { ...item, qty: item.qty + 1 } : item
        );
      } else {
        newCart = [
          ...activeCart,
          {
            key: itemKey,
            id: prodId,
            variantId: varId,
            name: prodName,
            price: prodPrice,
            stock: prodStock,
            tax_rate: prodTaxRate,
            qty: 1,
            sku: product.sku || '',
            barcode: product.barcode || '',
          },
        ];
      }

      return { ...prev, [activeCustomerIndex]: newCart };
    });
  };

  // Update item qty in cart
  const updateQty = (itemKeyOrId, newQty) => {
    setCarts((prev) => {
      const activeCart = prev[activeCustomerIndex] || [];
      const item = activeCart.find((i) => i.key === itemKeyOrId || i.id === itemKeyOrId);
      if (item && newQty > item.stock) {
        alert(`Maximum stock available for "${item.name}" is ${item.stock} units.`);
        return prev;
      }

      const updated = activeCart.map((item) =>
        item.key === itemKeyOrId || item.id === itemKeyOrId
          ? { ...item, qty: Math.max(0.001, Number(newQty)) }
          : item
      );
      return { ...prev, [activeCustomerIndex]: updated };
    });
  };

  // Remove item from cart
  const removeItem = (itemKeyOrId) => {
    setCarts((prev) => {
      const activeCart = prev[activeCustomerIndex] || [];
      const updated = activeCart.filter((item) => item.key !== itemKeyOrId && item.id !== itemKeyOrId);
      return { ...prev, [activeCustomerIndex]: updated };
    });
  };

  // Clear current cart/inputs
  const handleClear = () => {
    setCarts((prev) => ({ ...prev, [activeCustomerIndex]: [] }));
    setLaborCharges((prev) => ({ ...prev, [activeCustomerIndex]: 0 }));
    setCheckoutError(null);
  };

  // Real Checkout Handler
  const handleCheckout = async () => {
    if (!currentCart || currentCart.length === 0) {
      alert('Cart is empty! Please add products before checking out.');
      return;
    }

    try {
      const selectedCust = customerList[activeCustomerIndex];
      const res = await createSale({
        customerId: selectedCust?.id || null,
        items: currentCart.map((item) => ({
          productId: Number(item.id),
          variantId: item.variantId ? Number(item.variantId) : undefined,
          quantity: Number(item.qty),
          discountAmount: 0,
        })),
        payment: { method: 'cash', amount: total },
        note: selectedCust?.id ? `Customer: ${selectedCust.name}` : 'Walk-in Customer - POS Sale',
      });

      if (!res.ok) {
        throw new Error(res.data?.message || 'Checkout failed');
      }

      setCompletedSale(res.data.sale);
      handleClear();
      fetchProducts();
    } catch (err) {
      setCheckoutError(err.message);
      alert(`Checkout Rejected: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Switch POS Layout with API persistence
  const switchLayout = async (newLayout) => {
    setPosLayout(newLayout);
    try {
      await apiFetchJson('/profile/pos-layout', {
        method: 'PATCH',
        body: JSON.stringify({ layout: newLayout }),
      });
      if (refreshUser) refreshUser();
    } catch (err) {
      console.error('Failed to persist POS layout:', err);
    }
  };

  // Fast Cashier Keyboard listener (F12 checkout, ESC clear, F2 search focus, F8 returns)
  useEffect(() => {
    if (posLayout !== 'fast') return;
    const handleKeyDown = (e) => {
      if (e.key === 'F12') {
        e.preventDefault();
        handleCheckout();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleClear();
      } else if (e.key === 'F2') {
        e.preventDefault();
        const searchInput = document.getElementById('fast-pos-search');
        if (searchInput) searchInput.focus();
      } else if (e.key === 'F8') {
        e.preventDefault();
        setIsReturnModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posLayout, currentCart, total]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#efe9c4] text-[#0f2e13] font-sans">
      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-3 sm:px-6 sm:py-4">
        {/* Top Navigation & Brand Header */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          {/* Logo Brand */}
          <div className="flex items-center select-none">
            <img
              src={displayLogo}
              alt="Store Logo"
              className="w-32 sm:w-40 h-auto object-contain max-h-16 md:max-h-20"
            />
          </div>

          {/* Center Store Title & POS Layout Switcher */}
          <div className="flex flex-col items-center gap-1.5">
            <h1
              className="text-2xl sm:text-3xl font-extrabold tracking-wide text-center uppercase"
              style={{ color: 'var(--color-primary)' }}
            >
              {displayShopName}
            </h1>

            {/* Layout selector pills + visual modal trigger */}
            <div className="flex items-center gap-1.5 bg-[#0f2e13]/10 p-1 rounded-xl border border-[#0f2e13]/15">
              {[
                { id: 'classic', label: 'Classic POS', icon: Monitor },
                { id: 'grid', label: 'Touch Grid', icon: Grid },
                { id: 'fast', label: 'Fast POS', icon: Zap },
                { id: 'modern', label: 'Modern Retail', icon: LayoutGrid },
              ].map((l) => {
                const IconC = l.icon;
                const isCurrent = posLayout === l.id;
                return (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => switchLayout(l.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                      isCurrent
                        ? 'bg-[#0f2e13] text-[#efe9c4] shadow-xs'
                        : 'text-[#0f2e13]/70 hover:text-[#0f2e13] hover:bg-white/40'
                    }`}
                  >
                    <IconC className="w-3.5 h-3.5" />
                    <span>{l.label}</span>
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setIsLayoutModalOpen(true)}
                title="Choose Terminal Design"
                className="p-1 rounded-lg hover:bg-white/40 text-[#0f2e13] transition cursor-pointer"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Clock, Returns and Login */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <POSClock />
            </div>
            <button
              onClick={() => setIsReturnModalOpen(true)}
              className="bg-amber-800 text-[#efe9c4] hover:bg-amber-900 text-xs font-extrabold px-4 py-2.5 rounded-full transition-all duration-200 tracking-wider cursor-pointer active:scale-95 shadow-md flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              RETURNS
            </button>
            <button
              onClick={() => navigate('/admin-login')}
              className="text-[#efe9c4] text-xs font-extrabold px-4 py-2.5 rounded-full transition-all duration-200 tracking-wider cursor-pointer active:scale-95 shadow-md"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              ADMIN LOGIN
            </button>
          </div>
        </header>

        {/* Error / Empty State Banners */}
        {fetchError && (
          <div className="w-full p-3 mb-4 bg-red-100 border border-red-300 text-red-800 rounded-xl text-xs font-bold flex justify-between items-center">
            <span>Error loading products: {fetchError}</span>
            <button onClick={fetchProducts} className="underline font-extrabold cursor-pointer">
              Retry
            </button>
          </div>
        )}

        {!fetchError && !isLoadingProducts && products.length === 0 && (
          <div className="w-full p-3 mb-4 bg-amber-100 border border-amber-300 text-amber-900 rounded-xl text-xs font-bold text-center">
            No products available in inventory. Please add products from Admin Inventory.
          </div>
        )}

        {/* Customer selection tab bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 bg-white/60 p-2 rounded-2xl border border-[#0f2e13]/10">
          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-black text-[#0f2e13]/60 self-center uppercase tracking-wider px-2">Customer:</span>
            {customerList.map((cust, idx) => {
              const isActive = activeCustomerIndex === idx;
              return (
                <button
                  key={cust.id ?? `walkin-${idx}`}
                  onClick={() => setActiveCustomerIndex(idx)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'text-white shadow-xs font-extrabold'
                      : 'bg-white/80 border border-[#0f2e13]/20 text-[#0f2e13] hover:bg-white'
                  }`}
                  style={isActive ? { backgroundColor: 'var(--color-primary)' } : {}}
                >
                  {cust.name}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-[#0f2e13]/70 px-2">
            <span>Layout:</span>
            <span className="bg-[#0f2e13] text-[#efe9c4] px-2.5 py-0.5 rounded-full text-[10px] uppercase font-black">
              {posLayout}
            </span>
          </div>
        </div>

        {/* Notifications */}
        {barcodeScanSuccess && (
          <div className="w-full p-3 mb-4 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex justify-between items-center">
            <span>{barcodeScanSuccess}</span>
            <button onClick={() => setBarcodeScanSuccess(null)} className="font-extrabold cursor-pointer">
              ✕
            </button>
          </div>
        )}
        {barcodeScanError && (
          <div className="w-full p-3 mb-4 bg-red-100 border border-red-300 text-red-900 rounded-xl text-xs font-bold flex justify-between items-center">
            <span>{barcodeScanError}</span>
            <button onClick={() => setBarcodeScanError(null)} className="font-extrabold cursor-pointer">
              ✕
            </button>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* LAYOUT 1 — CLASSIC POS (TRADITIONAL SUPERMARKET REGISTER)            */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        {posLayout === 'classic' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left 7 cols: Search Bar & Product Catalog List */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-[#0f2e13]/15 p-5 flex flex-col gap-4 shadow-sm min-h-[500px]">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 border-b border-gray-100 pb-3">
                <div>
                  <h2 className="text-base font-extrabold text-[#0f2e13] flex items-center gap-2">
                    <Monitor className="w-5 h-5 text-amber-700" /> Classic Register Catalog
                  </h2>
                  <p className="text-xs text-gray-500 font-medium">Search items or click to add directly to receipt</p>
                </div>

                {/* Camera Scanner Trigger */}
                <button
                  type="button"
                  onClick={() => setIsScannerOpen(true)}
                  className="px-3.5 py-1.5 bg-[#0f2e13] text-[#efe9c4] text-xs font-bold rounded-xl hover:bg-[#0f2e13]/90 transition flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                >
                  <Barcode className="w-4 h-4" /> Scan Barcode
                </button>
              </div>

              {/* Search input bar */}
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search product name, SKU, or barcode..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 pr-10 text-xs font-bold text-[#0f2e13] outline-none focus:border-[#0f2e13] focus:bg-white transition"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Product list grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[420px] overflow-y-auto pr-1">
                {displayedProducts.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => addItemToCart(p)}
                    className="p-3 bg-[#efe9c4]/20 hover:bg-[#efe9c4]/60 border border-[#0f2e13]/15 rounded-2xl flex flex-col justify-between items-start text-left gap-2 transition cursor-pointer select-none group"
                  >
                    <div>
                      <h4 className="font-bold text-xs text-[#0f2e13] group-hover:text-amber-800 line-clamp-2">{p.name}</h4>
                      <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                        {p.barcode ? `BC: ${p.barcode}` : p.sku ? `SKU: ${p.sku}` : ''}
                      </p>
                    </div>
                    <div className="w-full flex justify-between items-center pt-2 border-t border-[#0f2e13]/10">
                      <span className="font-mono text-xs font-black text-[#ca8a04]">Rs. {p.sale_price ?? p.price}</span>
                      <span className="text-[10px] font-bold text-[#0f2e13]/70 bg-white px-2 py-0.5 rounded-full border border-gray-200">
                        {p.stock_quantity ?? p.stock ?? 0} in stock
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right 5 cols: Live Receipt Cart & Checkout */}
            <div className="lg:col-span-5 flex flex-col bg-white rounded-3xl border border-[#0f2e13]/15 overflow-hidden shadow-sm">
              <div className="px-5 py-3 bg-[#0f2e13] text-[#efe9c4] flex justify-between items-center">
                <span className="text-sm font-black tracking-wide uppercase flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-amber-400" /> Current Invoice
                </span>
                <button
                  onClick={handleClear}
                  className="bg-white/10 hover:bg-white/20 text-xs font-bold px-3 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear
                </button>
              </div>

              {/* Items Table */}
              <div className="p-4 flex-1 overflow-y-auto max-h-[300px]">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-[10px] font-extrabold uppercase text-gray-400 border-b border-gray-100 pb-2">
                      <th className="pb-2 w-1/2">Item Description</th>
                      <th className="pb-2 text-center w-1/4">Qty</th>
                      <th className="pb-2 text-right w-1/4">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-semibold">
                    {currentCart.length > 0 ? (
                      currentCart.map((item) => (
                        <tr key={item.key || item.id}>
                          <td className="py-2.5 pr-2">
                            <p className="font-bold text-[#0f2e13] truncate max-w-[150px]">{item.name}</p>
                            <button
                              onClick={() => removeItem(item.key || item.id)}
                              className="text-[10px] text-red-500 font-bold hover:underline"
                            >
                              Remove
                            </button>
                          </td>
                          <td className="py-2.5 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => updateQty(item.key || item.id, item.qty - 1)}
                                className="w-5 h-5 bg-gray-100 rounded hover:bg-gray-200 text-xs font-bold"
                              >
                                -
                              </button>
                              <span className="font-mono font-bold px-1 text-xs">{item.qty}</span>
                              <button
                                onClick={() => updateQty(item.key || item.id, item.qty + 1)}
                                className="w-5 h-5 bg-gray-100 rounded hover:bg-gray-200 text-xs font-bold"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="py-2.5 text-right font-mono font-bold">Rs. {item.price * item.qty}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="py-12 text-center text-gray-400 font-medium">
                          No items in cart
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Total & Checkout Controls */}
              <div className="bg-[#efe9c4]/30 p-4 border-t border-[#0f2e13]/10 space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-gray-700">
                  <span>Subtotal:</span>
                  <span className="font-mono">Rs. {subtotal}</span>
                </div>
                {taxAmount > 0 && (
                  <div className="flex justify-between items-center text-xs font-bold text-gray-700">
                    <span>Tax:</span>
                    <span className="font-mono">Rs. {taxAmount}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-base font-black text-[#0f2e13] pt-2 border-t border-[#0f2e13]/15">
                  <span>TOTAL DUE:</span>
                  <span className="font-mono text-xl text-emerald-800">Rs. {total}</span>
                </div>

                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={isSubmitting || currentCart.length === 0}
                  className="w-full bg-[#0f2e13] text-[#efe9c4] hover:bg-[#0f2e13]/90 font-black text-sm uppercase py-3 rounded-xl shadow-md disabled:opacity-50 transition cursor-pointer"
                >
                  {isSubmitting ? 'Processing...' : `PAY & COMPLETE SALE (Rs. ${total})`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* LAYOUT 2 — TOUCHSCREEN GRID POS (TABLET & TOUCH OPTIMIZED)            */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        {posLayout === 'grid' && (
          <div className="flex flex-col gap-4">
            {/* Category horizontal scroll bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <span className="text-xs font-black uppercase text-[#0f2e13]/70 shrink-0 px-1">Category:</span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2 rounded-2xl text-xs font-extrabold shrink-0 transition cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#0f2e13] text-[#efe9c4] shadow-xs'
                      : 'bg-white text-[#0f2e13] hover:bg-gray-100 border border-[#0f2e13]/15'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Left 7 cols: Touch-friendly Product Tiles */}
              <div className="lg:col-span-7 bg-white rounded-3xl border border-[#0f2e13]/15 p-5 flex flex-col gap-4 shadow-sm min-h-[500px]">
                <div className="flex justify-between items-center">
                  <h2 className="text-base font-black text-[#0f2e13] flex items-center gap-2 uppercase tracking-wide">
                    <Grid className="w-5 h-5 text-emerald-700" /> Touchscreen Product Tiles
                  </h2>
                  <span className="text-xs font-bold text-gray-500">{displayedProducts.length} items</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 max-h-[460px] overflow-y-auto pr-1">
                  {displayedProducts.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => addItemToCart(p)}
                      className="p-4 bg-[#efe9c4]/30 hover:bg-[#efe9c4] border-2 border-[#0f2e13]/20 rounded-2xl flex flex-col justify-between items-start text-left gap-3 transition-all duration-150 cursor-pointer active:scale-95 shadow-xs select-none min-h-[110px]"
                    >
                      <span className="font-extrabold text-xs text-[#0f2e13] leading-snug line-clamp-2">{p.name}</span>
                      <div className="w-full flex justify-between items-baseline pt-1">
                        <span className="font-mono text-sm font-black text-[#ca8a04]">Rs. {p.sale_price ?? p.price}</span>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                          {p.stock_quantity ?? p.stock ?? 0} in stock
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right 5 cols: Touch Cart Panel with Large Touch Action Buttons */}
              <div className="lg:col-span-5 bg-white rounded-3xl border border-[#0f2e13]/15 overflow-hidden shadow-sm flex flex-col min-h-[500px]">
                <div className="px-5 py-4 bg-[#0f2e13] text-[#efe9c4] flex justify-between items-center">
                  <span className="font-black text-sm uppercase tracking-wide flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-emerald-400" /> Touch Cart
                  </span>
                  <button
                    onClick={handleClear}
                    className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black cursor-pointer transition"
                  >
                    Clear All
                  </button>
                </div>

                {/* Touch Cart Item List */}
                <div className="p-4 flex-1 overflow-y-auto space-y-2 max-h-[300px]">
                  {currentCart.length > 0 ? (
                    currentCart.map((item) => (
                      <div
                        key={item.key || item.id}
                        className="p-3 bg-gray-50 border border-gray-200 rounded-2xl flex justify-between items-center text-xs font-bold"
                      >
                        <div className="flex-1 pr-2">
                          <p className="font-extrabold text-[#0f2e13] truncate max-w-[140px]">{item.name}</p>
                          <p className="font-mono text-[11px] text-amber-700">Rs. {item.price * item.qty}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => updateQty(item.key || item.id, item.qty - 1)}
                            className="w-8 h-8 bg-white border border-gray-300 rounded-xl flex items-center justify-center text-base font-black text-[#0f2e13] hover:bg-gray-200 active:scale-95"
                          >
                            -
                          </button>
                          <span className="font-mono font-black text-sm w-5 text-center">{item.qty}</span>
                          <button
                            onClick={() => updateQty(item.key || item.id, item.qty + 1)}
                            className="w-8 h-8 bg-white border border-gray-300 rounded-xl flex items-center justify-center text-base font-black text-[#0f2e13] hover:bg-gray-200 active:scale-95"
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeItem(item.key || item.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg ml-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-16 text-center text-xs text-gray-400 font-bold">
                      Tap any product to add to cart
                    </div>
                  )}
                </div>

                {/* Touch Actions Footer */}
                <div className="p-5 bg-[#efe9c4]/40 border-t border-[#0f2e13]/10 space-y-3">
                  <div className="flex justify-between items-center text-lg font-black text-[#0f2e13]">
                    <span>TOTAL:</span>
                    <span className="font-mono text-2xl text-emerald-800">Rs. {total}</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleCheckout}
                    disabled={isSubmitting || currentCart.length === 0}
                    className="w-full bg-emerald-700 text-white hover:bg-emerald-800 font-black text-base uppercase py-4 rounded-2xl shadow-lg disabled:opacity-50 transition cursor-pointer active:scale-98 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? 'Processing Sale...' : `TOUCH CHECKOUT (Rs. ${total})`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* LAYOUT 3 — FAST CASHIER POS (HIGH-SPEED SCANNER & KEYBOARD MODE)     */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        {posLayout === 'fast' && (
          <div className="flex flex-col gap-4">
            {/* Dominant Top Scanner Bar & Shortcuts Legend */}
            <div className="bg-[#0f2e13] text-[#efe9c4] p-4 rounded-3xl border border-[#0f2e13]/30 shadow-md space-y-3">
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <div className="relative flex-1 w-full">
                  <input
                    id="fast-pos-search"
                    type="text"
                    placeholder="⚡ FAST SCAN: Scan Barcode or Type Product/SKU (Press F2 to focus)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && searchQuery.trim()) {
                        handleBarcodeLookup(searchQuery.trim());
                        setSearchQuery('');
                      }
                    }}
                    className="w-full bg-white text-[#0f2e13] font-bold text-sm rounded-2xl px-5 py-3.5 pr-12 outline-none focus:ring-4 focus:ring-amber-400/50 shadow-inner"
                  />
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                </div>
                <button
                  type="button"
                  onClick={() => setIsScannerOpen(true)}
                  className="px-5 py-3.5 bg-amber-700 hover:bg-amber-800 text-white font-extrabold text-xs uppercase rounded-2xl transition flex items-center gap-2 shrink-0 shadow-xs cursor-pointer"
                >
                  <Barcode className="w-5 h-5" /> Camera Scanner
                </button>
              </div>

              {/* Keyboard shortcuts badges */}
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono font-bold text-[#efe9c4]/80 pt-1">
                <span className="text-[#efe9c4]/50 flex items-center gap-1 uppercase font-sans font-black mr-2">
                  <Keyboard className="w-3.5 h-3.5" /> Shortcuts:
                </span>
                <span className="bg-white/10 px-2.5 py-1 rounded-lg border border-white/15">F2 Search Focus</span>
                <span className="bg-white/10 px-2.5 py-1 rounded-lg border border-white/15">F8 Returns</span>
                <span className="bg-white/10 px-2.5 py-1 rounded-lg border border-white/15">ESC Clear</span>
                <span className="bg-emerald-600 text-white px-2.5 py-1 rounded-lg font-black border border-emerald-400">
                  F12 Complete Sale
                </span>
              </div>
            </div>

            {/* Quick Add Recent Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-xs font-black text-[#0f2e13]/60 uppercase tracking-wider shrink-0">Quick Add:</span>
              {products.slice(0, 8).map((p) => (
                <button
                  key={p.id}
                  onClick={() => addItemToCart(p)}
                  className="px-3 py-1 bg-white hover:bg-gray-100 border border-[#0f2e13]/20 rounded-xl text-xs font-bold text-[#0f2e13] shrink-0 transition cursor-pointer"
                >
                  + {p.name} (Rs. {p.sale_price ?? p.price})
                </button>
              ))}
            </div>

            {/* High-Density Transaction List & Fast Total Execution Card */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Left 8 cols: High-density compact item table */}
              <div className="lg:col-span-8 bg-white rounded-3xl border border-[#0f2e13]/15 p-4 shadow-sm min-h-[440px] flex flex-col justify-between">
                <div>
                  <div className="px-2 py-2 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-black text-xs uppercase text-[#0f2e13]">Live Transaction List</h3>
                    <span className="text-xs font-bold text-gray-500">{currentCart.length} line item(s)</span>
                  </div>
                  <div className="overflow-x-auto max-h-[360px]">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#0f2e13]/5 text-[#0f2e13] uppercase font-black tracking-wider text-[10px]">
                        <tr>
                          <th className="py-2 px-3">Product Name</th>
                          <th className="py-2 px-3 text-right">Unit Price</th>
                          <th className="py-2 px-3 text-center">Qty</th>
                          <th className="py-2 px-3 text-right">Line Total</th>
                          <th className="py-2 px-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-semibold">
                        {currentCart.length > 0 ? (
                          currentCart.map((item) => (
                            <tr key={item.key || item.id} className="hover:bg-gray-50">
                              <td className="py-2 px-3 font-bold text-[#0f2e13]">{item.name}</td>
                              <td className="py-2 px-3 text-right font-mono">Rs. {item.price}</td>
                              <td className="py-2 px-3 text-center">
                                <input
                                  type="number"
                                  min="1"
                                  value={item.qty}
                                  onChange={(e) => updateQty(item.key || item.id, e.target.value)}
                                  className="w-14 text-center bg-gray-50 border border-gray-300 rounded-lg py-0.5 font-bold"
                                />
                              </td>
                              <td className="py-2 px-3 text-right font-mono font-bold text-emerald-800">
                                Rs. {item.price * item.qty}
                              </td>
                              <td className="py-2 px-3 text-center">
                                <button
                                  onClick={() => removeItem(item.key || item.id)}
                                  className="text-red-500 hover:text-red-700 font-bold"
                                >
                                  ✕
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="py-14 text-center text-gray-400 font-bold">
                              No active transaction lines. Use barcode scanner or search box to scan items.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Right 4 cols: Fast Total & F12 Checkout Panel */}
              <div className="lg:col-span-4 bg-white rounded-3xl border border-[#0f2e13]/15 p-5 shadow-sm space-y-4">
                <div className="p-4 bg-[#0f2e13] text-[#efe9c4] rounded-2xl text-center">
                  <span className="text-xs font-black uppercase tracking-wider block opacity-70">FAST TOTAL DUE</span>
                  <span className="text-3xl font-black font-mono text-emerald-400">Rs. {total}</span>
                </div>

                <div className="space-y-2 text-xs font-bold">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-mono">Rs. {subtotal}</span>
                  </div>
                  {taxAmount > 0 && (
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span className="font-mono">Rs. {taxAmount}</span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={isSubmitting || currentCart.length === 0}
                  className="w-full bg-emerald-700 text-white hover:bg-emerald-800 font-black text-sm uppercase py-3.5 rounded-2xl shadow-md disabled:opacity-50 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmitting ? 'Submitting...' : 'COMPLETE SALE [F12]'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* LAYOUT 4 — MODERN RETAIL POS (VISUAL DASHBOARD & CATEGORY SHOWCASE)   */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        {posLayout === 'modern' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left 3 cols: Persistent Category & Quick Action Sidebar */}
            <div className="lg:col-span-3 bg-white rounded-3xl border border-[#0f2e13]/15 p-4 shadow-sm space-y-4">
              <div>
                <h3 className="font-black text-xs uppercase text-[#0f2e13] tracking-wider px-2 mb-2">
                  Store Categories
                </h3>
                <div className="space-y-1">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex justify-between items-center ${
                        selectedCategory === cat
                          ? 'bg-[#0f2e13] text-[#efe9c4] font-black'
                          : 'text-[#0f2e13] hover:bg-gray-100'
                      }`}
                    >
                      <span>{cat}</span>
                      {selectedCategory === cat && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100">
                <h3 className="font-black text-xs uppercase text-[#0f2e13] tracking-wider px-2 mb-2">
                  Quick Actions
                </h3>
                <div className="space-y-1.5">
                  <button
                    onClick={() => setIsReturnModalOpen(true)}
                    className="w-full text-left px-3.5 py-2 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl text-xs font-extrabold hover:bg-amber-100 transition cursor-pointer flex items-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Item Return / Refund
                  </button>
                  <button
                    onClick={handleClear}
                    className="w-full text-left px-3.5 py-2 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs font-extrabold hover:bg-red-100 transition cursor-pointer flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear Cart
                  </button>
                </div>
              </div>
            </div>

            {/* Center 5 cols: Visual Product Showcase Grid */}
            <div className="lg:col-span-5 bg-white rounded-3xl border border-[#0f2e13]/15 p-5 shadow-sm space-y-4 min-h-[500px]">
              <div className="flex justify-between items-center">
                <h2 className="text-base font-black text-[#0f2e13] flex items-center gap-2 uppercase tracking-wide">
                  <LayoutGrid className="w-5 h-5 text-indigo-700" /> Product Showcase
                </h2>
                <span className="text-xs font-bold text-gray-500">{displayedProducts.length} item(s)</span>
              </div>

              {/* Search input */}
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Filter showcase by product name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2 text-xs font-bold text-[#0f2e13] outline-none focus:border-[#0f2e13]"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Cards Showcase */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
                {displayedProducts.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => addItemToCart(p)}
                    className="p-4 bg-gradient-to-br from-white to-[#efe9c4]/30 hover:to-[#efe9c4]/70 border border-[#0f2e13]/20 rounded-2xl flex flex-col justify-between gap-3 shadow-xs hover:shadow-md transition cursor-pointer group"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-[#0f2e13]/10 text-[#0f2e13] rounded-md">
                          {p.category || p.category_name || 'General'}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                          Stock: {p.stock_quantity ?? p.stock ?? 0}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-xs text-[#0f2e13] group-hover:text-amber-800 mt-2 line-clamp-2">
                        {p.name}
                      </h4>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                      <span className="font-mono text-sm font-black text-[#ca8a04]">Rs. {p.sale_price ?? p.price}</span>
                      <span className="p-1.5 bg-[#0f2e13] text-white rounded-xl text-xs font-black group-hover:scale-105 transition">
                        <Plus className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right 4 cols: Floating Modern Cart Panel */}
            <div className="lg:col-span-4 bg-white rounded-3xl border border-[#0f2e13]/15 overflow-hidden shadow-sm flex flex-col min-h-[500px]">
              <div className="px-5 py-4 bg-[#0f2e13] text-[#efe9c4] flex justify-between items-center">
                <span className="font-black text-sm uppercase tracking-wide flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-indigo-400" /> Floating Cart
                </span>
                <span className="text-xs font-mono font-bold bg-white/10 px-2 py-0.5 rounded-full">
                  {currentCart.reduce((sum, i) => sum + i.qty, 0)} items
                </span>
              </div>

              <div className="p-4 flex-1 overflow-y-auto space-y-2 max-h-[300px]">
                {currentCart.length > 0 ? (
                  currentCart.map((item) => (
                    <div
                      key={item.key || item.id}
                      className="p-3 bg-gray-50 border border-gray-200 rounded-2xl flex justify-between items-center text-xs font-semibold"
                    >
                      <div>
                        <p className="font-extrabold text-[#0f2e13] truncate max-w-[130px]">{item.name}</p>
                        <p className="font-mono text-[11px] text-emerald-800">
                          {item.qty} × Rs. {item.price}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQty(item.key || item.id, item.qty - 1)}
                          className="w-6 h-6 bg-white border border-gray-300 rounded-lg flex items-center justify-center font-black"
                        >
                          -
                        </button>
                        <span className="font-bold text-xs px-1">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.key || item.id, item.qty + 1)}
                          className="w-6 h-6 bg-white border border-gray-300 rounded-lg flex items-center justify-center font-black"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-16 text-center text-xs text-gray-400 font-bold">
                    Select products from showcase to populate cart
                  </div>
                )}
              </div>

              <div className="p-5 bg-[#efe9c4]/30 border-t border-[#0f2e13]/10 space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-gray-700">
                  <span>Subtotal:</span>
                  <span className="font-mono">Rs. {subtotal}</span>
                </div>
                {taxAmount > 0 && (
                  <div className="flex justify-between items-center text-xs font-bold text-gray-700">
                    <span>Tax:</span>
                    <span className="font-mono">Rs. {taxAmount}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-[#0f2e13] font-black text-lg pt-2 border-t border-gray-200">
                  <span>TOTAL:</span>
                  <span className="font-mono text-2xl text-emerald-800">Rs. {total}</span>
                </div>

                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={isSubmitting || currentCart.length === 0}
                  className="w-full bg-[#0f2e13] text-[#efe9c4] hover:bg-[#0f2e13]/90 font-black text-sm uppercase py-3.5 rounded-2xl shadow-md disabled:opacity-50 transition cursor-pointer"
                >
                  {isSubmitting ? 'Processing...' : `CHECKOUT (Rs. ${total})`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Server Authoritative Receipt Modal */}
      {completedSale && <ViewInvoiceModal invoice={completedSale} onClose={() => setCompletedSale(null)} />}

      {/* Camera Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={(scannedCode) => {
          handleBarcodeLookup(scannedCode);
        }}
      />

      {/* Cashier Invoice Return Modal */}
      <CashierReturnModal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        onReturnSuccess={() => fetchProducts()}
      />

      {/* Visual POS Terminal Layout Selector Modal */}
      <POSLayoutSelectorModal
        isOpen={isLayoutModalOpen}
        onClose={() => setIsLayoutModalOpen(false)}
        currentLayout={posLayout}
        onSelectLayout={(newLayout) => switchLayout(newLayout)}
      />
    </div>
  );
}
