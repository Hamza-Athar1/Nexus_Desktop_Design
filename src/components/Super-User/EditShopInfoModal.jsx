import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export default function EditShopInfoModal({ editingShop, onClose, onSave }) {
  const [shopName, setShopName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [posModule, setPosModule] = useState('');
  const [ownerName, setOwnerName] = useState('');

  useEffect(() => {
    if (editingShop) {
      setShopName(editingShop.business);
      const parts = editingShop.address.split(',');
      if (parts.length > 1) {
        const cityVal = parts[parts.length - 1].trim();
        const addrVal = parts.length > 2 ? parts[parts.length - 2].trim() : parts[0].trim();
        setAddress(addrVal);
        setCity(cityVal);
      } else {
        setAddress(editingShop.address);
        setCity('');
      }
      setPosModule(editingShop.posModule);
      setOwnerName(editingShop.owner);
    }
  }, [editingShop]);

  if (!editingShop) return null;

  const handleSave = () => {
    onSave(editingShop.id, {
      business: shopName,
      address: `Shop 12, Block C, ${address}, ${city}`,
      posModule,
      owner: ownerName
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-[#efeacb] rounded-[24px] border border-[#bfbc9b] p-8 w-full max-w-[440px] shadow-2xl flex flex-col text-[#152f16] gap-5 animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div>
          <h3 className="text-3xl font-bold font-serif text-[#152f16] leading-tight">
            Edit shop info
          </h3>
          <p className="text-sm font-semibold text-[#55694a] mt-1">
            {editingShop.business} - ID #AK-0{editingShop.id + 13}
          </p>
        </div>

        {/* Form Fields */}
        <div className="flex flex-col gap-4">
          {/* Shop name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-[#152f16]">Shop name</label>
            <input
              type="text"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              className="w-full bg-[#fdfcf3] border border-[#c8c2a3]/60 rounded-xl px-4 py-3 text-sm text-[#152f16] font-semibold outline-none focus:ring-1 focus:ring-[#0d3b1b]/30"
            />
          </div>

          {/* Address */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-[#152f16]">Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-[#fdfcf3] border border-[#c8c2a3]/60 rounded-xl px-4 py-3 text-sm text-[#152f16] font-semibold outline-none focus:ring-1 focus:ring-[#0d3b1b]/30"
            />
          </div>

          {/* City and POS Module */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-[#152f16]">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-[#fdfcf3] border border-[#c8c2a3]/60 rounded-xl px-4 py-3 text-sm text-[#152f16] font-semibold outline-none focus:ring-1 focus:ring-[#0d3b1b]/30"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-[#152f16]">POS module</label>
              <div className="relative">
                <select
                  value={posModule}
                  onChange={(e) => setPosModule(e.target.value)}
                  className="w-full bg-[#fdfcf3] border border-[#c8c2a3]/60 rounded-xl pl-4 pr-10 py-3 text-sm text-[#152f16] font-semibold outline-none appearance-none cursor-pointer focus:ring-1 focus:ring-[#0d3b1b]/30"
                >
                  <option value="Pharmacy POS">Pharmacy POS</option>
                  <option value="Bakery POS">Bakery POS</option>
                  <option value="Gifting POS">Gifting POS</option>
                  <option value="Grocery POS">Grocery POS</option>
                  <option value="Restaurant POS">Restaurant POS</option>
                  <option value="Clothing POS">Clothing POS</option>
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#152f16]">
                  <ChevronDown size={18} />
                </div>
              </div>
            </div>
          </div>

          {/* Owner name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-[#152f16]">Owner name</label>
            <input
              type="text"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className="w-full bg-[#fdfcf3] border border-[#c8c2a3]/60 rounded-xl px-4 py-3 text-sm text-[#152f16] font-semibold outline-none focus:ring-1 focus:ring-[#0d3b1b]/30"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 bg-[#fdfcf3] border border-[#0d3b1b]/60 text-[#0d3b1b] text-base font-bold rounded-xl hover:bg-neutral-50 active:scale-[0.98] transition-all cursor-pointer text-center leading-none"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="w-full py-3.5 bg-[#0d3b1b] text-white text-base font-bold rounded-xl hover:bg-[#072410] active:scale-[0.98] transition-all cursor-pointer text-center leading-none"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
