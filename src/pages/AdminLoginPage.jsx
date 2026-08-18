import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiFetchJson } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { roleHome } from '../lib/roleRedirects';
import { Check, ArrowRight, ArrowLeft } from 'lucide-react';
import NexusLogo from '../components/NexusLogo';

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
    <div className="min-h-screen w-full flex items-center justify-center select-none bg-[#dad5ae] font-sans p-4">
      {/* ── FORGOT PASSWORD VIEW ─────────────────────────────────────────────── */}
      {view === 'forgot' ? (
        <div className="w-full max-w-md bg-[#0c2a16] text-white rounded-2xl p-8 sm:p-10 shadow-2xl border border-[#1b4e2a] flex flex-col items-center text-center animate-fade-in relative z-10">
          {/* Logo Badge */}
          <div className="mb-4">
            <NexusLogo size={48} variant="light" />
          </div>

          <h2 className="text-2xl font-black tracking-tight text-white mb-2 font-serif">
            Forgot Password
          </h2>
          <p className="text-xs text-[#a3c9a8] mb-6 max-w-xs leading-relaxed font-mono">
            Enter your email and we will transmit a secure reset link
          </p>

          {resetSuccessMsg ? (
            <div className="w-full bg-[#1b4e2a]/80 border border-emerald-500/40 text-emerald-200 text-xs font-semibold py-3 px-4 rounded-xl mb-6">
              {resetSuccessMsg}
            </div>
          ) : null}

          <form onSubmit={handleForgotSubmit} className="w-full space-y-5 text-left">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#a3c9a8] mb-2 font-mono">
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full bg-[#071c0e] text-white placeholder-[#3e6847] text-sm font-semibold px-4 py-3 rounded-xl border border-[#1b4e2a] outline-none focus:border-emerald-400 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#efe9c4] hover:bg-[#e4dfb1] text-[#0c2a16] text-xs font-black uppercase tracking-wider py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <span>{isLoading ? 'Transmitting...' : 'SEND RESET LINK'}</span>
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              onClick={() => {
                setView('login');
                setResetSuccessMsg('');
                setStatus('idle');
              }}
              className="w-full bg-transparent border border-[#1b4e2a] hover:bg-[#12381e] text-[#a3c9a8] hover:text-white text-xs font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer mt-3"
            >
              <ArrowLeft size={15} />
              <span>Back to Login</span>
            </button>
          </form>
        </div>
      ) : (
        /* ── SPLIT SCREEN CONTAINER (LOGIN & SUCCESS VIEWS) ─────────────────── */
        <div className="w-full max-w-5xl min-h-[540px] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row border border-[#b8b288] animate-fade-in">
          {/* Left Hero Panel */}
          <div className="w-full md:w-1/2 bg-[#e6dfc4] p-8 md:p-12 flex flex-col items-center justify-center text-center relative border-b md:border-b-0 md:border-r border-[#cbd2a5]/40">
            <div className="flex flex-col items-center max-w-sm">
              <div className="mb-6 transform hover:scale-105 transition-transform duration-300">
                <NexusLogo size={80} variant="dark" />
              </div>

              <h1 className="text-2xl md:text-3xl font-black font-serif text-[#0f2e13] tracking-wide mb-3">
                NEXUS DESKTOP
              </h1>

              <h2 className="text-sm font-bold text-[#14391a] mb-2 font-mono tracking-tight">
                Manage your store, the smart way
              </h2>

              <p className="text-xs text-[#396240] leading-relaxed font-mono">
                Sign in to the admin panel to manage inventory, orders and staff across all Imtiaz outlets.
              </p>
            </div>
          </div>

          {/* Right Form / Success Panel */}
          <div className="w-full md:w-1/2 bg-[#dad5ae] p-8 md:p-12 flex flex-col justify-center relative">
            {view === 'success' ? (
              /* SUCCESS VIEW */
              <div className="flex flex-col items-center justify-center text-center py-8 animate-fade-in">
                <h2 className="text-2xl md:text-3xl font-black font-serif text-[#0f2e13] mb-1">
                  Welcome Back
                </h2>
                <p className="text-xs text-[#396240] font-mono mb-8">
                  Sign in to continue managing your business
                </p>

                {/* Big Green Circle Badge with Checkmark */}
                <div className="w-24 h-24 rounded-full bg-[#0a2f18] text-white flex items-center justify-center shadow-xl mb-6 transform scale-105 animate-bounce-short">
                  <Check size={44} strokeWidth={3} />
                </div>

                <h3 className="text-xl font-black text-[#0f2e13] mb-1">
                  Login Successful
                </h3>
                <p className="text-xs font-mono text-[#2f5535] animate-pulse">
                  Redirecting to Dashboard...
                </p>
              </div>
            ) : (
              /* DEFAULT LOGIN FORM VIEW */
              <div className="flex flex-col justify-center max-w-sm mx-auto w-full">
                <div className="mb-6">
                  <h2 className="text-2xl md:text-3xl font-black font-serif text-[#0f2e13] tracking-tight">
                    Admin Login
                  </h2>
                  <p className="text-xs text-[#396240] font-mono mt-1">
                    Welcome back! Please login to continue
                  </p>
                </div>

                {/* Error Banner */}
                {isError ? (
                  <div className="mb-5 bg-[#e6a8a8]/60 border border-red-500/80 text-[#8a1c1c] text-xs font-bold py-2 px-3 rounded-lg text-center font-mono animate-shake">
                    {errorMsg}
                  </div>
                ) : null}

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {/* Username Field */}
                  <div>
                    <label className="block text-xs font-bold text-[#0f2e13] mb-1.5 font-mono">
                      Username
                    </label>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        if (isError) setStatus('idle');
                      }}
                      placeholder="Enter Your Username"
                      className={`w-full bg-[#9bb091] text-[#0a2310] placeholder-[#4d6345] text-xs font-semibold px-4 py-3 rounded-xl outline-none transition-all ${
                        isError
                          ? 'border-2 border-red-500'
                          : 'border border-transparent focus:border-[#0f2e13]'
                      }`}
                    />
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="block text-xs font-bold text-[#0f2e13] mb-1.5 font-mono">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (isError) setStatus('idle');
                      }}
                      placeholder="Enter Your Password"
                      className={`w-full bg-[#9bb091] text-[#0a2310] placeholder-[#4d6345] text-xs font-semibold px-4 py-3 rounded-xl outline-none transition-all ${
                        isError
                          ? 'border-2 border-red-500'
                          : 'border border-transparent focus:border-[#0f2e13]'
                      }`}
                    />
                  </div>

                  {/* Remember me & Forgot Password */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-[#0f2e13] font-semibold text-[11px]">
                      <input
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        className="rounded accent-[#0a2f18] cursor-pointer"
                      />
                      <span>Remember me</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        setView('forgot');
                        setStatus('idle');
                      }}
                      className="text-[11px] font-bold text-[#0f2e13] hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#0a2f18] hover:bg-[#072412] text-white text-xs font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-black/15 transition-all cursor-pointer uppercase tracking-wider mt-2"
                  >
                    {isLoading ? 'Authenticating...' : 'Login'}
                  </button>

                  {/* Footer link */}
                  <div className="text-center pt-2">
                    <span className="text-[11px] text-[#2f5535]">
                      Don't have an account?{' '}
                    </span>
                    <Link
                      to="/signup"
                      className="text-[11px] font-bold text-[#0f2e13] underline hover:text-[#05170c]"
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
