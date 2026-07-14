import { useState } from 'react';
import { X, Search, ScanBarcode } from 'lucide-react';
import { API_BASE_URL } from '../lib/api';

/**
 * Manual barcode lookup against the real backend.
 * (No camera/hardware integration — that's a separate piece of work.
 * This models what happens once a barcode value is captured: look it
 * up against this user's inventory.)
 */
export default function BarcodeScanModal({ onClose, onAddNew }) {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('idle'); // idle | searching | found | not-found | error
  const [item, setItem] = useState(null);
  const [error, setError] = useState('');

  async function handleSearch() {
    if (!code.trim()) return;
    setStatus('searching');
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/inventory/scan/${encodeURIComponent(code.trim())}`, {
        credentials: 'include',
      });

      if (res.status === 404) {
        setStatus('not-found');
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || `Lookup failed (status ${res.status})`);
      }

      setItem(data.item);
      setStatus('found');
    } catch (err) {
      console.error('Barcode scan lookup failed:', err);
      setError(err.message || 'Unable to reach the server');
      setStatus('error');
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/55 p-4"
      onClick={onClose}
    >
      <div
        className="relative flex w-full max-w-[390px] flex-col rounded-2xl bg-[#e8e8c0] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-2.5">
            <ScanBarcode size={17} className="text-[#3a6a2a]" />
            <span className="text-[13px] font-extrabold uppercase tracking-[0.12em] text-[#1a3a0a]">
              Barcode Lookup
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#5a7a3a] px-2.5 py-1.5 text-[#1a3a0a] transition hover:bg-[#d8d8a8]"
          >
            <X size={14} />
          </button>
        </div>

        <div className="mx-5 mb-4 border-t border-[#3a6a2a]" />

        <div className="flex flex-col gap-3 px-5 pb-5">
          <p className="text-[12px] text-[#4a6a2a]">
            Enter a barcode to check whether it already exists in your inventory.
          </p>

          <div className="flex items-center gap-2">
            <div className="flex flex-1 items-center rounded-xl bg-[#7a9e6a] px-3.5 py-2.5">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Enter barcode..."
                className="min-w-0 flex-1 bg-transparent text-[13px] text-white placeholder-[#c8dab8] outline-none"
              />
            </div>
            <button
              type="button"
              onClick={handleSearch}
              disabled={status === 'searching'}
              className="shrink-0 rounded-xl border border-[#5a7a3a] bg-[#e8e8c0] p-2.5 text-[#1a3a0a] transition hover:bg-[#d8d8a8] disabled:opacity-60"
            >
              <Search size={14} />
            </button>
          </div>

          {status === 'searching' && (
            <p className="text-center text-[12px] font-semibold text-[#4a6a2a]">Searching…</p>
          )}

          {status === 'error' && (
            <p className="text-[12px] font-semibold text-red-700">{error}</p>
          )}

          {status === 'found' && item && (
            <div className="rounded-xl border border-[#8aaa70] bg-[#d8dca8] p-3.5">
              <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#4a6a2a]">
                {item.category || 'Item found'}
              </p>
              <p className="text-[14px] font-extrabold text-[#1a3a0a]">{item.name}</p>
              <p className="mt-0.5 text-[12px] text-[#4a6a2a]">
                Stock: {item.stock_qty} · Rs {Number(item.price).toLocaleString()}
              </p>
            </div>
          )}

          {status === 'not-found' && (
            <div className="rounded-xl border border-[#c8a87a] bg-[#f0e0c0] p-3.5 text-center">
              <p className="text-[13px] font-semibold text-[#8a4a1a]">No item matches that barcode.</p>
              <button
                type="button"
                onClick={() => onAddNew?.(code.trim())}
                className="mt-2 rounded-lg border-2 border-[#5a7a3a] bg-transparent px-4 py-2 text-[12px] font-extrabold text-[#1a3a0a] transition hover:bg-[#c8d8a0]"
              >
                Add as new item
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}