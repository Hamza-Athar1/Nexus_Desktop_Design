import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiFetchJson } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { roleHome } from '../lib/roleRedirects';
import { GoogleLogin } from '@react-oauth/google';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);

  // UI state
  const [status, setStatus] = useState('idle'); // idle | error | loading | success
  const [errorMsg, setErrorMsg] = useState('Invalid username or password');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      setErrorMsg('Please enter your username and password');
      setStatus('error');
      return;
    }

    setStatus('loading');

    try {
      const { ok, data } = await apiFetchJson('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: username.trim(), password, remember }),
      });

      if (!ok) {
        setErrorMsg(data.message || 'Invalid username or password');
        setStatus('error');
        return;
      }

      if (data.user) login(data.user);

      setStatus('success');
      const destination =
        data.user?.role === 'admin' && !data.user?.businessId
          ? '/register-business'
          : roleHome(data.user?.role);
      window.setTimeout(() => navigate(destination), 1400);
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
        setErrorMsg(data.message || 'Google sign in failed. Please try again.');
        setStatus('error');
        return;
      }

      if (data.user) login(data.user);

      setStatus('success');
      const destination =
        data.user?.role === 'admin' && !data.user?.businessId
          ? '/register-business'
          : roleHome(data.user?.role);
      window.setTimeout(() => navigate(destination), 1400);
    } catch {
      setErrorMsg('Unable to reach the server. Please try again.');
      setStatus('error');
    }
  };

  const handleGoogleError = () => {
    setErrorMsg('Google sign in failed. Please try again.');
    setStatus('error');
  };

  const isError = status === 'error';
  const isLoading = status === 'loading';
  const isSuccess = status === 'success';

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row select-none bg-[#f4f2d3]">

      {/* ── Left Hero Panel ────────────────────────────────────────────────── */}
      <div className="w-full md:w-1/2 md:flex-none bg-[#e5dcba] flex flex-col justify-center items-center text-center px-4 py-8 sm:px-10 md:py-20 md:px-16 lg:px-24 xl:px-32 text-[#14391a] space-y-4 sm:space-y-6 lg:space-y-8 border-b border-md:border-b-0 border-r-0 md:border-r border-[#14391a]/20">
        <div className="flex flex-col items-center space-y-3 sm:space-y-5 lg:space-y-8">
          <img
            src="/Nexus.png"
            alt="Nexus Logo"
            className="w-28 sm:w-36 md:w-48 lg:w-64 xl:w-72 h-auto object-contain drop-shadow-xs transition-all duration-300"
          />
          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-wide leading-none">
            NEXUS DESKTOP
          </h1>
        </div>

        <div className="space-y-1 sm:space-y-2 lg:space-y-3">
          <h2 className="text-base sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold">
            Smart POS for every business
          </h2>
          <p className="text-xs sm:text-sm md:text-base lg:text-lg opacity-85">
            Sales, inventory, and reports — all in one place
          </p>
        </div>

        {/* Stats */}
        <div className="flex flex-row items-center justify-center gap-8 sm:gap-14 lg:gap-20 xl:gap-28 pt-2 sm:pt-4 w-full">
          <div>
            <span className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold block">1.2k</span>
            <span className="text-[10px] sm:text-xs md:text-sm opacity-80 mt-0.5 block">orders today</span>
          </div>
          <div>
            <span className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold block">98%</span>
            <span className="text-[10px] sm:text-xs md:text-sm opacity-80 mt-0.5 block">uptime this week</span>
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ───────────────────────────────────────────────── */}
      <div className="w-full md:w-1/2 md:flex-none bg-[#f4f2d3] flex flex-col justify-center px-4 py-8 sm:px-10 sm:py-12 md:py-20 md:px-16 lg:px-24 xl:px-32">
        <div className="max-w-md lg:max-w-lg xl:max-w-xl w-full mx-auto space-y-6 sm:space-y-8 lg:space-y-10">

          {/* Header */}
          {!isSuccess && (
            <div className="space-y-1.5 text-center">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#14391a] tracking-tight">
                Welcome Back
              </h2>
              <p className="text-xs sm:text-sm lg:text-base text-[#14391a]/70 font-semibold">
                Sign in to continue managing your business
              </p>
            </div>
          )}

          {isSuccess ? (
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
              <p className="text-lg sm:text-xl lg:text-2xl font-black text-[#14391a]">Login Successful!</p>
              <p className="text-xs sm:text-sm text-[#14391a]/70 font-semibold">Redirecting to your dashboard...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 lg:space-y-6 border border-[#14391a]/20 p-5 sm:p-7 md:p-8 rounded-2xl sm:rounded-3xl bg-[#fbf9f0]/60 shadow-sm">

              {/* Error Banner */}
              {isError && (
                <div role="alert" className="px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-600 text-center font-bold">
                  {errorMsg}
                </div>
              )}

              {/* Username field */}
              <div className="space-y-1 sm:space-y-1.5">
                <label htmlFor="login-username" className="text-xs sm:text-sm md:text-base font-extrabold text-[#14391a] block">
                  Username
                </label>
                <input
                  id="login-username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (status === 'error') setStatus('idle');
                  }}
                  disabled={isLoading}
                  autoComplete="username"
                  className="w-full px-4 py-3 sm:py-3.5 rounded-xl bg-[#aab79d] text-[#14391a] placeholder-[#14391a]/60 text-xs sm:text-sm md:text-base font-bold outline-none transition-all focus:ring-2 focus:ring-[#14391a]/40 border-none shadow-2xs"
                />
              </div>

              {/* Password field */}
              <div className="space-y-1 sm:space-y-1.5">
                <label htmlFor="login-password" className="text-xs sm:text-sm md:text-base font-extrabold text-[#14391a] block">
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (status === 'error') setStatus('idle');
                  }}
                  disabled={isLoading}
                  autoComplete="current-password"
                  className="w-full px-4 py-3 sm:py-3.5 rounded-xl bg-[#aab79d] text-[#14391a] placeholder-[#14391a]/60 text-xs sm:text-sm md:text-base font-bold outline-none transition-all focus:ring-2 focus:ring-[#14391a]/40 border-none shadow-2xs"
                />
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-[#14391a] pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    disabled={isLoading}
                    className="w-4 h-4 rounded border-none bg-[#aab79d] text-[#14391a] accent-[#14391a] cursor-pointer"
                  />
                  <span>Remember me</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="hover:underline transition-all text-[#14391a] hover:text-[#0c3818]"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 sm:py-4 bg-[#14391a] hover:bg-[#0f2a13] text-white text-sm sm:text-base font-black rounded-xl shadow-md hover:shadow-lg active:scale-[0.99] transition-all duration-200 cursor-pointer flex items-center justify-center min-h-[46px]"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                    Logging in...
                  </span>
                ) : (
                  'Login'
                )}
              </button>

              {/* Divider */}
              <div className="flex items-center my-3">
                <div className="flex-grow border-t border-[#14391a]/20"></div>
                <span className="px-3 text-[11px] sm:text-xs text-[#14391a]/70 font-extrabold uppercase tracking-wider">Or sign in with</span>
                <div className="flex-grow border-t border-[#14391a]/20"></div>
              </div>

              {/* Google Login Component */}
              <div className="w-full flex justify-center overflow-hidden rounded-xl">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="outline"
                  size="large"
                  width="100%"
                />
              </div>

              {/* Sign Up Link */}
              <div className="text-center pt-2 text-xs sm:text-sm font-bold text-[#14391a]">
                <span>Don't have an account? </span>
                <Link
                  to="/signup"
                  className="underline hover:opacity-80 transition-opacity font-black ml-1 text-[#14391a]"
                >
                  Sign Up
                </Link>
              </div>

            </form>
          )}

        </div>
      </div>

    </div>
  );
}