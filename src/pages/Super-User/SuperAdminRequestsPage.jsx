import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const INITIAL_REQUESTS = [
  {
    id: 1,
    business: 'Al-Karam Pharmacy',
    posModule: 'Pharmacy POS',
    requestType: 'Billing limit increase',
    submitted: '2 days ago',
    status: 'Pending',
    daysAgo: 2,
  },
  {
    id: 2,
    business: 'Fairy parcel Co.',
    posModule: 'Gifting POS',
    requestType: 'New module activation',
    submitted: '1 days ago',
    status: 'Pending',
    daysAgo: 1,
  },
  {
    id: 3,
    business: 'Green valley Grocers',
    posModule: 'Grocery POS',
    requestType: 'Plan upgrade request',
    submitted: '4 days ago',
    status: 'Pending',
    daysAgo: 4,
  },
  {
    id: 4,
    business: 'Rafi Restaurant Co.',
    posModule: 'Restaurant POS',
    requestType: 'Staff account request',
    submitted: '5 days ago',
    status: 'Pending',
    daysAgo: 5,
  },
  {
    id: 5,
    business: 'Pixel Tech Solutions',
    posModule: 'Electronics POS',
    requestType: 'Custom tax receipt setup',
    submitted: '6 days ago',
    status: 'Resubmit',
    daysAgo: 6,
  },
  {
    id: 6,
    business: 'The Giftery',
    posModule: 'Gifting POS',
    requestType: 'Payment method change',
    submitted: '17 days ago',
    status: 'Approved',
    daysAgo: 17,
  },
  {
    id: 7,
    business: 'Piato Bakery',
    posModule: 'Bakery POS',
    requestType: 'Refund Request',
    submitted: '30 days ago',
    status: 'Approved',
    daysAgo: 30,
  },
  {
    id: 8,
    business: 'Parien House',
    posModule: 'Clothing POS',
    requestType: 'Plan Upgrade request',
    submitted: '28 days ago',
    status: 'Approved',
    daysAgo: 28,
  },
];

export default function SuperAdminRequestsPage() {
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [posFilter, setPosFilter] = useState('All modules');
  const [statusFilter, setStatusFilter] = useState('Pending');
  const [timeFilter, setTimeFilter] = useState('Last 7 days');
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isSubmittedOpen, setIsSubmittedOpen] = useState(false);
  const [customDate, setCustomDate] = useState('');
  const [isResubmitModalOpen, setIsResubmitModalOpen] = useState(false);
  const [activeRequestToResubmit, setActiveRequestToResubmit] = useState(null);
  const [resubmitComment, setResubmitComment] = useState('');

  const filteredRequests = requests.filter((r) => {
    const matchPos = posFilter === 'All modules' || r.posModule === posFilter;
    const matchStatus = statusFilter === 'All status' || r.status === statusFilter;
    let matchTime = false;
    if (timeFilter === 'All time') {
      matchTime = true;
    } else if (timeFilter === 'Last 7 days') {
      matchTime = r.daysAgo <= 7;
    } else if (timeFilter === 'Last 30 days') {
      matchTime = r.daysAgo <= 30;
    } else if (timeFilter === 'This quarter') {
      matchTime = r.daysAgo <= 90;
    } else if (timeFilter === 'Custom') {
      if (!customDate) {
        matchTime = true;
      } else {
        const today = new Date('2026-07-16T00:00:00');
        const selected = new Date(`${customDate}T00:00:00`);
        const diffTime = today.getTime() - selected.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        matchTime = r.daysAgo === diffDays;
      }
    }
    return matchPos && matchStatus && matchTime;
  });

  const pendingCount = requests.filter((r) => r.status === 'Pending').length;

  const handleAction = (id, newStatus) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Requests Header */}
      <div className="mb-8">
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
                <option value="Pharmacy POS">Pharmacy POS</option>
                <option value="Gifting POS">Gifting POS</option>
                <option value="Grocery POS">Grocery POS</option>
                <option value="Restaurant POS">Restaurant POS</option>
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
                    {/* Option: Pending review */}
                    <button
                      type="button"
                      onClick={() => {
                        setStatusFilter('Pending');
                        setIsStatusOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-semibold transition cursor-pointer ${statusFilter === 'Pending'
                          ? 'bg-[#f4ebd0]/50 text-[#0c3818]'
                          : 'text-[#0c3818] hover:bg-[#eae3c1]/20'
                        }`}
                    >
                      <span className="flex items-center justify-center shrink-0">
                        {statusFilter === 'Pending' ? (
                          <span className="w-5 h-5 rounded-full border-2 border-[#0c3818] flex items-center justify-center">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#0c3818]" />
                          </span>
                        ) : (
                          <span className="w-5 h-5 rounded-full border-2 border-[#0c3818]/40" />
                        )}
                      </span>
                      <span>Pending review</span>
                    </button>

                    {/* Option: Approved review */}
                    <button
                      type="button"
                      onClick={() => {
                        setStatusFilter('Approved');
                        setIsStatusOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-semibold transition cursor-pointer ${statusFilter === 'Approved'
                          ? 'bg-[#f4ebd0]/50 text-[#0c3818]'
                          : 'text-[#0c3818] hover:bg-[#eae3c1]/20'
                        }`}
                    >
                      <span className="flex items-center justify-center shrink-0">
                        {statusFilter === 'Approved' ? (
                          <span className="w-5 h-5 rounded-full border-2 border-[#0c3818] flex items-center justify-center">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#0c3818]" />
                          </span>
                        ) : (
                          <span className="w-5 h-5 rounded-full border-2 border-[#0c3818]/40" />
                        )}
                      </span>
                      <span>Approved review</span>
                    </button>

                    {/* Option: Rejected review */}
                    <button
                      type="button"
                      onClick={() => {
                        setStatusFilter('Rejected');
                        setIsStatusOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-semibold transition cursor-pointer ${statusFilter === 'Rejected'
                          ? 'bg-[#f4ebd0]/50 text-[#0c3818]'
                          : 'text-[#0c3818] hover:bg-[#eae3c1]/20'
                        }`}
                    >
                      <span className="flex items-center justify-center shrink-0">
                        {statusFilter === 'Rejected' ? (
                          <span className="w-5 h-5 rounded-full border-2 border-[#0c3818] flex items-center justify-center">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#0c3818]" />
                          </span>
                        ) : (
                          <span className="w-5 h-5 rounded-full border-2 border-[#0c3818]/40" />
                        )}
                      </span>
                      <span>Rejected review</span>
                    </button>

                    {/* Option: Resubmit review */}
                    <button
                      type="button"
                      onClick={() => {
                        setStatusFilter('Resubmit');
                        setIsStatusOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-semibold transition cursor-pointer ${statusFilter === 'Resubmit'
                          ? 'bg-[#f4ebd0]/50 text-[#0c3818]'
                          : 'text-[#0c3818] hover:bg-[#eae3c1]/20'
                        }`}
                    >
                      <span className="flex items-center justify-center shrink-0">
                        {statusFilter === 'Resubmit' ? (
                          <span className="w-5 h-5 rounded-full border-2 border-[#0c3818] flex items-center justify-center">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#0c3818]" />
                          </span>
                        ) : (
                          <span className="w-5 h-5 rounded-full border-2 border-[#0c3818]/40" />
                        )}
                      </span>
                      <span>Resubmit review</span>
                    </button>

                    <div className="h-[1px] bg-[#c8c2a3]/30 my-1" />

                    {/* Option: All statuses */}
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
                    {/* Option: Last 7 days */}
                    <button
                      type="button"
                      onClick={() => {
                        setTimeFilter('Last 7 days');
                        setIsSubmittedOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-semibold transition cursor-pointer ${timeFilter === 'Last 7 days'
                          ? 'bg-[#f4ebd0]/50 text-[#0c3818]'
                          : 'text-[#0c3818] hover:bg-[#eae3c1]/20'
                        }`}
                    >
                      <span className="flex items-center justify-center shrink-0">
                        {timeFilter === 'Last 7 days' ? (
                          <span className="w-5 h-5 rounded-full border-2 border-[#0c3818] flex items-center justify-center">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#0c3818]" />
                          </span>
                        ) : (
                          <span className="w-5 h-5 rounded-full border-2 border-[#0c3818]/40" />
                        )}
                      </span>
                      <span>Last 7 days</span>
                    </button>

                    {/* Option: Last 30 days */}
                    <button
                      type="button"
                      onClick={() => {
                        setTimeFilter('Last 30 days');
                        setIsSubmittedOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-semibold transition cursor-pointer ${timeFilter === 'Last 30 days'
                          ? 'bg-[#f4ebd0]/50 text-[#0c3818]'
                          : 'text-[#0c3818] hover:bg-[#eae3c1]/20'
                        }`}
                    >
                      <span className="flex items-center justify-center shrink-0">
                        {timeFilter === 'Last 30 days' ? (
                          <span className="w-5 h-5 rounded-full border-2 border-[#0c3818] flex items-center justify-center">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#0c3818]" />
                          </span>
                        ) : (
                          <span className="w-5 h-5 rounded-full border-2 border-[#0c3818]/40" />
                        )}
                      </span>
                      <span>Last 30 days</span>
                    </button>

                    {/* Option: This quarter */}
                    <button
                      type="button"
                      onClick={() => {
                        setTimeFilter('This quarter');
                        setIsSubmittedOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-semibold transition cursor-pointer ${timeFilter === 'This quarter'
                          ? 'bg-[#f4ebd0]/50 text-[#0c3818]'
                          : 'text-[#0c3818] hover:bg-[#eae3c1]/20'
                        }`}
                    >
                      <span className="flex items-center justify-center shrink-0">
                        {timeFilter === 'This quarter' ? (
                          <span className="w-5 h-5 rounded-full border-2 border-[#0c3818] flex items-center justify-center">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#0c3818]" />
                          </span>
                        ) : (
                          <span className="w-5 h-5 rounded-full border-2 border-[#0c3818]/40" />
                        )}
                      </span>
                      <span>This quarter</span>
                    </button>

                    {/* Option: All time */}
                    <button
                      type="button"
                      onClick={() => {
                        setTimeFilter('All time');
                        setIsSubmittedOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-semibold transition cursor-pointer ${timeFilter === 'All time'
                          ? 'bg-[#f4ebd0]/50 text-[#0c3818]'
                          : 'text-[#0c3818] hover:bg-[#eae3c1]/20'
                        }`}
                    >
                      <span className="flex items-center justify-center shrink-0">
                        {timeFilter === 'All time' ? (
                          <span className="w-5 h-5 rounded-full border-2 border-[#0c3818] flex items-center justify-center">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#0c3818]" />
                          </span>
                        ) : (
                          <span className="w-5 h-5 rounded-full border-2 border-[#0c3818]/40" />
                        )}
                      </span>
                      <span>All time</span>
                    </button>

                    <div className="h-[1px] bg-[#c8c2a3]/30 my-1" />

                    {/* Custom Range Input section */}
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
                {filteredRequests.map((row) => (
                  <tr key={row.id} className="bg-white hover:bg-[#efeacb]/20 transition text-sm text-[#152f16]">
                    <td className="py-4 px-6 font-bold">{row.business}</td>
                    <td className="py-4 px-6 font-semibold">{row.posModule}</td>
                    <td className="py-4 px-6 font-semibold">{row.requestType}</td>
                    <td className="py-4 px-6 text-[#152f16]">{row.submitted}</td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex justify-center">
                        <span className={`inline-block font-bold px-3 py-1 rounded-lg border text-xs text-center w-24 ${row.status === 'Pending' ? 'bg-[#f6edd2] text-[#a68334] border-[#dfc480]' :
                            row.status === 'Approved' ? 'bg-[#e6f4ea] text-[#137333] border-[#85c796]' :
                              row.status === 'Rejected' ? 'bg-[#fbebeb] text-[#a93b3b] border-[#d89f9f]' :
                                'bg-[#fdf3d6] text-[#b06000] border-[#dcb35c]'
                          }`}>
                          {row.status === 'Pending' ? 'Pending' : row.status === 'Resubmit' ? 'Resubmit' : row.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex justify-center gap-2">
                        {row.status === 'Pending' ? (
                          <>
                            <button
                              onClick={() => handleAction(row.id, 'Rejected')}
                              className="px-3 py-1.5 bg-[#fbebeb] text-[#a93b3b] border border-[#d89f9f] text-xs font-semibold rounded-lg hover:bg-[#fae3e3] transition cursor-pointer"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => handleAction(row.id, 'Approved')}
                              className="px-3 py-1.5 bg-[#e6f4ea] text-[#137333] border border-[#85c796] text-xs font-semibold rounded-lg hover:bg-[#d2edd9] transition cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                setActiveRequestToResubmit(row);
                                setIsResubmitModalOpen(true);
                              }}
                              className="px-3 py-1.5 bg-[#fdf3d6] text-[#b06000] border border-[#dcb35c] text-xs font-semibold rounded-lg hover:bg-[#faeabf] transition cursor-pointer"
                            >
                              Resubmit
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              className="px-3.5 py-1.5 bg-white text-[#137333] border border-[#c8c2a3] text-xs font-bold rounded-lg hover:bg-neutral-50 transition cursor-pointer"
                            >
                              View details
                            </button>
                            <button
                              type="button"
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
                {filteredRequests.length === 0 && (
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
            {filteredRequests.map((row) => (
              <div key={row.id} className="p-5 flex flex-col gap-3 bg-white">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-base text-[#152f16]">{row.business}</p>
                    <p className="text-xs text-[#607455] font-semibold">{row.posModule}</p>
                  </div>
                  <span className={`inline-block font-bold px-3 py-1 rounded-lg border text-xs text-center ${row.status === 'Pending' ? 'bg-[#f6edd2] text-[#a68334] border-[#dfc480]' :
                      row.status === 'Approved' ? 'bg-[#e6f4ea] text-[#137333] border-[#85c796]' :
                        row.status === 'Rejected' ? 'bg-[#fbebeb] text-[#a93b3b] border-[#d89f9f]' :
                          'bg-[#fdf3d6] text-[#b06000] border-[#dcb35c]'
                    }`}>
                    {row.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-[#eae3c1]/40 p-3 rounded-xl border border-[#c8c2a3]/20">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-[#607455]">Request Type</p>
                    <p className="font-semibold mt-0.5 text-[#152f16]">{row.requestType}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-[#607455]">Submitted</p>
                    <p className="font-semibold mt-0.5 text-[#152f16]">{row.submitted}</p>
                  </div>
                </div>

                {row.status === 'Pending' ? (
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={() => handleAction(row.id, 'Rejected')}
                      className="flex-1 py-2 bg-[#fbebeb] text-[#a93b3b] border border-[#d89f9f] text-xs font-semibold rounded-lg text-center cursor-pointer"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleAction(row.id, 'Approved')}
                      className="flex-1 py-2 bg-[#e6f4ea] text-[#137333] border border-[#85c796] text-xs font-semibold rounded-lg text-center cursor-pointer"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        setActiveRequestToResubmit(row);
                        setIsResubmitModalOpen(true);
                      }}
                      className="flex-1 py-2 bg-[#fdf3d6] text-[#b06000] border border-[#dcb35c] text-xs font-semibold rounded-lg text-center cursor-pointer"
                    >
                      Resubmit
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2 mt-1">
                    <button
                      type="button"
                      className="flex-1 py-2 bg-white text-[#137333] border border-[#c8c2a3] text-xs font-bold rounded-lg text-center cursor-pointer"
                    >
                      View details
                    </button>
                    <button
                      type="button"
                      className="flex-1 py-2 bg-white text-[#137333] border border-[#c8c2a3] text-xs font-bold rounded-lg text-center cursor-pointer"
                    >
                      Update
                    </button>
                  </div>
                )}
              </div>
            ))}
            {filteredRequests.length === 0 && (
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
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => {
              setIsResubmitModalOpen(false);
              setResubmitComment('');
            }}
          />
          {/* Modal Content */}
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
                onClick={() => {
                  handleAction(activeRequestToResubmit.id, 'Resubmit');
                  setIsResubmitModalOpen(false);
                  setResubmitComment('');
                }}
                className="px-6 py-2 bg-[#0c3818] text-white text-sm font-bold rounded-xl hover:bg-[#082813] transition cursor-pointer"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
