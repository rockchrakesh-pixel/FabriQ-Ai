import React from 'react';
import { motion } from 'motion/react';

interface GlobalSkeletonLoaderProps {
  type?: 'dashboard' | 'catalog' | 'details' | 'generic';
}

export const GlobalSkeletonLoader: React.FC<GlobalSkeletonLoaderProps> = ({ type = 'generic' }) => {
  return (
    <div className="w-full min-h-screen pt-20 pb-28 px-4 sm:px-6 max-w-7xl mx-auto flex flex-col gap-5 animate-pulse select-none">
      {/* Top Banner Skeleton */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-200 dark:bg-slate-800/80 h-36 w-full border border-slate-300 dark:border-slate-700/60 shadow-xs">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 dark:via-amber-400/20 to-transparent"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
        />
        <div className="p-5 flex flex-col justify-between h-full">
          <div className="flex justify-between items-center">
            <div className="h-4 w-28 bg-slate-300 dark:bg-slate-700 rounded-md" />
            <div className="h-6 w-16 bg-amber-400/30 rounded-full" />
          </div>
          <div className="space-y-2">
            <div className="h-6 w-3/4 bg-slate-300 dark:bg-slate-700 rounded-lg" />
            <div className="h-3 w-1/2 bg-slate-300 dark:bg-slate-700 rounded-md" />
          </div>
        </div>
      </div>

      {/* Quick Action Pills Skeleton */}
      <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-9 w-28 shrink-0 bg-slate-200 dark:bg-slate-800 rounded-full border border-slate-300 dark:border-slate-700"
          />
        ))}
      </div>

      {/* Content Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-1">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="relative overflow-hidden bg-white dark:bg-[#12121C] rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs flex gap-3.5 items-center"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-100 dark:via-slate-800/50 to-transparent"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut', delay: i * 0.1 }}
            />
            <div className="w-16 h-16 rounded-xl bg-slate-200 dark:bg-slate-800 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-800 rounded-md" />
              <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-800/70 rounded-md" />
              <div className="flex justify-between items-center pt-1">
                <div className="h-4 w-12 bg-amber-400/30 rounded-md" />
                <div className="h-7 w-16 bg-slate-900 dark:bg-amber-400/20 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Branding Badge */}
      <div className="flex items-center justify-center gap-2 py-4 text-slate-400">
        <span className="material-symbols-outlined text-[16px] animate-spin text-[#9E7B4F]">sync</span>
        <span className="text-[11px] font-extrabold uppercase tracking-widest font-sans">
          Loading FabriQ AI Atelier Care Data...
        </span>
      </div>
    </div>
  );
};
