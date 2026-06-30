import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, CreditCard, ReceiptText, UserCog,
  Grid2x2, ShieldCheck, Settings, Bell, AlertTriangle,
  TrendingUp, UserCheck, DollarSign, Clock, Check,
} from 'lucide-react';
import NexusLogo from '../components/NexusLogo';

const NAV_MAIN = [
  { id: 'dashboard',     label: 'Dashboard',    icon: LayoutDashboard },
  { id: 'users',         label: 'Users',         icon: Users           },
  { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard      },
  { id: 'payments',      label: 'Payments',      icon: ReceiptText     },
  { id: 'fbr',           label: 'FBR users',     icon: UserCog         },
  { id: 'modules',       label: 'Modules',       icon: Grid2x2         },
];
const NAV_ACCOUNT = [
  { id: 'security', label: 'Security', icon: ShieldCheck },
  { id: 'settings', label: 'Settings', icon: Settings    },
];

const INITIAL_QUEUE = [
  { id:1, business:'AL-Shifa Pharmacy', module:'Pharmacy', plan:'PRO',   planBg:'rgba(74,222,128,0.14)', planText:'#4ade80', status:'pending' },
  { id:2, business:'Karachi Grocers',   module:'Grocery',  plan:'BASIC', planBg:'rgba(59,130,246,0.14)', planText:'#60a5fa', status:'pending' },
  { id:3, business:'Style Hub',         module:'Clothing', plan:'TRIAL', planBg:'rgba(251,191,36,0.14)', planText:'#fbbf24', status:'pending' },
];

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

function SectionLabel({ children }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
      <span style={{ fontSize:10, fontWeight:700, letterSpacing:'0.12em', color:'rgba(74,222,128,0.7)', textTransform:'uppercase' }}>{children}</span>
      <div style={{ flex:1, height:1, background:'rgba(74,222,128,0.12)' }} />
    </div>
  );
}

function StatCard({ title, icon: Icon, value, sub, subColor, highlight }) {
  return (
    <div style={{
      flex:1, minWidth:0,
      background: highlight ? 'rgba(251,191,36,0.06)' : 'rgba(255,255,255,0.03)',
      border: highlight ? '1px solid rgba(251,191,36,0.25)' : '1px solid rgba(74,222,128,0.12)',
      borderRadius:14, padding:'18px 20px',
      display:'flex', flexDirection:'column', gap:10,
    }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color: highlight ? 'rgba(251,191,36,0.75)' : 'rgba(106,191,105,0.8)' }}>{title}</span>
        <Icon size={16} style={{ color: highlight ? 'rgba(251,191,36,0.45)' : 'rgba(74,222,128,0.4)' }} />
      </div>
      <p style={{ fontSize:30, fontWeight:900, color:'#fff', margin:0, lineHeight:1 }}>{value}</p>
      <p style={{ fontSize:12, fontWeight:600, margin:0, color: subColor, display:'flex', alignItems:'center', gap:4 }}>{sub}</p>
    </div>
  );
}

function PlanBadge({ plan, bg, text }) {
  return (
    <span style={{ display:'inline-block', padding:'3px 12px', borderRadius:6, background:bg, color:text, fontSize:12, fontWeight:700, letterSpacing:'0.04em', border:'1px solid ' + text + '55' }}>{plan}</span>
  );
}

function QuickLink({ label, sub, icon: Icon, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ flex:1, minWidth:160, background:hov?'rgba(30,92,30,0.6)':'rgba(255,255,255,0.025)', border:hov?'1px solid rgba(74,222,128,0.35)':'1px solid rgba(74,222,128,0.1)', borderRadius:14, padding:'16px 20px', display:'flex', alignItems:'center', gap:14, cursor:'pointer', transition:'all 0.2s', textAlign:'left' }}>
      <span style={{ display:'flex', alignItems:'center', justifyContent:'center', width:38, height:38, borderRadius:10, background:hov?'rgba(74,222,128,0.2)':'rgba(74,222,128,0.08)', border:'1px solid rgba(74,222,128,0.15)', flexShrink:0, transition:'background 0.2s' }}>
        <Icon size={17} style={{ color:'#4ade80' }} />
      </span>
      <div>
        <p style={{ fontSize:13, fontWeight:700, color:'#fff', margin:0 }}>{label}</p>
        <p style={{ fontSize:11, color:'rgba(255,255,255,0.38)', margin:0 }}>{sub}</p>
      </div>
    </button>
  );
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [active, setActive] = useState('dashboard');
  const [queue,  setQueue]  = useState(INITIAL_QUEUE);

  const now     = new Date();
  const pending = queue.filter(q => q.status === 'pending').length;
  const dateStr = DAYS[now.getDay()] + String.fromCharCode(32,183,32) + now.getDate() + ' ' + MONTHS[now.getMonth()] + ' ' + now.getFullYear();

  function approve(id) { setQueue(q => q.map(r => r.id === id ? { ...r, status:'approved' } : r)); }
  function reject(id)  { setQueue(q => q.filter(r => r.id !== id)); }

  const nb = { width:'100%', display:'flex', alignItems:'center', gap:12, padding:'10px 12px', borderRadius:12, fontSize:13, fontWeight:500, border:'none', cursor:'pointer', transition:'all 0.2s', background:'transparent' };

  return (
    <div style={{ display:'flex', height:'100vh', width:'100%', overflow:'hidden', background:'#0a1f0a', fontFamily:'Inter, sans-serif' }}>

      <aside style={{ width:200, flexShrink:0, display:'flex', flexDirection:'column', height:'100%', background:'linear-gradient(180deg,#0d2b0d 0%,#0a1f0a 100%)', borderRight:'1px solid rgba(74,222,128,0.08)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'0 18px', height:64, flexShrink:0, borderBottom:'1px solid rgba(74,222,128,0.08)' }}>
          <NexusLogo size={26} variant='light' />
          <span style={{ color:'rgba(255,255,255,0.55)', fontSize:10, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase' }}>Admin-Dashboard</span>
        </div>
        <nav style={{ flex:1, overflowY:'auto', padding:'20px 10px', display:'flex', flexDirection:'column', gap:2 }}>
          <p style={{ fontSize:9, fontWeight:700, letterSpacing:'0.18em', color:'rgba(255,255,255,0.28)', textTransform:'uppercase', padding:'0 8px', marginBottom:8, marginTop:0 }}>Main</p>
          {NAV_MAIN.map(({ id, label, icon: Icon }) => {
            const on = active === id;
            return (
              <button key={id} onClick={() => setActive(id)} style={{ ...nb, background:on?'#1e5c1e':'transparent', color:on?'#fff':'rgba(255,255,255,0.45)', boxShadow:on?'0 0 14px rgba(74,222,128,0.15)':'none' }}>
                <Icon size={15} style={{ color:on?'#4ade80':'currentColor', flexShrink:0 }} />{label}
              </button>
            );
          })}
          <p style={{ fontSize:9, fontWeight:700, letterSpacing:'0.18em', color:'rgba(255,255,255,0.28)', textTransform:'uppercase', padding:'0 8px', marginBottom:8, marginTop:20 }}>Account</p>
          {NAV_ACCOUNT.map(({ id, label, icon: Icon }) => {
            const on = active === id;
            return (
              <button key={id} onClick={() => setActive(id)} style={{ ...nb, background:on?'#1e5c1e':'transparent', color:on?'#fff':'rgba(255,255,255,0.45)' }}>
                <Icon size={15} style={{ color:on?'#4ade80':'currentColor', flexShrink:0 }} />{label}
              </button>
            );
          })}
        </nav>
      </aside>

      <div style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <header style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 28px', height:64, flexShrink:0, background:'#0d2b0d', borderBottom:'1px solid rgba(74,222,128,0.08)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <NexusLogo size={22} variant='light' />
            <span style={{ color:'rgba(255,255,255,0.45)', fontSize:10, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase' }}>ADMIN-DASHBOARD</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <button style={{ position:'relative', background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.45)', display:'flex', alignItems:'center' }}>
              <Bell size={18} />
              {pending > 0 && <span style={{ position:'absolute', top:-3, right:-3, width:8, height:8, borderRadius:'50%', background:'#fbbf24' }} />}
            </button>
            {pending > 0 && (
              <div style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 12px', borderRadius:8, background:'rgba(251,191,36,0.1)', border:'1px solid rgba(251,191,36,0.3)' }}>
                <AlertTriangle size={13} style={{ color:'#fbbf24' }} />
                <span style={{ fontSize:12, color:'#fbbf24', fontWeight:600 }}>{pending} pending</span>
              </div>
            )}
            <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,#2e7d32,#1e5c1e)', border:'2px solid rgba(74,222,128,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#fff', flexShrink:0 }}>AA</div>
          </div>
        </header>

        <main style={{ flex:1, overflowY:'auto', padding:'28px 32px', display:'flex', flexDirection:'column', gap:24 }}>

          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16 }}>
            <div>
              <h1 style={{ fontSize:32, fontWeight:900, color:'#fff', margin:'0 0 6px', lineHeight:1.1 }}>Welcome, Ali</h1>
              <p style={{ fontSize:13, color:'rgba(255,255,255,0.4)', margin:0 }}>Control Centre &nbsp;&middot;&nbsp; {dateStr}</p>
            </div>
            <button style={{ padding:'8px 20px', borderRadius:99, fontSize:13, fontWeight:700, cursor:'pointer', background:'transparent', border:'1px solid rgba(74,222,128,0.35)', color:'#4ade80', display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
              <span style={{ width:7, height:7, borderRadius:'50%', background:'#4ade80', display:'inline-block' }} />
              System healthy
            </button>
          </div>

          <section style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <SectionLabel>Platform Summary</SectionLabel>
            <div style={{ display:'flex', gap:14, flexWrap:'wrap' }}>
              <StatCard title='Total Users' icon={Users} value='248' sub={<><TrendingUp size={12}/>&nbsp;+14 this month</>} subColor='#4ade80' />
              <StatCard title='Active Subs' icon={UserCheck} value='201' sub='81% of users' subColor='rgba(255,255,255,0.45)' />
              <StatCard title='Revenue' icon={DollarSign} value='2.4M' sub={<><TrendingUp size={12}/>&nbsp;+8% MoM</>} subColor='#4ade80' />
              <StatCard title='Pending' icon={Clock} value={String(pending)} sub='ACTION REQUIRED' subColor='#ef4444' highlight={true} />
            </div>
          </section>

          <section style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <SectionLabel>Approval Queue</SectionLabel>
            <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(74,222,128,0.1)', borderRadius:14, overflow:'hidden' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr 0.8fr 0.9fr 1.1fr', padding:'12px 24px', borderBottom:'1px solid rgba(74,222,128,0.08)', background:'rgba(74,222,128,0.03)' }}>
                {['Business','Module','Plan','Status','Action'].map(h => (
                  <span key={h} style={{ fontSize:10, fontWeight:700, letterSpacing:'0.12em', color:'rgba(74,222,128,0.6)', textTransform:'uppercase' }}>{h}</span>
                ))}
              </div>
              {queue.length === 0 && (
                <div style={{ padding:'32px 24px', textAlign:'center', color:'rgba(255,255,255,0.3)', fontSize:13 }}>No pending approvals</div>
              )}
              {queue.map((row, i) => (
                <div key={row.id} style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr 0.8fr 0.9fr 1.1fr', padding:'16px 24px', alignItems:'center', borderBottom: i < queue.length-1 ? '1px solid rgba(74,222,128,0.06)' : 'none' }}>
                  <span style={{ fontSize:14, fontWeight:700, color:'#fff' }}>{row.business}</span>
                  <span style={{ fontSize:13, color:'rgba(74,222,128,0.75)', fontWeight:500 }}>{row.module}</span>
                  <span><PlanBadge plan={row.plan} bg={row.planBg} text={row.planText} /></span>
                  <span>
                    {row.status === 'approved'
                      ? <span style={{ fontSize:13, fontWeight:600, color:'rgba(74,222,128,0.65)', display:'flex', alignItems:'center', gap:4 }}><Check size={13}/>Approved</span>
                      : <span style={{ fontSize:13, fontWeight:500, color:'rgba(255,255,255,0.3)' }}>Pending</span>
                    }
                  </span>
                  <div style={{ display:'flex', gap:8 }}>
                    {row.status === 'approved' ? (
                      <span style={{ fontSize:13, fontWeight:600, color:'rgba(74,222,128,0.65)', display:'flex', alignItems:'center', gap:4 }}><Check size={13}/>Approved</span>
                    ) : (
                      <>
                        <button onClick={() => approve(row.id)} style={{ padding:'5px 12px', borderRadius:7, fontSize:12, fontWeight:700, cursor:'pointer', background:'rgba(74,222,128,0.12)', color:'#4ade80', border:'1px solid rgba(74,222,128,0.25)', transition:'all 0.2s' }}>Approve</button>
                        <button onClick={() => reject(row.id)}  style={{ padding:'5px 12px', borderRadius:7, fontSize:12, fontWeight:700, cursor:'pointer', background:'rgba(239,68,68,0.1)', color:'#f87171', border:'1px solid rgba(239,68,68,0.22)', transition:'all 0.2s' }}>Reject</button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <SectionLabel>Quick Actions</SectionLabel>
            <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
              <QuickLink label='Manage Users'  sub='View and edit accounts' icon={Users}       onClick={() => setActive('users')} />
              <QuickLink label='Subscriptions' sub='Plans and renewals'      icon={CreditCard}  onClick={() => setActive('subscriptions')} />
              <QuickLink label='Payment Logs'  sub='Transaction history'     icon={ReceiptText} onClick={() => setActive('payments')} />
              <QuickLink label='Module Config' sub='Enable and disable'      icon={Grid2x2}     onClick={() => setActive('modules')} />
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}