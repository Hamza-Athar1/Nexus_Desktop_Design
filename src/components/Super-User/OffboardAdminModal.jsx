import React, { useState } from 'react';

export default function OffboardAdminModal({ isOpen, admin, onClose, onConfirm }) {
  const [reason, setReason] = useState('Resigned');
  const [note, setNote] = useState('');
  const [signOutDevices, setSignOutDevices] = useState(true);

  if (!isOpen || !admin) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(admin.id, { reason, note, signOutDevices });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />

      {/* Modal Card Container */}
      <form
        onSubmit={handleSubmit}
        className="relative bg-[#ece5c8] rounded-[24px] border border-[#14391a]/15 p-8 w-full max-w-[480px] shadow-2xl flex flex-col text-[#14391a] gap-4.5 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto"
      >
        <div>
          <h3 className="text-3xl font-black tracking-tight text-[#14391a] leading-none mb-2">
            Offboard {admin.name}
          </h3>
          <p className="text-[13px] font-bold text-[#14391a]/85 leading-relaxed">
            This revokes every form of access this admin had to the portal. A new invite would be required to restore it.
          </p>
        </div>

        {/* Reason Field */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-extrabold text-[#14391a]">Reason</label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full bg-[#fdfce8]/90 border border-[#14391a]/20 rounded-xl px-4 py-3 text-sm text-[#14391a] font-extrabold outline-none focus:ring-1 focus:ring-[#14391a]/30"
            required
          />
        </div>

        {/* Audit Log Note */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-extrabold text-[#14391a]">
            Note for the audit log <span className="font-bold text-[#14391a]/60">(Optional)</span>
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="w-full bg-[#fdfce8]/90 border border-[#14391a]/20 rounded-xl px-4 py-3 text-sm text-[#14391a] font-extrabold outline-none resize-none focus:ring-1 focus:ring-[#14391a]/30"
          />
        </div>

        {/* Checkbox Trigger */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={signOutDevices}
            onChange={(e) => setSignOutDevices(e.target.checked)}
            className="w-5 h-5 rounded border-[#14391a]/20 accent-[#113819]"
          />
          <span className="text-[13px] font-bold text-[#14391a]/85">
            Sign this admin out of all devices after this change
          </span>
        </label>

        {/* Revocation Checklist Box */}
        <div className="bg-[#fbf9f0]/45 border border-[#14391a]/15 rounded-xl p-4.5 flex flex-col gap-3">
          <div className="text-sm font-black text-[#14391a]">Revocation checklist</div>
          
          <ul className="flex flex-col gap-2.5 text-[13px] font-extrabold text-[#14391a]/90">
            <li className="flex items-center gap-3">
              <span className="flex items-center justify-center w-5 h-5 rounded-md bg-[#113819] text-white text-[10px] font-black">1</span>
              <span>Revoke admin portal access</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="flex items-center justify-center w-5 h-5 rounded-md bg-[#113819] text-white text-[10px] font-black">2</span>
              <span>End all active sessions</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="flex items-center justify-center w-5 h-5 rounded-md bg-[#113819] text-white text-[10px] font-black">3</span>
              <span>Reset and lock password</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="flex items-center justify-center w-5 h-5 rounded-md bg-[#113819] text-white text-[10px] font-black">4</span>
              <span>Disable email and forwarding</span>
            </li>
          </ul>

          <button
            type="submit"
            className="w-full mt-2.5 py-3.5 bg-[#99221b] hover:bg-[#b02c24] text-white text-sm font-extrabold rounded-xl shadow-sm transition active:scale-95 cursor-pointer text-center"
          >
            Confirm offboarding - revoke all access
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3.5 bg-[#fdfce8]/90 border border-[#14391a]/40 text-[#14391a] text-sm font-extrabold rounded-xl hover:bg-white active:scale-95 transition cursor-pointer text-center"
        >
          Cancel
        </button>
      </form>
    </div>
  );
}
