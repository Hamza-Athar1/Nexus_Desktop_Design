import React, { useState } from 'react';
import { ChevronDown, MoreHorizontal, X, Pause, Check } from 'lucide-react';
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
    regDate: 'Feb 03, 2025',
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
    expires: 'Sep, 12, 2026',
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
    billStatus: 'due',
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
    billStatus: 'defaulter',
    amount: '2,800',
    expires: 'Jul 10, 2026',
    lastPaid: 'May 12, 2026',
    status: 'blocked',
    owner: 'Rafiuddin Sheikh',
    email: 'management@rafirestaurant.com',
    phone: '+92 345 6789012',
    address: 'Food Street, near Fort, Lahore',
    regDate: 'Dec 01, 2024',
    posPurchased: 5,
    posActive: 2
  }
];

export default function SuperAdminBillingPage() {
  const [shops, setShops] = useState(INITIAL_SHOPS);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'paid', 'due', 'defaulter'
  const [activeDropdownId, setActiveDropdownId] = useState(null);

  // Modal states
  const [selectedShop, setSelectedShop] = useState(null);
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
      prev.map(s => (s.id === id ? { ...s, status: 'blocked', billStatus: 'defaulter' } : s))
    );
    setBlockingShop(null);
  };

  const handleSuspendShop = (id, reason) => {
    setShops(prev =>
      prev.map(s => (s.id === id ? { ...s, status: 'suspended', billStatus: 'due' } : s))
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
              billThisMonth: 'Paid Rs ' + s.amount,
              billStatus: 'paid'
            }
          : s
      )
    );
    setExtendingShop(null);
  };

  const handleStatusChange = (id, newStatus) => {
    setShops(prev =>
      prev.map(s => {
        if (s.id === id) {
          let billStatus = s.billStatus;
          if (newStatus === 'active') billStatus = 'paid';
          return { ...s, status: newStatus, billStatus };
        }
        return s;
      })
    );
    setActiveDropdownId(null);
  };

  // Counts
  const totalCount = shops.length;
  const paidCount = shops.filter(s => s.billStatus === 'paid').length;
  const dueCount = shops.filter(s => s.billStatus === 'due').length;
  const defaulterCount = shops.filter(s => s.billStatus === 'defaulter').length;

  const filteredShops = shops.filter(s => {
    if (activeFilter === 'all') return true;
    return s.billStatus === activeFilter;
  });

  return (
    <div className="flex-1 flex flex-col font-sans">
      {/* Header section */}
      <div className="mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#152f16] font-serif mb-2">
          Billing
        </h1>
        <p className="text-base sm:text-lg text-[#55694a] font-medium flex items-center gap-3">
          <span>Revenue overview</span>
          <span className="text-[#152f16]/60">•</span>
          <span>July 2026</span>
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
          onClick={() => setActiveFilter('paid')}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm border transition duration-200 cursor-pointer ${
            activeFilter === 'paid'
              ? 'bg-[#0c3818] text-white border-[#0c3818] shadow-sm'
              : 'bg-white text-[#152f16] border-[#bfbc9b] hover:bg-[#efeacb]/30'
          }`}
        >
          Paid {paidCount}
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter('due')}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm border transition duration-200 cursor-pointer ${
            activeFilter === 'due'
              ? 'bg-[#0c3818] text-white border-[#0c3818] shadow-sm'
              : 'bg-white text-[#152f16] border-[#bfbc9b] hover:bg-[#efeacb]/30'
          }`}
        >
          Due {dueCount}
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter('defaulter')}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm border transition duration-200 cursor-pointer ${
            activeFilter === 'defaulter'
              ? 'bg-[#0c3818] text-white border-[#0c3818] shadow-sm'
              : 'bg-white text-[#152f16] border-[#bfbc9b] hover:bg-[#efeacb]/30'
          }`}
        >
          Defaulter {defaulterCount}
        </button>
      </div>

      {/* Main Table section */}
      <div className="bg-[#efeacb] rounded-[24px] border border-[#bfbc9b] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
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
                    {row.billStatus === 'paid' ? (
                      <span className="inline-block px-3 py-1 text-xs font-bold text-[#137333] bg-[#e6f4ea] border border-[#85c796] rounded-lg">
                        {row.billThisMonth}
                      </span>
                    ) : (
                      <span className="inline-block px-3 py-1 text-xs font-bold text-[#a93b3b] bg-[#fbebeb] border border-[#d89f9f] rounded-lg">
                        {row.billThisMonth}
                      </span>
                    )}
                  </td>
                  {/* Expires */}
                  <td className="py-4 px-6 font-medium text-[#152f16]">{row.expires}</td>
                  {/* Last Paid */}
                  <td className="py-4 px-6 font-semibold">{row.lastPaid}</td>
                  {/* Action */}
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-2">
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
                          onClick={() => setSuspendingShop(row)}
                          className="px-3.5 py-1.5 bg-[#f6edd2] text-[#a68334] border-[#dfc480] text-xs font-bold rounded-lg hover:bg-[#faebb3] transition cursor-pointer"
                        >
                          Suspend
                        </button>
                      ) : row.status === 'blocked' ? (
                        <button
                          type="button"
                          onClick={() => handleStatusChange(row.id, 'active')}
                          className="px-3.5 py-1.5 bg-[#fbebeb] text-[#a93b3b] border-[#d89f9f] text-xs font-bold rounded-lg hover:bg-[#fae3e3] transition cursor-pointer"
                        >
                          Unblock
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleStatusChange(row.id, 'active')}
                          className="px-3.5 py-1.5 bg-[#e6f4ea] text-[#137333] border-[#85c796] text-xs font-bold rounded-lg hover:bg-[#d2edd9] transition cursor-pointer"
                        >
                          Activate
                        </button>
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
                    No billing records found matching the filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Reusable Dialog/Modal Components --- */}

      {/* Shop Details Modal */}
      <ShopDetailsModal
        shop={selectedShop}
        onClose={() => setSelectedShop(null)}
      />

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
