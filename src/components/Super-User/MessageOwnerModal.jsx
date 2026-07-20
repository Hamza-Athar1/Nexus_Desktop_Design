import React, { useState, useEffect } from 'react';

export default function MessageOwnerModal({ shop, onClose, onSend }) {
  const [subject, setSubject] = useState('Regarding your billing update');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (shop) {
      setSubject('Regarding your billing update');
      setMessage('');
    }
  }, [shop]);

  if (!shop) return null;

  const handleSend = () => {
    if (onSend) {
      onSend(shop.id, { subject, message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-[#efeacb] rounded-[24px] border border-[#bfbc9b] p-8 w-full max-w-[440px] shadow-2xl flex flex-col text-[#152f16] gap-5 animate-in fade-in zoom-in duration-200">

        {/* Header */}
        <div>
          <h3 className="text-3xl font-bold font-serif text-[#152f16] leading-tight">
            Message owner
          </h3>
          <p className="text-sm font-semibold text-[#55694a] mt-1">
            To: {shop.owner} - {shop.business}
          </p>
        </div>

        {/* Inputs */}
        <div className="flex flex-col gap-4">
          {/* Subject */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-[#152f16]">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-[#fdfcf3] border border-[#c8c2a3]/60 rounded-xl px-4 py-3 text-sm text-[#152f16] font-semibold outline-none focus:ring-1 focus:ring-[#0d3b1b]/30"
            />
          </div>

          {/* Message */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-[#152f16]">Message</label>
            <textarea
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full min-h-[120px] bg-[#fdfcf3] border border-[#c8c2a3]/60 rounded-xl p-4 text-sm text-[#152f16] font-semibold outline-none placeholder-[#607455]/60 focus:ring-1 focus:ring-[#0d3b1b]/30 resize-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 bg-[#fdfcf3] border border-[#0d3b1b]/60 text-[#0d3b1b] text-base font-bold rounded-xl hover:bg-neutral-50 active:scale-[0.98] transition-all cursor-pointer text-center leading-none"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSend}
            className="w-full py-3.5 bg-[#0d3b1b] text-[#efeacb] text-base font-bold rounded-xl hover:bg-[#072410] active:scale-[0.98] transition-all cursor-pointer text-center leading-none"
          >
            Send message
          </button>
        </div>
      </div>
    </div>
  );
}
