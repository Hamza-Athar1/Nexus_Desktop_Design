import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ChevronDown, X } from 'lucide-react';
import { apiFetchJson } from '../../lib/api';

/** Turns an ISO timestamp into "Today" / "1 day ago" / "N days ago". */
function formatSubmitted(isoDate) {
  if (!isoDate) return '—';
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  return `${diffDays} days ago`;
}

function daysSince(isoDate) {
  if (!isoDate) return Infinity;
  const diffMs = Date.now() - new Date(isoDate).getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

const STATUS_BADGE_CLASSES = {
  Pending: 'bg-[#f6edd2] text-[#a68334] border-[#dfc480]',
  Approved: 'bg-[#e6f4ea] text-[#137333] border-[#85c796]',
  Rejected: 'bg-[#fbebeb] text-[#a93b3b] border-[#d89f9f]',
  Resubmit: 'bg-[#fdf3d6] text-[#b06000] border-[#dcb35c]',
};

export default function SuperAdminRequestsPage() {
  const { setHeaderDetails } = useOutletContext() || {};
  const [requests, setRequests] = useState([]);
  const [posModules, setPosModules] = useState([]); // [{ code, name, label }]
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (setHeaderDetails) {
      setHeaderDetails({
        title: 'Requests',
        subtitle: `${pendingCount} pending across all POS modules`
      });
    }
  }, [pendingCount, setHeaderDetails]);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [pendingActionId, setPendingActionId] = useState(null);

  // ── Filters ──────────────────────────────────────────────────────────
  const [posFilter, setPosFilter] = useState('All modules');
  const [statusFilter, setStatusFilter] = useState('Pending');
  const [timeFilter, setTimeFilter] = useState('Last 7 days');
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isSubmittedOpen, setIsSubmittedOpen] = useState(false);
  const [customDate, setCustomDate] = useState('');

  // ── Modals ───────────────────────────────────────────────────────────
  const [isResubmitModalOpen, setIsResubmitModalOpen] = useState(false);
  const [activeRequestToResubmit, setActiveRequestToResubmit] = useState(null);
  const [resubmitComment, setResubmitComment] = useState('');

  const [detailsRequest, setDetailsRequest] = useState(null);

  const [updateRequest, setUpdateRequest] = useState(null);
  const [updateStatus, setUpdateStatus] = useState('Approved');
  const [updateNote, setUpdateNote] = useState('');

  // ── Data loading ─────────────────────────────────────────────────────
  const loadMeta = useCallback(async () => {
    const { ok, data } = await apiFetchJson('/admin/requests/meta');
    if (ok) {
      setPosModules(data.modules || []);
      setPendingCount(data.pendingCount ?? 0);
    }
  }, []);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    const { ok, data } = await apiFetchJson('/admin/requests');
    if (ok) {
      setRequests(data.requests || []);
    } else {
      setLoadError(data?.message || 'Failed to load requests.');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadRequests();
    loadMeta();
  }, [loadRequests, loadMeta]);

  // ── Filtering (client-side, over the live dataset) ──────────────────
  const filteredRequests = requests.filter((r) => {
    const matchPos = posFilter === 'All modules' || r.posModule === posFilter;
    const matchStatus = statusFilter === 'All status' || r.status === statusFilter;
    const daysAgo = daysSince(r.createdAt);
    let matchTime = false;
    if (timeFilter === 'All time') {
      matchTime = true;
    } else if (timeFilter === 'Last 7 days') {
      matchTime = daysAgo <= 7;
    } else if (timeFilter === 'Last 30 days') {
      matchTime = daysAgo <= 30;
    } else if (timeFilter === 'This quarter') {
      matchTime = daysAgo <= 90;
    } else if (timeFilter === 'Custom') {
      if (!customDate) {
        matchTime = true;
      } else {
        const today = new Date();
        const selected = new Date(`${customDate}T00:00:00`);
        const diffDays = Math.floor((today.getTime() - selected.getTime()) / (1000 * 60 * 60 * 24));
        matchTime = daysAgo === diffDays;
      }
    }
    return matchPos && matchStatus && matchTime;
  });

  // ── Mutations ────────────────────────────────────────────────────────
  async function updateRequestStatus(id, status, note) {
    setPendingActionId(id);
    setActionError('');
    const { ok, data } = await apiFetchJson(`/admin/requests/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note: note || undefined }),
    });
    setPendingActionId(null);
    if (!ok) {
      setActionError(data?.message || 'Could not update that request. Please try again.');
      return false;
    }
    setRequests((prev) => prev.map((r) => (r.id === id ? data.request : r)));
    loadMeta(); // pending count is platform-wide, cheapest to just re-pull it
    return true;
  }

  const handleAction = (id, newStatus) => {
    updateRequestStatus(id, newStatus);
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Requests Header */}
      <div className="mb-8 lg:hidden">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#152f16] font-serif mb-2">
          Requests
        </h1>
        <p className="text-base sm:text-lg text-[#55694a] font-medium">
          {pendingCount} pending across all POS modules
        </p>
      </div>

      {/* Request Summary section header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-5">
          <h2 className="text-xs uppercase tracking-[0.2em] font-black text-[#607455] shrink-0">
            REQUEST SUMMARY
          </h2>
          <div className="h-[1px] bg-[#c8c2a3] flex-1" />
        </div>

        {actionError && (
          <div className="mb-5 px-4 py-3 rounded-xl bg-[#fbebeb] border border-[#d89f9f] text-[#a93b3b] text-sm font-semibold flex items-center justify-between gap-3">
            <span>{actionError}</span>
            <button type="button" onClick={() => setActionError('')} className="cursor-pointer">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {/* POS Module filter */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-[#152f16] font-serif">POS module</label>
            <div className="relative">
              <select
                value={posFilter}
                onChange={(e) => setPosFilter(e.target.value)}
                className="w-full appearance-none border border-[#bfbc9b] rounded-xl px-4 py-3 bg-white text-[#152f16] font-semibold text-sm cursor-pointer outline-none pr-10"
              >
                <option value="All modules">All modules</option>
                {posModules.map((m) => (
                  <option key={m.code} value={m.label}>
                    {m.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#607455] pointer-events-none" />
            </div>
          </div>

          {/* Status filter */}
          <div className="flex flex-col gap-2 relative">
            <label className="text-sm font-bold text-[#152f16] font-serif">Status</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsStatusOpen(!isStatusOpen)}
                className="w-full border border-[#bfbc9b] rounded-xl px-4 py-3 bg-white text-[#152f16] font-semibold text-sm cursor-pointer outline-none flex items-center justify-between text-left"
              >
                <span>
                  {statusFilter === 'Pending' ? 'Pending review' :
                    statusFilter === 'Approved' ? 'Approved review' :
                      statusFilter === 'Rejected' ? 'Rejected review' :
                        statusFilter === 'Resubmit' ? 'Resubmit review' : 'All statuses'}
                </span>
                <ChevronDown size={18} className="text-[#607455]" />
              </button>

              {isStatusOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsStatusOpen(false)}
                  />
                  <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-[#bfbc9b]/60 rounded-xl shadow-lg p-1.5 flex flex-col gap-0.5">
                    {[
                      { value: 'Pending', label: 'Pending review' },
                      { value: 'Approved', label: 'Approved review' },
                      { value: 'Rejected', label: 'Rejected review' },
                      { value: 'Resubmit', label: 'Resubmit review' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setStatusFilter(opt.value);
                          setIsStatusOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-semibold transition cursor-pointer ${statusFilter === opt.value
                          ? 'bg-[#f4ebd0]/50 text-[#0c3818]'
                          : 'text-[#0c3818] hover:bg-[#eae3c1]/20'
                          }`}
                      >
                        <span className="flex items-center justify-center shrink-0">
                          {statusFilter === opt.value ? (
                            <span className="w-5 h-5 rounded-full border-2 border-[#0c3818] flex items-center justify-center">
                              <span className="w-2.5 h-2.5 rounded-full bg-[#0c3818]" />
                            </span>
                          ) : (
                            <span className="w-5 h-5 rounded-full border-2 border-[#0c3818]/40" />
                          )}
                        </span>
                        <span>{opt.label}</span>
                      </button>
                    ))}

                    <div className="h-[1px] bg-[#c8c2a3]/30 my-1" />

                    <button
                      type="button"
                      onClick={() => {
                        setStatusFilter('All status');
                        setIsStatusOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-semibold transition cursor-pointer ${statusFilter === 'All status'
                        ? 'bg-[#f4ebd0]/50 text-[#0c3818]'
                        : 'text-[#0c3818] hover:bg-[#eae3c1]/20'
                        }`}
                    >
                      <span className="flex items-center justify-center shrink-0">
                        {statusFilter === 'All status' ? (
                          <span className="w-5 h-5 rounded-full border-2 border-[#0c3818] flex items-center justify-center">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#0c3818]" />
                          </span>
                        ) : (
                          <span className="w-5 h-5 rounded-full border-2 border-[#0c3818]/40" />
                        )}
                      </span>
                      <span>All statuses</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Submitted filter */}
          <div className="flex flex-col gap-2 relative">
            <label className="text-sm font-bold text-[#152f16] font-serif">Submitted</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsSubmittedOpen(!isSubmittedOpen)}
                className="w-full border border-[#bfbc9b] rounded-xl px-4 py-3 bg-white text-[#152f16] font-semibold text-sm cursor-pointer outline-none flex items-center justify-between text-left"
              >
                <span>{timeFilter}</span>
                <ChevronDown size={18} className="text-[#607455]" />
              </button>

              {isSubmittedOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsSubmittedOpen(false)}
                  />
                  <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-[#bfbc9b]/60 rounded-xl shadow-lg p-1.5 flex flex-col gap-0.5">
                    {['Last 7 days', 'Last 30 days', 'This quarter', 'All time'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          setTimeFilter(opt);
                          setIsSubmittedOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-semibold transition cursor-pointer ${timeFilter === opt
                          ? 'bg-[#f4ebd0]/50 text-[#0c3818]'
                          : 'text-[#0c3818] hover:bg-[#eae3c1]/20'
                          }`}
                      >
                        <span className="flex items-center justify-center shrink-0">
                          {timeFilter === opt ? (
                            <span className="w-5 h-5 rounded-full border-2 border-[#0c3818] flex items-center justify-center">
                              <span className="w-2.5 h-2.5 rounded-full bg-[#0c3818]" />
                            </span>
                          ) : (
                            <span className="w-5 h-5 rounded-full border-2 border-[#0c3818]/40" />
                          )}
                        </span>
                        <span>{opt}</span>
                      </button>
                    ))}

                    <div className="h-[1px] bg-[#c8c2a3]/30 my-1" />

                    <div className="flex flex-col gap-1 px-3 py-1.5 text-left">
                      <span className="text-[10px] font-bold text-[#607455]">Custom Range</span>
                      <div className="relative flex items-center mt-1">
                        <input
                          type="date"
                          value={customDate}
                          onClick={(e) => e.target.showPicker && e.target.showPicker()}
                          onChange={(e) => {
                            setCustomDate(e.target.value);
                            setTimeFilter('Custom');
                          }}
                          className="w-full bg-[#fefdf5] border border-[#bfbc9b] rounded-lg px-2.5 py-1.5 text-xs text-[#152f16] outline-none font-semibold cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Filter Tags Row */}
        <div className="flex flex-wrap items-center gap-3 mb-6 text-sm">
          <span className="font-serif font-black text-[#a68334] mr-2">
            {filteredRequests.length} {filteredRequests.length === 1 ? 'result' : 'results'}
          </span>

          {posFilter !== 'All modules' && (
            <span className="inline-flex items-center gap-1.5 bg-[#fcfbf4] border border-[#bfbca0] rounded-lg px-2.5 py-1 text-xs font-semibold text-[#152f16] shadow-sm">
              <span>{posFilter}</span>
              <button
                type="button"
                onClick={() => setPosFilter('All modules')}
                className="hover:text-red-600 font-bold cursor-pointer text-[10px]"
              >
                ✕
              </button>
            </span>
          )}

          {statusFilter !== 'All status' && (
            <span className="inline-flex items-center gap-1.5 bg-[#fcfbf4] border border-[#bfbca0] rounded-lg px-2.5 py-1 text-xs font-semibold text-[#152f16] shadow-sm">
              <span>
                {statusFilter === 'Pending' ? 'Pending' :
                  statusFilter === 'Approved' ? 'Approved' :
                    statusFilter === 'Rejected' ? 'Rejected' : 'Resubmit'}
              </span>
              <button
                type="button"
                onClick={() => setStatusFilter('All status')}
                className="hover:text-red-600 font-bold cursor-pointer text-[10px]"
              >
                ✕
              </button>
            </span>
          )}

          {timeFilter !== 'All time' && (
            <span className="inline-flex items-center gap-1.5 bg-[#fcfbf4] border border-[#bfbca0] rounded-lg px-2.5 py-1 text-xs font-semibold text-[#152f16] shadow-sm">
              <span>
                {timeFilter === 'Last 7 days' ? '7 Days' :
                  timeFilter === 'Last 30 days' ? '30 Days' :
                    timeFilter === 'This quarter' ? 'Quarter' : 'Custom'}
              </span>
              <button
                type="button"
                onClick={() => setTimeFilter('All time')}
                className="hover:text-red-600 font-bold cursor-pointer text-[10px]"
              >
                ✕
              </button>
            </span>
          )}

          {(posFilter !== 'All modules' || statusFilter !== 'All status' || timeFilter !== 'All time') && (
            <button
              type="button"
              onClick={() => {
                setPosFilter('All modules');
                setStatusFilter('All status');
                setTimeFilter('All time');
                setCustomDate('');
              }}
              className="text-[#b91c1c] font-black text-xs hover:underline cursor-pointer ml-1"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Table section */}
        <div className="bg-[#efeacb] rounded-[24px] border border-[#bfbc9b] overflow-hidden shadow-sm">
          {/* Desktop View Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-[#eae3c1] border-b border-[#bfbc9b] text-[11px] font-black uppercase tracking-wider text-[#152f16]">
                  <th className="py-4 px-6">Business</th>
                  <th className="py-4 px-6">POS Module</th>
                  <th className="py-4 px-6">Request Type</th>
                  <th className="py-4 px-6">Submitted</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c8c2a3]/30 bg-white">
                {loading && (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-sm text-[#607455] font-medium">
                      Loading requests…
                    </td>
                  </tr>
                )}
                {!loading && loadError && (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-sm text-[#a93b3b] font-semibold">
                      {loadError}{' '}
                      <button type="button" onClick={loadRequests} className="underline cursor-pointer">
                        Retry
                      </button>
                    </td>
                  </tr>
                )}
                {!loading && !loadError && filteredRequests.map((row) => (
                  <tr key={row.id} className="bg-white hover:bg-[#efeacb]/20 transition text-sm text-[#152f16]">
                    <td className="py-4 px-6 font-bold">{row.business}</td>
                    <td className="py-4 px-6 font-semibold">{row.posModule}</td>
                    <td className="py-4 px-6 font-semibold">{row.title}</td>
                    <td className="py-4 px-6 text-[#152f16]">{formatSubmitted(row.createdAt)}</td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex justify-center">
                        <span className={`inline-block font-bold px-3 py-1 rounded-lg border text-xs text-center w-24 ${STATUS_BADGE_CLASSES[row.status]}`}>
                          {row.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex justify-center gap-2">
                        {row.status === 'Pending' ? (
                          <>
                            <button
                              disabled={pendingActionId === row.id}
                              onClick={() => handleAction(row.id, 'Rejected')}
                              className="px-3 py-1.5 bg-[#fbebeb] text-[#a93b3b] border border-[#d89f9f] text-xs font-semibold rounded-lg hover:bg-[#fae3e3] transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Reject
                            </button>
                            <button
                              disabled={pendingActionId === row.id}
                              onClick={() => handleAction(row.id, 'Approved')}
                              className="px-3 py-1.5 bg-[#e6f4ea] text-[#137333] border border-[#85c796] text-xs font-semibold rounded-lg hover:bg-[#d2edd9] transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Approve
                            </button>
                            <button
                              disabled={pendingActionId === row.id}
                              onClick={() => {
                                setActiveRequestToResubmit(row);
                                setIsResubmitModalOpen(true);
                              }}
                              className="px-3 py-1.5 bg-[#fdf3d6] text-[#b06000] border border-[#dcb35c] text-xs font-semibold rounded-lg hover:bg-[#faeabf] transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Resubmit
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => setDetailsRequest(row)}
                              className="px-3.5 py-1.5 bg-white text-[#137333] border border-[#c8c2a3] text-xs font-bold rounded-lg hover:bg-neutral-50 transition cursor-pointer"
                            >
                              View details
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setUpdateRequest(row);
                                setUpdateStatus(row.status);
                                setUpdateNote(row.rejectionReason || '');
                              }}
                              className="px-3.5 py-1.5 bg-white text-[#137333] border border-[#c8c2a3] text-xs font-bold rounded-lg hover:bg-neutral-50 transition cursor-pointer"
                            >
                              Update
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && !loadError && filteredRequests.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-sm text-[#607455] font-medium">
                      No requests found matching the filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile View Stacked Cards */}
          <div className="md:hidden divide-y divide-[#c8c2a3]/30 bg-white">
            {loading && (
              <div className="py-8 text-center text-sm text-[#607455] font-medium">Loading requests…</div>
            )}
            {!loading && loadError && (
              <div className="py-8 text-center text-sm text-[#a93b3b] font-semibold">
                {loadError}{' '}
                <button type="button" onClick={loadRequests} className="underline cursor-pointer">
                  Retry
                </button>
              </div>
            )}
            {!loading && !loadError && filteredRequests.map((row) => (
              <div key={row.id} className="p-5 flex flex-col gap-3 bg-white">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-base text-[#152f16]">{row.business}</p>
                    <p className="text-xs text-[#607455] font-semibold">{row.posModule}</p>
                  </div>
                  <span className={`inline-block font-bold px-3 py-1 rounded-lg border text-xs text-center ${STATUS_BADGE_CLASSES[row.status]}`}>
                    {row.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-[#eae3c1]/40 p-3 rounded-xl border border-[#c8c2a3]/20">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-[#607455]">Request Type</p>
                    <p className="font-semibold mt-0.5 text-[#152f16]">{row.title}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-[#607455]">Submitted</p>
                    <p className="font-semibold mt-0.5 text-[#152f16]">{formatSubmitted(row.createdAt)}</p>
                  </div>
                </div>

                {row.status === 'Pending' ? (
                  <div className="flex gap-2 mt-1">
                    <button
                      disabled={pendingActionId === row.id}
                      onClick={() => handleAction(row.id, 'Rejected')}
                      className="flex-1 py-2 bg-[#fbebeb] text-[#a93b3b] border border-[#d89f9f] text-xs font-semibold rounded-lg text-center cursor-pointer disabled:opacity-50"
                    >
                      Reject
                    </button>
                    <button
                      disabled={pendingActionId === row.id}
                      onClick={() => handleAction(row.id, 'Approved')}
                      className="flex-1 py-2 bg-[#e6f4ea] text-[#137333] border border-[#85c796] text-xs font-semibold rounded-lg text-center cursor-pointer disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      disabled={pendingActionId === row.id}
                      onClick={() => {
                        setActiveRequestToResubmit(row);
                        setIsResubmitModalOpen(true);
                      }}
                      className="flex-1 py-2 bg-[#fdf3d6] text-[#b06000] border border-[#dcb35c] text-xs font-semibold rounded-lg text-center cursor-pointer disabled:opacity-50"
                    >
                      Resubmit
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setDetailsRequest(row)}
                      className="flex-1 py-2 bg-white text-[#137333] border border-[#c8c2a3] text-xs font-bold rounded-lg text-center cursor-pointer"
                    >
                      View details
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUpdateRequest(row);
                        setUpdateStatus(row.status);
                        setUpdateNote(row.rejectionReason || '');
                      }}
                      className="flex-1 py-2 bg-white text-[#137333] border border-[#c8c2a3] text-xs font-bold rounded-lg text-center cursor-pointer"
                    >
                      Update
                    </button>
                  </div>
                )}
              </div>
            ))}
            {!loading && !loadError && filteredRequests.length === 0 && (
              <div className="py-8 text-center text-sm text-[#607455] font-medium">
                No requests found matching the filter criteria.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resubmit Modal */}
      {isResubmitModalOpen && activeRequestToResubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => {
              setIsResubmitModalOpen(false);
              setResubmitComment('');
            }}
          />
          <div className="relative bg-[#efeacb] rounded-[24px] border border-[#bfbc9b] p-6 w-full max-w-sm shadow-xl flex flex-col gap-4 text-[#152f16] font-sans">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#152f16] font-serif leading-snug">
                Resubmit Request
              </h3>
              <p className="text-sm font-semibold text-[#0c3818] mt-0.5">
                {activeRequestToResubmit.business}
              </p>
            </div>

            <textarea
              placeholder="Write your suggestion or improvement"
              value={resubmitComment}
              onChange={(e) => setResubmitComment(e.target.value)}
              className="w-full min-h-[120px] bg-white border border-[#bfbc9b]/80 rounded-xl p-4 text-xs text-[#152f16] outline-none placeholder-[#607455]/60 focus:ring-1 focus:ring-[#0c3818]/30 resize-none font-semibold"
            />

            <div className="flex justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={() => {
                  setIsResubmitModalOpen(false);
                  setResubmitComment('');
                }}
                className="px-5 py-2 bg-white border border-[#0c3818]/60 text-[#0c3818] text-sm font-bold rounded-xl hover:bg-neutral-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!resubmitComment.trim() || pendingActionId === activeRequestToResubmit.id}
                onClick={async () => {
                  const success = await updateRequestStatus(
                    activeRequestToResubmit.id,
                    'Resubmit',
                    resubmitComment.trim()
                  );
                  if (success) {
                    setIsResubmitModalOpen(false);
                    setResubmitComment('');
                    setActiveRequestToResubmit(null);
                  }
                }}
                className="px-6 py-2 bg-[#0c3818] text-white text-sm font-bold rounded-xl hover:bg-[#082813] transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal (read-only) */}
      {detailsRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setDetailsRequest(null)} />
          <div className="relative bg-[#efeacb] rounded-[24px] border border-[#bfbc9b] p-6 w-full max-w-md shadow-xl flex flex-col gap-4 text-[#152f16] font-sans">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#152f16] font-serif leading-snug">
                  Request details
                </h3>
                <p className="text-sm font-semibold text-[#0c3818] mt-0.5">{detailsRequest.business}</p>
              </div>
              <button
                type="button"
                onClick={() => setDetailsRequest(null)}
                className="text-[#607455] hover:text-[#152f16] cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-white/60 p-3 rounded-xl border border-[#c8c2a3]/40">
              <div>
                <p className="text-[10px] uppercase font-bold text-[#607455]">POS module</p>
                <p className="font-semibold mt-0.5">{detailsRequest.posModule}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-[#607455]">Status</p>
                <p className="font-semibold mt-0.5">{detailsRequest.status}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-[#607455]">Request type</p>
                <p className="font-semibold mt-0.5">{detailsRequest.title}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-[#607455]">Submitted</p>
                <p className="font-semibold mt-0.5">{formatSubmitted(detailsRequest.createdAt)}</p>
              </div>
            </div>

            {detailsRequest.details && (
              <div>
                <p className="text-[10px] uppercase font-bold text-[#607455] mb-1">Details</p>
                <p className="text-sm font-semibold bg-white rounded-xl p-3 border border-[#bfbc9b]/60">
                  {detailsRequest.details}
                </p>
              </div>
            )}

            {detailsRequest.rejectionReason && (
              <div>
                <p className="text-[10px] uppercase font-bold text-[#607455] mb-1">Reviewer note</p>
                <p className="text-sm font-semibold bg-white rounded-xl p-3 border border-[#bfbc9b]/60">
                  {detailsRequest.rejectionReason}
                </p>
              </div>
            )}

            {detailsRequest.reviewedAt && (
              <p className="text-xs text-[#607455] font-medium">
                Reviewed {formatSubmitted(detailsRequest.reviewedAt)}
                {detailsRequest.reviewedBy ? ` by ${detailsRequest.reviewedBy}` : ''}
              </p>
            )}

            <div className="flex justify-end mt-2">
              <button
                type="button"
                onClick={() => setDetailsRequest(null)}
                className="px-5 py-2 bg-[#0c3818] text-white text-sm font-bold rounded-xl hover:bg-[#082813] transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Modal (re-review: change status/note on an already-decided request) */}
      {updateRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setUpdateRequest(null)}
          />
          <div className="relative bg-[#efeacb] rounded-[24px] border border-[#bfbc9b] p-6 w-full max-w-sm shadow-xl flex flex-col gap-4 text-[#152f16] font-sans">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#152f16] font-serif leading-snug">
                Update Request
              </h3>
              <p className="text-sm font-semibold text-[#0c3818] mt-0.5">{updateRequest.business}</p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-[#152f16] font-serif">Status</label>
              <select
                value={updateStatus}
                onChange={(e) => setUpdateStatus(e.target.value)}
                className="w-full border border-[#bfbc9b] rounded-xl px-4 py-3 bg-white text-[#152f16] font-semibold text-sm cursor-pointer outline-none"
              >
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Resubmit">Resubmit</option>
              </select>
            </div>

            <textarea
              placeholder="Reviewer note (required for Resubmit)"
              value={updateNote}
              onChange={(e) => setUpdateNote(e.target.value)}
              className="w-full min-h-[100px] bg-white border border-[#bfbc9b]/80 rounded-xl p-4 text-xs text-[#152f16] outline-none placeholder-[#607455]/60 focus:ring-1 focus:ring-[#0c3818]/30 resize-none font-semibold"
            />

            <div className="flex justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={() => setUpdateRequest(null)}
                className="px-5 py-2 bg-white border border-[#0c3818]/60 text-[#0c3818] text-sm font-bold rounded-xl hover:bg-neutral-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={
                  (updateStatus === 'Resubmit' && !updateNote.trim()) ||
                  pendingActionId === updateRequest.id
                }
                onClick={async () => {
                  const success = await updateRequestStatus(updateRequest.id, updateStatus, updateNote.trim());
                  if (success) setUpdateRequest(null);
                }}
                className="px-6 py-2 bg-[#0c3818] text-white text-sm font-bold rounded-xl hover:bg-[#082813] transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
