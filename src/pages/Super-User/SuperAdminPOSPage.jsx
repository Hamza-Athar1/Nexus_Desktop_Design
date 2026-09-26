import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Palette, ShieldCheck, Tag, Trash2 } from 'lucide-react';
import { apiFetchJson } from '../../lib/api';
import AddPaletteForm from '../../components/Super-User/AddPaletteForm';

export default function SuperAdminPOSPage() {
  const { setHeaderDetails } = useOutletContext() || {};
  const [palettes, setPalettes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addPaletteOpen, setAddPaletteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    if (setHeaderDetails) {
      setHeaderDetails({
        title: 'Theme management',
        subtitle: (
          <>
            <span>{palettes.length} Color Palettes</span>
            <span className="text-[#14391a]/30">•</span>
            <span>Platform themes catalogue</span>
          </>
        )
      });
    }
  }, [palettes.length, setHeaderDetails]);

  // ── Load Palettes ────────────────────────────────────────────────────────────
  const loadPalettes = useCallback(async () => {
    const palRes = await apiFetchJson('/admin/pos/palettes');
    if (palRes.ok) setPalettes(palRes.data.palettes);
    setLoading(false);
  }, []);

  useEffect(() => { loadPalettes(); }, [loadPalettes]);

  // ── Create Custom Palette ───────────────────────────────────────────────────
  const handleCreatePalette = async (formData) => {
    // formData: { name, colors:[primary, accent, shade, light], price }
    const payload = {
      name: formData.name,
      colorPrimary: formData.colors[0],
      colorAccent: formData.colors[1],
      colorShade: formData.colors[2],
      colorLight: formData.colors[3],
      price: formData.price || 0,
    };
    const { ok } = await apiFetchJson('/admin/pos/palettes', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (ok) {
      setAddPaletteOpen(false);
      loadPalettes();
    }
  };

  const [editPaletteTarget, setEditPaletteTarget] = useState(null);

  // ── Update Custom Palette ───────────────────────────────────────────────────
  const handleUpdatePalette = async (formData) => {
    if (!editPaletteTarget) return;
    const payload = {
      name: formData.name,
      colorPrimary: formData.colors[0],
      colorAccent: formData.colors[1],
      colorShade: formData.colors[2],
      colorLight: formData.colors[3],
      price: formData.price || 0,
    };
    const { ok } = await apiFetchJson(`/admin/pos/palettes/${editPaletteTarget.id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    if (ok) {
      setEditPaletteTarget(null);
      loadPalettes();
    }
  };

  // ── Delete Custom Palette ───────────────────────────────────────────────────
  const handleDeletePalette = async () => {
    if (!deleteTarget) return;
    const { ok } = await apiFetchJson(`/admin/pos/palettes/${deleteTarget.id}`, { method: 'DELETE' });
    if (ok) {
      setDeleteTarget(null);
      loadPalettes();
    }
  };

  const presetCount = palettes.filter(p => p.isPreset).length;
  const customCount = palettes.filter(p => !p.isPreset).length;

  return (
    <div className="flex-1 flex flex-col font-sans select-none text-[#14391a]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="lg:hidden">
          <h1 className="text-3xl sm:text-[44px] font-black text-[#14391a] leading-none mb-1">
            Theme management
          </h1>
          <p className="text-xs sm:text-base text-[#14391a]/70 font-semibold mt-2 flex items-center gap-2">
            <span>{palettes.length} Color Palettes</span>
            <span className="text-[#14391a]/30">•</span>
            <span>Platform themes catalogue</span>
          </p>
        </div>
        <div className="w-full sm:w-auto lg:ml-auto">
          <button
            type="button"
            onClick={() => {
              setEditPaletteTarget(null);
              setAddPaletteOpen(prev => !prev);
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-[#113819] hover:bg-[#14391a] text-white text-sm font-extrabold rounded-xl transition cursor-pointer shadow-sm"
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>{addPaletteOpen ? 'Close Form' : 'Add New Theme'}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
        {[
          { label: 'Total Palettes', value: palettes.length, color: 'text-white', icon: Palette },
          { label: 'Free / Presets', value: presetCount, color: 'text-white', icon: ShieldCheck },
          { label: 'Custom Palettes', value: customCount, color: 'text-[#deb887]', icon: Tag },
        ].map(({ label, value, color, icon: IconComponent }) => (
          <div key={label} className="bg-[#0b2b14] rounded-3xl border border-[#2e5c38]/40 p-6 flex items-center justify-between text-[#efeacb] hover:border-[#40804e]/60 transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1 hover:shadow-[0_12px_40px_rgb(0,0,0,0.18)]">
            <div className="flex flex-col gap-1 flex-1 min-w-0 pr-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#a2bc90]/80">{label}</span>
              <span className={`text-3xl sm:text-4xl font-black ${color}`}>{value}</span>
            </div>
            <div className="flex-1 h-[1px] bg-gradient-to-r from-[#2e5c38]/50 via-[#2e5c38]/20 to-transparent mx-2 hidden sm:block" />
            <div className="w-12 h-12 rounded-2xl bg-[#071c0d] border border-[#2e5c38]/40 flex items-center justify-center text-[#a2bc90] shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] shrink-0">
              <IconComponent size={22} className="stroke-[1.75]" />
            </div>
          </div>
        ))}
      </div>

      {/* Inline Add/Edit Theme Form */}
      {(addPaletteOpen || editPaletteTarget) && (
        <div className="mb-8">
          <h3 className="text-lg font-black text-[#14391a] mb-3">
            {editPaletteTarget ? `Edit Theme: ${editPaletteTarget.name}` : 'Create New Theme Palette'}
          </h3>
          <AddPaletteForm
            initialData={editPaletteTarget}
            onCancel={() => {
              setAddPaletteOpen(false);
              setEditPaletteTarget(null);
            }}
            onAdd={editPaletteTarget ? handleUpdatePalette : handleCreatePalette}
          />
        </div>
      )}

      {/* Palette Catalogue Grid */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-black uppercase tracking-wider text-[#14391a]/80">Available Theme Catalogue</h3>
        <span className="text-xs font-bold text-[#14391a]/60">{palettes.length} total themes available</span>
      </div>

      {loading && (
        <div className="p-8 text-center text-sm font-semibold text-[#14391a]/60 bg-[#efeacb] rounded-2xl border border-[#bfbc9b]">
          Loading themes catalogue...
        </div>
      )}

      {!loading && palettes.length === 0 && (
        <div className="p-8 text-center text-sm font-semibold text-[#14391a]/60 bg-[#efeacb] rounded-2xl border border-[#bfbc9b]">
          No theme palettes created yet. Click "Add New Theme" to create your first palette.
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {palettes.map((p) => {
            const colorsArray = p.colors || [p.colorPrimary, p.colorAccent, p.colorShade, p.colorLight];
            return (
              <div
                key={p.id}
                className="bg-[#efeacb] border border-[#bfbc9b] rounded-3xl p-5 shadow-xs flex flex-col justify-between gap-4 hover:border-[#14391a]/40 transition duration-200"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-black text-lg text-[#14391a] leading-snug">{p.name}</h4>
                    <span className="text-xs font-bold text-[#14391a]/70">
                      {p.price > 0 ? `Rs ${p.price.toLocaleString()}` : 'Free / Included'}
                    </span>
                  </div>
                  <span className={`px-3 py-1 rounded-xl text-[11px] font-extrabold border ${
                    p.isPreset ? 'bg-[#cbebc7] text-[#14391a] border-[#14391a]/25' : 'bg-[#e4dcbc] text-[#14391a]/80 border-[#14391a]/20'
                  }`}>
                    {p.isPreset ? 'Preset Theme' : 'Custom Theme'}
                  </span>
                </div>

                {/* Swatches */}
                <div className="flex items-center justify-between bg-[#eae3c1]/70 p-3 rounded-2xl border border-[#c8c2a3]/40">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {colorsArray.map((c, idx) => (
                        <span
                          key={idx}
                          className="w-6 h-6 rounded-full border-2 border-white shadow-xs"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-[#14391a]/60 uppercase tracking-wider">4 Swatches</span>
                </div>

                {/* Live Card Preview */}
                <div
                  className="rounded-2xl p-4 shadow-inner flex flex-col gap-3 justify-between min-h-[120px]"
                  style={{ backgroundColor: colorsArray[2] || '#fcfbfa' }}
                >
                  <div
                    className="px-3 py-1.5 rounded-lg text-xs font-black truncate shadow-xs"
                    style={{ backgroundColor: colorsArray[0], color: '#ffffff' }}
                  >
                    {p.name} Primary Title
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className="px-2.5 py-1 rounded-md text-[10px] font-bold"
                      style={{ backgroundColor: colorsArray[3], color: '#ffffff' }}
                    >
                      Card Light Shade
                    </span>
                    <button
                      type="button"
                      className="px-3 py-1 rounded-lg text-[11px] font-black shadow-xs"
                      style={{ backgroundColor: colorsArray[1], color: '#ffffff' }}
                    >
                      Accent Button
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-[#14391a]/15 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAddPaletteOpen(false);
                      setEditPaletteTarget(p);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-white text-[#14391a] border border-[#14391a]/40 text-xs font-extrabold rounded-xl hover:bg-neutral-50 transition cursor-pointer"
                  >
                    <span>Edit Theme</span>
                  </button>
                  {!p.isPreset && (
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(p)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-[#99221b] border border-red-200 text-xs font-extrabold rounded-xl hover:bg-red-100 transition cursor-pointer"
                    >
                      <Trash2 size={14} />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-[#fcfbfa] border border-[#99221b]/15 rounded-[24px] w-full max-w-sm p-6 flex flex-col gap-5 shadow-lg">
            <div>
              <h2 className="text-[20px] font-black text-[#99221b] leading-none mb-1">Delete Custom Theme?</h2>
              <p className="text-sm text-[#99221b]/80 font-semibold mt-2.5 leading-snug">
                Are you sure you want to delete theme <strong>{deleteTarget.name}</strong>? Businesses using this theme will revert to the default preset theme.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 mt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4.5 py-2.5 border border-gray-300 rounded-[12px] text-xs font-extrabold text-[#14391a]/60 hover:text-[#14391a] hover:bg-gray-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePalette}
                className="px-5 py-2.5 bg-[#99221b] hover:bg-[#b03026] text-white text-xs font-extrabold rounded-[12px] transition cursor-pointer"
              >
                Delete Theme
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
