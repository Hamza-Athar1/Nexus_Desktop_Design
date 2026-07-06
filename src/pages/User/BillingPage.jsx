import { useMemo, useState } from 'react';
import { CreditCard, Banknote, Printer, Plus, Menu } from 'lucide-react';
import UserSidebar from '../../components/UserSidebar';

const INITIAL_CART = [
  { id: 1, name: 'Panadol 500mg', qty: 2, price: 45 },
  { id: 2, name: 'ORS Sachet', qty: 1, price: 80 },
];

function CustomerField({ label, placeholder, variant = 'light' }) {
  const isDark = variant === 'dark';
  return (
    <div className="mb-2">
      <p className={`text-[11px] font-bold mb-1 ${isDark ? 'text-[#dfead1]' : 'text-[#356837]'}`}>{label}</p>
      <input
        className={`w-full rounded-lg border-none px-3 py-2 text-sm outline-none ${isDark ? 'bg-[#f3edc7] text-[#163d15]' : 'bg-[#eaf1ce] text-[#163d15]'}`}
        placeholder={placeholder}
      />
    </div>
  );
}

export default function BillingPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('billing');
  const [cartItems, setCartItems] = useState(INITIAL_CART);
  const [paymentMode, setPaymentMode] = useState('cash');
  const [cashReceived, setCashReceived] = useState('');

  const subtotal = useMemo(() => cartItems.reduce((s, i) => s + i.qty * i.price, 0), [cartItems]);
  const gst = Math.round(subtotal * 0.17);
  const total = subtotal + gst;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f1e8c4] font-[Inter,sans-serif]">
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <UserSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activeNav={activeNav} onNavChange={(id) => { setActiveNav(id); setSidebarOpen(false); }} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-13.5 shrink-0 items-center justify-between gap-2 border-b border-emerald-500/15 bg-[#0c3410] px-3 sm:gap-4 sm:px-5">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button type="button" onClick={() => setSidebarOpen(true)} className="shrink-0 rounded p-1 text-[#c8d898] lg:hidden" aria-label="Open menu">
              <Menu size={20} />
            </button>
            <div className="flex min-w-0 items-center gap-1.5 overflow-hidden sm:gap-2">
              <span className="hidden whitespace-nowrap text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#efe9c4] sm:block">USER-DASHBOARD</span>
              <span className="hidden text-[14px] text-[#6ab850] sm:block">/</span>
              <span className="truncate text-[11px] font-semibold uppercase tracking-[0.04em] text-[#d8e0b4]">Billing - Pharmacy</span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#d8e0b4]">
              <span className="inline-block h-2 w-2 rounded-full bg-[#5dd456] shadow-[0_0_6px_#5dd456]" />
              <span className="hidden sm:inline">Online</span>
            </div>

            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[rgba(110,185,80,0.3)] bg-[#1f491d] text-[11px] font-extrabold text-[#e8f2d8]">AK</div>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 gap-3 overflow-hidden p-3 sm:p-4">
          <div className="flex min-w-0 flex-1 flex-col gap-3 overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-extrabold text-[#163d15]">Create Invoice</h2>
                <p className="text-sm text-[#6a8f4b]">Bill #1043 · 29 June 2026</p>
              </div>

              <div className="flex items-center gap-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <button className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-[#f3edc7] px-4 py-3 text-[13px] font-bold text-[#163d15] border border-[#d8c98c] shadow-md">
                      Finalize bill
                    </button>
                    <button className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl border border-[#c4d094] bg-transparent px-4 py-3 text-[13px] font-bold text-[#1a3a1a] shadow-sm">
                      <Printer size={16} /> Print
                    </button>
                  </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="col-span-2 rounded-2xl bg-[#0f3d13]/95 p-4 text-[#e8f0d0] border border-emerald-500/20 shadow-md">
                <p className="text-sm font-bold text-[#e8f0d0] mb-2">Customer Details</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <CustomerField label="Customer Name" placeholder="Enter Name" variant="dark" />
                  <CustomerField label="Phone Number" placeholder="03XX-XXXXXXX" variant="dark" />
                  <CustomerField label="Doctorate Name (optional)" placeholder="Dr. Ahmed" variant="dark" />
                  <CustomerField label="Prescription No." placeholder="RX-XXXX" variant="dark" />
                </div>
              </div>

              <div className="rounded-2xl bg-[#f3edc7] p-4 border border-[#cfc089]">
                <p className="text-sm font-bold text-[#163d15] mb-2">Payment Method</p>
                <div className="flex flex-col sm:flex-row gap-3 mb-3">
                  <button onClick={() => setPaymentMode('cash')} className={`w-full sm:flex-1 rounded-2xl px-4 py-3 border ${paymentMode === 'cash' ? 'bg-[#15421b] text-[#f3efcf] border-emerald-600/30' : 'bg-transparent text-[#163d15] border-[#c8d49a]'}`}>
                    <div className="flex items-center gap-3 justify-center"><Banknote size={18} /> <span>Cash</span></div>
                  </button>
                  <button onClick={() => setPaymentMode('card')} className={`w-full sm:flex-1 rounded-2xl px-4 py-3 border ${paymentMode === 'card' ? 'bg-[#15421b] text-[#f3efcf] border-emerald-600/30' : 'bg-transparent text-[#163d15] border-[#c8d49a]'}`}>
                    <div className="flex items-center gap-3 justify-center"><CreditCard size={18} /> <span>Card</span></div>
                  </button>
                </div>

                <div>
                  <p className="text-[12px] text-[#163d15] mb-1">Cash Received</p>
                  <input value={cashReceived} onChange={(e) => setCashReceived(e.target.value)} className="w-full rounded-lg border border-[#c8d49a] bg-white px-3 py-3 text-sm text-[#163d15] outline-none" placeholder="Rs 0.00" />
                </div>
              </div>
            </div>

            <div className="mt-2 rounded-2xl bg-[#163d15] p-4 text-[#e8f0d0]">
              <p className="text-sm font-bold mb-3">Customer Details</p>
              <div className="rounded-lg bg-[#113d1a] p-3 overflow-x-auto">
                <table className="w-full min-w-0 sm:min-w-150 text-left">
                  <thead>
                    <tr className="text-[13px] text-[#cfe3b8]">
                      <th className="px-4 py-2">Product</th>
                      <th className="px-4 py-2">Qty</th>
                      <th className="px-4 py-2">Unit Price</th>
                      <th className="px-4 py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((it) => (
                      <tr key={it.id} className="border-t border-[#274c26]">
                        <td className="px-4 py-3 text-[13px] font-bold">{it.name}</td>
                        <td className="px-4 py-3">{it.qty}</td>
                        <td className="px-4 py-3">Rs {it.price}</td>
                        <td className="px-4 py-3">Rs {it.qty * it.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <aside className="hidden lg:flex lg:w-80 flex-col gap-4">
            <div className="rounded-2xl bg-[#f3edc7] p-4 border border-[#d8c98c]">
              <p className="text-sm font-bold text-[#163d15]">Bill Summary</p>
              <div className="mt-3 text-[13px] text-[#38462e]">
                <div className="flex justify-between"><span>Subtotal</span><span>Rs {subtotal}</span></div>
                <div className="flex justify-between"><span>Discount</span><span>Rs 0</span></div>
                <div className="flex justify-between"><span>GST (17%)</span><span>Rs {gst}</span></div>
                <div className="flex justify-between"><span>FBR tax</span><span>FBR ON</span></div>
              </div>

              <div className="mt-4 border-t pt-3 text-[#163d15]">
                <div className="flex justify-between text-[18px] font-extrabold"> <span>Total</span> <span>Rs {total}</span></div>
                <div className="mt-3 grid gap-3">
                  <button className="w-full rounded-2xl bg-linear-to-b from-[#15421b] to-[#103616] py-3 text-[14px] font-bold text-[#f3efcf] shadow-sm border border-emerald-600/20">Generate & print bill</button>
                  <button className="w-full rounded-2xl border border-[#c8d49a] py-3 text-[14px] font-bold text-[#163d15]">Save draft</button>
                </div>
              </div>
            </div>
          </aside>
          {/* Mobile bill summary bar */}
          <div className="fixed bottom-4 left-4 right-4 z-50 lg:hidden">
            <div className="flex items-center justify-between gap-3 rounded-full bg-[#f3edc7] p-3 border border-[#d8c98c] shadow-lg">
              <div>
                <div className="text-xs text-[#7a9a65]">Total</div>
                <div className="text-lg font-extrabold text-[#163d15]">Rs {total}</div>
              </div>
              <div className="flex gap-2">
                <button className="rounded-2xl bg-linear-to-b from-[#15421b] to-[#103616] px-3 py-2 text-sm font-bold text-[#f3efcf]">Generate</button>
                <button className="rounded-2xl border border-[#c8d49a] px-3 py-2 text-sm font-bold text-[#163d15]">Save</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
