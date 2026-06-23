import { useState } from 'react';
import { Link } from 'react-router-dom';
import NexusLogo from '../components/NexusLogo';

/* ── Eye icon ──────────────────────────────────────────────────────── */
function EyeIcon({ open }) {
  return open ? (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ) : (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

/* ── Shared input class ────────────────────────────────────────────── */
const inputCls =
  'w-full px-3 py-2.5 rounded-md border-[1.5px] border-transparent text-[12px] font-[inherit] outline-none transition-all duration-200 bg-input text-input-text placeholder-input-ph focus:border-primary focus:ring-2 focus:ring-primary-ring';

/* ── Field wrapper ─────────────────────────────────────────────────── */
function Field({ label, htmlFor, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-[11.5px] font-semibold text-heading">
        {label}
      </label>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SignUpPage — Route: /signup
   Split layout: hero text left | registration card right
   ═══════════════════════════════════════════════════════════════════ */
export default function SignUpPage() {
  const [form, setForm] = useState({
    businessName: '',
    businessType: '',
    email:        '',
    username:     '',
    password:     '',
  });
  const [showPass, setShowPass] = useState(false);

  const set = (field) => (e) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: real registration logic
  };

  return (
    <div className="nexus-bg min-h-screen w-full flex flex-row">

      {/* ── Left hero panel ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center px-14 py-16 gap-5">
        <h1 className="text-[52px] font-black leading-[1.05] uppercase tracking-tight text-brand">
          SMART<br />BUSINESS<br />STARTS HERE
        </h1>
        <p className="text-[13px] text-[#4a6a3a] leading-relaxed">
          Create your business account<br />
          and unlock the Nexus ecosystem.
        </p>
      </div>

      {/* ── Right panel ────────────────────────────────────────────── */}
      <div className="w-[460px] flex-shrink-0 flex flex-col items-center justify-center px-8 py-10 gap-4">

        {/* Brand */}
        <div className="flex flex-col items-center gap-1.5">
          <NexusLogo size={36} variant="dark" />
          <span className="text-[13.5px] font-bold tracking-widest text-brand">TRUST NEXUS</span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl px-7 pt-7 pb-6 w-full max-w-[400px] shadow-lg">

          {/* Card header */}
          <div className="text-center mb-5">
            <h1 className="text-[22px] font-bold text-heading mb-1">Create Account</h1>
            <p className="text-[12px] text-muted">Get started in less than a minute</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5" noValidate>

            {/* Business Name + Business Type */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Business Name" htmlFor="su-biz-name">
                <input
                  id="su-biz-name"
                  className={inputCls}
                  type="text"
                  value={form.businessName}
                  onChange={set('businessName')}
                  autoComplete="organization"
                />
              </Field>
              <Field label="Business Type" htmlFor="su-biz-type">
                <input
                  id="su-biz-type"
                  className={inputCls}
                  type="text"
                  value={form.businessType}
                  onChange={set('businessType')}
                />
              </Field>
            </div>

            {/* Email */}
            <Field label="Email" htmlFor="su-email">
              <input
                id="su-email"
                className={inputCls}
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={set('email')}
                autoComplete="email"
              />
            </Field>

            {/* Username */}
            <Field label="Username" htmlFor="su-username">
              <input
                id="su-username"
                className={inputCls}
                type="text"
                placeholder="Enter your username"
                value={form.username}
                onChange={set('username')}
                autoComplete="username"
              />
            </Field>

            {/* Password */}
            <Field label="Password" htmlFor="su-password">
              <div className="relative flex items-center">
                <input
                  id="su-password"
                  className={`${inputCls} pr-10`}
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter your Password"
                  value={form.password}
                  onChange={set('password')}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute right-2.5 text-input-ph hover:text-primary transition-colors"
                  onClick={() => setShowPass(v => !v)}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon open={showPass} />
                </button>
              </div>
            </Field>

            {/* Submit */}
            <button
              id="create-account-btn"
              type="submit"
              className="w-full py-3 mt-1 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark active:scale-[0.99] transition-all duration-150"
            >
              Create Account
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-[12px] text-muted mt-3.5">
            Already have an account?
            <Link to="/" className="ml-1 font-semibold text-primary hover:opacity-75 transition-opacity">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
