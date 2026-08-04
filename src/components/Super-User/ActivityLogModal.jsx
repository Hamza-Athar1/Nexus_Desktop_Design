import { useState, useEffect } from 'react';
import { LogIn, Edit, Receipt, Monitor, Key, ShieldAlert, MessageSquare, HelpCircle } from 'lucide-react';
import { apiFetchJson } from '../../lib/api';

const EVENT_ICONS = {
  login:   LogIn,
  edit:    Edit,
  bill:    Receipt,
  pos:     Monitor,
  key:     Key,
  status:  ShieldAlert,
  message: MessageSquare,
  other:   HelpCircle,
};

function fmtTs(isoTs) {
  if (!isoTs) return '—';
  const d = new Date(isoTs);
  const diffMs = Date.now() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 2)  return 'Just now';
  if (diffHours < 1) return `${diffMins} minutes ago`;
  if (diffDays === 0) return `Today, ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  if (diffDays === 1) return `Yesterday, ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ActivityLogModal({ shop, onClose }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  useEffect(() => {
    if (!shop) return;
    setActivities([]);
    setError('');
    setLoading(true);
    apiFetchJson(`/admin/shops/${shop.id}/activity`).then(({ ok, data }) => {
      if (ok) setActivities(data.activity || []);
      else    setError(data?.message || 'Failed to load activity.');
      setLoading(false);
    });
  }, [shop]);

  if (!shop) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-[#efeacb] rounded-[24px] border border-[#bfbc9b] p-8 w-full max-w-[440px] shadow-2xl flex flex-col text-[#152f16] gap-6">
        <div>
          <h3 className="text-3xl font-bold font-serif text-[#152f16] leading-tight">Activity log</h3>
          <p className="text-sm font-semibold text-[#55694a] mt-1">
            {shop.business} — last 30 days
          </p>
        </div>

        <div className="flex flex-col gap-4 max-h-[360px] overflow-y-auto pr-1">
          {loading && <p className="text-sm text-[#607455]">Loading…</p>}
          {error   && <p className="text-sm text-[#a93b3b]">{error}</p>}
          {!loading && !error && activities.length === 0 && (
            <p className="text-sm text-[#607455]">No activity in the last 30 days.</p>
          )}
          {!loading && !error && activities.map((act) => {
            const Icon = EVENT_ICONS[act.event_type] || HelpCircle;
            return (
              <div key={act.id} className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#b2bc9e]/40 bg-[#fdfcf3] text-[#152f16]">
                  <Icon size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-[#152f16] leading-snug">{act.description}</span>
                  <span className="text-xs font-semibold text-[#55694a] mt-0.5">{fmtTs(act.created_at)}</span>
                </div>
              </div>
            );
          })}
        </div>

        <button type="button" onClick={onClose}
          className="w-full py-4 bg-[#0d3b1b] text-[#efeacb] text-lg font-bold rounded-xl hover:bg-[#072410] transition cursor-pointer">
          Close
        </button>
      </div>
    </div>
  );
}
