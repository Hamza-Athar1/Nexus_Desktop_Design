import React, { useState } from 'react';
import { X, Lock, Eye, EyeOff } from 'lucide-react';

export default function AdminPasswordVerifyModal({ isOpen, onClose, onSuccess }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter your current password.');
      return;
    }
    setError('');
    // Call success handler passing the verified password
    onSuccess(password);
    setPassword('');
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
        <div className="flex items-center justify-center gap-2 text-center">
          <Lock className="text-[#0c3818] w-6 h-6 stroke-[2.5]" />
          <h2 className="text-xl sm:text-2xl font-black text-[#0c3818] tracking-tight">
            Password
          </h2>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError('');
              }}
              className="w-full bg-white border border-[#0c3818]/30 rounded-xl px-4 py-3 pr-11 text-sm font-bold text-[#0c3818] placeholder-[#607455]/70 focus:outline-none focus:border-[#0c3818] shadow-xs transition"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0c3818]/60 hover:text-[#0c3818] p-1 transition cursor-pointer"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
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
            Enter
          </button>
        </form>
      </div>
    </div>
  );
}
