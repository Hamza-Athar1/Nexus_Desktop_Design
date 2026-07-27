import React, { useState, useEffect, useRef } from 'react';

const hsvToRgb = (h, s, v) => {
  s /= 100;
  v /= 100;
  let c = v * s;
  let x = c * (1 - Math.abs((h / 60) % 2 - 1));
  let m = v - c;
  let r = 0, g = 0, b = 0;
  if (0 <= h && h < 60) { r = c; g = x; }
  else if (60 <= h && h < 120) { r = x; g = c; }
  else if (120 <= h && h < 180) { g = c; b = x; }
  else if (180 <= h && h < 240) { g = x; b = c; }
  else if (240 <= h && h < 300) { r = x; b = c; }
  else if (300 <= h && h <= 360) { r = c; b = x; }
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255)
  };
};

const rgbToHsv = (r, g, b) => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100)
  };
};

const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 112, g: 34, b: 180 };
};

const rgbToHex = (r, g, b) => {
  const clamp = (val) => Math.max(0, Math.min(255, val));
  return '#' + ((1 << 24) + (clamp(r) << 16) + (clamp(g) << 8) + clamp(b)).toString(16).slice(1);
};

const hexToHsv = (hex) => {
  const rgb = hexToRgb(hex);
  return rgbToHsv(rgb.r, rgb.g, rgb.b);
};

const hsvToHex = (h, s, v) => {
  const rgb = hsvToRgb(h, s, v);
  return rgbToHex(rgb.r, rgb.g, rgb.b);
};

export default function AddPaletteForm({ onCancel, onAdd }) {
  const [name, setName] = useState('');
  const [primary, setPrimary] = useState('#7022b4');
  const [accent, setAccent] = useState('#c44aff');
  const [deep, setDeep] = useState('#f176ff');
  const [light, setLight] = useState('#f1beff');

  // Currently selected block for custom picker popover
  const [activeBlock, setActiveBlock] = useState(null); // 'primary' | 'accent' | 'deep' | 'light' | null
  const [hsv, setHsv] = useState({ h: 270, s: 80, v: 70 });
  const [isDraggingSpectrum, setIsDraggingSpectrum] = useState(false);
  const [isDraggingHue, setIsDraggingHue] = useState(false);

  const spectrumRef = useRef(null);
  const hueSliderRef = useRef(null);

  // Sync state values when active block changes
  const handleSelectBlock = (blockName) => {
    setActiveBlock(blockName);
    let hex = '#7022b4';
    if (blockName === 'primary') hex = primary;
    if (blockName === 'accent') hex = accent;
    if (blockName === 'deep') hex = deep;
    if (blockName === 'light') hex = light;
    setHsv(hexToHsv(hex));
  };

  const updateColorFromHsv = (h, s, v) => {
    const hex = hsvToHex(h, s, v);
    if (activeBlock === 'primary') setPrimary(hex);
    if (activeBlock === 'accent') setAccent(hex);
    if (activeBlock === 'deep') setDeep(hex);
    if (activeBlock === 'light') setLight(hex);
  };

  // Dragging event handlers for Spectrum box
  const handleSpectrumMove = (clientX, clientY) => {
    if (!spectrumRef.current) return;
    const rect = spectrumRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const sPct = Math.max(0, Math.min(100, Math.round((x / rect.width) * 100)));
    const vPct = Math.max(0, Math.min(100, Math.round((1 - y / rect.height) * 100)));
    
    setHsv((prev) => {
      const next = { ...prev, s: sPct, v: vPct };
      updateColorFromHsv(next.h, next.s, next.v);
      return next;
    });
  };

  // Dragging event handlers for Hue Slider
  const handleHueMove = (clientX) => {
    if (!hueSliderRef.current) return;
    const rect = hueSliderRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const hVal = Math.max(0, Math.min(360, Math.round((x / rect.width) * 360)));
    
    setHsv((prev) => {
      const next = { ...prev, h: hVal };
      updateColorFromHsv(next.h, next.s, next.v);
      return next;
    });
  };

  // Attach global mouse handlers for dragging
  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (isDraggingSpectrum) {
        handleSpectrumMove(e.clientX, e.clientY);
      }
      if (isDraggingHue) {
        handleHueMove(e.clientX);
      }
    };

    const handleGlobalMouseUp = () => {
      setIsDraggingSpectrum(false);
      setIsDraggingHue(false);
    };

    if (isDraggingSpectrum || isDraggingHue) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDraggingSpectrum, isDraggingHue]);

  const handleRgbChange = (channel, value) => {
    const intVal = Math.max(0, Math.min(255, parseInt(value, 10) || 0));
    const currentHex = activeBlock === 'primary' ? primary : activeBlock === 'accent' ? accent : activeBlock === 'deep' ? deep : light;
    const rgb = hexToRgb(currentHex);
    
    if (channel === 'r') rgb.r = intVal;
    if (channel === 'g') rgb.g = intVal;
    if (channel === 'b') rgb.b = intVal;

    const newHex = rgbToHex(rgb.r, rgb.g, rgb.b);
    if (activeBlock === 'primary') setPrimary(newHex);
    if (activeBlock === 'accent') setAccent(newHex);
    if (activeBlock === 'deep') setDeep(newHex);
    if (activeBlock === 'light') setLight(newHex);

    setHsv(rgbToHsv(rgb.r, rgb.g, rgb.b));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({
      name: name.trim(),
      // colors[0] = Primary, colors[1] = Accent, colors[2] = Light, colors[3] = Deep
      colors: [primary, accent, light, deep],
    });
    setName(''); // Reset name field
  };

  const activeHex = activeBlock === 'primary' ? primary : activeBlock === 'accent' ? accent : activeBlock === 'deep' ? deep : light;
  const activeRgb = hexToRgb(activeHex);

  return (
    <div className="relative bg-[#fcfbfa] border border-[#14391a]/30 rounded-[20px] p-5.5 flex flex-col gap-4.5 mt-2">
      <div className="flex flex-col gap-4">
        {/* Name Input */}
        <div>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Palette name e.g Aurora"
            className="w-full bg-[#fcfbfa] border border-[#14391a]/35 text-[#14391a] px-4 py-3 text-sm font-semibold rounded-[12px] focus:outline-none focus:border-[#14391a]/50"
          />
        </div>

        {/* Color Blocks Row */}
        <div className="flex items-center gap-4">
          {/* Primary Color Block */}
          <div className="flex flex-col items-center gap-1.5 flex-1">
            <button
              type="button"
              onClick={() => handleSelectBlock('primary')}
              className={`w-full h-11 rounded-[8px] border cursor-pointer shadow-xs transition hover:scale-102 ${
                activeBlock === 'primary' ? 'border-[#14391a] ring-2 ring-[#14391a]/35' : 'border-[#14391a]/20'
              }`}
              style={{ backgroundColor: primary }}
            />
            <span className="text-[11px] font-extrabold text-[#14391a]/70">Primary</span>
          </div>

          {/* Accent Color Block */}
          <div className="flex flex-col items-center gap-1.5 flex-1">
            <button
              type="button"
              onClick={() => handleSelectBlock('accent')}
              className={`w-full h-11 rounded-[8px] border cursor-pointer shadow-xs transition hover:scale-102 ${
                activeBlock === 'accent' ? 'border-[#14391a] ring-2 ring-[#14391a]/35' : 'border-[#14391a]/20'
              }`}
              style={{ backgroundColor: accent }}
            />
            <span className="text-[11px] font-extrabold text-[#14391a]/70">Accent</span>
          </div>

          {/* Deep Color Block */}
          <div className="flex flex-col items-center gap-1.5 flex-1">
            <button
              type="button"
              onClick={() => handleSelectBlock('deep')}
              className={`w-full h-11 rounded-[8px] border cursor-pointer shadow-xs transition hover:scale-102 ${
                activeBlock === 'deep' ? 'border-[#14391a] ring-2 ring-[#14391a]/35' : 'border-[#14391a]/20'
              }`}
              style={{ backgroundColor: deep }}
            />
            <span className="text-[11px] font-extrabold text-[#14391a]/70">Deep</span>
          </div>

          {/* Light Color Block */}
          <div className="flex flex-col items-center gap-1.5 flex-1">
            <button
              type="button"
              onClick={() => handleSelectBlock('light')}
              className={`w-full h-11 rounded-[8px] border cursor-pointer shadow-xs transition hover:scale-102 ${
                activeBlock === 'light' ? 'border-[#14391a] ring-2 ring-[#14391a]/35' : 'border-[#14391a]/20'
              }`}
              style={{ backgroundColor: light }}
            />
            <span className="text-[11px] font-extrabold text-[#14391a]/70">Light</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 mt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-[#14391a] hover:bg-gray-50 text-[#14391a] text-xs font-extrabold rounded-[10px] transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4.5 py-2.5 bg-[#113819] hover:bg-[#14391a] text-white text-xs font-extrabold rounded-[10px] transition cursor-pointer shadow-xs"
          >
            Add Palette
          </button>
        </div>
      </div>

      {/* Self-Contained Color Picker Popover (Side-by-Side to the Right) */}
      {activeBlock && (
        <div className="absolute left-full top-0 ml-4 z-50 bg-[#faf8ed] border border-[#14391a]/35 rounded-[18px] p-4 shadow-xl w-[260px] flex flex-col gap-3.5 select-none animate-in fade-in slide-in-from-left-2 duration-150">
          
          {/* Header Title */}
          <div className="flex items-center justify-between border-b border-[#14391a]/10 pb-1.5">
            <span className="text-[12px] font-black capitalize text-[#14391a]">
              {activeBlock} Color Picker
            </span>
            <button
              type="button"
              onClick={() => setActiveBlock(null)}
              className="text-xs font-bold text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>
          </div>

          {/* Color Preview & HEX code */}
          <div className="rounded-[12px] border border-[#14391a]/15 bg-[#fcfbfa] p-2.5 flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-[8px] border border-[#14391a]/10 shrink-0" 
              style={{ backgroundColor: activeHex }}
            />
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-gray-400">HEX Code</span>
              <span className="text-[13px] font-black uppercase text-[#14391a]">{activeHex}</span>
            </div>
            <span className="ml-auto text-[10px] font-bold text-gray-400 italic">Drag picker</span>
          </div>

          {/* Interactive Gradient Spectrum box */}
          <div 
            ref={spectrumRef}
            onMouseDown={(e) => {
              setIsDraggingSpectrum(true);
              handleSpectrumMove(e.clientX, e.clientY);
            }}
            className="h-24 rounded-[12px] border border-[#14391a]/15 shadow-inner relative overflow-hidden cursor-crosshair"
            style={{ 
              backgroundImage: `
                linear-gradient(to top, #000, transparent), 
                linear-gradient(to right, #fff, transparent),
                linear-gradient(to right, hsl(${hsv.h}, 100%, 50%), hsl(${hsv.h}, 100%, 50%))
              `,
              backgroundBlendMode: 'multiply, normal, normal'
            }}
          >
            {/* Draggable Circle cursor handle */}
            <div 
              className="w-4 h-4 rounded-full border-2 border-white absolute shadow-md shrink-0 pointer-events-none -ml-2 -mt-2 transition-all duration-75"
              style={{ 
                left: `${hsv.s}%`, 
                top: `${100 - hsv.v}%` 
              }}
            />
          </div>

          {/* Hue Slider (rainbow bar) */}
          <div className="flex flex-col gap-1.5">
            <div 
              ref={hueSliderRef}
              onMouseDown={(e) => {
                setIsDraggingHue(true);
                handleHueMove(e.clientX);
              }}
              className="h-3.5 rounded-full border border-[#14391a]/15 relative cursor-pointer"
              style={{ 
                backgroundImage: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)'
              }}
            >
              {/* Slider thumb handle */}
              <div 
                className="w-4 h-4 rounded-full border-2 border-white bg-white shadow-md absolute top-1/2 -translate-y-1/2 -ml-2 shrink-0 pointer-events-none"
                style={{ 
                  left: `${(hsv.h / 360) * 100}%` 
                }}
              />
            </div>
          </div>

          {/* RGB Input Fields Row */}
          <div>
            <div className="grid grid-cols-3 gap-2">
              {/* R Input */}
              <div className="flex flex-col items-center">
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={activeRgb.r}
                  onChange={(e) => handleRgbChange('r', e.target.value)}
                  className="w-full bg-[#fcfbfa] border border-[#14391a]/25 text-center py-1.5 text-xs font-bold rounded-[8px] focus:outline-none"
                />
                <span className="text-[10px] font-extrabold text-gray-400 mt-1">R</span>
              </div>

              {/* G Input */}
              <div className="flex flex-col items-center">
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={activeRgb.g}
                  onChange={(e) => handleRgbChange('g', e.target.value)}
                  className="w-full bg-[#fcfbfa] border border-[#14391a]/25 text-center py-1.5 text-xs font-bold rounded-[8px] focus:outline-none"
                />
                <span className="text-[10px] font-extrabold text-gray-400 mt-1">G</span>
              </div>

              {/* B Input */}
              <div className="flex flex-col items-center">
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={activeRgb.b}
                  onChange={(e) => handleRgbChange('b', e.target.value)}
                  className="w-full bg-[#fcfbfa] border border-[#14391a]/25 text-center py-1.5 text-xs font-bold rounded-[8px] focus:outline-none"
                />
                <span className="text-[10px] font-extrabold text-gray-400 mt-1">B</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
