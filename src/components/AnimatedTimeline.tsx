import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export interface TimelineStage {
  id: number;
  title: string;
  subtitle: string;
  timestamp: string;
  status: 'completed' | 'active' | 'pending';
  icon: string;
  stationName: string;
  inspectorName: string;
  parameters: { label: string; value: string }[];
  details: string;
}

const DEFAULT_TIMELINE_STAGES: TimelineStage[] = [
  {
    id: 1,
    title: '1. Doorstep Valet Pickup & RFID Tagging',
    subtitle: 'Valet Captain Suresh collected items and attached RFID tags.',
    timestamp: 'Yesterday, 05:15 PM',
    status: 'completed',
    icon: 'local_shipping',
    stationName: 'Jubilee Hills Logistics Hub',
    inspectorName: 'Suresh Varma (Captain #04)',
    parameters: [
      { label: 'Valet Vehicle', value: 'EV Van #04' },
      { label: 'Barcode Tag', value: 'TAG-8829-01/03' },
    ],
    details: '3 Garments scanned into FabriQ cloud inventory with photo inspection.',
  },
  {
    id: 2,
    title: '2. Hydrocarbon Eco-Wash & Stain Pre-Spotting',
    subtitle: 'Zero-odor Italian hydrocarbon solvent bath with organic enzymes.',
    timestamp: 'Today, 09:30 AM',
    status: 'completed',
    icon: 'water_drop',
    stationName: 'Eco-Solvent Chamber 2',
    inspectorName: 'Master Chemist Ramesh K.',
    parameters: [
      { label: 'Solvent Temp', value: '18.2 °C' },
      { label: 'pH Balance', value: '7.0 Neutral' },
    ],
    details: 'Deep stain extraction completed for silk lapels and suede trims.',
  },
  {
    id: 3,
    title: '3. Fabric Integrity & Quality Inspection',
    subtitle: 'UV light inspection for fiber thread integrity and zero shrinkage.',
    timestamp: 'Today, 11:45 AM (Active Now)',
    status: 'active',
    icon: 'search_check',
    stationName: 'Atelier Inspection Station #4',
    inspectorName: 'Senior Auditor CH Rakesh',
    parameters: [
      { label: 'UV Scan', value: '100% Passed' },
      { label: 'Fiber Density', value: 'Optimal' },
    ],
    details: 'Hand inspecting Armani silk lining & zardozi embroidery under 10x optics.',
  },
  {
    id: 4,
    title: '4. Artisan Steam Press & Anti-Microbial Finish',
    subtitle: 'Italian vacuum suction press with lavender steam sanitization.',
    timestamp: 'Estimated: Today, 02:30 PM',
    status: 'pending',
    icon: 'iron',
    stationName: 'Vacuum Press Station',
    inspectorName: 'Master Presser David M.',
    parameters: [
      { label: 'Steam Pressure', value: '4.5 Bar' },
      { label: 'Anti-Moth Finish', value: 'Scheduled' },
    ],
    details: 'Hand shaping suit shoulders and lapel roll on cedar wood formers.',
  },
  {
    id: 5,
    title: '5. Archival Packaging & Final Hanger Assembly',
    subtitle: 'Breathable cotton garment bag with wooden hanger and cedar block.',
    timestamp: 'Estimated: Today, 04:00 PM',
    status: 'pending',
    icon: 'checkroom',
    stationName: 'Packaging & QC Lounge',
    inspectorName: 'Quality Lead Priya S.',
    parameters: [
      { label: 'Hanger Type', value: 'Cedar Contour' },
      { label: 'Cover', value: 'Eco Breathable' },
    ],
    details: 'Final barcode audit check and sealed with FabriQ tamper-evident gold seal.',
  },
  {
    id: 6,
    title: '6. Doorstep Valet Delivery En Route',
    subtitle: 'GPS live-tracked delivery by FabriQ Express Courier.',
    timestamp: 'Estimated: Today, 05:30 PM',
    status: 'pending',
    icon: 'moped',
    stationName: 'Out for Doorstep Delivery',
    inspectorName: 'Delivery Valet Ramesh N.',
    parameters: [
      { label: 'Route Code', value: 'HYD-RT-08' },
      { label: 'ETA Window', value: '25 Mins' },
    ],
    details: 'Delivered directly to customer with live OTP verification.',
  },
];

export const AnimatedTimeline: React.FC = () => {
  const [stages, setStages] = useState<TimelineStage[]>(DEFAULT_TIMELINE_STAGES);
  const [expandedStageId, setExpandedStageId] = useState<number>(3); // Active stage expanded by default

  // Simulate real-time progress update ticking
  useEffect(() => {
    const timer = setInterval(() => {
      // Gentle pulse refresh
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-[#0B1528] text-[#FAF9F6] rounded-3xl p-5 md:p-6 border-2 border-[#C29C6D]/40 shadow-2xl relative my-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[10px] font-black text-[#E5C07B] uppercase tracking-widest block font-sans">
              REAL-TIME GARMENT TRACKING TELEMETRY
            </span>
          </div>
          <h3 className="font-['Libre_Caslon_Text',serif] text-xl font-bold text-[#FAF9F6] mt-0.5">
            6-Stage Precision Dry Cleaning Progress
          </h3>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-mono text-slate-400 block">Current Stage</span>
          <span className="text-xs font-bold text-[#E5C07B] bg-[#070F1E] px-3 py-1 rounded-full border border-[#C29C6D]/40 inline-block">
            Stage 3 of 6 • Active
          </span>
        </div>
      </div>

      {/* Progress Bar Header */}
      <div className="w-full bg-[#070F1E] h-2.5 rounded-full overflow-hidden mb-6 relative border border-[#C29C6D]/20">
        <motion.div
          className="bg-gradient-to-r from-[#D4AF37] via-[#E5C07B] to-emerald-400 h-full rounded-full relative"
          initial={{ width: '0%' }}
          animate={{ width: '50%' }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        >
          <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-white rounded-full animate-ping" />
        </motion.div>
      </div>

      {/* Vertical Animated Timeline */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:via-[#D4AF37] before:to-slate-800">
        {stages.map((stage) => {
          const isCompleted = stage.status === 'completed';
          const isActive = stage.status === 'active';
          const isExpanded = expandedStageId === stage.id;

          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: stage.id * 0.08 }}
              className="relative group"
            >
              {/* Node Circle */}
              <div
                onClick={() => setExpandedStageId(stage.id)}
                className={`absolute -left-[31px] top-1 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all z-10 ${
                  isCompleted
                    ? 'bg-emerald-500 text-slate-950 ring-4 ring-[#070F1E] shadow-lg'
                    : isActive
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#C29C6D] text-[#0B1528] ring-4 ring-[#070F1E] shadow-2xl scale-110'
                    : 'bg-[#070F1E] text-slate-400 ring-4 ring-[#0B1528] border border-[#C29C6D]/30'
                }`}
              >
                <span className="material-symbols-outlined text-[18px] font-black">
                  {isCompleted ? 'check' : isActive ? 'rotate_right' : stage.icon}
                </span>
              </div>

              {/* Stage Card */}
              <div
                onClick={() => setExpandedStageId(stage.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#070F1E] border-[#D4AF37] shadow-xl ring-1 ring-[#D4AF37]/40'
                    : isCompleted
                    ? 'bg-[#070F1E]/80 border-[#C29C6D]/30 hover:border-[#C29C6D]'
                    : 'bg-[#070F1E]/40 border-slate-800/60 opacity-70 hover:opacity-100'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className={`text-xs font-bold font-sans ${isActive ? 'text-[#E5C07B]' : 'text-[#FAF9F6]'}`}>
                        {stage.title}
                      </h4>
                      {isActive && (
                        <span className="bg-gradient-to-r from-[#D4AF37] to-[#C29C6D] text-[#0B1528] text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                          LIVE IN STUDIO
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5">{stage.subtitle}</p>
                  </div>

                  <span className="text-[10px] font-mono font-bold text-slate-400 shrink-0 ml-2">
                    {stage.timestamp}
                  </span>
                </div>

                {/* Expanded Telemetry Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 pt-3 border-t border-slate-800 space-y-2"
                    >
                      <p className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        💬 <strong className="text-amber-300">{stage.inspectorName}:</strong> "{stage.details}"
                      </p>

                      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                        <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                          <span className="text-slate-500 block text-[9px]">STATION</span>
                          <span className="text-slate-200 font-bold">{stage.stationName}</span>
                        </div>
                        {stage.parameters.map((param, idx) => (
                          <div key={idx} className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                            <span className="text-slate-500 block text-[9px] uppercase">{param.label}</span>
                            <span className="text-emerald-400 font-bold">{param.value}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
