import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, X, MessageSquare, AlertCircle } from 'lucide-react';
import { apiFetchJson } from '../../lib/api';

function formatSubmitted(isoDate) {
  if (!isoDate) return '—';
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  return `${diffDays} days ago`;
}

const REQUEST_TYPE_OPTIONS = [
  { value: 'general', label: 'General Request' },
  { value: 'theme_purchase', label: 'Theme Purchase' },
  { value: 'plan_upgrade', label: 'Plan Upgrade' },
  { value: 'module_change', label: 'Module Change' },
  { value: 'pos_terminal', label: 'POS / Hardware Request' },
  { value: 'other', label: 'Other Request' },
];

const STATUS_BADGE = {
  Pending: 'bg-amber-100 text-amber-800 border-amber-300',
  Approved: 'bg-green-100 text-green-800 border-green-300',
  Rejected: 'bg-red-100 text-red-800 border-red-300',
  Resubmit: 'bg-orange-100 text-orange-800 border-orange-300',
};

export default function AdminRequestsPage() {
  const { setHeaderDetails } = useOutletContext() || {};
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // New Request Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requestType, setRequestType] = useState('general');
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [paletteId, setPaletteId] = useState('');
  const [palettes, setPalettes] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Details Modal
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    if (setHeaderDetails) {
      setHeaderDetails({
        title: 'SHOP REQUESTS',
        subtitle: 'Submit and track service requests for your business',
      });
    }
  }, [setHeaderDetails]);

  const loadMyRequests = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const { ok, data } = await apiFetchJson('/requests/mine');
      if (ok && data.requests) {
        setRequests(data.requests);
      } else {
        setLoadError(data?.message || 'Failed to load requests.');
      }
    } catch {
      setLoadError('Server connection error.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPalettes = async () => {
    try {
      const { ok, data } = await apiFetchJson('/catalog/palettes');
      if (ok && data.palettes) setPalettes(data.palettes);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadMyRequests();
    loadPalettes();
  }, [loadMyRequests]);

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setFormError('');

    if (requestType !== 'theme_purchase' && !title.trim()) {
      setFormError('Subject/Title is required.');
      return;
    }
    if (requestType === 'theme_purchase' && !paletteId) {
      setFormError('Please select a theme to request.');
      return;
    }

    setSubmitting(true);
    try {
      const { ok, data } = await apiFetchJson('/requests', {
        method: 'POST',
        body: JSON.stringify({
          requestType,
          title: title.trim(),
          details: details.trim(),
          paletteId: paletteId ? Number(paletteId) : undefined,
        }),
      });

      if (ok) {
        setIsModalOpen(false);
        setTitle('');
        setDetails('');
        setPaletteId('');
        setRequestType('general');
        await loadMyRequests();
      } else {
        setFormError(data.message || 'Failed to submit request.');
      }
    } catch {
      setFormError('Network error while submitting request.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (statusFilter === 'All') return true;
    return r.status === statusFilter;
  });

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1600px] mx-auto pb-12">
      {/* ── Page Header & Controls ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black text-[#0c3818] tracking-tight">
            Shop Requests
          </h1>
          <p className="text-sm font-bold text-[#607455] mt-0.5">
            Submit service or upgrade requests to Super Admin and view their progress.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#0c3818] hover:bg-[#114720] text-[#efeacb] text-sm font-extrabold rounded-xl transition cursor-pointer shadow-md shrink-0 self-start sm:self-auto"
        >
          <Plus size={18} />
          <span>New Request</span>
        </button>
      </div>

      {/* ── Filter Tabs ── */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#0c3818]/15 pb-3">
        {['All', 'Pending', 'Approved', 'Rejected', 'Resubmit'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
              statusFilter === st
                ? 'bg-[#0c3818] text-[#efeacb] shadow-xs'
                : 'bg-[#efeacb] text-[#0c3818] hover:bg-[#e4ddbd]'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* ── Requests List / Table ── */}
      <div className="bg-white/80 border-2 border-[#0c3818]/25 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-16 text-center text-[#0c3818] font-bold text-sm">
            Loading your requests...
          </div>
        ) : loadError ? (
          <div className="py-12 text-center text-red-600 font-bold text-sm">
            {loadError}
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center p-6 gap-3">
            <MessageSquare size={36} className="text-[#607455]/40" />
            <p className="text-base font-bold text-[#0c3818]">No requests found</p>
            <p className="text-xs font-medium text-[#607455]">
              Click "New Request" above to submit a request to Super Admin.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-[#e9e5cb] border-b border-[#0c3818]/20 text-[#0c3818] text-xs font-black uppercase tracking-wider">
                  <th className="py-3.5 px-5">Request Title</th>
                  <th className="py-3.5 px-5">Type</th>
                  <th className="py-3.5 px-5">Submitted</th>
                  <th className="py-3.5 px-5 text-center">Status</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0c3818]/15 bg-white/60">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-[#efeacb]/40 transition-colors text-[#0c3818] text-sm font-bold">
                    <td className="py-4 px-5">
                      <span className="font-extrabold text-[#0c3818] block">{req.title}</span>
                      {req.details && typeof req.details === 'string' && !req.details.startsWith('{') && (
                        <span className="text-xs text-[#607455] font-medium line-clamp-1 mt-0.5">
                          {req.details}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-5 capitalize text-xs text-[#607455] font-extrabold">
                      {req.requestType.replace('_', ' ')}
                    </td>
                    <td className="py-4 px-5 text-xs text-[#607455]">
                      {formatSubmitted(req.createdAt)}
                    </td>
                    <td className="py-4 px-5 text-center">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase border ${STATUS_BADGE[req.status] || 'bg-gray-100'}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={() => setSelectedRequest(req)}
                        className="px-3 py-1.5 bg-[#efeacb] hover:bg-[#e4ddbd] text-[#0c3818] text-xs font-black rounded-lg border border-[#0c3818]/30 transition cursor-pointer"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── New Request Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs select-none">
          <div className="fixed inset-0" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-[#fbf9f0] border-2 border-[#0c3818]/30 rounded-3xl w-full max-w-lg p-6 shadow-2xl flex flex-col gap-5 text-[#0c3818] z-10">
            <div className="flex items-center justify-between border-b border-[#0c3818]/15 pb-3">
              <h3 className="text-xl font-black font-serif text-[#0c3818]">
                Create New Request
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#607455] hover:text-[#0c3818] cursor-pointer p-1 rounded-full hover:bg-black/5"
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-100 border border-red-300 text-red-800 text-xs font-bold flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateRequest} className="flex flex-col gap-4">
              {/* Request Type */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-[#607455]">
                  Request Type
                </label>
                <select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value)}
                  className="w-full bg-white border border-[#0c3818]/30 rounded-xl px-3.5 py-2.5 text-sm font-bold text-[#0c3818] outline-none"
                >
                  {REQUEST_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Conditional palette selector for theme_purchase */}
              {requestType === 'theme_purchase' ? (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-[#607455]">
                    Select Theme Palette
                  </label>
                  <select
                    value={paletteId}
                    onChange={(e) => setPaletteId(e.target.value)}
                    className="w-full bg-white border border-[#0c3818]/30 rounded-xl px-3.5 py-2.5 text-sm font-bold text-[#0c3818] outline-none"
                  >
                    <option value="">-- Choose Theme --</option>
                    {palettes.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({Number(p.price) > 0 ? `Rs ${p.price}` : 'Free'})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                /* Subject Title for general requests */
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-[#607455]">
                    Subject / Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Request additional POS terminal"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-white border border-[#0c3818]/30 rounded-xl px-3.5 py-2.5 text-sm font-bold text-[#0c3818] outline-none"
                  />
                </div>
              )}

              {/* Message / Details */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-[#607455]">
                  Message / Details
                </label>
                <textarea
                  rows={4}
                  placeholder="Provide additional details or context for your request..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full bg-white border border-[#0c3818]/30 rounded-xl p-3.5 text-sm font-bold text-[#0c3818] outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#0c3818]/15">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-white border border-[#0c3818]/30 text-[#0c3818] text-xs font-black rounded-xl hover:bg-neutral-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-[#0c3818] hover:bg-[#114720] text-[#efeacb] text-xs font-black rounded-xl transition shadow-md cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── View Details Modal ── */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs select-none">
          <div className="fixed inset-0" onClick={() => setSelectedRequest(null)} />
          <div className="relative bg-[#efeacb] border-2 border-[#0c3818]/30 rounded-3xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-4 text-[#0c3818] z-10">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold font-serif text-[#0c3818]">
                  Request Details
                </h3>
                <p className="text-xs font-bold text-[#607455] mt-0.5">{selectedRequest.title}</p>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-[#607455] hover:text-[#0c3818] cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="bg-white/80 p-4 rounded-xl border border-[#0c3818]/20 flex flex-col gap-3 text-xs">
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500 font-semibold">Status</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${STATUS_BADGE[selectedRequest.status]}`}>
                  {selectedRequest.status}
                </span>
              </div>

              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500 font-semibold">Request Type</span>
                <span className="font-extrabold capitalize text-[#0c3818]">{selectedRequest.requestType.replace('_', ' ')}</span>
              </div>

              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500 font-semibold">Submitted</span>
                <span className="font-extrabold text-[#0c3818]">{formatSubmitted(selectedRequest.createdAt)}</span>
              </div>

              {selectedRequest.rejectionReason && (
                <div className="bg-red-50 p-3 rounded-lg border border-red-200 text-red-800">
                  <span className="font-black block text-[10px] uppercase text-red-600 mb-0.5">Note / Feedback</span>
                  <p className="font-medium text-xs">{selectedRequest.rejectionReason}</p>
                </div>
              )}

              {selectedRequest.details && (
                <div>
                  <span className="font-black block text-[10px] uppercase text-gray-500 mb-1">Details & Message</span>
                  {(() => {
                    try {
                      const parsed = typeof selectedRequest.details === 'string' && selectedRequest.details.startsWith('{')
                        ? JSON.parse(selectedRequest.details)
                        : null;
                      if (parsed) {
                        return (
                          <div className="bg-neutral-50 p-3 rounded-lg border border-gray-200 space-y-1.5 font-semibold text-xs text-gray-800">
                            {parsed.themeName && <div><span className="text-gray-500">Theme:</span> {parsed.themeName}</div>}
                            {parsed.price !== undefined && <div><span className="text-gray-500">Price:</span> Rs {parsed.price}</div>}
                            {parsed.message && <div className="text-gray-700 italic border-t border-gray-200 pt-1.5 mt-1">{parsed.message}</div>}
                          </div>
                        );
                      }
                    } catch {
                      // fallback
                    }
                    return (
                      <div className="bg-neutral-50 p-3 rounded-lg border border-gray-200 text-xs font-semibold whitespace-pre-line text-gray-800">
                        {selectedRequest.details}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-5 py-2 bg-[#0c3818] text-[#efeacb] text-xs font-black rounded-xl hover:bg-[#114720] transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
