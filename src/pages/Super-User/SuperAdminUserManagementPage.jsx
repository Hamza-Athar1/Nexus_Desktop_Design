import { useState, useEffect, useCallback } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { MoreHorizontal } from 'lucide-react';
import { apiFetchJson } from '../../lib/api';
import ShopDetailsModal from '../../components/Super-User/ShopDetailsModal';
import EditShopInfoModal from '../../components/Super-User/EditShopInfoModal';
import ExtendDueDateModal from '../../components/Super-User/ExtendDueDateModal';
import ActivityLogModal from '../../components/Super-User/ActivityLogModal';
import MessageOwnerModal from '../../components/Super-User/MessageOwnerModal';
import BlockShopModal from '../../components/Super-User/BlockShopModal';
import DeleteShopModal from '../../components/Super-User/DeleteShopModal';
import SuspendShopModal from '../../components/Super-User/SuspendShopModal';

// ── helpers ──────────────────────────────────────────────────────────────────

function fmtDate(isoDate) {
  if (!isoDate) return '—';
  const d = new Date(isoDate);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ─────────────────────────────────────────────────────────────────────────────

export default function SuperAdminUserManagementPage() {
  const navigate = useNavigate();
  const { setHeaderDetails } = useOutletContext() || {};
  const [shops,        setShops]        = useState([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    if (setHeaderDetails) {
      setHeaderDetails({
        title: 'User Management',
        subtitle: loading ? '…' : `${shops.length} registered shops`
      });
    }
  }, [loading, shops.length, setHeaderDetails]);

  const [loadError,    setLoadError]    = useState('');
  const [actionError,  setActionError]  = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeDropdownId, setActiveDropdownId] = useState(null);

  // ── Modal state ──────────────────────────────────────────────────────────
  const [selectedShop,  setSelectedShop]  = useState(null);
  const [editingShop,   setEditingShop]   = useState(null);
  const [extendingShop, setExtendingShop] = useState(null);
  const [activityShop,  setActivityShop]  = useState(null);
  const [messagingShop, setMessagingShop] = useState(null);
  const [blockingShop,  setBlockingShop]  = useState(null);
  const [deletingShop,  setDeletingShop]  = useState(null);
  const [suspendingShop,setSuspendingShop]= useState(null);

  // ── Data loading ─────────────────────────────────────────────────────────
  const loadShops = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    const { ok, data } = await apiFetchJson('/admin/shops');
    if (ok) {
      setShops(data.shops || []);
    } else {
      setLoadError(data?.message || 'Failed to load shops.');
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadShops(); }, [loadShops]);

  // ── Derived counts ───────────────────────────────────────────────────────
  const totalCount     = shops.length;
  const activeCount    = shops.filter(s => s.status === 'active').length;
  const suspendedCount = shops.filter(s => s.status === 'suspended').length;
  const blockedCount   = shops.filter(s => s.status === 'blocked').length;

  const filteredShops = activeFilter === 'all'
    ? shops
    : shops.filter(s => s.status === activeFilter);

  // ── Action helpers ───────────────────────────────────────────────────────
  async function apiPatchStatus(id, status, reason) {
    setActionError('');
    const { ok, data } = await apiFetchJson(`/admin/shops/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason }),
    });
    if (ok) {
      setShops(prev => prev.map(s => (s.id === id ? data.shop : s)));
    } else {
      setActionError(data?.message || 'Action failed. Please try again.');
    }
  }

  const handleSuspendShop = async (id, reason) => {
    await apiPatchStatus(id, 'suspended', reason);
    setSuspendingShop(null);
  };

  const handleBlockShop = async (id, reason) => {
    await apiPatchStatus(id, 'blocked', reason);
    setBlockingShop(null);
  };

  const handleActivate = (id) => {
    const targetShop = shops.find(s => s.id === id);
    navigate(`/super-admin/activate/${id}`, { state: { shop: targetShop } });
  };

  const handleSaveChanges = async (id, fields) => {
    setActionError('');
    const { ok, data } = await apiFetchJson(`/admin/shops/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(fields),
    });
    if (ok) {
      setShops(prev => prev.map(s => (s.id === id ? data.shop : s)));
      setEditingShop(null);
    } else {
      setActionError(data?.message || 'Save failed.');
    }
  };

  const handleSaveExtend = async (id, newDueDate, reason) => {
    setActionError('');
    const { ok, data } = await apiFetchJson(`/admin/shops/${id}/extend-due`, {
      method: 'PATCH',
      body: JSON.stringify({ newDueDate, reason }),
    });
    if (ok) {
      setShops(prev => prev.map(s => (s.id === id ? data.shop : s)));
      setExtendingShop(null);
    } else {
      setActionError(data?.message || 'Extend failed.');
    }
  };

  const handleSendMessage = async (id, { subject, body }) => {
    setActionError('');
    const { ok, data } = await apiFetchJson(`/admin/shops/${id}/message`, {
      method: 'POST',
      body: JSON.stringify({ subject, body }),
    });
    if (!ok) {
      setActionError(data?.message || 'Failed to send message.');
    }
    // Modal stays open so it can show its own success confirmation view.
    // The modal's "Done" button calls onClose to dismiss it.
  };

  const handleDeleteShop = async (id) => {
    setActionError('');
    const { ok, data } = await apiFetchJson(`/admin/shops/${id}`, { method: 'DELETE' });
    if (ok) {
      setShops(prev => prev.filter(s => s.id !== id));
      setDeletingShop(null);
    } else {
      setActionError(data?.message || 'Delete failed.');
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col font-sans">
      {/* Header */}
      <div className="mb-8 lg:hidden">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#152f16] font-serif mb-2">
          User Management
        </h1>
        <p className="text-base sm:text-lg text-[#55694a] font-medium">
          {loading ? '…' : `${totalCount} registered shops`}
        </p>
      </div>

      {/* Action error banner */}
      {actionError && (
        <div className="mb-4 px-4 py-3 bg-[#fbebeb] border border-[#d89f9f] text-[#a93b3b] text-sm font-semibold rounded-xl">
          {actionError}
        </div>
      )}

      {/* Filter Pills Bar (Scrollable on mobile) */}
      <div className="flex items-center gap-2 sm:gap-3 mb-6 overflow-x-auto pb-1 scrollbar-none flex-nowrap sm:flex-wrap">
        {[
          { key: 'all',       label: `All (${totalCount})` },
          { key: 'active',    label: `Active (${activeCount})` },
          { key: 'suspended', label: `Suspended (${suspendedCount})` },
          { key: 'blocked',   label: `Blocked (${blockedCount})` },
        ].map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveFilter(key)}
            className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl font-extrabold text-xs sm:text-sm border transition duration-200 cursor-pointer shrink-0 ${
              activeFilter === key
                ? 'bg-[#0c3818] text-white border-[#0c3818] shadow-sm'
                : 'bg-white text-[#152f16] border-[#bfbc9b] hover:bg-[#efeacb]/30'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[#efeacb] rounded-[24px] border border-[#bfbc9b] shadow-sm">
        <div className="hidden md:block">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#eae3c1] border-b border-[#bfbc9b] text-[11px] font-black uppercase tracking-wider text-[#152f16]">
                <th className="py-4 px-6">Business</th>
                <th className="py-4 px-6">POS Module</th>
                <th className="py-4 px-6">Bill This Month</th>
                <th className="py-4 px-6">Expires</th>
                <th className="py-4 px-6">Last Paid</th>
                <th className="py-4 px-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c8c2a3]/30 bg-white">
              {loading && (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-sm text-[#607455] font-medium">
                    Loading…
                  </td>
                </tr>
              )}
              {!loading && loadError && (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-sm text-[#a93b3b] font-semibold">
                    {loadError}{' '}
                    <button onClick={loadShops} className="underline cursor-pointer">Retry</button>
                  </td>
                </tr>
              )}
              {!loading && !loadError && filteredShops.map((row) => (
                <tr key={row.id} className="bg-white hover:bg-[#efeacb]/10 transition text-sm text-[#152f16]">
                  <td className="py-4 px-6 font-bold">{row.business}</td>
                  <td className="py-4 px-6 font-semibold text-[#55694a]">{row.posModule}</td>
                  <td className="py-4 px-6">
                    {row.billStatus === 'paid' && (
                      <span className="inline-block px-3 py-1 text-xs font-bold text-[#137333] bg-[#e6f4ea] border border-[#85c796] rounded-lg">
                        {row.billDisplayText}
                      </span>
                    )}
                    {row.billStatus === 'overdue' && (
                      <span className="inline-block px-3 py-1 text-xs font-bold text-[#a93b3b] bg-[#fbebeb] border border-[#d89f9f] rounded-lg">
                        {row.billDisplayText}
                      </span>
                    )}
                    {(row.billStatus === 'upgrade_request' || row.billStatus === 'staff_request') && (
                      <span className="font-bold text-[#152f16]">{row.billDisplayText}</span>
                    )}
                  </td>
                  <td className="py-4 px-6 font-medium text-[#152f16]">{fmtDate(row.billDueDate)}</td>
                  <td className="py-4 px-6 font-semibold">{fmtDate(row.lastPaidAt)}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedShop(row)}
                        className="px-3.5 py-1.5 bg-white text-[#152f16] border border-[#c8c2a3] text-xs font-bold rounded-lg hover:bg-neutral-50 transition cursor-pointer"
                      >
                        View details
                      </button>
                      {row.status === 'active' && (
                        <button
                          type="button"
                          onClick={() => { setSuspendingShop(row); }}
                          className="px-3.5 py-1.5 bg-[#f6edd2] text-[#a68334] border border-[#dfc480] text-xs font-bold rounded-lg hover:bg-[#faebb3] transition cursor-pointer"
                        >
                          Suspend
                        </button>
                      )}
                      {row.status === 'blocked' && (
                        <button
                          type="button"
                          onClick={() => handleActivate(row.id)}
                          className="px-3.5 py-1.5 bg-[#fbebeb] text-[#a93b3b] border border-[#d89f9f] text-xs font-bold rounded-lg hover:bg-[#fae3e3] transition cursor-pointer"
                        >
                          Unblock
                        </button>
                      )}
                      {row.status === 'suspended' && (
                        <button
                          type="button"
                          onClick={() => handleActivate(row.id)}
                          className="px-3.5 py-1.5 bg-[#e6f4ea] text-[#137333] border border-[#85c796] text-xs font-bold rounded-lg hover:bg-[#d2edd9] transition cursor-pointer"
                        >
                          Activate
                        </button>
                      )}

                      {/* ··· dropdown */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setActiveDropdownId(activeDropdownId === row.id ? null : row.id)}
                          className="p-1.5 bg-white text-[#152f16] border border-[#c8c2a3] rounded-lg hover:bg-neutral-50 transition cursor-pointer flex items-center justify-center"
                        >
                          <MoreHorizontal size={16} />
                        </button>
                        {activeDropdownId === row.id && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setActiveDropdownId(null)} />
                            <div className="absolute right-0 top-full mt-1 w-48 bg-[#fdfdf7] border border-[#c8c2a3] rounded-2xl shadow-xl z-50 p-2 flex flex-col gap-0.5">
                              {[
                                { label: 'Edit shop info',  onClick: () => { setEditingShop(row);   setActiveDropdownId(null); } },
                                { label: 'Extend due date', onClick: () => { setExtendingShop(row); setActiveDropdownId(null); } },
                                { label: 'Activity log',    onClick: () => { setActivityShop(row);  setActiveDropdownId(null); } },
                                { label: 'Message owner',   onClick: () => { setMessagingShop(row); setActiveDropdownId(null); } },
                              ].map(({ label, onClick }) => (
                                <button key={label} type="button" onClick={onClick}
                                  className="w-full text-left px-3 py-1.5 text-xs font-bold text-[#0d3b1b] hover:bg-[#efeacb]/40 rounded-xl transition cursor-pointer">
                                  {label}
                                </button>
                              ))}
                              <button type="button"
                                onClick={() => {
                                  if (row.status === 'suspended') { handleActivate(row.id); }
                                  else { setSuspendingShop(row); }
                                  setActiveDropdownId(null);
                                }}
                                className="w-full text-left px-3 py-1.5 text-xs font-bold text-[#8a6d1c] hover:bg-[#efeacb]/40 rounded-xl transition cursor-pointer">
                                {row.status === 'suspended' ? 'Unsuspend shop' : 'Suspend shop'}
                              </button>
                              <button type="button"
                                onClick={() => {
                                  if (row.status === 'blocked') { handleActivate(row.id); }
                                  else { setBlockingShop(row); }
                                  setActiveDropdownId(null);
                                }}
                                className="w-full text-left px-3 py-1.5 text-xs font-bold text-[#8a6d1c] hover:bg-[#efeacb]/40 rounded-xl transition cursor-pointer">
                                {row.status === 'blocked' ? 'Unblock shop' : 'Block shop'}
                              </button>
                              <div className="h-[1px] bg-[#c8c2a3]/40 my-1" />
                              <button type="button"
                                onClick={() => { setDeletingShop(row); setActiveDropdownId(null); }}
                                className="w-full text-left px-3 py-1.5 text-xs font-bold text-[#8c1d1d] hover:bg-red-50 rounded-xl transition cursor-pointer">
                                Delete account
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && !loadError && filteredShops.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-sm text-[#607455] font-medium">
                    No shops found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-[#c8c2a3]/30 bg-white">
          {loading && <div className="py-8 text-center text-sm text-[#607455]">Loading…</div>}
          {!loading && loadError && (
            <div className="py-8 text-center text-sm text-[#a93b3b]">
              {loadError}{' '}
              <button onClick={loadShops} className="underline cursor-pointer">Retry</button>
            </div>
          )}
          {!loading && !loadError && filteredShops.map((row) => (
            <div key={row.id} className="p-5 flex flex-col gap-3 bg-white">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-base text-[#152f16]">{row.business}</p>
                  <p className="text-xs text-[#607455] font-semibold">{row.posModule}</p>
                </div>
                <span className={`inline-block font-bold px-3 py-1 rounded-lg border text-xs uppercase tracking-wider ${
                  row.status === 'active'    ? 'bg-[#e6f4ea] text-[#137333] border-[#85c796]' :
                  row.status === 'suspended' ? 'bg-[#f6edd2] text-[#a68334] border-[#dfc480]' :
                                               'bg-[#fbebeb] text-[#a93b3b] border-[#d89f9f]'
                }`}>{row.status}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs bg-[#eae3c1]/40 p-3 rounded-xl border border-[#c8c2a3]/20">
                <div>
                  <p className="text-[10px] uppercase font-bold text-[#607455]">Bill This Month</p>
                  <p className="font-bold mt-0.5 text-[#152f16]">{row.billDisplayText}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-[#607455]">Expires</p>
                  <p className="font-semibold mt-0.5 text-[#152f16]">{fmtDate(row.billDueDate)}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-1">
                <button type="button" onClick={() => setSelectedShop(row)}
                  className="flex-1 py-2 bg-white text-[#152f16] border border-[#c8c2a3] text-xs font-bold rounded-lg text-center">
                  View details
                </button>
                {row.status === 'active'    && <button type="button" onClick={() => setSuspendingShop(row)} className="flex-1 py-2 bg-[#f6edd2] text-[#a68334] border border-[#dfc480] text-xs font-bold rounded-lg">Suspend</button>}
                {row.status === 'blocked'   && <button type="button" onClick={() => handleActivate(row.id)} className="flex-1 py-2 bg-[#fbebeb] text-[#a93b3b] border border-[#d89f9f] text-xs font-bold rounded-lg">Unblock</button>}
                {row.status === 'suspended' && <button type="button" onClick={() => handleActivate(row.id)} className="flex-1 py-2 bg-[#e6f4ea] text-[#137333] border border-[#85c796] text-xs font-bold rounded-lg">Activate</button>}
              </div>
            </div>
          ))}
          {!loading && !loadError && filteredShops.length === 0 && (
            <div className="py-8 text-center text-sm text-[#607455]">No shops found.</div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ShopDetailsModal selectedShop={selectedShop} onClose={() => setSelectedShop(null)} />

      <EditShopInfoModal
        editingShop={editingShop}
        onClose={() => setEditingShop(null)}
        onSave={handleSaveChanges}
      />

      <ExtendDueDateModal
        extendingShop={extendingShop}
        onClose={() => setExtendingShop(null)}
        onSave={handleSaveExtend}
      />

      <ActivityLogModal
        shop={activityShop}
        onClose={() => setActivityShop(null)}
      />

      <MessageOwnerModal
        shop={messagingShop}
        onClose={() => setMessagingShop(null)}
        onSend={handleSendMessage}
      />

      <BlockShopModal
        shop={blockingShop}
        onClose={() => setBlockingShop(null)}
        onBlock={handleBlockShop}
      />

      <SuspendShopModal
        shop={suspendingShop}
        onClose={() => setSuspendingShop(null)}
        onSuspend={handleSuspendShop}
      />

      <DeleteShopModal
        shop={deletingShop}
        onClose={() => setDeletingShop(null)}
        onDelete={handleDeleteShop}
      />
    </div>
  );
}
