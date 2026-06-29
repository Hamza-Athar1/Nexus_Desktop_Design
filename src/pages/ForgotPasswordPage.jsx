import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import NexusLogo from '../components/NexusLogo';

/* ═══════════════════════════════════════════════════════════════════
   ForgotPasswordPage  —  Route: /forgot-password
   Full dark-green background with a single centred card
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

  /* ── shared styles ──────────────────────────────────────────────── */
  const page = {
    minHeight: '100vh',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(160deg, #1a4a1a 0%, #1e5c1e 55%, #14391a 100%)',
    fontFamily: 'Inter, sans-serif',
    padding: '24px',
  };

  /* Glass card */
  const card = {
    width: '100%',
    maxWidth: '400px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.14)',
    borderRadius: '20px',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    padding: '40px 36px 36px',
    boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0',
  };

  /* ── SUCCESS state ──────────────────────────────────────────────── */
  if (isSuccess) {
    return (
      <div style={page}>
        <div style={card}>
          {/* Logo */}
          <NexusLogo size={48} variant="light" />
          <p
            style={{
              marginTop: '10px',
              fontSize: '10.5px',
              fontWeight: 700,
              letterSpacing: '2px',
              color: 'rgba(255,255,255,0.5)',
              textTransform: 'uppercase',
            }}
          >
            Nexus Desktop
          </p>

          <div className="fade-up" style={{ width: '100%', textAlign: 'center', marginTop: '28px' }}>
            {/* Success icon */}
            <span
              className="pop-in"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(74,222,128,0.18)',
                border: '1.5px solid rgba(74,222,128,0.4)',
                marginBottom: '16px',
              }}
            >
              <CheckCircle size={30} color="#4ade80" strokeWidth={1.8} />
            </span>

            <h2
              style={{
                fontSize: '22px',
                fontWeight: 800,
                color: '#ffffff',
                marginBottom: '8px',
              }}
            >
              Check Your Email
            </h2>
            <p
              style={{
                fontSize: '13px',
                color: 'rgba(255,255,255,0.55)',
                lineHeight: 1.6,
                marginBottom: '28px',
              }}
            >
              We sent a password reset link to<br />
              <span style={{ color: '#4ade80', fontWeight: 600 }}>{email}</span>
            </p>

            {/* Back to login */}
            <button
              onClick={() => navigate('/')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '11px',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff',
                fontSize: '13.5px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
            >
              <ArrowLeft size={14} />
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── IDLE / ERROR / LOADING state ──────────────────────────────── */
  return (
    <div style={page}>
      <div style={card}>

        {/* Brand mark */}
        <NexusLogo size={48} variant="light" />
        <p
          style={{
            marginTop: '10px',
            fontSize: '10.5px',
            fontWeight: 700,
            letterSpacing: '2px',
            color: 'rgba(255,255,255,0.5)',
            textTransform: 'uppercase',
          }}
        >
          Nexus Desktop
        </p>

        {/* Heading */}
        <h1
          style={{
            marginTop: '20px',
            fontSize: '24px',
            fontWeight: 800,
            color: '#ffffff',
            textAlign: 'center',
            letterSpacing: '-0.3px',
          }}
        >
          Forgot Password
        </h1>
        <p
          style={{
            marginTop: '6px',
            fontSize: '12.5px',
            color: 'rgba(255,255,255,0.5)',
            textAlign: 'center',
            lineHeight: 1.55,
            marginBottom: '28px',
          }}
        >
          Enter your email and we will transmit<br />a secure reset link
        </p>

        {/* Error banner */}
        {isError && (
          <div
            role="alert"
            style={{
              width: '100%',
              padding: '8px 14px',
              borderRadius: '20px',
              background: 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.4)',
              fontSize: '12px',
              color: '#fca5a5',
              textAlign: 'center',
              marginBottom: '16px',
            }}
          >
            Please enter a valid email address
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          noValidate
          style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
          {/* Email field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label
              htmlFor="fp-email"
              style={{
                fontSize: '10.5px',
                fontWeight: 700,
                letterSpacing: '1.5px',
                color: 'rgba(255,255,255,0.6)',
                textTransform: 'uppercase',
              }}
            >
              Email Address
            </label>

            {/* Input with icon */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              {/* Mail icon */}
              <span
                style={{
                  position: 'absolute',
                  left: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  color: isError ? '#fca5a5' : 'rgba(255,255,255,0.45)',
                  pointerEvents: 'none',
                }}
              >
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
                style={{
                  width: '100%',
                  padding: '11px 14px 11px 38px',
                  borderRadius: '10px',
                  border: isError
                    ? '1.5px solid rgba(239,68,68,0.6)'
                    : '1.5px solid rgba(255,255,255,0.15)',
                  background: isError
                    ? 'rgba(239,68,68,0.08)'
                    : 'rgba(255,255,255,0.08)',
                  color: '#fff',
                  fontSize: '13px',
                  fontFamily: 'Inter, sans-serif',
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={e => {
                  if (!isError) {
                    e.target.style.borderColor = 'rgba(74,222,128,0.6)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(74,222,128,0.12)';
                  }
                }}
                onBlur={e => {
                  if (!isError) {
                    e.target.style.borderColor = 'rgba(255,255,255,0.15)';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              />
            </div>
          </div>

          {/* Send Reset Link button — cream/ivory colored like the mockup */}
          <button
            id="send-reset-btn"
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '13px 20px',
              borderRadius: '10px',
              background: isLoading ? '#c8b96a' : '#e8d87a',
              color: '#1a3a1a',
              fontWeight: 800,
              fontSize: '13px',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              fontFamily: 'Inter, sans-serif',
              transition: 'background 0.2s, transform 0.1s',
              boxShadow: '0 4px 16px rgba(232,216,122,0.25)',
            }}
            onMouseEnter={e => { if (!isLoading) { e.currentTarget.style.background = '#d4c45a'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(232,216,122,0.35)'; } }}
            onMouseLeave={e => { if (!isLoading) { e.currentTarget.style.background = '#e8d87a'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(232,216,122,0.25)'; } }}
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
                    background: '#1a3a1a',
                    flexShrink: 0,
                  }}
                />
                Sending&nbsp;
                <span className="loading-dots" style={{ '--dot-color': '#1a3a1a' }}>
                  <span style={{ background: '#1a3a1a' }} />
                  <span style={{ background: '#1a3a1a' }} />
                  <span style={{ background: '#1a3a1a' }} />
                  <span style={{ background: '#1a3a1a' }} />
                </span>
              </>
            ) : (
              <>
                Send Reset Link
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        {/* Separator */}
        <div
          style={{
            width: '100%',
            height: '1px',
            background: 'rgba(255,255,255,0.1)',
            margin: '24px 0 20px',
          }}
        />

        {/* Back to login */}
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            background: 'none',
            border: '1px solid rgba(255,255,255,0.18)',
            borderRadius: '8px',
            color: 'rgba(255,255,255,0.7)',
            fontSize: '13px',
            fontWeight: 500,
            padding: '9px 20px',
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'none';
            e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
          }}
        >
          <ArrowLeft size={14} />
          Back to login
        </button>
      </div>
    </div>
  );
}
