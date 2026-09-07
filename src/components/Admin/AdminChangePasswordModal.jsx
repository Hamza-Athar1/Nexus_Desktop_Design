import React, { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';

export default function AdminChangePasswordModal({ isOpen, onClose, onSave }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!oldPassword) {
      setError('Please enter your old password.');
      return;
    }
    if (!newPassword) {
      setError('Please enter your new password.');
      return;
    }
    if (newPassword.length < 8 || newPassword.length > 20) {
      setError('Password must be 8 to 20 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (newPassword === oldPassword) {
      setError('New password cannot match old password.');
      return;
    }

    setError('');
    onSave({ oldPassword, newPassword });
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#efeacb] border-2 border-[#0c3818]/30 rounded-2xl md:rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative flex flex-col gap-5">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#0c3818]/70 hover:text-[#0c3818] p-1.5 rounded-full hover:bg-black/5 transition cursor-pointer"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-black text-[#8b1e10] tracking-tight">
            Change Password
          </h2>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Old Password */}
          <div className="flex flex-col gap-1 text-left">
            <label className="text-xs font-bold text-[#0c3818]">
              Old Password
            </label>
            <div className="relative">
              <input
                type={showOld ? 'text' : 'password'}
                placeholder="Enter Old password"
                value={oldPassword}
                onChange={(e) => {
                  setOldPassword(e.target.value);
                  if (error) setError('');
                }}
                className="w-full bg-white border border-[#0c3818]/30 rounded-xl px-4 py-2.5 pr-11 text-sm font-bold text-[#0c3818] placeholder-[#607455]/70 focus:outline-none focus:border-[#0c3818] shadow-xs transition"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowOld(!showOld)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0c3818]/60 hover:text-[#0c3818] p-1 transition cursor-pointer"
              >
                {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="flex flex-col gap-1 text-left">
            <label className="text-xs font-bold text-[#0c3818]">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (error) setError('');
                }}
                className="w-full bg-white border border-[#0c3818]/30 rounded-xl px-4 py-2.5 pr-11 text-sm font-bold text-[#0c3818] placeholder-[#607455]/70 focus:outline-none focus:border-[#0c3818] shadow-xs transition"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0c3818]/60 hover:text-[#0c3818] p-1 transition cursor-pointer"
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div className="flex flex-col gap-1 text-left">
            <label className="text-xs font-bold text-[#0c3818]">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="Enter confirm password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error) setError('');
                }}
                className="w-full bg-white border border-[#0c3818]/30 rounded-xl px-4 py-2.5 pr-11 text-sm font-bold text-[#0c3818] placeholder-[#607455]/70 focus:outline-none focus:border-[#0c3818] shadow-xs transition"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0c3818]/60 hover:text-[#0c3818] p-1 transition cursor-pointer"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Password Format Alert Box matching Screenshot 4 */}
          <div className="bg-[#fde8e4] text-[#8b1e10] border border-[#f8b4ab] p-3 sm:p-3.5 rounded-xl text-xs font-bold text-left flex flex-col gap-1">
            <span className="font-extrabold underline">Password format:</span>
            <span>• 8 to 20 characters long</span>
            <span>• Contain at least one number or special character</span>
            <span>• Not match username or current password</span>
          </div>

          {error && (
            <p className="text-xs font-bold text-[#8b1e10] text-center">
              {error}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-[#0c3818] hover:bg-[#114720] text-[#efeacb] font-black text-base rounded-xl shadow-xs transition duration-150 cursor-pointer active:scale-95 mt-1"
          >
            Change
          </button>
        </form>
      </div>
    </div>
  );
}
