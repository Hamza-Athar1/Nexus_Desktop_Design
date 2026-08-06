import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import NexusLogo from '../components/NexusLogo';
import { apiFetchJson } from '../lib/api';

/* ── Shared shell (matches ForgotPasswordPage) ─────────────────────── */
function Page({ children }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center px-6 py-6 nexus-bg">
      <div className="nexus-dark-bg w-full max-w-100 flex flex-col items-center bg-white/6 border border-white/[0.14] rounded-[20px] backdrop-blur-xl pt-10 px-9 pb-9 shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
        <NexusLogo size={48} variant="light" />
        <p className="mt-2.5 text-[10.5px] font-bold tracking-[2px] text-white/50 uppercase">
          Nexus Desktop
        </p>
        {children}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   ResetPasswordPage  —  Route: /reset-password?token=...
   Consumes the link sent by ForgotPasswordPage.
   ═══════════════════════════════════════════════════════════════════ */
export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');

  const isLoading = status === 'loading';
  const isSuccess = status === 'success';
  const isError = status === 'error';

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setErrorMsg('This reset link is missing its token. Please request a new one.');
      setStatus('error');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      setStatus('error');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      setStatus('error');
      return;
    }

    setStatus('loading');
    try {
      const { ok, data } = await apiFetchJson('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      });

      if (!ok) {
        setErrorMsg(data.message || 'This reset link is invalid or has expired');
        setStatus('error');
        return;
      }

      setStatus('success');
      window.setTimeout(() => navigate('/login'), 2000);
    } catch {
      setErrorMsg('Unable to reach the server. Please try again.');
      setStatus('error');
    }
  };

  /* ── SUCCESS ─────────────────────────────────────────────────────── */
  if (isSuccess) {
    return (
      <Page>
        <div className="fade-up w-full text-center mt-7">
          <span className="pop-in inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-400/18 border border-green-400/40 mb-4">
            <CheckCircle size={30} color="#4ade80" strokeWidth={1.8} />
          </span>
          <h2 className="text-[22px] font-extrabold text-white mb-2">Password Updated</h2>
          <p className="text-[13px] text-white/55 leading-relaxed mb-7">
            Redirecting you to login&hellip;
          </p>
        </div>
      </Page>
    );
  }

  /* ── IDLE / ERROR / LOADING ──────────────────────────────────────── */
  return (
    <Page>
      <h1 className="mt-5 text-2xl font-extrabold text-white text-center tracking-tight">
        Set a New Password
      </h1>
      <p className="mt-1.5 text-[12.5px] text-white/50 text-center leading-[1.55] mb-7">
        Choose a new password for your account
      </p>

      {isError && (
        <div
          role="alert"
          className="w-full px-3.5 py-2 rounded-full bg-red-500/15 border border-red-500/40 text-[12px] text-red-300 text-center mb-4"
        >
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="w-full flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="rp-password"
            className="text-[10.5px] font-bold tracking-[1.5px] text-white/60 uppercase"
          >
            New Password
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3 flex items-center pointer-events-none text-white/45">
              <Lock size={15} />
            </span>
            <input
              id="rp-password"
              type={showPass ? 'text' : 'password'}
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => { setPassword(e.target.value); if (status === 'error') setStatus('idle'); }}
              disabled={isLoading}
              autoComplete="new-password"
              className="w-full py-2.75 pl-10 pr-10 rounded-[10px] text-white text-[13px] placeholder:text-white/40 outline-none transition-all disabled:opacity-60 border border-white/15 bg-white/8 focus:border-green-400/60 focus:ring-[3px] focus:ring-green-400/12"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 text-white/45 hover:text-white/80 transition-colors cursor-pointer bg-transparent border-none p-0 flex items-center"
            >
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="rp-confirm"
            className="text-[10.5px] font-bold tracking-[1.5px] text-white/60 uppercase"
          >
            Confirm Password
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3 flex items-center pointer-events-none text-white/45">
              <Lock size={15} />
            </span>
            <input
              id="rp-confirm"
              type={showPass ? 'text' : 'password'}
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); if (status === 'error') setStatus('idle'); }}
              disabled={isLoading}
              autoComplete="new-password"
              className="w-full py-2.75 pl-10 pr-3.5 rounded-[10px] text-white text-[13px] placeholder:text-white/40 outline-none transition-all disabled:opacity-60 border border-white/15 bg-white/8 focus:border-green-400/60 focus:ring-[3px] focus:ring-green-400/12"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={[
            'w-full py-3.5 px-5 rounded-[10px] font-extrabold text-[13px] tracking-[1px] uppercase',
            'border-none flex items-center justify-center gap-2.5 transition-all active:scale-[0.99]',
            isLoading
              ? 'bg-[#c8b96a] text-[#1a3a1a] cursor-not-allowed opacity-85'
              : 'bg-nexus-cream text-[#1a3a1a] cursor-pointer hover:bg-[#d4c45a] shadow-[0_4px_16px_rgba(232,216,122,0.25)]',
          ].join(' ')}
        >
          {isLoading ? (
            <>
              <span className="inline-block w-2.5 h-2.5 rounded-full shrink-0 bg-[#1a3a1a]" />
              Updating&nbsp;
              <span className="loading-dots loading-dots-dark"><span /><span /><span /><span /></span>
            </>
          ) : (
            <>Update Password <ArrowRight size={15} /></>
          )}
        </button>
      </form>

      <div className="w-full h-px bg-white/10 my-6" />

      <Link
        to="/login"
        className="flex items-center gap-2 bg-transparent border border-white/18 rounded-lg text-white/70 text-[13px] font-medium px-5 py-2.5 cursor-pointer hover:bg-white/8 hover:text-white transition-all no-underline"
      >
        <ArrowLeft size={14} />
        Back to login
      </Link>
    </Page>
  );
}
