import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { SquarePen, CheckCircle2 } from 'lucide-react';
import AdminPasswordVerifyModal from '../../components/Admin/AdminPasswordVerifyModal';
import AdminChangeUsernameModal from '../../components/Admin/AdminChangeUsernameModal';
import AdminChangeEmailModal from '../../components/Admin/AdminChangeEmailModal';
import AdminChangePasswordModal from '../../components/Admin/AdminChangePasswordModal';

export default function AdminUserPage() {
  const { setHeaderDetails } = useOutletContext() || {};
  const { user, updateUser } = useAuth();

  const [accountInfo, setAccountInfo] = useState({
    username: user?.username || 'Admin',
    email: user?.email || 'admin@gmail.com',
    lastLogin: '23 aug 2026 10:15 AM',
  });

  const [toastMessage, setToastMessage] = useState('');

  // Modal visibility states
  const [verifyPasswordModalOpen, setVerifyPasswordModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // 'username' | 'email' | 'password'

  const [changeUsernameModalOpen, setChangeUsernameModalOpen] = useState(false);
  const [changeEmailModalOpen, setChangeEmailModalOpen] = useState(false);
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);

  useEffect(() => {
    if (setHeaderDetails) {
      setHeaderDetails({
        title: user?.businessName?.toUpperCase() || 'IMTIAZ SUPER MARKET',
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

  // Click handler for edit buttons
  const handleEditClick = (actionType) => {
    setPendingAction(actionType);
    setVerifyPasswordModalOpen(true);
  };

  // Password verification success handler
  const handlePasswordVerified = () => {
    setVerifyPasswordModalOpen(false);
    if (pendingAction === 'username') {
      setChangeUsernameModalOpen(true);
    } else if (pendingAction === 'email') {
      setChangeEmailModalOpen(true);
    } else if (pendingAction === 'password') {
      setChangePasswordModalOpen(true);
    }
  };

  // Save Handlers
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

  return (
    <div className="flex flex-col gap-6 w-full pb-12">
      {/* ── Page Header ── */}
      <div>
        <h1 className="text-3xl lg:text-4xl font-black text-[#0c3818] tracking-tight uppercase">
          PROFILE
        </h1>
        <p className="text-base sm:text-lg font-bold text-[#607455] mt-1">
          View and manage your account information
        </p>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-[#10b981] text-white px-5 py-3 rounded-xl font-black text-sm flex items-center gap-2.5 shadow-md animate-in fade-in slide-in-from-top-2 duration-200 max-w-md">
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Main Account Information Card ── */}
      <div className="w-full max-w-4xl mx-auto border-2 border-[#0c3818]/25 rounded-2xl md:rounded-3xl bg-[#f9f7ea]/90 backdrop-blur-xs shadow-xs overflow-hidden">
        {/* Card Header Title */}
        <div className="bg-[#efeacb]/60 border-b border-[#0c3818]/15 py-4 px-6 text-center">
          <h2 className="text-lg sm:text-xl font-black text-[#0c3818] tracking-wider uppercase">
            ACCOUNT INFORMATION
          </h2>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-[#0c3818]/15 text-sm sm:text-base font-bold text-[#0c3818]">
          {/* Row 1: Username */}
          <div className="p-5 sm:p-6 flex items-center justify-between gap-4 hover:bg-[#efeacb]/30 transition">
            <span className="w-32 sm:w-48 font-bold text-[#0c3818]/80 shrink-0">
              Username
            </span>
            <span className="flex-1 font-black text-[#0c3818]">
              {accountInfo.username}
            </span>
            <button
              onClick={() => handleEditClick('username')}
              className="p-2 sm:p-2.5 bg-[#fde8e4] text-[#8b1e10] hover:bg-[#fbd3cb] border border-[#f8b4ab] rounded-xl transition duration-150 cursor-pointer shadow-xs active:scale-95 shrink-0"
              title="Edit Username"
            >
              <SquarePen size={18} className="stroke-[2.2]" />
            </button>
          </div>

          {/* Row 2: Email */}
          <div className="p-5 sm:p-6 flex items-center justify-between gap-4 hover:bg-[#efeacb]/30 transition">
            <span className="w-32 sm:w-48 font-bold text-[#0c3818]/80 shrink-0">
              Email
            </span>
            <span className="flex-1 font-black text-[#0c3818] truncate">
              {accountInfo.email}
            </span>
            <button
              onClick={() => handleEditClick('email')}
              className="p-2 sm:p-2.5 bg-[#fde8e4] text-[#8b1e10] hover:bg-[#fbd3cb] border border-[#f8b4ab] rounded-xl transition duration-150 cursor-pointer shadow-xs active:scale-95 shrink-0"
              title="Edit Email"
            >
              <SquarePen size={18} className="stroke-[2.2]" />
            </button>
          </div>

          {/* Row 3: Password */}
          <div className="p-5 sm:p-6 flex items-center justify-between gap-4 hover:bg-[#efeacb]/30 transition">
            <span className="w-32 sm:w-48 font-bold text-[#0c3818]/80 shrink-0">
              Password
            </span>
            <span className="flex-1 font-black text-[#0c3818] tracking-widest">
              ••••••••
            </span>
            <button
              onClick={() => handleEditClick('password')}
              className="p-2 sm:p-2.5 bg-[#fde8e4] text-[#8b1e10] hover:bg-[#fbd3cb] border border-[#f8b4ab] rounded-xl transition duration-150 cursor-pointer shadow-xs active:scale-95 shrink-0"
              title="Change Password"
            >
              <SquarePen size={18} className="stroke-[2.2]" />
            </button>
          </div>

          {/* Row 4: Last Login */}
          <div className="p-5 sm:p-6 flex items-center justify-between gap-4 hover:bg-[#efeacb]/30 transition">
            <span className="w-32 sm:w-48 font-bold text-[#0c3818]/80 shrink-0">
              Last Login
            </span>
            <span className="flex-1 font-black text-[#0c3818]">
              {accountInfo.lastLogin}
            </span>
            {/* Readonly space spacer */}
            <div className="w-10 sm:w-11 shrink-0" />
          </div>
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
    </div>
  );
}
