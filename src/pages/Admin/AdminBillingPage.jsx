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

  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState('');

  const [themes, setThemes] = useState([]);
  const [savingTheme, setSavingTheme] = useState(false);
  const [themeMsg, setThemeMsg] = useState('');

  const loadThemes = async () => {
    try {
      const { ok, data } = await apiFetchJson('/catalog/themes');
      if (ok && data.themes) {
        setThemes(data.themes);
      }
    } catch {
      // ignore
    }
  };

  const loadReceiptSettings = async () => {
    try {
      const { ok, data } = await apiFetchJson('/business/receipt-settings');
      if (ok && data.settings) {
        if (data.settings.shopName) setShopName(data.settings.shopName);
        if (data.settings.shopAddress) setShopAddress(data.settings.shopAddress);
        if (data.settings.fontSize) setFontSize(Number(data.settings.fontSize));
        if (data.settings.language) setReceiptLanguage(data.settings.language === 'ur' ? 'urdu' : 'english');
        if (data.settings.logoUrl) setLogoUrl(data.settings.logoUrl);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadThemes();
    loadReceiptSettings();
  }, []);

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setSettingsMsg('Logo file size must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoUrl(null);
  };

  const handleSaveReceiptSettings = async () => {
    setSavingSettings(true);
    setSettingsMsg('');
    try {
      const payload = {
        shopName: showShopName ? shopName : '',
        shopAddress: showShopAddress ? shopAddress : '',
        fontSize: showFontSize ? fontSize : 15,
        language: showLanguage && receiptLanguage === 'urdu' ? 'ur' : 'en',
        logoUrl: showLogo ? logoUrl : null,
      };

      const { ok, data } = await apiFetchJson('/business/receipt-settings', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });

      if (ok) {
        setSettingsMsg('Receipt settings saved successfully!');
        await refreshUser();
      } else {
        setSettingsMsg(data.message || 'Failed to save receipt settings');
      }
    } catch {
      setSettingsMsg('Error connecting to server to save settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const handlePaletteSelect = async (theme) => {
    if (theme.active) return;

    if (!theme.owned) {
      if (theme.pending) {
        setThemeMsg(`A request for ${theme.name} is already pending approval.`);
        return;
      }
      // Trigger Purchase Request
      setSavingTheme(true);
      setThemeMsg('');
      try {
        const { ok, data } = await apiFetchJson('/requests', {
          method: 'POST',
          body: JSON.stringify({
            requestType: 'theme_purchase',
            paletteId: theme.id,
            details: `Requesting theme: ${theme.name} (Rs ${theme.price})`,
          }),
        });
        if (ok) {
          setThemeMsg(`Requested ${theme.name}! Pending Super Admin approval.`);
          await loadThemes();
        } else {
          setThemeMsg(data.message || 'Failed to submit theme purchase request');
        }
      } catch {
        setThemeMsg('Failed to submit theme purchase request');
      } finally {
        setSavingTheme(false);
      }
      return;
    }

    // Is Owned - Apply Theme
    setSavingTheme(true);
    setThemeMsg('');
    try {
      const { ok, data } = await apiFetchJson('/profile/theme', {
        method: 'PATCH',
        body: JSON.stringify({ paletteId: theme.id }),
      });
      if (ok) {
        setThemeMsg('Theme updated!');
        await refreshUser();
        await loadThemes();
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
          Billing Details & Themes
        </h1>
        <p className="text-base sm:text-lg font-bold text-[#607455] mt-1">
          Manage receipt preferences, active tenant theme, and shop theme entitlements.
        </p>
      </div>

      {/* ── Main Responsive Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ── LEFT SECTION: Billing Settings Form ── */}
        <div className="lg:col-span-7 border-2 border-[#0c3818]/25 rounded-2xl md:rounded-3xl bg-[#f9f7ea]/90 backdrop-blur-xs shadow-xs p-6 md:p-8 flex flex-col divide-y divide-[#0c3818]/15">
          
          {/* Item 0: Business Theme Store & Entitlements */}
          <div className="pb-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-[#0c3818]">Shop Theme Catalogue</h3>
                <p className="text-sm font-bold text-[#607455]">Select an owned theme to apply, or request additional themes for your shop</p>
              </div>
              {themeMsg && <span className="text-xs font-extrabold text-[#0c3818] bg-[#efeacb] px-3 py-1 rounded-full border border-[#0c3818]/30">{themeMsg}</span>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1">
              {themes.map((t) => {
                return (
                  <div
                    key={t.id}
                    className={`p-4 rounded-2xl border-2 flex flex-col justify-between gap-3 transition-all ${
                      t.active
                        ? 'border-[#0c3818] bg-[#0c3818]/10 ring-2 ring-[#0c3818]/20'
                        : t.owned
                        ? 'border-[#0c3818]/30 bg-white'
                        : 'border-dashed border-[#0c3818]/40 bg-white/70'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-[#0c3818]">{t.name}</span>
                        {t.active && <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#0c3818] text-[#efeacb]">Active</span>}
                        {t.owned && !t.active && <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#e6ecce] text-[#0c3818]">Owned</span>}
                        {t.pending && <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-300">Pending</span>}
                      </div>
                      <span className="text-xs font-bold text-[#607455]">
                        {t.price > 0 ? `Rs ${t.price}` : 'Free'}
                      </span>
                    </div>

                    {/* Color Swatch Bar */}
                    <div className="flex items-center gap-1.5 h-6 rounded-lg overflow-hidden border border-black/10 p-1 bg-neutral-100">
                      <span className="flex-1 h-full rounded" style={{ backgroundColor: t.colorPrimary }} title="Primary" />
                      <span className="flex-1 h-full rounded" style={{ backgroundColor: t.colorAccent }} title="Accent" />
                      <span className="flex-1 h-full rounded" style={{ backgroundColor: t.colorShade }} title="Shade" />
                      <span className="flex-1 h-full rounded" style={{ backgroundColor: t.colorLight }} title="Light" />
                    </div>

                    {/* Action Button */}
                    <button
                      type="button"
                      disabled={savingTheme || t.active || t.pending}
                      onClick={() => handlePaletteSelect(t)}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-black transition cursor-pointer ${
                        t.active
                          ? 'bg-transparent text-[#0c3818] cursor-default'
                          : t.owned
                          ? 'bg-[#0c3818] hover:bg-[#114720] text-[#efeacb] shadow-xs'
                          : t.pending
                          ? 'bg-amber-100 text-amber-800 border border-amber-300 cursor-not-allowed font-extrabold'
                          : 'bg-[#efeacb] hover:bg-[#e4ddbd] text-[#0c3818] border border-[#0c3818]/40'
                      }`}
                    >
                      {t.active ? 'Currently Active' : t.owned ? 'Apply Theme' : t.pending ? 'Pending Approval' : `Purchase (Rs ${t.price})`}
                    </button>
                  </div>
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

          {/* Save Settings Action Button */}
          <div className="pt-6 flex items-center justify-between gap-4">
            {settingsMsg && (
              <span className="text-xs font-black text-[#0c3818] bg-[#efeacb] px-3 py-1.5 rounded-full border border-[#0c3818]/30">
                {settingsMsg}
              </span>
            )}
            <button
              type="button"
              disabled={savingSettings}
              onClick={handleSaveReceiptSettings}
              className="ml-auto px-8 py-3 bg-[#0c3818] hover:bg-[#114720] text-[#efeacb] text-sm font-black rounded-xl transition cursor-pointer shadow-md active:scale-95 disabled:opacity-50"
            >
              {savingSettings ? 'Saving Settings...' : 'Save Receipt Settings'}
            </button>
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
