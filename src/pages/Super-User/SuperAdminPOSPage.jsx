import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { apiFetchJson } from '../../lib/api';
import AddPOSModal from '../../components/Super-User/AddPOSModal';
import EditPOSModal from '../../components/Super-User/EditPOSModal';

export default function SuperAdminPOSPage() {
  const { setHeaderDetails } = useOutletContext() || {};
  const [modules,  setModules]  = useState([]);
  const [palettes, setPalettes] = useState([]);
  const [stats,    setStats]    = useState({ total: 0, active: 0, themed: 0 });

  useEffect(() => {
    if (setHeaderDetails) {
      setHeaderDetails({
        title: 'POS management',
        subtitle: (
          <>
            <span>{stats.total} POS modules</span>
            <span className="text-[#14391a]/30">•</span>
            <span>themed with color palettes</span>
          </>
        )
      });
    }
  }, [stats.total, setHeaderDetails]);

  const [loading,  setLoading]  = useState(true);

  // Modal state
  const [addOpen,    setAddOpen]    = useState(false);
  const [editTarget, setEditTarget] = useState(null);   // module object | null
  const [deleteTarget, setDeleteTarget] = useState(null);

  // ── Load data ───────────────────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    const [modsRes, palRes, statsRes] = await Promise.all([
      apiFetchJson('/admin/pos'),
      apiFetchJson('/admin/pos/palettes'),
      apiFetchJson('/admin/pos/stats'),
    ]);
    if (modsRes.ok)  setModules(modsRes.data.modules);
    if (palRes.ok)   setPalettes(palRes.data.palettes);
    if (statsRes.ok) setStats(statsRes.data.stats);
    setLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { ok } = await apiFetchJson(`/admin/pos/${deleteTarget.id}`, { method: 'DELETE' });
    if (ok) { setDeleteTarget(null); loadAll(); }
  };

  // ── Palette create/delete callbacks (passed to modals) ───────────────────────
  const handleCreatePalette = async (paletteData) => {
    const { ok, data } = await apiFetchJson('/admin/pos/palettes', {
      method: 'POST',
      body: JSON.stringify(paletteData),
    });
    if (ok) {
      setPalettes(prev => [...prev, data.palette]);
      return data.palette;
    }
    return null;
  };

  const handleDeletePalette = async (id) => {
    const { ok } = await apiFetchJson(`/admin/pos/palettes/${id}`, { method: 'DELETE' });
    if (ok) setPalettes(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="flex-1 flex flex-col font-sans select-none text-[#14391a]">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="lg:hidden">
          <h1 className="text-4xl sm:text-[44px] font-black text-[#14391a] leading-none mb-1">
            POS management
          </h1>
          <p className="text-sm sm:text-base text-[#14391a]/70 font-semibold mt-2 flex items-center gap-2">
            <span>{stats.total} POS modules</span>
            <span className="text-[#14391a]/30">•</span>
            <span>themed with color palettes</span>
          </p>
        </div>
        <div className="lg:ml-auto">
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-2 px-6 py-3.5 bg-[#113819] hover:bg-[#14391a] text-white text-[15px] font-extrabold rounded-[12px] transition cursor-pointer shadow-sm"
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>Add POS</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Total POS',       value: stats.total,  color: 'text-white'       },
          { label: 'Active',          value: stats.active, color: 'text-white'       },
          { label: 'Themes Assigned', value: stats.themed, color: 'text-[#deb887]'   },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-[#113819] text-white rounded-[20px] p-6.5 shadow-sm flex flex-col justify-between h-[115px]">
            <span className="text-[12px] font-extrabold tracking-wider uppercase opacity-80">{label}</span>
            <span className={`text-4xl font-black ${color}`}>{value}</span>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[#ede7cd]/40 rounded-[20px] border border-[#14391a]/15 shadow-sm overflow-hidden">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-[#e4dcbc] border-b border-[#14391a]/15 text-[14px] font-extrabold text-[#14391a]">
              <th className="py-5 px-6">POS name</th>
              <th className="py-5 px-6">Price</th>
              <th className="py-5 px-6">Theme</th>
              <th className="py-5 px-6">Status</th>
              <th className="py-5 px-6 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#14391a]/10 bg-[#fbf9f0]">
            {loading && (
              <tr><td colSpan={5} className="py-8 text-center text-sm text-[#14391a]/50 font-semibold">Loading…</td></tr>
            )}
            {!loading && modules.length === 0 && (
              <tr><td colSpan={5} className="py-8 text-center text-sm text-[#14391a]/50 font-semibold">No POS modules yet. Click "+ Add POS" to create one.</td></tr>
            )}
            {modules.map(row => (
              <tr key={row.id} className="hover:bg-[#e9e3cb]/30 transition text-[15px] font-semibold text-[#14391a]">
                <td className="py-5 px-6 font-black">{row.name}</td>
                <td className="py-5 px-6 font-bold">{row.priceLabel}</td>
                <td className="py-5 px-6">
                  {row.palette ? (
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-1.5">
                        {row.palette.colors.map((c, i) => (
                          <span key={i} className="w-4.5 h-4.5 rounded-full border border-white/60 shadow-xs shrink-0"
                            style={{ backgroundColor: c }} />
                        ))}
                      </div>
                      <span className="text-sm font-bold text-[#14391a]/85">{row.palette.name}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-[#14391a]/40 font-semibold italic">No theme</span>
                  )}
                </td>
                <td className="py-5 px-6">
                  {row.status === 'active' ? (
                    <span className="inline-flex px-3.5 py-1.5 bg-[#cbebc7] border border-[#14391a]/25 rounded-[10px] text-[13px] font-extrabold text-[#14391a]">Active</span>
                  ) : (
                    <span className="inline-flex px-3.5 py-1.5 bg-[#f7d6d3] border border-[#d65f57]/30 rounded-[10px] text-[13px] font-extrabold text-[#99221b]">Inactive</span>
                  )}
                </td>
                <td className="py-5 px-6 text-center">
                  <div className="flex items-center justify-center gap-2.5">
                    <button onClick={() => setEditTarget(row)}
                      className="px-4 py-2 border border-[#14391a]/35 rounded-[10px] text-[13px] font-extrabold text-[#14391a] hover:bg-[#14391a]/5 transition cursor-pointer">
                      Edit
                    </button>
                    <button onClick={() => setDeleteTarget(row)}
                      className="px-4 py-2 border border-[#99221b]/35 rounded-[10px] text-[13px] font-extrabold text-[#99221b] hover:bg-[#99221b]/5 transition cursor-pointer">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      <AddPOSModal
        isOpen={addOpen}
        palettes={palettes}
        onCancel={() => setAddOpen(false)}
        onCreatePalette={handleCreatePalette}
        onDeletePalette={handleDeletePalette}
        onSave={async ({ name, priceCents, paletteId }) => {
          const { ok } = await apiFetchJson('/admin/pos', {
            method: 'POST',
            body: JSON.stringify({ name, priceCents, paletteId }),
          });
          if (ok) { setAddOpen(false); loadAll(); }
        }}
      />

      {/* Edit Modal */}
      <EditPOSModal
        pos={editTarget}
        isOpen={!!editTarget}
        palettes={palettes}
        onCancel={() => setEditTarget(null)}
        onCreatePalette={handleCreatePalette}
        onDeletePalette={handleDeletePalette}
        onSave={async ({ name, priceCents, paletteId, status }) => {
          const { ok } = await apiFetchJson(`/admin/pos/${editTarget.id}`, {
            method: 'PATCH',
            body: JSON.stringify({ name, priceCents, paletteId, status }),
          });
          if (ok) { setEditTarget(null); loadAll(); }
        }}
      />

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-[#fcfbfa] border border-[#99221b]/15 rounded-[24px] w-full max-w-sm p-6.5 flex flex-col gap-5 shadow-lg">
            <div>
              <h2 className="text-[20px] font-black text-[#99221b] leading-none mb-1">Delete POS Module?</h2>
              <p className="text-sm text-[#99221b]/80 font-semibold mt-2.5 leading-snug">
                Are you sure you want to delete <strong>{deleteTarget.name}</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 mt-2">
              <button onClick={() => setDeleteTarget(null)}
                className="px-4.5 py-2.5 border border-gray-300 rounded-[12px] text-xs font-extrabold text-[#14391a]/60 hover:text-[#14391a] hover:bg-gray-50 transition cursor-pointer">
                Cancel
              </button>
              <button onClick={handleDelete}
                className="px-5 py-2.5 bg-[#99221b] hover:bg-[#b03026] text-white text-xs font-extrabold rounded-[12px] transition cursor-pointer">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
