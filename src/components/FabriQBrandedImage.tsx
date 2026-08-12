import React, { useState, useEffect } from 'react';
import { getAssetCropClass, shouldApplyFaceMask, preloadImage } from '../lib/assetManager';
import { getBrandingSettings, subscribeBrandingSettings, isProductAssetMissingBranding, BrandingSettings } from '../lib/assetManager';
import { ImageSkeletonLoader } from './ImageSkeletonLoader';
import fabriqLogo from '../assets/images/fabriq_ai_logo_1785771380575.jpg';

export type LabelType = 'woven-tag' | 'embroidery' | 'leather-patch' | 'metallic-badge';

export interface FabriQBrandedImageProps {
  src?: string;
  highDefUrl?: string;
  alt: string;
  category?: string;
  labelType?: LabelType;
  isHeadlessMannequin?: boolean;
  containerClassName?: string;
  imageClassName?: string;
  badge?: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  showLightboxOnClick?: boolean;
}

export const FabriQBrandedImage: React.FC<FabriQBrandedImageProps> = ({
  src,
  highDefUrl,
  alt,
  category,
  labelType = 'woven-tag',
  isHeadlessMannequin,
  containerClassName = "relative overflow-hidden",
  imageClassName = "w-full h-full object-cover",
  badge,
  onClick,
  showLightboxOnClick = true,
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [brandingSettings, setBrandingSettings] = useState<BrandingSettings>(getBrandingSettings());

  useEffect(() => {
    return subscribeBrandingSettings(() => {
      setBrandingSettings(getBrandingSettings());
    });
  }, []);

  const activeSrc = highDefUrl || src;
  const cropClass = getAssetCropClass(category, alt);
  
  // Auto-detect if item requires headless mannequin overlay (Sherwani, Dhoti, or Kidswear, Traditional Ethnic)
  const itemNameLower = alt.toLowerCase();
  const categoryLower = (category || '').toLowerCase();
  const requiresHeadlessMannequin =
    isHeadlessMannequin !== undefined
      ? isHeadlessMannequin
      : itemNameLower.includes('sherwani') ||
        itemNameLower.includes('dhoti') ||
        itemNameLower.includes('kid') ||
        itemNameLower.includes('child') ||
        itemNameLower.includes('frock') ||
        itemNameLower.includes('uniform') ||
        itemNameLower.includes('school') ||
        itemNameLower.includes('baby') ||
        itemNameLower.includes('blanket') ||
        categoryLower.includes('kid') ||
        categoryLower.includes('kids');

  const isFaceMaskActive =
    (requiresHeadlessMannequin || shouldApplyFaceMask(category, alt)) &&
    brandingSettings.strictFaceMasking;

  const qaStatus = isProductAssetMissingBranding(category, alt, undefined, brandingSettings);

  useEffect(() => {
    if (activeSrc) {
      preloadImage(activeSrc).catch(() => {});
    }
  }, [activeSrc]);

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick(e);
    } else if (showLightboxOnClick && !error && activeSrc) {
      e.stopPropagation();
      setIsLightboxOpen(true);
    }
  };

  // Subtle FabriQ Brand Label Overlay - Designed for high legibility across mobile & desktop grids
  const renderBrandLabel = () => {
    if (brandingSettings && !brandingSettings.brandTagVisible) return null;

    return (
      <div className="absolute bottom-1 right-1 z-10 max-w-[85%] pointer-events-none select-none">
        <div className="bg-slate-950/85 backdrop-blur-md text-amber-300 border border-amber-400/60 px-1.5 py-0.5 rounded-md shadow-md flex items-center gap-1 text-[8px] sm:text-[9px] font-bold font-sans tracking-wider uppercase whitespace-nowrap overflow-hidden text-ellipsis">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 animate-pulse"></span>
          <span className="truncate">FabriQ</span>
        </div>
      </div>
    );
  };

  return (
    <>
      <div
        onClick={handleClick}
        className={`relative overflow-hidden bg-slate-100 group cursor-pointer ${containerClassName}`}
        title={`Click to inspect HD photo of ${alt}`}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleClick(e as any)}
      >
        {/* Skeleton Shimmer Loader */}
        {!loaded && !error && (
          <div className="absolute inset-0 z-10">
            <ImageSkeletonLoader className="w-full h-full rounded-none border-0" />
          </div>
        )}

        {/* Fallback branded card if error or missing src */}
        {error || !activeSrc ? (
          <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center p-2 text-center border border-amber-400/20 text-amber-300">
            <img
              src={fabriqLogo}
              alt="FabriQ AI Logo"
              className="w-7 h-7 rounded-lg object-cover border border-amber-400/40 shadow-xs mb-1"
            />
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-amber-300 font-sans">
              FabriQ AI Care
            </span>
            <span className="text-[8px] text-slate-400 line-clamp-1 font-mono mt-0.5">{alt}</span>
          </div>
        ) : (
          <>
            {/* Low-res blurred placeholder underlay */}
            <div
              className="absolute inset-0 bg-cover bg-center blur-md scale-110 opacity-60"
              style={{ backgroundImage: `url(${activeSrc})` }}
            />

            {/* Main Image */}
            <img
              src={activeSrc}
              alt={alt}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              onLoad={() => setLoaded(true)}
              onError={() => {
                setLoaded(true);
                setError(true);
              }}
              className={`${imageClassName} ${cropClass} relative z-0 transition-all duration-500 group-hover:scale-105 ${
                loaded ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-xs scale-95'
              }`}
            />

            {/* Subtle FabriQ Brand Label */}
            {renderBrandLabel()}

            {/* Custom Badge if provided */}
            {badge}

            {/* HD Zoom Badge on Hover & Touch Indicator */}
            {showLightboxOnClick && (
              <div className="absolute inset-0 z-20 bg-slate-950/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-1.5 pointer-events-none p-2">
                <span className="bg-slate-900/95 text-amber-300 text-[11px] font-extrabold px-3 py-1.5 rounded-full border border-amber-400/50 shadow-xl flex items-center gap-1.5 font-sans uppercase tracking-wider backdrop-blur-md transform group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[16px]">zoom_in</span>
                  <span>Zoom Garment</span>
                </span>
                <span className="text-[9px] text-amber-200/90 font-mono bg-slate-950/80 px-2 py-0.5 rounded-md border border-amber-400/20">
                  Inspect FabriQ Brand & Weave
                </span>
              </div>
            )}
          </>
        )}

        {/* QA Mode Overlay */}
        {brandingSettings.qaModeEnabled && (
          <div
            className={`absolute inset-0 z-30 pointer-events-none rounded-xl border-2 transition-all ${
              qaStatus.missing || error
                ? 'border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.95)] bg-red-500/15'
                : 'border-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] bg-emerald-500/5'
            }`}
          >
            <div
              className={`absolute top-1 right-1 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded text-white shadow-md ${
                qaStatus.missing || error ? 'bg-red-600' : 'bg-emerald-600'
              }`}
            >
              {qaStatus.missing || error ? 'QA: Missing' : 'QA: Verified'}
            </div>
          </div>
        )}
      </div>

      {/* Interactive Lightbox Modal with Pan & Zoom Inspection Controls */}
      {isLightboxOpen && activeSrc && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-between p-3 sm:p-5 animate-in fade-in duration-200"
          onClick={() => {
            setIsLightboxOpen(false);
            setZoomScale(1);
          }}
        >
          {/* Lightbox Top Control Bar */}
          <div
            className="w-full max-w-5xl flex flex-wrap justify-between items-center bg-slate-900/95 p-3 rounded-2xl border border-amber-400/40 shadow-2xl gap-2 z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0"></span>
              <div>
                <span className="text-[10px] font-mono text-amber-300 uppercase tracking-widest block font-bold">
                  FabriQ Garment Inspection Mode
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-white truncate max-w-xs sm:max-w-md font-sans">
                  {alt}
                </h3>
              </div>
            </div>

            {/* Quick Zoom Presets & Scale Controls */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-mono text-slate-400 uppercase mr-1 hidden sm:inline">Zoom:</span>
              {[1, 1.5, 2, 3].map((scale) => (
                <button
                  key={scale}
                  onClick={() => setZoomScale(scale)}
                  className={`px-2 py-1 text-[10px] font-bold font-mono rounded-lg border transition-all cursor-pointer ${
                    zoomScale === scale
                      ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md scale-105'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-amber-300'
                  }`}
                >
                  {scale}x
                </button>
              ))}

              <div className="h-4 w-px bg-slate-700 mx-1 hidden sm:block" />

              <button
                onClick={() => setZoomScale((prev) => Math.min(prev + 0.5, 3.5))}
                className="w-8 h-8 rounded-xl bg-slate-800 text-amber-300 border border-slate-700 flex items-center justify-center hover:bg-slate-700 cursor-pointer transition-colors"
                title="Zoom In"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
              </button>
              <button
                onClick={() => setZoomScale((prev) => Math.max(prev - 0.5, 1))}
                className="w-8 h-8 rounded-xl bg-slate-800 text-amber-300 border border-slate-700 flex items-center justify-center hover:bg-slate-700 cursor-pointer transition-colors"
                title="Zoom Out"
              >
                <span className="material-symbols-outlined text-[18px]">remove</span>
              </button>
              <button
                onClick={() => setZoomScale(1)}
                className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center hover:bg-slate-700 cursor-pointer transition-colors"
                title="Reset Zoom"
              >
                <span className="material-symbols-outlined text-[18px]">restart_alt</span>
              </button>
              <button
                onClick={() => setIsLightboxOpen(false)}
                className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center justify-center hover:bg-rose-500/40 cursor-pointer transition-colors ml-1"
                title="Close"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          </div>

          {/* Interactive Panning Viewport */}
          <div
            className="flex-1 w-full max-w-5xl flex items-center justify-center overflow-auto my-3 p-2 relative rounded-2xl bg-slate-900/50 border border-slate-800/80 shadow-inner"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="relative transition-transform duration-300 cursor-zoom-in max-h-[75vh] overflow-hidden rounded-2xl border-2 border-amber-400/40 shadow-2xl origin-center"
              style={{ transform: `scale(${zoomScale})` }}
              onClick={() => setZoomScale((prev) => (prev >= 3 ? 1 : prev + 0.5))}
              title="Click to zoom in further"
            >
              <img
                src={activeSrc}
                alt={alt}
                className={`max-h-[70vh] w-auto max-w-full ${cropClass} mx-auto transition-all duration-300 object-contain`}
              />
            </div>
          </div>

          {/* Bottom Guidance Footer */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-center text-slate-300 text-xs font-medium bg-slate-900/90 px-4 py-2 rounded-full border border-amber-400/20 max-w-xl shadow-xl">
            <span className="text-amber-300 font-extrabold font-mono bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30">
              [{Math.round(zoomScale * 100)}%]
            </span>
            <span>💡 Click or tap photo to inspect fabric weave and tailored garment details</span>
          </div>
        </div>
      )}
    </>
  );
};
