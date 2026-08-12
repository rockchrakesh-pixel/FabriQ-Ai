import React, { useState, useEffect, useMemo } from 'react';
import { ScreenId } from '../types';
import { BottomNav } from '../components/BottomNav';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { WhatsAppModal } from '../components/WhatsAppModal';
import { OnlineBillingModal, CartItem } from '../components/OnlineBillingModal';
import { ServicesVsBookingModal } from '../components/ServicesVsBookingModal';
import { db, collection, query, where, getDocs, doc, setDoc } from '../lib/firebase';
import {
  getAssetCropClass,
  shouldApplyFaceMask,
  getBrandingSettings,
  subscribeBrandingSettings,
  preloadImage,
  isProductAssetMissingBranding,
  BrandingSettings,
} from '../lib/assetManager';
import { FabriQBrandRefinementControl } from '../components/FabriQBrandRefinementControl';
import { AdminImageProcessor } from '../components/AdminImageProcessor';
import { ImageSkeletonLoader } from '../components/ImageSkeletonLoader';
import { FabricCareAdvisorModal } from '../components/FabricCareAdvisorModal';
import { FabriQBrandedImage, LabelType } from '../components/FabriQBrandedImage';
import fabriqLogo from '../assets/images/fabriq_ai_logo_1785771380575.jpg';
import {
  generateExactItemSVG,
  syncCatalogImagesToFirestore,
  fetchCatalogImagesFromFirestore,
} from '../lib/catalogImageDatabase';

const DEFAULT_CARE_TIPS: Record<string, string> = {
  'Silk Saree': 'Dry Clean only using 100% hydrocarbon solvent at 18°C. Preserves original gold zari thread sheen & silk fiber softness.',
  'Suit (2 Piece)': 'Hand-steamed on Italian vacuum boards with lapel roll preservation. Includes cedar wood suit hanger and breathable garment bag.',
  'Suit (3 Piece)': 'Gentle hydrocarbon dry cleaning and vacuum steam pressing for coat, waistcoat, and trousers.',
  'Sherwani': 'Hand-processed couture care with individual velvet pad steaming. Protects intricate hand zardozi and bead embroidery.',
  'Bridal Lehenga': 'Signature VIP atelier treatment. Solvent-sanitized, hand-inspected under UV light, and returned in archival storage box.',
  'Shirt': 'Soft-water wash with organic liquid enzymes. Finished with collar/cuff press and cedar button protector.',
  'T-Shirt': 'Hypoallergenic eco-wash at 30°C. Protects cotton neck ribbing and vibrant print colors against fading.',
  'Jeans': 'Cold enzyme wash to prevent denim indigo dye bleeding and maintain fit elasticity.',
  'Trouser': 'Crisp crease steam press with zero fabric shine.',
  'Kurti': 'pH-balanced liquid detergent wash with color-lock fabric softener.',
  'Blanket': 'Thermal sanitized at 60°C to eliminate 99.9% dust mites, bacteria, and allergens.',
  'Sneakers': 'Hand-shampooed with organic footwear foam, sole whitening treatment, and UV-C germicidal chamber sanitization.',
  'Handbag': 'Upholstery leather conditioning, interior vacuuming, and zipper track lubrication.',
};

const getCuratedTip = (item: CatalogItem): string => {
  if (DEFAULT_CARE_TIPS[item.name]) return DEFAULT_CARE_TIPS[item.name];
  if (item.category === 'premium') return 'VIP Atelier Hydrocarbon Dry Clean with UV inspection, hand finishing & archival protective cover.';
  if (item.category === 'shoes_bags') return 'Specialized deep cleaning, stain extraction, UV-C germicidal sanitization & leather nourishment.';
  if (item.category === 'home') return 'Thermo-extraction deep clean eliminating dust mites and pet allergens with lavender anti-moth finish.';
  if (item.category === 'women') return 'Gentle liquid enzyme wash with color-lock technology and delicate steam press.';
  return 'Processed in micro-filtered soft water using pH-balanced eco-friendly detergents to maintain fabric longevity.';
};

import fabriqSherwaniImg from '../assets/images/fabriq_sherwani_1785990222007.jpg';
import fabriqKidsLaundryImg from '../assets/images/fabriq_kids_laundry_1785990241321.jpg';
import fabriqDesignerDressImg from '../assets/images/fabriq_designer_dress_1785990257063.jpg';
import fabriqDhotiKurtaImg from '../assets/images/fabriq_dhoti_kurta_1785990271220.jpg';
import fabriqMenKurtaImg from '../assets/images/fabriq_men_kurta_1786108100005.jpg';
import fabriqMenPyjamaImg from '../assets/images/fabriq_men_pyjama_1786108112665.jpg';
import fabriqMenWaistcoatImg from '../assets/images/fabriq_men_waistcoat_1786108129675.jpg';
import fabriqMenHoodieImg from '../assets/images/fabriq_men_hoodie_1786022977077.jpg';
import fabriqWomenSkirtImg from '../assets/images/fabriq_women_skirt_1786108140766.jpg';
import fabriqWomenDupattaImg from '../assets/images/fabriq_women_dupatta_1786108151797.jpg';
import fabriqWomenJacketImg from '../assets/images/fabriq_women_jacket_1786108164140.jpg';
import fabriqKidsUniformImg from '../assets/images/fabriq_kids_uniform_1786108176344.jpg';
import fabriqKidsWearImg from '../assets/images/fabriq_kids_wear_1786108202067.jpg';
import fabriqKidsDressImg from '../assets/images/fabriq_kids_dress_1786108188784.jpg';
import fabriqHomeBedsheetImg from '../assets/images/fabriq_home_bedsheet_1786108212930.jpg';
import fabriqHomeComforterImg from '../assets/images/fabriq_home_comforter_1786108224229.jpg';
import fabriqSandalsImg from '../assets/images/fabriq_sandals_1786108237092.jpg';
import fabriqMenShirtImg from '../assets/images/fabriq_men_shirt_1786109219307.jpg';
import fabriqMenSuitOriginalImg from '../assets/images/fabriq_men_suit_1786109233078.jpg';
import fabriqWomenKurtiImg from '../assets/images/fabriq_women_kurti_1786109249370.jpg';
import fabriqShoesSneakersImg from '../assets/images/fabriq_shoes_sneakers_1786109264236.jpg';
import fabriqLuxuryHandbagImg from '../assets/images/fabriq_luxury_handbag_1786109277872.jpg';
import fabriqMenTshirtImg from '../assets/images/fabriq_men_tshirt_1786177330947.jpg';
import fabriqMenKgLaundryImg from '../assets/images/fabriq_men_kg_laundry_1786177350592.jpg';
import fabriqWomenBlouseImg from '../assets/images/fabriq_women_blouse_1786177366782.jpg';
import fabriqKidsSweaterImg from '../assets/images/fabriq_kids_sweater_1786177385530.jpg';
import fabriqHomeCurtainsImg from '../assets/images/fabriq_home_curtains_1786177399794.jpg';
import fabriqHomeCushionImg from '../assets/images/fabriq_home_cushion_1786177434018.jpg';
import fabriqHomeMattressImg from '../assets/images/fabriq_home_mattress_1786177454310.jpg';
import fabriqTravelBackpackImg from '../assets/images/fabriq_travel_backpack_1786177471336.jpg';
import fabriqMenJeansTrousersImg from '../assets/images/fabriq_men_jeans_trousers_1786178133162.jpg';
import fabriqWomenTopTshirtImg from '../assets/images/fabriq_women_top_tshirt_1786178175907.jpg';
import fabriqKidsJeansPantsImg from '../assets/images/fabriq_kids_jeans_pants_1786178214769.jpg';
import fabriqShoesLeatherImg from '../assets/images/fabriq_shoes_leather_1786178230502.jpg';
import fabriqWomenHeelsImg from '../assets/images/fabriq_women_heels_1786178244471.jpg';
import fabriqWomenLeggingsImg from '../assets/images/fabriq_women_leggings_1786180012795.jpg';
import fabriqKidsShirtImg from '../assets/images/fabriq_kids_shirt_1786180028008.jpg';
import fabriqLeatherWalletImg from '../assets/images/fabriq_leather_wallet_1786180040493.jpg';

import suit2pcPhoto from '../assets/images/fabriq_suit_2pc_1786529069519.jpg';
import suit3pcPhoto from '../assets/images/fabriq_suit_3pc_1786529092317.jpg';
import menBlazerPhoto from '../assets/images/fabriq_men_blazer_1786529113962.jpg';
import menSweaterPhoto from '../assets/images/fabriq_men_sweater_1786529129100.jpg';
import necktiePhoto from '../assets/images/fabriq_necktie_1786529142126.jpg';
import kidsFrockPhoto from '../assets/images/fabriq_kids_frock_1786529158279.jpg';
import womenShawlPhoto from '../assets/images/fabriq_women_shawl_1786529179864.jpg';

import menShortsPhoto from '../assets/images/fabriq_men_shorts_1786536074524.jpg';
import menCapPhoto from '../assets/images/fabriq_men_cap_1786536088663.jpg';
import menJacketPhoto from '../assets/images/fabriq_men_jacket_1786536107257.jpg';
import womenJeansPhoto from '../assets/images/fabriq_women_jeans_1786536124583.jpg';
import womenPalazzoPhoto from '../assets/images/fabriq_women_palazzo_1786536150676.jpg';
import womenSweaterPhoto from '../assets/images/fabriq_women_sweater_1786536167335.jpg';
import kidsPantsPhoto from '../assets/images/fabriq_kids_pants_1786536181702.jpg';
import kidsShortsPhoto from '../assets/images/fabriq_kids_shorts_1786536198835.jpg';
import babyBlanketPhoto from '../assets/images/fabriq_baby_blanket_1786536220817.jpg';
import pillowCoverPhoto from '../assets/images/fabriq_pillow_cover_1786536240733.jpg';
import sportsShoesPhoto from '../assets/images/fabriq_sports_shoes_1786536259355.jpg';
import laptopBagPhoto from '../assets/images/fabriq_laptop_bag_1786536277490.jpg';
import travelBagPhoto from '../assets/images/fabriq_travel_bag_1786536297716.jpg';
import homeRugPhoto from '../assets/images/fabriq_home_rug_1786536314575.jpg';
import sofaCoverPhoto from '../assets/images/fabriq_sofa_cover_1786536332540.jpg';

import fabriqSherwaniDollV2 from '../assets/images/fabriq_sherwani_doll_v2_1786360781122.jpg';
import fabriqDhotiDollV2 from '../assets/images/fabriq_dhoti_doll_v2_1786360795315.jpg';
import fabriqWomenKurtiV2 from '../assets/images/fabriq_women_kurti_v2_1786360831156.jpg';
import fabriqKidsLaundryDollV2 from '../assets/images/fabriq_kids_laundry_doll_v2_1786360848536.jpg';
import womenGownPhoto from '../assets/images/fabriq_women_gown_1786536600_1786538102014.jpg';
import bridalWearPhoto from '../assets/images/fabriq_bridal_wear_1786536610_1786538122455.jpg';
import designerDressPhoto from '../assets/images/fabriq_designer_dress_1786536620_1786538137710.jpg';
import womenTopPhoto from '../assets/images/fabriq_women_top_1786536630_1786538157086.jpg';
import womenTshirtPhoto from '../assets/images/fabriq_women_tshirt_1786536640_1786538172931.jpg';
import womenLaundryKgPhoto from '../assets/images/fabriq_women_laundry_kg_1786536650_1786538186675.jpg';
import kidsTshirtV2 from '../assets/images/fabriq_kids_tshirt_v2_1786360862898.jpg';

// High-definition commercial photography studio images with FabriQ branding
const fabriqMenShirtV2 = fabriqMenShirtImg;
const fabriqMenPyjamaV2 = fabriqMenPyjamaImg;
const fabriqWomenLaundryV2 = womenLaundryKgPhoto;
const fabriqWomenTshirtV2 = womenTshirtPhoto;
const fabriqWomenTopImg = womenTopPhoto;
const fabriqWomenGownImg = womenGownPhoto;
const fabriqBridalWearImg = bridalWearPhoto;
const fabriqDesignerDressImgV2 = designerDressPhoto;
const fabriqKidsTshirtV2 = kidsTshirtV2;
const fabriqMenTrouserImg = fabriqMenJeansTrousersImg;
const fabriqMenShortsImg = menShortsPhoto;
const fabriqMenBlazerImg = menBlazerPhoto;
const fabriqMenSweaterImg = menSweaterPhoto;
const fabriqMenSuitImg = suit2pcPhoto;
const fabriqMenSuit3pcImg = suit3pcPhoto;
const fabriqMenNecktieImg = necktiePhoto;
const fabriqMenCapImg = menCapPhoto;
const fabriqMenJacketImg = menJacketPhoto;
const fabriqWomenJeansImg = womenJeansPhoto;
const fabriqWomenPalazzoImg = womenPalazzoPhoto;
const fabriqWomenShawlImg = womenShawlPhoto;
const fabriqWomenSweaterImg = womenSweaterPhoto;
const fabriqKidsFrockImg = kidsFrockPhoto;

const fabriqKidsTshirtImg = kidsTshirtV2;
const fabriqKidsShortsImg = kidsShortsPhoto;
const fabriqKidsJeansImg = fabriqKidsJeansPantsImg;
const fabriqKidsPantsImg = kidsPantsPhoto;
const fabriqKidsJacketImg = fabriqKidsWearImg;
const fabriqBabyBlanketImg = babyBlanketPhoto;
const fabriqHomeBlanketImg = fabriqHomeComforterImg;
const fabriqPillowCoverImg = pillowCoverPhoto;
const fabriqShoeSpaImg = fabriqShoesLeatherImg;
const fabriqSportsShoesImg = sportsShoesPhoto;
const fabriqLaptopBagImg = laptopBagPhoto;
const fabriqTravelBagImg = travelBagPhoto;
const fabriqHomeRugImg = homeRugPhoto;
const fabriqSofaCoverImg = sofaCoverPhoto;
import fabriqCarpetCleaningImg from '../assets/images/fabriq_carpet_cleaning_1786023022765.jpg';
import luxurySteamIronImg from '../assets/images/luxury_steam_iron_1785775317071.jpg';
import luxuryBoutiqueCareImg from '../assets/images/luxury_boutique_care_1785775337231.jpg';

// REUSABLE BRANDED LIGHTBOX MODAL COMPONENT
export interface ServiceImageLightboxProps {
  src?: string;
  highDefUrl?: string;
  alt: string;
  category?: string;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export const ServiceImageLightbox: React.FC<ServiceImageLightboxProps> = ({
  src,
  highDefUrl,
  alt,
  category,
  isOpen,
  onClose,
  title,
}) => {
  const [zoomScale, setZoomScale] = useState(1);
  const [brandingSettings, setBrandingSettings] = useState<BrandingSettings>(getBrandingSettings());

  useEffect(() => {
    return subscribeBrandingSettings(() => {
      setBrandingSettings(getBrandingSettings());
    });
  }, []);

  const displaySrc = highDefUrl || src;

  useEffect(() => {
    if (isOpen) {
      setZoomScale(1);
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen || !displaySrc) return null;

  const cropClass = getAssetCropClass(category, alt);
  const isFaceMaskActive = shouldApplyFaceMask(category, alt) && brandingSettings.strictFaceMasking;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 animate-fadeIn font-sans"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={alt}
    >
      {/* Header Bar */}
      <div
        className="w-full max-w-3xl flex items-center justify-between bg-slate-900/90 px-4 py-2.5 rounded-2xl border border-amber-400/30 text-amber-300 shadow-xl z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5">
          <img
            src={fabriqLogo}
            alt="FabriQ AI Studio Logo"
            className="w-7 h-7 rounded-lg object-cover border border-amber-400/50 shadow-xs"
          />
          <div>
            <span className="text-[9px] font-black uppercase text-amber-400 tracking-widest block leading-none">
              FABRIQ AI HD GARMENT LIGHTBOX
            </span>
            <h3 className="text-xs sm:text-sm font-bold text-white truncate max-w-[180px] sm:max-w-md mt-0.5">
              {title || alt}
            </h3>
          </div>
        </div>

        {/* Interactive Zoom & Pan Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setZoomScale((prev) => Math.min(prev + 0.5, 3.5))}
            className="w-8 h-8 rounded-xl bg-slate-800 text-amber-300 border border-slate-700 flex items-center justify-center hover:bg-slate-700 transition-all cursor-pointer"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
          </button>
          <button
            onClick={() => setZoomScale((prev) => Math.max(prev - 0.5, 1))}
            className="w-8 h-8 rounded-xl bg-slate-800 text-amber-300 border border-slate-700 flex items-center justify-center hover:bg-slate-700 transition-all cursor-pointer"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <span className="material-symbols-outlined text-[18px]">remove</span>
          </button>
          <button
            onClick={() => setZoomScale(1)}
            className="px-2 py-1 rounded-xl bg-slate-800 text-amber-300 border border-slate-700 text-[10px] font-bold hover:bg-slate-700 transition-all cursor-pointer"
            title="Reset Zoom"
          >
            100%
          </button>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center justify-center hover:bg-rose-500/40 transition-all cursor-pointer ml-1.5"
            title="Close Lightbox"
            aria-label="Close Lightbox"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      </div>

      {/* Main Viewport */}
      <div
        className="flex-1 w-full max-w-4xl flex items-center justify-center overflow-auto my-3 p-2 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="relative transition-transform duration-200 cursor-grab active:cursor-grabbing max-h-[75vh] overflow-hidden rounded-2xl border-2 border-amber-400/30 shadow-2xl"
          style={{ transform: `scale(${zoomScale})` }}
          onClick={() => setZoomScale((prev) => (prev >= 2.5 ? 1 : prev + 0.5))}
        >
          <img
            src={displaySrc}
            alt={alt}
            decoding="async"
            className={`max-h-[70vh] w-auto max-w-full ${cropClass} mx-auto transition-all`}
          />
        </div>
      </div>

      {/* Footer Info & SEO accessibility text */}
      <div className="text-center text-slate-300 text-xs font-medium bg-slate-900/80 px-4 py-2 rounded-full border border-slate-800 max-w-lg truncate shadow-lg">
        <span className="text-amber-300 font-bold mr-1.5">[{Math.round(zoomScale * 100)}%]</span>
        <span className="opacity-90">{alt}</span>
      </div>
    </div>
  );
};

// REUSABLE BRANDED IMAGE COMPONENT WITH UNIFIED ASSET MANAGEMENT, FACE CROPPING, & WATERMARK
export const ServiceImage: React.FC<{
  src?: string;
  highDefUrl?: string;
  alt: string;
  category?: string;
  className?: string;
  containerClassName?: string;
  badge?: React.ReactNode;
}> = ({
  src,
  highDefUrl,
  alt,
  category,
  className = "w-full h-full object-cover",
  containerClassName = "relative overflow-hidden",
  badge,
}) => {
  const getLabelType = (cat?: string, name?: string): LabelType => {
    const c = (cat || '').toLowerCase();
    const n = (name || '').toLowerCase();
    if (c.includes('suit') || n.includes('suit') || n.includes('blazer') || n.includes('sherwani') || n.includes('lehenga') || n.includes('kurta')) return 'embroidery';
    if (c.includes('shoe') || n.includes('leather') || n.includes('sneaker') || n.includes('bag') || n.includes('wallet')) return 'metallic-badge';
    if (n.includes('jeans') || n.includes('denim') || n.includes('jacket')) return 'leather-patch';
    return 'woven-tag';
  };

  return (
    <FabriQBrandedImage
      src={src}
      highDefUrl={highDefUrl}
      alt={alt}
      category={category}
      labelType={getLabelType(category, alt)}
      containerClassName={containerClassName}
      imageClassName={className}
      badge={badge}
    />
  );
};

export const ImageService = ServiceImage;

export type ServiceType = 
  | 'Wash & Fold' 
  | 'Wash & Iron' 
  | 'Steam Iron' 
  | 'Dry Cleaning' 
  | 'Premium Care'
  | 'Deep Shoe Spa'
  | 'Leather Polish & Conditioning'
  | 'Sole Whitening & UV'
  | 'Upholstery Bag Spa'
  | 'Deep Extraction Wash';

export interface CatalogItem {
  id: string;
  category: 'men' | 'women' | 'kids' | 'home' | 'shoes_bags' | 'premium';
  categoryLabel: string;
  serviceCategory: 'Dry Cleaning' | 'Wash & Iron' | 'Steam Ironing' | 'Combo Packages' | 'Shoe Care' | 'Premium Care' | 'Home Care' | 'Others';
  name: string;
  price: number;
  deliveryHours: number;
  image: string;
  altText?: string;
  highDefUrl?: string;
  popular?: boolean;
  recommendation: string;
  allowedServices: string[];
  servicePrices: Record<string, number>;
  unit?: 'pc' | 'KG';
}

export const getItemPrice = (item: CatalogItem, service: string): number => {
  if (item.servicePrices && item.servicePrices[service] !== undefined) {
    return item.servicePrices[service];
  }
  return item.price;
};

const FEATURED_LUXURY_SERVICES = [
  {
    id: 'feat_1',
    catalogItemId: 'm_sherwani',
    title: 'Royal Sherwani & Heritage Couture Care',
    description: 'Bespoke hand-finishing, delicate embroidery protection, and organic silk solvent cleaning for wedding sherwanis.',
    price: 499,
    badge: 'PREMIUM COUTURE',
    image: fabriqSherwaniImg,
    defaultService: 'Premium Care',
  },
  {
    id: 'feat_2',
    catalogItemId: 'p_designer_dress',
    title: 'Designer Gown & Silk Zari Dress Spa',
    description: 'Expert treatment for designer gowns, heavy zari embroideries, and delicate organza dresses with anti-color bleed tech.',
    price: 599,
    badge: 'LUXURY SPA',
    image: fabriqDesignerDressImg,
    defaultService: 'Premium Care',
  },
  {
    id: 'feat_3',
    catalogItemId: 'sb_sneakers',
    title: 'Deep Sneaker & Leather Footwear Spa',
    description: 'Hand cleaning, sole un-yellowing, germicidal UV sanitization, and premium leather conditioning.',
    price: 299,
    badge: 'SNEAKER SPA',
    image: fabriqShoeSpaImg,
    defaultService: 'Deep Shoe Spa',
  },
  {
    id: 'feat_4',
    catalogItemId: 'm_shirt',
    title: 'Bespoke Italian Steam Pressing',
    description: 'High-pressure crisp steam ironing with temperature-calibrated soleplates for suits, trousers & formal shirts.',
    price: 79,
    badge: 'INSTANT STEAM',
    image: luxurySteamIronImg,
    defaultService: 'Steam Iron',
  },
  {
    id: 'feat_5',
    catalogItemId: 'h_carpet',
    title: 'Deep Extraction Carpet & Home Care',
    description: 'German injection-extraction shampooing for living room carpets, rugs, and heavy curtains with mite sanitization.',
    price: 499,
    badge: 'HYGIENE CARE',
    image: fabriqCarpetCleaningImg,
    defaultService: 'Deep Extraction Wash',
  },
  {
    id: 'feat_6',
    catalogItemId: 'p_vintage_garments',
    title: 'Boutique Atelier Garment Restoration',
    description: 'Specialized fabric repair, stain removal, and cedarwood garment preservation for heirloom silk & velvet apparel.',
    price: 699,
    badge: 'ATELIER CARE',
    image: luxuryBoutiqueCareImg,
    defaultService: 'Premium Care',
  },
];

export const FULL_CATALOG: CatalogItem[] = [
  // 👨 MEN (19 ITEMS + KG SERVICES)
  {
    id: 'kg_m1',
    category: 'men',
    categoryLabel: '👨 MEN',
    serviceCategory: 'Wash & Iron',
    name: 'Men Everyday Laundry By KG (Wash & Fold)',
    price: 89,
    deliveryHours: 24,
    image: fabriqMenKgLaundryImg,
    popular: true,
    recommendation: 'Min 3 KG • FabriQ Eco Care Wash, Fabric Softener & Folding',
    allowedServices: ['Wash & Fold'],
    servicePrices: { 'Wash & Fold': 89 },
    unit: 'KG',
  },
  {
    id: 'kg_m2',
    category: 'men',
    categoryLabel: '👨 MEN',
    serviceCategory: 'Wash & Iron',
    name: 'Men Everyday Laundry By KG (Wash & Iron)',
    price: 129,
    deliveryHours: 24,
    image: fabriqMenKgLaundryImg,
    popular: true,
    recommendation: 'Min 3 KG • FabriQ Eco Wash & Crisp Steam Ironing',
    allowedServices: ['Wash & Iron'],
    servicePrices: { 'Wash & Iron': 129 },
    unit: 'KG',
  },
  {
    id: 'm_shirt',
    category: 'men',
    categoryLabel: '👨 MEN',
    serviceCategory: 'Wash & Iron',
    name: 'Shirt',
    price: 79,
    deliveryHours: 24,
    image: fabriqMenShirtV2,
    popular: true,
    recommendation: 'Recommended: FabriQ Wash & Iron or Steam Press',
    allowedServices: ['Steam Iron', 'Wash & Fold', 'Wash & Iron', 'Dry Cleaning', 'Premium Care'],
    servicePrices: { 'Steam Iron': 15, 'Wash & Fold': 45, 'Wash & Iron': 79, 'Dry Cleaning': 99, 'Premium Care': 149 },
    unit: 'pc',
  },
  {
    id: 'm_tshirt',
    category: 'men',
    categoryLabel: '👨 MEN',
    serviceCategory: 'Wash & Iron',
    name: 'T-Shirt',
    price: 69,
    deliveryHours: 24,
    image: fabriqMenTshirtImg,
    recommendation: 'Recommended: FabriQ Wash & Fold or Wash & Iron',
    allowedServices: ['Wash & Fold', 'Steam Iron', 'Wash & Iron', 'Dry Cleaning', 'Premium Care'],
    servicePrices: { 'Wash & Fold': 39, 'Steam Iron': 15, 'Wash & Iron': 69, 'Dry Cleaning': 89, 'Premium Care': 129 },
    unit: 'pc',
  },
  {
    id: 'm_jeans',
    category: 'men',
    categoryLabel: '👨 MEN',
    serviceCategory: 'Dry Cleaning',
    name: 'Jeans',
    price: 99,
    deliveryHours: 24,
    image: fabriqMenJeansTrousersImg,
    recommendation: 'Recommended: FabriQ Wash & Iron or Dry Cleaning',
    allowedServices: ['Wash & Fold', 'Steam Iron', 'Wash & Iron', 'Dry Cleaning', 'Premium Care'],
    servicePrices: { 'Steam Iron': 25, 'Wash & Fold': 55, 'Wash & Iron': 89, 'Dry Cleaning': 99, 'Premium Care': 159 },
    unit: 'pc',
  },
  {
    id: 'm_trouser',
    category: 'men',
    categoryLabel: '👨 MEN',
    serviceCategory: 'Dry Cleaning',
    name: 'Trouser',
    price: 89,
    deliveryHours: 24,
    image: fabriqMenTrouserImg,
    popular: true,
    recommendation: 'Recommended: FabriQ Steam Iron or Wash & Iron',
    allowedServices: ['Steam Iron', 'Wash & Iron', 'Wash & Fold', 'Dry Cleaning', 'Premium Care'],
    servicePrices: { 'Steam Iron': 15, 'Wash & Fold': 45, 'Wash & Iron': 79, 'Dry Cleaning': 89, 'Premium Care': 149 },
    unit: 'pc',
  },
  {
    id: 'm_shorts',
    category: 'men',
    categoryLabel: '👨 MEN',
    serviceCategory: 'Wash & Iron',
    name: 'Shorts',
    price: 69,
    deliveryHours: 24,
    image: fabriqMenShortsImg,
    recommendation: 'Recommended: FabriQ Wash & Fold or Wash & Iron',
    allowedServices: ['Wash & Fold', 'Steam Iron', 'Wash & Iron', 'Dry Cleaning'],
    servicePrices: { 'Wash & Fold': 39, 'Steam Iron': 15, 'Wash & Iron': 69, 'Dry Cleaning': 89 },
    unit: 'pc',
  },
  {
    id: 'm_blazer',
    category: 'men',
    categoryLabel: '👨 MEN',
    serviceCategory: 'Dry Cleaning',
    name: 'Blazer',
    price: 249,
    deliveryHours: 48,
    image: fabriqMenBlazerImg,
    recommendation: 'Recommended: FabriQ Dry Cleaning or Premium Care',
    allowedServices: ['Dry Cleaning', 'Steam Iron', 'Premium Care'],
    servicePrices: { 'Steam Iron': 99, 'Dry Cleaning': 249, 'Premium Care': 349 },
    unit: 'pc',
  },
  {
    id: 'm_suit2',
    category: 'men',
    categoryLabel: '👨 MEN',
    serviceCategory: 'Dry Cleaning',
    name: 'Suit (2 Piece)',
    price: 449,
    deliveryHours: 48,
    image: fabriqMenSuitImg,
    popular: true,
    recommendation: 'Recommended: FabriQ Dry Cleaning with Cedar Finish',
    allowedServices: ['Dry Cleaning', 'Steam Iron', 'Premium Care'],
    servicePrices: { 'Steam Iron': 149, 'Dry Cleaning': 449, 'Premium Care': 599 },
    unit: 'pc',
  },
  {
    id: 'm_suit3',
    category: 'men',
    categoryLabel: '👨 MEN',
    serviceCategory: 'Dry Cleaning',
    name: 'Suit (3 Piece)',
    price: 599,
    deliveryHours: 48,
    image: fabriqMenSuit3pcImg,
    popular: true,
    recommendation: 'Recommended: FabriQ Dry Cleaning or Premium Care',
    allowedServices: ['Dry Cleaning', 'Steam Iron', 'Premium Care'],
    servicePrices: { 'Steam Iron': 199, 'Dry Cleaning': 599, 'Premium Care': 749 },
    unit: 'pc',
  },
  {
    id: 'm_sherwani',
    category: 'men',
    categoryLabel: '👨 MEN',
    serviceCategory: 'Premium Care',
    name: 'Sherwani',
    price: 499,
    deliveryHours: 48,
    image: fabriqSherwaniDollV2,
    recommendation: 'Recommended: FabriQ Plastic HD Mannequin Display & Couture Care',
    allowedServices: ['Premium Care', 'Dry Cleaning', 'Steam Iron'],
    servicePrices: { 'Steam Iron': 149, 'Dry Cleaning': 399, 'Premium Care': 499 },
    unit: 'pc',
  },
  {
    id: 'm_kurta',
    category: 'men',
    categoryLabel: '👨 MEN',
    serviceCategory: 'Dry Cleaning',
    name: 'Kurta',
    price: 99,
    deliveryHours: 24,
    image: fabriqMenKurtaImg,
    recommendation: 'Recommended: FabriQ Wash & Iron or Dry Cleaning',
    allowedServices: ['Wash & Iron', 'Steam Iron', 'Wash & Fold', 'Dry Cleaning', 'Premium Care'],
    servicePrices: { 'Steam Iron': 25, 'Wash & Fold': 55, 'Wash & Iron': 89, 'Dry Cleaning': 99, 'Premium Care': 169 },
    unit: 'pc',
  },
  {
    id: 'm_pyjama',
    category: 'men',
    categoryLabel: '👨 MEN',
    serviceCategory: 'Wash & Iron',
    name: 'Pyjama',
    price: 79,
    deliveryHours: 24,
    image: fabriqMenPyjamaV2,
    recommendation: 'Recommended: FabriQ Soft Wash & Crisp Press',
    allowedServices: ['Wash & Fold', 'Steam Iron', 'Wash & Iron', 'Dry Cleaning'],
    servicePrices: { 'Wash & Fold': 45, 'Steam Iron': 20, 'Wash & Iron': 79, 'Dry Cleaning': 89 },
    unit: 'pc',
  },
  {
    id: 'm_dhoti',
    category: 'men',
    categoryLabel: '👨 MEN',
    serviceCategory: 'Wash & Iron',
    name: 'Dhoti',
    price: 99,
    deliveryHours: 24,
    image: fabriqDhotiDollV2,
    recommendation: 'Recommended: FabriQ Plastic HD Mannequin Display & Starch Press',
    allowedServices: ['Steam Iron', 'Wash & Iron', 'Dry Cleaning'],
    servicePrices: { 'Steam Iron': 30, 'Wash & Iron': 99, 'Dry Cleaning': 119 },
    unit: 'pc',
  },
  {
    id: 'm_jacket',
    category: 'men',
    categoryLabel: '👨 MEN',
    serviceCategory: 'Dry Cleaning',
    name: 'Jacket',
    price: 249,
    deliveryHours: 48,
    image: fabriqMenJacketImg,
    recommendation: 'Recommended: Dry Cleaning or Premium Care',
    allowedServices: ['Dry Cleaning', 'Steam Iron', 'Premium Care'],
    servicePrices: { 'Steam Iron': 89, 'Dry Cleaning': 249, 'Premium Care': 349 },
    unit: 'pc',
  },
  {
    id: 'm_sweater',
    category: 'men',
    categoryLabel: '👨 MEN',
    serviceCategory: 'Dry Cleaning',
    name: 'Sweater',
    price: 169,
    deliveryHours: 24,
    image: fabriqMenSweaterImg,
    recommendation: 'Recommended: Gentle Wool Wash or Dry Cleaning',
    allowedServices: ['Dry Cleaning', 'Wash & Fold', 'Steam Iron', 'Premium Care'],
    servicePrices: { 'Steam Iron': 49, 'Wash & Fold': 99, 'Dry Cleaning': 169, 'Premium Care': 229 },
    unit: 'pc',
  },
  {
    id: 'm_hoodie',
    category: 'men',
    categoryLabel: '👨 MEN',
    serviceCategory: 'Wash & Iron',
    name: 'Hoodie',
    price: 179,
    deliveryHours: 24,
    image: fabriqMenHoodieImg,
    recommendation: 'Recommended: Wash & Iron or Dry Cleaning',
    allowedServices: ['Wash & Fold', 'Wash & Iron', 'Dry Cleaning'],
    servicePrices: { 'Wash & Fold': 99, 'Wash & Iron': 179, 'Dry Cleaning': 199 },
    unit: 'pc',
  },
  {
    id: 'm_waistcoat',
    category: 'men',
    categoryLabel: '👨 MEN',
    serviceCategory: 'Dry Cleaning',
    name: 'Waistcoat',
    price: 149,
    deliveryHours: 24,
    image: fabriqMenWaistcoatImg,
    recommendation: 'Recommended: Dry Cleaning or Steam Iron',
    allowedServices: ['Steam Iron', 'Dry Cleaning', 'Premium Care'],
    servicePrices: { 'Steam Iron': 49, 'Dry Cleaning': 149, 'Premium Care': 219 },
    unit: 'pc',
  },
  {
    id: 'm_tie',
    category: 'men',
    categoryLabel: '👨 MEN',
    serviceCategory: 'Dry Cleaning',
    name: 'Tie',
    price: 49,
    deliveryHours: 24,
    image: fabriqMenNecktieImg,
    recommendation: 'Recommended: Gentle Silk Dry Cleaning',
    allowedServices: ['Dry Cleaning', 'Steam Iron'],
    servicePrices: { 'Steam Iron': 19, 'Dry Cleaning': 49 },
    unit: 'pc',
  },
  {
    id: 'm_cap',
    category: 'men',
    categoryLabel: '👨 MEN',
    serviceCategory: 'Dry Cleaning',
    name: 'Cap',
    price: 49,
    deliveryHours: 24,
    image: fabriqMenCapImg,
    recommendation: 'Recommended: Shape Preserving Hand Clean',
    allowedServices: ['Dry Cleaning', 'Wash & Fold'],
    servicePrices: { 'Wash & Fold': 29, 'Dry Cleaning': 49 },
    unit: 'pc',
  },

  // 👩 WOMEN (14 ITEMS + KG SERVICES)
  {
    id: 'kg_w1',
    category: 'women',
    categoryLabel: '👩 WOMEN',
    serviceCategory: 'Wash & Iron',
    name: 'Women Everyday Laundry By KG (Wash & Fold)',
    price: 89,
    deliveryHours: 24,
    image: fabriqWomenLaundryV2,
    popular: true,
    recommendation: 'Min 3 KG • FabriQ Soft Eco Women Care Wash & Neatly Folded',
    allowedServices: ['Wash & Fold'],
    servicePrices: { 'Wash & Fold': 89 },
    unit: 'KG',
  },
  {
    id: 'kg_w2',
    category: 'women',
    categoryLabel: '👩 WOMEN',
    serviceCategory: 'Wash & Iron',
    name: 'Women Everyday Laundry By KG (Wash & Iron)',
    price: 129,
    deliveryHours: 24,
    image: fabriqWomenLaundryV2,
    popular: true,
    recommendation: 'Min 3 KG • FabriQ Gentle Soft-Wash + Steam Press for Women Apparel',
    allowedServices: ['Wash & Iron'],
    servicePrices: { 'Wash & Iron': 129 },
    unit: 'KG',
  },
  {
    id: 'w_top',
    category: 'women',
    categoryLabel: '👩 WOMEN',
    serviceCategory: 'Wash & Iron',
    name: 'Top',
    price: 79,
    deliveryHours: 24,
    image: fabriqWomenTopImg,
    popular: true,
    recommendation: 'Recommended: FabriQ Wash & Iron or Steam Press',
    allowedServices: ['Steam Iron', 'Wash & Fold', 'Wash & Iron', 'Dry Cleaning', 'Premium Care'],
    servicePrices: { 'Steam Iron': 15, 'Wash & Fold': 45, 'Wash & Iron': 79, 'Dry Cleaning': 89, 'Premium Care': 139 },
    unit: 'pc',
  },
  {
    id: 'w_tshirt',
    category: 'women',
    categoryLabel: '👩 WOMEN',
    serviceCategory: 'Wash & Iron',
    name: 'T-Shirt',
    price: 69,
    deliveryHours: 24,
    image: fabriqWomenTshirtV2,
    recommendation: 'Recommended: FabriQ Wash & Fold or Wash & Iron',
    allowedServices: ['Wash & Fold', 'Steam Iron', 'Wash & Iron', 'Dry Cleaning'],
    servicePrices: { 'Wash & Fold': 39, 'Steam Iron': 15, 'Wash & Iron': 69, 'Dry Cleaning': 89 },
    unit: 'pc',
  },
  {
    id: 'w_kurti',
    category: 'women',
    categoryLabel: '👩 WOMEN',
    serviceCategory: 'Dry Cleaning',
    name: 'Kurti',
    price: 99,
    deliveryHours: 24,
    image: fabriqWomenKurtiV2,
    popular: true,
    recommendation: 'Recommended: FabriQ Ethnic Care Wash & Iron or Dry Cleaning',
    allowedServices: ['Steam Iron', 'Wash & Fold', 'Wash & Iron', 'Dry Cleaning', 'Premium Care'],
    servicePrices: { 'Steam Iron': 25, 'Wash & Fold': 55, 'Wash & Iron': 89, 'Dry Cleaning': 99, 'Premium Care': 169 },
    unit: 'pc',
  },
  {
    id: 'w_leggings',
    category: 'women',
    categoryLabel: '👩 WOMEN',
    serviceCategory: 'Wash & Iron',
    name: 'Leggings',
    price: 79,
    deliveryHours: 24,
    image: fabriqWomenLeggingsImg,
    recommendation: 'Recommended: FabriQ Soft Eco Wash & Fold',
    allowedServices: ['Wash & Fold', 'Wash & Iron'],
    servicePrices: { 'Wash & Fold': 45, 'Wash & Iron': 79 },
    unit: 'pc',
  },
  {
    id: 'w_jeans',
    category: 'women',
    categoryLabel: '👩 WOMEN',
    serviceCategory: 'Dry Cleaning',
    name: 'Jeans',
    price: 99,
    deliveryHours: 24,
    image: fabriqWomenJeansImg,
    recommendation: 'Recommended: FabriQ Wash & Iron or Dry Cleaning',
    allowedServices: ['Wash & Fold', 'Steam Iron', 'Wash & Iron', 'Dry Cleaning'],
    servicePrices: { 'Steam Iron': 25, 'Wash & Fold': 55, 'Wash & Iron': 89, 'Dry Cleaning': 99 },
    unit: 'pc',
  },
  {
    id: 'w_skirt',
    category: 'women',
    categoryLabel: '👩 WOMEN',
    serviceCategory: 'Wash & Iron',
    name: 'Skirt',
    price: 119,
    deliveryHours: 24,
    image: fabriqWomenSkirtImg,
    recommendation: 'Recommended: FabriQ Steam Press & Pleat Care',
    allowedServices: ['Steam Iron', 'Wash & Iron', 'Dry Cleaning', 'Premium Care'],
    servicePrices: { 'Steam Iron': 39, 'Wash & Iron': 119, 'Dry Cleaning': 139, 'Premium Care': 199 },
    unit: 'pc',
  },
  {
    id: 'w_palazzo',
    category: 'women',
    categoryLabel: '👩 WOMEN',
    serviceCategory: 'Wash & Iron',
    name: 'Palazzo',
    price: 99,
    deliveryHours: 24,
    image: fabriqWomenPalazzoImg,
    recommendation: 'Recommended: FabriQ Gentle Wash & Iron',
    allowedServices: ['Steam Iron', 'Wash & Fold', 'Wash & Iron', 'Dry Cleaning'],
    servicePrices: { 'Steam Iron': 25, 'Wash & Fold': 55, 'Wash & Iron': 99, 'Dry Cleaning': 119 },
    unit: 'pc',
  },
  {
    id: 'w_dress',
    category: 'women',
    categoryLabel: '👩 WOMEN',
    serviceCategory: 'Dry Cleaning',
    name: 'Western Dress',
    price: 199,
    deliveryHours: 24,
    image: fabriqDesignerDressImgV2,
    popular: true,
    recommendation: 'Recommended: FabriQ Dry Cleaning or Steam Press',
    allowedServices: ['Steam Iron', 'Wash & Iron', 'Dry Cleaning', 'Premium Care'],
    servicePrices: { 'Steam Iron': 49, 'Wash & Iron': 149, 'Dry Cleaning': 199, 'Premium Care': 299 },
    unit: 'pc',
  },
  {
    id: 'w_gown',
    category: 'women',
    categoryLabel: '👩 WOMEN',
    serviceCategory: 'Dry Cleaning',
    name: 'Gown',
    price: 299,
    deliveryHours: 48,
    image: fabriqWomenGownImg,
    recommendation: 'Recommended: FabriQ Dry Cleaning or Premium Care',
    allowedServices: ['Dry Cleaning', 'Steam Iron', 'Premium Care'],
    servicePrices: { 'Steam Iron': 99, 'Dry Cleaning': 299, 'Premium Care': 449 },
    unit: 'pc',
  },
  {
    id: 'w_blouse',
    category: 'women',
    categoryLabel: '👩 WOMEN',
    serviceCategory: 'Dry Cleaning',
    name: 'Blouse',
    price: 79,
    deliveryHours: 24,
    image: fabriqWomenBlouseImg,
    recommendation: 'Recommended: FabriQ Gentle Steam Iron or Dry Cleaning',
    allowedServices: ['Steam Iron', 'Wash & Iron', 'Dry Cleaning', 'Premium Care'],
    servicePrices: { 'Steam Iron': 20, 'Wash & Iron': 59, 'Dry Cleaning': 79, 'Premium Care': 129 },
    unit: 'pc',
  },
  {
    id: 'w_dupatta',
    category: 'women',
    categoryLabel: '👩 WOMEN',
    serviceCategory: 'Wash & Iron',
    name: 'Dupatta',
    price: 79,
    deliveryHours: 24,
    image: fabriqWomenDupattaImg,
    recommendation: 'Recommended: FabriQ Steam Press & Roll Finishing',
    allowedServices: ['Steam Iron', 'Wash & Iron', 'Dry Cleaning'],
    servicePrices: { 'Steam Iron': 25, 'Wash & Iron': 69, 'Dry Cleaning': 79 },
    unit: 'pc',
  },
  {
    id: 'w_shawl',
    category: 'women',
    categoryLabel: '👩 WOMEN',
    serviceCategory: 'Dry Cleaning',
    name: 'Shawl',
    price: 149,
    deliveryHours: 24,
    image: fabriqWomenShawlImg,
    recommendation: 'Recommended: FabriQ Pashmina & Wool Safe Dry Cleaning',
    allowedServices: ['Dry Cleaning', 'Steam Iron', 'Premium Care'],
    servicePrices: { 'Steam Iron': 39, 'Dry Cleaning': 149, 'Premium Care': 249 },
    unit: 'pc',
  },
  {
    id: 'w_sweater',
    category: 'women',
    categoryLabel: '👩 WOMEN',
    serviceCategory: 'Dry Cleaning',
    name: 'Sweater',
    price: 169,
    deliveryHours: 24,
    image: fabriqWomenSweaterImg,
    recommendation: 'Recommended: FabriQ Wool Softening & Dry Cleaning',
    allowedServices: ['Dry Cleaning', 'Wash & Fold', 'Steam Iron', 'Premium Care'],
    servicePrices: { 'Steam Iron': 49, 'Wash & Fold': 99, 'Dry Cleaning': 169, 'Premium Care': 229 },
    unit: 'pc',
  },
  {
    id: 'w_jacket',
    category: 'women',
    categoryLabel: '👩 WOMEN',
    serviceCategory: 'Dry Cleaning',
    name: 'Jacket',
    price: 249,
    deliveryHours: 48,
    image: fabriqWomenJacketImg,
    recommendation: 'Recommended: FabriQ Dry Cleaning or Premium Care',
    allowedServices: ['Dry Cleaning', 'Steam Iron', 'Premium Care'],
    servicePrices: { 'Steam Iron': 89, 'Dry Cleaning': 249, 'Premium Care': 349 },
    unit: 'pc',
  },

  // 👶 KIDS (11 ITEMS + KG SERVICES)
  {
    id: 'kg_k1',
    category: 'kids',
    categoryLabel: '👶 KIDS',
    serviceCategory: 'Wash & Iron',
    name: 'Kids Everyday Laundry By KG (Wash & Fold)',
    price: 79,
    deliveryHours: 24,
    image: fabriqKidsLaundryDollV2,
    popular: true,
    recommendation: 'Min 3 KG • FabriQ Plastic HD Doll Mannequin Display & Non-Toxic Baby Care Wash',
    allowedServices: ['Wash & Fold'],
    servicePrices: { 'Wash & Fold': 79 },
    unit: 'KG',
  },
  {
    id: 'kg_k2',
    category: 'kids',
    categoryLabel: '👶 KIDS',
    serviceCategory: 'Wash & Iron',
    name: 'Kids Everyday Laundry By KG (Wash & Iron)',
    price: 109,
    deliveryHours: 24,
    image: fabriqKidsLaundryDollV2,
    popular: true,
    recommendation: 'Min 3 KG • FabriQ Plastic HD Doll Mannequin Display & Sanitized Baby Steam Press',
    allowedServices: ['Wash & Iron'],
    servicePrices: { 'Wash & Iron': 109 },
    unit: 'KG',
  },
  {
    id: 'k_uniform',
    category: 'kids',
    categoryLabel: '👶 KIDS',
    serviceCategory: 'Wash & Iron',
    name: 'School Uniform',
    price: 79,
    deliveryHours: 24,
    image: fabriqKidsUniformImg,
    popular: true,
    recommendation: 'Recommended: FabriQ School Care Wash & Iron',
    allowedServices: ['Steam Iron', 'Wash & Fold', 'Wash & Iron', 'Dry Cleaning'],
    servicePrices: { 'Steam Iron': 15, 'Wash & Fold': 39, 'Wash & Iron': 79, 'Dry Cleaning': 89 },
    unit: 'pc',
  },
  {
    id: 'k_shirt',
    category: 'kids',
    categoryLabel: '👶 KIDS',
    serviceCategory: 'Wash & Iron',
    name: 'Shirt',
    price: 59,
    deliveryHours: 24,
    image: fabriqKidsShirtImg,
    recommendation: 'Recommended: FabriQ Wash & Iron',
    allowedServices: ['Steam Iron', 'Wash & Fold', 'Wash & Iron', 'Dry Cleaning'],
    servicePrices: { 'Steam Iron': 12, 'Wash & Fold': 35, 'Wash & Iron': 59, 'Dry Cleaning': 79 },
    unit: 'pc',
  },
  {
    id: 'k_tshirt',
    category: 'kids',
    categoryLabel: '👶 KIDS',
    serviceCategory: 'Wash & Iron',
    name: 'T-Shirt',
    price: 49,
    deliveryHours: 24,
    image: fabriqKidsTshirtV2,
    recommendation: 'Recommended: FabriQ Wash & Fold or Wash & Iron',
    allowedServices: ['Wash & Fold', 'Steam Iron', 'Wash & Iron', 'Dry Cleaning'],
    servicePrices: { 'Wash & Fold': 29, 'Steam Iron': 12, 'Wash & Iron': 49, 'Dry Cleaning': 69 },
    unit: 'pc',
  },
  {
    id: 'k_shorts',
    category: 'kids',
    categoryLabel: '👶 KIDS',
    serviceCategory: 'Wash & Iron',
    name: 'Shorts',
    price: 49,
    deliveryHours: 24,
    image: fabriqKidsShortsImg,
    recommendation: 'Recommended: Wash & Fold or Wash & Iron',
    allowedServices: ['Wash & Fold', 'Steam Iron', 'Wash & Iron', 'Dry Cleaning'],
    servicePrices: { 'Wash & Fold': 29, 'Steam Iron': 12, 'Wash & Iron': 49, 'Dry Cleaning': 69 },
    unit: 'pc',
  },
  {
    id: 'k_jeans',
    category: 'kids',
    categoryLabel: '👶 KIDS',
    serviceCategory: 'Dry Cleaning',
    name: 'Jeans',
    price: 69,
    deliveryHours: 24,
    image: fabriqKidsJeansImg,
    recommendation: 'Recommended: Wash & Iron or Dry Cleaning',
    allowedServices: ['Wash & Fold', 'Steam Iron', 'Wash & Iron', 'Dry Cleaning'],
    servicePrices: { 'Steam Iron': 15, 'Wash & Fold': 39, 'Wash & Iron': 69, 'Dry Cleaning': 79 },
    unit: 'pc',
  },
  {
    id: 'k_pants',
    category: 'kids',
    categoryLabel: '👶 KIDS',
    serviceCategory: 'Wash & Iron',
    name: 'Pants',
    price: 69,
    deliveryHours: 24,
    image: fabriqKidsPantsImg,
    recommendation: 'Recommended: Wash & Iron or Steam Iron',
    allowedServices: ['Steam Iron', 'Wash & Fold', 'Wash & Iron', 'Dry Cleaning'],
    servicePrices: { 'Steam Iron': 15, 'Wash & Fold': 39, 'Wash & Iron': 69, 'Dry Cleaning': 79 },
    unit: 'pc',
  },
  {
    id: 'k_dress',
    category: 'kids',
    categoryLabel: '👶 KIDS',
    serviceCategory: 'Wash & Iron',
    name: 'Dress',
    price: 99,
    deliveryHours: 24,
    image: fabriqKidsDressImg,
    recommendation: 'Recommended: Gentle Wash & Iron or Dry Clean',
    allowedServices: ['Steam Iron', 'Wash & Fold', 'Wash & Iron', 'Dry Cleaning', 'Premium Care'],
    servicePrices: { 'Steam Iron': 25, 'Wash & Fold': 49, 'Wash & Iron': 89, 'Dry Cleaning': 99, 'Premium Care': 149 },
    unit: 'pc',
  },
  {
    id: 'k_frock',
    category: 'kids',
    categoryLabel: '👶 KIDS',
    serviceCategory: 'Wash & Iron',
    name: 'Frock',
    price: 99,
    deliveryHours: 24,
    image: fabriqKidsFrockImg,
    recommendation: 'Recommended: Gentle Wash & Iron or Dry Clean',
    allowedServices: ['Steam Iron', 'Wash & Fold', 'Wash & Iron', 'Dry Cleaning'],
    servicePrices: { 'Steam Iron': 25, 'Wash & Fold': 49, 'Wash & Iron': 89, 'Dry Cleaning': 99 },
    unit: 'pc',
  },
  {
    id: 'k_sweater',
    category: 'kids',
    categoryLabel: '👶 KIDS',
    serviceCategory: 'Dry Cleaning',
    name: 'Sweater',
    price: 99,
    deliveryHours: 24,
    image: fabriqKidsSweaterImg,
    recommendation: 'Recommended: Gentle Wool Soft Care',
    allowedServices: ['Wash & Fold', 'Steam Iron', 'Dry Cleaning'],
    servicePrices: { 'Steam Iron': 25, 'Wash & Fold': 59, 'Dry Cleaning': 99 },
    unit: 'pc',
  },
  {
    id: 'k_jacket',
    category: 'kids',
    categoryLabel: '👶 KIDS',
    serviceCategory: 'Dry Cleaning',
    name: 'Jacket',
    price: 149,
    deliveryHours: 24,
    image: fabriqKidsJacketImg,
    recommendation: 'Recommended: Dry Cleaning or Wash & Iron',
    allowedServices: ['Steam Iron', 'Wash & Iron', 'Dry Cleaning'],
    servicePrices: { 'Steam Iron': 49, 'Wash & Iron': 119, 'Dry Cleaning': 149 },
    unit: 'pc',
  },
  {
    id: 'k_baby_blanket',
    category: 'kids',
    categoryLabel: '👶 KIDS',
    serviceCategory: 'Home Care',
    name: 'Baby Blanket',
    price: 199,
    deliveryHours: 24,
    image: fabriqBabyBlanketImg,
    recommendation: 'Recommended: FabriQ Plastic HD Doll Display & Sanitized Anti-Allergen Soft Wash',
    allowedServices: ['Wash & Fold', 'Dry Cleaning', 'Deep Extraction Wash'],
    servicePrices: { 'Wash & Fold': 129, 'Dry Cleaning': 179, 'Deep Extraction Wash': 199 },
    unit: 'pc',
  },

  // 🏠 HOME CARE (11 ITEMS)
  {
    id: 'h_bedsheet',
    category: 'home',
    categoryLabel: '🏠 HOME CARE',
    serviceCategory: 'Home Care',
    name: 'Bedsheet',
    price: 149,
    deliveryHours: 48,
    image: fabriqHomeBedsheetImg,
    popular: true,
    recommendation: 'Recommended: Wash & Fold or Steam Iron',
    allowedServices: ['Wash & Fold', 'Steam Iron', 'Wash & Iron', 'Dry Cleaning'],
    servicePrices: { 'Steam Iron': 39, 'Wash & Fold': 89, 'Wash & Iron': 129, 'Dry Cleaning': 149 },
    unit: 'pc',
  },
  {
    id: 'h_blanket',
    category: 'home',
    categoryLabel: '🏠 HOME CARE',
    serviceCategory: 'Home Care',
    name: 'Blanket',
    price: 299,
    deliveryHours: 48,
    image: fabriqHomeBlanketImg,
    popular: true,
    recommendation: 'Recommended: Deep Extraction Wash or Dry Cleaning',
    allowedServices: ['Deep Extraction Wash', 'Wash & Fold', 'Dry Cleaning', 'Premium Care'],
    servicePrices: { 'Wash & Fold': 199, 'Deep Extraction Wash': 299, 'Dry Cleaning': 349, 'Premium Care': 449 },
    unit: 'pc',
  },
  {
    id: 'h_comforter',
    category: 'home',
    categoryLabel: '🏠 HOME CARE',
    serviceCategory: 'Home Care',
    name: 'Comforter',
    price: 449,
    deliveryHours: 48,
    image: fabriqHomeComforterImg,
    recommendation: 'Recommended: Down-Proof Fluff Care & Deep Clean',
    allowedServices: ['Deep Extraction Wash', 'Dry Cleaning', 'Premium Care'],
    servicePrices: { 'Deep Extraction Wash': 449, 'Dry Cleaning': 499, 'Premium Care': 599 },
    unit: 'pc',
  },
  {
    id: 'h_curtains',
    category: 'home',
    categoryLabel: '🏠 HOME CARE',
    serviceCategory: 'Home Care',
    name: 'Curtains (each)',
    price: 149,
    deliveryHours: 48,
    image: fabriqHomeCurtainsImg,
    recommendation: 'Recommended: Steam Ironing or Dry Cleaning',
    allowedServices: ['Steam Iron', 'Wash & Fold', 'Dry Cleaning', 'Premium Care'],
    servicePrices: { 'Steam Iron': 49, 'Wash & Fold': 99, 'Dry Cleaning': 149, 'Premium Care': 249 },
    unit: 'pc',
  },
  {
    id: 'h_carpet',
    category: 'home',
    categoryLabel: '🏠 HOME CARE',
    serviceCategory: 'Home Care',
    name: 'Carpet',
    price: 499,
    deliveryHours: 48,
    image: fabriqCarpetCleaningImg,
    recommendation: 'Recommended: Deep Extraction Wash & Mite Sanitization',
    allowedServices: ['Deep Extraction Wash', 'Dry Cleaning', 'Premium Care'],
    servicePrices: { 'Deep Extraction Wash': 499, 'Dry Cleaning': 599, 'Premium Care': 799 },
    unit: 'pc',
  },
  {
    id: 'h_rug',
    category: 'home',
    categoryLabel: '🏠 HOME CARE',
    serviceCategory: 'Home Care',
    name: 'Rug',
    price: 299,
    deliveryHours: 48,
    image: fabriqHomeRugImg,
    recommendation: 'Recommended: Shampooing & Fiber Conditioning',
    allowedServices: ['Deep Extraction Wash', 'Dry Cleaning'],
    servicePrices: { 'Deep Extraction Wash': 299, 'Dry Cleaning': 349 },
    unit: 'pc',
  },
  {
    id: 'h_sofa_cover',
    category: 'home',
    categoryLabel: '🏠 HOME CARE',
    serviceCategory: 'Home Care',
    name: 'Sofa Cover',
    price: 249,
    deliveryHours: 48,
    image: fabriqSofaCoverImg,
    recommendation: 'Recommended: Deep Wash & Steam Press',
    allowedServices: ['Wash & Iron', 'Dry Cleaning', 'Deep Extraction Wash'],
    servicePrices: { 'Wash & Iron': 199, 'Dry Cleaning': 249, 'Deep Extraction Wash': 299 },
    unit: 'pc',
  },
  {
    id: 'h_cushion_cover',
    category: 'home',
    categoryLabel: '🏠 HOME CARE',
    serviceCategory: 'Home Care',
    name: 'Cushion Cover',
    price: 49,
    deliveryHours: 24,
    image: fabriqHomeCushionImg,
    recommendation: 'Recommended: Wash & Iron or Steam Iron',
    allowedServices: ['Steam Iron', 'Wash & Fold', 'Wash & Iron', 'Dry Cleaning'],
    servicePrices: { 'Steam Iron': 15, 'Wash & Fold': 29, 'Wash & Iron': 49, 'Dry Cleaning': 69 },
    unit: 'pc',
  },
  {
    id: 'h_pillow_cover',
    category: 'home',
    categoryLabel: '🏠 HOME CARE',
    serviceCategory: 'Home Care',
    name: 'Pillow Cover',
    price: 39,
    deliveryHours: 24,
    image: fabriqPillowCoverImg,
    recommendation: 'Recommended: Wash & Iron or Wash & Fold',
    allowedServices: ['Steam Iron', 'Wash & Fold', 'Wash & Iron', 'Dry Cleaning'],
    servicePrices: { 'Steam Iron': 12, 'Wash & Fold': 25, 'Wash & Iron': 39, 'Dry Cleaning': 59 },
    unit: 'pc',
  },
  {
    id: 'h_mattress_protector',
    category: 'home',
    categoryLabel: '🏠 HOME CARE',
    serviceCategory: 'Home Care',
    name: 'Mattress Protector',
    price: 299,
    deliveryHours: 48,
    image: fabriqHomeMattressImg,
    recommendation: 'Recommended: Hygienic Anti-Mite Deep Clean',
    allowedServices: ['Deep Extraction Wash', 'Wash & Fold', 'Dry Cleaning'],
    servicePrices: { 'Wash & Fold': 199, 'Deep Extraction Wash': 299, 'Dry Cleaning': 349 },
    unit: 'pc',
  },

  // 👟 SHOES & BAGS (10 ITEMS)
  {
    id: 'sb_sneakers',
    category: 'shoes_bags',
    categoryLabel: '👟 SHOES & BAGS',
    serviceCategory: 'Shoe Care',
    name: 'Sneakers',
    price: 299,
    deliveryHours: 48,
    image: fabriqShoesSneakersImg,
    popular: true,
    recommendation: 'Recommended: Deep Shoe Spa (Shampooing + Sole Whitening)',
    allowedServices: ['Deep Shoe Spa', 'Sole Whitening & UV', 'Leather Polish & Conditioning', 'Dry Cleaning', 'Premium Care'],
    servicePrices: { 'Deep Shoe Spa': 299, 'Sole Whitening & UV': 349, 'Leather Polish & Conditioning': 399, 'Dry Cleaning': 299, 'Premium Care': 449 },
    unit: 'pc',
  },
  {
    id: 'sb_sports_shoes',
    category: 'shoes_bags',
    categoryLabel: '👟 SHOES & BAGS',
    serviceCategory: 'Shoe Care',
    name: 'Sports Shoes',
    price: 349,
    deliveryHours: 48,
    image: fabriqSportsShoesImg,
    popular: true,
    recommendation: 'Recommended: Deep Shoe Spa & UV Sanitization',
    allowedServices: ['Deep Shoe Spa', 'Sole Whitening & UV', 'Dry Cleaning'],
    servicePrices: { 'Deep Shoe Spa': 349, 'Sole Whitening & UV': 399, 'Dry Cleaning': 349 },
    unit: 'pc',
  },
  {
    id: 'sb_leather_shoes',
    category: 'shoes_bags',
    categoryLabel: '👟 SHOES & BAGS',
    serviceCategory: 'Shoe Care',
    name: 'Leather Shoes',
    price: 399,
    deliveryHours: 48,
    image: fabriqShoesLeatherImg,
    recommendation: 'Recommended: Leather Polish & Oil Conditioning',
    allowedServices: ['Leather Polish & Conditioning', 'Deep Shoe Spa', 'Dry Cleaning', 'Premium Care'],
    servicePrices: { 'Leather Polish & Conditioning': 399, 'Deep Shoe Spa': 299, 'Dry Cleaning': 349, 'Premium Care': 499 },
    unit: 'pc',
  },
  {
    id: 'sb_heels',
    category: 'shoes_bags',
    categoryLabel: '👟 SHOES & BAGS',
    serviceCategory: 'Shoe Care',
    name: 'Heels',
    price: 299,
    deliveryHours: 48,
    image: fabriqWomenHeelsImg,
    recommendation: 'Recommended: Delicate Upper Spa & Heel Touch-Up',
    allowedServices: ['Deep Shoe Spa', 'Leather Polish & Conditioning', 'Premium Care'],
    servicePrices: { 'Deep Shoe Spa': 299, 'Leather Polish & Conditioning': 349, 'Premium Care': 429 },
    unit: 'pc',
  },
  {
    id: 'sb_sandals',
    category: 'shoes_bags',
    categoryLabel: '👟 SHOES & BAGS',
    serviceCategory: 'Shoe Care',
    name: 'Sandals',
    price: 199,
    deliveryHours: 48,
    image: fabriqSandalsImg,
    recommendation: 'Recommended: Gentle Footbed Wash & Polish',
    allowedServices: ['Deep Shoe Spa', 'Leather Polish & Conditioning'],
    servicePrices: { 'Deep Shoe Spa': 199, 'Leather Polish & Conditioning': 249 },
    unit: 'pc',
  },
  {
    id: 'sb_handbag',
    category: 'shoes_bags',
    categoryLabel: '👟 SHOES & BAGS',
    serviceCategory: 'Others',
    name: 'Handbag',
    price: 349,
    deliveryHours: 48,
    image: fabriqLuxuryHandbagImg,
    popular: true,
    recommendation: 'Recommended: Upholstery Bag Spa & Interior UV Clean',
    allowedServices: ['Upholstery Bag Spa', 'Leather Polish & Conditioning', 'Dry Cleaning', 'Premium Care'],
    servicePrices: { 'Upholstery Bag Spa': 349, 'Leather Polish & Conditioning': 399, 'Dry Cleaning': 349, 'Premium Care': 499 },
    unit: 'pc',
  },
  {
    id: 'sb_laptop_bag',
    category: 'shoes_bags',
    categoryLabel: '👟 SHOES & BAGS',
    serviceCategory: 'Others',
    name: 'Laptop Bag',
    price: 299,
    deliveryHours: 48,
    image: fabriqLaptopBagImg,
    recommendation: 'Recommended: Deep Foam Wash & Deodorizing',
    allowedServices: ['Upholstery Bag Spa', 'Dry Cleaning'],
    servicePrices: { 'Upholstery Bag Spa': 299, 'Dry Cleaning': 329 },
    unit: 'pc',
  },
  {
    id: 'sb_backpack',
    category: 'shoes_bags',
    categoryLabel: '👟 SHOES & BAGS',
    serviceCategory: 'Others',
    name: 'Backpack',
    price: 249,
    deliveryHours: 48,
    image: fabriqTravelBackpackImg,
    recommendation: 'Recommended: Water Repellent Deep Wash',
    allowedServices: ['Upholstery Bag Spa', 'Dry Cleaning'],
    servicePrices: { 'Upholstery Bag Spa': 249, 'Dry Cleaning': 289 },
    unit: 'pc',
  },
  {
    id: 'sb_travel_bag',
    category: 'shoes_bags',
    categoryLabel: '👟 SHOES & BAGS',
    serviceCategory: 'Others',
    name: 'Travel Bag',
    price: 399,
    deliveryHours: 48,
    image: fabriqTravelBagImg,
    recommendation: 'Recommended: Heavy Duty Luggage Spa',
    allowedServices: ['Upholstery Bag Spa', 'Dry Cleaning', 'Premium Care'],
    servicePrices: { 'Upholstery Bag Spa': 399, 'Dry Cleaning': 449, 'Premium Care': 599 },
    unit: 'pc',
  },
  {
    id: 'sb_wallet',
    category: 'shoes_bags',
    categoryLabel: '👟 SHOES & BAGS',
    serviceCategory: 'Others',
    name: 'Wallet',
    price: 149,
    deliveryHours: 24,
    image: fabriqLeatherWalletImg,
    recommendation: 'Recommended: Gentle Leather Nourishment',
    allowedServices: ['Leather Polish & Conditioning', 'Dry Cleaning'],
    servicePrices: { 'Leather Polish & Conditioning': 149, 'Dry Cleaning': 179 },
    unit: 'pc',
  },

  // 💎 PREMIUM CARE (7 ITEMS)
  {
    id: 'p_bridal_wear',
    category: 'premium',
    categoryLabel: '💎 PREMIUM CARE',
    serviceCategory: 'Premium Care',
    name: 'Bridal Wear',
    price: 999,
    deliveryHours: 48,
    image: fabriqBridalWearImg,
    popular: true,
    recommendation: 'Recommended: White-Glove Premium Care & Heirloom Box',
    allowedServices: ['Premium Care', 'Dry Cleaning'],
    servicePrices: { 'Dry Cleaning': 699, 'Premium Care': 999 },
    unit: 'pc',
  },
  {
    id: 'p_designer_dress',
    category: 'premium',
    categoryLabel: '💎 PREMIUM CARE',
    serviceCategory: 'Premium Care',
    name: 'Designer Dress',
    price: 599,
    deliveryHours: 48,
    image: fabriqDesignerDressImgV2,
    popular: true,
    recommendation: 'Recommended: Couture Care & Delicate Steam',
    allowedServices: ['Premium Care', 'Dry Cleaning'],
    servicePrices: { 'Dry Cleaning': 449, 'Premium Care': 599 },
    unit: 'pc',
  },
  {
    id: 'p_luxury_suit',
    category: 'premium',
    categoryLabel: '💎 PREMIUM CARE',
    serviceCategory: 'Premium Care',
    name: 'Luxury Suit',
    price: 699,
    deliveryHours: 48,
    image: suit3pcPhoto,
    recommendation: 'Recommended: Bespoke Dry Clean & Form Hanger',
    allowedServices: ['Premium Care', 'Dry Cleaning'],
    servicePrices: { 'Dry Cleaning': 549, 'Premium Care': 699 },
    unit: 'pc',
  },
  {
    id: 'p_leather_jacket',
    category: 'premium',
    categoryLabel: '💎 PREMIUM CARE',
    serviceCategory: 'Premium Care',
    name: 'Leather Jacket',
    price: 799,
    deliveryHours: 48,
    image: fabriqWomenJacketImg,
    recommendation: 'Recommended: Natural Oil Nourishment & Conditioning',
    allowedServices: ['Premium Care', 'Leather Polish & Conditioning', 'Dry Cleaning'],
    servicePrices: { 'Leather Polish & Conditioning': 599, 'Dry Cleaning': 699, 'Premium Care': 799 },
    unit: 'pc',
  },
  {
    id: 'p_wool_coat',
    category: 'premium',
    categoryLabel: '💎 PREMIUM CARE',
    serviceCategory: 'Premium Care',
    name: 'Wool Coat',
    price: 499,
    deliveryHours: 48,
    image: menJacketPhoto,
    recommendation: 'Recommended: Cashmere & Wool Deep Care',
    allowedServices: ['Premium Care', 'Dry Cleaning'],
    servicePrices: { 'Dry Cleaning': 399, 'Premium Care': 499 },
    unit: 'pc',
  },
  {
    id: 'p_vintage_garments',
    category: 'premium',
    categoryLabel: '💎 PREMIUM CARE',
    serviceCategory: 'Premium Care',
    name: 'Vintage Garments',
    price: 999,
    deliveryHours: 48,
    image: luxuryBoutiqueCareImg,
    recommendation: 'Recommended: Museum-Grade Heritage Restoration',
    allowedServices: ['Premium Care', 'Dry Cleaning'],
    servicePrices: { 'Dry Cleaning': 749, 'Premium Care': 999 },
    unit: 'pc',
  },
];

// Preserve real high-definition garment photos in FULL_CATALOG with FabriQ branding overlay

const SERVICE_CATEGORIES = [
  'All',
  'Dry Cleaning',
  'Wash & Iron',
  'Steam Ironing',
  'Combo Packages',
  'Shoe Care',
  'Premium Care',
  'Home Care',
  'Others',
];

interface ScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const ServiceCatalog: React.FC<ScreenProps> = ({ onNavigate }) => {
  const { sendNotification } = useNotifications();
  const { user, profile, currentRole } = useAuth();
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [activeServiceFilter, setActiveServiceFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Legacy single quantity map
  const [quantities, setQuantities] = useState<Record<string, number>>({
    m1: 2,
    m5: 1,
  });

  // Multi-service quantity map: key is `${itemId}__${serviceName}`
  const [serviceQuantities, setServiceQuantities] = useState<Record<string, number>>({});

  // Expanded card state to show multi-service controls
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  // Custom Variant / Tag Note list
  const [customVariants, setCustomVariants] = useState<Array<{
    id: string;
    itemId: string;
    garmentName: string;
    service: string;
    price: number;
    qty: number;
    note: string;
    unit?: string;
  }>>([]);

  // Modal for tagging specific garment (e.g., "White Linen Shirt" with "Dry Cleaning")
  const [customModal, setCustomModal] = useState<{
    isOpen: boolean;
    item?: CatalogItem;
    service: string;
    note: string;
    qty: number;
    unit: string;
  }>({
    isOpen: false,
    service: 'Wash & Iron',
    note: '',
    qty: 1,
    unit: 'pc',
  });

  const [selectedServiceMap, setSelectedServiceMap] = useState<Record<string, ServiceType>>({});
  const [firestoreDbImages, setFirestoreDbImages] = useState<Record<string, string>>({});

  // Sync and fetch high-definition catalog images from Firestore project database
  useEffect(() => {
    syncCatalogImagesToFirestore(
      FULL_CATALOG.map((i) => ({ id: i.id, name: i.name, category: i.category }))
    ).catch((err) => console.warn('Firestore image sync fallback:', err));

    fetchCatalogImagesFromFirestore().then((dbMap) => {
      if (dbMap && Object.keys(dbMap).length > 0) {
        setFirestoreDbImages(dbMap);
      }
    });
  }, []);
  
  // Persistent Favorites State
  const [favorites, setFavorites] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('fabriq_favorite_services');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('fabriq_favorite_services', JSON.stringify(favorites));
    } catch {
      // ignore
    }
  }, [favorites]);

  // Care Tip Modal State
  const [activeCareTipItem, setActiveCareTipItem] = useState<CatalogItem | null>(null);
  const [fabricAdvisorItem, setFabricAdvisorItem] = useState<CatalogItem | null>(null);
  const [isFabricAdvisorModalOpen, setIsFabricAdvisorModalOpen] = useState<boolean>(false);
  const [careTipLoading, setCareTipLoading] = useState<boolean>(false);
  const [firestoreTipText, setFirestoreTipText] = useState<string | null>(null);
  const [isCatalogLoading, setIsCatalogLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsCatalogLoading(true);
    const timer = setTimeout(() => setIsCatalogLoading(false), 350);
    return () => clearTimeout(timer);
  }, [activeCategoryFilter, activeServiceFilter]);

  const openCareTipModal = async (item: CatalogItem) => {
    setActiveCareTipItem(item);
    setCareTipLoading(true);
    setFirestoreTipText(null);

    try {
      const tipsRef = collection(db, 'garment_care_tips');
      let q = query(tipsRef, where('garmentId', '==', item.id));
      let querySnapshot = await getDocs(q);
      if (querySnapshot.empty && item.category) {
        q = query(tipsRef, where('categoryId', '==', item.category));
        querySnapshot = await getDocs(q);
      }
      if (!querySnapshot.empty) {
        const docData = querySnapshot.docs[0].data();
        setFirestoreTipText(docData.tip || docData.text || docData.careTip || null);
      }
    } catch (err) {
      console.warn('Firestore care tip query fallback:', err);
    } finally {
      setCareTipLoading(false);
    }
  };

  const { triggerOrderConfirmedNotification } = useNotifications();
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [isBillingOpen, setIsBillingOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isBrandRefinementOpen, setIsBrandRefinementOpen] = useState(false);
  const [isImageProcessorOpen, setIsImageProcessorOpen] = useState(false);

  // Auto-scroll when navigated with preselected service from Home screen
  useEffect(() => {
    const preselected = localStorage.getItem('fabriq_preselected_service');
    if (preselected) {
      setActiveServiceFilter(preselected);
      localStorage.removeItem('fabriq_preselected_service');
      setTimeout(() => {
        const el = document.getElementById('garment-catalog-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
    }
  }, []);

  const toggleFavorite = async (id: string) => {
    const next = { ...favorites, [id]: !favorites[id] };
    setFavorites(next);
    try {
      localStorage.setItem('fabriq_favorite_services', JSON.stringify(next));
      const userId = user?.uid || profile?.id || 'customer_demo_uid';
      const favDocRef = doc(db, 'user_favorites', userId);
      await setDoc(favDocRef, { favorites: next, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (err) {
      console.warn('Firestore favorite update fallback:', err);
    }
  };

  const toggleExpanded = (id: string) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleQuantityChange = (id: string, delta: number) => {
    const item = FULL_CATALOG.find((i) => i.id === id);
    const minStep = item?.unit === 'KG' ? 3 : 1;
    setQuantities((prev) => {
      const current = prev[id] || 0;
      let next = current + delta;
      if (current === 0 && delta > 0 && item?.unit === 'KG') {
        next = 3; // Minimum 3 KG load
      }
      if (next < minStep && next > 0 && item?.unit === 'KG') {
        next = 0;
      } else if (next < 1 && item?.unit !== 'KG') {
        next = 0;
      }
      if (next === 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: next };
    });
  };

  const handleServiceQtyChange = (itemId: string, serviceName: string, delta: number) => {
    const key = `${itemId}__${serviceName}`;
    const item = FULL_CATALOG.find((i) => i.id === itemId);
    const minStep = item?.unit === 'KG' ? 3 : 1;

    setServiceQuantities((prev) => {
      const current = prev[key] || 0;
      let next = current + delta;
      if (current === 0 && delta > 0 && item?.unit === 'KG') {
        next = 3;
      }
      if (next < minStep && next > 0 && item?.unit === 'KG') {
        next = 0;
      } else if (next < 1 && item?.unit !== 'KG') {
        next = 0;
      }
      if (next === 0) {
        const { [key]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: next };
    });
  };

  const openCustomNoteModal = (item: CatalogItem, defaultService?: string) => {
    const svc = defaultService || selectedServiceMap[item.id] || item.allowedServices[0] || 'Wash & Iron';
    setCustomModal({
      isOpen: true,
      item,
      service: svc,
      note: '',
      qty: item.unit === 'KG' ? 3 : 1,
      unit: item.unit || 'pc',
    });
  };

  const saveCustomNoteVariant = () => {
    if (!customModal.item) return;
    const price = getItemPrice(customModal.item, customModal.service);
    const newVariant = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      itemId: customModal.item.id,
      garmentName: customModal.note.trim() ? `${customModal.item.name} (${customModal.note.trim()})` : customModal.item.name,
      service: customModal.service,
      price,
      qty: customModal.qty,
      note: customModal.note.trim(),
      unit: customModal.unit,
    };
    setCustomVariants((prev) => [...prev, newVariant]);
    setCustomModal({ isOpen: false, service: 'Wash & Iron', note: '', qty: 1, unit: 'pc' });
  };

  const removeCustomVariant = (id: string) => {
    setCustomVariants((prev) => prev.filter((v) => v.id !== id));
  };

  const filteredItems = useMemo(() => {
    return FULL_CATALOG.filter((item) => {
      let matchesCategory = true;
      if (activeCategoryFilter === 'favorites') {
        matchesCategory = !!favorites[item.id];
      } else if (activeCategoryFilter === 'kg_wash') {
        matchesCategory = item.unit === 'KG' || item.id.startsWith('kg_');
      } else if (activeCategoryFilter !== 'all') {
        matchesCategory = item.category === activeCategoryFilter;
      }

      let matchesService = true;
      if (activeServiceFilter !== 'All') {
        matchesService = item.serviceCategory === activeServiceFilter || item.allowedServices.includes(activeServiceFilter);
      }

      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.recommendation.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesService && matchesSearch;
    });
  }, [activeCategoryFilter, activeServiceFilter, searchQuery, favorites]);

  const totalItemCount = useMemo(() => {
    const legacyCount = (Object.values(quantities) as number[]).reduce((a: number, b: number) => a + b, 0);
    const serviceCount = (Object.values(serviceQuantities) as number[]).reduce((a: number, b: number) => a + b, 0);
    const variantCount = customVariants.reduce((a: number, b) => a + b.qty, 0);
    return legacyCount + serviceCount + variantCount;
  }, [quantities, serviceQuantities, customVariants]);

  const totalPrice = useMemo(() => {
    // Legacy single service map price
    const legacyTotal = Object.entries(quantities).reduce((acc: number, entry: [string, number]) => {
      const [id, qty] = entry;
      const item = FULL_CATALOG.find((g) => g.id === id);
      if (!item) return acc;
      const svc = selectedServiceMap[id] || item.allowedServices[0] || 'Wash & Iron';
      const p = getItemPrice(item, svc);
      return acc + p * qty;
    }, 0);

    // Multi-service map price
    const multiServiceTotal = Object.entries(serviceQuantities).reduce((acc: number, entry: [string, number]) => {
      const [key, qty] = entry;
      const [itemId, serviceName] = key.split('__');
      const item = FULL_CATALOG.find((g) => g.id === itemId);
      if (!item) return acc;
      const p = getItemPrice(item, serviceName);
      return acc + p * qty;
    }, 0);

    // Custom tagged variants price
    const variantTotal = customVariants.reduce((acc: number, v) => acc + v.price * v.qty, 0);

    return legacyTotal + multiServiceTotal + variantTotal;
  }, [quantities, serviceQuantities, customVariants, selectedServiceMap]);

  const cartItems: CartItem[] = useMemo(() => {
    const list: CartItem[] = [];

    // Legacy single service
    (Object.entries(quantities) as [string, number][]).forEach(([id, qty]) => {
      const item = FULL_CATALOG.find((g) => g.id === id);
      const svc = selectedServiceMap[id] || (item ? item.allowedServices[0] : 'Wash & Iron');
      const p = item ? getItemPrice(item, svc) : 50;
      list.push({
        id: `${id}-${svc}`,
        name: `${item?.name || 'Garment'} (${svc})`,
        price: p,
        qty,
        unit: item?.unit || 'pc',
      });
    });

    // Multi-service
    (Object.entries(serviceQuantities) as [string, number][]).forEach(([key, qty]) => {
      const [itemId, serviceName] = key.split('__');
      const item = FULL_CATALOG.find((g) => g.id === itemId);
      const p = item ? getItemPrice(item, serviceName) : 50;
      list.push({
        id: `ms-${itemId}-${serviceName}`,
        name: `${item?.name || 'Garment'} — ${serviceName}`,
        price: p,
        qty,
        unit: item?.unit || 'pc',
      });
    });

    // Custom variants
    customVariants.forEach((v) => {
      list.push({
        id: v.id,
        name: `${v.garmentName} (${v.service})`,
        price: v.price,
        qty: v.qty,
        unit: v.unit || 'pc',
      });
    });

    return list;
  }, [quantities, serviceQuantities, customVariants, selectedServiceMap]);

  return (
    <div className="flex flex-col w-full pb-32 pt-16 bg-[#FAFAFC] text-slate-900 min-h-screen font-sans">
      {/* Header Info */}
      <section className="px-5 pt-5 pb-3">
        <span className="text-[11px] font-extrabold text-[#9E7B4F] uppercase tracking-widest block mb-1">
          FABRIQ AI LUXURY RATE CARD
        </span>
        <h1 className="font-['Libre_Caslon_Text',serif] text-2xl font-bold text-slate-900">
          Book Garment Care & Pricing
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
          Select garments, customize service options, and schedule valet pickup in Hyderabad.
        </p>
      </section>

      {/* HIGHLIGHT BANNER: KG LAUNDRY EXCLUSIVE POLICY */}
      <section className="px-5 mb-3">
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 flex items-start gap-3">
          <span className="material-symbols-outlined text-[#9E7B4F] text-[22px] shrink-0 mt-0.5">scale</span>
          <div className="text-xs">
            <span className="font-extrabold text-[#83633B] uppercase tracking-wider block text-[10px] mb-0.5">
              🧺 KG LAUNDRY SERVICES — EXCLUSIVELY MEN, WOMEN & KIDS
            </span>
            <p className="text-slate-700 font-medium text-[11px] leading-snug">
              Everyday wash & fold / wash & iron by KG (Min 3 KG) is provided strictly for <strong>Men, Women & Kids</strong> apparel. Heavy home items, curtains, footwear, and bespoke silks are processed as individual items.
            </p>
          </div>
        </div>
      </section>

      {/* HIGHLIGHT BANNER: FREE PICKUP & DROP RADIUS POLICY */}
      <section className="px-5 mb-3">
        <div className="bg-slate-900 text-white rounded-2xl p-3.5 border border-amber-400/40 shadow-xs flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0 border border-amber-400/30 mt-0.5">
            <span className="material-symbols-outlined text-[18px]">local_shipping</span>
          </div>
          <div className="text-xs space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                🚚 FREE PICKUP & DROP POLICY
              </span>
            </div>
            <div className="text-[11px] text-slate-200 font-medium leading-tight space-y-0.5">
              <p>• <strong>Free Pickup & Drop (5 km Radius)</strong>: Available on Cart value <strong>₹799 & above</strong></p>
              <p>• <strong>Free Pickup & Drop (10 km Radius)</strong>: Available on Cart value <strong>₹2,599 & above</strong></p>
            </div>
          </div>
        </div>
      </section>

      {/* HIGHLIGHT BANNER: ₹15 SELF DROP STEAM IRON */}
      <section className="px-5 mb-4">
        <div className="bg-gradient-to-r from-amber-500 via-[#9E7B4F] to-slate-900 text-white rounded-2xl p-4 shadow-sm border border-amber-300/40 flex items-center justify-between gap-3">
          <div>
            <span className="bg-amber-300 text-slate-900 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider block w-fit mb-1">
              🔥 ₹15 SELF DROP OFFER
            </span>
            <p className="text-xs font-bold text-white">
              Instant Steam Ironing @ ₹15 / pc for Shirt or Pant!
            </p>
            <p className="text-[11px] text-amber-100">Valid on Store Self Drop & Self Pickup</p>
          </div>
          <button
            onClick={() => setIsWhatsAppOpen(true)}
            className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">chat</span>
            <span>Book</span>
          </button>
        </div>
      </section>

      {/* Search Input Section */}
      <section className="px-5 mb-3">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search shirt, saree, suit, curtain, kg wash, shoes..."
            className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#9E7B4F] shadow-2xs"
          />
        </div>
      </section>

      {/* Services Horizontal Filter Chips */}
      <section className="px-5 mb-3 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 min-w-max pb-1">
          {SERVICE_CATEGORIES.map((sc) => {
            const isActive = activeServiceFilter === sc;
            return (
              <button
                key={sc}
                onClick={() => setActiveServiceFilter(sc)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-900 text-amber-300 shadow-md ring-2 ring-amber-400/30'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {sc}
              </button>
            );
          })}
        </div>
      </section>

      {/* TARGET CATALOG SECTION */}
      <section id="garment-catalog-section" className="px-5 my-2">
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
          <div className="border-b border-slate-100 pb-4 mb-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-amber-100 text-[#83633B] text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-widest">
                  TRANSPARENT PRICING
                </span>
                {activeServiceFilter !== 'All' && (
                  <span className="bg-slate-900 text-amber-300 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-widest">
                    FILTER: {activeServiceFilter}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setIsImageProcessorOpen(true)}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                  title="Store Owner Grid Image Processor & Face Removal"
                >
                  <span className="material-symbols-outlined text-[13px]">grid_view</span>
                  <span>Catalog Asset Studio</span>
                </button>

                <button
                  onClick={() => setIsBrandRefinementOpen(true)}
                  className="bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-400/40 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                  title="Store Owner Image Refinement & Face Removal Controls"
                >
                  <span className="material-symbols-outlined text-[13px]">auto_fix_high</span>
                  <span>Brand Refinement</span>
                </button>
              </div>
            </div>
            <h2 className="font-['Libre_Caslon_Text',serif] text-xl font-bold text-slate-900 mt-1">
              EXPLORE COMPLETE PRICING MENU — Garment Selection Catalog
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select single or multiple service treatments per garment. Tag individual shirts or suits with custom labels.
            </p>
          </div>

          {/* Garment Category Chips */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3">
            {[
              { id: 'all', label: 'All Categories' },
              { id: 'favorites', label: '❤️ FAVORITES' },
              { id: 'kg_wash', label: '🧺 LAUNDRY BY KG (MEN, WOMEN & KIDS ONLY)' },
              { id: 'men', label: '👨 MEN' },
              { id: 'women', label: '👩 WOMEN' },
              { id: 'kids', label: '👶 KIDS' },
              { id: 'home', label: '🏠 HOME CARE' },
              { id: 'shoes_bags', label: '👟 SHOES & BAGS' },
              { id: 'premium', label: '💎 PREMIUM CARE' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryFilter(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeCategoryFilter === cat.id
                    ? 'bg-[#9E7B4F] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* CUSTOM TAGGED VARIANTS BADGES */}
          {customVariants.length > 0 && (
            <div className="mb-4 bg-amber-50/80 p-3 rounded-2xl border border-amber-300/60">
              <span className="text-[10px] font-extrabold text-[#83633B] uppercase tracking-wider block mb-1.5">
                🏷️ CUSTOM TAGGED ITEMS IN YOUR SELECTION ({customVariants.length})
              </span>
              <div className="flex flex-wrap gap-2">
                {customVariants.map((v) => (
                  <div
                    key={v.id}
                    className="bg-white px-2.5 py-1.5 rounded-xl border border-amber-300 text-xs font-bold text-slate-800 flex items-center gap-2 shadow-2xs"
                  >
                    <div>
                      <p className="text-slate-900 font-extrabold text-[11px]">{v.garmentName}</p>
                      <span className="text-[9px] text-[#83633B] block">
                        {v.service} • {v.qty} {v.unit || 'pc'} @ ₹{v.price * v.qty}
                      </span>
                    </div>
                    <button
                      onClick={() => removeCustomVariant(v.id)}
                      className="text-rose-500 hover:text-rose-700 p-0.5 cursor-pointer"
                      title="Remove variant"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Catalog Grid */}
          {isCatalogLoading ? (
            /* SKELETON SCREEN LOADERS FOR SERVICE CATALOG GRID */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-3">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((idx) => (
                <div
                  key={idx}
                  className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 animate-pulse"
                >
                  <div className="flex gap-3.5">
                    <div className="w-22 h-22 rounded-xl bg-slate-200 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-2.5 w-16 bg-slate-200 rounded" />
                      <div className="h-4 w-28 bg-slate-300 rounded" />
                      <div className="h-3 w-20 bg-slate-200 rounded" />
                      <div className="h-4 w-24 bg-amber-100 rounded" />
                    </div>
                  </div>
                  <div className="h-7 w-full bg-slate-100 rounded-lg" />
                  <div className="h-8 w-full bg-slate-200 rounded-xl" />
                </div>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="bg-amber-50/50 rounded-2xl p-8 text-center border border-amber-200/60 my-4 space-y-2">
              <span className="material-symbols-outlined text-4xl text-[#9E7B4F]">
                {activeCategoryFilter === 'favorites' ? 'favorite_border' : 'search_off'}
              </span>
              <h3 className="font-bold text-slate-800 text-sm">
                {activeCategoryFilter === 'favorites'
                  ? 'No Favorite Services Saved Yet'
                  : 'No garments found matching your filter'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {activeCategoryFilter === 'favorites'
                  ? 'Tap the heart icon on any garment card in the catalog to save it to your favorites for instant 1-tap booking!'
                  : 'Try searching with another keyword or select All Categories.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-3">
              {filteredItems.map((item) => {
                const qty = quantities[item.id] || 0;
                const isFav = !!favorites[item.id];
                const isExpanded = !!expandedItems[item.id];
                const allowed = item.allowedServices && item.allowedServices.length > 0
                  ? item.allowedServices
                  : ['Wash & Iron', 'Wash & Fold', 'Steam Iron', 'Dry Cleaning', 'Premium Care'];
                const selectedService = selectedServiceMap[item.id] || allowed[0];
                const currentPrice = getItemPrice(item, selectedService);

                // Calculate total selected count for this specific item across all services
                const totalSelectedForItem = (quantities[item.id] || 0) + allowed.reduce((acc, svc) => {
                  return acc + (serviceQuantities[`${item.id}__${svc}`] || 0);
                }, 0);

                return (
                  <div
                    key={item.id}
                    className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs hover:border-[#9E7B4F] transition-all flex flex-col gap-3 relative"
                  >
                    <div className="flex gap-3.5">
                      <ServiceImage
                        src={item.image}
                        highDefUrl={item.highDefUrl || generateExactItemSVG(item.id, item.name, item.category)}
                        alt={item.altText || `FabriQ AI Studio Care — ${item.name} (${item.categoryLabel})`}
                        category={item.category}
                        containerClassName="w-22 h-22 rounded-xl border border-slate-100 shrink-0"
                        badge={
                          item.unit === 'KG' ? (
                            <span className="absolute top-1 left-1 z-10 bg-amber-500 text-slate-950 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider shadow-xs">
                              KG Service
                            </span>
                          ) : item.popular ? (
                            <span className="absolute top-1 left-1 z-10 bg-amber-400 text-slate-950 text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider shadow-xs">
                              Popular
                            </span>
                          ) : null
                        }
                      />

                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-extrabold text-[#9E7B4F] uppercase tracking-wider">
                              {item.categoryLabel} {item.unit ? `(${item.unit})` : ''}
                            </span>
                            <div className="flex items-center gap-1">
                              {currentRole !== 'customer' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setFabricAdvisorItem(item);
                                    setIsFabricAdvisorModalOpen(true);
                                  }}
                                  className="bg-amber-100 hover:bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded text-[9px] font-black tracking-wider flex items-center gap-0.5 transition-all cursor-pointer shadow-2xs border border-amber-300/60"
                                  title="Gemini AI Fabric Care Advisor"
                                >
                                  <span className="material-symbols-outlined text-[12px] text-amber-700">auto_awesome</span>
                                  <span>AI CARE</span>
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openCareTipModal(item);
                                }}
                                className="text-amber-600 hover:text-amber-800 hover:bg-amber-100 p-0.5 rounded-full transition-all cursor-pointer"
                                title="Expert Garment Care Tip"
                              >
                                <span className="material-symbols-outlined text-[16px]">info</span>
                              </button>
                              <button
                                onClick={() => toggleFavorite(item.id)}
                                className="text-rose-500 hover:scale-125 transition-transform cursor-pointer p-0.5"
                                title={isFav ? 'Remove from Favorites' : 'Add to Favorites'}
                              >
                                <span className="material-symbols-outlined text-[16px]">
                                  {isFav ? 'favorite' : 'favorite_border'}
                                </span>
                              </button>
                            </div>
                          </div>

                        <h4 className="font-['Libre_Caslon_Text',serif] font-bold text-sm text-slate-900 truncate mt-0.5">
                          {item.name}
                        </h4>

                        {/* RECOMMENDATION BADGE */}
                        {item.recommendation && (
                          <div className="mt-1 bg-amber-50 border border-amber-200/60 rounded-md px-1.5 py-0.5 text-[9.5px] font-medium text-amber-900 leading-tight flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px] text-amber-600 shrink-0">lightbulb</span>
                            <span className="truncate">{item.recommendation}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="font-['Libre_Caslon_Text',serif] font-black text-base text-slate-900">
                            ₹{currentPrice} {item.unit ? `/ ${item.unit}` : ''}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {item.deliveryHours}h Delivery
                          </span>
                        </div>
                      </div>

                      {/* Service Selector Dropdown & Quantity Steppers */}
                      <div className="mt-2 flex flex-col gap-1.5">
                        <select
                          value={selectedService}
                          onChange={(e) =>
                            setSelectedServiceMap((prev) => ({
                              ...prev,
                              [item.id]: e.target.value as ServiceType,
                            }))
                          }
                          className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-bold text-slate-800 focus:outline-none focus:border-[#9E7B4F] cursor-pointer"
                        >
                          {allowed.map((svc) => (
                            <option key={svc} value={svc}>
                              {svc} — ₹{getItemPrice(item, svc)} {item.unit ? `/ ${item.unit}` : ''}
                            </option>
                          ))}
                        </select>

                        <div className="flex items-center justify-between gap-1.5">
                          {qty > 0 ? (
                            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200 w-full justify-between">
                              <button
                                onClick={() => handleQuantityChange(item.id, -1)}
                                className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-800 hover:bg-slate-200 font-bold cursor-pointer"
                              >
                                -
                              </button>
                              <span className="font-bold text-xs text-slate-900">
                                {qty} {item.unit || 'pc'}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(item.id, 1)}
                                className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center hover:bg-[#9E7B4F] font-bold cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleQuantityChange(item.id, 1)}
                              className="w-full py-1.5 bg-slate-900 hover:bg-[#9E7B4F] text-amber-300 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
                            >
                              <span className="material-symbols-outlined text-[14px]">add</span>
                              <span>Add to Cart</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* MULTI-SERVICE BREAKDOWN TOGGLE & CUSTOM TAG BUTTON */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-[10px]">
                    <button
                      onClick={() => toggleExpanded(item.id)}
                      className="text-[#83633B] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {isExpanded ? 'unfold_less' : 'unfold_more'}
                      </span>
                      <span>
                        {isExpanded ? 'Hide All Service Rates' : `➕ Multi-Service Selection ${totalSelectedForItem > 0 ? `(${totalSelectedForItem})` : ''}`}
                      </span>
                    </button>

                    <button
                      onClick={() => openCustomNoteModal(item)}
                      className="bg-slate-100 hover:bg-amber-100 text-slate-800 hover:text-amber-900 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1"
                      title="Tag item with specific color, material or instructions"
                    >
                      <span className="material-symbols-outlined text-[12px]">local_offer</span>
                      <span>Tag Item Note</span>
                    </button>
                  </div>

                  {/* EXPANDED PER-SERVICE COUNTER PANEL */}
                  {isExpanded && (
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 mt-1 space-y-2">
                      <p className="text-[10px] font-black text-[#83633B] uppercase tracking-wider">
                        MULTI-SERVICE QUANTITY SELECTOR FOR {item.name.toUpperCase()}:
                      </p>
                      {allowed.map((svc) => {
                        const svcPrice = getItemPrice(item, svc);
                        const svcKey = `${item.id}__${svc}`;
                        const currentSvcQty = serviceQuantities[svcKey] || 0;

                        return (
                          <div
                            key={svc}
                            className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200 text-xs"
                          >
                            <div>
                              <span className="font-bold text-slate-900 block text-[11px]">{svc}</span>
                              <span className="text-[10px] text-slate-500 font-mono">₹{svcPrice} {item.unit ? `/ ${item.unit}` : '/ pc'}</span>
                            </div>

                            <div className="flex items-center gap-1.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                              <button
                                onClick={() => handleServiceQtyChange(item.id, svc, -1)}
                                className="w-5 h-5 rounded bg-white text-slate-900 font-bold flex items-center justify-center hover:bg-slate-200 cursor-pointer text-xs"
                              >
                                -
                              </button>
                              <span className="w-5 text-center font-bold text-slate-900 text-[11px]">
                                {currentSvcQty}
                              </span>
                              <button
                                onClick={() => handleServiceQtyChange(item.id, svc, 1)}
                                className="w-5 h-5 rounded bg-slate-900 text-white font-bold flex items-center justify-center hover:bg-[#9E7B4F] cursor-pointer text-xs"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          )}
        </div>
      </section>

      {/* CUSTOM GARMENT TAG & NOTE MODAL */}
      {customModal.isOpen && customModal.item && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full border border-slate-200 shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div>
                <span className="text-[10px] font-extrabold text-[#83633B] uppercase tracking-wider block">
                  LABEL / TAG SPECIFIC GARMENT
                </span>
                <h3 className="font-['Libre_Caslon_Text',serif] text-base font-bold text-slate-900">
                  Tag Item: {customModal.item.name}
                </h3>
              </div>
              <button
                onClick={() => setCustomModal((prev) => ({ ...prev, isOpen: false }))}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold hover:bg-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-extrabold text-slate-700 block mb-1">Select Service Treatment:</label>
                <select
                  value={customModal.service}
                  onChange={(e) => setCustomModal((prev) => ({ ...prev, service: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-900 focus:outline-none focus:border-[#9E7B4F]"
                >
                  {customModal.item.allowedServices.map((svc) => (
                    <option key={svc} value={svc}>
                      {svc} — ₹{getItemPrice(customModal.item!, svc)} {customModal.item!.unit ? `/ ${customModal.item!.unit}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-extrabold text-slate-700 block mb-1">
                  Garment Description / Tag Note:
                </label>
                <input
                  type="text"
                  value={customModal.note}
                  onChange={(e) => setCustomModal((prev) => ({ ...prev, note: e.target.value }))}
                  placeholder="e.g. Blue Formal Cotton Shirt, White Linen, Zara Jacket"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 focus:outline-none focus:border-[#9E7B4F]"
                />
              </div>

              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800">
                  Quantity ({customModal.unit}):
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setCustomModal((prev) => ({
                        ...prev,
                        qty: Math.max(prev.unit === 'KG' ? 3 : 1, prev.qty - 1),
                      }))
                    }
                    className="w-7 h-7 rounded-lg bg-white border border-slate-300 font-bold flex items-center justify-center cursor-pointer"
                  >
                    -
                  </button>
                  <span className="font-bold text-sm">{customModal.qty}</span>
                  <button
                    onClick={() => setCustomModal((prev) => ({ ...prev, qty: prev.qty + 1 }))}
                    className="w-7 h-7 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={saveCustomNoteVariant}
                  className="w-full py-3 bg-slate-900 text-amber-300 rounded-xl font-bold uppercase tracking-wider hover:bg-[#9E7B4F] hover:text-white transition-all cursor-pointer shadow-md"
                >
                  Add Tagged Variant to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Cart & Order Summary Bar */}
      {totalItemCount > 0 && (
        <div className="fixed bottom-20 left-0 right-0 px-5 z-40 max-w-7xl mx-auto">
          <div className="bg-slate-900/95 backdrop-blur-xl p-4 rounded-3xl shadow-2xl border border-amber-400/40 flex items-center justify-between text-white">
            <div>
              <span className="text-[10px] font-extrabold text-amber-300 uppercase tracking-widest block">
                {totalItemCount} ITEM{totalItemCount > 1 ? 'S' : ''} IN CART
              </span>
              <div className="flex items-baseline gap-1">
                <span className="font-['Libre_Caslon_Text',serif] text-xl font-black text-white">
                  ₹{totalPrice}
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Estimated</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onNavigate('cart')}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-[#9E7B4F] text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider flex items-center gap-1 shadow-md transition-all cursor-pointer"
              >
                <span>View Cart</span>
                <span className="material-symbols-outlined text-[16px]">shopping_cart</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Symbol for AI / Actions */}

      <WhatsAppModal
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
        defaultService="Custom Garment Order from Rate Card"
      />

      <OnlineBillingModal
        isOpen={isBillingOpen}
        onClose={() => setIsBillingOpen(false)}
        items={cartItems}
        onPaymentSuccess={() => {
          triggerOrderConfirmedNotification('FBQ-8829');
          onNavigate('payment-success');
        }}
      />

      {/* EXPERT GARMENT CARE TIP MODAL (FIRESTORE) */}
      {activeCareTipItem && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-amber-300 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 text-[#83633B] flex items-center justify-center font-bold shrink-0">
                  <span className="material-symbols-outlined text-[22px]">lightbulb</span>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold text-[#9E7B4F] uppercase tracking-widest block">
                    EXPERT CARE ADVISORY
                  </span>
                  <h3 className="font-['Libre_Caslon_Text',serif] text-base font-bold text-slate-900 leading-tight">
                    {activeCareTipItem.name}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setActiveCareTipItem(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3 font-sans text-xs">
              <div className="bg-amber-50/90 p-4 rounded-2xl border border-amber-200 text-amber-950 leading-relaxed shadow-2xs">
                {careTipLoading ? (
                  <div className="flex items-center gap-2 py-2 text-slate-600 font-bold">
                    <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                    <span>Retrieving Care Tip from Firestore...</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-[#83633B] text-[10px] uppercase tracking-wider">
                      <span className="material-symbols-outlined text-[15px]">verified</span>
                      <span>{firestoreTipText ? 'Firestore Care Record' : 'Atelier Preservative Standard'}</span>
                    </div>
                    <p className="text-slate-800 text-xs font-medium leading-relaxed">
                      "{firestoreTipText || getCuratedTip(activeCareTipItem)}"
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-semibold block uppercase">Process Standard</span>
                  <span className="text-slate-900 font-bold">Hydrocarbon Organic / Eco-Enzymes</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-semibold block uppercase">Finish Method</span>
                  <span className="text-slate-900 font-bold">Italian Vacuum Steam Press</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveCareTipItem(null)}
              className="w-full py-3 bg-slate-900 hover:bg-[#9E7B4F] text-amber-300 font-bold text-xs rounded-2xl shadow-md transition-colors cursor-pointer uppercase tracking-wider"
            >
              Close Advisory
            </button>
          </div>
        </div>
      )}

      {/* Services vs Booking Options Modal */}
      <ServicesVsBookingModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        onSelectService={(srv) => {
          setActiveServiceFilter(srv);
        }}
      />

      {/* STORE OWNER BRAND REFINEMENT CONTROL MODAL */}
      <FabriQBrandRefinementControl
        isOpen={isBrandRefinementOpen}
        onClose={() => setIsBrandRefinementOpen(false)}
      />

      {/* ADMIN IMAGE PROCESSOR GRID STUDIO */}
      <AdminImageProcessor
        isOpen={isImageProcessorOpen}
        onClose={() => setIsImageProcessorOpen(false)}
      />

      {/* GEMINI FABRIC CARE ADVISOR MODAL (Non-customer roles only) */}
      {currentRole !== 'customer' && (
        <FabricCareAdvisorModal
          isOpen={isFabricAdvisorModalOpen}
          onClose={() => {
            setIsFabricAdvisorModalOpen(false);
            setFabricAdvisorItem(null);
          }}
          initialGarmentName={fabricAdvisorItem?.name}
          initialMaterialCategory={fabricAdvisorItem?.categoryLabel || fabricAdvisorItem?.category}
        />
      )}

      <BottomNav activePath="services" onNavigate={onNavigate} />
    </div>
  );
};
