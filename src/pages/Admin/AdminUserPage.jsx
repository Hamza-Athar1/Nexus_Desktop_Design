import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { SquarePen, CheckCircle2, UserPlus, Users, Edit2, Trash2, ShieldCheck, AlertCircle } from 'lucide-react';
import { apiFetchJson } from '../../lib/api';
import AdminPasswordVerifyModal from '../../components/Admin/AdminPasswordVerifyModal';
import AdminChangeUsernameModal from '../../components/Admin/AdminChangeUsernameModal';
import AdminChangeEmailModal from '../../components/Admin/AdminChangeEmailModal';
import AdminChangePasswordModal from '../../components/Admin/AdminChangePasswordModal';
import AddStaffModal from '../../components/Admin/AddStaffModal';
import EditStaffModal from '../../components/Admin/EditStaffModal';

export default function AdminUserPage() {
  const { setHeaderDetails } = useOutletContext() || {};
  const { user, updateUser } = useAuth();

  const [accountInfo, setAccountInfo] = useState({
    username: user?.username || 'Admin',
    email: user?.email || 'admin@gmail.com',
    lastLogin: '23 Aug 2026 10:15 AM',
  });

  const [toastMessage, setToastMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Modals for owner profile
  const [verifyPasswordModalOpen, setVerifyPasswordModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [changeUsernameModalOpen, setChangeUsernameModalOpen] = useState(false);
  const [changeEmailModalOpen, setChangeEmailModalOpen] = useState(false);
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);

  // Staff management state & modals
  const [staffList, setStaffList] = useState([]);
  const [staffLoading, setStaffLoading] = useState(true);
  const [addStaffModalOpen, setAddStaffModalOpen] = useState(false);
  const [editStaffModalOpen, setEditStaffModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  useEffect(() => {
    if (setHeaderDetails) {
      setHeaderDetails({
        title: user?.businessName?.toUpperCase() || 'MY STORE DASHBOARD',
        subtitle: null,
      });
    }
  }, [setHeaderDetails, user]);

  useEffect(() => {
    if (user) {
      setAccountInfo((prev) => ({
        ...prev,
        username: user.username || prev.username,
        email: user.email || prev.email,
      }));
    }
  }, [user]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // ── Fetch Staff List ────────────────────────────────────────────────────────
  const fetchStaff = useCallback(async () => {
    setStaffLoading(true);
    setErrorMessage('');
    try {
      const { ok, data } = await apiFetchJson('/staff');
      if (ok && data.staff) {
        setStaffList(data.staff);
      } else {
        setErrorMessage(data.message || 'Failed to load staff list');
      }
    } catch {
      setErrorMessage('Network error loading staff accounts');
    } finally {
      setStaffLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  // ── Owner Profile Handlers ──────────────────────────────────────────────────
  const handleEditClick = (actionType) => {
    setPendingAction(actionType);
    setVerifyPasswordModalOpen(true);
  };

  const handlePasswordVerified = () => {
    setVerifyPasswordModalOpen(false);
    if (pendingAction === 'username') setChangeUsernameModalOpen(true);
    else if (pendingAction === 'email') setChangeEmailModalOpen(true);
    else if (pendingAction === 'password') setChangePasswordModalOpen(true);
  };

  const handleSaveUsername = (newUsername) => {
    setAccountInfo((prev) => ({ ...prev, username: newUsername }));
    if (updateUser) updateUser({ ...user, username: newUsername });
    setChangeUsernameModalOpen(false);
    showToast('Username updated successfully!');
  };

  const handleSaveEmail = (newEmail) => {
    setAccountInfo((prev) => ({ ...prev, email: newEmail }));
    if (updateUser) updateUser({ ...user, email: newEmail });
    setChangeEmailModalOpen(false);
    showToast('Email updated successfully!');
  };

  const handleSavePassword = () => {
    setChangePasswordModalOpen(false);
    showToast('Password updated successfully!');
  };

  // ── Staff Management API Handlers ───────────────────────────────────────────
  const handleCreateStaff = async (staffData) => {
    const { ok, data } = await apiFetchJson('/staff', {
      method: 'POST',
      body: JSON.stringify(staffData),
    });

    if (!ok) {
      throw new Error(data.message || 'Failed to create staff account');
    }

    showToast('Staff member created successfully!');
    fetchStaff();
  };

  const handleUpdateStaff = async (staffId, staffData) => {
    const { ok, data } = await apiFetchJson(`/staff/${staffId}`, {
      method: 'PUT',
      body: JSON.stringify(staffData),
    });

    if (!ok) {
      throw new Error(data.message || 'Failed to update staff account');
    }

    showToast('Staff details updated!');
    fetchStaff();
  };

  const handleDeleteStaff = async (staffId, username) => {
    if (!window.confirm(`Are you sure you want to remove ${username}?`)) return;

    const { ok, data } = await apiFetchJson(`/staff/${staffId}`, {
      method: 'DELETE',
    });

    if (!ok) {
      showToast(data.message || 'Failed to remove staff member');
      return;
    }

    showToast(`Staff member ${username} removed!`);
    fetchStaff();
  };

  return (
    <div className="flex flex-col gap-8 w-full pb-12">
      {/* ── Page Header ── */}
      <div>
        <h1 className="text-3xl lg:text-4xl font-black text-[#0c3818] tracking-tight uppercase">
          PROFILE & USER MANAGEMENT
        </h1>
        <p className="text-base sm:text-lg font-bold text-[#607455] mt-1">
          Manage your owner account and cashier staff members
        </p>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-[#10b981] text-white px-5 py-3 rounded-xl font-black text-sm flex items-center gap-2.5 shadow-md animate-in fade-in slide-in-from-top-2 duration-200 max-w-md">
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-2.5 shadow-xs max-w-md">
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ── Owner Account Information Card ── */}
      <div className="w-full max-w-4xl border-2 border-[#0c3818]/25 rounded-2xl md:rounded-3xl bg-[#f9f7ea]/90 backdrop-blur-xs shadow-xs overflow-hidden">
        <div className="bg-[#efeacb]/60 border-b border-[#0c3818]/15 py-4 px-6 flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-black text-[#0c3818] tracking-wider uppercase">
            OWNER ACCOUNT INFORMATION
          </h2>
          <span className="bg-[#0c3818]/10 text-[#0c3818] px-3 py-1 rounded-full text-xs font-black uppercase">
            ADMIN OWNER
          </span>
        </div>

        <div className="divide-y divide-[#0c3818]/15 text-sm sm:text-base font-bold text-[#0c3818]">
          {/* Username */}
          <div className="p-5 sm:p-6 flex items-center justify-between gap-4 hover:bg-[#efeacb]/30 transition">
            <span className="w-32 sm:w-48 font-bold text-[#0c3818]/80 shrink-0">Username</span>
            <span className="flex-1 font-black text-[#0c3818]">{accountInfo.username}</span>
            <button
              onClick={() => handleEditClick('username')}
              className="p-2 sm:p-2.5 bg-[#fde8e4] text-[#8b1e10] hover:bg-[#fbd3cb] border border-[#f8b4ab] rounded-xl transition duration-150 cursor-pointer shadow-xs active:scale-95 shrink-0"
              title="Edit Username"
            >
              <SquarePen size={18} className="stroke-[2.2]" />
            </button>
          </div>

          {/* Email */}
          <div className="p-5 sm:p-6 flex items-center justify-between gap-4 hover:bg-[#efeacb]/30 transition">
            <span className="w-32 sm:w-48 font-bold text-[#0c3818]/80 shrink-0">Email</span>
            <span className="flex-1 font-black text-[#0c3818] truncate">{accountInfo.email}</span>
            <button
              onClick={() => handleEditClick('email')}
              className="p-2 sm:p-2.5 bg-[#fde8e4] text-[#8b1e10] hover:bg-[#fbd3cb] border border-[#f8b4ab] rounded-xl transition duration-150 cursor-pointer shadow-xs active:scale-95 shrink-0"
              title="Edit Email"
            >
              <SquarePen size={18} className="stroke-[2.2]" />
            </button>
          </div>

          {/* Password */}
          <div className="p-5 sm:p-6 flex items-center justify-between gap-4 hover:bg-[#efeacb]/30 transition">
            <span className="w-32 sm:w-48 font-bold text-[#0c3818]/80 shrink-0">Password</span>
            <span className="flex-1 font-black text-[#0c3818] tracking-widest">••••••••</span>
            <button
              onClick={() => handleEditClick('password')}
              className="p-2 sm:p-2.5 bg-[#fde8e4] text-[#8b1e10] hover:bg-[#fbd3cb] border border-[#f8b4ab] rounded-xl transition duration-150 cursor-pointer shadow-xs active:scale-95 shrink-0"
              title="Change Password"
            >
              <SquarePen size={18} className="stroke-[2.2]" />
            </button>
          </div>

          {/* Last Login */}
          <div className="p-5 sm:p-6 flex items-center justify-between gap-4 hover:bg-[#efeacb]/30 transition">
            <span className="w-32 sm:w-48 font-bold text-[#0c3818]/80 shrink-0">Last Login</span>
            <span className="flex-1 font-black text-[#0c3818]">{accountInfo.lastLogin}</span>
            <div className="w-10 sm:w-11 shrink-0" />
          </div>
        </div>
      </div>

      {/* ── STORE STAFF & CASHIERS SECTION (Phase 1 Integration) ── */}
      <div className="w-full max-w-4xl border-2 border-[#0c3818]/25 rounded-2xl md:rounded-3xl bg-[#f9f7ea]/90 backdrop-blur-xs shadow-xs overflow-hidden">
        <div className="bg-[#efeacb]/60 border-b border-[#0c3818]/15 p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0c3818] text-[#eef6ec] rounded-xl">
              <Users size={20} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-[#0c3818] tracking-wider uppercase">
                STORE STAFF & CASHIERS
              </h2>
              <p className="text-xs font-bold text-[#607455]">
                Manage cashier terminal logins for your business
              </p>
            </div>
          </div>

          <button
            onClick={() => setAddStaffModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#0c3818] text-[#eef6ec] hover:bg-[#155227] font-black text-xs uppercase tracking-wider rounded-xl transition shadow-xs active:scale-95 cursor-pointer"
          >
            <UserPlus size={16} />
            <span>Add Staff Member</span>
          </button>
        </div>

        {/* Staff Table */}
        <div className="p-4 sm:p-6 overflow-x-auto">
          {staffLoading ? (
            <div className="text-center py-8 text-sm font-bold text-[#607455]">
              Loading staff accounts...
            </div>
          ) : staffList.length === 0 ? (
            <div className="text-center py-10 bg-[#efeacb]/30 rounded-2xl border border-dashed border-[#0c3818]/20 p-6 flex flex-col items-center gap-2">
              <ShieldCheck size={36} className="text-[#0c3818]/40" />
              <p className="text-sm font-black text-[#0c3818]">No staff accounts created yet</p>
              <p className="text-xs font-bold text-[#607455]">
                Click "Add Staff Member" to create a cashier account for your POS terminal.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#0c3818]/15 text-xs font-black text-[#0c3818]/70 uppercase tracking-wider">
                  <th className="pb-3 px-3">Username</th>
                  <th className="pb-3 px-3">Email</th>
                  <th className="pb-3 px-3">Phone</th>
                  <th className="pb-3 px-3">Role</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0c3818]/10 text-xs sm:text-sm font-bold text-[#0c3818]">
                {staffList.map((staff) => (
                  <tr key={staff.id} className="hover:bg-[#efeacb]/40 transition">
                    <td className="py-3.5 px-3 font-black text-[#0c3818]">{staff.username}</td>
                    <td className="py-3.5 px-3">{staff.email}</td>
                    <td className="py-3.5 px-3">{staff.phone || '—'}</td>
                    <td className="py-3.5 px-3">
                      <span className="bg-[#0c3818]/10 text-[#0c3818] px-2.5 py-1 rounded-md text-[11px] font-black uppercase">
                        Cashier Staff
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[11px] font-black uppercase ${
                          staff.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {staff.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedStaff(staff);
                            setEditStaffModalOpen(true);
                          }}
                          className="p-1.5 bg-[#efeacb] text-[#0c3818] hover:bg-[#e2dbaa] rounded-lg transition cursor-pointer"
                          title="Edit Staff"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteStaff(staff.id, staff.username)}
                          className="p-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition cursor-pointer"
                          title="Delete Staff"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      <AdminPasswordVerifyModal
        isOpen={verifyPasswordModalOpen}
        onClose={() => setVerifyPasswordModalOpen(false)}
        onSuccess={handlePasswordVerified}
      />

      <AdminChangeUsernameModal
        isOpen={changeUsernameModalOpen}
        onClose={() => setChangeUsernameModalOpen(false)}
        onSave={handleSaveUsername}
        currentUsername={accountInfo.username}
      />

      <AdminChangeEmailModal
        isOpen={changeEmailModalOpen}
        onClose={() => setChangeEmailModalOpen(false)}
        onSave={handleSaveEmail}
        currentEmail={accountInfo.email}
      />

      <AdminChangePasswordModal
        isOpen={changePasswordModalOpen}
        onClose={() => setChangePasswordModalOpen(false)}
        onSave={handleSavePassword}
      />

      {/* Phase 1 Integration Modals */}
      <AddStaffModal
        isOpen={addStaffModalOpen}
        onClose={() => setAddStaffModalOpen(false)}
        onSave={handleCreateStaff}
      />

      <EditStaffModal
        isOpen={editStaffModalOpen}
        onClose={() => {
          setEditStaffModalOpen(false);
          setSelectedStaff(null);
        }}
        onSave={handleUpdateStaff}
        staff={selectedStaff}
      />
    </div>
  );
}
