import { useState, useEffect, useMemo } from 'react';
import { Search, RotateCcw, Trash2, Printer, Save, Plus, Barcode, Layers } from 'lucide-react';
import UserSidebar from '../../../components/User/UserSidebar';


// Mock product catalog for search and scanner simulation
const CATALOG = [
  { id: 'p1', name: 'Imtiaz Wheat Flour 10kg', price: 950 },
  { id: 'p2', name: 'Olper\'s Milk 1L', price: 280 },
  { id: 'p3', name: 'Nestle Pure Life 1.5L', price: 90 },
  { id: 'p4', name: 'National Ketchup 500g', price: 320 },
  { id: 'p5', name: 'Tapal Danedar Tea 450g', price: 650 },
  { id: 'p6', name: 'Lipton Yellow Label 500g', price: 720 },
  { id: 'p7', name: 'LU Prince Biscuits Half Roll', price: 40 },
  { id: 'p8', name: 'Sensodyne Toothpaste 100g', price: 450 },
  { id: 'p9', name: 'Lux Soap 150g', price: 150 },
  { id: 'p10', name: 'Surf Excel 1kg', price: 580 },
];

export default function POSSystemPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('pos');

  // Tabs: Customers
  const [customers, setCustomers] = useState(['Customer 1', 'Customer 2', 'Customer 3']);
  const [activeCustomerIndex, setActiveCustomerIndex] = useState(0);

  // Cart / Invoice state per customer to keep it fully separate
  const [carts, setCarts] = useState({
    0: [],
    1: [],
    2: [],
  });

  // Inputs per customer
  const [laborCharges, setLaborCharges] = useState({ 0: 0, 1: 0, 2: 0 });
  const [paidAmounts, setPaidAmounts] = useState({ 0: '', 1: '', 2: '' });

  // Invoice numbers per customer
  const [invoiceNumbers, setInvoiceNumbers] = useState({
    0: 'INV-00029',
    1: 'INV-00030',
    2: 'INV-00031',
  });

  // Search input state
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Scan simulation state
  const [scanLaserActive, setScanLaserActive] = useState(false);
  const [lastScannedItem, setLastScannedItem] = useState(null);

  // Real-time clock state
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format date: "Tue, 24 Jun 2026 10:28 PM"
  const formattedDateTime = useMemo(() => {
    const optionsDate = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
    const optionsTime = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
    const dateStr = currentTime.toLocaleDateString('en-US', optionsDate);
    const timeStr = currentTime.toLocaleTimeString('en-US', optionsTime);
    return `${dateStr} ${timeStr}`;
  }, [currentTime]);

  const currentCart = carts[activeCustomerIndex] || [];
  const currentLabor = laborCharges[activeCustomerIndex] || 0;
  const currentPaid = paidAmounts[activeCustomerIndex] || '';
  const currentInvoice = invoiceNumbers[activeCustomerIndex] || 'INV-00029';

  // Subtotal, Total, Change calculations
  const subtotal = useMemo(() => {
    return currentCart.reduce((sum, item) => sum + item.price * item.qty, 0);
  }, [currentCart]);

  const total = useMemo(() => {
    return subtotal + Number(currentLabor);
  }, [subtotal, currentLabor]);

  const changeDue = useMemo(() => {
    if (!currentPaid || Number(currentPaid) < total) return 0;
    return Number(currentPaid) - total;
  }, [currentPaid, total]);

  // Handle barcode scan simulator
  const handleScanNext = () => {
    setScanLaserActive(true);
    setTimeout(() => {
      // Pick a random product from Catalog
      const randomIndex = Math.floor(Math.random() * CATALOG.length);
      const product = CATALOG[randomIndex];

      addItemToCart(product);
      setLastScannedItem(product);
      setScanLaserActive(false);
    }, 500);
  };

  // Add item to cart helper
  const addItemToCart = (product) => {
    setCarts((prev) => {
      const activeCart = prev[activeCustomerIndex] || [];
      const existingItemIndex = activeCart.findIndex((item) => item.id === product.id);

      let newCart;
      if (existingItemIndex >= 0) {
        newCart = activeCart.map((item, idx) =>
          idx === existingItemIndex ? { ...item, qty: item.qty + 1 } : item
        );
      } else {
        newCart = [...activeCart, { ...product, qty: 1 }];
      }

      return {
        ...prev,
        [activeCustomerIndex]: newCart,
      };
    });
  };

  // Update item qty in cart
  const updateQty = (productId, newQty) => {
    setCarts((prev) => {
      const activeCart = prev[activeCustomerIndex] || [];
      const updated = activeCart.map((item) =>
        item.id === productId ? { ...item, qty: Math.max(1, newQty) } : item
      );
      return {
        ...prev,
        [activeCustomerIndex]: updated,
      };
    });
  };

  // Remove item from cart
  const removeItem = (productId) => {
    setCarts((prev) => {
      const activeCart = prev[activeCustomerIndex] || [];
      const updated = activeCart.filter((item) => item.id !== productId);
      return {
        ...prev,
        [activeCustomerIndex]: updated,
      };
    });
  };

  // Clear current cart/inputs
  const handleClear = () => {
    setCarts((prev) => ({ ...prev, [activeCustomerIndex]: [] }));
    setLaborCharges((prev) => ({ ...prev, [activeCustomerIndex]: 0 }));
    setPaidAmounts((prev) => ({ ...prev, [activeCustomerIndex]: '' }));
    setLastScannedItem(null);
  };

  // Add new customer tab
  const handleAddCustomer = () => {
    const nextIndex = customers.length;
    setCustomers((prev) => [...prev, `Customer ${nextIndex + 1}`]);
    setCarts((prev) => ({ ...prev, [nextIndex]: [] }));
    setLaborCharges((prev) => ({ ...prev, [nextIndex]: 0 }));
    setPaidAmounts((prev) => ({ ...prev, [nextIndex]: '' }));
    setInvoiceNumbers((prev) => ({
      ...prev,
      [nextIndex]: `INV-000${29 + nextIndex}`,
    }));
    setActiveCustomerIndex(nextIndex);
  };

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return CATALOG.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#efe9c4] text-[#0f2e13] font-sans">
      {/* Sidebar for navigation */}
      <UserSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeNav={activeNav}
        onNavChange={(id) => {
          setActiveNav(id);
          setSidebarOpen(false);
        }}
      />

      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-3 sm:px-6 sm:py-4">
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          {/* Logo Brand left */}
          <div className="flex items-center select-none">
            <img 
              src="/Nexus_superadmin.png" 
              alt="Nexus Superadmin Logo" 
              className="w-32 sm:w-40 h-auto object-contain max-h-16 md:max-h-20" 
            />
          </div>

          {/* Center Store Title */}
          <div className="flex flex-col items-center">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wide text-[#0d3410] text-center uppercase">
              Imtiaz Super Market
            </h1>
            <div className="flex gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-ping" />
              <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
              <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
            </div>
          </div>

          {/* Right Clock and Login */}
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-[#0d3410]/95 font-mono">{formattedDateTime}</p>
            </div>
            <button className="bg-[#093311] hover:bg-[#06240c] text-[#efe9c4] text-xs font-extrabold px-4 py-2.5 rounded-full transition-all duration-200 tracking-wider">
              ADMIN LOGIN
            </button>
          </div>
        </header>

        {/* Search Bar section */}
        <div className="relative w-full mb-4">
          <div className="flex items-center bg-white rounded-full px-4 py-3 border border-[#ca8a04]/30 shadow-sm focus-within:ring-2 focus-within:ring-[#0d3410]/20 transition-all">
            <input
              type="text"
              placeholder="Search products by name or scan barcode..."
              className="w-full text-sm outline-none text-[#0d3410] placeholder-[#0d3410]/50 pr-4"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
            />
            <Search className="text-[#0d3410]/70 w-5 h-5 shrink-0" />
          </div>

          {/* Search Dropdown Popover */}
          {showSearchResults && filteredProducts.length > 0 && (
            <div className="absolute left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-[#ca8a04]/20 z-50 max-h-60 overflow-y-auto">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => {
                    addItemToCart(product);
                    setSearchQuery('');
                    setShowSearchResults(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-[#efe9c4]/40 flex justify-between items-center border-b border-gray-100 last:border-b-0 text-sm font-semibold transition-colors"
                >
                  <span className="text-[#0d3410]">{product.name}</span>
                  <span className="text-[#ca8a04]">Rs. {product.price}</span>
                </button>
              ))}
            </div>
          )}

          {showSearchResults && searchQuery && filteredProducts.length === 0 && (
            <div className="absolute left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-red-200 p-4 text-center text-sm font-medium text-red-600 z-50">
              No products found matching "{searchQuery}"
            </div>
          )}
        </div>

        {/* Customer tabs bar */}
        <div className="flex flex-wrap gap-2.5 mb-4">
          {customers.map((cust, idx) => (
            <button
              key={idx}
              onClick={() => setActiveCustomerIndex(idx)}
              className={`px-6 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all duration-200 ${activeCustomerIndex === idx
                  ? 'bg-[#093311] text-white shadow-md'
                  : 'bg-transparent text-[#093311] border border-[#093311] hover:bg-[#093311]/10'
                }`}
            >
              {cust}
            </button>
          ))}
          <button
            onClick={handleAddCustomer}
            className="px-6 py-2.5 rounded-xl text-xs md:text-sm font-bold bg-transparent text-[#093311] border border-[#093311] hover:bg-[#093311]/10 flex items-center gap-1.5"
          >
            <Plus size={14} />
            Add customer
          </button>
        </div>

        {/* Main interactive grid section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left panel: Barcode scanning simulator */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-100 p-6 flex flex-col items-center justify-between min-h-[460px] shadow-sm relative overflow-hidden">
            {/* Top Right Scanned items badge */}
            <div className="absolute top-4 right-4 bg-[#e6ecce] text-[#093311] text-[11px] md:text-xs font-bold px-3 py-1.5 rounded-full select-none">
              {currentCart.reduce((sum, item) => sum + item.qty, 0)} items scanned
            </div>


            {/* Simulated Scanner visualization */}
            <div className="my-6 relative flex flex-col items-center justify-center w-full max-w-[280px] h-[180px] border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50 p-4 transition-all">
              {/* Target brackets */}
              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-gray-400" />
              <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-gray-400" />
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-gray-400" />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-gray-400" />

              {/* Barcode Graphic using Lucide */}
              <Barcode className="w-32 h-20 text-gray-800" />

              {/* Animated laser line */}
              <div
                className={`absolute left-0 right-0 h-0.5 bg-red-500 shadow-[0_0_8px_#ef4444] transition-all duration-500 ${scanLaserActive ? 'opacity-100 top-1/2 translate-y-[-50%] scale-x-95' : 'opacity-30 top-10 scale-x-90'
                  }`}
              />
            </div>

            {/* Instruction labels */}
            <div className="text-center mb-4">
              <h3 className="text-base md:text-lg font-bold text-gray-900">Scan to enter bill item</h3>
              <p className="text-xs md:text-sm text-gray-500 mt-1">Point the barcode scanner at a product</p>
            </div>

            {/* Scan Trigger Button */}
            <button
              onClick={handleScanNext}
              disabled={scanLaserActive}
              className={`w-full max-w-[240px] py-3 bg-[#093311] hover:bg-[#06240c] text-[#efe9c4] text-sm md:text-base font-extrabold rounded-xl shadow-sm transition-colors ${scanLaserActive ? 'opacity-70 cursor-not-allowed' : ''
                }`}
            >
              {scanLaserActive ? 'Scanning...' : 'Scan next item'}
            </button>

            {/* Footer scanned list */}
            <div className="w-full mt-6 pt-4 border-t border-gray-100 text-center">
              <p className="text-[10px] font-extrabold tracking-wider text-gray-400 mb-2 uppercase">
                SCANNED SO FAR
              </p>
              {lastScannedItem ? (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full text-xs font-semibold text-green-700 animate-fade-in">
                  <span>Scanned: {lastScannedItem.name}</span>
                  <span className="text-[10px] bg-green-200 text-green-800 px-1.5 py-0.5 rounded-full">
                    Rs. {lastScannedItem.price}
                  </span>
                </div>
              ) : (
                <span className="text-xs text-gray-400">No items scanned yet in this session</span>
              )}
            </div>
          </div>

          {/* Right panel: Bill preview and table */}
          <div className="lg:col-span-5 flex flex-col">
            {/* Dark green header banner */}
            <div className="bg-[#093311] rounded-t-2xl px-4 py-3 flex items-center justify-between text-white shadow-sm select-none">
              <span className="text-sm md:text-base font-bold font-mono tracking-wide">{currentInvoice}</span>
              <div className="flex gap-2">
                <button
                  onClick={handleClear}
                  className="bg-white hover:bg-white/90 text-[#b22222] text-[11px] md:text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                >
                  <RotateCcw size={12} />
                  Return
                </button>
                <button
                  onClick={handleClear}
                  className="bg-white hover:bg-white/90 text-[#093311] text-[11px] md:text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Trash2 size={12} />
                  Clear
                </button>
              </div>
            </div>

            {/* Bill body */}
            <div className="bg-white rounded-b-2xl border-x border-b border-gray-200/80 p-4 flex flex-col justify-between shadow-sm min-h-[400px]">
              {/* Table section */}
              <div className="flex-1 overflow-y-auto mb-4 max-h-[220px]">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] md:text-xs font-bold tracking-wider text-gray-400 border-b border-gray-100 uppercase">
                      <th className="pb-2 font-extrabold w-3/5">Item Name</th>
                      <th className="pb-2 font-extrabold text-center w-1/5">QTY</th>
                      <th className="pb-2 font-extrabold text-right w-1/5">PRICE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {currentCart.length > 0 ? (
                      currentCart.map((item) => (
                        <tr key={item.id} className="text-xs md:text-sm font-semibold text-gray-800">
                          <td className="py-2.5 pr-2">
                            <div>
                              <p className="truncate max-w-[160px] sm:max-w-[200px]">{item.name}</p>
                              <button
                                onClick={() => removeItem(item.id)}
                                className="text-[10px] md:text-xs text-red-500 hover:text-red-700 font-bold mt-0.5 block"
                              >
                                Remove
                              </button>
                            </div>
                          </td>
                          <td className="py-2.5 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => updateQty(item.id, item.qty - 1)}
                                className="w-5 h-5 flex items-center justify-center rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
                              >
                                -
                              </button>
                              <span className="w-4 text-center font-bold text-sm">{item.qty}</span>
                              <button
                                onClick={() => updateQty(item.id, item.qty + 1)}
                                className="w-5 h-5 flex items-center justify-center rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="py-2.5 text-right font-mono">
                            Rs. {item.price * item.qty}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="py-12 text-center text-xs text-gray-400 font-medium">
                          No items in invoice yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Calculation Summary block */}
              <div className="border-t border-gray-100 pt-4 space-y-3">
                {/* Subtotal row */}
                <div className="flex justify-between items-center text-xs md:text-sm font-bold text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-mono text-gray-900">Rs. {subtotal}</span>
                </div>

                {/* Labor Charges input */}
                <div className="flex justify-between items-center text-xs md:text-sm font-bold text-gray-600">
                  <span>Labor charges</span>
                  <div className="flex items-center gap-1.5 bg-[#f5f2db] px-2 py-1 rounded-lg border border-gray-200">
                    <span className="text-[10px] md:text-xs text-gray-500">Enter Rs.</span>
                    <input
                      type="number"
                      className="w-16 bg-transparent text-right font-mono outline-none font-bold text-[#0d3410]"
                      value={currentLabor || ''}
                      placeholder="0"
                      onChange={(e) => {
                        const val = e.target.value ? Math.max(0, parseInt(e.target.value)) : 0;
                        setLaborCharges((prev) => ({
                          ...prev,
                          [activeCustomerIndex]: val,
                        }));
                      }}
                    />
                  </div>
                </div>

                {/* Total bold row */}
                <div className="flex justify-between items-center pt-1.5 border-t border-dashed border-gray-100">
                  <span className="text-sm md:text-base font-extrabold text-[#093311]">Total</span>
                  <span className="text-base md:text-lg font-extrabold text-[#093311] font-mono">
                    Rs. {total}
                  </span>
                </div>

                {/* Paid Amount input */}
                <div className="flex justify-between items-center text-xs md:text-sm font-bold text-gray-600">
                  <span>Paid amount</span>
                  <div className="flex items-center gap-1.5 bg-[#f5f2db] px-2 py-1 rounded-lg border border-gray-200">
                    <span className="text-[10px] md:text-xs text-gray-500">Enter Rs.</span>
                    <input
                      type="number"
                      className="w-16 bg-transparent text-right font-mono outline-none font-bold text-[#0d3410]"
                      value={currentPaid}
                      placeholder="0"
                      onChange={(e) => {
                        const val = e.target.value;
                        setPaidAmounts((prev) => ({
                          ...prev,
                          [activeCustomerIndex]: val,
                        }));
                      }}
                    />
                  </div>
                </div>

                {/* Change row */}
                <div className="flex justify-between items-center text-xs md:text-sm font-bold text-gray-600">
                  <span>Change</span>
                  <span className="font-mono text-gray-900">Rs. {changeDue}</span>
                </div>

                {/* Action buttons at bottom */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => {
                      alert('Bill Saved Successfully!');
                      handleClear();
                    }}
                    className="w-full py-3 border border-[#093311] text-[#093311] hover:bg-[#093311]/5 rounded-xl text-xs md:text-sm font-extrabold tracking-wide uppercase transition-colors"
                  >
                    Save bill
                  </button>
                  <button
                    onClick={() => {
                      window.print();
                    }}
                    className="w-full py-3 bg-[#093311] hover:bg-[#06240c] text-white rounded-xl text-xs md:text-sm font-extrabold tracking-wide uppercase transition-colors"
                  >
                    Print
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
