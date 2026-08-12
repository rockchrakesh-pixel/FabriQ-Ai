import React, { useState, useEffect } from 'react';
import {
  getBrandingSettings,
  updateBrandingSettings,
  subscribeBrandingSettings,
  runCategoryRefinement,
  BrandingSettings,
} from '../lib/assetManager';

interface FabriQBrandRefinementControlProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  { id: 'men', name: '👨 MEN Apparel' },
  { id: 'women', name: '👩 WOMEN Apparel' },
  { id: 'kids', name: '👶 KIDS & Baby Care' },
  { id: 'home', name: '🏠 HOME & Living Care' },
  { id: 'shoes', name: '👟 SHOES & Special Care' },
];

export const FabriQBrandRefinementControl: React.FC<FabriQBrandRefinementControlProps> = ({
  isOpen,
  onClose,
}) => {
  const [settings, setSettings] = useState<BrandingSettings>(getBrandingSettings());
  const [selectedCategory, setSelectedCategory] = useState<string>('men');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    return subscribeBrandingSettings(() => {
      setSettings(getBrandingSettings());
    });
  }, []);

  if (!isOpen) return null;

  const handleSettingChange = (key: keyof BrandingSettings, value: any) => {
    const updated = updateBrandingSettings({ [key]: value });
    setSettings(updated);
  };

  const handleRunRefinement = async () => {
    setIsProcessing(true);
    setProgressPercent(0);
    setLogs([]);

    const catObj = CATEGORIES.find((c) => c.id === selectedCategory);
    const catName = catObj ? catObj.name : selectedCategory;

    await runCategoryRefinement(catName, (percent, logMsg) => {
      setProgressPercent(percent);
      setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${logMsg}`]);
    });

    setIsProcessing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-amber-400/30 rounded-2xl max-w-xl w-full p-6 text-slate-100 shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <span className="material-symbols-outlined text-[20px]">auto_fix_high</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-amber-300 font-sans tracking-wide">
                FabriQ Brand & Image Refinement Manager
              </h3>
              <p className="text-xs text-slate-400">
                Store Manager Utility • Asset Watermarking, Face Shield & Batch Processing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors"
            title="Close"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Section 1: Global Branding Controls */}
        <div className="space-y-4 mb-6">
          <h4 className="text-xs font-bold text-amber-300/90 uppercase tracking-wider font-mono">
            1. Global Catalog Overlay Settings
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Watermark Toggle */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 cursor-pointer hover:border-amber-400/40 transition-colors">
              <div className="pr-2">
                <span className="block text-xs font-semibold text-slate-200">
                  FabriQ Watermark
                </span>
                <span className="block text-[10px] text-slate-400">
                  Semi-transparent overlay
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.watermarkVisible}
                onChange={(e) => handleSettingChange('watermarkVisible', e.target.checked)}
                className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
              />
            </label>

            {/* Brand Tag Overlay Toggle */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 cursor-pointer hover:border-amber-400/40 transition-colors">
              <div className="pr-2">
                <span className="block text-xs font-semibold text-slate-200">
                  Printed Brand Tag
                </span>
                <span className="block text-[10px] text-slate-400">
                  Physical tag badge
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.brandTagVisible}
                onChange={(e) => handleSettingChange('brandTagVisible', e.target.checked)}
                className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
              />
            </label>

            {/* Strict Face Removal */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 cursor-pointer hover:border-amber-400/40 transition-colors sm:col-span-2">
              <div className="pr-2">
                <span className="block text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px]">face_retouching_off</span>
                  Strict Model Face Masking & Headless Crop
                </span>
                <span className="block text-[10px] text-slate-400">
                  Guarantees no human model faces appear across any catalog images
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.strictFaceMasking}
                onChange={(e) => handleSettingChange('strictFaceMasking', e.target.checked)}
                className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
              />
            </label>
          </div>

          {/* Watermark Opacity Slider */}
          {settings.watermarkVisible && (
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium">Watermark Opacity</span>
                <span className="text-amber-300 font-bold font-mono">
                  {Math.round(settings.watermarkOpacity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.6"
                step="0.05"
                value={settings.watermarkOpacity}
                onChange={(e) =>
                  handleSettingChange('watermarkOpacity', parseFloat(e.target.value))
                }
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Section 2: Category Batch Refinement */}
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <h4 className="text-xs font-bold text-amber-300/90 uppercase tracking-wider font-mono">
            2. Category Image Refinement Runner
          </h4>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              disabled={isProcessing}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none focus:border-amber-400"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <button
              onClick={handleRunRefinement}
              disabled={isProcessing}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              <span className="material-symbols-outlined text-[16px]">
                {isProcessing ? 'sync' : 'play_arrow'}
              </span>
              <span>{isProcessing ? 'Refining Category...' : 'Run Refinement Batch'}</span>
            </button>
          </div>

          {/* Progress Bar & Logs */}
          {isProcessing || logs.length > 0 ? (
            <div className="mt-3 p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-amber-300">
                <span>Batch Processing Status</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="max-h-28 overflow-y-auto font-mono text-[10px] text-slate-300 space-y-1 p-2 bg-slate-900 rounded border border-slate-800/60">
                {logs.map((log, index) => (
                  <div key={index} className="leading-tight">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
