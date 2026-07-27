import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import AddPaletteForm from './AddPaletteForm';

const PRESETS_THEMES = [
  { name: 'Bakery', colors: ['#a0522d', '#cd853f', '#deb887', '#3e2723'] },
  { name: 'Forest', colors: ['#14391a', '#4caf50', '#81c784', '#e8f5e9'] },
  { name: 'Ocean', colors: ['#0d47a1', '#2196f3', '#90caf9', '#0a192f'] },
  { name: 'Slate', colors: ['#424242', '#9e9e9e', '#e0e0e0', '#1a1a1a'] },
  { name: 'Berry', colors: ['#880e4f', '#e91e63', '#f48fb1', '#4a148c'] },
  { name: 'Amber', colors: ['#5c3a21', '#a0522d', '#e2b350', '#3e2723'] },
];

export default function EditPOSModal({ pos, isOpen, onCancel, onSave }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [theme, setTheme] = useState(PRESETS_THEMES[0]);
  const [palettes, setPalettes] = useState(PRESETS_THEMES);
  const [isAddPaletteOpen, setIsAddPaletteOpen] = useState(false);

  // Initialize form state when the modal opens with the selected POS
  useEffect(() => {
    if (pos) {
      setName(pos.name || '');
      const rawPrice = pos.price ? pos.price.replace('Rs', '').replace('/mo', '').trim() : '';
      setPrice(rawPrice);
      const matchedTheme = palettes.find((t) => t.name === pos.theme?.name) || pos.theme || palettes[0];
      setTheme(matchedTheme);
    }
  }, [pos, palettes]);

  if (!isOpen) return null;

  const handleAddPalette = () => {
    // Generate a random new palette for demo/interactive purposes
    const randomColors = [
      '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
      '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
      '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
      '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
    ];
    const newName = `Custom ${palettes.length - PRESETS_THEMES.length + 1}`;
    const newPalette = { name: newName, colors: randomColors };
    setPalettes([...palettes, newPalette]);
    setTheme(newPalette);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      ...pos,
      name: name.trim(),
      price: price.trim() ? `Rs ${price.trim()}/mo` : 'Rs 0/mo',
      theme: theme,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 font-sans select-none text-[#14391a]">
      {/* Modal Container */}
      <div className="bg-[#faf8ed] border border-[#14391a]/15 rounded-[24px] w-full max-w-4xl p-6.5 flex flex-col gap-5 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#14391a]/10 pb-3">
          <h2 className="text-[22px] font-black text-[#14391a]">
            Edit POS - {pos?.name || 'New POS'}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="text-[#14391a]/60 hover:text-[#14391a] transition cursor-pointer"
          >
            <X size={22} strokeWidth={2.5} />
          </button>
        </div>

        {/* Content Layout */}
        <form onSubmit={handleFormSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Form & Palettes */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              
              {/* Row 1: Name and Price Inputs */}
              <div className="flex flex-wrap sm:flex-nowrap gap-4">
                <div className="w-full sm:w-1/2">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="POS Name"
                    className="w-full bg-[#fcfbfa] border border-[#14391a]/35 text-[#14391a] px-4 py-3 text-[15px] font-semibold rounded-[12px] focus:outline-none focus:border-[#14391a]/50"
                  />
                </div>
                <div className="w-full sm:w-1/2 flex items-center bg-[#fcfbfa] border border-[#14391a]/35 rounded-[12px] focus-within:border-[#14391a]/50 overflow-hidden px-4">
                  <span className="text-[#14391a]/70 font-semibold text-[15px] mr-1 select-none">Rs</span>
                  <input
                    type="text"
                    required
                    value={price}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^\d]/g, '');
                      setPrice(val ? Number(val).toLocaleString() : '');
                    }}
                    placeholder="3,500"
                    className="flex-1 bg-transparent border-0 text-[#14391a] py-3 text-[15px] font-semibold outline-none focus:ring-0"
                  />
                  <span className="text-[#14391a]/70 font-semibold text-[15px] ml-1 select-none">/mo</span>
                </div>
              </div>

              {/* Row 2: Popular Palettes Label */}
              <div>
                <span className="block text-sm font-extrabold text-[#14391a] mb-3">
                  Popular palettes - click to preview
                </span>

                {/* Palettes Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                  {palettes.map((p) => {
                    const isSelected = theme.name === p.name;
                    return (
                      <button
                        type="button"
                        key={p.name}
                        onClick={() => setTheme(p)}
                        className={`flex flex-col gap-2.5 p-3.5 bg-[#fcfbfa] rounded-[16px] border text-left transition ${
                          isSelected
                            ? 'border-[#14391a] ring-1 ring-[#14391a] shadow-xs'
                            : 'border-[#14391a]/15 hover:border-[#14391a]/30'
                        }`}
                      >
                        <div className="flex -space-x-1.5">
                          {p.colors.map((color, idx) => (
                            <span
                              key={idx}
                              className="w-4.5 h-4.5 rounded-full border border-white/60 shadow-xs"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <span className="text-[13px] font-black text-[#14391a]">{p.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Add Palette Button */}
              {!isAddPaletteOpen ? (
                <button
                  type="button"
                  onClick={() => setIsAddPaletteOpen(true)}
                  className="self-start flex items-center gap-2 px-5 py-3 border border-dashed border-[#14391a] hover:bg-[#14391a]/5 text-[#14391a] text-sm font-extrabold rounded-[12px] transition cursor-pointer"
                >
                  <Plus size={16} strokeWidth={2.5} />
                  <span>Add palette</span>
                </button>
              ) : (
                <AddPaletteForm
                  onCancel={() => setIsAddPaletteOpen(false)}
                  onAdd={(newPalette) => {
                    setPalettes([...palettes, newPalette]);
                    setTheme(newPalette);
                  }}
                />
              )}
            </div>

            {/* Right Column: Live Review */}
            <div className="lg:col-span-5 flex flex-col gap-3">
              <span className="block text-sm font-extrabold text-[#14391a]">
                Live review
              </span>

              {/* Review Card */}
              <div
                className="border border-[#14391a]/15 rounded-[20px] p-5 shadow-xs flex flex-col gap-4.5 min-h-[220px] justify-between transition-colors duration-200"
                style={{ backgroundColor: theme.colors[2] }}
              >
                <div>
                  {/* Card POS name header */}
                  <div
                    className="px-4 py-3 rounded-[12px] font-black text-base truncate transition-colors duration-200"
                    style={{ backgroundColor: theme.colors[0], color: '#fff' }}
                  >
                    {name || 'POS name'}
                  </div>
                </div>

                {/* Badge Price */}
                <div>
                  <span
                    className="inline-flex px-4 py-2 rounded-[10px] text-sm font-extrabold transition-colors duration-200"
                    style={{ backgroundColor: theme.colors[3], color: '#fff' }}
                  >
                    {price ? `Rs ${price}/mo` : 'Rs 0/mo'}
                  </span>
                </div>

                {/* Sample Button themed dynamically */}
                <button
                  type="button"
                  className="w-full py-3.5 text-white font-extrabold rounded-[12px] transition shadow-xs cursor-pointer text-center transition-colors duration-200"
                  style={{
                    backgroundColor: theme.colors[1],
                  }}
                  onClick={() => alert(`Reviewing ${name} action button!`)}
                >
                  Sample button
                </button>
              </div>
            </div>

          </div>

          {/* Action Buttons Footer */}
          <div className="flex items-center justify-end gap-3.5 border-t border-[#14391a]/10 pt-4 mt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-8 py-3.5 border border-[#14391a] hover:bg-gray-50 text-[#14391a] text-[15px] font-extrabold rounded-[12px] transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-3.5 bg-[#113819] hover:bg-[#14391a] text-white text-[15px] font-extrabold rounded-[12px] transition cursor-pointer shadow-sm text-center"
            >
              Update POS
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
