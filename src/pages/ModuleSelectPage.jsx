import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRound } from 'lucide-react';
import NexusLogo from '../components/NexusLogo';

const MODULES = [
  { id: 'pharmacy',      name: 'Pharmacy',      desc: 'Manage medicines\nand prescriptions', emoji: '💊' },
  { id: 'grocery',       name: 'Grocery',       desc: '',  emoji: '🛒' },
  { id: 'electronics',   name: 'Electronics',   desc: '',  emoji: '💻' },
  { id: 'bakery',        name: 'Bakery',        desc: '',  emoji: '🧁' },
  { id: 'restaurant',    name: 'Restaurant',    desc: '',  emoji: '🍽️' },
  { id: 'general-store', name: 'General Store', desc: '',  emoji: '🏪' },
  { id: 'clothing',      name: 'Clothing',      desc: '',  emoji: '👕' },
];

export default function ModuleSelectPage() {
  const navigate = useNavigate();
  const [active, setActive] = useState(null);

  return (
    <div className="nexus-bg min-h-screen w-full flex flex-col">

      <header className="w-full bg-primary flex items-center justify-between px-5 h-[54px] flex-shrink-0 shadow-md">
        <NexusLogo size={34} variant="light" />
        <button
          id="logout-btn"
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-white text-[13px] font-medium px-2.5 py-1.5 rounded-md hover:bg-white/10 transition-colors cursor-pointer border-none bg-transparent font-[inherit]"
        >
          <span>Logout</span>
          <span className="flex items-center justify-center w-[30px] h-[30px] bg-white/20 rounded-full">
            <UserRound size={17} />
          </span>
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center px-8 py-10 gap-8">

        {/* Page title */}
        <div className="text-center">
          <h1 className="text-[22px] font-bold text-heading mb-1">Choose Your Business Module</h1>
          <p className="text-[13px] text-[#5a7a4a]">Select a module that matches your business</p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-4 gap-4 justify-center" role="list">
          {MODULES.map(mod => (
            <button
              key={mod.id}
              id={`module-${mod.id}`}
              role="listitem"
              aria-pressed={active === mod.id}
              onClick={() => setActive(mod.id)}
              className={[
                'w-40 flex flex-col items-center gap-2 px-4 pt-6 pb-5 rounded-xl border-2 cursor-pointer font-[inherit]',
                'bg-white shadow-sm transition-all duration-200',
                'hover:-translate-y-0.5 hover:shadow-md hover:border-primary active:scale-[0.975]',
                active === mod.id
                  ? 'border-primary bg-green-50'
                  : 'border-transparent',
              ].join(' ')}
            >
              <span className="text-[34px] leading-none" role="img" aria-label={mod.name}>
                {mod.emoji}
              </span>
              <span className="text-[13px] font-semibold text-heading text-center">
                {mod.name}
              </span>
              {mod.desc && (
                <span className="text-[10.5px] text-muted text-center whitespace-pre-line leading-snug">
                  {mod.desc}
                </span>
              )}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
