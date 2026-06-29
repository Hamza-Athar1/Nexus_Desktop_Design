import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, TrendingUp, ShoppingCart } from 'lucide-react';
import NexusLogo from '../components/NexusLogo';

/* ── Eye toggle ───────────────────────────────────────────────────── */
const EyeToggle = ({ open }) => open ? <EyeOff size={14} /> : <Eye size={14} />;

/* ── Sparkline SVG ────────────────────────────────────────────────── */
function SparklineChart() {
  const pts = [[0,55],[10,45],[22,50],[34,38],[46,42],[58,30],[70,35],[82,28],[94,32],[100,25]];
  const line = pts.map(([x,y]) => `${x},${y}`).join(' ');
  return (
    <svg viewBox="0 0 100 65" preserveAspectRatio="none" className="w-full h-full">
      <defs>
        <linearGradient id="sgGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#4ade80" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#4ade80" stopOpacity="0"    />
        </linearGradient>
      </defs>
      <polygon points={`0,65 ${line} 100,65`} fill="url(#sgGrad)" />
      <polyline points={line} fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Left brand panel ─────────────────────────────────────────────── */
function BrandPanel() {
  return (
    <div className="hidden md:flex flex-col justify-between p-8 nexus-panel min-w-0 flex-[0_0_320px]">
      {/* Logo + name */}
      <div className="flex flex-col items-center gap-3 pt-4">
        <NexusLogo size={56} variant="light" />
        <h2 className="text-white font-bold text-[22px] tracking-wide mt-1">Nexus Desktop</h2>
      </div>

      {/* Hero text */}
      <div className="flex flex-col gap-3 mb-2">
        <p className="text-[32px] font-black leading-[1.1] tracking-tight text-green-400 uppercase">
          SMART<br />BUSINESS<br />STARTS HERE
        </p>
        <p className="text-[12px] text-white/55 leading-relaxed">
          Create your business account<br />and unlock the Nexus ecosystem.
        </p>
      </div>

      {/* Stats */}
      <div className="flex gap-3">
        <div className="flex-1 rounded-xl p-3 bg-white/[0.08]">
          <p className="text-[10px] font-medium mb-1 text-white/55">Sales</p>
          <p className="text-white font-bold text-[18px]">$12.4k</p>
          <p className="text-[10px] mt-0.5 flex items-center gap-1 text-green-400">
            <TrendingUp size={10} /> 8% this week
          </p>
        </div>
        <div className="flex-1 rounded-xl p-3 bg-white/[0.08]">
          <p className="text-[10px] font-medium mb-1 text-white/55">Orders</p>
          <p className="text-white font-bold text-[18px]">284</p>
          <p className="text-[10px] mt-0.5 flex items-center gap-1 text-green-400">
            <ShoppingCart size={10} /> +12 today
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-xl overflow-hidden mt-3 bg-white/[0.06] h-[80px] p-2 pb-1">
        <SparklineChart />
      </div>
    </div>
  );
}

/* ── Form field wrapper ───────────────────────────────────────────── */
function Field({ label, htmlFor, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={htmlFor} className="text-[12px] font-semibold text-gray-900">
        {label}
      </label>
      {children}
    </div>
  );
}

/* ── Input class helper ───────────────────────────────────────────── */
const inputCls = (hasError) => [
  'w-full px-3 py-[9px] rounded-lg border-[1.5px] text-[12px] text-gray-900',
  'outline-none transition-all placeholder:text-gray-400 disabled:opacity-60',
  hasError
    ? 'border-red-400 bg-red-50 placeholder:text-red-300'
    : 'border-transparent bg-[#f0f4ec] focus:border-nexus focus:ring-[3px] focus:ring-nexus/10',
].join(' ');

/* ── Google icon ──────────────────────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SignUpPage — Route: /signup
   ═══════════════════════════════════════════════════════════════════ */
export default function SignUpPage() {
  const navigate = useNavigate();

  const [form, setForm]     = useState({ businessName: '', businessType: '', email: '', username: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [status, setStatus]     = useState('idle'); // idle | error | loading | success
  const [errorMsg, setErrorMsg] = useState('');

  const set = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    if (status === 'error') setStatus('idle');
  };

  const validate = () => {
    if (!form.businessName.trim()) return 'Business name is required';
    if (!form.businessType.trim()) return 'Business type is required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) return 'A valid email is required';
    if (!form.username.trim()) return 'Username is required';
    if (form.password.length < 6)  return 'Password must be at least 6 characters';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setErrorMsg(err); setStatus('error'); return; }
    setStatus('loading');
    await new Promise(res => setTimeout(res, 2000));
    setStatus('success');
    setTimeout(() => navigate('/'), 2000);
  };

  const isError   = status === 'error';
  const isLoading = status === 'loading';

  /* shared shells */
  const pageWrap  = 'min-h-screen w-full flex items-center justify-center px-4 py-8 nexus-bg';
  const outerCard = 'flex rounded-[20px] overflow-hidden w-full max-w-[760px] min-h-[520px] shadow-[0_25px_50px_rgba(0,0,0,0.18)]';
  const rightPanel = 'flex-1 flex flex-col justify-center bg-white pt-8 px-9 pb-7';

  /* ── SUCCESS ─────────────────────────────────────────────────────── */
  if (status === 'success') {
    return (
      <div className={pageWrap}>
        <div className={outerCard}>
          <BrandPanel />
          <div className={rightPanel}>
            <div className="text-center mb-5">
              <h1 className="text-[22px] font-extrabold text-gray-900 mb-1">Create Account</h1>
              <p className="text-[11.5px] text-gray-500">Get started in less than a minute</p>
            </div>
            <div className="fade-up flex flex-col items-center gap-3 text-center py-6">
              <span className="pop-in flex items-center justify-center w-16 h-16 rounded-full bg-nexus">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <p className="text-[20px] font-bold text-gray-900 mt-1">Account Created!</p>
              <p className="text-[13px] text-gray-500">Redirecting to Login</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── IDLE / ERROR / LOADING ──────────────────────────────────────── */
  return (
    <div className={pageWrap}>
      <div className={outerCard}>
        <BrandPanel />

        <div className={rightPanel}>
          {/* Header */}
          <div className="text-center mb-4">
            <h1 className="text-[22px] font-extrabold text-gray-900 mb-1">Create Account</h1>
            <p className="text-[11.5px] text-gray-500">Get started in less than a minute</p>
          </div>

          {/* Error banner */}
          {isError && (
            <div
              role="alert"
              className="mb-3 px-3 py-[7px] rounded-full bg-red-50 border border-red-200 text-[11.5px] text-red-600 text-center"
            >
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>

            {/* Business Name */}
            <Field label="Business Name" htmlFor="su-biz-name">
              <input
                id="su-biz-name"
                type="text"
                placeholder="Enter your business name"
                value={form.businessName}
                onChange={set('businessName')}
                disabled={isLoading}
                autoComplete="organization"
                className={inputCls(isError && !form.businessName.trim())}
              />
            </Field>

            {/* Business Type */}
            <Field label="Business Type" htmlFor="su-biz-type">
              <input
                id="su-biz-type"
                type="text"
                placeholder="Enter your business type"
                value={form.businessType}
                onChange={set('businessType')}
                disabled={isLoading}
                className={inputCls(isError && !form.businessType.trim())}
              />
            </Field>

            {/* Email */}
            <Field label="Email" htmlFor="su-email">
              <input
                id="su-email"
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={set('email')}
                disabled={isLoading}
                autoComplete="email"
                className={inputCls(isError && (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)))}
              />
            </Field>

            {/* Username */}
            <Field label="Username" htmlFor="su-username">
              <input
                id="su-username"
                type="text"
                placeholder="Enter your username"
                value={form.username}
                onChange={set('username')}
                disabled={isLoading}
                autoComplete="username"
                className={inputCls(isError && !form.username.trim())}
              />
            </Field>

            {/* Password */}
            <Field label="Password" htmlFor="su-password">
              <div className="relative flex items-center">
                <input
                  id="su-password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter your Password"
                  value={form.password}
                  onChange={set('password')}
                  disabled={isLoading}
                  autoComplete="new-password"
                  className={`${inputCls(isError && form.password.length < 6)} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 flex items-center text-gray-400 hover:text-nexus transition-colors bg-transparent border-none cursor-pointer p-0"
                >
                  <EyeToggle open={showPass} />
                </button>
              </div>
            </Field>

            {/* Submit */}
            <button
              id="create-account-btn"
              type="submit"
              disabled={isLoading}
              className={[
                'mt-1 w-full flex items-center justify-center gap-2 py-[11px] rounded-lg',
                'bg-nexus text-white text-sm font-bold border-none transition-all active:scale-[0.99]',
                isLoading
                  ? 'cursor-not-allowed opacity-85'
                  : 'cursor-pointer hover:bg-nexus-dark',
              ].join(' ')}
            >
              {isLoading ? (
                <>
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-white shrink-0" />
                  Signing up&nbsp;
                  <span className="loading-dots"><span /><span /><span /><span /></span>
                </>
              ) : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-[11px] text-gray-400 whitespace-nowrap">or sign up with Google</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Google */}
          <button
            type="button"
            className="w-full py-[9px] rounded-lg border-[1.5px] border-gray-200 bg-white cursor-pointer flex items-center justify-center gap-2 text-[13px] font-semibold text-gray-900 hover:border-gray-300 hover:shadow-md transition-all"
          >
            <GoogleIcon />
            Google
          </button>

          {/* Login link */}
          <p className="text-center mt-3 text-[12px] text-gray-500">
            Already have an account?{' '}
            <Link to="/" className="text-nexus font-bold no-underline hover:opacity-75 transition-opacity">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
