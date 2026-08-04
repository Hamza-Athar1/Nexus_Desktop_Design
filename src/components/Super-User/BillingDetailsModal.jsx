import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { apiFetchJson } from '../../lib/api';

/**
 * Fetches and displays a single invoice's details, owner info, and payment
 * history.
 *
 * Props:
 *   invoiceId  — number | null
 *   onClose    — () => void
 */
export default function BillingDetailsModal({ invoiceId, onClose }) {
  const [loading, setLoading] = useState(false);
  const [data, setData]       = useState(null);
  const [error, setError]     = useState('');

  useEffect(() => {
    if (!invoiceId) { setData(null); return; }
    setLoading(true);
    setError('');
    apiFetchJson(`/admin/billing/${invoiceId}`)
      .then(({ ok, data: d }) => {
        if (ok) setData(d);
        else setError('Failed to load billing details.');
        setLoading(false);
      })
      .catch(() => { setError('Network error.'); setLoading(false); });
  }, [invoiceId]);

  if (!invoiceId) return null;

  const statusLabel = !data
    ? ''
    : data.invoice.status === 'paid'
    ? 'Paid'
    : data.invoice.status === 'overdue'
    ? 'Overdue'
    : 'Pending';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-[#ece5c8] rounded-[28px] border border-[#14391a]/15 p-7 w-full max-w-[460px] shadow-2xl flex flex-col text-[#14391a]">
        {loading && (
          <div className="py-16 text-center text-sm font-bold text-[#14391a]/60">
            Loading…
          </div>
        )}

        {error && !loading && (
          <div className="py-10 text-center text-sm font-bold text-[#99221b]">
            {error}
          </div>
        )}

        {data && !loading && (() => {
          const { invoice, totalBilledToDate, paymentHistory } = data;
          const ownerName = invoice.ownerName;
          const username  = invoice.ownerUsername;
          const bizName   = invoice.businessName;
          const nextDue   = fmtDate(invoice.dueDate);

          return (
            <>
              {/* Header */}
              <div className="mb-6">
                <h2 className="text-3xl font-extrabold tracking-tight text-[#14391a]">
                  {ownerName}
                </h2>
                <p className="text-sm font-bold text-[#14391a]/80 mt-0.5">
                  @{username} · {bizName}
                </p>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div className="bg-[#fefce8]/90 rounded-2xl p-4 border border-[#14391a]/10 flex flex-col justify-between">
                  <span className="text-xs font-semibold text-[#14391a]/90">Total billed to date</span>
                  <span className="text-2xl font-extrabold text-[#14391a] mt-2 tracking-tight">
                    Rs {totalBilledToDate.toLocaleString('en-PK', { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="bg-[#fefce8]/90 rounded-2xl p-4 border border-[#14391a]/10 flex flex-col justify-between">
                  <span className="text-xs font-semibold text-[#14391a]/90">Status</span>
                  <span className={`text-2xl font-extrabold mt-2 tracking-tight ${
                    statusLabel === 'Paid'    ? 'text-[#16a34a]' :
                    statusLabel === 'Overdue' ? 'text-[#dc2626]' : 'text-[#ca8a04]'
                  }`}>
                    {statusLabel}
                  </span>
                </div>
              </div>

              {/* Next Due Date */}
              <div className="flex justify-between items-center text-sm font-extrabold text-[#14391a] mb-6 px-1">
                <span>Next due date</span>
                <span>{nextDue}</span>
              </div>

              {/* Payment History */}
              <div className="mb-6">
                <h3 className="text-xs font-extrabold tracking-wider text-[#14391a] uppercase mb-3 px-1">
                  PAYMENT HISTORY
                </h3>

                {paymentHistory.length === 0 ? (
                  <p className="text-xs text-[#14391a]/60 font-medium px-1">No payments recorded yet.</p>
                ) : (
                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                    {paymentHistory.map(item => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#c5d8a4] flex items-center justify-center text-[#14391a] shrink-0">
                          <Check size={20} strokeWidth={3} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-base font-extrabold text-[#14391a] leading-tight">
                            Rs {item.amount}
                          </span>
                          <span className="text-xs font-semibold text-[#14391a]/70">
                            {fmtDate(item.paidAt)} · {item.method} · {item.invoiceNumber}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          );
        })()}

        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3.5 bg-[#14391a] hover:bg-[#0f2a13] text-white text-base font-extrabold rounded-2xl shadow-md active:scale-[0.99] transition-all cursor-pointer text-center leading-none mt-auto"
        >
          Close
        </button>
      </div>
    </div>
  );
}

// ── helpers ───────────────────────────────────────────────────────────────────
function fmtDate(iso) {
  if (!iso) return '--';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
