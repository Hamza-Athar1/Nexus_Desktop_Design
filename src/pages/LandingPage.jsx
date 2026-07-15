import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-6 py-12 nexus-bg select-none">
      <div className="flex flex-col items-center max-w-lg w-full text-center space-y-8 animate-fade-in">
        {/* Logo */}
        <div className="transform hover:scale-105 transition-transform duration-300">
          <img 
            src="/Nexus.png" 
            alt="Nexus Logo" 
            className="w-48 h-auto object-contain drop-shadow-md"
          />
        </div>

        {/* Subtitle / Tagline */}
        <div className="space-y-3">
          <p className="text-[11px] md:text-xs font-semibold tracking-[0.25em] text-[#14391a]/80 font-mono">
            -- SMART POS, REIMAGINED --
          </p>
          
          <h1 className="text-4xl md:text-5xl font-bold font-serif text-[#14391a] tracking-wide leading-tight">
            NEXUS DESKTOP
          </h1>
        </div>

        {/* Description */}
        <div className="space-y-1 font-mono text-[12px] md:text-[13px] text-[#14391a]/95 leading-relaxed max-w-sm mx-auto">
          <p>Sales, inventory, and reports – all in one place.</p>
          <p>Run your business from a single screen.</p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 pt-4 w-full max-w-xs sm:max-w-md mx-auto">
          <button
            onClick={() => navigate('/signup')}
            className="w-full sm:w-40 py-3.5 bg-[#14391a] hover:bg-[#0f2a13] text-white text-[13px] font-bold tracking-[0.08em] rounded-lg shadow-[0_10px_20px_rgba(20,57,26,0.25)] hover:shadow-[0_12px_24px_rgba(20,57,26,0.35)] transform hover:-translate-y-0.5 transition-all duration-200 cursor-pointer text-center uppercase"
          >
            Sign Up
          </button>
          
          <button
            onClick={() => navigate('/login')}
            className="w-full sm:w-40 py-3.5 bg-[#f0ecc5] hover:bg-[#e6e2b8] text-[#14391a] text-[13px] font-bold tracking-[0.08em] rounded-lg border border-[#14391a]/15 shadow-[0_10px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)] transform hover:-translate-y-0.5 transition-all duration-200 cursor-pointer text-center uppercase"
          >
            Log In
          </button>
        </div>
      </div>
    </div>
  );
}
