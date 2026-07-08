import { useState, useEffect } from 'react';
import { X, Search, QrCode, Camera, ScanBarcode } from 'lucide-react';

/* ── Animated scan-line SVG viewport ── */
function ScanViewport({ active }) {
  return (
    <div className="relative flex h-36 w-full items-center justify-center overflow-hidden rounded-xl bg-[#c8d8a0]">
      {/* corner brackets */}
      <svg
        viewBox="0 0 160 120"
        className="absolute h-28 w-36 text-[#3a6a2a]"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      >
        {/* top-left */}
        <path d="M10 32 L10 10 L32 10" />
        {/* top-right */}
        <path d="M128 10 L150 10 L150 32" />
        {/* bottom-left */}
        <path d="M10 88 L10 110 L32 110" />
        {/* bottom-right */}
        <path d="M128 110 L150 110 L150 88" />
      </svg>

      {/* scan-line */}
      {active && (
        <div
          className="absolute left-[12%] right-[12%] h-[2px] rounded-full bg-[#3a6a2a]/70 shadow-[0_0_8px_2px_rgba(58,106,42,0.45)]"
          style={{ animation: 'scanLine 1.6s ease-in-out infinite' }}
        />
      )}

      {/* pulse dot */}
      {active && (
        <span
          className="absolute top-3 right-3 inline-block h-2 w-2 rounded-full bg-[#3a6a2a] shadow-[0_0_6px_#3a6a2a]"
          style={{ animation: 'pulse 1.2s ease-in-out infinite' }}
        />
      )}

      <style>{`
        @keyframes scanLine {
          0%   { top: 18%; }
          50%  { top: 75%; }
          100% { top: 18%; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.25; }
        }
      `}</style>
    </div>
  );
}

/* ── Mock product result ── */
const MOCK_RESULT = {
  name: 'Basmati Rice (Premium)',
  category: 'Grocery-Specific',
  unit: 'KG',
  stock: '142kg',
  price: 'Rs 280/kg',
};

export default function BarcodeScannerModal({ onClose, onConfirm }) {
  const [manualCode, setManualCode] = useState('');
  const [scanning, setScanning] = useState(true);
  const [result, setResult] = useState(null);
  const [mode, setMode] = useState('qr'); // 'qr' | 'camera'

  /* simulate a scan after 3 s */
  useEffect(() => {
    if (!scanning) return;
    const t = setTimeout(() => {
      setResult(MOCK_RESULT);
      setScanning(false);
    }, 3000);
    return () => clearTimeout(t);
  }, [scanning]);

  function handleManualSearch() {
    if (!manualCode.trim()) return;
    setResult(MOCK_RESULT);
    setScanning(false);
  }

  function handleAdd() {
    if (onConfirm) onConfirm(result);
    onClose();
  }

  function restartScan() {
    setResult(null);
    setScanning(true);
    setManualCode('');
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/55 p-4"
      onClick={onClose}
    >
      {/* Modal card — cream background */}
      <div
        className="relative flex w-full max-w-[390px] flex-col rounded-2xl bg-[#e8e8c0] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-2.5">
            <ScanBarcode size={17} className="text-[#3a6a2a]" />
            <span className="text-[13px] font-extrabold uppercase tracking-[0.12em] text-[#1a3a0a]">
              Barcode / QR Scanner
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

        {/* Divider */}
        <div className="mx-5 mb-4 border-t border-[#3a6a2a]" />

        {/* ── Body ── */}
        <div className="flex flex-col gap-3 px-5 pb-5">

          {/* Scan viewport */}
          <div className="rounded-xl border border-[#8aaa70] bg-[#d8dca8] p-3">


            <ScanViewport active={scanning} />

            <p className="mt-2 text-center text-[12px] font-semibold text-[#4a6a2a]">
              {scanning
                ? 'Scanning... aim at barcode or QR code'
                : result
                  ? 'Product matched successfully'
                  : 'Aim at a barcode or QR code'}
            </p>
          </div>

          {/* Manual input — muted green fill like AddItemModal inputs */}
          <div className="flex items-center gap-2">
            <div className="flex flex-1 items-center rounded-xl bg-[#7a9e6a] px-3.5 py-2.5">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
                placeholder="Or type barcode manually..."
                className="min-w-0 flex-1 bg-transparent text-[13px] text-white placeholder-[#c8dab8] outline-none"
              />
            </div>
            {/* Search button — cream with border */}
            <button
              type="button"
              onClick={handleManualSearch}
              className="shrink-0 rounded-xl border border-[#5a7a3a] bg-[#e8e8c0] p-2.5 text-[#1a3a0a] transition hover:bg-[#d8d8a8]"
            >
              <Search size={14} />
            </button>
          </div>

          {/* Result card */}
          {result && (
            <div className="rounded-xl border border-[#8aaa70] bg-[#d8dca8] p-3.5">
              <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#4a6a2a]">
                {result.category}
              </p>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[14px] font-extrabold text-[#1a3a0a]">{result.name}</p>
                  <p className="mt-0.5 text-[12px] text-[#4a6a2a]">
                    {result.unit} . Stock: {result.stock},&nbsp; {result.price}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAdd}
                  className="shrink-0 rounded-xl border-2 border-[#5a7a3a] bg-transparent px-4 py-2 text-[13px] font-extrabold text-[#1a3a0a] transition hover:bg-[#c8d8a0]"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {/* Action buttons — all dark green filled */}
          <div className="mt-1 grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => { setMode('qr'); restartScan(); }}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#3a5a28] py-3 text-[12px] font-extrabold text-white transition hover:bg-[#4a6a38]"
            >
              <QrCode size={15} />
              QR mode
            </button>

            <button
              type="button"
              onClick={() => { setMode('camera'); restartScan(); }}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#3a5a28] py-3 text-[12px] font-extrabold text-white transition hover:bg-[#4a6a38]"
            >
              <Camera size={15} />
              Camera
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex items-center justify-center rounded-xl bg-[#3a5a28] py-3 text-[12px] font-extrabold text-white transition hover:bg-[#4a6a38]"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
