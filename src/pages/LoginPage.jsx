import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import NexusLogo from '../components/NexusLogo';

const EyeToggle = ({ open }) =>
  open ? <EyeOff size={15} /> : <Eye size={15} />;

function Field({ label, htmlFor, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-[11.5px] font-semibold text-heading tracking-wide">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls = (error) =>
  `w-full px-3 py-2.5 rounded-md border-[1.5px] text-[12px] font-[inherit] outline-none transition-all duration-200
   bg-input text-input-text placeholder-input-ph
   ${error
      ? 'border-red-400 bg-red-50 placeholder-red-300'
      : 'border-transparent focus:border-primary focus:ring-2 focus:ring-primary-ring'}
   disabled:opacity-65 disabled:cursor-not-allowed`.replace(/\s+/g, ' ').trim();

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

  const Brand = () => (
    <div className="flex flex-col items-center gap-2 mb-5">
      <NexusLogo size={38} variant="dark" />
      <span className="text-[13.5px] font-bold tracking-widest text-brand">TRUST NEXUS</span>
      <span className="text-[10px] text-[#4a6a3a] tracking-wide">Smart Business Management Platform</span>
    </div>
  );

  if (status === 'success') {
    return (
      <div className="nexus-bg min-h-screen w-full flex flex-col items-center justify-center px-4 py-8">
        <Brand />
        <div className="bg-white rounded-2xl p-8 w-full max-w-[360px] shadow-lg">
          <div className="text-center mb-5">
            <h1 className="text-2xl font-bold text-heading mb-1">Welcome Back</h1>
            <p className="text-[11.5px] text-muted">Sign in to continue managing your business</p>
          </div>
          <div className="fade-up flex flex-col items-center gap-3 py-6 text-center">
            <span className="pop-in flex items-center justify-center">
              <CheckCircle2 size={60} strokeWidth={1.5} className="text-success" />
            </span>
            <p className="text-[18px] font-bold text-heading">Login Successful</p>
            <p className="text-[12px] text-muted">Redirecting to Dashboard</p>
          </div>
        </div>
      </div>
    );
  }

  const isError = status === 'error';
  const isLoading = status === 'loading';

  return (
    <div className="nexus-bg min-h-screen w-full flex flex-col items-center justify-center px-4 py-8">
      <Brand />

      {/* Card */}
      <div className="bg-white rounded-2xl px-9 pt-8 pb-7 w-full max-w-[360px] shadow-lg">

        {/* Card header */}
        <div className="text-center mb-5">
          <h1 className="text-2xl font-bold text-heading mb-1">Welcome Back</h1>
          <p className="text-[11.5px] text-muted">Sign in to continue managing your business</p>
        </div>

        {/* Error banner */}
        {isError && (
          <div role="alert" className="mb-4 px-3 py-2 rounded-md bg-red-50 border border-red-200 text-[12px] text-error text-center">
            Invalid username or password
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>

          {/* Username */}
          <Field label="Username" htmlFor="login-username">
            <input
              id="login-username"
              className={inputCls(isError)}
              type="text"
              placeholder="Enter Your username"
              value={username}
              onChange={e => { setUsername(e.target.value); setStatus('idle'); }}
              disabled={isLoading}
              autoComplete="username"
            />
          </Field>

          {/* Password */}
          <Field label="Password" htmlFor="login-password">
            <div className="relative flex items-center">
              <input
                id="login-password"
                className={`${inputCls(isError)} pr-10`}
                type={showPass ? 'text' : 'password'}
                placeholder="Enter Your Password"
                value={password}
                onChange={e => { setPassword(e.target.value); setStatus('idle'); }}
                disabled={isLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute right-2.5 text-input-ph hover:text-primary transition-colors"
                onClick={() => setShowPass(v => !v)}
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                <EyeToggle open={showPass} />
              </button>
            </div>
          </Field>

          {/* Remember / Forgot */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-1.5 text-[11.5px] text-[#4a4a4a] cursor-pointer select-none">
              <input
                type="checkbox"
                id="remember-me"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
                disabled={isLoading}
                className="w-3.5 h-3.5 accent-primary cursor-pointer"
              />
              Remember me
            </label>
            <button type="button" className="text-[11.5px] text-muted hover:text-primary transition-colors bg-transparent border-none cursor-pointer font-[inherit]">
              Forgot Password?
            </button>
          </div>

          {/* Submit */}
          <button
            id="login-btn"
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 mt-1 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark active:scale-[0.99] transition-all duration-150 disabled:opacity-80 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <span className="spinner" />
                Signing In...
              </>
            ) : 'Login'}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-[12px] text-muted mt-4">
          Don't have an account?
          <Link to="/signup" className="ml-1 font-semibold text-primary hover:opacity-75 transition-opacity">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
