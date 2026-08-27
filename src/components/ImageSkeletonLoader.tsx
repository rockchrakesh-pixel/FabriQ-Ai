import React from 'react';
import { motion } from 'motion/react';

interface ImageSkeletonLoaderProps {
  aspectRatio?: string; // '1:1' | '4:3' | '16:9' | string
  className?: string;
  showWatermarkPreview?: boolean;
}

export const ImageSkeletonLoader: React.FC<ImageSkeletonLoaderProps> = ({
  aspectRatio = 'aspect-square',
  className = '',
  showWatermarkPreview = true,
}) => {
  return (
    <div
      className={`relative overflow-hidden bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center ${aspectRatio} ${className}`}
    >
      {/* Animated Shimmer Wave using Framer Motion */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-slate-900 via-amber-400/10 via-slate-800 to-slate-900"
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{
          repeat: Infinity,
          repeatType: 'loop',
          duration: 1.5,
          ease: 'easeInOut',
        }}
      />

      {/* Subtle Texture Pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:12px_12px]" />

      {/* Centered FabriQ Watermark Shimmer Badge */}
      <div className="relative z-10 flex flex-col items-center gap-1.5 p-3 text-center pointer-events-none select-none">
        <motion.div
          animate={{ scale: [0.98, 1.04, 0.98], opacity: [0.6, 0.9, 0.6] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="flex items-center gap-1.5"
        >
          <div className="w-5 h-5 rounded-md bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-sm">
            <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
          </div>
          <span className="font-extrabold text-[10px] text-amber-300 tracking-[0.2em] uppercase font-sans">
            FabriQ AI Studio
          </span>
        </motion.div>

        {showWatermarkPreview && (
          <span className="text-[8px] font-mono font-bold text-slate-400 tracking-wider uppercase animate-pulse">
            Preloading HD Asset...
          </span>
        )}
      </div>

      {/* Decorative Corner Watermark Stamp */}
      <div className="absolute bottom-1.5 right-1.5 z-10 pointer-events-none opacity-20">
        <span className="text-white font-black text-[9px] tracking-widest uppercase font-mono border border-white/20 px-1 py-0.5 rounded">
          FabriQ
        </span>
      </div>
    </div>
  );
};
