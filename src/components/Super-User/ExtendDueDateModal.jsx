import { useState, useEffect } from 'react';

function toInputDate(isoDate) {
  if (!isoDate) return '';
  return isoDate.slice(0, 10); // YYYY-MM-DD
}

function fmtDisplay(isoDate) {
  if (!isoDate) return '—';
  return new Date(isoDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ExtendDueDateModal({ extendingShop, onClose, onSave }) {
  const [newDueDate,   setNewDueDate]   = useState('');
  const [extendReason, setExtendReason] = useState('');
  const [saving,       setSaving]       = useState(false);

  useEffect(() => {
    if (extendingShop) {
      // Default new date = current due date + 14 days, or 14 days from today
      const base = extendingShop.billDueDate
        ? new Date(extendingShop.billDueDate)
        : new Date();
      base.setDate(base.getDate() + 14);
      setNewDueDate(base.toISOString().slice(0, 10));
      setExtendReason('');
    }
  }, [extendingShop]);

  if (!extendingShop) return null;

  const handleSave = async () => {
    setSaving(true);
    await onSave(extendingShop.id, newDueDate, extendReason);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-[#efeacb] rounded-[24px] border border-[#bfbc9b] p-8 w-full max-w-[440px] shadow-2xl flex flex-col text-[#152f16] gap-5">
        <div>
          <h3 className="text-3xl font-bold font-serif text-[#152f16] leading-tight">Extend billing due date</h3>
          <p className="text-sm font-semibold text-[#55694a] mt-1">
            {extendingShop.business}
            {extendingShop.billStatus === 'overdue'
              ? ` — Rs ${Number(extendingShop.billAmount || 0).toLocaleString()} overdue`
              : ''}
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-[#152f16]">Current due date</label>
              <input type="text" readOnly value={fmtDisplay(extendingShop.billDueDate)}
                className="w-full bg-[#fdfcf3] border border-[#c8c2a3]/60 rounded-xl px-4 py-3 text-sm text-[#152f16] font-semibold outline-none opacity-80 cursor-default" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-[#152f16]">New due date</label>
              <input type="date" value={newDueDate} onChange={e => setNewDueDate(e.target.value)}
                min={new Date().toISOString().slice(0, 10)}
                className="w-full bg-[#fdfcf3] border border-[#c8c2a3]/60 rounded-xl px-4 py-3 text-sm text-[#152f16] font-semibold outline-none focus:ring-1 focus:ring-[#0d3b1b]/30 cursor-pointer" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-[#152f16]">Reason (Optional)</label>
            <textarea placeholder="Add a note for this grace period…."
              value={extendReason} onChange={e => setExtendReason(e.target.value)}
              className="w-full min-h-[100px] bg-[#fdfcf3] border border-[#c8c2a3]/60 rounded-xl p-4 text-sm text-[#152f16] font-semibold outline-none placeholder-[#607455]/60 focus:ring-1 focus:ring-[#0d3b1b]/30 resize-none" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-2">
          <button type="button" onClick={onClose} disabled={saving}
            className="w-full py-3.5 bg-[#fdfcf3] border border-[#0d3b1b]/60 text-[#0d3b1b] text-base font-bold rounded-xl hover:bg-neutral-50 transition cursor-pointer">
            Cancel
          </button>
          <button type="button" onClick={handleSave} disabled={saving || !newDueDate}
            className="w-full py-3.5 bg-[#fbc000] text-[#0d3b1b] text-base font-bold rounded-xl hover:bg-[#e2ac00] transition cursor-pointer disabled:opacity-60">
            {saving ? 'Saving…' : 'Extend due date'}
          </button>
        </div>
      </div>
    </div>
  );
}
