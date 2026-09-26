import React, { useState, useEffect, useRef } from 'react';
import { BarcodeScanner } from 'react-barcode-scanner';
import 'react-barcode-scanner/polyfill';
import { Camera, X, RefreshCw, Keyboard, AlertCircle, CheckCircle } from 'lucide-react';

export default function BarcodeScannerModal({ isOpen, onClose, onScan }) {
  const [hasCamera, setHasCamera] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [lastScannedCode, setLastScannedCode] = useState(null);
  const [scanStatus, setScanStatus] = useState('');
  const [manualInput, setManualInput] = useState('');
  const lastScanTimeRef = useRef(0);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setCameraError(null);
    setHasCamera(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setHasCamera(false);
      setCameraError('Camera API is not supported in this browser. Please use manual barcode input.');
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' } })
      .then((stream) => {
        if (isMounted) {
          setHasCamera(true);
          setCameraError(null);
          // Stop initial test stream so BarcodeScanner component handles its own stream cleanly
          stream.getTracks().forEach((track) => track.stop());
        }
      })
      .catch((err) => {
        if (isMounted) {
          setHasCamera(false);
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            setCameraError('Camera access was denied. Please allow camera access in your browser settings or use manual barcode input.');
          } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
            setCameraError('No camera device was detected on your system. Please connect a camera or use manual barcode input.');
          } else {
            setCameraError(`Camera error: ${err.message || 'Unable to access camera device.'}`);
          }
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCapture = (barcodes) => {
    if (!barcodes || barcodes.length === 0) return;
    const rawValue = barcodes[0]?.rawValue?.trim();
    if (!rawValue) return;

    const now = Date.now();
    // Debounce rapid duplicate scans (1.5 seconds)
    if (rawValue === lastScannedCode && now - lastScanTimeRef.current < 1500) {
      return;
    }

    lastScanTimeRef.current = now;
    setLastScannedCode(rawValue);
    setScanStatus(`Barcode Detected: ${rawValue}`);

    if (onScan) {
      onScan(rawValue);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    const code = manualInput.trim();
    setLastScannedCode(code);
    setScanStatus(`Manual Barcode: ${code}`);
    if (onScan) {
      onScan(code);
    }
    setManualInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative bg-[#fbf9f0] border border-[#0c3818]/20 rounded-3xl w-full max-w-lg p-6 shadow-2xl flex flex-col gap-4 text-[#0c3818] z-10 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#0c3818]/15 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#0c3818] text-[#efeacb] flex items-center justify-center shadow-xs">
              <Camera size={22} />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#0c3818] tracking-tight">Camera Barcode Scanner</h3>
              <p className="text-xs font-semibold text-[#0c3818]/70">Position barcode inside the camera frame</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-[#0c3818]/60 hover:text-[#0c3818] hover:bg-[#efeacb] transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Camera Scanner Container */}
        <div className="relative w-full h-64 sm:h-72 bg-black rounded-2xl overflow-hidden flex flex-col items-center justify-center border-2 border-[#0c3818]/20 shadow-inner">
          {hasCamera === true && (
            <div className="relative w-full h-full flex items-center justify-center">
              <BarcodeScanner
                options={{
                  formats: [
                    'code_128',
                    'code_39',
                    'code_93',
                    'codabar',
                    'ean_13',
                    'ean_8',
                    'itf',
                    'qr_code',
                    'upc_a',
                    'upc_e',
                  ],
                }}
                trackConstraints={{ facingMode: 'environment' }}
                onCapture={handleCapture}
                className="w-full h-full object-cover"
              />

              {/* Viewfinder Target Brackets */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-56 h-36 border-2 border-dashed border-emerald-400 rounded-xl relative shadow-[0_0_15px_rgba(52,211,153,0.5)]">
                  {/* Corners */}
                  <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-emerald-500 rounded-tl" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-emerald-500 rounded-tr" />
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-emerald-500 rounded-bl" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-emerald-500 rounded-br" />

                  {/* Laser Scan Line */}
                  <div className="absolute left-0 right-0 h-0.5 bg-red-500 shadow-[0_0_10px_#ef4444] animate-pulse top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>
          )}

          {hasCamera === false && (
            <div className="p-6 text-center flex flex-col items-center gap-3 text-red-300">
              <AlertCircle size={40} className="text-red-400" />
              <p className="text-xs sm:text-sm font-semibold text-white/90">{cameraError}</p>
            </div>
          )}

          {hasCamera === null && (
            <div className="flex flex-col items-center gap-2 text-emerald-400">
              <RefreshCw size={28} className="animate-spin" />
              <span className="text-xs font-bold text-white/80">Initializing camera...</span>
            </div>
          )}
        </div>

        {/* Scan Status Toast */}
        {scanStatus && (
          <div className="flex items-center gap-2 bg-emerald-100 border border-emerald-300 text-emerald-900 px-3.5 py-2 rounded-xl text-xs font-bold animate-in fade-in">
            <CheckCircle size={16} className="text-emerald-700 shrink-0" />
            <span className="truncate">{scanStatus}</span>
          </div>
        )}

        {/* Manual Barcode Fallback Input */}
        <form onSubmit={handleManualSubmit} className="flex flex-col gap-1.5 pt-2 border-t border-[#0c3818]/10">
          <label className="text-xs font-black text-[#0c3818] flex items-center gap-1.5">
            <Keyboard size={14} /> Manual / Hardware Barcode Input
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Enter barcode or scan with USB scanner..."
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              className="flex-1 bg-white border border-[#0c3818]/30 rounded-xl px-3.5 py-2 text-xs font-bold text-[#0c3818] placeholder-gray-400 focus:outline-none focus:border-[#0c3818]"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#0c3818] text-[#efeacb] hover:bg-[#114720] hover:text-white text-xs font-black rounded-xl transition cursor-pointer shrink-0"
            >
              Lookup
            </button>
          </div>
        </form>

        {/* Close Button */}
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-white border border-[#0c3818]/30 hover:bg-gray-100 text-[#0c3818] text-xs font-black rounded-xl transition cursor-pointer"
          >
            Close Scanner
          </button>
        </div>
      </div>
    </div>
  );
}
