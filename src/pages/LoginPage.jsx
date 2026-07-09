import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, TrendingUp, ShoppingCart } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import NexusLogo from '../components/NexusLogo';
import { apiFetchJson } from '../lib/api';
import { useAuth } from '../context/AuthContext';

// ============================================================================
// Constants
// ============================================================================

const SPARKLINE_POINTS = [
  [0, 55], [10, 45], [22, 50], [34, 38], [46, 42],
  [58, 30], [70, 35], [82, 28], [94, 32], [100, 25]
];

const INPUT_BASE_CLASSES = `
  w-full px-3 py-[9px] rounded-lg border-[1.5px] text-[12px] 
  text-gray-900 outline-none transition-all placeholder:text-gray-400 
  disabled:opacity-60
`.trim();

// ============================================================================
// Sub-components
// ============================================================================

function EyeToggle({ isOpen }) {
  return isOpen ? <EyeOff size={14} /> : <Eye size={14} />;
}

function SparklineChart() {
  const linePath = SPARKLINE_POINTS.map(([x, y]) => `${x},${y}`).join(' ');

  return (
    <svg viewBox="0 0 100 65" preserveAspectRatio="none" className="w-full h-full">
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4ade80" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,65 ${linePath} 100,65`} fill="url(#chartGrad)" />
      <polyline
        points={linePath}
        fill="none"
        stroke="#4ade80"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BrandPanel() {
  return (
    <div className="hidden md:flex flex-col justify-between p-8 nexus-panel min-w-0 flex-[0_0_340px]">
      {/* Logo Section */}
      <div className="flex flex-col items-center gap-3 pt-4">
        <NexusLogo size={56} variant="light" />
        <h2 className="text-white font-bold text-[22px] tracking-wide mt-1">
          Nexus Desktop
        </h2>
        <p className="text-[13px] text-white/65">Smart POS for every business</p>
      </div>

      {/* Stats Row */}
      <div className="flex gap-3 mt-6">
        <div className="flex-1 rounded-xl p-3 bg-white/8">
          <p className="text-[10px] font-medium mb-1 text-white/55">Sales</p>
          <p className="text-white font-bold text-[18px]">$12.4k</p>
          <p className="text-[10px] mt-0.5 flex items-center gap-1 text-green-400">
            <TrendingUp size={10} /> 8% this week
          </p>
        </div>
        <div className="flex-1 rounded-xl p-3 bg-white/8">
          <p className="text-[10px] font-medium mb-1 text-white/55">Orders</p>
          <p className="text-white font-bold text-[18px]">284</p>
          <p className="text-[10px] mt-0.5 flex items-center gap-1 text-green-400">
            <ShoppingCart size={10} /> +12 today
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-xl mt-4 overflow-hidden bg-white/6 h-22.5 p-2 pb-1">
        <SparklineChart />
      </div>
    </div>
  );
}

function FormField({ label, htmlFor, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={htmlFor} className="text-[12px] font-semibold text-gray-900">
        {label}
      </label>
      {children}
    </div>
  );
}

function InputField({ id, type, placeholder, value, onChange, disabled, autoComplete, hasError, className = '' }) {
  return (
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      autoComplete={autoComplete}
      className={`
        ${INPUT_BASE_CLASSES}
        ${hasError
          ? 'border-red-400 bg-red-50 placeholder:text-red-300'
          : 'border-transparent bg-[#f0f4ec] focus:border-nexus focus:ring-[3px] focus:ring-nexus/10'
        }
        ${className}
      `.trim()}
    />
  );
}

function SubmitButton({ isLoading, onClick }) {
  return (
    <button
      id="login-btn"
      type="submit"
      disabled={isLoading}
      onClick={onClick}
      className={`
        mt-1.5 w-full flex items-center justify-center gap-2 py-2.75 rounded-lg
        bg-nexus text-white text-sm font-bold border-none transition-all active:scale-[0.99]
        ${isLoading ? 'cursor-not-allowed opacity-80' : 'cursor-pointer hover:bg-nexus-dark'}
      `.trim()}
    >
      {isLoading ? (
        <>
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-white shrink-0 animate-pulse" />
          Signing in&nbsp;
          <span className="loading-dots">
            <span>.</span><span>.</span><span>.</span>
          </span>
        </>
      ) : (
        'Login'
      )}
    </button>
  );
}

function ErrorBanner({ message }) {
  return (
    <div
      role="alert"
      className="mb-3.5 px-3 py-1.75 rounded-full bg-red-50 border border-red-200 text-[11.5px] text-red-600 text-center"
    >
      {message}
    </div>
  );
}

function SuccessView() {
  return (
    <div className="fade-up flex flex-col items-center gap-3 text-center py-4">
      <span className="pop-in flex items-center justify-center w-16 h-16 rounded-full bg-nexus">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 13l4 4L19 7"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <p className="text-[20px] font-bold text-gray-900 mt-1">Login Successful</p>
      <p className="text-[13px] text-gray-500">Redirecting to Dashboard</p>
    </div>
  );
}

function LoginForm({
  username,
  password,
  isError,
  isLoading,
  showPass,
  remember,
  onUsernameChange,
  onPasswordChange,
  onShowPassToggle,
  onRememberChange,
  onSubmit,
  onForgotPassword,
}) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3" noValidate>
      {/* Username */}
      <FormField label="Username" htmlFor="login-username">
        <InputField
          id="login-username"
          type="text"
          placeholder="Enter Your username"
          value={username}
          onChange={onUsernameChange}
          disabled={isLoading}
          autoComplete="username"
          hasError={isError}
        />
      </FormField>

      {/* Password */}
      <FormField label="Password" htmlFor="login-password">
        <div className="relative flex items-center">
          <InputField
            id="login-password"
            type={showPass ? 'text' : 'password'}
            placeholder="Enter Your Password"
            value={password}
            onChange={onPasswordChange}
            disabled={isLoading}
            autoComplete="current-password"
            hasError={isError}
            className="pr-10"
          />
          <button
            type="button"
            onClick={onShowPassToggle}
            aria-label={showPass ? 'Hide password' : 'Show password'}
            className="absolute right-2.5 flex items-center text-gray-400 hover:text-nexus transition-colors bg-transparent border-none cursor-pointer p-0"
          >
            <EyeToggle isOpen={showPass} />
          </button>
        </div>
      </FormField>

      {/* Remember / Forgot */}
      <div className="flex items-center justify-between mt-0.5">
        <label className="flex items-center gap-1.5 cursor-pointer select-none text-[11.5px] text-[#4a4a4a]">
          <input
            type="checkbox"
            id="remember-me"
            checked={remember}
            onChange={onRememberChange}
            disabled={isLoading}
            className="w-3.5 h-3.5 accent-nexus cursor-pointer"
          />
          Remember me
        </label>
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-[11.5px] text-gray-500 bg-transparent border-none cursor-pointer p-0 hover:text-nexus transition-colors"
        >
          Forgot Password?
        </button>
      </div>

      {/* Submit */}
      <SubmitButton isLoading={isLoading} />
    </form>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // UI state
  const [status, setStatus] = useState('idle'); // idle | error | loading | success
  const [errorMsg, setErrorMsg] = useState('Invalid username or password');

  // ==========================================================================
  // Handlers
  // ==========================================================================

  // Where each role lands after a successful login.
  const ROLE_REDIRECTS = {
    user: '/modules',
    admin: '/admin',
    'super-admin': '/super-admin',
  };

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
        body: JSON.stringify({ username: username.trim(), password }),
      });

      if (!ok) {
        setErrorMsg(data.message || 'Invalid username or password');
        setStatus('error');
        return;
      }

      // Store the authenticated user in global context.
      if (data.user) login(data.user);

      setStatus('success');
      const destination = ROLE_REDIRECTS[data.user?.role] ?? '/modules';
      window.setTimeout(() => navigate(destination), 1600);
    } catch {
      setErrorMsg('Unable to reach the server. Please try again.');
      setStatus('error');
    }
  };

  const handleGoogleSuccess = (credentialResponse) => {
    console.log('Google Login Success:', credentialResponse);
    setStatus('loading');

    setTimeout(() => {
      setStatus('success');
      setTimeout(() => navigate('/modules'), 1600);
    }, 1500);
  };

  const handleGoogleError = () => {
    console.error('Google Login Failed');
    setStatus('error');
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    if (status === 'error') setStatus('idle');
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (status === 'error') setStatus('idle');
  };

  const handleShowPassToggle = () => setShowPass((prev) => !prev);

  const handleRememberChange = (e) => setRemember(e.target.checked);

  const handleForgotPassword = () => navigate('/forgot-password');

  // ==========================================================================
  // Derived state
  // ==========================================================================

  const isError = status === 'error';
  const isLoading = status === 'loading';
  const isSuccess = status === 'success';

  // ==========================================================================
  // Layout classes
  // ==========================================================================

  const pageClasses = 'min-h-screen w-full flex items-center justify-center px-4 py-8 nexus-bg';
  const cardClasses = 'flex rounded-[20px] overflow-hidden w-full max-w-[720px] min-h-[460px] shadow-[0_25px_50px_rgba(0,0,0,0.18)]';
  const panelClasses = 'flex-1 flex flex-col justify-center bg-white pt-9 px-10 pb-8';

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <div className={pageClasses}>
      <div className={cardClasses}>
        <BrandPanel />

        <div className={panelClasses}>
          {/* Header */}
          <div className="text-center mb-5">
            <h1 className="text-[22px] font-extrabold text-gray-900 mb-1">
              Welcome Back
            </h1>
            <p className="text-[11.5px] text-gray-500">
              Sign in to continue managing your business
            </p>
          </div>

          {/* Success State */}
          {isSuccess ? (
            <SuccessView />
          ) : (
            <>
              {/* Error State */}
              {isError && (
                <ErrorBanner message={errorMsg} />
              )}

              {/* Login Form */}
              <LoginForm
                username={username}
                password={password}
                isError={isError}
                isLoading={isLoading}
                showPass={showPass}
                remember={remember}
                onUsernameChange={handleUsernameChange}
                onPasswordChange={handlePasswordChange}
                onShowPassToggle={handleShowPassToggle}
                onRememberChange={handleRememberChange}
                onSubmit={handleSubmit}
                onForgotPassword={handleForgotPassword}
              />

              {/* Divider */}
              <div className="flex items-center gap-3 my-3.5">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-[11px] text-gray-400 whitespace-nowrap">
                  or sign in with google
                </span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Google Sign-In */}
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  size="large"
                  shape="rectangular"
                  text="signin_with"
                  theme="outline"
                  width="100%"
                />
              </div>

              {/* Sign Up Link */}
              <p className="text-center mt-3.5 text-[12px] text-gray-500">
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="text-nexus font-bold no-underline hover:opacity-75 transition-opacity"
                >
                  Sign Up
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}