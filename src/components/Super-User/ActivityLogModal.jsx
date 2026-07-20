import React from 'react';
import { LogIn, Edit, Receipt, Monitor, Key } from 'lucide-react';

const MOCK_ACTIVITIES = {
  1: [
    { id: 1, type: 'login', text: 'Logged in from Karachi, PK', time: 'Today, 9:14 AM', icon: LogIn },
    { id: 2, type: 'edit', text: 'Updated shop address', time: 'Jul 17, 2026', icon: Edit },
    { id: 3, type: 'bill', text: 'Bill payment received - Rs 4,500', time: 'Jul 17, 2026', icon: Receipt },
    { id: 4, type: 'pos', text: 'Added new POS terminal', time: 'Jul 09, 2026', icon: Monitor },
    { id: 5, type: 'key', text: 'Password changed', time: 'Jun 28, 2026', icon: Key },
  ],
  2: [
    { id: 1, type: 'login', text: 'Logged in from Lahore, PK', time: 'Today, 10:45 AM', icon: LogIn },
    { id: 2, type: 'bill', text: 'Bill payment received - Rs 3,500', time: 'Jul 17, 2026', icon: Receipt },
    { id: 3, type: 'edit', text: 'Updated catalog items', time: 'Jul 12, 2026', icon: Edit },
  ],
  3: [
    { id: 1, type: 'login', text: 'Logged in from Islamabad, PK', time: 'Yesterday, 11:20 PM', icon: LogIn },
    { id: 2, type: 'bill', text: 'Payment reminder sent', time: 'Today, 9:00 AM', icon: Receipt },
    { id: 3, type: 'key', text: 'Password reset requested', time: 'Jul 15, 2026', icon: Key },
  ],
  4: [
    { id: 1, type: 'edit', text: 'Plan upgrade request submitted', time: '4 days ago', icon: Edit },
    { id: 2, type: 'login', text: 'Logged in from Rawalpindi, PK', time: '5 days ago', icon: LogIn },
  ],
  5: [
    { id: 1, type: 'pos', text: 'Staff account request submitted', time: '5 days ago', icon: Monitor },
    { id: 2, type: 'login', text: 'Logged in from Lahore, PK', time: '6 days ago', icon: LogIn },
  ]
};

export default function ActivityLogModal({ shop, onClose }) {
  if (!shop) return null;

  const activities = MOCK_ACTIVITIES[shop.id] || [
    { id: 1, type: 'login', text: 'Logged in', time: 'Recently', icon: LogIn }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-[#efeacb] rounded-[24px] border border-[#bfbc9b] p-8 w-full max-w-[440px] shadow-2xl flex flex-col text-[#152f16] gap-6 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div>
          <h3 className="text-3xl font-bold font-serif text-[#152f16] leading-tight">
            Activity log
          </h3>
          <p className="text-sm font-semibold text-[#55694a] mt-1 capitalize">
            {shop.business.toLowerCase()} - last 30 days
          </p>
        </div>

        {/* Logs List */}
        <div className="flex flex-col gap-4 max-h-[360px] overflow-y-auto pr-1">
          {activities.map((act) => {
            const Icon = act.icon;
            return (
              <div key={act.id} className="flex items-center gap-4">
                {/* Icon wrapper */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#b2bc9e]/40 bg-[#fdfcf3] text-[#152f16]">
                  <Icon size={20} />
                </div>
                {/* Content */}
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-[#152f16] leading-snug">
                    {act.text}
                  </span>
                  <span className="text-xs font-semibold text-[#55694a] mt-0.5">
                    {act.time}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-4 bg-[#0d3b1b] text-[#efeacb] text-lg font-bold rounded-xl hover:bg-[#072410] active:scale-[0.98] transition-all cursor-pointer text-center leading-none"
        >
          Close
        </button>
      </div>
    </div>
  );
}
