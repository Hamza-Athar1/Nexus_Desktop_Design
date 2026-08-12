import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import AddPaletteForm from './AddPaletteForm';

/**
 * Props:
 *  pos             module object | null
 *  isOpen          bool
 *  palettes        [{id, name, colors, isPreset}]
 *  onCancel        ()=>void
 *  onCreatePalette ({name,colorPrimary,...}) => Promise<palette|null>
 *  onDeletePalette (id) => void
 *  onSave          ({name, priceCents, paletteId, status}) => void
 */
export default function EditPOSModal({ pos, isOpen, palettes, onCancel, onCreatePalette, onDeletePalette, onSave }) {
  const [name,  setName]  = useState('');
  const [price, setPrice] = useState('');
  const [theme, setTheme] = useState(null);
  const [status, setStatus] = useState('active');
  const [addPaletteOpen, setAddPaletteOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (pos) {
      setName(pos.name);
      // price comes as priceCents — convert to display
      const rupees = Math.round((pos.priceCents || 0) / 100);
      setPrice(rupees ? rupees.toLocaleString() : '');
      setTheme(pos.palette ?? null);
      setStatus(pos.status ?? 'active');
    }
  }, [pos]);

  const resolvedTheme = theme ?? palettes?.[0] ?? null;

  if (!isOpen) return null;

  const handleAddPalette = async (formData) => {
    const palette = await onCreatePalette({
      name:         formData.name,
      colorPrimary: formData.colors[0],
      colorAccent:  formData.colors[1],
      colorShade:   formData.colors[2],
      colorLight:   formData.colors[3],
    });
    if (palette) { setTheme(palette); setAddPaletteOpen(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const rawPrice = price.replace(/,/g, '');
    const priceCents = Math.round(Number(rawPrice) * 100);
    setSaving(true);
    await onSave({ name: name.trim(), priceCents, paletteId: resolvedTheme?.id ?? null, status });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4 font-sans select-none text-[#14391a]">
      <div className="bg-[#faf8ed] border border-[#14391a]/15 rounded-[24px] w-full max-w-4xl p-4 sm:p-6.5 flex flex-col gap-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#14391a]/10 pb-3">
          <h2 className="text-[22px] font-black text-[#14391a]">Edit POS - {pos?.name}</h2>
          <button type="button" onClick={onCancel} className="text-[#14391a]/60 hover:text-[#14391a] transition cursor-pointer">
            <X size={22} strokeWidth={2.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              {/* Name + Price */}
              <div className="flex flex-wrap sm:flex-nowrap gap-4">
                <input type="text" required value={name} onChange={e => setName(e.target.value)}
                  placeholder="POS Name"
                  className="w-full sm:w-1/2 bg-[#fcfbfa] border border-[#14391a]/35 text-[#14391a] px-4 py-3 text-[15px] font-semibold rounded-[12px] focus:outline-none focus:border-[#14391a]/50" />
                <div className="w-full sm:w-1/2 flex items-center bg-[#fcfbfa] border border-[#14391a]/35 rounded-[12px] focus-within:border-[#14391a]/50 overflow-hidden px-4">
                  <span className="text-[#14391a]/70 font-semibold text-[15px] mr-1 select-none">Rs</span>
                  <input type="text" required value={price}
                    onChange={e => { const v = e.target.value.replace(/[^\d]/g,''); setPrice(v ? Number(v).toLocaleString() : ''); }}
                    placeholder="3,500"
                    className="flex-1 bg-transparent border-0 text-[#14391a] py-3 text-[15px] font-semibold outline-none focus:ring-0" />
                  <span className="text-[#14391a]/70 font-semibold text-[15px] ml-1 select-none">/mo</span>
                </div>
              </div>

              {/* Status toggle */}
              <div className="flex items-center gap-4">
                {['active', 'inactive'].map(s => (
                  <button key={s} type="button" onClick={() => setStatus(s)}
                    className={`px-5 py-2 rounded-[10px] text-sm font-extrabold border transition cursor-pointer ${
                      status === s
                        ? s === 'active'
                          ? 'bg-[#cbebc7] border-[#14391a]/25 text-[#14391a]'
                          : 'bg-[#f7d6d3] border-[#d65f57]/30 text-[#99221b]'
                        : 'bg-white border-gray-200 text-[#14391a]/50'
                    }`}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>

              {/* Palette picker */}
              <div>
                <span className="block text-sm font-extrabold text-[#14391a] mb-3">Popular palettes - click to preview</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                  {palettes.map(p => {
                    const sel = resolvedTheme?.id === p.id;
                    return (
                      <button type="button" key={p.id} onClick={() => setTheme(p)}
                        className={`flex flex-col gap-2.5 p-3.5 bg-[#fcfbfa] rounded-[16px] border text-left transition ${sel ? 'border-[#14391a] ring-1 ring-[#14391a] shadow-xs' : 'border-[#14391a]/15 hover:border-[#14391a]/30'}`}>
                        <div className="flex -space-x-1.5">
                          {p.colors.map((c, i) => <span key={i} className="w-4.5 h-4.5 rounded-full border border-white/60 shadow-xs" style={{ backgroundColor: c }} />)}
                        </div>
                        <span className="text-[13px] font-black text-[#14391a]">{p.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Add palette */}
              {!addPaletteOpen ? (
                <button type="button" onClick={() => setAddPaletteOpen(true)}
                  className="self-start flex items-center gap-2 px-5 py-3 border border-dashed border-[#14391a] hover:bg-[#14391a]/5 text-[#14391a] text-sm font-extrabold rounded-[12px] transition cursor-pointer">
                  <Plus size={16} strokeWidth={2.5} /><span>Add palette</span>
                </button>
              ) : (
                <AddPaletteForm onCancel={() => setAddPaletteOpen(false)} onAdd={handleAddPalette} />
              )}
            </div>

            {/* Right — Live preview */}
            <div className="lg:col-span-5 flex flex-col gap-3">
              <span className="block text-sm font-extrabold text-[#14391a]">Live review</span>
              {resolvedTheme ? (
                <div className="border border-[#14391a]/15 rounded-[20px] p-5 shadow-xs flex flex-col gap-4.5 min-h-[220px] justify-between transition-colors duration-200"
                  style={{ backgroundColor: resolvedTheme.colors[2] }}>
                  <div className="px-4 py-3 rounded-[12px] font-black text-base truncate transition-colors duration-200"
                    style={{ backgroundColor: resolvedTheme.colors[0], color: '#fff' }}>
                    {name || 'POS name'}
                  </div>
                  <span className="inline-flex px-4 py-2 rounded-[10px] text-sm font-extrabold transition-colors duration-200"
                    style={{ backgroundColor: resolvedTheme.colors[3], color: '#fff' }}>
                    {price ? `Rs ${price}/mo` : 'Rs 0/mo'}
                  </span>
                  <div className="w-full py-3.5 text-white font-extrabold rounded-[12px] shadow-xs text-center transition-colors duration-200"
                    style={{ backgroundColor: resolvedTheme.colors[1] }}>
                    Sample button
                  </div>
                </div>
              ) : (
                <div className="border border-[#14391a]/15 rounded-[20px] p-5 min-h-[220px] flex items-center justify-center text-sm text-[#14391a]/40 font-semibold">
                  Select a palette to preview
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3.5 border-t border-[#14391a]/10 pt-4 mt-2">
            <button type="button" onClick={onCancel}
              className="px-8 py-3.5 border border-[#14391a] hover:bg-gray-50 text-[#14391a] text-[15px] font-extrabold rounded-[12px] transition cursor-pointer">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="px-8 py-3.5 bg-[#113819] hover:bg-[#14391a] text-white text-[15px] font-extrabold rounded-[12px] transition cursor-pointer shadow-sm disabled:opacity-60">
              {saving ? 'Saving…' : 'Update POS'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
