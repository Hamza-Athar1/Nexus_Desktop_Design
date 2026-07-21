import React, { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import BillingDetailsModal from '../../components/Super-User/BillingDetailsModal';
import ShopDetailsModal from '../../components/Super-User/ShopDetailsModal';
import EditShopInfoModal from '../../components/Super-User/EditShopInfoModal';
import ExtendDueDateModal from '../../components/Super-User/ExtendDueDateModal';
import ActivityLogModal from '../../components/Super-User/ActivityLogModal';
import MessageOwnerModal from '../../components/Super-User/MessageOwnerModal';
import BlockShopModal from '../../components/Super-User/BlockShopModal';
import DeleteShopModal from '../../components/Super-User/DeleteShopModal';
import SuspendShopModal from '../../components/Super-User/SuspendShopModal';

const INITIAL_INVOICES = [
  {
    id: 1,
    invoice: 'INV-0231',
    business: 'Piato Bakery',
    posModule: 'Bakery POS',
    amount: '4,500',
    status: 'paid', // paid | overdue | pending
    statusLabel: 'Paid Rs 4,500',
    method: 'Card',
    dueDate: 'Aug 14, 2026',
    // Detailed modal backup fields
    owner: 'Sajid Piato',
    email: 'info@piatobakery.pk',
    phone: '+92 321 9876543',
    address: 'Plot 45-B, Commercial Area, DHA Phase 6, Lahore',
    regDate: 'Mar 15, 2025',
    posPurchased: 4,
    posActive: 3,
    lastPaid: 'Jul 17, 2026',
    shopStatus: 'active'
  },
  {
    id: 2,
    invoice: 'INV-0232',
    business: 'Fairy Parcel Co.',
    posModule: 'Gifting POS',
    amount: '6,000',
    status: 'paid',
    statusLabel: 'Paid Rs 6,000',
    method: 'Card',
    dueDate: 'Sep 02, 2026',
    owner: 'Fiza Fairy',
    email: 'billing@fairyparcel.com',
    phone: '+92 333 4567890',
    address: 'Office 302, 3rd Floor, Centaurus Mall, Islamabad',
    regDate: 'Jun 20, 2024',
    posPurchased: 3,
    posActive: 1,
    lastPaid: 'Jun 20, 2026',
    shopStatus: 'active'
  },
  {
    id: 3,
    invoice: 'INV-0233',
    business: 'Green valley Grocers',
    posModule: 'Grocery POS',
    amount: '5,200',
    status: 'overdue',
    statusLabel: 'Overdue Rs 5,200',
    method: '--',
    dueDate: 'Jul 25, 2026',
    owner: 'Tariq Mehmood',
    email: 'tariq@greenvalley.com',
    phone: '+92 312 3456789',
    address: 'Main Boulevard, Bahria Town, Rawalpindi',
    regDate: 'Oct 05, 2024',
    posPurchased: 6,
    posActive: 4,
    lastPaid: 'Jun 10, 2026',
    shopStatus: 'suspended'
  },
  {
    id: 4,
    invoice: 'INV-0234',
    business: 'Rafi Restaurant Co.',
    posModule: 'Restaurant POS',
    amount: '2,800',
    status: 'pending',
    statusLabel: 'Pending Rs 2,800',
    method: '--',
    dueDate: 'Aug 20, 2026',
    owner: 'Rafiuddin Sheikh',
    email: 'management@rafirestaurant.com',
    phone: '+92 345 6789012',
    address: 'Food Street, near Fort, Lahore',
    regDate: 'Dec 01, 2024',
    posPurchased: 5,
    posActive: 2,
    lastPaid: 'May 12, 2026',
    shopStatus: 'blocked'
  },
  {
    id: 5,
    invoice: 'INV-0235',
    business: 'Al-Karam Pharmacy',
    posModule: 'Pharmacy POS',
    amount: '3,000',
    status: 'paid',
    statusLabel: 'Paid Rs 3,000',
    method: 'Bank',
    dueDate: 'Aug 28, 2026',
    owner: 'Kareem Shahid',
    email: 'contact@alkarampharmacy.com',
    phone: '+92 300 1234567',
    address: 'Shop 12, Block C, Gulshan-e-Iqbal, Karachi',
    regDate: 'Feb 03, 2025',
    posPurchased: 5,
    posActive: 2,
    lastPaid: 'Jul 17, 2026',
    shopStatus: 'active'
  }
];

export default function SuperAdminBillingPage() {
  const [invoices, setInvoices] = useState(INITIAL_INVOICES);
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
    alert(`Message sent successfully!\n\nSubject: ${data.subject}\nMessage: ${data.message}`);
    setMessagingShop(null);
  };

  const handleBlockShop = (id) => {
    setInvoices(prev =>
      prev.map(s => (s.id === id ? { ...s, shopStatus: 'blocked', status: 'overdue' } : s))
    );
    setBlockingShop(null);
  };

  const handleSuspendShop = (id) => {
    setInvoices(prev =>
      prev.map(s => (s.id === id ? { ...s, shopStatus: 'suspended', status: 'pending' } : s))
    );
    setSuspendingShop(null);
  };

  const handleDeleteShop = (id) => {
    setInvoices(prev => prev.filter(s => s.id !== id));
    setDeletingShop(null);
  };

  const handleSaveChanges = (id, updatedFields) => {
    setInvoices(prev =>
      prev.map(s => (s.id === id ? { ...s, ...updatedFields } : s))
    );
    setEditingShop(null);
  };

  const handleSaveExtend = (id, newDate) => {
    setInvoices(prev =>
      prev.map(s =>
        s.id === id
          ? {
              ...s,
              dueDate: newDate,
              statusLabel: 'Paid Rs ' + s.amount,
              status: 'paid'
            }
          : s
      )
    );
    setExtendingShop(null);
  };

  // Counts for tabs
  const totalCount = invoices.length;
  const paidCount = invoices.filter(s => s.status === 'paid').length;
  const dueCount = invoices.filter(s => s.status === 'pending').length;
  const defaulterCount = invoices.filter(s => s.status === 'overdue').length;

  const filteredInvoices = invoices.filter(s => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'paid') return s.status === 'paid';
    if (activeFilter === 'due') return s.status === 'pending';
    if (activeFilter === 'defaulter') return s.status === 'overdue';
    return true;
  });

  return (
    <div className="flex-1 flex flex-col font-sans select-none text-[#14391a]">
      {/* Header section */}
      <div className="mb-6">
        <h1 className="text-4xl sm:text-[44px] font-extrabold tracking-tight text-[#14391a] mb-1 leading-none">
          Billing
        </h1>
        <p className="text-sm sm:text-base text-[#14391a]/70 font-semibold flex items-center gap-4 mt-2">
          <span>Revenue overview</span>
          <span>July 2026</span>
        </p>
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Card 1 */}
        <div className="bg-[#113819] text-white rounded-[14px] p-5 shadow-lg shadow-[#113819]/15 flex flex-col justify-between h-[104px]">
          <span className="text-[13px] font-semibold text-white/95">Collected this month</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-extrabold text-white">Rs</span>
            <span className="text-2xl font-extrabold tracking-tight">13,500</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-[#113819] text-white rounded-[14px] p-5 shadow-lg shadow-[#113819]/15 flex flex-col justify-between h-[104px]">
          <span className="text-[13px] font-semibold text-white/95">Pending</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-extrabold text-[#d2a233]">Rs</span>
            <span className="text-2xl font-extrabold tracking-tight text-[#d2a233]">5,200</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-[#113819] text-white rounded-[14px] p-5 shadow-lg shadow-[#113819]/15 flex flex-col justify-between h-[104px]">
          <span className="text-[13px] font-semibold text-white/95">Overdue</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-extrabold text-[#e5432d]">Rs</span>
            <span className="text-2xl font-extrabold tracking-tight text-[#e5432d]">2,800</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-[#113819] text-white rounded-[14px] p-5 shadow-lg shadow-[#113819]/15 flex flex-col justify-between h-[104px]">
          <span className="text-[13px] font-semibold text-white/95">Total invoices</span>
          <div>
            <span className="text-2xl font-extrabold tracking-tight">4</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs / Pills */}
      <div className="flex flex-wrap items-center gap-3.5 mb-7">
        <button
          type="button"
          onClick={() => setActiveFilter('all')}
          className={`px-5 py-2.5 rounded-[12px] font-bold text-sm border transition duration-200 cursor-pointer ${
            activeFilter === 'all'
              ? 'bg-[#113819] text-white border-[#113819] shadow-sm'
              : 'bg-[#faf8ed] text-[#14391a] border-[#14391a]/30 hover:bg-[#eae4c9]'
          }`}
        >
          All 5
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter('paid')}
          className={`px-5 py-2.5 rounded-[12px] font-bold text-sm border transition duration-200 cursor-pointer ${
            activeFilter === 'paid'
              ? 'bg-[#113819] text-white border-[#113819] shadow-sm'
              : 'bg-[#faf8ed] text-[#14391a] border-[#14391a]/30 hover:bg-[#eae4c9]'
          }`}
        >
          Paid 2
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter('due')}
          className={`px-5 py-2.5 rounded-[12px] font-bold text-sm border transition duration-200 cursor-pointer ${
            activeFilter === 'due'
              ? 'bg-[#113819] text-white border-[#113819] shadow-sm'
              : 'bg-[#faf8ed] text-[#14391a] border-[#14391a]/30 hover:bg-[#eae4c9]'
          }`}
        >
          Due 1
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter('defaulter')}
          className={`px-5 py-2.5 rounded-[12px] font-bold text-sm border transition duration-200 cursor-pointer ${
            activeFilter === 'defaulter'
              ? 'bg-[#113819] text-white border-[#113819] shadow-sm'
              : 'bg-[#faf8ed] text-[#14391a] border-[#14391a]/30 hover:bg-[#eae4c9]'
          }`}
        >
          Defaulter 1
        </button>
      </div>

      {/* Main Table section */}
      <div className="bg-[#ede7cd] rounded-[18px] border border-[#14391a]/20 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#e4dcbc] border-b border-[#14391a]/15 text-[13px] font-extrabold uppercase tracking-wider text-[#14391a]">
                <th className="py-4.5 px-6">INVOICE</th>
                <th className="py-4.5 px-6">BUSINESS</th>
                <th className="py-4.5 px-6">POS MODULE</th>
                <th className="py-4.5 px-6">AMOUNT</th>
                <th className="py-4.5 px-6">METHOD</th>
                <th className="py-4.5 px-6">DUE DATE</th>
                <th className="py-4.5 px-6 text-center">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#14391a]/10 bg-[#fbf9f0]">
              {filteredInvoices.map((row) => (
                <tr key={row.id} className="hover:bg-[#e9e3cb]/30 transition text-sm text-[#14391a]">
                  {/* INVOICE */}
                  <td className="py-4.5 px-6 font-extrabold text-[#14391a]">{row.invoice}</td>
                  
                  {/* BUSINESS */}
                  <td className="py-4.5 px-6 font-extrabold">{row.business}</td>
                  
                  {/* POS MODULE */}
                  <td className="py-4.5 px-6 font-bold text-[#14391a]/85 leading-snug">{row.posModule}</td>
                  
                  {/* AMOUNT BADGES */}
                  <td className="py-4.5 px-6">
                    {row.status === 'paid' ? (
                      <div className="inline-flex flex-col items-center justify-center px-3.5 py-1.5 bg-[#cbebc7] border border-[#14391a]/30 rounded-[10px] text-[13px] font-extrabold text-[#14391a] leading-tight text-center">
                        <span>Paid Rs</span>
                        <span>{row.amount}</span>
                      </div>
                    ) : row.status === 'overdue' ? (
                      <div className="inline-flex flex-col items-center justify-center px-3.5 py-1.5 bg-[#f7d6d3] border border-[#d65f57] rounded-[10px] text-[13px] font-extrabold text-[#99221b] leading-tight text-center">
                        <span>Overdue</span>
                        <span>Rs {row.amount}</span>
                      </div>
                    ) : (
                      <div className="inline-flex flex-col items-center justify-center px-3.5 py-1.5 bg-[#f6edc1] border border-[#cca839] rounded-[10px] text-[13px] font-extrabold text-[#78590d] leading-tight text-center">
                        <span>Pending</span>
                        <span>Rs {row.amount}</span>
                      </div>
                    )}
                  </td>

                  {/* METHOD */}
                  <td className="py-4.5 px-6 font-bold text-[#14391a]/80">{row.method}</td>

                  {/* DUE DATE */}
                  <td className="py-4.5 px-6 font-bold text-[#14391a]">{row.dueDate}</td>

                  {/* ACTION */}
                  <td className="py-4.5 px-6 text-center">
                    <button
                      type="button"
                      onClick={() => setSelectedShop(row)}
                      className="px-4 py-2 bg-[#fcfbfa] hover:bg-white text-[#14391a] border border-[#14391a]/40 text-xs font-extrabold rounded-[10px] shadow-2xs transition cursor-pointer"
                    >
                      View details
                    </button>
                  </td>
                </tr>
              ))}
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-sm text-[#14391a]/70 font-medium">
                    No billing records found matching the filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Reusable Dialog/Modal Components --- */}

      {/* Billing Details Modal */}
      <BillingDetailsModal
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
