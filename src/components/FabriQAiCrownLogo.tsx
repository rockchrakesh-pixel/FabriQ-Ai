import React from 'react';

interface FabriQAiCrownLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  showTagline?: boolean;
  theme?: 'navy' | 'white' | 'transparent' | 'auto';
  className?: string;
  onClick?: () => void;
}

export const FabriQAiCrownLogo: React.FC<FabriQAiCrownLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  showTagline = false,
  theme = 'auto',
  className = '',
  onClick,
}) => {
  // Dimension configurations
  const crownDimensions = {
    xs: 'w-4 h-3',
    sm: 'w-5 h-4',
    md: 'w-7 h-5',
    lg: 'w-9 h-7',
    xl: 'w-12 h-9',
  };

  const titleSizes = {
    xs: 'text-xs tracking-tight',
    sm: 'text-sm sm:text-base tracking-tight',
    md: 'text-base sm:text-xl tracking-tight',
    lg: 'text-xl sm:text-2xl tracking-tight',
    xl: 'text-3xl sm:text-4xl tracking-tight',
  };

  const subtitleSizes = {
    xs: 'text-[7px] tracking-[0.18em]',
    sm: 'text-[8.5px] tracking-[0.2em]',
    md: 'text-[9.5px] sm:text-[10px] tracking-[0.22em]',
    lg: 'text-[11px] sm:text-[12px] tracking-[0.25em]',
    xl: 'text-[13px] sm:text-[14px] tracking-[0.28em]',
  };

  return (
    <div
      onClick={onClick}
      className={`inline-flex flex-col items-center select-none ${
        onClick ? 'cursor-pointer transition-transform active:scale-95' : ''
      } ${className}`}
    >
      {/* 5-POINT IMPERIAL GOLD CROWN (REPLICATING THE OFFICIAL FABRIQ AI CROWN FROM STORE FACADE) */}
      <svg
        viewBox="0 0 100 70"
        className={`${crownDimensions[size]} mb-0.5 filter drop-shadow-[0_2px_4px_rgba(194,156,109,0.4)]`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="fabriqGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF1B8" />
            <stop offset="30%" stopColor="#D4AF37" />
            <stop offset="65%" stopColor="#C29C6D" />
            <stop offset="100%" stopColor="#83633B" />
          </linearGradient>
          <linearGradient id="fabriqGoldShimmer" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#D4AF37" />
            <stop offset="50%" stopColor="#FFF9E6" />
            <stop offset="100%" stopColor="#C29C6D" />
          </linearGradient>
        </defs>

        {/* Crown Base Band with Gem insets */}
        <path
          d="M10 54 L90 54 Q92 54 92 57 L90 64 Q90 66 88 66 L12 66 Q10 66 10 64 L8 57 Q8 54 10 54 Z"
          fill="url(#fabriqGoldGrad)"
          stroke="#E5C07B"
          strokeWidth="1"
        />
        {/* Crown Base Jewels */}
        <circle cx="25" cy="60" r="2.5" fill="#FFF9E6" />
        <circle cx="50" cy="60" r="3" fill="#FFF9E6" />
        <circle cx="75" cy="60" r="2.5" fill="#FFF9E6" />

        {/* Crown 5 Spikes with curves */}
        <path
          d="M12 54 L8 28 L28 44 L50 14 L72 44 L92 28 L88 54 Z"
          fill="url(#fabriqGoldGrad)"
          stroke="#FFE8A3"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Inner Filigree Arch */}
        <path
          d="M20 54 Q35 38 50 36 Q65 38 80 54"
          stroke="#FFF9E6"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.8"
        />

        {/* Crown Peak Pearls / Jewels */}
        <circle cx="8" cy="27" r="3.5" fill="url(#fabriqGoldShimmer)" stroke="#FFF" strokeWidth="0.8" />
        <circle cx="28" cy="43" r="3" fill="url(#fabriqGoldShimmer)" stroke="#FFF" strokeWidth="0.8" />
        <circle cx="50" cy="13" r="4.5" fill="url(#fabriqGoldShimmer)" stroke="#FFF" strokeWidth="1" />
        <circle cx="72" cy="43" r="3" fill="url(#fabriqGoldShimmer)" stroke="#FFF" strokeWidth="0.8" />
        <circle cx="92" cy="27" r="3.5" fill="url(#fabriqGoldShimmer)" stroke="#FFF" strokeWidth="0.8" />
      </svg>

      {/* TYPOGRAPHY: "FabriQ" */}
      <div className="flex items-center justify-center leading-none">
        <span
          className={`font-['Libre_Caslon_Text',serif] font-bold ${titleSizes[size]} ${
            theme === 'white'
              ? 'text-[#FAF9F6]'
              : theme === 'navy'
              ? 'text-[#0B1528]'
              : 'text-[#0B1528] dark:text-[#FAF9F6]'
          }`}
        >
          Fabri
          <span className="font-extrabold text-[#D4AF37] dark:text-[#E5C07B] drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)] ml-[0.5px]">
            Q
          </span>
        </span>
      </div>

      {/* SUBTITLE: "PREMIUM FABRIC CARE & LIFESTYLE" */}
      {showSubtitle && (
        <span
          className={`font-sans font-bold uppercase ${subtitleSizes[size]} mt-0.5 whitespace-nowrap ${
            theme === 'white'
              ? 'text-[#E5C07B]'
              : theme === 'navy'
              ? 'text-[#83633B]'
              : 'text-[#83633B] dark:text-[#C29C6D]'
          }`}
        >
          PREMIUM FABRIC CARE & LIFESTYLE
        </span>
      )}

      {/* OPTIONAL TAGLINE: "Care • Fit • Style" */}
      {showTagline && (
        <div className="flex items-center gap-1.5 text-[9px] sm:text-[10.5px] font-semibold text-[#83633B] dark:text-[#E5C07B] tracking-wider mt-0.5">
          <span>Care</span>
          <span className="text-[#C29C6D] text-[8px]">•</span>
          <span>Fit</span>
          <span className="text-[#C29C6D] text-[8px]">•</span>
          <span>Style</span>
        </div>
      )}
    </div>
  );
};
