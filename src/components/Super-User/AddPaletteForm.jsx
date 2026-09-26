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

export default function AddPaletteForm({ initialData, onCancel, onAdd }) {
  const [name, setName] = useState(initialData?.name || '');
  const [price, setPrice] = useState(initialData?.price ? initialData.price.toLocaleString() : '');
  const [primary, setPrimary] = useState(initialData?.colors?.[0] || initialData?.colorPrimary || '#7022b4');
  const [accent, setAccent] = useState(initialData?.colors?.[1] || initialData?.colorAccent || '#c44aff');
  const [deep, setDeep] = useState(initialData?.colors?.[2] || initialData?.colorShade || '#f176ff');
  const [light, setLight] = useState(initialData?.colors?.[3] || initialData?.colorLight || '#f1beff');
  const [error, setError] = useState('');

  // Currently selected block for custom picker popover
  const [activeBlock, setActiveBlock] = useState('primary');
  const [hsv, setHsv] = useState({ h: 270, s: 80, v: 70 });
  const [isDraggingSpectrum, setIsDraggingSpectrum] = useState(false);
  const [isDraggingHue, setIsDraggingHue] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setPrice(initialData.price ? initialData.price.toLocaleString() : '');
      const p = initialData.colors?.[0] || initialData.colorPrimary || '#7022b4';
      const a = initialData.colors?.[1] || initialData.colorAccent || '#c44aff';
      const d = initialData.colors?.[2] || initialData.colorShade || '#f176ff';
      const l = initialData.colors?.[3] || initialData.colorLight || '#f1beff';
      setPrimary(p);
      setAccent(a);
      setDeep(d);
      setLight(l);
      setHsv(hexToHsv(p));
    }
  }, [initialData]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (e) e.preventDefault();
    if (!name.trim()) {
      setError('Theme name is required. Please assign a name before adding the theme.');
      return;
    }
    setError('');
    const numericPrice = Number(price.toString().replace(/,/g, '')) || 0;
    onAdd({
      name: name.trim(),
      price: numericPrice,
      // colors[0] = Primary, colors[1] = Accent, colors[2] = Light, colors[3] = Deep
      colors: [primary, accent, light, deep],
    });
    setName('');
    setPrice('');
  };

  const activeHex = activeBlock === 'primary' ? primary : activeBlock === 'accent' ? accent : activeBlock === 'deep' ? deep : light;
  const activeRgb = hexToRgb(activeHex);

  return (
    <div className="relative bg-[#fcfbfa] border border-[#14391a]/30 rounded-[20px] p-5.5 flex flex-col gap-4.5 mt-2">
      <div className="flex flex-col gap-4">
        {/* Error Alert Message */}
        {error && (
          <div className="bg-red-50 border border-red-300 rounded-xl p-3 flex items-center justify-between text-red-700 text-xs font-bold animate-in fade-in duration-200">
            <span>{error}</span>
            <button type="button" onClick={() => setError('')} className="text-red-500 hover:text-red-800 font-black ml-2 cursor-pointer">
              ✕
            </button>
          </div>
        )}

        {/* Inputs Row: Name + Price */}
        <div className="flex flex-wrap sm:flex-nowrap gap-3">
          <div className="w-full sm:w-2/3">
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error && e.target.value.trim()) setError('');
              }}
              placeholder="Palette name e.g. Emerald Aurora"
              className={`w-full bg-[#fcfbfa] border text-[#14391a] px-4 py-3 text-sm font-semibold rounded-[12px] focus:outline-none ${
                error ? 'border-red-500 ring-1 ring-red-500' : 'border-[#14391a]/35 focus:border-[#14391a]/50'
              }`}
            />
          </div>
          <div className="w-full sm:w-1/3 flex items-center bg-[#fcfbfa] border border-[#14391a]/35 rounded-[12px] focus-within:border-[#14391a]/50 overflow-hidden px-4">
            <span className="text-[#14391a]/70 font-semibold text-sm mr-1 select-none">Rs</span>
            <input
              type="text"
              value={price}
              onChange={(e) => {
                const v = e.target.value.replace(/[^\d]/g, '');
                setPrice(v ? Number(v).toLocaleString() : '');
              }}
              placeholder="0 (Free)"
              className="flex-1 bg-transparent border-0 text-[#14391a] py-3 text-sm font-semibold outline-none focus:ring-0"
            />
          </div>
        </div>

        {/* Color Swatches Row with Native Color Pickers */}
        <div>
          <span className="block text-xs font-bold text-[#14391a]/70 mb-2">
            Click any color swatch below to pick colors and view its UI application:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Primary Color Block */}
            <div className={`p-3 rounded-xl border flex flex-col gap-1.5 transition cursor-pointer ${
              activeBlock === 'primary' ? 'border-[#14391a] bg-[#eae3c1]/50 ring-2 ring-[#14391a]/40 shadow-xs' : 'border-[#14391a]/20 bg-[#fcfbfa] hover:border-[#14391a]/40'
            }`} onClick={() => handleSelectBlock('primary')}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#14391a]">Primary</span>
                <input
                  type="color"
                  value={primary}
                  onChange={(e) => {
                    setPrimary(e.target.value);
                    if (activeBlock === 'primary') setHsv(hexToHsv(e.target.value));
                  }}
                  className="w-6 h-6 rounded border-0 cursor-pointer p-0 bg-transparent"
                />
              </div>
              <div className="h-7 rounded-lg border border-black/10 shadow-inner flex items-center justify-center text-[11px] font-mono font-bold text-white drop-shadow-md" style={{ backgroundColor: primary }}>
                {primary}
              </div>
              <span className="text-[10px] font-semibold text-[#14391a]/80 leading-tight">
                Used for main headers, navbar titles & active tabs (`--color-primary`)
              </span>
            </div>

            {/* Accent Color Block */}
            <div className={`p-3 rounded-xl border flex flex-col gap-1.5 transition cursor-pointer ${
              activeBlock === 'accent' ? 'border-[#14391a] bg-[#eae3c1]/50 ring-2 ring-[#14391a]/40 shadow-xs' : 'border-[#14391a]/20 bg-[#fcfbfa] hover:border-[#14391a]/40'
            }`} onClick={() => handleSelectBlock('accent')}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#14391a]">Accent</span>
                <input
                  type="color"
                  value={accent}
                  onChange={(e) => {
                    setAccent(e.target.value);
                    if (activeBlock === 'accent') setHsv(hexToHsv(e.target.value));
                  }}
                  className="w-6 h-6 rounded border-0 cursor-pointer p-0 bg-transparent"
                />
              </div>
              <div className="h-7 rounded-lg border border-black/10 shadow-inner flex items-center justify-center text-[11px] font-mono font-bold text-white drop-shadow-md" style={{ backgroundColor: accent }}>
                {accent}
              </div>
              <span className="text-[10px] font-semibold text-[#14391a]/80 leading-tight">
                Used for primary buttons, action highlights & badges (`--color-accent`)
              </span>
            </div>

            {/* Deep Color Block */}
            <div className={`p-3 rounded-xl border flex flex-col gap-1.5 transition cursor-pointer ${
              activeBlock === 'deep' ? 'border-[#14391a] bg-[#eae3c1]/50 ring-2 ring-[#14391a]/40 shadow-xs' : 'border-[#14391a]/20 bg-[#fcfbfa] hover:border-[#14391a]/40'
            }`} onClick={() => handleSelectBlock('deep')}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#14391a]">Deep / Shade</span>
                <input
                  type="color"
                  value={deep}
                  onChange={(e) => {
                    setDeep(e.target.value);
                    if (activeBlock === 'deep') setHsv(hexToHsv(e.target.value));
                  }}
                  className="w-6 h-6 rounded border-0 cursor-pointer p-0 bg-transparent"
                />
              </div>
              <div className="h-7 rounded-lg border border-black/10 shadow-inner flex items-center justify-center text-[11px] font-mono font-bold text-white drop-shadow-md" style={{ backgroundColor: deep }}>
                {deep}
              </div>
              <span className="text-[10px] font-semibold text-[#14391a]/80 leading-tight">
                Used for dark card backgrounds, sidebars & dark accents (`--color-shade`)
              </span>
            </div>

            {/* Light Color Block */}
            <div className={`p-3 rounded-xl border flex flex-col gap-1.5 transition cursor-pointer ${
              activeBlock === 'light' ? 'border-[#14391a] bg-[#eae3c1]/50 ring-2 ring-[#14391a]/40 shadow-xs' : 'border-[#14391a]/20 bg-[#fcfbfa] hover:border-[#14391a]/40'
            }`} onClick={() => handleSelectBlock('light')}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#14391a]">Light</span>
                <input
                  type="color"
                  value={light}
                  onChange={(e) => {
                    setLight(e.target.value);
                    if (activeBlock === 'light') setHsv(hexToHsv(e.target.value));
                  }}
                  className="w-6 h-6 rounded border-0 cursor-pointer p-0 bg-transparent"
                />
              </div>
              <div className="h-7 rounded-lg border border-black/10 shadow-inner flex items-center justify-center text-[11px] font-mono font-bold text-white drop-shadow-md" style={{ backgroundColor: light }}>
                {light}
              </div>
              <span className="text-[10px] font-semibold text-[#14391a]/80 leading-tight">
                Used for light container backgrounds, tables & subtles (`--color-light`)
              </span>
            </div>
          </div>
        </div>

        {/* Embedded Interactive Color Spectrum & Range Selection Window */}
        {activeBlock && (
          <div className="bg-[#faf8ed] border border-[#14391a]/30 rounded-2xl p-4 shadow-sm flex flex-col gap-3.5 select-none">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#14391a]/15 pb-2 gap-2">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-xs" style={{ backgroundColor: activeHex }} />
                <span className="text-xs font-black capitalize text-[#14391a]">
                  Selected: {activeBlock === 'deep' ? 'Deep / Shade' : activeBlock} Color
                </span>
              </div>
              <div className="bg-[#efeacb] px-3 py-1 rounded-lg border border-[#bfbc9b] text-[11px] font-bold text-[#14391a]">
                Applied to: {
                  activeBlock === 'primary' ? 'Main Headers, Titles & Navigation' :
                  activeBlock === 'accent' ? 'Buttons, Action Highlights & Badges' :
                  activeBlock === 'deep' ? 'Dark Cards, Sidebars & Borders' :
                  'Light Page Backgrounds & Table Containers'
                }
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              {/* Interactive Spectrum Box */}
              <div className="md:col-span-8 flex flex-col gap-2">
                <span className="text-[11px] font-bold text-[#14391a]/70">Color Spectrum & Saturation Range (Click or Drag)</span>
                <div 
                  ref={spectrumRef}
                  onMouseDown={(e) => {
                    setIsDraggingSpectrum(true);
                    handleSpectrumMove(e.clientX, e.clientY);
                  }}
                  className="h-28 rounded-xl border border-[#14391a]/20 shadow-inner relative overflow-hidden cursor-crosshair"
                  style={{ 
                    backgroundImage: `
                      linear-gradient(to top, #000, transparent), 
                      linear-gradient(to right, #fff, transparent),
                      linear-gradient(to right, hsl(${hsv.h}, 100%, 50%), hsl(${hsv.h}, 100%, 50%))
                    `,
                    backgroundBlendMode: 'multiply, normal, normal'
                  }}
                >
                  <div 
                    className="w-4 h-4 rounded-full border-2 border-white absolute shadow-md shrink-0 pointer-events-none -ml-2 -mt-2 transition-all duration-75"
                    style={{ 
                      left: `${hsv.s}%`, 
                      top: `${100 - hsv.v}%` 
                    }}
                  />
                </div>

                {/* Hue Slider */}
                <div className="flex flex-col gap-1 mt-1">
                  <span className="text-[11px] font-bold text-[#14391a]/70">Hue Range Slider (0° - 360°)</span>
                  <div 
                    ref={hueSliderRef}
                    onMouseDown={(e) => {
                      setIsDraggingHue(true);
                      handleHueMove(e.clientX);
                    }}
                    className="h-4 rounded-full border border-[#14391a]/20 relative cursor-pointer"
                    style={{ 
                      backgroundImage: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)'
                    }}
                  >
                    <div 
                      className="w-4 h-4 rounded-full border-2 border-white bg-white shadow-md absolute top-1/2 -translate-y-1/2 -ml-2 shrink-0 pointer-events-none"
                      style={{ 
                        left: `${(hsv.h / 360) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* RGB Controls */}
              <div className="md:col-span-4 flex flex-col gap-2">
                <span className="text-[11px] font-bold text-[#14391a]/70">RGB Channels</span>
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col items-center">
                    <input
                      type="number"
                      min="0"
                      max="255"
                      value={activeRgb.r}
                      onChange={(e) => handleRgbChange('r', e.target.value)}
                      className="w-full bg-white border border-[#14391a]/30 text-center py-2 text-xs font-bold rounded-lg"
                    />
                    <span className="text-[10px] font-black text-gray-500 mt-1">R</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <input
                      type="number"
                      min="0"
                      max="255"
                      value={activeRgb.g}
                      onChange={(e) => handleRgbChange('g', e.target.value)}
                      className="w-full bg-white border border-[#14391a]/30 text-center py-2 text-xs font-bold rounded-lg"
                    />
                    <span className="text-[10px] font-black text-gray-500 mt-1">G</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <input
                      type="number"
                      min="0"
                      max="255"
                      value={activeRgb.b}
                      onChange={(e) => handleRgbChange('b', e.target.value)}
                      className="w-full bg-white border border-[#14391a]/30 text-center py-2 text-xs font-bold rounded-lg"
                    />
                    <span className="text-[10px] font-black text-gray-500 mt-1">B</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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
    </div>
  );
}
