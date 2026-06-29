import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, TrendingUp, ShoppingCart } from 'lucide-react';
import NexusLogo from '../components/NexusLogo';

/* ── Eye toggle ───────────────────────────────────────────────────── */
const EyeToggle = ({ open }) =>
  open ? <EyeOff size={14} /> : <Eye size={14} />;

/* ── Sparkline (reused from Login) ───────────────────────────────── */
function SparklineChart() {
  const points = [
    [0, 55], [10, 45], [22, 50], [34, 38], [46, 42],
    [58, 30], [70, 35], [82, 28], [94, 32], [100, 25],
  ];
  const polyline = points.map(([x, y]) => `${x},${y}`).join(' ');
  return (
    <svg viewBox="0 0 100 65" preserveAspectRatio="none" className="w-full h-full">
      <defs>
        <linearGradient id="sgChartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4ade80" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,65 ${polyline} 100,65`} fill="url(#sgChartGrad)" />
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
        borderRadius: '20px 0 0 20px',
        minWidth: 0,
        flex: '0 0 320px',
      }}
    >
      {/* Logo + name */}
      <div className="flex flex-col items-center gap-3 pt-4">
        <NexusLogo size={56} variant="light" />
        <h2
          className="text-white font-bold text-[22px] tracking-wide mt-1"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Nexus Desktop
        </h2>
      </div>

      {/* Hero text */}
      <div className="flex flex-col gap-3 mb-2">
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 900,
            fontSize: '32px',
            lineHeight: 1.1,
            letterSpacing: '-0.5px',
            color: '#4ade80',
            textTransform: 'uppercase',
          }}
        >
          SMART<br />BUSINESS<br />STARTS HERE
        </p>
        <p
          style={{
            fontSize: '12px',
            color: 'rgba(255,255,255,0.55)',
            fontFamily: 'Inter, sans-serif',
            lineHeight: 1.6,
          }}
        >
          Create your business account<br />
          and unlock the Nexus ecosystem.
        </p>
      </div>

      {/* Stats */}
      <div className="flex gap-3">
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
        className="rounded-xl overflow-hidden mt-3"
        style={{ background: 'rgba(255,255,255,0.06)', height: '80px', padding: '8px 8px 4px' }}
      >
        <SparklineChart />
      </div>
    </div>
  );
}

/* ── Field wrapper ────────────────────────────────────────────────── */
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

/* ── Input style helper ───────────────────────────────────────────── */
const inputStyle = (hasError) => ({
  width: '100%',
  padding: '9px 12px',
  borderRadius: '8px',
  border: hasError ? '1.5px solid #ef4444' : '1.5px solid transparent',
  background: hasError ? '#fef2f2' : '#f0f4ec',
  fontSize: '12px',
  color: '#1a1a1a',
  outline: 'none',
  fontFamily: 'Inter, sans-serif',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  boxSizing: 'border-box',
});

const focusOn = (e, hasError) => {
  if (!hasError) {
    e.target.style.borderColor = '#1e5c1e';
    e.target.style.boxShadow = '0 0 0 3px rgba(30,92,30,0.12)';
  }
};
const focusOff = (e, hasError) => {
  if (!hasError) {
    e.target.style.borderColor = 'transparent';
    e.target.style.boxShadow = 'none';
  }
};

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
   SignUpPage
   ═══════════════════════════════════════════════════════════════════ */
export default function SignUpPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    businessName: '',
    businessType: '',
    email: '',
    username: '',
    password: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | error | loading | success
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
    if (form.password.length < 6) return 'Password must be at least 6 characters';
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
    await new Promise(res => setTimeout(res, 2000));
    setStatus('success');
    setTimeout(() => navigate('/'), 2000);
  };

  const isError   = status === 'error';
  const isLoading = status === 'loading';

  const pageWrap = {
    background: 'linear-gradient(135deg, #eaf0cc 0%, #d6e4a2 45%, #cade8e 100%)',
  };
  const outerCard = {
    width: '100%',
    maxWidth: '760px',
    minHeight: '520px',
    display: 'flex',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 25px 50px rgba(0,0,0,0.18)',
  };

  /* ── Success screen ─────────────────────────────────────────────── */
  if (status === 'success') {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center px-4 py-8"
        style={pageWrap}
      >
        <div style={outerCard}>
          <BrandPanel />
          <div
            className="flex-1 flex flex-col justify-center bg-white"
            style={{ padding: '36px 40px 32px' }}
          >
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
                Create Account
              </h1>
              <p style={{ fontSize: '11.5px', color: '#6b7280', fontFamily: 'Inter, sans-serif' }}>
                Get started in less than a minute
              </p>
            </div>

            <div className="fade-up flex flex-col items-center gap-3 text-center py-6">
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
                Account Created!
              </p>
              <p style={{ fontSize: '13px', color: '#6b7280', fontFamily: 'Inter, sans-serif' }}>
                Redirecting to Login
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Normal / Error / Loading screen ───────────────────────────── */
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-4 py-8"
      style={pageWrap}
    >
      <div style={outerCard}>
        {/* Left brand panel */}
        <BrandPanel />

        {/* Right form panel */}
        <div
          className="flex-1 flex flex-col justify-center bg-white"
          style={{ padding: '32px 36px 28px' }}
        >
          {/* Header */}
          <div className="text-center mb-4">
            <h1
              style={{
                fontSize: '22px',
                fontWeight: 800,
                color: '#1a1a1a',
                fontFamily: 'Inter, sans-serif',
                marginBottom: '3px',
              }}
            >
              Create Account
            </h1>
            <p style={{ fontSize: '11.5px', color: '#6b7280', fontFamily: 'Inter, sans-serif' }}>
              Get started in less than a minute
            </p>
          </div>

          {/* Error banner */}
          {isError && (
            <div
              role="alert"
              style={{
                marginBottom: '12px',
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
                style={inputStyle(isError && !form.businessName.trim())}
                onFocus={e => focusOn(e, isError && !form.businessName.trim())}
                onBlur={e  => focusOff(e, isError && !form.businessName.trim())}
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
                style={inputStyle(isError && !form.businessType.trim())}
                onFocus={e => focusOn(e, isError && !form.businessType.trim())}
                onBlur={e  => focusOff(e, isError && !form.businessType.trim())}
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
                style={inputStyle(isError && (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)))}
                onFocus={e => focusOn(e, false)}
                onBlur={e  => focusOff(e, false)}
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
                style={inputStyle(isError && !form.username.trim())}
                onFocus={e => focusOn(e, isError && !form.username.trim())}
                onBlur={e  => focusOff(e, isError && !form.username.trim())}
              />
            </Field>

            {/* Password */}
            <Field label="Password" htmlFor="su-password">
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  id="su-password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter your Password"
                  value={form.password}
                  onChange={set('password')}
                  disabled={isLoading}
                  autoComplete="new-password"
                  style={{ ...inputStyle(isError && form.password.length < 6), paddingRight: '36px' }}
                  onFocus={e => focusOn(e, isError && form.password.length < 6)}
                  onBlur={e  => focusOff(e, isError && form.password.length < 6)}
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

            {/* Submit */}
            <button
              id="create-account-btn"
              type="submit"
              disabled={isLoading}
              style={{
                marginTop: '4px',
                width: '100%',
                padding: '11px',
                borderRadius: '8px',
                background: '#1e5c1e',
                color: '#fff',
                fontWeight: 700,
                fontSize: '14px',
                border: 'none',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.85 : 1,
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
                  Signing up&nbsp;
                  <span className="loading-dots">
                    <span /><span /><span /><span />
                  </span>
                </>
              ) : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3" style={{ margin: '12px 0 10px' }}>
            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
            <span style={{ fontSize: '11px', color: '#9ca3af', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif' }}>
              or sign up with Google
            </span>
            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
          </div>

          {/* Google button */}
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

          {/* Login link */}
          <p
            className="text-center"
            style={{ marginTop: '12px', fontSize: '12px', color: '#6b7280', fontFamily: 'Inter, sans-serif' }}
          >
            Already have an account?{' '}
            <Link
              to="/"
              style={{ color: '#1e5c1e', fontWeight: 700, textDecoration: 'none' }}
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
