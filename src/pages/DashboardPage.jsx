import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingCart, Archive, Receipt, BarChart2,
  UserCircle, Settings, Bell, Plus, FileText,
  TrendingUp, Package, Crown, Clock, AlertTriangle, Check,
} from 'lucide-react';
import NexusLogo from '../components/NexusLogo';

const NAV_MAIN = [
  { id: 'dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { id: 'pos',       label: 'POS System', icon: ShoppingCart    },
  { id: 'inventory', label: 'Inventory',  icon: Archive         },
  { id: 'billing',   label: 'Billing',    icon: Receipt         },
  { id: 'reports',   label: 'Reports',    icon: BarChart2       },
];

const NAV_ACCOUNT = [
  { id: 'profile',  label: 'Edit Profile', icon: UserCircle },
  { id: 'settings', label: 'Settings',     icon: Settings   },
];

const RECENT_ACTIVITY = [
  { id: 1, text: 'Bill #1042 created - Rs 3,200', time: '2m',  color: '#4ade80' },
  { id: 2, text: 'Panadol 500mg restocked',        time: '18m', color: '#4ade80' },
  { id: 3, text: 'Low stock - Augmentin',           time: '1h',  color: '#facc15' },
  { id: 4, text: 'Bill #1041 created - Rs 1,800',  time: '2h',  color: '#4ade80' },
];

const LOW_STOCK = [
  { name: 'Augmentin 625mg', qty: 8,  max: 100, color: '#ef4444' },
  { name: 'Panadol CF',      qty: 16, max: 100, color: '#facc15' },
  { name: 'ORD Sachet',      qty: 28, max: 100, color: '#facc15' },
  { name: 'Disprin 300mg',   qty: 55, max: 100, color: '#4ade80' },
];

function pad(n) { return String(n).padStart(2, '0'); }

function useClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

const DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function SectionLabel({ children }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
      <span style={{ fontSize:10, fontWeight:700, letterSpacing:'0.12em', color:'rgba(74,222,128,0.7)', textTransform:'uppercase' }}>{children}</span>
      <div style={{ flex:1, height:1, background:'rgba(74,222,128,0.12)' }} />
    </div>
  );
}

function StatCard({ title, icon: Icon, children }) {
  return (
    <div style={{ flex:1, minWidth:0, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(74,222,128,0.12)', borderRadius:14, padding:'18px 20px', display:'flex', flexDirection:'column', gap:12 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontSize:10, fontWeight:700, letterSpacing:'0.12em', color:'rgba(106,191,105,0.8)', textTransform:'uppercase' }}>{title}</span>
        <Icon size={16} style={{ color:'rgba(74,222,128,0.4)' }} />
      </div>
      {children}
    </div>
  );
}

function QuickActionCard({ icon: Icon, label, sub, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ flex:1, minWidth:0, background:hov?'rgba(30,92,30,0.6)':'rgba(255,255,255,0.03)', border:hov?'1px solid rgba(74,222,128,0.35)':'1px solid rgba(74,222,128,0.12)', borderRadius:14, padding:'16px 20px', display:'flex', alignItems:'center', gap:16, cursor:'pointer', transition:'all 0.2s', textAlign:'left' }}>
      <span style={{ display:'flex', alignItems:'center', justifyContent:'center', width:40, height:40, borderRadius:10, background:hov?'rgba(74,222,128,0.2)':'rgba(74,222,128,0.1)', border:'1px solid rgba(74,222,128,0.2)', flexShrink:0, transition:'background 0.2s' }}>
        <Icon size={18} style={{ color:'#4ade80' }} />
      </span>
      <div>
        <p style={{ fontSize:14, fontWeight:700, color:'#fff', margin:0 }}>{label}</p>
        <p style={{ fontSize:11, color:'rgba(255,255,255,0.4)', margin:0 }}>{sub}</p>
      </div>
    </button>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const time = useClock();
  const [active, setActive] = useState('dashboard');

  const hours   = pad(time.getHours());
  const minutes = pad(time.getMinutes());
  const dayName = DAYS[time.getDay()];
  const dateStr = time.getDate() + ' ' + MONTHS[time.getMonth()] + ' ' + time.getFullYear();

  const nb = { width:'100%', display:'flex', alignItems:'center', gap:12, padding:'10px 12px', borderRadius:12, fontSize:13, fontWeight:500, border:'none', cursor:'pointer', transition:'all 0.2s', background:'transparent' };

  return (
    <div style={{ display:'flex', height:'100vh', width:'100%', overflow:'hidden', background:'#0a1f0a', fontFamily:'Inter, sans-serif' }}>

      {/* Sidebar */}
      <aside style={{ width:210, flexShrink:0, display:'flex', flexDirection:'column', height:'100%', background:'linear-gradient(180deg,#0d2b0d 0%,#0a1f0a 100%)', borderRight:'1px solid rgba(74,222,128,0.08)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'0 20px', height:60, flexShrink:0, borderBottom:'1px solid rgba(74,222,128,0.08)' }}>
          <NexusLogo size={26} variant="light" />
          <span style={{ color:'rgba(255,255,255,0.55)', fontSize:10, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase' }}>User-Dashboard</span>
        </div>
        <nav style={{ flex:1, overflowY:'auto', padding:'20px 12px', display:'flex', flexDirection:'column', gap:2 }}>
          <p style={{ fontSize:9, fontWeight:700, letterSpacing:'0.18em', color:'rgba(255,255,255,0.28)', textTransform:'uppercase', padding:'0 8px', marginBottom:8, marginTop:0 }}>Main</p>
          {NAV_MAIN.map(({ id, label, icon: Icon }) => {
            const on = active===id;
            return (
              <button key={id} onClick={()=>setActive(id)} style={{ ...nb, background:on?'#1e5c1e':'transparent', color:on?'#fff':'rgba(255,255,255,0.45)', boxShadow:on?'0 0 14px rgba(74,222,128,0.15)':'none' }}>
                <Icon size={16} style={{ color:on?'#4ade80':'currentColor', flexShrink:0 }} />{label}
              </button>
            );
          })}
          <p style={{ fontSize:9, fontWeight:700, letterSpacing:'0.18em', color:'rgba(255,255,255,0.28)', textTransform:'uppercase', padding:'0 8px', marginBottom:8, marginTop:20 }}>Account</p>
          {NAV_ACCOUNT.map(({ id, label, icon: Icon }) => {
            const on = active===id;
            return (
              <button key={id} onClick={()=>setActive(id)} style={{ ...nb, background:on?'#1e5c1e':'transparent', color:on?'#fff':'rgba(255,255,255,0.45)' }}>
                <Icon size={16} style={{ color:on?'#4ade80':'currentColor', flexShrink:0 }} />{label}
              </button>
            );
          })}
        </nav>
        <div style={{ margin:'0 12px 16px', padding:'14px 16px', borderRadius:14, background:'rgba(74,222,128,0.06)', border:'1px solid rgba(74,222,128,0.14)' }}>
          <p style={{ fontSize:9, color:'rgba(74,222,128,0.6)', fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', margin:'0 0 2px' }}>Plan</p>
          <p style={{ fontSize:20, fontWeight:900, color:'#fff', margin:'0 0 8px', lineHeight:1.1 }}>PRO</p>
          <div style={{ height:4, borderRadius:99, background:'rgba(255,255,255,0.08)', overflow:'hidden', marginBottom:6 }}>
            <div style={{ height:'100%', width:'82%', borderRadius:99, background:'#4ade80' }} />
          </div>
          <p style={{ fontSize:11, color:'rgba(255,255,255,0.38)', margin:0 }}>18 days left</p>
        </div>
      </aside>

      {/* Right */}
      <div style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        {/* Topbar */}
        <header style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px', height:60, flexShrink:0, background:'#0d2b0d', borderBottom:'1px solid rgba(74,222,128,0.08)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <NexusLogo size={22} variant="light" />
            <span style={{ color:'rgba(255,255,255,0.45)', fontSize:10, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase' }}>USER-DASHBOARD</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <button style={{ position:'relative', background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.45)', display:'flex', alignItems:'center' }}>
              <Bell size={18} />
              <span style={{ position:'absolute', top:-2, right:-2, width:8, height:8, borderRadius:'50%', background:'#4ade80' }} />
            </button>
            <div style={{ display:'flex', alignItems:'center', gap:6, padding:'4px 12px', borderRadius:99, background:'rgba(74,222,128,0.08)', border:'1px solid rgba(74,222,128,0.2)' }}>
              <span style={{ width:7, height:7, borderRadius:'50%', background:'#4ade80', display:'inline-block' }} />
              <span style={{ fontSize:12, color:'#4ade80', fontWeight:600 }}>Online</span>
            </div>
            <button style={{ padding:'6px 14px', borderRadius:8, fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.75)', background:'transparent', cursor:'pointer', border:'1px solid rgba(74,222,128,0.25)' }}>
              Pharmacy Module
            </button>
            <div style={{ width:34, height:34, borderRadius:'50%', background:'linear-gradient(135deg,#2e7d32,#1e5c1e)', border:'2px solid rgba(74,222,128,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#fff', flexShrink:0 }}>AK</div>
          </div>
        </header>

        {/* Main */}
        <main style={{ flex:1, overflowY:'auto', padding:'28px 32px', display:'flex', flexDirection:'column', gap:24 }}>
          {/* Greeting */}
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16 }}>
            <div>
              <h1 style={{ fontSize:30, fontWeight:900, color:'#fff', margin:'0 0 6px', lineHeight:1.1 }}>{getGreeting()}, Ahmed</h1>
              <p style={{ fontSize:13, color:'rgba(255,255,255,0.38)', margin:0, display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                <span>{dayName}</span>
                <span style={{ width:4, height:4, borderRadius:'50%', background:'rgba(255,255,255,0.25)', display:'inline-block' }} />
                <span>{dateStr}</span>
                <span style={{ width:4, height:4, borderRadius:'50%', background:'rgba(255,255,255,0.25)', display:'inline-block' }} />
                <span>Pharmacy module</span>
              </p>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0, padding:'8px 16px', borderRadius:12, background:'rgba(74,222,128,0.06)', border:'1px solid rgba(74,222,128,0.15)' }}>
              <span style={{ fontSize:16, fontFamily:'monospace', fontWeight:700, color:'#fff', letterSpacing:'0.05em' }}>{hours}:{minutes}</span>
              <span style={{ fontSize:11, color:'rgba(74,222,128,0.7)', fontWeight:600 }}>PKT</span>
            </div>
          </div>

          {/* Summary */}
          <section style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <SectionLabel>Summary</SectionLabel>
            <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
              <StatCard title="Today's Sales" icon={ShoppingCart}>
                <div>
                  <p style={{ fontSize:28, fontWeight:900, color:'#fff', margin:'0 0 4px' }}>Rs 84,200</p>
                  <p style={{ fontSize:12, color:'#4ade80', fontWeight:600, margin:0, display:'flex', alignItems:'center', gap:4 }}>
                    <TrendingUp size={13} />+12% vs yesterday
                  </p>
                </div>
              </StatCard>
              <StatCard title="Inventory" icon={Archive}>
                <div>
                  <p style={{ fontSize:28, fontWeight:900, color:'#fff', margin:'0 0 4px' }}>1,340</p>
                  <p style={{ fontSize:12, color:'#f59e0b', fontWeight:600, margin:0, display:'flex', alignItems:'center', gap:4 }}>
                    <AlertTriangle size={12} />8 items low stock
                  </p>
                </div>
              </StatCard>
              <StatCard title="Subscription" icon={Crown}>
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:8, width:'fit-content', background:'rgba(74,222,128,0.1)', border:'1px solid rgba(74,222,128,0.22)' }}>
                    <Check size={13} style={{ color:'#4ade80' }} />
                    <span style={{ fontSize:13, fontWeight:700, color:'#4ade80' }}>PRO ACTIVE</span>
                  </div>
                  <p style={{ fontSize:11, color:'rgba(255,255,255,0.35)', margin:0 }}>Renews Jul 17, 2026</p>
                </div>
              </StatCard>
            </div>
          </section>

          {/* Quick Actions */}
          <section style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <SectionLabel>Quick Actions</SectionLabel>
            <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
              <QuickActionCard icon={Plus}      label="Add item"     sub="Add to inventory" onClick={()=>setActive('inventory')} />
              <QuickActionCard icon={FileText}  label="Create bill"  sub="New transactions" onClick={()=>setActive('billing')}   />
              <QuickActionCard icon={BarChart2} label="View reports" sub="Sales analytics"  onClick={()=>setActive('reports')}   />
            </div>
          </section>

          {/* Bottom panels */}
          <div style={{ display:'flex', gap:16, flexWrap:'wrap', paddingBottom:8 }}>
            <div style={{ flex:1, minWidth:260, background:'rgba(255,255,255,0.025)', border:'1px solid rgba(74,222,128,0.1)', borderRadius:14, padding:20 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
                <Clock size={14} style={{ color:'#4ade80' }} />
                <span style={{ fontSize:10, fontWeight:700, letterSpacing:'0.12em', color:'rgba(74,222,128,0.75)', textTransform:'uppercase' }}>Recent Activity</span>
              </div>
              <ul style={{ listStyle:'none', margin:0, padding:0, display:'flex', flexDirection:'column', gap:12 }}>
                {RECENT_ACTIVITY.map(item => (
                  <li key={item.id} style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <span style={{ width:8, height:8, borderRadius:'50%', background:item.color, flexShrink:0 }} />
                    <span style={{ flex:1, fontSize:13, color:'rgba(255,255,255,0.65)' }}>{item.text}</span>
                    <span style={{ fontSize:11, color:'rgba(255,255,255,0.28)', flexShrink:0 }}>{item.time}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ flex:1, minWidth:260, background:'rgba(255,255,255,0.025)', border:'1px solid rgba(74,222,128,0.1)', borderRadius:14, padding:20 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
                <Package size={14} style={{ color:'#4ade80' }} />
                <span style={{ fontSize:10, fontWeight:700, letterSpacing:'0.12em', color:'rgba(74,222,128,0.75)', textTransform:'uppercase' }}>Low Stock</span>
              </div>
              <ul style={{ listStyle:'none', margin:0, padding:0, display:'flex', flexDirection:'column', gap:14 }}>
                {LOW_STOCK.map(item => (
                  <li key={item.name}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                      <span style={{ fontSize:13, color:'rgba(255,255,255,0.65)' }}>{item.name}</span>
                      <span style={{ fontSize:12, fontWeight:700, color:item.color }}>{item.qty}</span>
                    </div>
                    <div style={{ height:5, borderRadius:99, background:'rgba(255,255,255,0.07)', overflow:'hidden' }}>
                      <div style={{ height:'100%', borderRadius:99, width:((item.qty/item.max)*100)+'%', background:item.color, transition:'width 0.5s ease' }} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
