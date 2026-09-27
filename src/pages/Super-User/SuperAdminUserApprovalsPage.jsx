import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { CheckCircle, XCircle, Eye, RefreshCw, X, FileText } from 'lucide-react';
import { apiFetchJson } from '../../lib/api';

function formatDate(isoDate) {
  if (!isoDate) return '—';
  const d = new Date(isoDate);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function parseDetails(rawDetails) {
  try {
    return typeof rawDetails === 'string' ? JSON.parse(rawDetails) : rawDetails || {};
  } catch {
    return {};
  }
}

export default function SuperAdminUserApprovalsPage() {
  const { setHeaderDetails } = useOutletContext() || {};
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [pendingActionId, setPendingActionId] = useState(null);

  // Filter state
  const [statusFilter, setStatusFilter] = useState('Pending'); // Pending, Approved, Rejected, All
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    if (setHeaderDetails) {
      setHeaderDetails({
        title: 'User Approvals',
        subtitle: null,
      });
    }
  }, [setHeaderDetails]);

  const loadApprovals = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    const { ok, data } = await apiFetchJson('/admin/requests');
    if (ok && Array.isArray(data?.requests)) {
      // Filter shop_requests specifically for registration type
      const regRequests = data.requests.filter((r) => r.requestType === 'registration');
      setRequests(regRequests);
    } else {
      setLoadError(data?.message || 'Failed to load user approvals.');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadApprovals();
  }, [loadApprovals]);

  const handleAction = async (id, status, note = null) => {
    setPendingActionId(id);
    setActionError('');
    setActionSuccess('');

    const { ok, data } = await apiFetchJson(`/admin/requests/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note }),
    });

    setPendingActionId(null);
    if (!ok) {
      setActionError(data?.message || `Failed to ${status.toLowerCase()} registration.`);
      return;
    }

    setActionSuccess(`Registration request #${id} marked as ${status}.`);
    setRequests((prev) => prev.map((r) => (r.id === id ? data.request : r)));

    if (selectedRequest?.id === id) {
      setSelectedRequest(data.request);
    }
  };

  const pendingCount = requests.filter((r) => r.status === 'Pending').length;

  const filteredRequests = requests.filter((r) => {
    if (statusFilter === 'All') return true;
    return r.status === statusFilter;
  });

  return (
    <div className="flex-1 flex flex-col font-sans">
      {/* Action Banners */}
      {actionError && (
        <div className="mb-4 px-4 py-3 bg-red-100 border border-red-300 text-red-700 text-sm font-semibold rounded-xl">
          {actionError}
        </div>
      )}

      {actionSuccess && (
        <div className="mb-4 px-4 py-3 bg-green-100 border border-green-300 text-green-800 text-sm font-semibold rounded-xl">
          {actionSuccess}
        </div>
      )}

      {/* Filter Tabs & Counter Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-nowrap sm:flex-wrap">
          {[
            { key: 'Pending', label: `Pending (${pendingCount})` },
            { key: 'Approved', label: `Approved` },
            { key: 'Rejected', label: `Rejected` },
            { key: 'All', label: `All (${requests.length})` },
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setStatusFilter(key)}
              className={`px-4 py-2 rounded-xl font-extrabold text-xs sm:text-sm border transition duration-200 cursor-pointer shrink-0 ${
                statusFilter === key
                  ? 'bg-[#0c3818] text-white border-[#0c3818] shadow-sm'
                  : 'bg-white text-[#152f16] border-[#bfbc9b] hover:bg-[#efeacb]/30'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <button
          onClick={loadApprovals}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-white text-[#0c3818] border border-[#bfbc9b] rounded-xl text-xs font-bold hover:bg-[#efeacb]/20 transition cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Approvals Table */}
      <div className="bg-[#efeacb] rounded-[24px] border border-[#bfbc9b] shadow-sm overflow-hidden">
        <div className="hidden md:block">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#eae3c1] border-b border-[#bfbc9b] text-[11px] font-black uppercase tracking-wider text-[#152f16]">
                <th className="py-4 px-6">Business Name</th>
                <th className="py-4 px-6">Owner / Admin</th>
                <th className="py-4 px-6">Module</th>
                <th className="py-4 px-6">Cost / Month</th>
                <th className="py-4 px-6">Registration Date</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c8c2a3]/30 bg-white">
              {loading && (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-sm text-[#607455] font-medium">
                    Loading registrations…
                  </td>
                </tr>
              )}

              {!loading && loadError && (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-sm text-red-600 font-semibold">
                    {loadError} <button onClick={loadApprovals} className="underline">Retry</button>
                  </td>
                </tr>
              )}

              {!loading && !loadError && filteredRequests.map((row) => {
                const detailsObj = parseDetails(row.details);

                const totalEst = detailsObj.totalAmount ? `Rs ${Number(detailsObj.totalAmount).toLocaleString()}` : '—';
                const ownerName = detailsObj.ownerUsername || row.business;

                return (
                  <tr key={row.id} className="bg-white hover:bg-[#efeacb]/10 transition text-sm text-[#152f16]">
                    <td className="py-4 px-6 font-bold">{row.business}</td>
                    <td className="py-4 px-6">
                      <div className="font-semibold">{ownerName}</div>
                      {detailsObj.ownerEmail && <div className="text-xs text-gray-500">{detailsObj.ownerEmail}</div>}
                    </td>
                    <td className="py-4 px-6 font-semibold text-[#55694a]">{row.posModule}</td>
                    <td className="py-4 px-6 font-mono font-bold text-[#0c3818]">{totalEst}</td>
                    <td className="py-4 px-6 text-xs text-gray-600">{formatDate(row.createdAt)}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-block px-3 py-1 text-xs font-bold border rounded-lg ${
                        row.status === 'Approved'
                          ? 'bg-[#e6f4ea] text-[#137333] border-[#85c796]'
                          : row.status === 'Rejected'
                          ? 'bg-[#fbebeb] text-[#a93b3b] border-[#d89f9f]'
                          : 'bg-[#f6edd2] text-[#a68334] border-[#dfc480]'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedRequest(row)}
                          className="px-3 py-1.5 bg-white text-[#152f16] border border-[#c8c2a3] text-xs font-bold rounded-lg hover:bg-neutral-50 transition flex items-center gap-1 cursor-pointer"
                        >
                          <Eye size={14} /> Review
                        </button>

                        {row.status === 'Pending' && (
                          <>
                            <button
                              type="button"
                              disabled={pendingActionId === row.id}
                              onClick={() => handleAction(row.id, 'Approved')}
                              className="px-3 py-1.5 bg-[#e6f4ea] text-[#137333] border border-[#85c796] text-xs font-bold rounded-lg hover:bg-[#d2edd9] transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                            >
                              <CheckCircle size={14} /> Approve
                            </button>
                            <button
                              type="button"
                              disabled={pendingActionId === row.id}
                              onClick={() => handleAction(row.id, 'Rejected')}
                              className="px-3 py-1.5 bg-[#fbebeb] text-[#a93b3b] border border-[#d89f9f] text-xs font-bold rounded-lg hover:bg-[#fae3e3] transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                            >
                              <XCircle size={14} /> Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {!loading && !loadError && filteredRequests.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-sm text-[#607455] font-medium">
                    No pending registration approvals found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden divide-y divide-[#c8c2a3]/30 bg-white">
          {!loading && !loadError && filteredRequests.map((row) => {
            const detailsObj = parseDetails(row.details);

            return (
              <div key={row.id} className="p-4 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-[#152f16]">{row.business}</h4>
                    <span className="text-xs text-[#55694a]">{row.posModule}</span>
                  </div>
                  <span className={`px-2.5 py-0.5 text-xs font-bold border rounded-lg ${
                    row.status === 'Approved'
                      ? 'bg-[#e6f4ea] text-[#137333] border-[#85c796]'
                      : row.status === 'Rejected'
                      ? 'bg-[#fbebeb] text-[#a93b3b] border-[#d89f9f]'
                      : 'bg-[#f6edd2] text-[#a68334] border-[#dfc480]'
                  }`}>
                    {row.status}
                  </span>
                </div>

                <div className="flex justify-between text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-150">
                  <span>Estimated Total:</span>
                  <span className="font-bold font-mono text-[#0c3818]">
                    {detailsObj.totalAmount ? `Rs ${Number(detailsObj.totalAmount).toLocaleString()}` : '—'}
                  </span>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedRequest(row)}
                    className="flex-1 py-2 bg-white text-[#152f16] border border-[#c8c2a3] text-xs font-bold rounded-lg text-center cursor-pointer"
                  >
                    Review Details
                  </button>
                  {row.status === 'Pending' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleAction(row.id, 'Approved')}
                        className="py-2 px-3 bg-[#e6f4ea] text-[#137333] border border-[#85c796] text-xs font-bold rounded-lg cursor-pointer"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAction(row.id, 'Rejected')}
                        className="py-2 px-3 bg-[#fbebeb] text-[#a93b3b] border border-[#d89f9f] text-xs font-bold rounded-lg cursor-pointer"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review & Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-[#fdfdf7] border border-[#0c3818]/20 rounded-3xl w-full max-w-2xl p-6 sm:p-8 shadow-2xl relative flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setSelectedRequest(null)}
              className="absolute right-5 top-5 p-1.5 rounded-full text-gray-500 hover:text-black hover:bg-gray-100 transition cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0c3818]/10 text-[#0c3818] rounded-2xl">
                <FileText size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-[#0c3818]">Registration Details</h3>
                <p className="text-xs font-bold text-[#607455]">{selectedRequest.business}</p>
              </div>
            </div>

            {(() => {
              const detailsObj = parseDetails(selectedRequest.details);

              return (
                <div className="space-y-4 text-xs md:text-sm">
                  {/* Business & Owner Info */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-2">
                    <h4 className="font-extrabold text-[#0c3818] uppercase tracking-wider text-xs">Business & Account</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700">
                      <div><span className="font-bold">Business Name:</span> {selectedRequest.business}</div>
                      <div><span className="font-bold">Module:</span> {selectedRequest.posModule}</div>
                      <div><span className="font-bold">Owner Username:</span> {detailsObj.ownerUsername || '—'}</div>
                      <div><span className="font-bold">Owner Email:</span> {detailsObj.ownerEmail || '—'}</div>
                      <div><span className="font-bold">Submitted Date:</span> {formatDate(selectedRequest.createdAt)}</div>
                      <div><span className="font-bold">Current Status:</span> <span className="font-bold text-[#0c3818]">{selectedRequest.status}</span></div>
                    </div>
                  </div>

                  {/* Financial & Subscription Breakdown */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-2">
                    <h4 className="font-extrabold text-[#0c3818] uppercase tracking-wider text-xs">Plan & Theme Breakdown</h4>
                    <div className="space-y-1.5 text-gray-700">
                      <div className="flex justify-between">
                        <span>Plan ({detailsObj.planName || detailsObj.planCode || 'Retention'}):</span>
                        <span className="font-mono font-bold">Rs {detailsObj.planPrice ?? 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Theme ({detailsObj.themeName || 'Default'}):</span>
                        <span className="font-mono font-bold">{detailsObj.themePrice ? `Rs ${detailsObj.themePrice}` : 'Included Free'}</span>
                      </div>
                      {detailsObj.backupModulesPrice > 0 && (
                        <div className="flex justify-between">
                          <span>Backup Modules:</span>
                          <span className="font-mono font-bold">Rs {detailsObj.backupModulesPrice}</span>
                        </div>
                      )}
                      <div className="h-px bg-gray-200 my-1" />
                      <div className="flex justify-between text-sm font-extrabold text-[#0c3818]">
                        <span>Total Estimated Monthly:</span>
                        <span className="font-mono">Rs {detailsObj.totalAmount ?? 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* First Staff Information */}
                  {detailsObj.firstStaffUsername && (
                    <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-1.5">
                      <h4 className="font-extrabold text-[#0c3818] uppercase tracking-wider text-xs">First Staff Account</h4>
                      <div className="flex justify-between text-gray-700">
                        <span>Username: <strong className="text-[#0c3818]">{detailsObj.firstStaffUsername}</strong></span>
                        <span>Name: <strong>{detailsObj.firstStaffFullName || '—'}</strong></span>
                      </div>
                    </div>
                  )}

                  {/* Payment Proof Verification Box */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-2">
                    <h4 className="font-extrabold text-[#0c3818] uppercase tracking-wider text-xs">Payment Proof Verification</h4>
                    {detailsObj.paymentProofUrl ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#137333] bg-[#e6f4ea] px-2.5 py-1 rounded-md border border-[#85c796]">
                            Payment Proof Submitted — Awaiting Verification
                          </span>
                          <a
                            href={`http://localhost:5000${detailsObj.paymentProofUrl}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-black text-[#0c3818] underline hover:text-[#155227]"
                          >
                            Open Full Proof
                          </a>
                        </div>
                        <div className="max-h-48 overflow-hidden rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center p-2">
                          <img
                            src={`http://localhost:5000${detailsObj.paymentProofUrl}`}
                            alt="Payment Proof Screenshot"
                            className="max-h-44 object-contain rounded-lg shadow-xs"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs font-bold text-[#a68334] bg-[#f6edd2] px-3 py-2 rounded-lg border border-[#dfc480]">
                        Payment proof not submitted
                      </div>
                    )}
                  </div>

                  {/* Modal Footer Actions */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedRequest(null)}
                      className="px-5 py-2.5 rounded-xl text-xs font-black text-gray-600 hover:bg-gray-100 transition cursor-pointer"
                    >
                      Close
                    </button>

                    {selectedRequest.status === 'Pending' && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleAction(selectedRequest.id, 'Rejected')}
                          className="px-5 py-2.5 rounded-xl text-xs font-black bg-red-100 text-red-700 hover:bg-red-200 transition cursor-pointer"
                        >
                          Reject Registration
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAction(selectedRequest.id, 'Approved')}
                          className="px-5 py-2.5 rounded-xl text-xs font-black bg-[#0c3818] text-white hover:bg-[#155227] transition shadow-md cursor-pointer"
                        >
                          Approve Registration
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
