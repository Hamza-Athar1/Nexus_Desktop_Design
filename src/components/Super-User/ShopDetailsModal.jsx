export default function ShopDetailsModal({ selectedShop, onClose }) {
  if (!selectedShop) return null;

  const s = selectedShop;

  function fmtDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  const billLine =
    s.billStatus === 'paid'
      ? `Paid — Rs ${Number(s.billAmount || 0).toLocaleString()}`
      : s.billDisplayText || '—';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-[#efeacb] rounded-[24px] border border-[#bfbc9b] p-8 w-full max-w-[440px] shadow-2xl flex flex-col text-[#152f16]">
        <div className="mb-5">
          <h3 className="text-3xl font-bold font-serif text-[#152f16] leading-tight">{s.business}</h3>
          <p className="text-sm font-semibold text-[#55694a] mt-1">
            {[s.shopAddress, s.cityRegion].filter(Boolean).join(', ')}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="bg-[#fdfcf3] border border-[#e6e2c3] rounded-2xl p-4 flex flex-col">
            <span className="text-xs font-bold text-[#152f16]">POS purchased</span>
            <span className="text-4xl font-extrabold text-[#152f16] mt-2 leading-none">{s.posPurchased ?? '—'}</span>
          </div>
          <div className="bg-[#fdfcf3] border border-[#e6e2c3] rounded-2xl p-4 flex flex-col">
            <span className="text-xs font-bold text-[#152f16]">POS active</span>
            <span className="text-4xl font-extrabold text-[#152f16] mt-2 leading-none">{s.posActive ?? '—'}</span>
          </div>
        </div>

        <div className="border-t border-[#bfbc9b]/40 mb-5" />

        <div className="flex flex-col gap-4 mb-6">
          {[
            ['Selected POS module', s.posModule],
            ['Owner',               s.owner],
            ['Registered on',       fmtDate(s.registeredAt)],
            ['Bill this month',     billLine],
            ['Bill expires',        fmtDate(s.billDueDate)],
            ['Last bill paid',      fmtDate(s.lastPaidAt)],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between items-center text-sm">
              <span className="font-bold text-[#55694a]">{label}</span>
              <span className="font-extrabold text-[#152f16]">{value}</span>
            </div>
          ))}
        </div>

        <button type="button" onClick={onClose}
          className="w-full py-4 bg-[#0d3b1b] text-[#efeacb] text-lg font-bold rounded-xl hover:bg-[#072410] transition cursor-pointer">
          Close
        </button>
      </div>
    </div>
  );
}
