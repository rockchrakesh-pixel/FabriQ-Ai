import React, { useState, useEffect } from 'react';
import {
  getBrandingSettings,
  updateBrandingSettings,
  subscribeBrandingSettings,
  getItemOverrides,
  updateItemOverride,
  runCategoryRefinement,
  isProductAssetMissingBranding,
  BrandingSettings,
  ItemAssetOverride,
} from '../lib/assetManager';
import { FULL_CATALOG, CatalogItem } from '../screens/ServiceCatalog';

interface AdminImageProcessorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminImageProcessor: React.FC<AdminImageProcessorProps> = ({
  isOpen,
  onClose,
}) => {
  const [settings, setSettings] = useState<BrandingSettings>(getBrandingSettings());
  const [itemOverrides, setItemOverrides] = useState<Record<string, ItemAssetOverride>>(getItemOverrides());
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  
  // Processing state
  const [isProcessingBatch, setIsProcessingBatch] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [batchLog, setBatchLog] = useState<string>('');

  useEffect(() => {
    return subscribeBrandingSettings(() => {
      setSettings(getBrandingSettings());
      setItemOverrides(getItemOverrides());
    });
  }, []);

  if (!isOpen) return null;

  // Filter catalog items
  const filteredCatalog = FULL_CATALOG.filter((item) => {
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'men' && item.category === 'men') ||
      (activeTab === 'women' && item.category === 'women') ||
      (activeTab === 'kids' && item.category === 'kids') ||
      (activeTab === 'home' && item.category === 'home') ||
      (activeTab === 'shoes' && item.category === 'shoes_bags');

    const matchesQuery =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesQuery;
  });

  const handleToggleGlobalWatermark = () => {
    updateBrandingSettings({ watermarkVisible: !settings.watermarkVisible });
  };

  const handleToggleGlobalFaceMasking = () => {
    updateBrandingSettings({ strictFaceMasking: !settings.strictFaceMasking });
  };

  const handleToggleGlobalBrandTag = () => {
    updateBrandingSettings({ brandTagVisible: !settings.brandTagVisible });
  };

  const handleItemOverrideChange = (itemId: string, patch: Partial<ItemAssetOverride>) => {
    updateItemOverride(itemId, patch);
  };

  const handleBatchProcessFiltered = async () => {
    setIsProcessingBatch(true);
    setProgressPercent(0);
    setBatchLog(`Starting AI Batch Processing for ${filteredCatalog.length} catalog items...`);

    for (let i = 0; i < filteredCatalog.length; i++) {
      const item = filteredCatalog[i];
      updateItemOverride(item.id, {
        watermarkEnabled: true,
        faceMaskingEnabled: true,
        aspectRatio1to1: true,
        flaggedForFaceRemoval: true,
      });

      const pct = Math.round(((i + 1) / filteredCatalog.length) * 100);
      setProgressPercent(pct);
      setBatchLog(`Processing [${i + 1}/${filteredCatalog.length}]: ${item.name} — FabriQ Watermark & Face Shield applied.`);
      await new Promise((r) => setTimeout(r, 60));
    }

    setIsProcessingBatch(false);
    setBatchLog(`Batch completed! All ${filteredCatalog.length} items updated with FabriQ branding.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-lg p-3 sm:p-6 animate-in fade-in duration-200 font-sans">
      <div className="bg-slate-900 border border-amber-400/30 rounded-3xl max-w-6xl w-full h-[90vh] flex flex-col text-slate-100 shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <span className="material-symbols-outlined text-[22px]">center_focus_strong</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-amber-300 tracking-wide font-sans">
                  FabriQ Admin Image Processor & Catalog Asset Studio
                </h2>
                <span className="bg-amber-400/20 text-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-400/30 uppercase font-mono">
                  Store Manager
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Centralized Watermarking, 1:1 Crop Aspect Ratio, and Model Face Removal Engine
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors"
            title="Close Manager"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Global Controls Toolbar */}
        <div className="p-3 sm:p-4 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 flex-wrap text-xs">
            {/* Watermark Toggle */}
            <button
              onClick={handleToggleGlobalWatermark}
              className={`px-3 py-1.5 rounded-xl font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                settings.watermarkVisible
                  ? 'bg-amber-400 text-slate-950 border-amber-400'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">watermark</span>
              <span>Watermark: {settings.watermarkVisible ? 'ON' : 'OFF'}</span>
            </button>

            {/* Strict Face Masking Toggle */}
            <button
              onClick={handleToggleGlobalFaceMasking}
              className={`px-3 py-1.5 rounded-xl font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                settings.strictFaceMasking
                  ? 'bg-amber-400 text-slate-950 border-amber-400'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">face_retouching_off</span>
              <span>Face Mask Shield: {settings.strictFaceMasking ? 'ACTIVE' : 'OFF'}</span>
            </button>

            {/* Brand Tag Toggle */}
            <button
              onClick={handleToggleGlobalBrandTag}
              className={`px-3 py-1.5 rounded-xl font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                settings.brandTagVisible
                  ? 'bg-amber-400 text-slate-950 border-amber-400'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">label</span>
              <span>FabriQ Tag: {settings.brandTagVisible ? 'ON' : 'OFF'}</span>
            </button>

            {/* QA Mode Red Bounding Box Inspector Toggle */}
            <button
              onClick={() => updateBrandingSettings({ qaModeEnabled: !settings.qaModeEnabled })}
              className={`px-3 py-1.5 rounded-xl font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                settings.qaModeEnabled
                  ? 'bg-red-500 text-white border-red-400 shadow-[0_0_8px_rgba(239,68,68,0.8)]'
                  : 'bg-slate-800 text-red-300 border-red-500/30 hover:border-red-400'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">policy</span>
              <span>QA Red Box: {settings.qaModeEnabled ? 'ACTIVE' : 'OFF'}</span>
            </button>
          </div>

          <button
            onClick={handleBatchProcessFiltered}
            disabled={isProcessingBatch}
            className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[16px]">
              {isProcessingBatch ? 'sync' : 'auto_mode'}
            </span>
            <span>Batch Process ({filteredCatalog.length} Items)</span>
          </button>
        </div>

        {/* Progress Bar Banner if processing */}
        {isProcessingBatch || batchLog ? (
          <div className="px-4 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-amber-300">
              <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
              <span className="truncate max-w-xl">{batchLog}</span>
            </div>
            <span className="text-amber-400 font-bold shrink-0">{progressPercent}%</span>
          </div>
        ) : null}

        {/* Main Content Area (Grid & Inspection Workbench) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Column: Catalog Grid */}
          <div className="flex-1 flex flex-col overflow-hidden border-r border-slate-800">
            {/* Search & Category Filter Tabs */}
            <div className="p-3 bg-slate-900 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="relative w-full sm:w-64">
                <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-slate-400 text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search catalog products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-xs rounded-xl pl-8 pr-3 py-2 text-slate-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Category Filter Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1 sm:pb-0">
                {[
                  { id: 'all', label: 'ALL' },
                  { id: 'men', label: '👨 MEN' },
                  { id: 'women', label: '👩 WOMEN' },
                  { id: 'kids', label: '👶 KIDS' },
                  { id: 'home', label: '🏠 HOME' },
                  { id: 'shoes', label: '👟 SHOES' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-colors shrink-0 ${
                      activeTab === tab.id
                        ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Catalog Items Grid */}
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 bg-slate-950/40">
              {filteredCatalog.map((item) => {
                const override = itemOverrides[item.id] || {};
                const isSelected = selectedItem?.id === item.id;
                const qaStatus = isProductAssetMissingBranding(item.category, item.name, item.id, settings);

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`group relative rounded-2xl border p-2 bg-slate-900 cursor-pointer transition-all hover:scale-[1.02] ${
                      isSelected
                        ? 'border-amber-400 bg-slate-850 shadow-lg ring-2 ring-amber-400/30'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Thumbnail Frame */}
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover object-top"
                      />

                      {/* Overlaid Status Badges */}
                      <div className="absolute top-1 left-1 flex flex-col gap-1">
                        <span className="bg-slate-950/80 text-amber-300 text-[8px] font-mono px-1.5 py-0.5 rounded border border-amber-400/30">
                          FabriQ 1:1
                        </span>
                      </div>

                      {settings.watermarkVisible && (
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30 select-none">
                          <span className="text-white font-black text-xs uppercase tracking-widest -rotate-12 border border-white/20 px-1 py-0.5 rounded">
                            FabriQ
                          </span>
                        </div>
                      )}

                      {/* QA Mode Red Bounding Box Inspection Overlay */}
                      {settings.qaModeEnabled && (
                        <div
                          className={`absolute inset-0 z-30 pointer-events-none rounded-xl border-2 transition-all ${
                            qaStatus.missing
                              ? 'border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.95)] bg-red-500/15'
                              : 'border-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] bg-emerald-500/5'
                          }`}
                        >
                          <div
                            className={`absolute top-1 right-1 text-[7px] font-black px-1 py-0.5 rounded font-mono shadow-md uppercase ${
                              qaStatus.missing ? 'bg-red-600 text-white animate-pulse' : 'bg-emerald-600 text-white'
                            }`}
                          >
                            {qaStatus.missing ? `QA: ${qaStatus.reason}` : 'QA: PASSED'}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-2">
                      <p className="text-[11px] font-bold text-slate-200 truncate font-sans">
                        {item.name}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 font-mono">
                        <span>₹{item.price}</span>
                        <span className="text-amber-400 font-extrabold">{item.categoryLabel}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Workbench & Item Inspector */}
          <div className="w-full md:w-80 bg-slate-900 border-t md:border-t-0 md:border-l border-slate-800 p-4 overflow-y-auto flex flex-col">
            {selectedItem ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider font-mono">
                    Item Asset Inspector
                  </h3>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="text-[10px] text-slate-400 hover:text-slate-200"
                  >
                    Deselect
                  </button>
                </div>

                {/* Main Preview Card */}
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-950 border-2 border-amber-400/40 shadow-xl">
                  <img
                    src={selectedItem.image}
                    alt={selectedItem.name}
                    className="w-full h-full object-cover object-[center_95%] scale-[1.2] translate-y-[8%]"
                  />

                  {/* Watermark Overlay Preview */}
                  {settings.watermarkVisible && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center select-none">
                      <span className="text-white font-black text-2xl tracking-[0.2em] uppercase -rotate-12 border border-white/30 px-3 py-1 rounded backdrop-blur-[0.5px] opacity-30">
                        FabriQ
                      </span>
                    </div>
                  )}

                  {/* Face Removal Shield Banner */}
                  {settings.strictFaceMasking && (
                    <div className="absolute top-0 inset-x-0 h-[26%] bg-gradient-to-b from-slate-950 via-slate-950/80 to-transparent pointer-events-none flex items-start justify-center pt-1">
                      <span className="bg-slate-900/90 text-amber-300 text-[8px] font-black px-2 py-0.5 rounded-full border border-amber-400/30 font-mono">
                        FabriQ Model Face Shield
                      </span>
                    </div>
                  )}

                  {/* FabriQ Brand Tag */}
                  {settings.brandTagVisible && (
                    <div className="absolute bottom-2 left-2 pointer-events-none bg-slate-950/80 text-amber-300 text-[9px] font-extrabold px-1.5 py-0.5 rounded border border-amber-400/30 font-sans">
                      FabriQ
                    </div>
                  )}
                </div>

                {/* Details */}
                <div>
                  <h4 className="text-xs font-bold text-slate-100">{selectedItem.name}</h4>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    ID: {selectedItem.id} • Category: {selectedItem.categoryLabel}
                  </p>
                </div>

                {/* Specific Overrides for selected item */}
                <div className="space-y-2 pt-3 border-t border-slate-800">
                  <h5 className="text-[11px] font-bold text-amber-300/90 uppercase font-mono">
                    Product Override Controls
                  </h5>

                  <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 text-xs cursor-pointer">
                    <span className="text-slate-300 font-medium">1:1 Square Crop</span>
                    <input
                      type="checkbox"
                      checked={itemOverrides[selectedItem.id]?.aspectRatio1to1 ?? true}
                      onChange={(e) =>
                        handleItemOverrideChange(selectedItem.id, {
                          aspectRatio1to1: e.target.checked,
                        })
                      }
                      className="w-4 h-4 accent-amber-400 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 text-xs cursor-pointer">
                    <span className="text-slate-300 font-medium">Model Face Mask Shield</span>
                    <input
                      type="checkbox"
                      checked={itemOverrides[selectedItem.id]?.faceMaskingEnabled ?? true}
                      onChange={(e) =>
                        handleItemOverrideChange(selectedItem.id, {
                          faceMaskingEnabled: e.target.checked,
                        })
                      }
                      className="w-4 h-4 accent-amber-400 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 text-xs cursor-pointer">
                    <span className="text-slate-300 font-medium">FabriQ Watermark Overlay</span>
                    <input
                      type="checkbox"
                      checked={itemOverrides[selectedItem.id]?.watermarkEnabled ?? true}
                      onChange={(e) =>
                        handleItemOverrideChange(selectedItem.id, {
                          watermarkEnabled: e.target.checked,
                        })
                      }
                      className="w-4 h-4 accent-amber-400 rounded"
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <span className="material-symbols-outlined text-[36px] text-slate-700 mb-2">
                  touch_app
                </span>
                <p className="text-xs font-bold text-slate-400 font-sans">
                  Select Any Product From Grid
                </p>
                <p className="text-[10px] text-slate-500 mt-1">
                  Inspect & customize individual image crop ratios, watermark visibility, and model face shielding.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
          <p className="text-[11px] text-slate-400 font-mono">
            Catalog Size: {FULL_CATALOG.length} items • Active Filter: {filteredCatalog.length} items
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Done & Return To Catalog
          </button>
        </div>
      </div>
    </div>
  );
};
