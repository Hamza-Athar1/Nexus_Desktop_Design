import React, { useState } from 'react';

export default function ChangePasswordModal({ isOpen, onClose, onSave }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [signOutDevices, setSignOutDevices] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) {
      alert('Passwords do not match or are empty!');
      return;
    }
    onSave(newPassword, signOutDevices);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />

      {/* Modal Card */}
      <form
        onSubmit={handleSubmit}
        className="relative bg-[#ece5c8] rounded-[24px] border border-[#14391a]/15 p-8 w-full max-w-[450px] shadow-2xl flex flex-col text-[#14391a] gap-5 animate-in fade-in zoom-in duration-200"
      >
        <h3 className="text-3xl font-black tracking-tight text-[#14391a] leading-none mb-1">
          Change Password
        </h3>

        {/* New Password */}
        <div className="flex flex-col gap-2.5">
          <label className="text-sm font-extrabold text-[#14391a]">New password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full bg-[#d9dcae]/50 border border-[#14391a]/20 rounded-xl px-4 py-3 text-sm text-[#14391a] font-extrabold outline-none focus:ring-1 focus:ring-[#14391a]/30"
            required
          />
        </div>

        {/* Confirm Password */}
        <div className="flex flex-col gap-2.5">
          <label className="text-sm font-extrabold text-[#14391a]">Confirm password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-[#d9dcae]/50 border border-[#14391a]/20 rounded-xl px-4 py-3 text-sm text-[#14391a] font-extrabold outline-none focus:ring-1 focus:ring-[#14391a]/30"
            required
          />
        </div>

        {/* Signout Checkbox */}
        <label className="flex items-center gap-3 cursor-pointer mt-1">
          <input
            type="checkbox"
            checked={signOutDevices}
            onChange={(e) => setSignOutDevices(e.target.checked)}
            className="w-5 h-5 rounded border-[#14391a]/20 bg-[#113819] text-[#ece5c8] accent-[#113819]"
          />
          <span className="text-[13px] font-bold text-[#14391a]/85">
            Sign this admin out of all devices after this change
          </span>
        </label>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3.5 mt-3">
          <button
            type="submit"
            className="px-5 py-3.5 bg-[#113819] hover:bg-[#14391a] text-white text-sm font-extrabold rounded-xl transition cursor-pointer"
          >
            Save new password
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3.5 bg-[#fdfce8]/90 border border-[#14391a]/40 text-[#14391a] text-sm font-extrabold rounded-xl hover:bg-white active:scale-95 transition cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
