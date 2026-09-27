import React from 'react';
import { X, Check, Monitor, Grid, Zap, LayoutGrid } from 'lucide-react';
import { apiFetchJson } from '../../lib/api.js';

export const POS_LAYOUT_OPTIONS = [
  {
    id: 'classic',
    title: 'Classic POS',
    tag: 'Traditional',
    icon: Monitor,
    description: 'Traditional supermarket cash register workflow with persistent two-panel catalog and receipt.',
    features: ['Two-column register layout', 'Product catalog on left', 'Persistent cart on right', 'Keyboard-friendly'],
    preview: (
      <div className="w-full h-24 bg-gray-100 rounded-lg p-1.5 flex flex-col gap-1 border border-gray-200">
        <div className="h-3 bg-[#0f2e13] rounded-xs w-full flex items-center justify-between px-1">
          <div className="w-8 h-1 bg-white/40 rounded-xs" />
          <div className="w-4 h-1 bg-amber-400 rounded-xs" />
        </div>
        <div className="flex-1 flex gap-1">
          <div className="w-7/12 bg-white rounded-xs p-1 grid grid-cols-3 gap-0.5 border border-gray-200">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-amber-100/60 rounded-xs border border-amber-200/50" />
            ))}
          </div>
          <div className="w-5/12 bg-white rounded-xs p-1 flex flex-col justify-between border border-gray-200">
            <div className="space-y-0.5">
              <div className="h-1 bg-gray-200 rounded-xs w-full" />
              <div className="h-1 bg-gray-200 rounded-xs w-3/4" />
            </div>
            <div className="h-2 bg-[#0f2e13] rounded-xs w-full" />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'grid',
    title: 'Touchscreen Grid',
    tag: 'Touch-Friendly',
    icon: Grid,
    description: 'Optimized for touchscreens & tablets with large touch product tiles and touch +/- controls.',
    features: ['Large touch product cards', 'Category filter pills', 'Big touch-friendly action buttons', 'Tablet optimized'],
    preview: (
      <div className="w-full h-24 bg-gray-100 rounded-lg p-1.5 flex flex-col gap-1 border border-gray-200">
        <div className="h-2.5 flex gap-1">
          <div className="w-4 h-full bg-[#0f2e13] rounded-xs" />
          <div className="w-4 h-full bg-gray-300 rounded-xs" />
          <div className="w-4 h-full bg-gray-300 rounded-xs" />
        </div>
        <div className="flex-1 flex gap-1">
          <div className="w-8/12 bg-white rounded-xs p-1 grid grid-cols-2 gap-1 border border-gray-200">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-[#efe9c4] rounded-xs border border-amber-300 flex flex-col justify-end p-0.5">
                <div className="h-1 bg-[#0f2e13] rounded-xs w-2/3" />
              </div>
            ))}
          </div>
          <div className="w-4/12 bg-white rounded-xs p-1 flex flex-col justify-between border border-gray-200">
            <div className="h-1.5 bg-gray-300 rounded-xs w-full" />
            <div className="h-2.5 bg-emerald-700 rounded-xs w-full" />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'fast',
    title: 'Fast Cashier',
    tag: 'Barcode & Speed',
    icon: Zap,
    description: 'High-speed workflow for experienced cashiers with barcode scanner focus and keyboard shortcuts.',
    features: ['Dominant barcode search bar', 'Keyboard shortcuts (F2, F12, ESC)', 'Dense transaction list', 'High-volume speed'],
    preview: (
      <div className="w-full h-24 bg-[#0f2e13]/10 rounded-lg p-1.5 flex flex-col gap-1 border border-[#0f2e13]/20">
        <div className="h-3.5 bg-white border border-[#0f2e13] rounded-xs px-1 flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          <div className="h-1 bg-gray-300 rounded-xs w-16" />
        </div>
        <div className="h-2 flex gap-1">
          <div className="w-5 h-full bg-[#0f2e13] rounded-xs text-[6px] text-white flex items-center justify-center font-mono">F2</div>
          <div className="w-5 h-full bg-[#0f2e13] rounded-xs text-[6px] text-white flex items-center justify-center font-mono">F12</div>
        </div>
        <div className="flex-1 bg-white rounded-xs p-1 flex flex-col justify-between border border-gray-200">
          <div className="space-y-0.5">
            <div className="h-1 bg-gray-200 rounded-xs w-full" />
            <div className="h-1 bg-gray-200 rounded-xs w-5/6" />
          </div>
          <div className="h-3 bg-[#0f2e13] rounded-xs flex items-center justify-between px-1">
            <div className="w-6 h-1 bg-white/50 rounded-xs" />
            <div className="w-8 h-1.5 bg-emerald-400 rounded-xs" />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'modern',
    title: 'Modern Retail',
    tag: 'Visual Showcase',
    icon: LayoutGrid,
    description: 'Dashboard-style visual POS with persistent category sidebar, product showcase cards, and quick actions.',
    features: ['Category navigation sidebar', 'Visual product showcase cards', 'Floating cart panel', 'Quick action panel'],
    preview: (
      <div className="w-full h-24 bg-gray-100 rounded-lg p-1.5 flex gap-1 border border-gray-200">
        <div className="w-3/12 bg-[#0f2e13] rounded-xs p-0.5 space-y-0.5">
          <div className="h-1 bg-white/40 rounded-xs w-full" />
          <div className="h-1 bg-white/20 rounded-xs w-full" />
          <div className="h-1 bg-white/20 rounded-xs w-full" />
        </div>
        <div className="w-5/12 bg-white rounded-xs p-1 grid grid-cols-2 gap-1 border border-gray-200">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-100 rounded-xs border border-gray-200 flex flex-col justify-between p-0.5">
              <div className="h-2 bg-gray-300 rounded-xs w-full" />
              <div className="h-0.5 bg-amber-500 rounded-xs w-1/2" />
            </div>
          ))}
        </div>
        <div className="w-4/12 bg-white rounded-xs p-1 flex flex-col justify-between border border-gray-200">
          <div className="h-1 bg-gray-300 rounded-xs w-full" />
          <div className="h-2 bg-[#0f2e13] rounded-xs w-full" />
        </div>
      </div>
    ),
  },
];

export default function POSLayoutSelectorModal({ isOpen, onClose, currentLayout, onSelectLayout }) {
  if (!isOpen) return null;

  const handleSelect = async (layoutId) => {
    onSelectLayout(layoutId);
    try {
      await apiFetchJson('/profile/pos-layout', {
        method: 'PATCH',
        body: JSON.stringify({ layout: layoutId }),
      });
    } catch (err) {
      console.error('Failed to persist POS layout:', err);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div
        className="bg-[#efe9c4] border-2 border-[#0f2e13]/20 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-[#0f2e13]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0f2e13] text-[#efe9c4]">
          <div>
            <h2 className="text-lg font-black tracking-wide uppercase">Choose POS Terminal Design</h2>
            <p className="text-xs text-[#efe9c4]/70 font-medium">
              Select the POS layout that best matches your workflow and screen setup
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-[#efe9c4]/80 hover:text-[#efe9c4] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body — Grid of Layout Cards */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {POS_LAYOUT_OPTIONS.map((opt) => {
            const isSelected = currentLayout === opt.id;
            const IconComp = opt.icon;
            return (
              <div
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                className={`bg-white rounded-2xl p-5 border-2 transition-all duration-200 flex flex-col justify-between gap-4 cursor-pointer hover:shadow-md ${
                  isSelected
                    ? 'border-[#0f2e13] ring-2 ring-[#0f2e13]/20 shadow-md'
                    : 'border-gray-200 hover:border-[#0f2e13]/40'
                }`}
              >
                <div className="space-y-3">
                  {/* Card Top Header */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl ${isSelected ? 'bg-[#0f2e13] text-[#efe9c4]' : 'bg-gray-100 text-[#0f2e13]'}`}>
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-black text-sm text-[#0f2e13]">{opt.title}</h3>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                          {opt.tag}
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-300">
                        <Check className="w-3 h-3" /> Active
                      </span>
                    )}
                  </div>

                  {/* Visual Preview */}
                  {opt.preview}

                  {/* Description */}
                  <p className="text-xs text-gray-600 font-medium leading-relaxed">
                    {opt.description}
                  </p>

                  {/* Bullet features */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {opt.features.map((f, idx) => (
                      <span key={idx} className="text-[10px] font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md">
                        • {f}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Selection Action Button */}
                <button
                  type="button"
                  className={`w-full py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition cursor-pointer ${
                    isSelected
                      ? 'bg-[#0f2e13] text-[#efe9c4]'
                      : 'bg-[#efe9c4] text-[#0f2e13] hover:bg-[#0f2e13] hover:text-[#efe9c4]'
                  }`}
                >
                  {isSelected ? 'Currently Selected' : `Use ${opt.title}`}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#0f2e13]/5 border-t border-[#0f2e13]/10 flex justify-between items-center text-xs font-bold text-[#0f2e13]/70">
          <span>Your POS layout preference is automatically saved to your user profile.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-[#0f2e13]/20 rounded-xl hover:bg-gray-100 text-[#0f2e13] cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
