import React, { useState } from 'react';
import { Search, MoreHorizontal } from 'lucide-react';
import SuperAdminProfileDetailPage from './SuperAdminProfileDetailPage';

const INITIAL_ADMINS = [
  {
    id: 1,
    name: 'Bilal Sheikh',
    email: 'bilal.sheikh@nexus.com',
    posModules: ['Pharmacy POS'],
    status: 'active',
    lastLogin: '2026-07-21',
  },
  {
    id: 2,
    name: 'Hina Raza',
    email: 'hina.raza@nexus.com',
    posModules: ['Grocery POS'],
    status: 'suspended',
    lastLogin: '2026-06-15',
  },
  {
    id: 3,
    name: 'Saad Haider',
    email: 'saad.haider@nexus.com',
    posModules: ['Clothing POS'],
    status: 'active',
    lastLogin: '2026-07-20',
  },
  {
    id: 4,
    name: 'Zara Khan',
    email: 'zara.khan@nexus.com',
    posModules: ['Bakery POS', 'Electronics POS'],
    status: 'active',
    lastLogin: '2026-07-12',
  },
  {
    id: 5,
    name: 'Usman Tariq',
    email: 'usman.tariq@nexus.com',
    posModules: ['General Store POS', 'Restaurant POS'],
    status: 'offboarded',
    lastLogin: '2026-06-25',
  },
  {
    id: 6,
    name: 'Ayesha Farooq',
    email: 'ayesha.farooq@nexus.com',
    posModules: ['Bakery POS', 'Clothing POS', 'Restaurant POS'],
    status: 'active',
    lastLogin: '2026-07-03',
  },
];

export default function SuperAdminProfilePage() {
  const [admins, setAdmins] = useState(INITIAL_ADMINS);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'active', 'suspended', 'offboarded'
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  
  // Manage admin sub-view state
  const [managedAdmin, setManagedAdmin] = useState(null);

  // Dialog modal states
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [editingAdmin, setEditingAdmin] = useState(null);

  // Manage operations
  const handleStatusChange = (id, newStatus) => {
    setAdmins(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
    setActiveDropdownId(null);
  };

  const handleUpdateModules = (id, updatedModules) => {
    setAdmins(prev => prev.map(a => a.id === id ? { ...a, posModules: updatedModules } : a));
    setEditingAdmin(null);
  };

  const totalCount = admins.length;
  const activeCount = admins.filter(a => a.status === 'active').length;

  // Filtering
  const filteredAdmins = admins.filter(a => {
    // 1. Status Filter
    if (activeFilter !== 'all' && a.status !== activeFilter) {
      return false;
    }
    // 2. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = a.name.toLowerCase().includes(q);
      const matchEmail = a.email.toLowerCase().includes(q);
      const matchModules = a.posModules.some(m => m.toLowerCase().includes(q));
      if (!matchName && !matchEmail && !matchModules) {
        return false;
      }
    }
    return true;
  });

  if (managedAdmin) {
    return (
      <SuperAdminProfileDetailPage
        admin={managedAdmin}
        onBack={() => setManagedAdmin(null)}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col font-sans select-none text-[#14391a]">
      {/* Header section */}
      <div className="mb-6">
        <h1 className="text-4xl sm:text-[44px] font-extrabold tracking-tight text-[#14391a] mb-1 leading-none">
          Profile Management
        </h1>
        <p className="text-sm sm:text-base text-[#14391a]/70 font-semibold flex items-center gap-2.5 mt-2">
          <span>Admin accounts</span>
          <span className="text-[#14391a]/30">•</span>
          <span>{totalCount} total</span>
          <span className="text-[#14391a]/30">•</span>
          <span>{activeCount} active</span>
        </p>
      </div>

      {/* Filters & Search Input Bar */}
      <div className="flex flex-wrap items-center gap-4 mb-7">
        {/* Search Field */}
        <div className="relative w-full max-w-xs">
          <input
            type="text"
            placeholder="Search name or email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#fcfbfa] border border-[#14391a]/20 text-[#14391a] pl-4 pr-10 py-2.5 text-sm font-semibold rounded-[12px] placeholder-[#14391a]/45 focus:outline-none focus:border-[#14391a]/40"
          />
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#14391a]/50" size={17} />
        </div>

        {/* Preset Pills */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-5 py-2.5 rounded-[12px] font-bold text-sm border transition duration-200 cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-[#113819] text-white border-[#113819] shadow-sm'
                : 'bg-[#faf8ed] text-[#14391a] border-[#14391a]/30 hover:bg-[#eae4c9]'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('active')}
            className={`px-5 py-2.5 rounded-[12px] font-bold text-sm border transition duration-200 cursor-pointer ${
              activeFilter === 'active'
                ? 'bg-[#113819] text-white border-[#113819] shadow-sm'
                : 'bg-[#faf8ed] text-[#14391a] border-[#14391a]/30 hover:bg-[#eae4c9]'
            }`}
          >
            Active
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('suspended')}
            className={`px-5 py-2.5 rounded-[12px] font-bold text-sm border transition duration-200 cursor-pointer ${
              activeFilter === 'suspended'
                ? 'bg-[#113819] text-white border-[#113819] shadow-sm'
                : 'bg-[#faf8ed] text-[#14391a] border-[#14391a]/30 hover:bg-[#eae4c9]'
            }`}
          >
            Suspended
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('offboarded')}
            className={`px-5 py-2.5 rounded-[12px] font-bold text-sm border transition duration-200 cursor-pointer ${
              activeFilter === 'offboarded'
                ? 'bg-[#113819] text-white border-[#113819] shadow-sm'
                : 'bg-[#faf8ed] text-[#14391a] border-[#14391a]/30 hover:bg-[#eae4c9]'
            }`}
          >
            Offboarded
          </button>
        </div>
      </div>

      {/* Main Table section */}
      <div className="bg-[#ede7cd] rounded-[18px] border border-[#14391a]/20 shadow-xs">
        <div>
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#e4dcbc] border-b border-[#14391a]/15 text-[13px] font-extrabold uppercase tracking-wider text-[#14391a]">
                <th className="py-4.5 px-6">User</th>
                <th className="py-4.5 px-6">POS modules</th>
                <th className="py-4.5 px-6">Status</th>
                <th className="py-4.5 px-6">Last Login</th>
                <th className="py-4.5 px-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#14391a]/10 bg-[#fbf9f0]">
              {filteredAdmins.map((row) => (
                <tr key={row.id} className="hover:bg-[#e9e3cb]/30 transition text-sm text-[#14391a]">
                  {/* USER (Name & Email) */}
                  <td className="py-4.5 px-6">
                    <div className="font-extrabold text-[#14391a] text-[15px]">{row.name}</div>
                    <div className="text-xs text-[#14391a]/65 font-bold mt-0.5">{row.email}</div>
                  </td>
                  
                  {/* POS MODULES */}
                  <td className="py-4.5 px-6 font-bold text-[#14391a]/85 leading-snug">
                    {row.posModules.length === 1 ? (
                      row.posModules[0]
                    ) : (
                      <ul className="list-disc list-inside flex flex-col gap-0.5">
                        {row.posModules.map((mod, idx) => (
                          <li key={idx} className="marker:text-[#14391a]">{mod}</li>
                        ))}
                      </ul>
                    )}
                  </td>
                  
                  {/* STATUS BADGES */}
                  <td className="py-4.5 px-6">
                    {row.status === 'active' ? (
                      <span className="inline-flex px-3.5 py-1.5 bg-[#cbebc7] border border-[#14391a]/30 rounded-[10px] text-[13px] font-extrabold text-[#14391a] leading-tight">
                        Active
                      </span>
                    ) : row.status === 'suspended' ? (
                      <span className="inline-flex px-3.5 py-1.5 bg-[#f6edc1] border border-[#cca839] rounded-[10px] text-[13px] font-extrabold text-[#78590d] leading-tight">
                        Suspended
                      </span>
                    ) : (
                      <span className="inline-flex px-3.5 py-1.5 bg-[#f7d6d3] border border-[#d65f57] rounded-[10px] text-[13px] font-extrabold text-[#99221b] leading-tight">
                        Offboarded
                      </span>
                    )}
                  </td>

                  {/* LAST LOGIN */}
                  <td className="py-4.5 px-6 font-bold text-[#14391a]/80">{row.lastLogin}</td>

                  {/* ACTION BUTTON & POPUP MENU */}
                  <td className="py-4.5 px-6 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setManagedAdmin(row)}
                        className="px-5 py-2.5 bg-[#113819] hover:bg-[#14391a] text-white text-[13px] font-extrabold rounded-[10px] shadow-sm transition cursor-pointer"
                      >
                        Manage
                      </button>

                      {/* Dropdown Menu Trigger */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setActiveDropdownId(activeDropdownId === row.id ? null : row.id)}
                          className="p-2 bg-[#fcfbfa] hover:bg-white text-[#14391a] border border-[#14391a]/40 rounded-[10px] shadow-2xs transition cursor-pointer flex items-center justify-center"
                        >
                          <MoreHorizontal size={16} />
                        </button>
                        {activeDropdownId === row.id && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setActiveDropdownId(null)} />
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-[#14391a]/15 rounded-xl shadow-xl z-50 p-2 flex flex-col text-left">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingAdmin(row);
                                  setActiveDropdownId(null);
                                }}
                                className="w-full text-left px-3 py-2 text-xs font-bold text-[#14391a] hover:bg-gray-50 rounded-lg transition cursor-pointer"
                              >
                                Edit POS Modules
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(row.id, 'active')}
                                className="w-full text-left px-3 py-2 text-xs font-bold text-[#14391a] hover:bg-gray-50 rounded-lg transition cursor-pointer"
                              >
                                Activate Account
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(row.id, 'suspended')}
                                className="w-full text-left px-3 py-2 text-xs font-bold text-[#78590d] hover:bg-amber-50 rounded-lg transition cursor-pointer"
                              >
                                Suspend Account
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(row.id, 'offboarded')}
                                className="w-full text-left px-3 py-2 text-xs font-bold text-[#dc2626] hover:bg-red-50 rounded-lg transition cursor-pointer border-t border-gray-100 mt-1 pt-2"
                              >
                                Offboard Account
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredAdmins.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-sm text-[#14391a]/70 font-medium">
                    No admin accounts found matching the search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View details popover */}
      {selectedAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/45 backdrop-blur-xs" onClick={() => setSelectedAdmin(null)} />
          <div className="relative bg-[#efeacb] rounded-[24px] border border-[#bfbc9b] p-8 w-full max-w-md shadow-2xl flex flex-col text-[#152f16] gap-5 animate-in fade-in zoom-in duration-200">
            <h3 className="text-2xl font-black text-[#14391a] leading-none">Admin Profile details</h3>
            <div className="flex flex-col gap-3.5 border-t border-[#14391a]/10 pt-4 text-[14px]">
              <div>
                <span className="font-extrabold text-[#14391a]/70 block mb-0.5">Admin Name</span>
                <span className="font-black text-[#14391a] text-lg">{selectedAdmin.name}</span>
              </div>
              <div>
                <span className="font-extrabold text-[#14391a]/70 block mb-0.5">Contact Email</span>
                <span className="font-bold text-[#14391a]">{selectedAdmin.email}</span>
              </div>
              <div>
                <span className="font-extrabold text-[#14391a]/70 block mb-0.5">Assigned Modules</span>
                <span className="font-bold text-[#14391a]">{selectedAdmin.posModules.join(', ')}</span>
              </div>
              <div>
                <span className="font-extrabold text-[#14391a]/70 block mb-0.5">Account Status</span>
                <span className="font-extrabold text-[#14391a] capitalize">{selectedAdmin.status}</span>
              </div>
              <div>
                <span className="font-extrabold text-[#14391a]/70 block mb-0.5">Last Logged In</span>
                <span className="font-bold text-[#14391a]">{selectedAdmin.lastLogin}</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedAdmin(null)}
              className="mt-2 w-full py-3.5 bg-[#faf8ed] border border-[#14391a]/40 text-[#14391a] text-base font-extrabold rounded-xl hover:bg-white active:scale-95 transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Edit POS Modules Inline Modal */}
      {editingAdmin && (
        <EditAdminModulesModal
          admin={editingAdmin}
          onClose={() => setEditingAdmin(null)}
          onSave={handleUpdateModules}
        />
      )}
    </div>
  );
}

// Subcomponent: Edit Modules Modal
function EditAdminModulesModal({ admin, onClose, onSave }) {
  const allPosModules = ['Pharmacy POS', 'Grocery POS', 'Clothing POS', 'Bakery POS', 'Electronics POS', 'General Store POS', 'Restaurant POS'];
  const [selectedModules, setSelectedModules] = useState([...admin.posModules]);

  const handleToggleModule = (mod) => {
    if (selectedModules.includes(mod)) {
      setSelectedModules(prev => prev.filter(m => m !== mod));
    } else {
      setSelectedModules(prev => [...prev, mod]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/45 backdrop-blur-xs" onClick={onClose} />
      <div className="relative bg-[#efeacb] rounded-[24px] border border-[#bfbc9b] p-8 w-full max-w-md shadow-2xl flex flex-col text-[#152f16] gap-5 animate-in fade-in zoom-in duration-200">
        <h3 className="text-2xl font-black text-[#14391a] leading-none">Assign POS Modules</h3>
        <p className="text-sm font-bold text-[#14391a]/75 -mt-1 leading-relaxed">
          Update the active system modules assigned to {admin.name}.
        </p>

        <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
          {allPosModules.map((mod) => {
            const checked = selectedModules.includes(mod);
            return (
              <label key={mod} className="flex items-center gap-3.5 p-3.5 bg-[#fbf9f0] border border-[#14391a]/15 rounded-xl cursor-pointer hover:bg-white transition">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => handleToggleModule(mod)}
                  className="w-5 h-5 rounded border-[#14391a]/30 accent-[#113819]"
                />
                <span className="text-sm font-extrabold text-[#14391a]">{mod}</span>
              </label>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-4 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 bg-[#faf8ed] border border-[#14391a]/40 text-[#14391a] text-base font-extrabold rounded-xl hover:bg-white active:scale-95 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(admin.id, selectedModules)}
            className="w-full py-3.5 bg-[#113819] hover:bg-[#14391a] text-white text-base font-extrabold rounded-xl active:scale-95 transition cursor-pointer"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
