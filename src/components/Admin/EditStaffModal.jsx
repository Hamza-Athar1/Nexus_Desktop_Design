import React, { useState, useEffect } from 'react';
import { X, Edit2 } from 'lucide-react';

export default function EditStaffModal({ isOpen, onClose, onSave, staff }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('active');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (staff) {
      setUsername(staff.username || '');
      setEmail(staff.email || '');
      setPhone(staff.phone || '');
      setStatus(staff.status || 'active');
    }
  }, [staff]);

  if (!isOpen || !staff) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanPhone = phone.trim().replace(/[\s-]/g, '');
    if (!cleanPhone || !/^\d{11}$/.test(cleanPhone)) {
      setError('Phone number must be exactly 11 digits (e.g. 03001234567).');
      return;
    }

    try {
      setLoading(true);
      await onSave(staff.id, {
        username: username.trim(),
        email: email.trim(),
        phone: cleanPhone,
        status,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update staff account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-[#fbf9f0] border border-[#0c3818]/20 rounded-3xl w-full max-w-md p-6 sm:p-7 shadow-2xl relative flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Close Icon Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 p-1 rounded-full text-[#0c3818]/60 hover:text-[#0c3818] hover:bg-[#efeacb] transition cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pr-6">
          <div className="p-2.5 bg-[#0c3818]/10 text-[#0c3818] rounded-xl">
            <Edit2 size={20} />
          </div>
          <div>
            <h3 className="text-xl font-black text-[#0c3818]">Edit Staff Member</h3>
            <p className="text-xs font-bold text-[#607455]">Update details for {staff.username}</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 text-xs font-bold p-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-[#0c3818]">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#0c3818]/20 bg-white font-bold text-[#0c3818] text-sm focus:outline-hidden focus:border-[#0c3818]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-[#0c3818]">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#0c3818]/20 bg-white font-bold text-[#0c3818] text-sm focus:outline-hidden focus:border-[#0c3818]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-[#0c3818]">
              Phone Number<span className="text-red-500 ml-0.5">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={13}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 03001234567"
              className="w-full px-4 py-2.5 rounded-xl border border-[#0c3818]/20 bg-white font-bold text-[#0c3818] text-sm focus:outline-hidden focus:border-[#0c3818]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-[#0c3818]">Account Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#0c3818]/20 bg-white font-bold text-[#0c3818] text-sm focus:outline-hidden focus:border-[#0c3818]"
            >
              <option value="active">Active</option>
              <option value="suspended">Suspended / Inactive</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-black text-[#0c3818]/70 hover:bg-[#efeacb] transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-xs font-black bg-[#0c3818] text-[#eef6ec] hover:bg-[#155227] transition shadow-xs active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
