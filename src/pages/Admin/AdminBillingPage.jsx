import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiFetchJson } from '../../lib/api';
import { Plus, Upload, Trash2 } from 'lucide-react';

export default function AdminBillingPage() {
  const { setHeaderDetails } = useOutletContext() || {};
  const { user, refreshUser } = useAuth();

  // ── Form State ──
  const [shopName, setShopName] = useState(user?.businessName || 'My Store');
  const [showShopName, setShowShopName] = useState(true);

  const [shopAddress, setShopAddress] = useState('Main Branch Address');
  const [showShopAddress, setShowShopAddress] = useState(true);

  const [fontSize, setFontSize] = useState(15);
  const [showFontSize, setShowFontSize] = useState(true);

  const [receiptLanguage, setReceiptLanguage] = useState('english'); // 'english' | 'urdu'
  const [showLanguage, setShowLanguage] = useState(true);

  const [logoUrl, setLogoUrl] = useState(null);
  const [showLogo, setShowLogo] = useState(true);

  useEffect(() => {
    if (setHeaderDetails) {
      setHeaderDetails({
        title: user?.businessName?.toUpperCase() || 'MY STORE',
        subtitle: null,
      });
    }
  }, [setHeaderDetails, user]);

  // Handle Logo Upload
  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLogoUrl(url);
    }
  };

  const handleRemoveLogo = () => {
    setLogoUrl(null);
  };

  // ── Theme State ──
  const [palettes, setPalettes] = useState([]);
  const [selectedPaletteId, setSelectedPaletteId] = useState(user?.palette?.id || null);
  const [savingTheme, setSavingTheme] = useState(false);
  const [themeMsg, setThemeMsg] = useState('');

  useEffect(() => {
    async function loadPalettes() {
      try {
        const { ok, data } = await apiFetchJson('/catalog/palettes');
        if (ok && data.palettes) setPalettes(data.palettes);
      } catch {
        // Fallback or ignore
      }
    }
    loadPalettes();
  }, []);

  useEffect(() => {
    if (user?.palette?.id) setSelectedPaletteId(user.palette.id);
  }, [user]);

  const handlePaletteSelect = async (paletteId) => {
    setSelectedPaletteId(paletteId);
    setSavingTheme(true);
    setThemeMsg('');
    try {
      const { ok, data } = await apiFetchJson('/profile/theme', {
        method: 'PATCH',
        body: JSON.stringify({ paletteId }),
      });
      if (ok) {
        setThemeMsg('Theme updated!');
        await refreshUser();
      } else {
        setThemeMsg(data.message || 'Failed to update theme');
      }
    } catch {
      setThemeMsg('Failed to update theme');
    } finally {
      setSavingTheme(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full pb-12">
      {/* ── Page Header ── */}
      <div>
        <h1 className="text-3xl lg:text-4xl font-black text-[#0c3818] tracking-tight">
          Billing Details
        </h1>
        <p className="text-base sm:text-lg font-bold text-[#607455] mt-1">
          Turn an option off if the counter doesnt need it - the preview updates live
        </p>
      </div>

      {/* ── Main Responsive Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ── LEFT SECTION: Billing Settings Form ── */}
        <div className="lg:col-span-7 border-2 border-[#0c3818]/25 rounded-2xl md:rounded-3xl bg-[#f9f7ea]/90 backdrop-blur-xs shadow-xs p-6 md:p-8 flex flex-col divide-y divide-[#0c3818]/15">
          
          {/* Item 0: Business Theme Palette */}
          <div className="pb-6 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-[#0c3818]">Business Theme Palette</h3>
                <p className="text-sm font-bold text-[#607455]">Applies your chosen color scheme across the application</p>
              </div>
              {themeMsg && <span className="text-xs font-bold text-[#14391a]">{themeMsg}</span>}
            </div>
            <div className="flex flex-wrap gap-3 mt-1">
              {palettes.map((p) => {
                const isSel = selectedPaletteId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    disabled={savingTheme}
                    onClick={() => handlePaletteSelect(p.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition cursor-pointer ${
                      isSel ? 'border-[#0c3818] bg-[#0c3818]/10 ring-2 ring-[#0c3818]/30' : 'border-[#0c3818]/20 bg-white hover:border-[#0c3818]/50'
                    }`}
                  >
                    <span className="text-xs font-black text-[#0c3818]">{p.name}</span>
                    <div className="flex items-center gap-0.5">
                      <span className="w-3.5 h-3.5 rounded-full border border-black/20" style={{ backgroundColor: p.color_primary }} />
                      <span className="w-3.5 h-3.5 rounded-full border border-black/20" style={{ backgroundColor: p.color_accent }} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Item 1: Shop name on bill */}
          <div className="pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col">
              <h3 className="text-lg font-black text-[#0c3818]">Shop name on bill</h3>
              <p className="text-sm font-bold text-[#607455]">Prints at the top of the receipt</p>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                disabled={!showShopName}
                className="bg-[#efeacb] border-2 border-[#0c3818]/40 rounded-xl px-4 py-2.5 text-sm font-bold text-[#0c3818] text-center flex items-center justify-center focus:outline-none focus:border-[#0c3818] transition w-56 disabled:opacity-50"
              />
              {/* Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={showShopName}
                  onChange={(e) => setShowShopName(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-13 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#0c3818]"></div>
              </label>
            </div>
          </div>

          {/* Item 2: Shop address */}
          <div className="py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col">
              <h3 className="text-lg font-black text-[#0c3818]">Shop address</h3>
              <p className="text-sm font-bold text-[#607455]">Prints below the shop name</p>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="text"
                value={shopAddress}
                onChange={(e) => setShopAddress(e.target.value)}
                disabled={!showShopAddress}
                className="bg-[#efeacb] border-2 border-[#0c3818]/40 rounded-xl px-3 py-2.5 text-xs font-bold text-[#0c3818] text-center focus:outline-none focus:border-[#0c3818] transition w-56 disabled:opacity-50"
              />
              {/* Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={showShopAddress}
                  onChange={(e) => setShowShopAddress(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-13 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#0c3818]"></div>
              </label>
            </div>
          </div>

          {/* Item 3: Item & Price font size */}
          <div className="py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col">
              <h3 className="text-lg font-black text-[#0c3818]">Item & Price font size</h3>
              <p className="text-sm font-bold text-[#607455]">Smaller fits more on the bill</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 w-56 justify-end">
                <input
                  type="range"
                  min={11}
                  max={20}
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  disabled={!showFontSize}
                  className="w-36 accent-[#0c3818] cursor-pointer disabled:opacity-50"
                />
                <span className="text-sm font-black text-[#0c3818] min-w-[36px] text-right">
                  {fontSize}px
                </span>
              </div>
              {/* Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={showFontSize}
                  onChange={(e) => setShowFontSize(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-13 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#0c3818]"></div>
              </label>
            </div>
          </div>

          {/* Item 4: Receipt language */}
          <div className="py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col">
              <h3 className="text-lg font-black text-[#0c3818]">Receipt language</h3>
              <p className="text-sm font-bold text-[#607455]">Labels and item names print in one language</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setReceiptLanguage('english')}
                  disabled={!showLanguage}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer border-2 ${
                    receiptLanguage === 'english'
                      ? 'bg-[#0c3818] text-[#efeacb] border-[#0c3818]'
                      : 'bg-[#efeacb] text-[#0c3818] border-[#0c3818]/30 hover:border-[#0c3818]'
                  } disabled:opacity-50`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setReceiptLanguage('urdu')}
                  disabled={!showLanguage}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer border-2 ${
                    receiptLanguage === 'urdu'
                      ? 'bg-[#0c3818] text-[#efeacb] border-[#0c3818]'
                      : 'bg-[#efeacb] text-[#0c3818] border-[#0c3818]/30 hover:border-[#0c3818]'
                  } disabled:opacity-50`}
                >
                  اردو
                </button>
              </div>
              {/* Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={showLanguage}
                  onChange={(e) => setShowLanguage(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-13 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#0c3818]"></div>
              </label>
            </div>
          </div>

          {/* Item 5: Shop logo */}
          <div className="pt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col">
              <h3 className="text-lg font-black text-[#0c3818]">Shop logo</h3>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label
                  className={`p-2 rounded-xl border-2 border-dashed border-[#0c3818]/50 bg-[#efeacb] text-[#0c3818] hover:bg-[#e4ddbd] transition cursor-pointer flex items-center justify-center ${
                    !showLogo ? 'opacity-50 pointer-events-none' : ''
                  }`}
                  title="Choose File"
                >
                  <Plus size={18} className="stroke-[2.5]" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                    disabled={!showLogo}
                  />
                </label>

                <label
                  className={`px-3 py-2 rounded-xl border-2 border-[#0c3818]/40 bg-[#efeacb] text-[#0c3818] font-bold text-xs hover:border-[#0c3818] transition cursor-pointer flex items-center gap-1.5 ${
                    !showLogo ? 'opacity-50 pointer-events-none' : ''
                  }`}
                >
                  <Upload size={14} />
                  <span>Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                    disabled={!showLogo}
                  />
                </label>

                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  disabled={!showLogo || !logoUrl}
                  className="px-3 py-2 rounded-xl border-2 border-[#0c3818]/40 bg-[#efeacb] text-[#0c3818] font-bold text-xs hover:bg-[#fde8e4] hover:text-[#8b1e10] hover:border-[#f8b4ab] transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:pointer-events-none"
                >
                  <Trash2 size={14} />
                  <span>Remove</span>
                </button>
              </div>

              {/* Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={showLogo}
                  onChange={(e) => setShowLogo(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-13 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#0c3818]"></div>
              </label>
            </div>
          </div>

        </div>

        {/* ── RIGHT SECTION: Live Preview ── */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <h2 className="text-xl font-black text-[#0c3818] uppercase tracking-wider">
            LIVE PREVIEW
          </h2>

          <div className="bg-white border-2 border-[#0c3818]/20 rounded-2xl p-6 shadow-md font-sans text-gray-800 transition-all">
            {/* Header / Logo / Address */}
            <div className="text-center flex flex-col items-center border-b border-dashed border-gray-300 pb-3 mb-3">
              {showLogo && logoUrl && (
                <div className="mb-2">
                  <img src={logoUrl} alt="Logo" className="h-12 w-auto object-contain mx-auto" />
                </div>
              )}

              {showShopName ? (
                <h3 className="font-black text-gray-900 text-lg leading-tight">
                  {shopName || 'Imtiaz Super Market'}
                </h3>
              ) : null}

              {showShopAddress && (
                <p className="text-xs text-gray-600 font-medium mt-0.5 whitespace-pre-line">
                  {shopAddress || 'Shop 12, Dolmen Mall, Karachi'}
                </p>
              )}
            </div>

            {/* Date & Bill Details */}
            <div className="flex justify-between text-xs font-semibold text-gray-600 mb-3 border-b border-dashed border-gray-300 pb-2">
              <span>
                {showLanguage && receiptLanguage === 'urdu' ? 'تاریخ: 01-09-2026' : 'Date: 01-09-2026'}
              </span>
              <span>
                {showLanguage && receiptLanguage === 'urdu' ? 'بل #0482' : 'Bill #0482'}
              </span>
            </div>

            {/* Receipt Table */}
            <div className="w-full mb-4">
              <div className="grid grid-cols-12 text-xs font-black text-gray-700 uppercase tracking-wider border-b border-gray-200 pb-1.5 mb-2">
                <span className="col-span-6">
                  {showLanguage && receiptLanguage === 'urdu' ? 'آئٹم' : 'ITEM'}
                </span>
                <span className="col-span-3 text-center">
                  {showLanguage && receiptLanguage === 'urdu' ? 'تعداد' : 'QTY'}
                </span>
                <span className="col-span-3 text-right">
                  {showLanguage && receiptLanguage === 'urdu' ? 'قیمت' : 'PRICE'}
                </span>
              </div>

              <div
                className="flex flex-col gap-2 font-bold text-gray-800"
                style={{ fontSize: showFontSize ? `${fontSize}px` : '15px' }}
              >
                {/* Sample items */}
                <div className="grid grid-cols-12 items-center">
                  <span className="col-span-6 font-bold truncate">
                    {showLanguage && receiptLanguage === 'urdu' ? 'باسمتی چاول 5 کلو' : 'Basmati Rice 5Kg'}
                  </span>
                  <span className="col-span-3 text-center font-semibold">1</span>
                  <span className="col-span-3 text-right font-bold">990</span>
                </div>

                <div className="grid grid-cols-12 items-center">
                  <span className="col-span-6 font-bold truncate">
                    {showLanguage && receiptLanguage === 'urdu' ? 'کوکنگ آئل 1 لیٹر' : 'Cooking Oil 1L'}
                  </span>
                  <span className="col-span-3 text-center font-semibold">1</span>
                  <span className="col-span-3 text-right font-bold">550</span>
                </div>

                <div className="grid grid-cols-12 items-center">
                  <span className="col-span-6 font-bold truncate">
                    {showLanguage && receiptLanguage === 'urdu' ? 'چائے پتی 190 گرام' : 'Tea Pack 190g'}
                  </span>
                  <span className="col-span-3 text-center font-semibold">1</span>
                  <span className="col-span-3 text-right font-bold">220</span>
                </div>
              </div>
            </div>

            {/* Total Section */}
            <div className="border-t border-dashed border-gray-400 pt-3 flex justify-between items-center text-sm font-black text-gray-900">
              <span>{showLanguage && receiptLanguage === 'urdu' ? 'کل رقم' : 'TOTAL'}</span>
              <span>Rs 1,760</span>
            </div>

            {/* Footer Note */}
            <div className="mt-6 text-center text-xs font-semibold text-gray-500 italic">
              {showLanguage && receiptLanguage === 'urdu'
                ? 'ہمارے ساتھ خریداری کا شکریہ'
                : 'Thankyou for shoping with us'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
