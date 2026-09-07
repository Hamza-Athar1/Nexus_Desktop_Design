import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function AdminChangeEmailModal({ isOpen, onClose, onSave, currentEmail }) {
  const [newEmail, setNewEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newEmail.trim()) {
      setError('Please enter a new email.');
      return;
    }
    if (newEmail !== confirmEmail) {
      setError('Emails do not match.');
      return;
    }
    if (newEmail === currentEmail) {
      setError('New email cannot be the same as current email.');
      return;
    }

    setError('');
    onSave(newEmail.trim());
    setNewEmail('');
    setConfirmEmail('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#efeacb] border-2 border-[#0c3818]/30 rounded-2xl md:rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative flex flex-col gap-6">
        
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
            Change Email
          </h2>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* New Email */}
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs font-bold text-[#0c3818]">
              New Email
            </label>
            <input
              type="email"
              placeholder="Enter your new email"
              value={newEmail}
              onChange={(e) => {
                setNewEmail(e.target.value);
                if (error) setError('');
              }}
              className="w-full bg-white border border-[#0c3818]/30 rounded-xl px-4 py-3 text-sm font-bold text-[#0c3818] placeholder-[#607455]/70 focus:outline-none focus:border-[#0c3818] shadow-xs transition"
              autoFocus
            />
          </div>

          {/* Confirm New Email */}
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs font-bold text-[#0c3818]">
              Confirm New Email
            </label>
            <input
              type="email"
              placeholder="Enter confirm email"
              value={confirmEmail}
              onChange={(e) => {
                setConfirmEmail(e.target.value);
                if (error) setError('');
              }}
              className="w-full bg-white border border-[#0c3818]/30 rounded-xl px-4 py-3 text-sm font-bold text-[#0c3818] placeholder-[#607455]/70 focus:outline-none focus:border-[#0c3818] shadow-xs transition"
            />
          </div>

          {error && (
            <p className="text-xs font-bold text-[#8b1e10] text-center">
              {error}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-[#0c3818] hover:bg-[#114720] text-[#efeacb] font-black text-base rounded-xl shadow-xs transition duration-150 cursor-pointer active:scale-95 mt-2"
          >
            Change
          </button>
        </form>
      </div>
    </div>
  );
}
