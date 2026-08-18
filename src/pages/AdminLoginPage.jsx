import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiFetchJson } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { roleHome } from '../lib/roleRedirects';
import { Check, ArrowRight, ArrowLeft } from 'lucide-react';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Navigation / View states: 'login' | 'forgot' | 'success'
  const [view, setView] = useState('login');

  // Form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  // Status states
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'error'
  const [errorMsg, setErrorMsg] = useState('Invalid username or password');
  const [resetSuccessMsg, setResetSuccessMsg] = useState('');

  // Handle Login Submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      setErrorMsg('Invalid username or password');
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

      setView('success');
      const destination =
        data.user?.role === 'admin' && !data.user?.businessId
          ? '/register-business'
          : roleHome(data.user?.role || 'admin');

      window.setTimeout(() => navigate(destination), 1500);
    } catch {
      setErrorMsg('Unable to reach the server. Please try again.');
      setStatus('error');
    }
  };

  // Handle Forgot Password Submit
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;

    setStatus('loading');
    try {
      await apiFetchJson('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });
      setResetSuccessMsg('Reset link transmitted to your email.');
      setStatus('idle');
    } catch {
      setResetSuccessMsg('Reset link transmitted to your email.');
      setStatus('idle');
    }
  };

  const isError = status === 'error';
  const isLoading = status === 'loading';

  return (
    <div className="min-h-screen w-full flex select-none bg-[#efeacb] font-sans">
      {/* ── FORGOT PASSWORD VIEW ─────────────────────────────────────────────── */}
      {view === 'forgot' ? (
        <div className="w-full min-h-screen flex items-center justify-center p-4 bg-[#efeacb]">
          <div className="w-full max-w-[440px] bg-gradient-to-b from-[#0F4415] to-[#0A2E0F] text-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-[#1b4e2a] flex flex-col items-center text-center animate-fade-in relative z-10">
            {/* Logo Badge Container */}
            <div className="w-24 h-24 bg-[#efeacb] p-3 rounded-2xl flex items-center justify-center border border-[#dcd7be] shadow-sm mb-6 mx-auto">
              <img
                src="/Nexus_superadmin.png"
                alt="Nexus Logo"
                className="w-full h-auto object-contain"
              />
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#efeacb] mb-2">
              Forgot Password
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-[#8ca88e] max-w-[280px] leading-relaxed mx-auto mb-6">
              Enter your email and we will transmit a secure reset link
            </p>

            {resetSuccessMsg ? (
              <div className="w-full bg-[#1b4e2a]/80 border border-emerald-500/40 text-emerald-200 text-xs font-semibold py-3 px-4 rounded-xl mb-6">
                {resetSuccessMsg}
              </div>
            ) : null}

            <form onSubmit={handleForgotSubmit} className="w-full space-y-5 text-left">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-[#8ca88e] mb-2.5 text-left font-mono">
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full bg-[#061c0b] text-[#a6c8aa] placeholder-[#4f7754] text-xs font-semibold px-4 py-3.5 rounded-xl border border-[#24522c] outline-none focus:border-[#4d8b59] transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#efeacb] hover:bg-[#e2dcba] text-[#093311] text-xs font-extrabold uppercase tracking-wider py-4 px-6 rounded-xl flex items-center justify-between transition-all cursor-pointer shadow-md"
              >
                <span className="flex-1 text-center font-black">
                  {isLoading ? 'TRANSMITTING...' : 'SEND RESET LINK'}
                </span>
                <ArrowRight size={18} className="shrink-0 text-[#093311]" />
              </button>

              {/* Divider Line */}
              <div className="w-full border-t border-[#1b4823] pt-2 mt-6" />

              {/* Back to Login Button */}
              <div className="w-full flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setView('login');
                    setResetSuccessMsg('');
                    setStatus('idle');
                  }}
                  className="bg-transparent hover:bg-[#12381e] text-[#a6c8aa] hover:text-white text-xs font-bold py-2.5 px-6 rounded-xl border border-[#3b6643] flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <ArrowLeft size={16} />
                  <span>Back to login</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        /* ── SPLIT SCREEN CONTAINER (LOGIN & SUCCESS VIEWS) ─────────────────── */
        <div className="w-full min-h-screen flex flex-col md:flex-row">
          {/* Left Hero Panel */}
          <div className="w-full md:w-1/2 bg-[#e5dec1] p-8 md:p-16 flex flex-col items-center justify-center text-center">
            <div className="flex flex-col items-center max-w-md">
              <img
                src="/Nexus_superadmin.png"
                alt="Nexus Superadmin Logo"
                className="w-64 md:w-80 h-auto object-contain mb-8 drop-shadow-sm"
              />

              <h2 className="text-2xl md:text-3xl font-extrabold text-[#0d3410] tracking-tight mb-4">
                Manage your store, <span className="text-[#396240]">the smart way</span>
              </h2>

              <p className="text-sm font-medium text-[#2d4d33] max-w-sm leading-relaxed">
                Sign in to the admin panel to manage inventory, orders and staff across all Imtiaz outlets.
              </p>
            </div>
          </div>

          {/* Right Form / Success Panel */}
          <div className="w-full md:w-1/2 bg-[#efeacb] p-8 md:p-16 flex flex-col justify-center items-center">
            {view === 'success' ? (
              /* SUCCESS VIEW */
              <div className="flex flex-col items-center justify-center text-center max-w-sm w-full py-8 animate-fade-in">
                <h2 className="text-3xl font-extrabold text-[#0d3410] mb-2">
                  Welcome Back
                </h2>
                <p className="text-sm font-bold text-[#8d8975] mb-8">
                  Sign in to continue managing your business
                </p>

                {/* Big Green Circle Badge with Checkmark */}
                <div className="w-24 h-24 rounded-full bg-[#093311] text-white flex items-center justify-center shadow-xl mb-6 transform scale-105 animate-bounce-short">
                  <Check size={48} strokeWidth={3} />
                </div>

                <h3 className="text-xl font-black text-[#0d3410] mb-1">
                  Login Successful
                </h3>
                <p className="text-xs font-semibold text-[#396240] animate-pulse">
                  Redirecting to Dashboard...
                </p>
              </div>
            ) : (
              /* DEFAULT LOGIN FORM VIEW */
              <div className="flex flex-col justify-center max-w-md w-full border border-[#c7c0a0] rounded-3xl p-6 sm:p-8 bg-[#efeacb]/90 shadow-sm">
                <div className="mb-6 text-center md:text-left">
                  <h2 className="text-3xl md:text-4xl font-extrabold text-[#0d3410] tracking-tight">
                    Admin Login
                  </h2>
                  <p className="text-sm font-bold text-[#8d8975] mt-1.5">
                    Welcome back! Please login to continue
                  </p>
                </div>

                {/* Error Banner */}
                {isError ? (
                  <div className="flex justify-center mb-5">
                    <div className="border border-red-500 bg-transparent text-red-500 text-xs font-semibold px-4 py-1.5 rounded-2xl text-center animate-shake">
                      {errorMsg}
                    </div>
                  </div>
                ) : null}

                <form onSubmit={handleLoginSubmit} className="space-y-5" noValidate>
                  {/* Username Field */}
                  <div>
                    <label className="block text-sm font-bold text-[#0d3410] mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        if (isError) setStatus('idle');
                      }}
                      placeholder="Enter Your username"
                      className={`w-full bg-[#a6b896] text-[#0a2310] placeholder-[#3e563b] text-sm font-semibold px-4 py-3.5 rounded-2xl outline-none shadow-inner transition-all ${
                        isError
                          ? 'border-2 border-red-500'
                          : 'border border-[#8c9e7c] focus:border-[#0d3410]'
                      }`}
                    />
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="block text-sm font-bold text-[#0d3410] mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (isError) setStatus('idle');
                      }}
                      placeholder="Enter Your Password"
                      className={`w-full bg-[#a6b896] text-[#0a2310] placeholder-[#3e563b] text-sm font-semibold px-4 py-3.5 rounded-2xl outline-none shadow-inner transition-all ${
                        isError
                          ? 'border-2 border-red-500'
                          : 'border border-[#8c9e7c] focus:border-[#0d3410]'
                      }`}
                    />
                  </div>

                  {/* Remember me & Forgot Password */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-[#0d3410] font-bold text-xs">
                      <input
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        className="w-4 h-4 rounded bg-[#dcd7be] accent-[#093311] cursor-pointer"
                      />
                      <span>Remember me</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        setView('forgot');
                        setStatus('idle');
                      }}
                      className="text-xs font-bold text-[#0d3410] hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#093311] hover:bg-[#06240c] text-white text-base font-bold py-3.5 px-4 rounded-2xl shadow-xl shadow-black/15 transition-all cursor-pointer active:scale-[0.99] mt-3"
                  >
                    {isLoading ? 'Authenticating...' : 'Login'}
                  </button>

                  {/* Footer link */}
                  <div className="text-center pt-4">
                    <span className="text-xs font-bold text-[#0d3410]">
                      Dont have an account?{' '}
                    </span>
                    <Link
                      to="/signup"
                      className="text-xs font-bold text-[#0d3410] underline hover:text-[#05170c]"
                    >
                      Sign Up
                    </Link>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
