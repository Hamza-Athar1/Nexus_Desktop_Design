import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, TrendingUp, ShoppingCart } from 'lucide-react';
import NexusLogo from '../components/NexusLogo';

/* ── tiny helpers ─────────────────────────────────────────────────── */
const EyeToggle = ({ open }) =>
  open ? <EyeOff size={14} /> : <Eye size={14} />;

/* ── Mini sparkline SVG chart ─────────────────────────────────────── */
function SparklineChart() {
  const points = [
    [0, 55], [10, 45], [22, 50], [34, 38], [46, 42],
    [58, 30], [70, 35], [82, 28], [94, 32], [100, 25],
  ];
  const toSvg = ([x, y]) => `${x},${y}`;
  const polyline = points.map(toSvg).join(' ');
  return (
    <svg
      viewBox="0 0 100 65"
      preserveAspectRatio="none"
      className="w-full h-full"
    >
      {/* Area fill */}
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4ade80" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,65 ${polyline} 100,65`}
        fill="url(#chartGrad)"
      />
      <polyline
        points={polyline}
        fill="none"
        stroke="#4ade80"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── Left brand panel ─────────────────────────────────────────────── */
function BrandPanel() {
  return (
    <div
      className="hidden md:flex flex-col justify-between p-8"
      style={{
        background: 'linear-gradient(160deg, #1a4a1a 0%, #1e5c1e 55%, #14391a 100%)',
        borderRadius: '20px',
        minWidth: 0,
        flex: '0 0 340px',
      }}
    >
      {/* Top: logo + title */}
      <div className="flex flex-col items-center gap-3 pt-4">
        <NexusLogo size={56} variant="light" />
        <h2
          className="text-white font-bold text-[22px] tracking-wide mt-1"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Nexus Desktop
        </h2>
        <p className="text-[13px]" style={{ color: 'rgba(255,255,255,0.65)' }}>
          Smart POS for every business
        </p>
      </div>

      {/* Stats row */}
      <div className="flex gap-3 mt-6">
        {/* Sales card */}
        <div
          className="flex-1 rounded-xl p-3"
          style={{ background: 'rgba(255,255,255,0.08)' }}
        >
          <p className="text-[10px] font-medium mb-1" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Sales
          </p>
          <p className="text-white font-bold text-[18px]">$12.4k</p>
          <p className="text-[10px] mt-0.5 flex items-center gap-1" style={{ color: '#4ade80' }}>
            <TrendingUp size={10} />
            8% this week
          </p>
        </div>

        {/* Orders card */}
        <div
          className="flex-1 rounded-xl p-3"
          style={{ background: 'rgba(255,255,255,0.08)' }}
        >
          <p className="text-[10px] font-medium mb-1" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Orders
          </p>
          <p className="text-white font-bold text-[18px]">284</p>
          <p className="text-[10px] mt-0.5 flex items-center gap-1" style={{ color: '#4ade80' }}>
            <ShoppingCart size={10} />
            +12 today
          </p>
        </div>
      </div>

      {/* Chart */}
      <div
        className="rounded-xl mt-4 overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.06)', height: '90px', padding: '8px 8px 4px' }}
      >
        <SparklineChart />
      </div>
    </div>
  );
}

/* ── Form field wrapper ───────────────────────────────────────────── */
function Field({ label, htmlFor, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={htmlFor}
        style={{
          fontSize: '12px',
          fontWeight: 600,
          color: '#1a1a1a',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

/* ── Input class helper ───────────────────────────────────────────── */
const inputStyle = (error) => ({
  width: '100%',
  padding: '9px 12px',
  borderRadius: '8px',
  border: error ? '1.5px solid #ef4444' : '1.5px solid transparent',
  background: error ? '#fef2f2' : '#f0f4ec',
  fontSize: '12px',
  color: '#1a1a1a',
  outline: 'none',
  fontFamily: 'Inter, sans-serif',
  transition: 'border-color 0.2s, box-shadow 0.2s',
});

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

/* ── Main LoginPage ───────────────────────────────────────────────── */
export default function LoginPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | error | loading | success

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setStatus('error');
      return;
    }
    setStatus('loading');
    await new Promise(res => setTimeout(res, 2000));
    setStatus('success');
    setTimeout(() => navigate('/modules'), 1600);
  };

  const isError = status === 'error';
  const isLoading = status === 'loading';

  /* Success screen */
  if (status === 'success') {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center px-4 py-8"
        style={{ background: 'linear-gradient(135deg, #eaf0cc 0%, #d6e4a2 45%, #cade8e 100%)' }}
      >
        <div
          className="flex rounded-2xl overflow-hidden shadow-2xl"
          style={{ width: '100%', maxWidth: '720px', minHeight: '460px' }}
        >
          <BrandPanel />
          <div
            className="flex-1 flex flex-col justify-center bg-white"
            style={{ padding: '36px 40px 32px' }}
          >
            {/* Keep the same header */}
            <div className="text-center mb-5">
              <h1
                style={{
                  fontSize: '22px',
                  fontWeight: 800,
                  color: '#1a1a1a',
                  fontFamily: 'Inter, sans-serif',
                  marginBottom: '4px',
                }}
              >
                Welcome Back
              </h1>
              <p style={{ fontSize: '11.5px', color: '#6b7280', fontFamily: 'Inter, sans-serif' }}>
                Sign in to continue managing your business
              </p>
            </div>

            {/* Success icon + messages */}
            <div className="fade-up flex flex-col items-center gap-3 text-center py-4">
              {/* Filled dark-green circle with white checkmark */}
              <span
                className="pop-in"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#1e5c1e',
                }}
              >
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
              <p style={{ fontSize: '20px', fontWeight: 700, color: '#1a1a1a', fontFamily: 'Inter, sans-serif', marginTop: '4px' }}>
                Login Successful
              </p>
              <p style={{ fontSize: '13px', color: '#6b7280', fontFamily: 'Inter, sans-serif' }}>
                Redirecting to Dashboard
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-4 py-8"
      style={{ background: 'linear-gradient(135deg, #eaf0cc 0%, #d6e4a2 45%, #cade8e 100%)' }}
    >
      {/* Outer card container */}
      <div
        className="flex rounded-2xl overflow-hidden shadow-2xl"
        style={{ width: '100%', maxWidth: '720px', minHeight: '460px' }}
      >
        {/* ── Left: Brand panel ───────────────────────────────────── */}
        <BrandPanel />

        {/* ── Right: Login form ───────────────────────────────────── */}
        <div
          className="flex-1 flex flex-col justify-center bg-white"
          style={{ padding: '36px 40px 32px' }}
        >
          {/* Header */}
          <div className="text-center mb-5">
            <h1
              style={{
                fontSize: '22px',
                fontWeight: 800,
                color: '#1a1a1a',
                fontFamily: 'Inter, sans-serif',
                marginBottom: '4px',
              }}
            >
              Welcome Back
            </h1>
            <p style={{ fontSize: '11.5px', color: '#6b7280', fontFamily: 'Inter, sans-serif' }}>
              Sign in to continue managing your business
            </p>
          </div>

          {/* Error banner */}
          {isError && (
            <div
              role="alert"
              style={{
                marginBottom: '14px',
                padding: '7px 12px',
                borderRadius: '20px',
                background: '#fef2f2',
                border: '1px solid #fca5a5',
                fontSize: '11.5px',
                color: '#dc2626',
                textAlign: 'center',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Invalid username or password
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
            {/* Username */}
            <Field label="Username" htmlFor="login-username">
              <input
                id="login-username"
                type="text"
                placeholder="Enter Your username"
                value={username}
                onChange={e => { setUsername(e.target.value); setStatus('idle'); }}
                disabled={isLoading}
                autoComplete="username"
                style={inputStyle(isError)}
                onFocus={e => {
                  if (!isError) {
                    e.target.style.borderColor = '#1e5c1e';
                    e.target.style.boxShadow = '0 0 0 3px rgba(30,92,30,0.12)';
                  }
                }}
                onBlur={e => {
                  if (!isError) {
                    e.target.style.borderColor = 'transparent';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              />
            </Field>

            {/* Password */}
            <Field label="Password" htmlFor="login-password">
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter Your Password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setStatus('idle'); }}
                  disabled={isLoading}
                  autoComplete="current-password"
                  style={{ ...inputStyle(isError), paddingRight: '36px' }}
                  onFocus={e => {
                    if (!isError) {
                      e.target.style.borderColor = '#1e5c1e';
                      e.target.style.boxShadow = '0 0 0 3px rgba(30,92,30,0.12)';
                    }
                  }}
                  onBlur={e => {
                    if (!isError) {
                      e.target.style.borderColor = 'transparent';
                      e.target.style.boxShadow = 'none';
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#9ca3af',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0,
                  }}
                >
                  <EyeToggle open={showPass} />
                </button>
              </div>
            </Field>

            {/* Remember / Forgot row */}
            <div className="flex items-center justify-between" style={{ marginTop: '2px' }}>
              <label
                className="flex items-center gap-1.5 cursor-pointer select-none"
                style={{ fontSize: '11.5px', color: '#4a4a4a', fontFamily: 'Inter, sans-serif' }}
              >
                <input
                  type="checkbox"
                  id="remember-me"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                  disabled={isLoading}
                  style={{ width: '13px', height: '13px', accentColor: '#1e5c1e', cursor: 'pointer' }}
                />
                Remember me
              </label>
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                style={{
                  fontSize: '11.5px',
                  color: '#6b7280',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                  padding: 0,
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#1e5c1e'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#6b7280'; }}
              >
                Forgot Password?
              </button>
            </div>

            {/* Login button */}
            <button
              id="login-btn"
              type="submit"
              disabled={isLoading}
              style={{
                marginTop: '6px',
                width: '100%',
                padding: '11px',
                borderRadius: '8px',
                background: '#1e5c1e',
                color: '#fff',
                fontWeight: 700,
                fontSize: '14px',
                border: 'none',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.8 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontFamily: 'Inter, sans-serif',
                transition: 'background 0.2s, transform 0.1s',
              }}
              onMouseEnter={e => { if (!isLoading) e.currentTarget.style.background = '#14391a'; }}
              onMouseLeave={e => { if (!isLoading) e.currentTarget.style.background = '#1e5c1e'; }}
              onMouseDown={e => { if (!isLoading) e.currentTarget.style.transform = 'scale(0.99)'; }}
              onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              {isLoading ? (
                <>
                  {/* White dot spinner matching mockup */}
                  <span
                    style={{
                      display: 'inline-block',
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: '#fff',
                      flexShrink: 0,
                    }}
                  />
                  Signing in&nbsp;
                  <span className="loading-dots">
                    <span /><span /><span /><span />
                  </span>
                </>
              ) : 'Login'}
            </button>
          </form>

          {/* Divider */}
          <div
            className="flex items-center gap-3"
            style={{ margin: '14px 0 10px' }}
          >
            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
            <span style={{ fontSize: '11px', color: '#9ca3af', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif' }}>
              or sign in with google
            </span>
            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
          </div>

          {/* Google sign-in */}
          <button
            type="button"
            style={{
              width: '100%',
              padding: '9px',
              borderRadius: '8px',
              border: '1.5px solid #e5e7eb',
              background: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#1a1a1a',
              fontFamily: 'Inter, sans-serif',
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#d1d5db';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <GoogleIcon />
            Google
          </button>

          {/* Sign up link */}
          <p
            className="text-center"
            style={{ marginTop: '14px', fontSize: '12px', color: '#6b7280', fontFamily: 'Inter, sans-serif' }}
          >
            Don't have an account?{' '}
            <Link
              to="/signup"
              style={{ color: '#1e5c1e', fontWeight: 700, textDecoration: 'none' }}
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
