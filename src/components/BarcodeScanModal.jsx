import { useState } from 'react';
import { X, Search, ScanBarcode, Camera, Keyboard } from 'lucide-react';
import 'react-barcode-scanner/polyfill';
import { BarcodeScanner } from 'react-barcode-scanner';
import { API_BASE_URL } from '../lib/api';

export default function BarcodeScanModal({ onClose, onAddNew, onConfirm }) {
  const [scanMode, setScanMode] = useState('camera'); // 'camera' | 'manual'
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('idle'); // idle | searching | found | not-found | error
  const [item, setItem] = useState(null);
  const [error, setError] = useState('');

  async function handleSearchCode(searchVal) {
    if (!searchVal.trim()) return;
    setStatus('searching');
    setError('');
    setItem(null);

    try {
      const res = await fetch(`${API_BASE_URL}/inventory/scan/${encodeURIComponent(searchVal.trim())}`, {
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

  function handleManualSearch() {
    if (onConfirm) {
      onConfirm({ name: code.trim() });
      onClose();
    } else {
      handleSearchCode(code);
    }
  }

  const handleCapture = (barcodes) => {
    if (barcodes && barcodes.length > 0) {
      const detectedCode = barcodes[0].rawValue;
      if (detectedCode) {
        setCode(detectedCode);
        if (onConfirm) {
          onConfirm({ name: detectedCode });
          onClose();
        } else {
          handleSearchCode(detectedCode);
        }
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="relative flex w-full max-w-[400px] flex-col rounded-2xl bg-[#e8e8c0] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-2.5">
            <ScanBarcode size={18} className="text-[#3a6a2a]" />
            <span className="text-[13px] font-extrabold uppercase tracking-[0.12em] text-[#1a3a0a]">
              Barcode Scanner
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

        <div className="flex flex-col gap-4 px-5 pb-5">
          {/* Mode Switcher */}
          <div className="flex rounded-lg bg-[#d0d6b0] p-1">
            <button
              type="button"
              onClick={() => { setScanMode('camera'); setStatus('idle'); setItem(null); setError(''); }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md py-1.5 text-xs font-bold transition-all ${scanMode === 'camera'
                  ? 'bg-[#3a6a2a] text-white shadow-sm'
                  : 'text-[#1a3a0a] hover:bg-[#c0c6a0]'
                }`}
            >
              <Camera size={14} />
              Use Camera
            </button>
            <button
              type="button"
              onClick={() => { setScanMode('manual'); setStatus('idle'); setItem(null); setError(''); }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md py-1.5 text-xs font-bold transition-all ${scanMode === 'manual'
                  ? 'bg-[#3a6a2a] text-white shadow-sm'
                  : 'text-[#1a3a0a] hover:bg-[#c0c6a0]'
                }`}
            >
              <Keyboard size={14} />
              Manual Entry
            </button>
          </div>

          {scanMode === 'camera' ? (
            <div className="relative overflow-hidden rounded-xl bg-black aspect-video flex items-center justify-center">
              <BarcodeScanner
                onCapture={handleCapture}
                className="w-full h-full object-cover"
              />
              {/* Scanning red line animation */}
              <div className="absolute inset-x-0 top-0 h-0.5 bg-red-500 shadow-[0_0_8px_#ef4444] animate-[bounce_2s_infinite]" />
              <div className="pointer-events-none absolute inset-0 border-2 border-[#3a6a2a]/40 rounded-xl m-4 flex items-center justify-center">
                <div className="text-[10px] bg-black/60 px-2.5 py-1 text-emerald-300 font-bold uppercase tracking-wider rounded">
                  Align Barcode Inside Box
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-[12px] text-[#4a6a2a]">
                Enter a barcode to lookup or add to your inventory.
              </p>
              <div className="flex items-center gap-2">
                <div className="flex flex-1 items-center rounded-xl bg-[#7a9e6a] px-3.5 py-2.5">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
                    placeholder="Enter barcode..."
                    className="min-w-0 flex-1 bg-transparent text-[13px] text-white placeholder-[#c8dab8] outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleManualSearch}
                  disabled={status === 'searching'}
                  className="shrink-0 rounded-xl border border-[#5a7a3a] bg-[#e8e8c0] p-2.5 text-[#1a3a0a] transition hover:bg-[#d8d8a8] disabled:opacity-60"
                >
                  <Search size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Scan / Lookup Result status */}
          {status === 'searching' && (
            <p className="text-center text-[12px] font-semibold text-[#4a6a2a]">Searching…</p>
          )}

          {status === 'error' && (
            <p className="text-[12px] font-semibold text-red-700">{error}</p>
          )}

          {status === 'found' && item && (
            <div className="rounded-xl border border-[#8aaa70] bg-[#d8dca8] p-3.5 animate-fadeIn">
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
            <div className="rounded-xl border border-[#c8a87a] bg-[#f0e0c0] p-3.5 text-center animate-fadeIn">
              <p className="text-[13px] font-semibold text-[#8a4a1a]">No item matches barcode: <span className="font-extrabold">{code}</span></p>
              <button
                type="button"
                onClick={() => onAddNew?.(code.trim())}
                className="mt-2.5 rounded-lg border-2 border-[#5a7a3a] bg-transparent px-4 py-2 text-[12px] font-extrabold text-[#1a3a0a] transition hover:bg-[#c8d8a0]"
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