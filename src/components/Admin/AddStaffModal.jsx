import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';

export default function AddStaffModal({ isOpen, onClose, onSave }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !email.trim() || !password) {
      setError('Username, email, and password are required.');
      return;
    }
    const cleanPhone = phone.trim().replace(/[\s-]/g, '');
    if (!cleanPhone || !/^\d{11}$/.test(cleanPhone)) {
      setError('Phone number must be exactly 11 digits (e.g. 03001234567).');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      await onSave({
        username: username.trim(),
        email: email.trim(),
        phone: cleanPhone,
        password,
      });

      // Reset and close
      setUsername('');
      setEmail('');
      setPhone('');
      setPassword('');
      setError('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create staff account');
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
            <UserPlus size={22} />
          </div>
          <div>
            <h3 className="text-xl font-black text-[#0c3818]">Add Staff Member</h3>
            <p className="text-xs font-bold text-[#607455]">Create a new cashier account</p>
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
            <label className="text-xs font-black text-[#0c3818]">
              Username<span className="text-red-500 ml-0.5">*</span>
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. cashier_john"
              className="w-full px-4 py-2.5 rounded-xl border border-[#0c3818]/20 bg-white font-bold text-[#0c3818] text-sm focus:outline-hidden focus:border-[#0c3818]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-[#0c3818]">
              Email Address<span className="text-red-500 ml-0.5">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
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
            <label className="text-xs font-black text-[#0c3818]">
              Password<span className="text-red-500 ml-0.5">*</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full px-4 py-2.5 rounded-xl border border-[#0c3818]/20 bg-white font-bold text-[#0c3818] text-sm focus:outline-hidden focus:border-[#0c3818]"
            />
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
              {loading ? 'Creating...' : 'Create Staff Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
