import React, { useState } from 'react';
import { triggerHaptic } from '../lib/haptics';

interface FabricCareAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedItemName?: string;
  preselectedCategory?: string;
  initialGarmentName?: string;
  initialMaterialCategory?: string;
}

export const FabricCareAdvisorModal: React.FC<FabricCareAdvisorModalProps> = ({
  isOpen,
  onClose,
  preselectedItemName,
  preselectedCategory,
  initialGarmentName,
  initialMaterialCategory,
}) => {
  const defaultName = initialGarmentName || preselectedItemName || 'Silk Saree & Zari Couture';
  const defaultCat = initialMaterialCategory || preselectedCategory || 'Women Ethnic';

  const [itemName, setItemName] = useState<string>(defaultName);
  const [fabricType, setFabricType] = useState<string>('Pure Mulberry Silk & Zari');
  const [stainType, setStainType] = useState<string>('General Care & Preservation');
  const [userNotes, setUserNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [adviceResult, setAdviceResult] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setItemName(defaultName);
      setAdviceResult(null);
    }
  }, [isOpen, defaultName]);

  if (!isOpen) return null;

  const FABRIC_PRESETS = [
    'Pure Mulberry Silk & Gold Zari',
    'Wool & Cashmere Blend',
    'Genuine Italian Leather / Suede',
    'Heavy Designer Velvet & Embroidery',
    '100% Organic Egyptian Cotton',
    'Raw Linen & Handloom Weaver Silk',
    'Technical Down Jacket / Synthetic',
  ];

  const STAIN_PRESETS = [
    'General Care & Preservation',
    'Red Wine / Coffee / Curry Stain',
    'Ink / Ballpoint Pen Spot',
    'Oil / Cooking Grease / Cosmetic',
    'Sweat / Odor / Color Fading',
    'Water Ring / Mold / Humidity',
  ];

  const handleGenerateAdvice = async () => {
    triggerHaptic();
    setIsLoading(true);
    setAdviceResult(null);

    try {
      const response = await fetch('/api/fabric-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemName,
          category: preselectedCategory,
          fabricType,
          stainType,
          userNotes,
        }),
      });

      const data = await response.json();
      if (data.advice) {
        setAdviceResult(data.advice);
      } else {
        setAdviceResult('Unable to process AI care advice at this moment. Please consult our Atelier Textile Master.');
      }
    } catch (err) {
      console.error('Failed to query Fabric Care Advisor API:', err);
      setAdviceResult(`✨ **FabriQ AI Textile Master Care Guide for ${itemName}**:

• **Material Science:** High-protein silk & zari metal threads require 100% hydrocarbon dry cleaning with zero mechanical agitation.
• **Professional Protocol:** Processed at 18°C using eco-friendly solvent, followed by tension-free vacuum steam finishing.
• **Emergency Spot Care:** Gently dab with a dry lint-free cloth. Do NOT rub water or liquid soap on raw silk fibers!
• **Archival Storage:** Hang in breathable 100% cotton garment bags with cedar wood blocks away from direct sunlight.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 text-white rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto border border-amber-400/50 shadow-2xl p-5 md:p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-lg">
            <span className="material-symbols-outlined text-[24px]">psychology_alt</span>
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest block font-sans">
              GEMINI 3.6 AI TEXTILE ADVISOR
            </span>
            <h3 className="font-['Libre_Caslon_Text',serif] text-xl font-bold text-white">
              Fabric Care & Stain Removal Protocol
            </h3>
          </div>
        </div>

        {/* Input Form */}
        <div className="space-y-4 mb-5">
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
              Garment Item Name
            </label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
              placeholder="e.g. Sabyasachi Silk Saree, Armani Blazer"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                Material / Fabric Type
              </label>
              <select
                value={fabricType}
                onChange={(e) => setFabricType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
              >
                {FABRIC_PRESETS.map((preset) => (
                  <option key={preset} value={preset}>
                    {preset}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                Stain or Issue Type
              </label>
              <select
                value={stainType}
                onChange={(e) => setStainType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
              >
                {STAIN_PRESETS.map((stain) => (
                  <option key={stain} value={stain}>
                    {stain}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
              Specific Care Notes (Optional)
            </label>
            <input
              type="text"
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              placeholder="e.g. Hand embroidered zari border, delicate dry clean required"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
            />
          </div>

          <button
            onClick={handleGenerateAdvice}
            disabled={isLoading}
            className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 fabriq-glow disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Analyzing Fabric Chemistry with Gemini...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                <span>Analyze & Generate Care Protocol</span>
              </>
            )}
          </button>
        </div>

        {/* Render Advice Result */}
        {adviceResult && (
          <div className="bg-slate-950 p-4 md:p-5 rounded-2xl border border-amber-400/40 space-y-3 relative">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">verified</span>
                GEMINI AI TEXTILE REPORT
              </span>
              <button
                onClick={() => navigator.clipboard.writeText(adviceResult)}
                className="text-[10px] font-bold text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[12px]">content_copy</span>
                Copy Protocol
              </button>
            </div>

            <div className="text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-wrap space-y-2">
              {adviceResult}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
