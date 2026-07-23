import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiFetchJson } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { roleHome } from '../lib/roleRedirects';

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
      // Owners who haven't finished the registration wizard yet don't have
      // a business row — send them there instead of an empty dashboard.
      const destination =
        data.user?.role === 'admin' && !data.user?.businessId
          ? '/register-business'
          : roleHome(data.user?.role);
      window.setTimeout(() => navigate(destination), 1600);
    } catch {
      setErrorMsg('Unable to reach the server. Please try again.');
      setStatus('error');
    }
  };

  const isError = status === 'error';
  const isLoading = status === 'loading';
  const isSuccess = status === 'success';

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

        <div className="space-y-2 lg:space-y-4">
          <h2 className="text-lg md:text-2xl lg:text-3xl xl:text-4xl font-semibold">
            Smart POS for every business
          </h2>
          <p className="text-xs md:text-base lg:text-lg xl:text-xl opacity-85">
            Sales, inventory, and reports — all in one place
          </p>
        </div>

        {/* Stats */}
        <div className="flex flex-row items-center justify-center gap-12 sm:gap-16 lg:gap-24 xl:gap-32 pt-6 lg:pt-10 w-full">
          <div>
            <span className="text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-bold block">1.2k</span>
            <span className="text-xs md:text-sm lg:text-base xl:text-lg opacity-80 mt-1 block">orders today</span>
          </div>
          <div>
            <span className="text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-bold block">98%</span>
            <span className="text-xs md:text-sm lg:text-base xl:text-lg opacity-80 mt-1 block">Uptime this week</span>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full md:w-1/2 flex-1 bg-[#f4f2d3] flex flex-col justify-center px-6 py-12 sm:px-12 sm:py-16 md:py-24 md:px-20 lg:px-28 xl:px-36">
        <div className="max-w-md lg:max-w-lg xl:max-w-xl w-full mx-auto space-y-8 lg:space-y-12 xl:space-y-14">
          
          {/* Header */}
          <div className="space-y-2">
            <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-[#14391a]">
              Welcome Back
            </h2>
            <p className="text-sm lg:text-base xl:text-lg text-[#14391a]/60">
              Sign in to continue managing your business
            </p>
          </div>

          {isSuccess ? (
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
              <p className="text-[20px] lg:text-[24px] font-bold text-[#14391a] mt-1">Login Successful</p>
              <p className="text-[13px] lg:text-[16px] text-[#14391a]/60">Redirecting to Dashboard</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8">
              
              {/* Error Banner */}
              {isError && (
                <div role="alert" className="px-4 py-2.5 rounded-lg bg-red-50 border border-red-200 text-xs lg:text-sm text-red-600 text-center font-medium">
                  {errorMsg}
                </div>
              )}

              {/* Username field */}
              <div className="space-y-2">
                <label htmlFor="login-username" className="text-base lg:text-lg xl:text-xl font-bold text-[#14391a] block">
                  Username
                </label>
                <input
                  id="login-username"
                  type="text"
                  placeholder="Enter Your username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (status === 'error') setStatus('idle');
                  }}
                  disabled={isLoading}
                  autoComplete="username"
                  className="w-full px-4 py-3.5 lg:py-4 xl:py-4.5 rounded-lg bg-[#aab79d] text-[#14391a] placeholder-[#14391a]/60 lg:text-lg xl:text-xl font-medium outline-none transition-all focus:ring-2 focus:ring-[#14391a]/30 border-none"
                />
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <label htmlFor="login-password" className="text-base lg:text-lg xl:text-xl font-bold text-[#14391a] block">
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  placeholder="Enter Your Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (status === 'error') setStatus('idle');
                  }}
                  disabled={isLoading}
                  autoComplete="current-password"
                  className="w-full px-4 py-3.5 lg:py-4 xl:py-4.5 rounded-lg bg-[#aab79d] text-[#14391a] placeholder-[#14391a]/60 lg:text-lg xl:text-xl font-medium outline-none transition-all focus:ring-2 focus:ring-[#14391a]/30 border-none"
                />
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-xs lg:text-sm xl:text-base font-semibold text-[#14391a]">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    disabled={isLoading}
                    className="w-4 h-4 lg:w-5 lg:h-5 rounded border-none bg-[#aab79d] text-[#14391a] accent-[#14391a] cursor-pointer"
                  />
                  Remember me
                </label>
                <Link
                  to="/forgot-password"
                  className="hover:underline transition-all"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 lg:py-4 xl:py-4.5 bg-[#14391a] hover:bg-[#0f2a13] text-white text-base lg:text-lg xl:text-xl font-bold rounded-lg shadow-md hover:shadow-lg transform active:scale-[0.99] transition-all duration-200 cursor-pointer flex items-center justify-center"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 lg:w-3 lg:h-3 rounded-full bg-white animate-ping" />
                    Logging in...
                  </span>
                ) : (
                  'Login'
                )}
              </button>

              {/* Sign Up Link */}
              <div className="text-center pt-2 text-xs lg:text-sm xl:text-base font-semibold text-[#14391a]">
                <span>Dont have an account? </span>
                <Link
                  to="/signup"
                  className="underline hover:opacity-80 transition-opacity"
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