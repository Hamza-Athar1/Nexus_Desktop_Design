import React, { useState } from 'react';

export default function ChangeEmailModal({ isOpen, currentEmail, onClose, onSave }) {
  const [newEmail, setNewEmail] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes('@')) {
      alert('Please enter a valid email address!');
      return;
    }
    onSave(newEmail);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />

      {/* Modal Card Container */}
      <form
        onSubmit={handleSubmit}
        className="relative bg-[#ece5c8] rounded-[24px] border border-[#14391a]/15 p-8 w-full max-w-[450px] shadow-2xl flex flex-col text-[#14391a] gap-5 animate-in fade-in zoom-in duration-200"
      >
        <div>
          <h3 className="text-3xl font-black tracking-tight text-[#14391a] leading-none mb-1">
            Change Email
          </h3>
          <p className="text-sm font-bold text-[#14391a]/70 mt-2">
            Current: {currentEmail}
          </p>
        </div>

        {/* Input field */}
        <div className="flex flex-col gap-2.5">
          <label className="text-sm font-extrabold text-[#14391a]">New email address</label>
          <input
            type="email"
            placeholder="name@nexus.com"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="w-full bg-[#fdfce8]/90 border border-[#14391a]/20 rounded-xl px-4 py-3 text-sm text-[#14391a] font-extrabold outline-none placeholder-[#14391a]/35 focus:ring-1 focus:ring-[#14391a]/30"
            required
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3.5 mt-2">
          <button
            type="submit"
            className="px-5 py-3.5 bg-[#113819] hover:bg-[#14391a] text-white text-sm font-extrabold rounded-xl transition cursor-pointer"
          >
            Save new email
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
