import React, { useState } from 'react';
import { X, UserPlus, Eye, EyeOff } from 'lucide-react';

export default function AddStaffModal({ isOpen, onClose, onSave }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password || !confirmPassword) {
      setError('Username, password, and confirmation are required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Password and confirmation password do not match.');
      return;
    }

    try {
      setLoading(true);
      // Auto-generate fallback email/phone if backend schema requires non-null
      const cleanUsername = username.trim().toLowerCase();
      await onSave({
        username: username.trim(),
        email: `${cleanUsername}@staff.local`,
        phone: '03000000000',
        password,
      });

      // Reset and close
      setUsername('');
      setPassword('');
      setConfirmPassword('');
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
              Password<span className="text-red-500 ml-0.5">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-4 py-2.5 pr-10 rounded-xl border border-[#0c3818]/20 bg-white font-bold text-[#0c3818] text-sm focus:outline-hidden focus:border-[#0c3818]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0c3818]/50 hover:text-[#0c3818] cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-[#0c3818]">
              Confirm Password<span className="text-red-500 ml-0.5">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full px-4 py-2.5 pr-10 rounded-xl border border-[#0c3818]/20 bg-white font-bold text-[#0c3818] text-sm focus:outline-hidden focus:border-[#0c3818]"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0c3818]/50 hover:text-[#0c3818] cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
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
