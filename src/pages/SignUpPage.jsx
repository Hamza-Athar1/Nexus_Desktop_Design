import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { apiFetchJson } from '../lib/api';
import { GoogleLogin } from '@react-oauth/google';

export default function SignUpPage() {
  const navigate = useNavigate();

  // Form state
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    phoneNumber: '',
    city: '',
  });

  const [showPass, setShowPass] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | error | loading | success
  const [errorMsg, setErrorMsg] = useState('');

  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (status === 'error') {
      setStatus('idle');
      setErrorMsg('');
    }
  };

  const validate = () => {
    if (!form.username.trim()) return 'Username is required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) return 'A valid email is required';
    if (form.password.length < 6) return 'Password must be at least 6 characters';
    if (!form.phoneNumber.trim()) return 'Phone number is required';
    if (!form.city.trim()) return 'City/region is required';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setErrorMsg(err);
      setStatus('error');
      return;
    }

    setStatus('loading');

    try {
      // Map to expected backend fields (businessName, businessType)
      const { ok, data } = await apiFetchJson('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          username: form.username.trim(),
          email: form.email.trim(),
          password: form.password,
          businessName: form.username.trim() + " POS",
          businessType: "General",
        }),
      });

      if (!ok) {
        setErrorMsg(data.message || 'Something went wrong. Please try again.');
        setStatus('error');
        return;
      }

      setStatus('success');
      window.setTimeout(() => navigate('/register-business'), 2000);
    } catch {
      setErrorMsg('Unable to reach the server. Please try again.');
      setStatus('error');
    }
  };

  const handleGoogleSuccess = (credentialResponse) => {
    console.log('Google Sign Up Success:', credentialResponse);
    setStatus('loading');
    setTimeout(() => {
      setStatus('success');
      setTimeout(() => navigate('/register-business'), 2000);
    }, 1500);
  };

  const handleGoogleError = () => {
    console.log('Google Sign Up Failed');
    setErrorMsg('Google sign up failed. Please try again.');
    setStatus('error');
  };

  const isError = status === 'error';
  const isLoading = status === 'loading';

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row select-none">

      {/* Left Panel */}
      <div className="w-full md:w-1/2 flex-1 bg-[#e5dcba] flex flex-col justify-center items-center text-center px-6 py-12 sm:px-12 md:py-24 md:px-20 lg:px-28 xl:px-36 text-[#14391a] space-y-8 lg:space-y-12 xl:space-y-16">
        <div className="flex flex-col items-center space-y-6 lg:space-y-8 xl:space-y-10">
          <img
            src="/Nexus.png"
            alt="Nexus Logo"
            className="w-36 md:w-48 lg:w-64 xl:w-80 h-auto object-contain drop-shadow-sm transition-all duration-300"
          />
          <h1 className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-wide leading-none">
            NEXUS DESKTOP
          </h1>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight">
            Register your business
          </h2>
          <p className="text-sm md:text-lg lg:text-xl opacity-85 max-w-sm mx-auto">
            Tell us about you business to finish setting up
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full md:w-1/2 flex-1 bg-[#f4f2d3] flex flex-col justify-center px-6 py-12 sm:px-12 sm:py-16 md:py-24 md:px-20 lg:px-28 xl:px-36">
        <div className="max-w-md lg:max-w-lg xl:max-w-xl w-full mx-auto space-y-6 lg:space-y-10">

          {/* Header & Steps Indicator */}
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-[#14391a]">
              Account Details
            </h2>
            <p className="text-sm lg:text-base xl:text-lg text-[#14391a]/60">
              Get started in less than a minute
            </p>
          </div>

          {status === 'success' ? (
            <div className="flex flex-col items-center gap-3 text-center py-8">
              <span className="flex items-center justify-center w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-[#14391a] text-white animate-bounce">
                <svg width="30" height="30" className="lg:w-10 lg:h-10" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 13l4 4L19 7"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <p className="text-[20px] lg:text-[24px] font-bold text-[#14391a] mt-1">Account Created!</p>
              <p className="text-[13px] lg:text-[16px] text-[#14391a]/60">Redirecting to Login</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">

              {/* Error Banner */}
              {isError && (
                <div role="alert" className="px-4 py-2.5 rounded-lg bg-red-50 border border-red-200 text-xs lg:text-sm text-red-600 text-center font-medium">
                  {errorMsg}
                </div>
              )}

              {/* Username field */}
              <div className="space-y-1 lg:space-y-2">
                <label htmlFor="su-username" className="text-sm lg:text-base xl:text-lg font-bold text-[#14391a] block">
                  Username
                </label>
                <input
                  id="su-username"
                  type="text"
                  placeholder="e.g. greenleaf_admin"
                  value={form.username}
                  onChange={set('username')}
                  disabled={isLoading}
                  autoComplete="username"
                  className="w-full px-4 py-2.5 lg:py-3.5 rounded-lg bg-[#aab79d] text-[#14391a] placeholder-[#14391a]/50 lg:text-base xl:text-lg font-medium outline-none transition-all focus:ring-2 focus:ring-[#14391a]/30 border-none"
                />
              </div>

              {/* Email field */}
              <div className="space-y-1 lg:space-y-2">
                <label htmlFor="su-email" className="text-sm lg:text-base xl:text-lg font-bold text-[#14391a] block">
                  Email address
                </label>
                <input
                  id="su-email"
                  type="email"
                  placeholder="you@business.com"
                  value={form.email}
                  onChange={set('email')}
                  disabled={isLoading}
                  autoComplete="email"
                  className="w-full px-4 py-2.5 lg:py-3.5 rounded-lg bg-[#aab79d] text-[#14391a] placeholder-[#14391a]/50 lg:text-base xl:text-lg font-medium outline-none transition-all focus:ring-2 focus:ring-[#14391a]/30 border-none"
                />
              </div>

              {/* Password field */}
              <div className="space-y-1 lg:space-y-2">
                <label htmlFor="su-password" className="text-sm lg:text-base xl:text-lg font-bold text-[#14391a] block">
                  Password
                </label>
                <div className="relative flex items-center">
                  <input
                    id="su-password"
                    type={showPass ? 'text' : 'password'}
                    placeholder="At least 8 characters"
                    value={form.password}
                    onChange={set('password')}
                    disabled={isLoading}
                    autoComplete="new-password"
                    className="w-full px-4 py-2.5 lg:py-3.5 pr-10 rounded-lg bg-[#aab79d] text-[#14391a] placeholder-[#14391a]/50 lg:text-base xl:text-lg font-medium outline-none transition-all focus:ring-2 focus:ring-[#14391a]/30 border-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 text-[#14391a]/60 hover:text-[#14391a] transition-colors cursor-pointer bg-transparent border-none p-0 flex items-center"
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Phone number field */}
              <div className="space-y-1 lg:space-y-2">
                <label htmlFor="su-phone" className="text-sm lg:text-base xl:text-lg font-bold text-[#14391a] block">
                  Phone number
                </label>
                <input
                  id="su-phone"
                  type="number"
                  placeholder="03XX-XXXXXXX"
                  value={form.phoneNumber}
                  onChange={set('phoneNumber')}
                  disabled={isLoading}
                  className="w-full px-4 py-2.5 lg:py-3.5 rounded-lg bg-[#aab79d] text-[#14391a] placeholder-[#14391a]/50 lg:text-base xl:text-lg font-medium outline-none transition-all focus:ring-2 focus:ring-[#14391a]/30 border-none"
                />
              </div>

              {/* City/region field */}
              <div className="space-y-1 lg:space-y-2">
                <label htmlFor="su-city" className="text-sm lg:text-base xl:text-lg font-bold text-[#14391a] block">
                  City/region
                </label>
                <input
                  id="su-city"
                  type="text"
                  placeholder="e.g Sukkur,sindh"
                  value={form.city}
                  onChange={set('city')}
                  disabled={isLoading}
                  className="w-full px-4 py-2.5 lg:py-3.5 rounded-lg bg-[#aab79d] text-[#14391a] placeholder-[#14391a]/50 lg:text-base xl:text-lg font-medium outline-none transition-all focus:ring-2 focus:ring-[#14391a]/30 border-none"
                />
              </div>

              {/* CTA Buttons */}
              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  disabled={isLoading}
                  className="w-1/2 py-3 bg-[#e6e2b8] hover:bg-[#dcd8ae] text-[#14391a] text-sm lg:text-base font-bold rounded-lg border border-[#14391a]/15 shadow-sm active:scale-[0.99] transition-all duration-200 cursor-pointer"
                >
                  Save draft
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-1/2 py-3 bg-[#14391a] hover:bg-[#0f2a13] text-white text-sm lg:text-base font-bold rounded-lg shadow-md active:scale-[0.99] transition-all duration-200 cursor-pointer"
                >
                  Continue
                </button>
              </div>

              {/* Social Signup section */}
              <div className="space-y-3 pt-2">
                <div className="text-center text-[11px] lg:text-xs font-semibold text-[#14391a]/60">
                  or sign up with
                </div>
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-center w-full">
                  {/* Google Login Component */}
                  <div className="w-full lg:w-1/2 flex justify-center">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                      size="large"
                      shape="pill"
                      text="signup_with"
                      theme="outline"
                      width="100%"
                    />
                  </div>

                  {/* Facebook Sign Up */}
                  <button
                    type="button"
                    className="w-full lg:w-1/2 py-2.5 bg-white border border-gray-200 rounded-full flex items-center justify-center gap-2 text-xs lg:text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50 active:scale-[0.99] transition-all cursor-pointer h-[40px]"
                  >
                    <svg className="w-4 h-4" fill="#1877F2" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Facebook
                  </button>
                </div>
              </div>

              {/* Login Link */}
              <div className="text-center pt-2 text-xs lg:text-sm xl:text-base font-semibold text-[#14391a]">
                <span>Already have an account? </span>
                <Link
                  to="/login"
                  className="underline hover:opacity-80 transition-opacity"
                >
                  Login
                </Link>
              </div>

            </form>
          )}

        </div>
      </div>

    </div>
  );
}