import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import NexusLogo from '../components/NexusLogo';

/* ── Shared shell ───────────────────────────────────────────────── */
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
   ForgotPasswordPage  —  Route: /forgot-password
   Full dark-green background · centred glass card
   ═══════════════════════════════════════════════════════════════════ */
export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail]   = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error

  const isLoading = status === 'loading';
  const isSuccess = status === 'success';
  const isError   = status === 'error';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setStatus('error');
      return;
    }
    setStatus('loading');
    await new Promise(res => setTimeout(res, 2000));
    setStatus('success');
  };

  /* ── SUCCESS ─────────────────────────────────────────────────────── */
  if (isSuccess) {
    return (
      <Page>
        <div className="fade-up w-full text-center mt-7">
          <span className="pop-in inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-400/18 border border-green-400/40 mb-4">
            <CheckCircle size={30} color="#4ade80" strokeWidth={1.8} />
          </span>
          <h2 className="text-[22px] font-extrabold text-white mb-2">
            Check Your Email
          </h2>
          <p className="text-[13px] text-white/55 leading-relaxed mb-7">
            We sent a password reset link to<br />
            <span className="text-green-400 font-semibold">{email}</span>
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center gap-2 py-2.75 rounded-[10px] bg-white/10 border border-white/20 text-white text-[13.5px] font-semibold cursor-pointer hover:bg-white/18 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Login
          </button>
        </div>
      </Page>
    );
  }

  /* ── IDLE / ERROR / LOADING ──────────────────────────────────────── */
  return (
    <Page>
      {/* Heading */}
      <h1 className="mt-5 text-2xl font-extrabold text-white text-center tracking-tight">
        Forgot Password
      </h1>
      <p className="mt-1.5 text-[12.5px] text-white/50 text-center leading-[1.55] mb-7">
        Enter your email and we will transmit<br />a secure reset link
      </p>

      {/* Error banner */}
      {isError && (
        <div
          role="alert"
          className="w-full px-3.5 py-2 rounded-full bg-red-500/15 border border-red-500/40 text-[12px] text-red-300 text-center mb-4"
        >
          Please enter a valid email address
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="w-full flex flex-col gap-4">

        {/* Email field */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="fp-email"
            className="text-[10.5px] font-bold tracking-[1.5px] text-white/60 uppercase"
          >
            Email Address
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3 flex items-center pointer-events-none text-white/45">
              <Mail size={15} />
            </span>
            <input
              id="fp-email"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={e => { setEmail(e.target.value); if (status === 'error') setStatus('idle'); }}
              disabled={isLoading}
              autoComplete="email"
              className={[
                'w-full py-2.75 pl-10 pr-3.5 rounded-[10px] text-white text-[13px]',
                'placeholder:text-white/40 outline-none transition-all disabled:opacity-60',
                isError
                  ? 'border border-red-500/60 bg-red-500/8'
                  : 'border border-white/15 bg-white/8 focus:border-green-400/60 focus:ring-[3px] focus:ring-green-400/12',
              ].join(' ')}
            />
          </div>
        </div>

        {/* Send Reset Link CTA */}
        <button
          id="send-reset-btn"
          type="submit"
          disabled={isLoading}
          className={[
            'w-full py-3.5 px-5 rounded-[10px] font-extrabold text-[13px] tracking-[1px] uppercase',
            'border-none flex items-center justify-center gap-2.5 transition-all active:scale-[0.99]',
            isLoading
              ? 'bg-[#c8b96a] text-[#1a3a1a] cursor-not-allowed opacity-85 shadow-[0_4px_16px_rgba(232,216,122,0.15)]'
              : 'bg-nexus-cream text-[#1a3a1a] cursor-pointer hover:bg-[#d4c45a] shadow-[0_4px_16px_rgba(232,216,122,0.25)] hover:shadow-[0_6px_20px_rgba(232,216,122,0.35)]',
          ].join(' ')}
        >
          {isLoading ? (
            <>
              <span className="inline-block w-2.5 h-2.5 rounded-full shrink-0 bg-[#1a3a1a]" />
              Sending&nbsp;
              <span className="loading-dots loading-dots-dark">
                <span /><span /><span /><span />
              </span>
            </>
          ) : (
            <>Send Reset Link <ArrowRight size={15} /></>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="w-full h-px bg-white/10 my-6" />

      {/* Back to login */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 bg-transparent border border-white/18 rounded-lg text-white/70 text-[13px] font-medium px-5 py-2.5 cursor-pointer hover:bg-white/8 hover:text-white transition-all"
      >
        <ArrowLeft size={14} />
        Back to login
      </button>
    </Page>
  );
}
