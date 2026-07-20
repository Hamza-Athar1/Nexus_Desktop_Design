import { useMemo, useState } from 'react';
import { CreditCard, Banknote, Printer, Menu, User, Phone, FileText, Pill, Receipt, Save } from 'lucide-react';
import UserSidebar from '../../../components/User/UserSidebar';

const INITIAL_CART = [
  { id: 1, name: 'Panadol 500mg', qty: 2, price: 45 },
  { id: 2, name: 'Panadol 500mg', qty: 1, price: 80 },
  { id: 3, name: 'Panadol 500mg', qty: 1, price: 350 },
];

function CustomerField({ label, placeholder, icon: Icon, variant = 'light' }) {
  const isDark = variant === 'dark';
  return (
    <div>
      <p className={`text-[11px] font-semibold mb-1.5 ${isDark ? 'text-[#e8f0d0]/80' : 'text-[#163d15]'}`}>{label}</p>
      <div className={`relative rounded-xl ${isDark ? 'bg-[#1a4a1e]/60' : 'bg-[#eaf1ce]'} border ${isDark ? 'border-emerald-500/20' : 'border-[#c8d49a]/50'} overflow-hidden focus-within:border-emerald-400 transition-colors`}>
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8aaa6a]">
            <Icon size={16} />
          </div>
        )}
        <input
          className={`w-full ${Icon ? 'pl-9' : 'pl-4'} pr-4 py-2.5 text-sm outline-none bg-transparent ${isDark ? 'text-[#e8f0d0] placeholder:text-[#6a8f4b]/60' : 'text-[#163d15] placeholder:text-[#6a8f4b]'}`}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}

function Badge({ children, variant = 'primary' }) {
  const styles = {
    primary: 'bg-[#163d15] text-[#eaf7d9]',
    secondary: 'bg-[#eaf1ce] text-[#163d15]',
    success: 'bg-emerald-500/20 text-emerald-700 border border-emerald-400/30',
  };
  return (
    <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${styles[variant]}`}>
      {children}
    </span>
  );
}

export default function BillingPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('billing');
  const [cartItems] = useState(INITIAL_CART);

  const [paymentMode, setPaymentMode] = useState('cash');
  const [cashReceived, setCashReceived] = useState('');

  const subtotal = useMemo(() => cartItems.reduce((s, i) => s + i.qty * i.price, 0), [cartItems]);
  const gst = Math.round(subtotal * 0.17);
  const total = subtotal + gst;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f3edd0] font-['Inter',sans-serif]">
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <UserSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activeNav={activeNav} onNavChange={(id) => { setActiveNav(id); setSidebarOpen(false); }} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-[#234f24]/20 bg-[#0b3a11] px-4">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setSidebarOpen(true)} className="shrink-0 rounded-lg p-1.5 text-[#c8d898] hover:bg-[#1f491d] transition-colors lg:hidden" aria-label="Open menu">
              <Menu size={18} />
            </button>
            <span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#e9e6cf]/70">USER-DASHBOARD / Billing - Pharmacy</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#d8e0b4]">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#5dd456] shadow-[0_0_6px_#5dd456]" />
              <span className="hidden sm:inline">Online</span>
            </div>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1f491d] border border-[rgba(110,185,80,0.3)] text-[10px] font-extrabold text-[#e8f2d8]">AK</div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 pb-24 lg:pb-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-4">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <h1 className="text-xl font-extrabold text-[#163d15] tracking-tight">Create Invoice</h1>
                  <p className="text-sm text-[#6a8f4b] mt-0.5">Bill #1043 · 29 June 2026</p>
                </div>
                <div className="flex gap-2">
                  <button className="rounded-xl bg-gradient-to-b from-[#15421b] to-[#103616] px-4 py-2 text-sm font-bold text-[#f3efcf] shadow-sm hover:shadow-md transition-all flex items-center gap-1.5">
                    <Receipt size={14} />
                    Finalize bill
                  </button>
                  <button className="rounded-xl border border-[#c8d49a] px-3 py-2 text-sm font-bold text-[#163d15] hover:bg-[#163d15]/5 transition-colors flex items-center gap-1.5">
                    <Printer size={14} />
                    Print
                  </button>
                </div>
              </div>

              {/* Customer Details */}
              <section className="rounded-2xl bg-[#0f3d13]/95 p-5 text-[#e8f0d0] border border-emerald-500/20 shadow-lg">
                <h3 className="text-xs font-bold text-[#e8f0d0] mb-3 flex items-center gap-2 uppercase tracking-wider">
                  <User size={14} className="text-emerald-400" />
                  Customer Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <CustomerField label="Customer Name" placeholder="Enter Name" icon={User} variant="dark" />
                  <CustomerField label="Phone Number" placeholder="03XX-XXXXXXX" icon={Phone} variant="dark" />
                  <CustomerField label="Doctorate Name (optional)" placeholder="Dr. Ahmed" icon={FileText} variant="dark" />
                  <CustomerField label="Prescription No." placeholder="RX-XXXX" icon={FileText} variant="dark" />
                </div>
              </section>

              {/* Products Table */}
              <section className="rounded-2xl bg-[#0f3d13]/95 p-5 text-[#e8f0d0] border border-emerald-500/20 shadow-lg">
                <h3 className="text-xs font-bold text-[#e8f0d0] mb-3 flex items-center gap-2 uppercase tracking-wider">
                  <Pill size={14} className="text-emerald-400" />
                  Customer Details
                </h3>
                <div className="rounded-xl bg-[#1a4a1e]/40 border border-emerald-500/10 overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[11px] text-[#8aaa6a] border-b border-emerald-500/10">
                        <th className="px-4 py-3 font-semibold">Product</th>
                        <th className="px-4 py-3 font-semibold">Qty</th>
                        <th className="px-4 py-3 font-semibold">Unit Price</th>
                        <th className="px-4 py-3 font-semibold">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cartItems.map((it, index) => (
                        <tr key={it.id} className={`border-b border-emerald-500/5 ${index === cartItems.length - 1 ? 'border-0' : ''}`}>
                          <td className="px-4 py-3 text-sm font-medium">{it.name}</td>
                          <td className="px-4 py-3 text-sm">{it.qty}</td>
                          <td className="px-4 py-3 text-sm">Rs {it.price}</td>
                          <td className="px-4 py-3 text-sm font-semibold">Rs {it.qty * it.price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Payment Method - Mobile */}
              <div className="lg:hidden">
                <section className="rounded-2xl bg-[#f3edc7] p-5 border border-[#cfc089] shadow-sm">
                  <h3 className="text-xs font-bold text-[#163d15] mb-3 flex items-center gap-2 uppercase tracking-wider">
                    <CreditCard size={14} />
                    Payment Method
                  </h3>
                  <div className="flex gap-3 mb-3">
                    <button onClick={() => setPaymentMode('cash')} className={`flex-1 rounded-xl px-4 py-2.5 border-2 ${paymentMode === 'cash' ? 'bg-[#15421b] text-[#f3efcf] border-[#15421b]' : 'bg-transparent text-[#163d15] border-[#c8d49a]'}`}>
                      <div className="flex items-center gap-2 justify-center text-sm font-bold">
                        <Banknote size={16} /> Cash
                      </div>
                    </button>
                    <button onClick={() => setPaymentMode('card')} className={`flex-1 rounded-xl px-4 py-2.5 border-2 ${paymentMode === 'card' ? 'bg-[#15421b] text-[#f3efcf] border-[#15421b]' : 'bg-transparent text-[#163d15] border-[#c8d49a]'}`}>
                      <div className="flex items-center gap-2 justify-center text-sm font-bold">
                        <CreditCard size={16} /> Card
                      </div>
                    </button>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-[#163d15] mb-1.5">Cash Received</p>
                    <input value={cashReceived} onChange={(e) => setCashReceived(e.target.value)} className="w-full rounded-xl border-2 border-[#c8d49a] bg-white px-4 py-2.5 text-sm text-[#163d15] outline-none focus:border-[#163d15] transition-colors" placeholder="Rs 0.00" />
                  </div>
                </section>
              </div>

              {/* Bill Summary - Mobile */}
              <div className="lg:hidden">
                <section className="rounded-2xl bg-[#f3edc7] p-5 border border-[#cfc089] shadow-sm">
                  <h4 className="text-xs font-bold text-[#163d15] mb-3 flex items-center gap-2 uppercase tracking-wider">
                    <Receipt size={14} />
                    Bill Summary
                  </h4>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between text-[#6a8f4b]">
                      <span>Subtotal</span>
                      <span className="font-semibold text-[#163d15]">Rs {subtotal}</span>
                    </div>
                    <div className="flex justify-between text-[#6a8f4b]">
                      <span>Discount</span>
                      <span className="font-semibold text-[#163d15]">Rs 0</span>
                    </div>
                    <div className="flex justify-between text-[#6a8f4b]">
                      <span>GST (17%)</span>
                      <span className="font-semibold text-[#163d15]">Rs {gst}</span>
                    </div>
                    <div className="flex justify-between text-[#6a8f4b] items-center">
                      <span>FBR tax</span>
                      <Badge variant="primary">FBR ON</Badge>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-[#163d15]/10">
                    <div className="flex justify-between text-base font-extrabold text-[#163d15]">
                      <span>Total</span>
                      <span>Rs {total}</span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button className="flex-1 rounded-xl bg-gradient-to-b from-[#15421b] to-[#103616] py-2.5 text-sm font-bold text-[#f3efcf] shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2">
                        <Printer size={16} />
                        Generate
                      </button>
                      <button className="flex-1 rounded-xl border-2 border-[#c8d49a] py-2.5 text-sm font-bold text-[#163d15] hover:bg-[#163d15]/5 transition-all flex items-center justify-center gap-2">
                        <Save size={16} />
                        Save
                      </button>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            {/* Sidebar - Desktop */}
            <aside className="hidden lg:flex lg:flex-col gap-4">
              {/* Payment Method */}
              <div className="rounded-2xl bg-[#f3edc7] p-5 border border-[#cfc089] shadow-sm">
                <h4 className="text-xs font-bold text-[#163d15] mb-3 flex items-center gap-2 uppercase tracking-wider">
                  <CreditCard size={14} />
                  Payment Method
                </h4>
                <div className="flex gap-3 mb-3">
                  <button onClick={() => setPaymentMode('cash')} className={`flex-1 rounded-xl px-4 py-2.5 border-2 ${paymentMode === 'cash' ? 'bg-[#15421b] text-[#f3efcf] border-[#15421b]' : 'bg-transparent text-[#163d15] border-[#c8d49a]'}`}>
                    <div className="flex items-center gap-2 justify-center text-sm font-bold">
                      <Banknote size={16} /> Cash
                    </div>
                  </button>
                  <button onClick={() => setPaymentMode('card')} className={`flex-1 rounded-xl px-4 py-2.5 border-2 ${paymentMode === 'card' ? 'bg-[#15421b] text-[#f3efcf] border-[#15421b]' : 'bg-transparent text-[#163d15] border-[#c8d49a]'}`}>
                    <div className="flex items-center gap-2 justify-center text-sm font-bold">
                      <CreditCard size={16} /> Card
                    </div>
                  </button>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[#163d15] mb-1.5">Cash Received</p>
                  <input value={cashReceived} onChange={(e) => setCashReceived(e.target.value)} className="w-full rounded-xl border-2 border-[#c8d49a] bg-white px-4 py-2.5 text-sm text-[#163d15] outline-none focus:border-[#163d15] transition-colors" placeholder="Rs 0.00" />
                </div>
              </div>

              {/* Bill Summary */}
              <div className="rounded-2xl bg-[#f3edc7] p-5 border border-[#cfc089] shadow-sm">
                <h4 className="text-xs font-bold text-[#163d15] mb-3 flex items-center gap-2 uppercase tracking-wider">
                  <Receipt size={14} />
                  Bill Summary
                </h4>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-[#6a8f4b]">
                    <span>Subtotal</span>
                    <span className="font-semibold text-[#163d15]">Rs {subtotal}</span>
                  </div>
                  <div className="flex justify-between text-[#6a8f4b]">
                    <span>Discount</span>
                    <span className="font-semibold text-[#163d15]">Rs 0</span>
                  </div>
                  <div className="flex justify-between text-[#6a8f4b]">
                    <span>GST (17%)</span>
                    <span className="font-semibold text-[#163d15]">Rs {gst}</span>
                  </div>
                  <div className="flex justify-between text-[#6a8f4b] items-center">
                    <span>FBR tax</span>
                    <Badge variant="primary">FBR ON</Badge>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-[#163d15]/10">
                  <div className="flex justify-between text-base font-extrabold text-[#163d15]">
                    <span>Total</span>
                    <span>Rs {total}</span>
                  </div>
                  <div className="mt-3 space-y-2">
                    <button className="w-full rounded-xl bg-gradient-to-b from-[#15421b] to-[#103616] py-2.5 text-sm font-bold text-[#f3efcf] shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2">
                      <Printer size={16} />
                      Generate & print bill
                    </button>
                    <button className="w-full rounded-xl border-2 border-[#c8d49a] py-2.5 text-sm font-bold text-[#163d15] hover:bg-[#163d15]/5 transition-all flex items-center justify-center gap-2">
                      <Save size={16} />
                      Save draft
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer Plan Indicator */}
              <div className="flex items-center justify-center gap-3 px-3 py-1.5 bg-[#163d15]/10 rounded-full">
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#6a8f4b]">Plan</span>
                <Badge variant="primary">Pro</Badge>
                <span className="text-[9px] font-semibold text-[#6a8f4b]">18 days left</span>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}