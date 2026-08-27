import React from 'react';

interface SkeletonLoaderProps {
  variant?: 'card' | 'list' | 'product-grid' | 'hero' | 'profile' | 'text';
  count?: number;
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'card',
  count = 1,
  className = '',
}) => {
  const items = Array.from({ length: count });

  const baseShimmer =
    'relative overflow-hidden bg-gradient-to-r from-[#12121C] via-[#1E1E2E] to-[#12121C] bg-[length:200%_100%] animate-shimmer rounded-2xl border border-[#9E7B4F]/20';

  if (variant === 'hero') {
    return (
      <div className={`w-full h-48 sm:h-56 ${baseShimmer} p-6 flex flex-col justify-end space-y-3 ${className}`}>
        <div className="w-24 h-4 bg-amber-400/20 rounded-full animate-pulse" />
        <div className="w-3/4 h-7 bg-slate-700/50 rounded-lg animate-pulse" />
        <div className="w-1/2 h-4 bg-slate-800/60 rounded-md animate-pulse" />
      </div>
    );
  }

  if (variant === 'profile') {
    return (
      <div className={`p-4 bg-[#12121C] rounded-3xl border border-[#9E7B4F]/30 flex items-center gap-4 ${className}`}>
        <div className="w-14 h-14 rounded-2xl bg-amber-400/20 animate-pulse border border-amber-400/30" />
        <div className="flex-1 space-y-2">
          <div className="w-32 h-4 bg-slate-700/50 rounded-md animate-pulse" />
          <div className="w-20 h-3 bg-amber-400/20 rounded-md animate-pulse" />
        </div>
      </div>
    );
  }

  if (variant === 'product-grid') {
    return (
      <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 ${className}`}>
        {items.map((_, idx) => (
          <div key={idx} className={`p-3 bg-[#12121C] rounded-2xl border border-[#9E7B4F]/20 space-y-3`}>
            <div className="w-full h-36 bg-slate-800/60 rounded-xl animate-pulse relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent animate-shimmer" />
            </div>
            <div className="w-20 h-3 bg-amber-400/20 rounded-md animate-pulse" />
            <div className="w-full h-4 bg-slate-700/50 rounded-md animate-pulse" />
            <div className="flex justify-between items-center pt-1">
              <div className="w-14 h-4 bg-amber-400/30 rounded-md animate-pulse" />
              <div className="w-8 h-8 rounded-xl bg-slate-800 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className={`space-y-3 ${className}`}>
        {items.map((_, idx) => (
          <div key={idx} className="p-3.5 bg-[#12121C] rounded-2xl border border-[#9E7B4F]/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 animate-pulse" />
              <div className="space-y-1.5">
                <div className="w-36 h-4 bg-slate-700/60 rounded-md animate-pulse" />
                <div className="w-24 h-3 bg-slate-800/60 rounded-md animate-pulse" />
              </div>
            </div>
            <div className="w-16 h-7 bg-amber-400/20 rounded-xl animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((_, idx) => (
        <div key={idx} className={`p-4 bg-[#12121C] rounded-2xl border border-[#9E7B4F]/20 space-y-2.5`}>
          <div className="w-1/3 h-3 bg-amber-400/20 rounded-md animate-pulse" />
          <div className="w-2/3 h-5 bg-slate-700/50 rounded-md animate-pulse" />
          <div className="w-full h-10 bg-slate-800/40 rounded-xl animate-pulse" />
        </div>
      ))}
    </div>
  );
};
