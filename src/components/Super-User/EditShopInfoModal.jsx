import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { apiFetchJson } from '../../lib/api';

const STATIC_MODULES = [
  { code: 'pharmacy',    label: 'Pharmacy POS' },
  { code: 'grocery',     label: 'Grocery POS' },
  { code: 'bakery',      label: 'Bakery POS' },
  { code: 'restaurant',  label: 'Restaurant POS' },
  { code: 'electronics', label: 'Electronics POS' },
  { code: 'general_store', label: 'General Store POS' },
  { code: 'clothing',    label: 'Clothing POS' },
];

export default function EditShopInfoModal({ editingShop, onClose, onSave }) {
  const [shopName,     setShopName]     = useState('');
  const [shopAddress,  setShopAddress]  = useState('');
  const [cityRegion,   setCityRegion]   = useState('');
  const [moduleCode,   setModuleCode]   = useState('');
  const [ownerName,    setOwnerName]    = useState('');
  const [saving,       setSaving]       = useState(false);

  useEffect(() => {
    if (editingShop) {
      setShopName(editingShop.business   || '');
      setShopAddress(editingShop.shopAddress || '');
      setCityRegion(editingShop.cityRegion   || '');
      setModuleCode(editingShop.moduleCode   || '');
      setOwnerName(editingShop.owner         || '');
    }
  }, [editingShop]);

  if (!editingShop) return null;

  const handleSave = async () => {
    setSaving(true);
    await onSave(editingShop.id, {
      name: shopName,
      shopAddress,
      cityRegion,
      moduleCode,
      ownerFullName: ownerName,
    });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-[#efeacb] rounded-[24px] border border-[#bfbc9b] p-8 w-full max-w-[440px] shadow-2xl flex flex-col text-[#152f16] gap-5">
        <div>
          <h3 className="text-3xl font-bold font-serif text-[#152f16] leading-tight">Edit shop info</h3>
          <p className="text-sm font-semibold text-[#55694a] mt-1">{editingShop.business}</p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-[#152f16]">Shop name</label>
            <input type="text" value={shopName} onChange={e => setShopName(e.target.value)}
              className="w-full bg-[#fdfcf3] border border-[#c8c2a3]/60 rounded-xl px-4 py-3 text-sm text-[#152f16] font-semibold outline-none focus:ring-1 focus:ring-[#0d3b1b]/30" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-[#152f16]">Address</label>
            <input type="text" value={shopAddress} onChange={e => setShopAddress(e.target.value)}
              className="w-full bg-[#fdfcf3] border border-[#c8c2a3]/60 rounded-xl px-4 py-3 text-sm text-[#152f16] font-semibold outline-none focus:ring-1 focus:ring-[#0d3b1b]/30" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-[#152f16]">City</label>
              <input type="text" value={cityRegion} onChange={e => setCityRegion(e.target.value)}
                className="w-full bg-[#fdfcf3] border border-[#c8c2a3]/60 rounded-xl px-4 py-3 text-sm text-[#152f16] font-semibold outline-none focus:ring-1 focus:ring-[#0d3b1b]/30" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-[#152f16]">POS module</label>
              <div className="relative">
                <select value={moduleCode} onChange={e => setModuleCode(e.target.value)}
                  className="w-full bg-[#fdfcf3] border border-[#c8c2a3]/60 rounded-xl pl-4 pr-10 py-3 text-sm text-[#152f16] font-semibold outline-none appearance-none cursor-pointer focus:ring-1 focus:ring-[#0d3b1b]/30">
                  {STATIC_MODULES.map(m => (
                    <option key={m.code} value={m.code}>{m.label}</option>
                  ))}
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#152f16]">
                  <ChevronDown size={18} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-[#152f16]">Owner name</label>
            <input type="text" value={ownerName} onChange={e => setOwnerName(e.target.value)}
              className="w-full bg-[#fdfcf3] border border-[#c8c2a3]/60 rounded-xl px-4 py-3 text-sm text-[#152f16] font-semibold outline-none focus:ring-1 focus:ring-[#0d3b1b]/30" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-2">
          <button type="button" onClick={onClose} disabled={saving}
            className="w-full py-3.5 bg-[#fdfcf3] border border-[#0d3b1b]/60 text-[#0d3b1b] text-base font-bold rounded-xl hover:bg-neutral-50 transition cursor-pointer">
            Cancel
          </button>
          <button type="button" onClick={handleSave} disabled={saving}
            className="w-full py-3.5 bg-[#0d3b1b] text-white text-base font-bold rounded-xl hover:bg-[#072410] transition cursor-pointer disabled:opacity-60">
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
