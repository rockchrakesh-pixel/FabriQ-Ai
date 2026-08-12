import React, { useState } from 'react';
import { ScreenId } from '../types';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { useNotifications } from '../context/NotificationContext';

interface AIFabricAdvisorProps {
  onNavigate: (screen: ScreenId) => void;
}

interface SampleGarment {
  id: string;
  name: string;
  fabric: string;
  defaultStain: string;
  image: string;
  description: string;
}

const SAMPLE_GARMENTS: SampleGarment[] = [
  {
    id: 'g1',
    name: 'Kanjeevaram Gold Zari Saree',
    fabric: 'Kanjeevaram Pure Silk',
    defaultStain: 'Turmeric / Curry Stain',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
    description: 'Heavy gold brocade weave needing non-aqueous pH dry cleaning',
  },
  {
    id: 'g2',
    name: 'Italian Wool Cashmere Blazer',
    fabric: 'Cashmere & Merino Wool',
    defaultStain: 'Red Wine',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80',
    description: 'Structured tailoring vulnerable to fiber shrinkage and water spots',
  },
  {
    id: 'g3',
    name: 'Hand-Embroidered Velvet Lehenga',
    fabric: 'Fine Silk Velvet',
    defaultStain: 'Grease / Cooking Oil',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80',
    description: 'Delicate pile velvet with metallic zardozi stone embellishments',
  },
  {
    id: 'g4',
    name: 'Giza Egyptian Cotton Shirt',
    fabric: '100% Giza Long-Staple Cotton',
    defaultStain: 'Ink & Pen',
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=600&q=80',
    description: 'High-density weave susceptible to collar yellowing and friction wear',
  },
];

const FABRIC_TYPES = [
  { id: 'kanjeevaram', name: 'Kanjeevaram / Banarasi Silk', delicacy: 'Extreme', wash: 'Hydrocarbon Dry Clean Only' },
  { id: 'mulberry_silk', name: 'Mulberry Raw Silk', delicacy: 'High', wash: 'pH Neutral Eco Solvents' },
  { id: 'cashmere', name: 'Cashmere & Pashmina Wool', delicacy: 'High', wash: 'Soft Steam Sanitization' },
  { id: 'velvet', name: 'Micro-Velvet & Brocade', delicacy: 'Extreme', wash: 'Hand Spotting & Gentle Vapor' },
  { id: 'linen', name: 'Pure French Linen', delicacy: 'Medium', wash: 'Aqueous Eco Soft Wash' },
  { id: 'giza_cotton', name: 'Giza Superfine Cotton', delicacy: 'Medium', wash: 'Vacuum Steam Press & Enzyme' },
  { id: 'leather', name: 'Pure Leather & Suede', delicacy: 'Extreme', wash: 'Conditioning Oil Treatment' },
];

const STAIN_CONCERNS = [
  { id: 'turmeric', label: 'Turmeric / Curry Stain', icon: 'flare', urgency: 'High' },
  { id: 'red_wine', label: 'Red Wine & Berry Juice', icon: 'wine_bar', urgency: 'Immediate' },
  { id: 'grease', label: 'Grease / Cooking Oil', icon: 'oil_barrel', urgency: 'Medium' },
  { id: 'ink', label: 'Ballpoint Ink & Dye Transfer', icon: 'edit', urgency: 'High' },
  { id: 'sweat', label: 'Collar Sweat & Underarm Yellowing', icon: 'water_drop', urgency: 'Medium' },
  { id: 'coffee', label: 'Coffee & Dark Tea', icon: 'coffee', urgency: 'Medium' },
  { id: 'lipstick', label: 'Makeup / Foundation / Wax', icon: 'face', urgency: 'Medium' },
];

export const AIFabricAdvisor: React.FC<AIFabricAdvisorProps> = ({ onNavigate }) => {
  const { sendNotification } = useNotifications();

  // User input states
  const [selectedGarment, setSelectedGarment] = useState<SampleGarment | null>(SAMPLE_GARMENTS[0]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedFabric, setSelectedFabric] = useState<string>(FABRIC_TYPES[0].name);
  const [selectedStains, setSelectedStains] = useState<string[]>([STAIN_CONCERNS[0].label]);
  const [customNotes, setCustomNotes] = useState<string>('');

  // AI Diagnostic states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<{
    fabricScore: number;
    preservationIndex: string;
    treatmentMethod: string;
    preTreatmentSteps: string[];
    solventType: string;
    dryingProtocol: string;
    aiNotes: string;
    recommendedCost: number;
  } | null>(null);

  // Handle image upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setSelectedGarment(null);
        sendNotification(
          'Photo Uploaded',
          'Garment photo attached successfully for AI fiber scan.',
          'system'
        );
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleStain = (stainLabel: string) => {
    if (selectedStains.includes(stainLabel)) {
      setSelectedStains(selectedStains.filter((s) => s !== stainLabel));
    } else {
      setSelectedStains([...selectedStains, stainLabel]);
    }
  };

  // Run AI Diagnostics Simulation
  const runAIDiagnostics = () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);

    setAnalysisStep('Performing High-Resolution Fabric Weave Optical Scan...');

    setTimeout(() => {
      setAnalysisStep('Analyzing Fiber Tensile Strength & Color Fastness Index...');
    }, 900);

    setTimeout(() => {
      setAnalysisStep('Simulating Non-Invasive Solvent Spotting Reaction...');
    }, 1800);

    setTimeout(() => {
      setIsAnalyzing(false);

      // Generate bespoke care protocol
      const isExtreme = selectedFabric.includes('Kanjeevaram') || selectedFabric.includes('Velvet') || selectedFabric.includes('Leather');
      const hasHighUrgency = selectedStains.some((s) => s.includes('Turmeric') || s.includes('Red Wine') || s.includes('Ink'));

      setAnalysisResult({
        fabricScore: isExtreme ? 98 : 91,
        preservationIndex: isExtreme ? 'Museum-Grade Delicacy (Class I)' : 'Luxury Garment Care (Class II)',
        treatmentMethod: isExtreme
          ? 'Hydrocarbon Eco Dry Wash + Ultrasonic Spot Removal'
          : 'pH-Balanced Organic Wet Cleaning & Vacuum Steam Press',
        preTreatmentSteps: [
          'Pre-treat with zero-alkaline organic enzyme formula at 24°C',
          'Apply specialized micro-porous spotting clay for oil/dye extraction',
          'Isolate metallic zari threads with heat-barrier protective mesh',
        ],
        solventType: 'GreenEarth Silicone Hydrocarbon (100% Non-Toxic & Odorless)',
        dryingProtocol: 'Controlled Tension Air Tunnel Drying at 38°C with Moisture Sensor Auto-Cutoff',
        aiNotes: hasHighUrgency
          ? '⚠️ Critical: Stain requires immediate professional spotting within 48h to prevent permanent oxidation into the silk matrix.'
          : '✅ Excellent Preservation Potential: Garment fibers show high resilience with 99.4% stain recovery expected.',
        recommendedCost: isExtreme ? 650 : 350,
      });

      sendNotification(
        'AI Fabric Analysis Complete',
        `Personalized care plan generated for ${selectedFabric}.`,
        'system'
      );
    }, 2700);
  };

  const currentImage = uploadedImage || selectedGarment?.image || SAMPLE_GARMENTS[0].image;

  return (
    <div className="flex flex-col w-full pb-28 pt-16 bg-slate-900 text-slate-100 min-h-screen font-sans">
      <Header onNavigate={onNavigate} currentScreen="ai-fabric-advisor" />

      <section className="px-4 max-w-4xl mx-auto w-full pt-4 space-y-6">
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-900 rounded-3xl p-6 border border-amber-500/40 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest">
                <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                <span>GEMINI VISION & FABRIC INTELLIGENCE</span>
              </div>
              <h1 className="font-['Libre_Caslon_Text',serif] text-2xl sm:text-3xl font-bold text-white tracking-tight">
                AI Fabric Advisor & Stain Atelier
              </h1>
              <p className="text-xs text-amber-200/80 font-medium max-w-xl">
                Upload or select garment photos to receive instant material fiber diagnostics, stain removal protocols, and bespoke preservation advice.
              </p>
            </div>

            <button
              onClick={() => onNavigate('service-catalog')}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-4 py-2 rounded-2xl text-xs shadow-lg transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <span className="material-symbols-outlined text-[16px]">dry_cleaning</span>
              <span>Explore All Atelier Services</span>
            </button>
          </div>
        </div>

        {/* STEP 1: GARMENT SELECTION OR PHOTO UPLOAD */}
        <div className="bg-slate-950/80 rounded-3xl p-5 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center">
                1
              </span>
              <div>
                <h2 className="font-bold text-white text-base">Select or Upload Garment Photo</h2>
                <p className="text-xs text-slate-400">Choose from sample luxury garments or upload your own high-resolution image</p>
              </div>
            </div>

            <label className="bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-400/40 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">add_a_photo</span>
              <span>Upload Photo</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {/* Preset Sample Garment Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {SAMPLE_GARMENTS.map((garment) => {
              const isSelected = selectedGarment?.id === garment.id && !uploadedImage;
              return (
                <div
                  key={garment.id}
                  onClick={() => {
                    setSelectedGarment(garment);
                    setUploadedImage(null);
                    setSelectedFabric(garment.fabric);
                  }}
                  className={`relative rounded-2xl overflow-hidden border-2 cursor-pointer transition-all group ${
                    isSelected
                      ? 'border-amber-400 ring-4 ring-amber-400/20 shadow-lg scale-[1.02]'
                      : 'border-slate-800 hover:border-amber-400/50 opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="h-28 w-full bg-slate-900 relative">
                    <img
                      src={garment.image}
                      alt={garment.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-amber-400 text-slate-950 rounded-full p-1 shadow-md">
                        <span className="material-symbols-outlined text-[12px] block">check</span>
                      </div>
                    )}
                  </div>
                  <div className="p-2.5 bg-slate-900/90 text-left">
                    <p className="font-bold text-xs text-white truncate">{garment.name}</p>
                    <p className="text-[10px] text-amber-300 font-medium truncate">{garment.fabric}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* STEP 2: FABRIC TYPE & STAIN SPECIFICATION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Active Photo & Material Details */}
          <div className="bg-slate-950/80 rounded-3xl p-5 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-3">
                <span className="w-7 h-7 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center">
                  2
                </span>
                <h2 className="font-bold text-white text-base">Fabric Material & Spec</h2>
              </div>

              {/* Display Active Preview */}
              <div className="relative rounded-2xl overflow-hidden border border-amber-400/30 h-48 bg-slate-900 mb-4">
                <img
                  src={currentImage}
                  alt="Garment Preview"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent flex justify-between items-end">
                  <div>
                    <span className="bg-amber-400 text-slate-950 text-[9px] font-extrabold px-2 py-0.5 rounded uppercase">
                      Active Scan Target
                    </span>
                    <p className="font-bold text-sm text-white mt-1">
                      {uploadedImage ? 'Custom Uploaded Garment' : selectedGarment?.name}
                    </p>
                  </div>
                </div>
              </div>

              {/* Material Dropdown / Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Select Primary Fabric Composition:</span>
                  <span className="text-[10px] text-amber-400 font-mono">100% Organic Fiber Analysis</span>
                </label>
                <select
                  value={selectedFabric}
                  onChange={(e) => setSelectedFabric(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 text-xs font-medium focus:border-amber-400 focus:outline-none"
                >
                  {FABRIC_TYPES.map((f) => (
                    <option key={f.id} value={f.name}>
                      {f.name} ({f.delicacy} Delicacy - {f.wash})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-3 bg-amber-950/40 rounded-2xl border border-amber-500/30 text-xs text-amber-200 space-y-1 mt-3">
              <span className="font-bold text-amber-300 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">lightbulb</span>
                Atelier Pro Tip
              </span>
              <p className="text-[11px] text-amber-100/80 leading-relaxed">
                Never rub stains vigorously on Mulberry or Kanjeevaram silk. Blot gently with a clean dry cotton swab to prevent fiber friction damage.
              </p>
            </div>
          </div>

          {/* Stain Concerns & Custom Notes */}
          <div className="bg-slate-950/80 rounded-3xl p-5 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-3">
                <span className="w-7 h-7 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center">
                  3
                </span>
                <h2 className="font-bold text-white text-base">Specific Stain Concerns</h2>
              </div>

              <p className="text-xs text-slate-400 mb-3">
                Select all applicable stains or spills on this garment for tailored solvent pairing:
              </p>

              {/* Stain Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {STAIN_CONCERNS.map((stain) => {
                  const isChecked = selectedStains.includes(stain.label);
                  return (
                    <button
                      key={stain.id}
                      onClick={() => toggleStain(stain.label)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                        isChecked
                          ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md font-extrabold'
                          : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-amber-400/50'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">{stain.icon}</span>
                      <span>{stain.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Additional Care Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">
                  Additional Notes (e.g. Vintage Piece, Loose Zari, Old Stain):
                </label>
                <textarea
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="e.g. Stain is 3 days old, delicate hand embroidery on sleeves..."
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Run Diagnostics CTA Button */}
            <button
              onClick={runAIDiagnostics}
              disabled={isAnalyzing}
              className="w-full mt-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black py-3 rounded-2xl text-sm shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                  <span>Executing AI Fiber Diagnostics...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                  <span>Generate AI Fabric Care Protocol</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* DIAGNOSTIC PROGRESS MODAL / BANNER */}
        {isAnalyzing && (
          <div className="bg-slate-950 border-2 border-amber-400 rounded-3xl p-6 text-center space-y-3 shadow-2xl animate-pulse">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 font-black flex items-center justify-center mx-auto shadow-lg">
              <span className="material-symbols-outlined text-[28px] animate-spin">sync</span>
            </div>
            <h3 className="font-['Libre_Caslon_Text',serif] text-lg font-bold text-amber-300">
              {analysisStep}
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Matching with FabriQ AI 10,000+ Fabric & Hydrocarbon Solvent Matrix...
            </p>
          </div>
        )}

        {/* AI CARE REPORT RESULTS DISPLAY */}
        {analysisResult && !isAnalyzing && (
          <div className="bg-gradient-to-b from-slate-950 to-slate-900 rounded-3xl p-6 border-2 border-amber-400 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-emerald-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                    AI Diagnostic Report Verified
                  </span>
                  <span className="text-xs font-mono text-amber-400 font-bold">
                    Fiber Safety Index: {analysisResult.fabricScore}/100
                  </span>
                </div>
                <h2 className="font-['Libre_Caslon_Text',serif] text-xl font-bold text-white">
                  Bespoke Atelier Restoration Protocol
                </h2>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-extrabold block">
                  Est. Care Investment
                </span>
                <span className="text-xl font-black text-amber-300">
                  ₹{analysisResult.recommendedCost}
                </span>
              </div>
            </div>

            {/* AI Warning / Safety Note */}
            <div className="p-3.5 bg-amber-500/10 border border-amber-400/40 rounded-2xl text-xs text-amber-200 font-medium">
              {analysisResult.aiNotes}
            </div>

            {/* Protocol Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider block mb-1">
                  Primary Wash Technique
                </span>
                <p className="font-bold text-xs text-white">{analysisResult.treatmentMethod}</p>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider block mb-1">
                  Eco Solvent Formula
                </span>
                <p className="font-bold text-xs text-white">{analysisResult.solventType}</p>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider block mb-1">
                  Drying & Finishing
                </span>
                <p className="font-bold text-xs text-white">{analysisResult.dryingProtocol}</p>
              </div>
            </div>

            {/* Step-by-Step Pre-Treatment Protocol */}
            <div className="space-y-2">
              <h3 className="text-xs font-extrabold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">checklist</span>
                Pre-Treatment & Spotting Workflow:
              </h3>
              <div className="space-y-2">
                {analysisResult.preTreatmentSteps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2 bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-xs text-slate-200">
                    <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action CTA */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => {
                  sendNotification(
                    'Tailored Service Added to Booking',
                    `AI Care service for ${selectedFabric} added to your valet order.`,
                    'system'
                  );
                  onNavigate('cart');
                }}
                className="flex-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black py-3 rounded-2xl text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                <span>Book AI Care & Doorstep Valet Pickup (₹{analysisResult.recommendedCost})</span>
              </button>

              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-3 rounded-2xl text-xs border border-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">print</span>
                <span>Print Protocol</span>
              </button>
            </div>
          </div>
        )}
      </section>

      <BottomNav activePath="services" onNavigate={onNavigate} />
    </div>
  );
};
