import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import { apiFetchJson } from '../../lib/api';

/**
 * Modal for initiating a new invoice for a specific business.
 * Props:
 *   shop    — { id: businessId, business: businessName } | null
 *   onClose — () => void
 *   onDone  — () => void   (called after successful creation to refresh list)
 */
export default function InitiateInvoiceModal({ shop, onClose, onDone }) {
  const [amount, setAmount]   = useState('');
  const [dueDate, setDueDate] = useState('');
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  if (!shop) return null;

  const handleSubmit = async () => {
    if (!amount || !dueDate) { setError('Amount and due date are required.'); return; }
    if (isNaN(Number(amount)) || Number(amount) <= 0) { setError('Enter a valid amount.'); return; }

    setSaving(true);
    setError('');
    const { ok, data } = await apiFetchJson('/admin/billing/initiate', {
      method: 'POST',
      body: JSON.stringify({ businessId: shop.id, amount: Number(amount), dueDate }),
    });
    setSaving(false);
    if (ok) {
      onDone?.();
      onClose();
    } else {
      setError(data?.message || 'Failed to create invoice.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />

      <div className="relative bg-[#ece5c8] rounded-[24px] border border-[#14391a]/15 p-8 w-full max-w-[460px] shadow-2xl flex flex-col text-[#14391a] gap-5">
        {/* Icon */}
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#c5d8a4]/40 text-[#14391a]">
          <FileText size={28} strokeWidth={2.5} />
        </div>

        {/* Header */}
        <div>
          <h3 className="text-3xl font-black tracking-tight text-[#14391a] leading-none">
            Initiate Invoice
          </h3>
          <p className="text-sm font-bold text-[#14391a]/80 mt-2">
            Creating a new invoice for <span className="font-extrabold">{shop.business}</span>.
          </p>
        </div>

        {/* Amount */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-extrabold text-[#14391a]">Amount (Rs)</label>
          <input
            type="number"
            min="1"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="e.g. 4500"
            className="w-full bg-[#fdfce8]/90 border border-[#14391a]/20 rounded-xl px-4 py-3 text-sm text-[#14391a] font-extrabold outline-none focus:ring-1 focus:ring-[#14391a]/30 placeholder:font-semibold placeholder:text-[#14391a]/50"
          />
        </div>

        {/* Due Date */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-extrabold text-[#14391a]">Due Date</label>
          <input
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            className="w-full bg-[#fdfce8]/90 border border-[#14391a]/20 rounded-xl px-4 py-3 text-sm text-[#14391a] font-extrabold outline-none focus:ring-1 focus:ring-[#14391a]/30"
          />
        </div>

        {error && (
          <p className="text-xs font-bold text-[#99221b] -mt-2">{error}</p>
        )}

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-4 mt-1">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 bg-[#fdfce8]/90 border border-[#14391a]/40 text-[#14391a] text-base font-extrabold rounded-xl hover:bg-white active:scale-[0.98] transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="w-full py-3.5 bg-[#14391a] hover:bg-[#0f2a13] disabled:opacity-60 text-white text-base font-extrabold rounded-xl active:scale-[0.98] transition-all cursor-pointer"
          >
            {saving ? 'Creating…' : 'Create Invoice'}
          </button>
        </div>
      </div>
    </div>
  );
}
