import { useState, useEffect } from 'react';

export default function MessageOwnerModal({ shop, onClose, onSend }) {
  const [subject, setSubject] = useState('Regarding your billing update');
  const [body,    setBody]    = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (shop) { setSubject('Regarding your billing update'); setBody(''); }
  }, [shop]);

  if (!shop) return null;

  const handleSend = async () => {
    if (!body.trim()) return;
    setSending(true);
    await onSend(shop.id, { subject, body });
    setSending(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-[#efeacb] rounded-[24px] border border-[#bfbc9b] p-8 w-full max-w-[440px] shadow-2xl flex flex-col text-[#152f16] gap-5">
        <div>
          <h3 className="text-3xl font-bold font-serif text-[#152f16] leading-tight">Message owner</h3>
          <p className="text-sm font-semibold text-[#55694a] mt-1">To: {shop.owner} — {shop.business}</p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-[#152f16]">Subject</label>
            <input type="text" value={subject} onChange={e => setSubject(e.target.value)}
              className="w-full bg-[#fdfcf3] border border-[#c8c2a3]/60 rounded-xl px-4 py-3 text-sm text-[#152f16] font-semibold outline-none focus:ring-1 focus:ring-[#0d3b1b]/30" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-[#152f16]">Message</label>
            <textarea placeholder="Type your message here…"
              value={body} onChange={e => setBody(e.target.value)}
              className="w-full min-h-[120px] bg-[#fdfcf3] border border-[#c8c2a3]/60 rounded-xl p-4 text-sm text-[#152f16] font-semibold outline-none placeholder-[#607455]/60 focus:ring-1 focus:ring-[#0d3b1b]/30 resize-none" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-2">
          <button type="button" onClick={onClose} disabled={sending}
            className="w-full py-3.5 bg-[#fdfcf3] border border-[#0d3b1b]/60 text-[#0d3b1b] text-base font-bold rounded-xl hover:bg-neutral-50 transition cursor-pointer">
            Cancel
          </button>
          <button type="button" onClick={handleSend} disabled={sending || !body.trim()}
            className="w-full py-3.5 bg-[#0d3b1b] text-[#efeacb] text-base font-bold rounded-xl hover:bg-[#072410] transition cursor-pointer disabled:opacity-60">
            {sending ? 'Sending…' : 'Send message'}
          </button>
        </div>
      </div>
    </div>
  );
}
