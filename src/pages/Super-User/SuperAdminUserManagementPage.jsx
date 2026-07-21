import React, { useState } from 'react';
import { ChevronDown, MoreHorizontal, X, ShieldAlert, CheckCircle, Ban, AlertCircle } from 'lucide-react';
import ShopDetailsModal from '../../components/Super-User/ShopDetailsModal';
import EditShopInfoModal from '../../components/Super-User/EditShopInfoModal';
import ExtendDueDateModal from '../../components/Super-User/ExtendDueDateModal';
import ActivityLogModal from '../../components/Super-User/ActivityLogModal';
import MessageOwnerModal from '../../components/Super-User/MessageOwnerModal';
import BlockShopModal from '../../components/Super-User/BlockShopModal';
import DeleteShopModal from '../../components/Super-User/DeleteShopModal';
import SuspendShopModal from '../../components/Super-User/SuspendShopModal';

const INITIAL_SHOPS = [
  {
    id: 1,
    business: 'Al-Karam Pharmacy',
    posModule: 'Pharmacy POS',
    billThisMonth: 'Paid Rs 4,500',
    billStatus: 'paid',
    amount: '4,500',
    expires: 'Aug 14, 2026',
    lastPaid: 'Jul 17, 2026',
    status: 'active',
    owner: 'Kareem Shahid',
    email: 'contact@alkarampharmacy.com',
    phone: '+92 300 1234567',
    address: 'Shop 12, Block C, Gulshan-e-Iqbal, Karachi',
    regDate: 'Fed 03, 2025',
    posPurchased: 5,
    posActive: 2
  },
  {
    id: 2,
    business: 'Piato Bakery',
    posModule: 'Bakery POS',
    billThisMonth: 'Paid Rs 3,500',
    billStatus: 'paid',
    amount: '3,500',
    expires: 'Sep 12, 2026',
    lastPaid: 'Jul 17, 2026',
    status: 'active',
    owner: 'Sajid Piato',
    email: 'info@piatobakery.pk',
    phone: '+92 321 9876543',
    address: 'Plot 45-B, Commercial Area, DHA Phase 6, Lahore',
    regDate: 'Mar 15, 2025',
    posPurchased: 4,
    posActive: 3
  },
  {
    id: 3,
    business: 'Fairy parcel Co.',
    posModule: 'Gifting POS',
    billThisMonth: 'Overdue Rs 5,200',
    billStatus: 'overdue',
    amount: '5,200',
    expires: 'Jul 25, 2026',
    lastPaid: 'Jun 20, 2026',
    status: 'suspended',
    owner: 'Fiza Fairy',
    email: 'billing@fairyparcel.com',
    phone: '+92 333 4567890',
    address: 'Office 302, 3rd Floor, Centaurus Mall, Islamabad',
    regDate: 'Jun 20, 2024',
    posPurchased: 3,
    posActive: 1
  },
  {
    id: 4,
    business: 'Green valley Grocers',
    posModule: 'Grocery POS',
    billThisMonth: 'Paid Rs 6,000',
    billStatus: 'paid',
    amount: '6,000',
    expires: 'Aug 20, 2026',
    lastPaid: 'Jul 14, 2026',
    status: 'active',
    owner: 'Tariq Mehmood',
    email: 'tariq@greenvalley.com',
    phone: '+92 312 3456789',
    address: 'Main Boulevard, Bahria Town, Rawalpindi',
    regDate: 'Oct 05, 2024',
    posPurchased: 6,
    posActive: 4
  },
  {
    id: 5,
    business: 'Rafi Restaurant Co.',
    posModule: 'Restaurant POS',
    billThisMonth: 'Overdue Rs 2,800',
    billStatus: 'overdue',
    amount: '2,800',
    expires: 'Jul 10, 2026',
    lastPaid: 'May 12, 2026',
    status: 'blocked',
    owner: 'Rafiuddin Sheikh',
    email: 'management@rafirestaurant.com',
    phone: '+92 345 6789012',
    address: 'Food Street, near Fort, Lahore',
    regDate: 'Dec 01, 2024',
    posPurchased: 8,
    posActive: 5
  }
];

export default function SuperAdminUserManagementPage() {
  const [shops, setShops] = useState(INITIAL_SHOPS);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'active', 'suspended', 'blocked'
  const [selectedShop, setSelectedShop] = useState(null); // for Details modal
  const [resubmitShop, setResubmitShop] = useState(null); // for Resubmit comment modal
  const [resubmitComment, setResubmitComment] = useState('');
  const [activeDropdownId, setActiveDropdownId] = useState(null); // for ... dropdowns

  // Modal states
  const [editingShop, setEditingShop] = useState(null);
  const [extendingShop, setExtendingShop] = useState(null);
  const [activityShop, setActivityShop] = useState(null);
  const [messagingShop, setMessagingShop] = useState(null);
  const [blockingShop, setBlockingShop] = useState(null);
  const [deletingShop, setDeletingShop] = useState(null);
  const [suspendingShop, setSuspendingShop] = useState(null);

  const handleSendMessage = (id, data) => {
    alert(`Message sent successfully to shop owner!\n\nSubject: ${data.subject}\nMessage: ${data.message}`);
    setMessagingShop(null);
  };

  const handleBlockShop = (id, reason) => {
    setShops(prev =>
      prev.map(s => (s.id === id ? { ...s, status: 'blocked' } : s))
    );
    setBlockingShop(null);
  };

  const handleSuspendShop = (id, reason) => {
    setShops(prev =>
      prev.map(s => (s.id === id ? { ...s, status: 'suspended' } : s))
    );
    setSuspendingShop(null);
  };

  const handleDeleteShop = (id) => {
    setShops(prev => prev.filter(s => s.id !== id));
    setDeletingShop(null);
  };

  const handleSaveChanges = (id, updatedFields) => {
    setShops(prev =>
      prev.map(s => (s.id === id ? { ...s, ...updatedFields } : s))
    );
    setEditingShop(null);
  };

  const handleSaveExtend = (id, newDate, reason) => {
    setShops(prev =>
      prev.map(s =>
        s.id === id
          ? {
              ...s,
              expires: newDate,
              billThisMonth: 'Extended',
              billStatus: 'resubmit'
            }
          : s
      )
    );
    setExtendingShop(null);
  };

  // Counts
  const totalCount = shops.length;
  const activeCount = shops.filter(s => s.status === 'active').length;
  const suspendedCount = shops.filter(s => s.status === 'suspended').length;
  const blockedCount = shops.filter(s => s.status === 'blocked').length;

  const filteredShops = shops.filter(s => {
    if (activeFilter === 'all') return true;
    return s.status === activeFilter;
  });

  const handleStatusChange = (id, newStatus) => {
    setShops(prev =>
      prev.map(s => (s.id === id ? { ...s, status: newStatus } : s))
    );
    setActiveDropdownId(null);
  };

  const handleAction = (id, actionType) => {
    if (actionType === 'approve') {
      // Approve request, status becomes active
      setShops(prev =>
        prev.map(s =>
          s.id === id
            ? {
                ...s,
                status: 'active',
                billThisMonth: s.billStatus === 'upgrade_request' ? 'Paid Rs 6,500' : 'Paid Rs 2,500',
                billStatus: 'paid',
                lastPaid: 'Today'
              }
            : s
        )
      );
    } else if (actionType === 'reject') {
      // Reject request
      setShops(prev =>
        prev.map(s => (s.id === id ? { ...s, status: 'blocked', lastPaid: 'Rejected' } : s))
      );
    } else if (actionType === 'resubmit') {
      const shop = shops.find(s => s.id === id);
      setResubmitShop(shop);
      setResubmitComment('');
    }
  };

  const handleSendResubmit = () => {
    if (!resubmitShop) return;
    setShops(prev =>
      prev.map(s =>
        s.id === resubmitShop.id
          ? { ...s, billThisMonth: 'Resubmit requested', billStatus: 'resubmit' }
          : s
      )
    );
    setResubmitShop(null);
  };

  return (
    <div className="flex-1 flex flex-col font-sans">
      {/* Header section */}
      <div className="mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#152f16] font-serif mb-2">
          User Management
        </h1>
        <p className="text-base sm:text-lg text-[#55694a] font-medium">
          {totalCount} registered shops
        </p>
      </div>

      {/* Filter Tabs / Pills */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        <button
          type="button"
          onClick={() => setActiveFilter('all')}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm border transition duration-200 cursor-pointer ${
            activeFilter === 'all'
              ? 'bg-[#0c3818] text-white border-[#0c3818] shadow-sm'
              : 'bg-white text-[#152f16] border-[#bfbc9b] hover:bg-[#efeacb]/30'
          }`}
        >
          All {totalCount}
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter('active')}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm border transition duration-200 cursor-pointer ${
            activeFilter === 'active'
              ? 'bg-[#0c3818] text-white border-[#0c3818] shadow-sm'
              : 'bg-white text-[#152f16] border-[#bfbc9b] hover:bg-[#efeacb]/30'
          }`}
        >
          Active {activeCount}
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter('suspended')}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm border transition duration-200 cursor-pointer ${
            activeFilter === 'suspended'
              ? 'bg-[#0c3818] text-white border-[#0c3818] shadow-sm'
              : 'bg-white text-[#152f16] border-[#bfbc9b] hover:bg-[#efeacb]/30'
          }`}
        >
          Suspended {suspendedCount}
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter('blocked')}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm border transition duration-200 cursor-pointer ${
            activeFilter === 'blocked'
              ? 'bg-[#0c3818] text-white border-[#0c3818] shadow-sm'
              : 'bg-white text-[#152f16] border-[#bfbc9b] hover:bg-[#efeacb]/30'
          }`}
        >
          Blocked {blockedCount}
        </button>
      </div>

      {/* Main Table section */}
      <div className="bg-[#efeacb] rounded-[24px] border border-[#bfbc9b] overflow-hidden shadow-sm">
        {/* Desktop View Table */}
        <div className="hidden md:block overflow-x-auto">
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
              {filteredShops.map((row) => (
                <tr key={row.id} className="bg-white hover:bg-[#efeacb]/10 transition text-sm text-[#152f16]">
                  {/* Business */}
                  <td className="py-4 px-6 font-bold">{row.business}</td>
                  {/* POS Module */}
                  <td className="py-4 px-6 font-semibold text-[#55694a]">{row.posModule}</td>
                  {/* Bill This Month */}
                  <td className="py-4 px-6">
                    {row.billStatus === 'paid' && (
                      <span className="inline-block px-3 py-1 text-xs font-bold text-[#137333] bg-[#e6f4ea] border border-[#85c796] rounded-lg">
                        {row.billThisMonth}
                      </span>
                    )}
                    {row.billStatus === 'overdue' && (
                      <span className="inline-block px-3 py-1 text-xs font-bold text-[#a93b3b] bg-[#fbebeb] border border-[#d89f9f] rounded-lg">
                        {row.billThisMonth}
                      </span>
                    )}
                    {(row.billStatus === 'upgrade_request' || row.billStatus === 'staff_request') && (
                      <span className="font-bold text-[#152f16]">{row.billThisMonth}</span>
                    )}
                    {row.billStatus === 'resubmit' && (
                      <span className="inline-block px-3 py-1 text-xs font-bold text-[#b06000] bg-[#fdf3d6] border border-[#dcb35c] rounded-lg">
                        {row.billThisMonth}
                      </span>
                    )}
                  </td>
                  {/* Expires */}
                  <td className="py-4 px-6 font-medium text-[#152f16]">{row.expires}</td>
                  {/* Last Paid */}
                  <td className="py-4 px-6">
                    {row.lastPaid === 'Pending' ? (
                      <span className="inline-block px-3.5 py-1 text-xs font-bold text-[#a68334] bg-[#f6edd2] border border-[#dfc480] rounded-lg">
                        Pending
                      </span>
                    ) : (
                      <span className="font-semibold">{row.lastPaid}</span>
                    )}
                  </td>
                  {/* Action */}
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-2">
                      {row.status === 'blocked' && (row.billStatus === 'staff_request' || row.billStatus === 'upgrade_request') ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleAction(row.id, 'reject')}
                            className="px-3 py-1.5 bg-[#fbebeb] text-[#a93b3b] border border-[#d89f9f] text-xs font-semibold rounded-lg hover:bg-[#fae3e3] transition cursor-pointer"
                          >
                            Reject
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAction(row.id, 'approve')}
                            className="px-3 py-1.5 bg-[#e6f4ea] text-[#137333] border border-[#85c796] text-xs font-semibold rounded-lg hover:bg-[#d2edd9] transition cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAction(row.id, 'resubmit')}
                            className="px-3 py-1.5 bg-[#fdf3d6] text-[#b06000] border border-[#dcb35c] text-xs font-semibold rounded-lg hover:bg-[#faeabf] transition cursor-pointer"
                          >
                            Resubmit
                          </button>
                        </>
                      ) : row.status === 'active' && (row.billStatus === 'upgrade_request') ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleAction(row.id, 'reject')}
                            className="px-3 py-1.5 bg-[#fbebeb] text-[#a93b3b] border border-[#d89f9f] text-xs font-semibold rounded-lg hover:bg-[#fae3e3] transition cursor-pointer"
                          >
                            Reject
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAction(row.id, 'approve')}
                            className="px-3 py-1.5 bg-[#e6f4ea] text-[#137333] border border-[#85c796] text-xs font-semibold rounded-lg hover:bg-[#d2edd9] transition cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAction(row.id, 'resubmit')}
                            className="px-3 py-1.5 bg-[#fdf3d6] text-[#b06000] border border-[#dcb35c] text-xs font-semibold rounded-lg hover:bg-[#faeabf] transition cursor-pointer"
                          >
                            Resubmit
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => setSelectedShop(row)}
                            className="px-3.5 py-1.5 bg-white text-[#152f16] border border-[#c8c2a3] text-xs font-bold rounded-lg hover:bg-neutral-50 transition cursor-pointer"
                          >
                            View details
                          </button>
                          {row.status === 'active' ? (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(row.id, 'suspended')}
                              className="px-3.5 py-1.5 bg-[#f6edd2] text-[#a68334] border border-[#dfc480] text-xs font-bold rounded-lg hover:bg-[#faebb3] transition cursor-pointer"
                            >
                              Suspend
                            </button>
                          ) : row.status === 'blocked' ? (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(row.id, 'active')}
                              className="px-3.5 py-1.5 bg-[#fbebeb] text-[#a93b3b] border border-[#d89f9f] text-xs font-bold rounded-lg hover:bg-[#fae3e3] transition cursor-pointer"
                            >
                              Unblock
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(row.id, 'active')}
                              className="px-3.5 py-1.5 bg-[#e6f4ea] text-[#137333] border border-[#85c796] text-xs font-bold rounded-lg hover:bg-[#d2edd9] transition cursor-pointer"
                            >
                              Activate
                            </button>
                          )}
                        </>
                      )}

                      {/* Dropdown Menu for additional actions */}
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
                            <div className="absolute right-0 mt-1 w-44 bg-[#fdfdf7] border border-[#c8c2a3] rounded-2xl shadow-xl z-50 p-2 flex flex-col gap-0.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingShop(row);
                                  setActiveDropdownId(null);
                                }}
                                className="w-full text-left px-3 py-1.5 text-xs font-bold text-[#0d3b1b] hover:bg-[#efeacb]/40 rounded-xl transition cursor-pointer"
                              >
                                Edit shop info
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setExtendingShop(row);
                                  setActiveDropdownId(null);
                                }}
                                className="w-full text-left px-3 py-1.5 text-xs font-bold text-[#0d3b1b] hover:bg-[#efeacb]/40 rounded-xl transition cursor-pointer"
                              >
                                Extend due date
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setActivityShop(row);
                                  setActiveDropdownId(null);
                                }}
                                className="w-full text-left px-3 py-1.5 text-xs font-bold text-[#0d3b1b] hover:bg-[#efeacb]/40 rounded-xl transition cursor-pointer"
                              >
                                Activity log
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setMessagingShop(row);
                                  setActiveDropdownId(null);
                                }}
                                className="w-full text-left px-3 py-1.5 text-xs font-bold text-[#0d3b1b] hover:bg-[#efeacb]/40 rounded-xl transition cursor-pointer"
                              >
                                Message owner
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (row.status === 'suspended') {
                                    handleStatusChange(row.id, 'active');
                                  } else {
                                    setSuspendingShop(row);
                                  }
                                  setActiveDropdownId(null);
                                }}
                                className="w-full text-left px-3 py-1.5 text-xs font-bold text-[#8a6d1c] hover:bg-[#efeacb]/40 rounded-xl transition cursor-pointer"
                              >
                                {row.status === 'suspended' ? 'Unsuspend shop' : 'Suspend shop'}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (row.status === 'blocked') {
                                    handleStatusChange(row.id, 'active');
                                  } else {
                                    setBlockingShop(row);
                                  }
                                  setActiveDropdownId(null);
                                }}
                                className="w-full text-left px-3 py-1.5 text-xs font-bold text-[#8a6d1c] hover:bg-[#efeacb]/40 rounded-xl transition cursor-pointer"
                              >
                                {row.status === 'blocked' ? 'Unblock shop' : 'Block shop'}
                              </button>
                              <div className="h-[1px] bg-[#c8c2a3]/40 my-1" />
                              <button
                                type="button"
                                onClick={() => {
                                  setDeletingShop(row);
                                  setActiveDropdownId(null);
                                }}
                                className="w-full text-left px-3 py-1.5 text-xs font-bold text-[#8c1d1d] hover:bg-red-50 rounded-xl transition cursor-pointer"
                              >
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
              {filteredShops.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-sm text-[#607455] font-medium">
                    No shops found matching the filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View Stacked Cards */}
        <div className="md:hidden divide-y divide-[#c8c2a3]/30 bg-white">
          {filteredShops.map((row) => (
            <div key={row.id} className="p-5 flex flex-col gap-3 bg-white">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-base text-[#152f16]">{row.business}</p>
                  <p className="text-xs text-[#607455] font-semibold">{row.posModule}</p>
                </div>
                <span className={`inline-block font-bold px-3 py-1 rounded-lg border text-xs text-center uppercase tracking-wider ${
                  row.status === 'active' ? 'bg-[#e6f4ea] text-[#137333] border-[#85c796]' :
                  row.status === 'suspended' ? 'bg-[#f6edd2] text-[#a68334] border-[#dfc480]' :
                  'bg-[#fbebeb] text-[#a93b3b] border-[#d89f9f]'
                }`}>
                  {row.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-[#eae3c1]/40 p-3 rounded-xl border border-[#c8c2a3]/20">
                <div>
                  <p className="text-[10px] uppercase font-bold text-[#607455]">Bill This Month</p>
                  <p className="font-bold mt-0.5 text-[#152f16]">{row.billThisMonth}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-[#607455]">Expires / Left</p>
                  <p className="font-semibold mt-0.5 text-[#152f16]">{row.expires}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 mt-1">
                {row.status === 'blocked' && (row.billStatus === 'staff_request' || row.billStatus === 'upgrade_request') ? (
                  <>
                    <button
                      onClick={() => handleAction(row.id, 'reject')}
                      className="flex-1 py-2 bg-[#fbebeb] text-[#a93b3b] border border-[#d89f9f] text-xs font-semibold rounded-lg text-center"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleAction(row.id, 'approve')}
                      className="flex-1 py-2 bg-[#e6f4ea] text-[#137333] border border-[#85c796] text-xs font-semibold rounded-lg text-center"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction(row.id, 'resubmit')}
                      className="flex-1 py-2 bg-[#fdf3d6] text-[#b06000] border border-[#dcb35c] text-xs font-semibold rounded-lg text-center"
                    >
                      Resubmit
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setSelectedShop(row)}
                      className="flex-1 py-2 bg-white text-[#152f16] border border-[#c8c2a3] text-xs font-bold rounded-lg text-center"
                    >
                      View details
                    </button>
                    {row.status === 'active' ? (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(row.id, 'suspended')}
                        className="flex-1 py-2 bg-[#f6edd2] text-[#a68334] border border-[#dfc480] text-xs font-bold rounded-lg text-center"
                      >
                        Suspend
                      </button>
                    ) : row.status === 'blocked' ? (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(row.id, 'active')}
                        className="flex-1 py-2 bg-[#fbebeb] text-[#a93b3b] border border-[#d89f9f] text-xs font-bold rounded-lg text-center"
                      >
                        Unblock
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(row.id, 'active')}
                        className="flex-1 py-2 bg-[#e6f4ea] text-[#137333] border border-[#85c796] text-xs font-bold rounded-lg text-center"
                      >
                        Activate
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
          {filteredShops.length === 0 && (
            <div className="py-8 text-center text-sm text-[#607455] font-medium">
              No shops found matching the filter criteria.
            </div>
          )}
        </div>
      </div>

      {/* Details Slide-Over or Modal */}
      <ShopDetailsModal
        selectedShop={selectedShop}
        onClose={() => setSelectedShop(null)}
      />

      {/* Resubmit Reason Modal */}
      {resubmitShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setResubmitShop(null)} />
          <div className="relative bg-[#efeacb] rounded-[24px] border border-[#bfbc9b] p-6 w-full max-w-sm shadow-xl flex flex-col gap-4 text-[#152f16]">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#152f16] font-serif leading-snug">
                Resubmit Request
              </h3>
              <p className="text-sm font-semibold text-[#0c3818] mt-0.5">
                {resubmitShop.business}
              </p>
            </div>

            <textarea
              placeholder="Write your suggestion or request details for improvement"
              value={resubmitComment}
              onChange={(e) => setResubmitComment(e.target.value)}
              className="w-full min-h-[120px] bg-white border border-[#bfbc9b]/80 rounded-xl p-4 text-xs text-[#152f16] outline-none placeholder-[#607455]/60 focus:ring-1 focus:ring-[#0c3818]/30 resize-none font-semibold"
            />

            <div className="flex justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={() => setResubmitShop(null)}
                className="px-5 py-2 bg-white border border-[#0c3818]/60 text-[#0c3818] text-sm font-bold rounded-xl hover:bg-neutral-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendResubmit}
                className="px-6 py-2 bg-[#0c3818] text-white text-sm font-bold rounded-xl hover:bg-[#082813] transition cursor-pointer"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Shop Info Modal */}
      <EditShopInfoModal
        editingShop={editingShop}
        onClose={() => setEditingShop(null)}
        onSave={handleSaveChanges}
      />

      {/* Extend Billing Due Date Modal */}
      <ExtendDueDateModal
        extendingShop={extendingShop}
        onClose={() => setExtendingShop(null)}
        onSave={handleSaveExtend}
      />

      {/* Activity Log Modal */}
      <ActivityLogModal
        shop={activityShop}
        onClose={() => setActivityShop(null)}
      />

      {/* Message Owner Modal */}
      <MessageOwnerModal
        shop={messagingShop}
        onClose={() => setMessagingShop(null)}
        onSend={handleSendMessage}
      />

      {/* Block Shop Modal */}
      <BlockShopModal
        shop={blockingShop}
        onClose={() => setBlockingShop(null)}
        onBlock={handleBlockShop}
      />

      {/* Delete Shop Modal */}
      <DeleteShopModal
        shop={deletingShop}
        onClose={() => setDeletingShop(null)}
        onDelete={handleDeleteShop}
      />

      {/* Suspend Shop Modal */}
      <SuspendShopModal
        shop={suspendingShop}
        onClose={() => setSuspendingShop(null)}
        onSuspend={handleSuspendShop}
      />
    </div>
  );
}
