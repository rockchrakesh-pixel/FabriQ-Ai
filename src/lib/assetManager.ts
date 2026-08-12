/**
 * FabriQ AI Unified Asset Management & Image Processing Service
 * Centralizes image optimization, face masking, watermark overlays,
 * image preloading/caching, aspect ratio standardization, and store owner branding toggles.
 */

export interface BrandingSettings {
  watermarkVisible: boolean;
  brandTagVisible: boolean;
  strictFaceMasking: boolean;
  aspectRatio: '1:1' | '4:3' | '16:9';
  watermarkOpacity: number; // 0.1 to 0.5
  qaModeEnabled: boolean;
}

export interface ItemAssetOverride {
  watermarkEnabled?: boolean;
  faceMaskingEnabled?: boolean;
  aspectRatio1to1?: boolean;
  customCropClass?: string;
  flaggedForFaceRemoval?: boolean;
}

const STORAGE_KEY = 'fabriq_branding_settings_v1';
const OVERRIDES_STORAGE_KEY = 'fabriq_item_asset_overrides_v1';

const DEFAULT_SETTINGS: BrandingSettings = {
  watermarkVisible: false,
  brandTagVisible: true,
  strictFaceMasking: true,
  aspectRatio: '1:1',
  watermarkOpacity: 0.15,
  qaModeEnabled: false,
};

let currentSettings: BrandingSettings = { ...DEFAULT_SETTINGS };
let itemOverrides: Record<string, ItemAssetOverride> = {};

// Global Image Cache
const imageCache = new Set<string>();

// Load persisted settings & overrides
try {
  const savedSettings = localStorage.getItem(STORAGE_KEY);
  if (savedSettings) {
    currentSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) };
  }
  const savedOverrides = localStorage.getItem(OVERRIDES_STORAGE_KEY);
  if (savedOverrides) {
    itemOverrides = JSON.parse(savedOverrides);
  }
} catch (e) {
  // SSR or storage restriction fallback
}

const listeners: Set<() => void> = new Set();

export function getBrandingSettings(): BrandingSettings {
  return { ...currentSettings };
}

export function updateBrandingSettings(newSettings: Partial<BrandingSettings>): BrandingSettings {
  currentSettings = { ...currentSettings, ...newSettings };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentSettings));
  } catch (e) {
    console.error('Failed to save branding settings', e);
  }
  notifyListeners();
  return { ...currentSettings };
}

export function getItemOverrides(): Record<string, ItemAssetOverride> {
  return { ...itemOverrides };
}

export function updateItemOverride(itemId: string, override: ItemAssetOverride): void {
  itemOverrides = {
    ...itemOverrides,
    [itemId]: { ...itemOverrides[itemId], ...override },
  };
  try {
    localStorage.setItem(OVERRIDES_STORAGE_KEY, JSON.stringify(itemOverrides));
  } catch (e) {
    console.error('Failed to save item override', e);
  }
  notifyListeners();
}

export function subscribeBrandingSettings(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

/**
 * Image Caching Utility
 */
export function isImageCached(url: string): boolean {
  return imageCache.has(url);
}

export function preloadImage(url: string): Promise<void> {
  if (!url || imageCache.has(url)) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = url;
    img.onload = () => {
      imageCache.add(url);
      resolve();
    };
    img.onerror = (err) => {
      reject(err);
    };
  });
}

/**
 * Determines whether strict face masking should be applied to prevent any model face from showing.
 */
export function shouldApplyFaceMask(category?: string, name?: string, itemId?: string): boolean {
  if (itemId && itemOverrides[itemId]?.faceMaskingEnabled !== undefined) {
    return itemOverrides[itemId].faceMaskingEnabled!;
  }

  if (!currentSettings.strictFaceMasking) return false;

  const cat = (category || '').toLowerCase();
  const itemName = (name || '').toLowerCase();

  // Non-clothing items like rugs, shoes, curtains, bedsheets don't need face masking
  if (
    itemName.includes('shoe') ||
    itemName.includes('sneaker') ||
    itemName.includes('sandal') ||
    itemName.includes('bedsheet') ||
    itemName.includes('curtain') ||
    itemName.includes('rug') ||
    itemName.includes('carpet') ||
    itemName.includes('sofa') ||
    itemName.includes('mattr')
  ) {
    return false;
  }

  // Men, Women, Kids apparel default to strict face masking
  return (
    cat.includes('men') ||
    cat.includes('women') ||
    cat.includes('kids') ||
    cat.includes('apparel') ||
    itemName.includes('shirt') ||
    itemName.includes('suit') ||
    itemName.includes('sherwani') ||
    itemName.includes('dress') ||
    itemName.includes('kurti') ||
    itemName.includes('jacket') ||
    itemName.includes('top')
  );
}

/**
 * Returns optimal object positioning and cropping classes to ensure 
 * model faces are strictly cropped out, focusing purely on headless mannequins, 
 * flat-lay garments, and product details.
 */
export function getAssetCropClass(category?: string, name?: string, itemId?: string): string {
  if (itemId && itemOverrides[itemId]?.customCropClass) {
    return itemOverrides[itemId].customCropClass!;
  }

  const itemName = (name || '').toLowerCase();
  const cat = (category || '').toLowerCase();

  // Sherwani, Kurta, Dhoti, Suits, Jackets, Dresses: Aggressive bottom-weighted crop & scale
  if (
    itemName.includes('sherwani') ||
    itemName.includes('dhoti') ||
    itemName.includes('kurta') ||
    itemName.includes('suit') ||
    itemName.includes('blazer') ||
    itemName.includes('gown') ||
    itemName.includes('bridal') ||
    itemName.includes('dress') ||
    itemName.includes('frock') ||
    cat.includes('men') ||
    cat.includes('women') ||
    cat.includes('kids')
  ) {
    return 'object-[center_95%] scale-[1.2] translate-y-[8%] object-cover';
  }

  // T-shirts, Shirts, Kurtis: Focus on collar/fabric down
  if (itemName.includes('shirt') || itemName.includes('top') || itemName.includes('kurti')) {
    return 'object-[center_90%] scale-[1.15] translate-y-[6%] object-cover';
  }

  // Trousers, Jeans, Shorts, Skirts, Shoes: Bottom focus
  if (
    itemName.includes('trouser') ||
    itemName.includes('jeans') ||
    itemName.includes('skirt') ||
    itemName.includes('shorts') ||
    itemName.includes('shoe') ||
    itemName.includes('sneaker')
  ) {
    return 'object-bottom object-cover';
  }

  // Home Care, Rugs, Curtains: Balanced center presentation
  return 'object-center object-cover';
}

/**
 * Simulated AI Batch Refinement Service for Store Managers
 */
export async function runCategoryRefinement(
  categoryLabel: string,
  onProgress: (percent: number, log: string) => void
): Promise<void> {
  const steps = [
    `Initializing AI Image Refinement Engine for ${categoryLabel}...`,
    `Analyzing product catalog aspect ratios & pixel density...`,
    `Executing Deep Learning Face Masking on apparel models...`,
    `Applying semi-transparent 'FabriQ' luxury watermark overlay...`,
    `Injecting printed 'FabriQ' brand tags onto garment collar/labels...`,
    `Optimizing webp compression & high-definition cache...`,
    `Category ${categoryLabel} image refinement completed successfully!`,
  ];

  for (let i = 0; i < steps.length; i++) {
    await new Promise((resolve) => setTimeout(resolve, 350));
    const percent = Math.round(((i + 1) / steps.length) * 100);
    onProgress(percent, steps[i]);
  }
}

/**
 * QA Inspector Helper to check if a product image asset is missing branding
 * or failing headless face masking detection.
 */
export function isProductAssetMissingBranding(
  category?: string,
  name?: string,
  itemId?: string,
  settings: BrandingSettings = currentSettings
): { missing: boolean; reason?: string } {
  const needsFaceMask = shouldApplyFaceMask(category, name, itemId);
  if (needsFaceMask && !settings.strictFaceMasking) {
    return { missing: true, reason: 'Headless Face Mask Off' };
  }
  if (!settings.watermarkVisible) {
    return { missing: true, reason: 'Watermark Missing' };
  }
  if (!settings.brandTagVisible) {
    return { missing: true, reason: 'Brand Tag Missing' };
  }
  return { missing: false };
}
