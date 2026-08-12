import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { apiFetchJson } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

export default function SignUpPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

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
  const [draftSaved, setDraftSaved] = useState(false);

  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (status === 'error') {
      setStatus('idle');
      setErrorMsg('');
    }
  };

  // Phone number: digits only, max 11
  const setPhone = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 11);
    setForm((prev) => ({ ...prev, phoneNumber: digits }));
    if (status === 'error') { setStatus('idle'); setErrorMsg(''); }
  };

  const validate = () => {
    if (!form.username.trim()) return 'Username is required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) return 'A valid email is required';

    if (!form.phoneNumber.trim()) return 'Phone number is required';
    if (form.phoneNumber.length !== 11) return 'Phone number must be exactly 11 digits';
    if (!form.city.trim()) return 'City/region is required';
    return null;
  };

  const handleSaveDraft = () => {
    try {
      localStorage.setItem('signup_draft', JSON.stringify(form));
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 2500);
    } catch {
      // ignore
    }
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
      const { ok, data } = await apiFetchJson('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          username: form.username.trim(),
          email: form.email.trim(),
          password: form.password,
          phoneNumber: form.phoneNumber.trim(),
          city: form.city.trim(),
        }),
      });

      if (!ok) {
        setErrorMsg(data.message || 'Something went wrong. Please try again.');
        setStatus('error');
        return;
      }

      if (data.user) login(data.user);

      setStatus('success');
      window.setTimeout(() => navigate('/register-business'), 1600);
    } catch {
      setErrorMsg('Unable to reach the server. Please try again.');
      setStatus('error');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setStatus('loading');
    try {
      const { ok, data } = await apiFetchJson('/auth/google', {
        method: 'POST',
        body: JSON.stringify({
          credential: credentialResponse.credential,
        }),
      });

      if (!ok) {
        setErrorMsg(data.message || 'Google sign up failed. Please try again.');
        setStatus('error');
        return;
      }

      if (data.user) login(data.user);

      setStatus('success');
      window.setTimeout(() => navigate('/register-business'), 1600);
    } catch {
      setErrorMsg('Unable to reach the server. Please try again.');
      setStatus('error');
    }
  };

  const handleGoogleError = () => {
    setErrorMsg('Google sign up failed. Please try again.');
    setStatus('error');
  };

  const isError = status === 'error';
  const isLoading = status === 'loading';

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row select-none bg-[#f4f2d3]">

      {/* ── Left Hero Panel ────────────────────────────────────────────────── */}
      <div className="w-full md:w-1/2 md:flex-none bg-[#e5dcba] flex flex-col justify-center items-center text-center px-4 py-8 sm:px-10 md:py-20 md:px-16 lg:px-24 xl:px-32 text-[#14391a] space-y-3 sm:space-y-5 lg:space-y-6 border-b border-md:border-b-0 border-r-0 md:border-r border-[#14391a]/20">
        <div className="flex flex-col items-center space-y-3 sm:space-y-4">
          <img
            src="/Nexus.png"
            alt="Nexus Logo"
            className="w-28 sm:w-36 md:w-48 lg:w-64 xl:w-72 h-auto object-contain drop-shadow-xs transition-all duration-300"
          />
          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-wide leading-none">
            NEXUS DESKTOP
          </h1>
        </div>

        <div className="space-y-1 sm:space-y-2">
          <h2 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight">
            Register your business
          </h2>
          <p className="text-xs sm:text-sm md:text-base opacity-85 max-w-xs sm:max-w-sm mx-auto">
            Tell us about your business to finish setting up
          </p>
        </div>
      </div>

      {/* ── Right Form Panel ───────────────────────────────────────────────── */}
      <div className="w-full md:w-1/2 md:flex-none bg-[#f4f2d3] flex flex-col justify-center px-4 py-8 sm:px-10 sm:py-12 md:py-20 md:px-16 lg:px-24 xl:px-32">
        <div className="max-w-md lg:max-w-lg xl:max-w-xl w-full mx-auto space-y-5 sm:space-y-7 lg:space-y-8">

          {/* Header */}
          {status !== 'success' && (
            <div className="space-y-1 text-center">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#14391a] tracking-tight">
                Account Details
              </h2>
              <p className="text-xs sm:text-sm lg:text-base text-[#14391a]/70 font-semibold">
                Get started in less than a minute
              </p>
            </div>
          )}

          {status === 'success' ? (
            <div className="flex flex-col items-center gap-3 text-center py-8 bg-white/40 rounded-2xl border border-[#14391a]/15 p-6">
              <span className="flex items-center justify-center w-14 h-14 sm:w-18 sm:h-18 rounded-full bg-[#14391a] text-white animate-bounce shadow-md">
                <svg width="28" height="28" className="sm:w-9 sm:h-9" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 13l4 4L19 7"
                    stroke="#ffffff"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <p className="text-lg sm:text-xl lg:text-2xl font-black text-[#14391a]">Account Created!</p>
              <p className="text-xs sm:text-sm text-[#14391a]/70 font-semibold">Redirecting to business setup...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4 lg:space-y-5 border border-[#14391a]/20 p-5 sm:p-7 md:p-8 rounded-2xl sm:rounded-3xl bg-[#fbf9f0]/60 shadow-sm">

              {/* Draft Notification */}
              {draftSaved && (
                <div role="status" className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-300 text-xs sm:text-sm text-emerald-700 text-center font-bold">
                  Draft saved successfully!
                </div>
              )}

              {/* Error Banner */}
              {isError && (
                <div role="alert" className="px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-600 text-center font-bold">
                  {errorMsg}
                </div>
              )}

              {/* Username field */}
              <div className="space-y-1">
                <label htmlFor="su-username" className="text-xs sm:text-sm md:text-base font-extrabold text-[#14391a] block">
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
                  className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-[#aab79d] text-[#14391a] placeholder-[#14391a]/50 text-xs sm:text-sm md:text-base font-bold outline-none transition-all focus:ring-2 focus:ring-[#14391a]/40 border-none shadow-2xs"
                />
              </div>

              {/* Email field */}
              <div className="space-y-1">
                <label htmlFor="su-email" className="text-xs sm:text-sm md:text-base font-extrabold text-[#14391a] block">
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
                  className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-[#aab79d] text-[#14391a] placeholder-[#14391a]/50 text-xs sm:text-sm md:text-base font-bold outline-none transition-all focus:ring-2 focus:ring-[#14391a]/40 border-none shadow-2xs"
                />
              </div>

              {/* Password field */}
              <div className="space-y-1">
                <label htmlFor="su-password" className="text-xs sm:text-sm md:text-base font-extrabold text-[#14391a] block">
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
                    className="w-full px-4 py-2.5 sm:py-3 pr-10 rounded-xl bg-[#aab79d] text-[#14391a] placeholder-[#14391a]/50 text-xs sm:text-sm md:text-base font-bold outline-none transition-all focus:ring-2 focus:ring-[#14391a]/40 border-none shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 text-[#14391a]/70 hover:text-[#14391a] transition-colors cursor-pointer bg-transparent border-none p-1 flex items-center"
                    title={showPass ? "Hide password" : "Show password"}
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Phone number field */}
              <div className="space-y-1">
                <label htmlFor="su-phone" className="text-xs sm:text-sm md:text-base font-extrabold text-[#14391a] block">
                  Phone number
                </label>
                <input
                  id="su-phone"
                  type="tel"
                  inputMode="numeric"
                  placeholder="03XXXXXXXXX"
                  value={form.phoneNumber}
                  onChange={setPhone}
                  disabled={isLoading}
                  maxLength={11}
                  className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-[#aab79d] text-[#14391a] placeholder-[#14391a]/50 text-xs sm:text-sm md:text-base font-bold outline-none transition-all focus:ring-2 focus:ring-[#14391a]/40 border-none shadow-2xs"
                />
              </div>

              {/* City/region field */}
              <div className="space-y-1">
                <label htmlFor="su-city" className="text-xs sm:text-sm md:text-base font-extrabold text-[#14391a] block">
                  City/region
                </label>
                <input
                  id="su-city"
                  type="text"
                  placeholder="e.g. Sukkur, Sindh"
                  value={form.city}
                  onChange={set('city')}
                  disabled={isLoading}
                  className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-[#aab79d] text-[#14391a] placeholder-[#14391a]/50 text-xs sm:text-sm md:text-base font-bold outline-none transition-all focus:ring-2 focus:ring-[#14391a]/40 border-none shadow-2xs"
                />
              </div>

              {/* CTA Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={isLoading}
                  className="w-1/2 py-3 bg-[#e6e2b8] hover:bg-[#dcd8ae] text-[#14391a] text-xs sm:text-sm font-extrabold rounded-xl border border-[#14391a]/20 shadow-xs active:scale-[0.99] transition-all duration-200 cursor-pointer min-h-[44px]"
                >
                  Save draft
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-1/2 py-3 bg-[#14391a] hover:bg-[#0f2a13] text-white text-xs sm:text-sm font-extrabold rounded-xl shadow-md active:scale-[0.99] transition-all duration-200 cursor-pointer min-h-[44px]"
                >
                  {isLoading ? 'Creating...' : 'Continue'}
                </button>
              </div>

              {/* Social Signup section */}
              <div className="space-y-2.5 pt-2">
                <div className="text-center text-[10px] sm:text-xs font-extrabold text-[#14391a]/70 uppercase tracking-wider">
                  or sign up with
                </div>
                <div className="flex flex-col gap-2.5 items-center justify-center w-full">
                  {/* Google Login Component */}
                  <div className="w-full flex justify-center overflow-hidden rounded-full">
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
                    className="w-full py-2.5 bg-white border border-gray-300 rounded-full flex items-center justify-center gap-2 text-xs sm:text-sm font-bold text-gray-700 shadow-2xs hover:bg-gray-50 active:scale-[0.99] transition-all cursor-pointer min-h-[40px]"
                  >
                    <svg className="w-4 h-4" fill="#1877F2" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Facebook
                  </button>
                </div>
              </div>

              {/* Login Link */}
              <div className="text-center pt-2 text-xs sm:text-sm font-bold text-[#14391a]">
                <span>Already have an account? </span>
                <Link
                  to="/login"
                  className="underline hover:opacity-80 transition-opacity font-black ml-1 text-[#14391a]"
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