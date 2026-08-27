import React, { useState, useEffect } from 'react';
import { ScreenId, AppDivision } from '../types';
import { BottomNav } from '../components/BottomNav';
import { useDivision } from '../context/DivisionContext';
import { useBranch } from '../context/BranchContext';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { WhatsAppModal } from '../components/WhatsAppModal';
import { InstantBookingChatbotModal } from '../components/InstantBookingChatbotModal';
import { FabriQAiCrownLogo } from '../components/FabriQAiCrownLogo';
import { BoutiqueCheckInQRModal } from '../components/BoutiqueCheckInQRModal';
import { useOfflineStatus } from '../lib/offlineManager';
import { triggerHaptic } from '../lib/haptics';

// Curated High-Definition Photography Assets
import luxurySteamIronImg from '../assets/images/luxury_steam_iron_1785775317071.jpg';
import fabriqSherwaniImg from '../assets/images/fabriq_sherwani_1785990222007.jpg';
import fabriqKidsLaundryImg from '../assets/images/fabriq_kids_laundry_1785990241321.jpg';
import fabriqDesignerDressImg from '../assets/images/fabriq_designer_dress_1785990257063.jpg';
import fabriqMenKurtaImg from '../assets/images/fabriq_men_kurta_1786108100005.jpg';
import fabriqMenShirtImg from '../assets/images/fabriq_men_shirt_1786109219307.jpg';
import fabriqSuit2pcImg from '../assets/images/fabriq_suit_2pc_1786529069519.jpg';
import fabriqSuit3pcImg from '../assets/images/fabriq_suit_3pc_1786529092317.jpg';
import fabriqMenBlazerImg from '../assets/images/fabriq_men_blazer_1786529113962.jpg';
import fabriqMenTshirtImg from '../assets/images/fabriq_men_tshirt_1786177330947.jpg';
import fabriqMenKgLaundryImg from '../assets/images/fabriq_men_kg_laundry_1786177350592.jpg';
import fabriqWomenKurtiImg from '../assets/images/fabriq_women_kurti_1786109249370.jpg';
import fabriqWomenBlouseImg from '../assets/images/fabriq_women_blouse_1786177366782.jpg';
import fabriqWomenGownImg from '../assets/images/fabriq_women_gown_1786536600_1786538102014.jpg';
import fabriqWomenTshirtImg from '../assets/images/fabriq_women_tshirt_1786536640_1786538172931.jpg';
import fabriqWomenLaundryKgImg from '../assets/images/fabriq_women_laundry_kg_1786536650_1786538186675.jpg';
import fabriqKidsFrockImg from '../assets/images/fabriq_kids_frock_1786529158279.jpg';
import fabriqKidsUniformImg from '../assets/images/fabriq_kids_uniform_1786108176344.jpg';
import fabriqKidsJeansImg from '../assets/images/fabriq_kids_jeans_pants_1786178214769.jpg';
import fabriqHomeCurtainsImg from '../assets/images/fabriq_home_curtains_1786177399794.jpg';
import fabriqHomeBedsheetImg from '../assets/images/fabriq_home_bedsheet_1786108212930.jpg';
import fabriqHomeComforterImg from '../assets/images/fabriq_home_comforter_1786108224229.jpg';
import fabriqShoesLeatherImg from '../assets/images/fabriq_shoes_leather_1786178230502.jpg';
import fabriqShoesSneakersImg from '../assets/images/fabriq_shoes_sneakers_1786109264236.jpg';
import fabriqLuxuryHandbagImg from '../assets/images/fabriq_luxury_handbag_1786109277872.jpg';
import luxuryBoutiqueCareImg from '../assets/images/luxury_boutique_care_1785775337231.jpg';
import fabriqBridalWearImg from '../assets/images/fabriq_bridal_wear_1786536610_1786538122455.jpg';
import fabriqMenJeansImg from '../assets/images/fabriq_men_jeans_trousers_1786178133162.jpg';
import fabriqCarpetCleaningImg from '../assets/images/fabriq_carpet_cleaning_1786023022765.jpg';

interface ScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export type GarmentCategory = 'men' | 'women' | 'kids' | 'others';
export type ServiceTreatmentFilter =
  | 'all'
  | 'steam_iron'
  | 'wash_fold'
  | 'wash_iron'
  | 'dry_cleaning'
  | 'premium'
  | 'specialty';

export interface ServiceItem {
  id: string;
  name: string;
  division: AppDivision;
  category: GarmentCategory;
  serviceType: ServiceTreatmentFilter;
  treatment: string;
  regularPrice: number;
  offerPrice?: number;
  offerCode?: string;
  unit: string;
  turnaround: string;
  image: string;
  badge?: string;
  description: string;
}

// Complete, authentic service menu mapped across all 3 divisions and 4 categories
export const DIVISION_SERVICES: ServiceItem[] = [
  // =========================================================================
  // DIVISION 1: FABRIQ AI — PREMIUM LAUNDRY POWERED BY AI
  // =========================================================================
  // --- MEN ---
  {
    id: 'laundry-men-suit-2pc',
    name: 'Executive 2-Piece Suit Care',
    division: 'laundry',
    category: 'men',
    serviceType: 'dry_cleaning',
    treatment: 'Hydrocarbon Dry Clean & Italian Vacuum Press',
    regularPrice: 349,
    offerPrice: 299,
    offerCode: 'BESPOKE15',
    unit: 'suit',
    turnaround: '24-48 hrs',
    image: fabriqSuit2pcImg,
    badge: 'SIGNATURE CARE',
    description: 'Lapel roll preservation, zero-shine steam pressing, and breathable cedar garment bag.',
  },
  {
    id: 'laundry-men-suit-3pc',
    name: '3-Piece Royal Suit Complete Care',
    division: 'laundry',
    category: 'men',
    serviceType: 'premium',
    treatment: 'Hydrocarbon Dry Clean, Waistcoat Finishing & Press',
    regularPrice: 449,
    offerPrice: 389,
    offerCode: 'BESPOKE15',
    unit: 'set',
    turnaround: '48 hrs',
    image: fabriqSuit3pcImg,
    badge: 'ROYAL CARE',
    description: 'Coat, waistcoat, and trouser individual Italian board steaming with padded hanger.',
  },
  {
    id: 'laundry-men-shirt-steam',
    name: 'Formal Shirt Vacuum Steam Press',
    division: 'laundry',
    category: 'men',
    serviceType: 'steam_iron',
    treatment: 'Italian Vacuum Board Steam Ironing',
    regularPrice: 45,
    offerPrice: 29,
    offerCode: 'PROMO15',
    unit: 'pc',
    turnaround: 'Same Day',
    image: luxurySteamIronImg,
    badge: 'STEAM PRESS',
    description: 'Precision collar-cuff sharpening and wrinkle release without fabric glaze.',
  },
  {
    id: 'laundry-men-shirt-wash-iron',
    name: 'Premium Formal Shirt Wash & Iron',
    division: 'laundry',
    category: 'men',
    serviceType: 'wash_iron',
    treatment: 'Gentle Enzyme Wash & Collar-Cuff Press',
    regularPrice: 99,
    offerPrice: 79,
    offerCode: 'FABRIQ50',
    unit: 'pc',
    turnaround: '24 hrs',
    image: fabriqMenShirtImg,
    badge: 'POPULAR',
    description: 'Soft-water micro-filtered wash with crisp collar finishing and button protection.',
  },
  {
    id: 'laundry-men-tshirt-fold',
    name: 'Casual T-Shirt Wash & Fold',
    division: 'laundry',
    category: 'men',
    serviceType: 'wash_fold',
    treatment: 'Hypoallergenic Eco-Wash & Soft Fold',
    regularPrice: 65,
    offerPrice: 49,
    offerCode: 'FABRIQ50',
    unit: 'pc',
    turnaround: '24 hrs',
    image: fabriqMenTshirtImg,
    description: 'Gentle color-retention wash, anti-shrink drying, and neat compact fold.',
  },
  {
    id: 'laundry-men-kurta',
    name: 'Silk / Festive Men Kurta',
    division: 'laundry',
    category: 'men',
    serviceType: 'dry_cleaning',
    treatment: 'Delicate Silk Dry Clean & Hand Steam Press',
    regularPrice: 220,
    offerPrice: 189,
    offerCode: 'BESPOKE15',
    unit: 'pc',
    turnaround: '24-48 hrs',
    image: fabriqMenKurtaImg,
    description: 'pH-neutral solvent formulated to protect delicate silk sheen, zari, and embroidery.',
  },
  {
    id: 'laundry-men-sherwani',
    name: 'Royal Heritage Groom Sherwani',
    division: 'laundry',
    category: 'men',
    serviceType: 'premium',
    treatment: 'Bespoke Couture Dry Clean & Velvet Pad Steaming',
    regularPrice: 599,
    offerPrice: 499,
    offerCode: 'BESPOKE15',
    unit: 'set',
    turnaround: '48-72 hrs',
    image: fabriqSherwaniImg,
    badge: 'COUTURE CARE',
    description: 'Hand-processed couture cleaning safeguarding intricate zardozi, gems, and velvet accents.',
  },
  {
    id: 'laundry-men-jeans-press',
    name: 'Denim & Trouser Vacuum Steam Press',
    division: 'laundry',
    category: 'men',
    serviceType: 'steam_iron',
    treatment: 'Italian Vacuum Board Steam Press',
    regularPrice: 35,
    offerPrice: 15,
    offerCode: 'PROMO15',
    unit: 'pc',
    turnaround: 'Same Day',
    image: fabriqMenJeansImg,
    badge: 'SPECIAL CARE',
    description: 'Crease-free form shaping with zero fabric scorching or shine marks.',
  },
  {
    id: 'laundry-men-blazer',
    name: 'Designer Blazer & Sports Jacket',
    division: 'laundry',
    category: 'men',
    serviceType: 'dry_cleaning',
    treatment: 'Organic Hydrocarbon Dry Clean & Form Shaping',
    regularPrice: 249,
    offerPrice: 199,
    offerCode: 'BESPOKE15',
    unit: 'pc',
    turnaround: '24-48 hrs',
    image: fabriqMenBlazerImg,
    description: 'Shoulder pad preservation, interior lining sanitization, and crease-resistant finish.',
  },
  {
    id: 'laundry-men-kg-laundry',
    name: 'Men Everyday Laundry by KG (Wash & Iron)',
    division: 'laundry',
    category: 'men',
    serviceType: 'wash_iron',
    treatment: 'Micro-Filtered Hydro Wash & Steam Pressing',
    regularPrice: 129,
    offerPrice: 99,
    offerCode: 'FABRIQ50',
    unit: 'kg',
    turnaround: '24 hrs',
    image: fabriqMenKgLaundryImg,
    badge: 'PER KG',
    description: 'Everyday shirts, trousers, and innerwear weighed, sanitized, and steam ironed.',
  },

  // --- WOMEN ---
  {
    id: 'laundry-women-saree-silk',
    name: 'Pure Kanjeevaram / Banarasi Silk Saree',
    division: 'laundry',
    category: 'women',
    serviceType: 'dry_cleaning',
    treatment: 'Hydrocarbon Dry Clean & Roll Press',
    regularPrice: 399,
    offerPrice: 349,
    offerCode: 'SILK25',
    unit: 'pc',
    turnaround: '48 hrs',
    image: fabriqDesignerDressImg,
    badge: 'COUTURE CARE',
    description: 'Preserves delicate zari luster, gold thread embroidery, and pure silk fabric softness.',
  },
  {
    id: 'laundry-women-saree-steam',
    name: 'Saree High-Pressure Steam Roll Press',
    division: 'laundry',
    category: 'women',
    serviceType: 'steam_iron',
    treatment: 'Italian High-Pressure Roll Steaming',
    regularPrice: 149,
    offerPrice: 99,
    offerCode: 'SILK25',
    unit: 'pc',
    turnaround: 'Same Day',
    image: luxurySteamIronImg,
    badge: 'STEAM ROLL',
    description: 'Zero-crease velvet rolling without flattening delicate borders or embellishments.',
  },
  {
    id: 'laundry-women-lehenga',
    name: 'Bridal & Party Wear Lehenga',
    division: 'laundry',
    category: 'women',
    serviceType: 'premium',
    treatment: 'Hand-Finished Couture Dry Clean & Archival Box',
    regularPrice: 899,
    offerPrice: 749,
    offerCode: 'BESPOKE15',
    unit: 'set',
    turnaround: '48-72 hrs',
    image: fabriqBridalWearImg,
    badge: 'BRIDAL CARE',
    description: 'Multi-layer sanitization, bead embroidery inspection, and archival breathable packaging.',
  },
  {
    id: 'laundry-women-kurti-wash',
    name: 'Designer Kurti & Tunic Wash & Iron',
    division: 'laundry',
    category: 'women',
    serviceType: 'wash_iron',
    treatment: 'Liquid Enzyme Wash & Soft Steam Press',
    regularPrice: 149,
    offerPrice: 119,
    offerCode: 'FABRIQ50',
    unit: 'pc',
    turnaround: '24 hrs',
    image: fabriqWomenKurtiImg,
    description: 'Color-lock technology to safeguard vibrant botanical dyes and soft cotton fibers.',
  },
  {
    id: 'laundry-women-blouse',
    name: 'Embroidered Silk Blouse Care',
    division: 'laundry',
    category: 'women',
    serviceType: 'dry_cleaning',
    treatment: 'Hydrocarbon Dry Clean & Hand Press',
    regularPrice: 120,
    offerPrice: 99,
    offerCode: 'BESPOKE15',
    unit: 'pc',
    turnaround: '24 hrs',
    image: fabriqWomenBlouseImg,
    description: 'Padded form pressing protecting delicate hooks, latkans, and stone work.',
  },
  {
    id: 'laundry-women-gown',
    name: 'Designer Evening Gown Spa',
    division: 'laundry',
    category: 'women',
    serviceType: 'premium',
    treatment: 'Gentle Hydrocarbon Spa & Hand Finishing',
    regularPrice: 499,
    offerPrice: 399,
    offerCode: 'BESPOKE15',
    unit: 'pc',
    turnaround: '48 hrs',
    image: fabriqWomenGownImg,
    badge: 'EVENING SPA',
    description: 'Specialized stain lift on flares, net linings, and sequin bodice work.',
  },
  {
    id: 'laundry-women-tshirt',
    name: 'Women Top / T-Shirt Wash & Fold',
    division: 'laundry',
    category: 'women',
    serviceType: 'wash_fold',
    treatment: 'Eco Gentle Wash & Soft Fold',
    regularPrice: 65,
    offerPrice: 49,
    offerCode: 'FABRIQ50',
    unit: 'pc',
    turnaround: '24 hrs',
    image: fabriqWomenTshirtImg,
    description: 'Delicate spin cycle protecting elasticity, lace trims, and fabric texture.',
  },
  {
    id: 'laundry-women-kg-laundry',
    name: 'Women Daily Wear Laundry by KG',
    division: 'laundry',
    category: 'women',
    serviceType: 'wash_iron',
    treatment: 'Gentle Hydro Wash & Steam Finishing',
    regularPrice: 129,
    offerPrice: 99,
    offerCode: 'FABRIQ50',
    unit: 'kg',
    turnaround: '24 hrs',
    image: fabriqWomenLaundryKgImg,
    badge: 'PER KG',
    description: 'Daily kurtis, leggings, tops, and nightwear washed with fabric conditioner & pressed.',
  },

  // --- KIDS ---
  {
    id: 'laundry-kids-frock',
    name: 'Kids Party Frock & Gown',
    division: 'laundry',
    category: 'kids',
    serviceType: 'dry_cleaning',
    treatment: 'Hypoallergenic Organic Eco-Clean',
    regularPrice: 180,
    offerPrice: 149,
    offerCode: 'FABRIQ50',
    unit: 'pc',
    turnaround: '24 hrs',
    image: fabriqKidsFrockImg,
    badge: 'HYPOALLERGENIC',
    description: 'Zero harsh chemicals, organic pediatric-safe detergents, and soft texture restoration.',
  },
  {
    id: 'laundry-kids-uniform',
    name: 'Kids School Uniform (Shirt + Short/Skirt)',
    division: 'laundry',
    category: 'kids',
    serviceType: 'wash_iron',
    treatment: 'Disinfectant Wash & Crisp Press',
    regularPrice: 120,
    offerPrice: 89,
    offerCode: 'FABRIQ50',
    unit: 'pair',
    turnaround: '24 hrs',
    image: fabriqKidsUniformImg,
    description: 'Deep stain release on collars/cuffs and hygienic thermal sanitization.',
  },
  {
    id: 'laundry-kids-jeans',
    name: 'Kids Jeans & Dungarees Wash & Iron',
    division: 'laundry',
    category: 'kids',
    serviceType: 'wash_iron',
    treatment: 'Anti-Bacterial Wash & Soft Press',
    regularPrice: 85,
    offerPrice: 65,
    offerCode: 'FABRIQ50',
    unit: 'pc',
    turnaround: '24 hrs',
    image: fabriqKidsJeansImg,
    description: 'Tough dirt extraction with skin-friendly fabric softener.',
  },
  {
    id: 'laundry-kids-kg',
    name: 'Kids Daily Wear Laundry by KG',
    division: 'laundry',
    category: 'kids',
    serviceType: 'wash_fold',
    treatment: 'Wash & Fold • Pure Hydro Wash',
    regularPrice: 99,
    offerPrice: 79,
    offerCode: 'FABRIQ50',
    unit: 'kg',
    turnaround: '24 hrs',
    image: fabriqKidsLaundryImg,
    badge: 'PER KG',
    description: 'Daily cotton t-shirts, pyjamas, and baby wear sanitized and folded neatly.',
  },

  // --- OTHERS (HOME, SHOES & BAGS) ---
  {
    id: 'laundry-others-bedsheet',
    name: 'King Size Bed Linen & Comforter',
    division: 'laundry',
    category: 'others',
    serviceType: 'wash_iron',
    treatment: 'Thermal Dust-Mite Sanitization & Wash',
    regularPrice: 349,
    offerPrice: 289,
    offerCode: 'BESPOKE15',
    unit: 'pc',
    turnaround: '48 hrs',
    image: fabriqHomeBedsheetImg,
    description: '60°C thermal treatment eradicating 99.9% dust mites and bacteria with lavender freshness.',
  },
  {
    id: 'laundry-others-comforter',
    name: 'Heavy Duvet & Down Comforter Wash',
    division: 'laundry',
    category: 'others',
    serviceType: 'dry_cleaning',
    treatment: 'High-Loft Extraction & Anti-Moth Sanitization',
    regularPrice: 399,
    offerPrice: 329,
    offerCode: 'BESPOKE15',
    unit: 'pc',
    turnaround: '48 hrs',
    image: fabriqHomeComforterImg,
    badge: 'HIGH LOFT',
    description: 'Deep fiber expansion restoring feather and synthetic down loft with anti-mite barrier.',
  },
  {
    id: 'laundry-others-curtains',
    name: 'Heavy Silk / Velvet Drapes & Curtains',
    division: 'laundry',
    category: 'others',
    serviceType: 'dry_cleaning',
    treatment: 'In-Depth Extraction Dry Cleaning',
    regularPrice: 299,
    offerPrice: 249,
    offerCode: 'BESPOKE15',
    unit: 'panel',
    turnaround: '48 hrs',
    image: fabriqHomeCurtainsImg,
    description: 'Restores heavy curtain folds and removes embedded dust without shrinkage.',
  },
  {
    id: 'laundry-others-carpet',
    name: 'Living Room Carpet & Rug Deep Extraction',
    division: 'laundry',
    category: 'others',
    serviceType: 'specialty',
    treatment: 'German Injection-Extraction Shampooing',
    regularPrice: 499,
    offerPrice: 399,
    offerCode: 'BESPOKE15',
    unit: 'rug',
    turnaround: '48-72 hrs',
    image: fabriqCarpetCleaningImg,
    badge: 'DEEP EXTRACTION',
    description: 'Deep soil removal, pile conditioning, and germicidal UV chamber sanitization.',
  },
  {
    id: 'laundry-others-sneakers',
    name: 'Sneaker Spa & Footwear Restoration',
    division: 'laundry',
    category: 'others',
    serviceType: 'specialty',
    treatment: 'Deep Foam Shampoo & UV Sanitization',
    regularPrice: 399,
    offerPrice: 299,
    offerCode: 'BESPOKE15',
    unit: 'pair',
    turnaround: '48 hrs',
    image: fabriqShoesSneakersImg,
    badge: 'SNEAKER SPA',
    description: 'Sole de-yellowing, suede restoration, inner odor treatment, and UV chamber sanitization.',
  },
  {
    id: 'laundry-others-leather-shoes',
    name: 'Italian Leather Shoe Spa & Nourishment',
    division: 'laundry',
    category: 'others',
    serviceType: 'specialty',
    treatment: 'Beeswax Conditioning & Edge Polishing',
    regularPrice: 499,
    offerPrice: 399,
    offerCode: 'BESPOKE15',
    unit: 'pair',
    turnaround: '48 hrs',
    image: fabriqShoesLeatherImg,
    badge: 'LEATHER SPA',
    description: 'Full grain leather rejuvenation, mirror toe gloss, and welt conditioning.',
  },
  {
    id: 'laundry-others-handbag',
    name: 'Luxury Leather Handbag Spa',
    division: 'laundry',
    category: 'others',
    serviceType: 'specialty',
    treatment: 'Upholstery Conditioning & Stain Guard',
    regularPrice: 699,
    offerPrice: 549,
    offerCode: 'BESPOKE15',
    unit: 'pc',
    turnaround: '72 hrs',
    image: fabriqLuxuryHandbagImg,
    badge: 'HANDBAG SPA',
    description: 'Full grain leather rejuvenation, metal hardware polishing, and interior vacuuming.',
  },

  // =========================================================================
  // DIVISION 2: FABRIQ BOUTIQUE — PREMIUM FASHION & TAILORING
  // =========================================================================
  // --- MEN ---
  {
    id: 'boutique-men-bespoke-suit',
    name: 'Master Tailor Bespoke 2-Piece Suit',
    division: 'boutique',
    category: 'men',
    serviceType: 'premium',
    treatment: '3D Body Scan & Custom Hand Tailoring',
    regularPrice: 7999,
    offerPrice: 6999,
    offerCode: 'BESPOKE15',
    unit: 'suit',
    turnaround: '5-7 days',
    image: fabriqSuit2pcImg,
    badge: '3D BESPOKE',
    description: 'Full canvas construction, horn buttons, personalized silk monogram, and 2 trial fittings.',
  },
  {
    id: 'boutique-men-sherwani',
    name: 'Royal Heritage Groom Sherwani Stitching',
    division: 'boutique',
    category: 'men',
    serviceType: 'premium',
    treatment: 'Custom Zardozi & Velvet Collar Tailoring',
    regularPrice: 9999,
    offerPrice: 8499,
    offerCode: 'BESPOKE15',
    unit: 'set',
    turnaround: '7-10 days',
    image: fabriqSherwaniImg,
    badge: 'ROYAL COUTURE',
    description: 'Hand-crafted ceremonial cut tailored to precision body posture.',
  },
  {
    id: 'boutique-men-alteration',
    name: 'Suit Jacket & Trouser Precision Alteration',
    division: 'boutique',
    category: 'men',
    serviceType: 'specialty',
    treatment: 'Waist, Inseam & Sleeve Adjustments',
    regularPrice: 499,
    offerPrice: 399,
    offerCode: 'FABRIQ50',
    unit: 'pc',
    turnaround: '48 hrs',
    image: luxuryBoutiqueCareImg,
    description: 'Preserves original hem and seam aesthetics while customizing jacket waist suppression.',
  },

  // --- WOMEN ---
  {
    id: 'boutique-women-blouse',
    name: 'Designer Blouse Custom Tailoring',
    division: 'boutique',
    category: 'women',
    serviceType: 'premium',
    treatment: 'Princess Cut / Maggam Embroidery Styling',
    regularPrice: 1299,
    offerPrice: 1099,
    offerCode: 'BESPOKE15',
    unit: 'pc',
    turnaround: '3-4 days',
    image: fabriqWomenBlouseImg,
    badge: 'CUSTOM CUT',
    description: 'Precision necklines, built-in padding, and bespoke hand-embroidery options.',
  },
  {
    id: 'boutique-women-lehenga-fitting',
    name: 'Bridal Lehenga & Gown Resizing',
    division: 'boutique',
    category: 'women',
    serviceType: 'premium',
    treatment: 'Multi-Can-Can Adjustment & Waist Resizing',
    regularPrice: 1499,
    offerPrice: 1199,
    offerCode: 'BESPOKE15',
    unit: 'set',
    turnaround: '3-5 days',
    image: fabriqBridalWearImg,
    badge: 'BRIDAL STUDIO',
    description: 'Custom silhouette shaping with delicate border preservation.',
  },
  {
    id: 'boutique-women-fall-pico',
    name: 'Saree Fall, Pico & Tassel Finishing',
    division: 'boutique',
    category: 'women',
    serviceType: 'specialty',
    treatment: 'Hand-Stitched Matching Cotton Fall',
    regularPrice: 249,
    offerPrice: 199,
    offerCode: 'FABRIQ50',
    unit: 'saree',
    turnaround: '24 hrs',
    image: fabriqDesignerDressImg,
    description: 'Even edge pico and premium dyed cotton fall to ensure effortless drape.',
  },

  // --- KIDS ---
  {
    id: 'boutique-kids-festive',
    name: 'Custom Kids Ethnic Kurta-Dhoti / Frock',
    division: 'boutique',
    category: 'kids',
    serviceType: 'premium',
    treatment: 'Soft Cotton Lined Custom Tailoring',
    regularPrice: 1199,
    offerPrice: 999,
    offerCode: 'BESPOKE15',
    unit: 'set',
    turnaround: '3-5 days',
    image: fabriqKidsFrockImg,
    description: 'Gentle on sensitive skin with no scratchy inner tags or rough seams.',
  },

  // --- OTHERS ---
  {
    id: 'boutique-others-monogram',
    name: 'Bespoke Monogramming & Crest Embroidery',
    division: 'boutique',
    category: 'others',
    serviceType: 'specialty',
    treatment: 'Precision Gold / Silk Thread Embroidery',
    regularPrice: 399,
    offerPrice: 299,
    offerCode: 'FABRIQ50',
    unit: 'item',
    turnaround: '24 hrs',
    image: luxuryBoutiqueCareImg,
    description: 'Add your initials or custom family crest to cuffs, pockets, or handkerchiefs.',
  },

  // =========================================================================
  // DIVISION 3: FABRIQ LUXURY CLOTH STORE — PREMIUM CLOTHING & LIFESTYLE
  // =========================================================================
  // --- MEN ---
  {
    id: 'retail-men-shirt-giza',
    name: 'Royal Giza Egyptian Cotton Shirt',
    division: 'luxury_store',
    category: 'men',
    serviceType: 'premium',
    treatment: '120s Two-Ply Tailored Luxury Shirt',
    regularPrice: 4999,
    offerPrice: 3499,
    offerCode: 'BESPOKE15',
    unit: 'piece',
    turnaround: 'Immediate Dispatch',
    image: fabriqMenShirtImg,
    badge: '100% GIZA COTTON',
    description: 'Crisp 120s two-ply Giza cotton with mother-of-pearl buttons and crease resistance.',
  },
  {
    id: 'retail-men-denim-selvedge',
    name: 'Japanese Selvedge Raw Denim Jeans',
    division: 'luxury_store',
    category: 'men',
    serviceType: 'premium',
    treatment: '14oz Kurabo Japanese Selvedge',
    regularPrice: 6999,
    offerPrice: 4999,
    offerCode: 'BESPOKE15',
    unit: 'piece',
    turnaround: 'Immediate Dispatch',
    image: fabriqMenJeansImg,
    badge: 'JAPANESE DENIM',
    description: 'Woven on vintage shuttle looms with authentic indigo dye and reinforced brass rivets.',
  },
  {
    id: 'retail-men-oxford-shoes',
    name: 'Italian Calfskin Oxford Shoes',
    division: 'luxury_store',
    category: 'men',
    serviceType: 'premium',
    treatment: 'Hand-Burnished Goodyear Welt Leather',
    regularPrice: 10999,
    offerPrice: 7999,
    offerCode: 'BESPOKE15',
    unit: 'pair',
    turnaround: 'Immediate Dispatch',
    image: fabriqShoesLeatherImg,
    badge: 'ITALIAN CALFSKIN',
    description: 'Full-grain Italian calf leather with cushioned memory foam arch support.',
  },

  // --- WOMEN ---
  {
    id: 'retail-women-silk-kurti',
    name: 'Chanderi Silk Royal Festive Kurta Set',
    division: 'luxury_store',
    category: 'women',
    serviceType: 'premium',
    treatment: 'Handwoven Chanderi with Antique Zari',
    regularPrice: 8499,
    offerPrice: 5999,
    offerCode: 'BESPOKE15',
    unit: 'set',
    turnaround: 'Immediate Dispatch',
    image: fabriqWomenKurtiImg,
    badge: 'ROYAL HERITAGE',
    description: 'Hand-embroidered neckline with antique metallic gold thread and silk churidar.',
  },
  {
    id: 'retail-women-leather-bag',
    name: 'Milano Saffiano Leather Tote',
    division: 'luxury_store',
    category: 'women',
    serviceType: 'premium',
    treatment: 'Scratch-Resistant Saffiano Calfskin',
    regularPrice: 12999,
    offerPrice: 8999,
    offerCode: 'BESPOKE15',
    unit: 'piece',
    turnaround: 'Immediate Dispatch',
    image: fabriqLuxuryHandbagImg,
    badge: 'MILANO DESIGN',
    description: 'Equipped with 24k gold-tone hardware and suede-lined organizational compartments.',
  },

  // --- KIDS ---
  {
    id: 'retail-kids-cotton-set',
    name: 'Organic Supima Cotton Kids Lounge Set',
    division: 'luxury_store',
    category: 'kids',
    serviceType: 'premium',
    treatment: '100% GOTS Certified Organic Cotton',
    regularPrice: 1999,
    offerPrice: 1499,
    offerCode: 'FABRIQ50',
    unit: 'set',
    turnaround: 'Immediate Dispatch',
    image: fabriqKidsFrockImg,
    badge: 'ORGANIC CERTIFIED',
    description: 'Naturally breathable cotton free from synthetic dyes and irritants.',
  },

  // --- OTHERS ---
  {
    id: 'retail-others-wallet',
    name: 'Full-Grain Italian Leather Bifold Wallet',
    division: 'luxury_store',
    category: 'others',
    serviceType: 'premium',
    treatment: 'RFID Blocking Handcrafted Calfskin',
    regularPrice: 2499,
    offerPrice: 1899,
    offerCode: 'FABRIQ50',
    unit: 'piece',
    turnaround: 'Immediate Dispatch',
    image: fabriqShoesLeatherImg,
    badge: 'GENUINE LEATHER',
    description: 'Slim profile wallet with 8 card slots and gold FabriQ crest insignia.',
  },
];

export const HomeDashboard: React.FC<ScreenProps> = ({ onNavigate }) => {
  const { division, setDivision } = useDivision();
  const { activeBranch, setShowBranchModal } = useBranch();
  const { profile } = useAuth();
  const { getUserOrders } = useOrders();
  const userOrdersList = getUserOrders(profile?.email || profile?.name);
  const activeOrder =
    userOrdersList.find((o) => o.status !== 'Delivered' && o.status !== 'Cancelled') ||
    userOrdersList[0];

  // Customer Journey State:
  // 'landing' -> Entrance splash
  // 'divisions' -> Master brand + Three Divisions
  // 'categories' -> Select Category (Men, Women, Kids, Others)
  // 'services' -> Full Service Catalogue + Offers + Booking
  const [journeyStep, setJourneyStep] = useState<
    'landing' | 'divisions' | 'categories' | 'services'
  >('landing');
  const [selectedCategory, setSelectedCategory] = useState<GarmentCategory>('men');
  const [selectedTreatmentFilter, setSelectedTreatmentFilter] =
    useState<ServiceTreatmentFilter>('all');
  const [isDashboardLoading, setIsDashboardLoading] = useState(false);

  const triggerSkeletonLoading = () => {
    setIsDashboardLoading(true);
    setTimeout(() => {
      setIsDashboardLoading(false);
    }, 300);
  };

  // React to global navigation events (e.g. Header logo click, BottomNav Book click)
  useEffect(() => {
    const handleNavStep = (e: Event) => {
      const customEvt = e as CustomEvent<string>;
      const step = customEvt.detail;
      if (
        step === 'landing' ||
        step === 'divisions' ||
        step === 'categories' ||
        step === 'services'
      ) {
        setJourneyStep(step);
        if (step === 'services') triggerSkeletonLoading();
      }
    };
    window.addEventListener('fabriq_nav_step', handleNavStep);
    return () => window.removeEventListener('fabriq_nav_step', handleNavStep);
  }, []);

  // Modals & Chat
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [whatsAppService, setWhatsAppService] = useState('');
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isBoutiqueCheckInOpen, setIsBoutiqueCheckInOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const { isOffline, lastSyncTime } = useOfflineStatus();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleLandingTap = () => {
    triggerHaptic('medium');
    setJourneyStep('divisions');
  };

  const handleSelectDivision = (div: AppDivision) => {
    triggerHaptic('medium');
    setDivision(div);
    setJourneyStep('categories');
  };

  const handleSelectCategory = (cat: GarmentCategory) => {
    triggerHaptic('light');
    setSelectedCategory(cat);
    setSelectedTreatmentFilter('all');
    setJourneyStep('services');
    triggerSkeletonLoading();
  };

  const handleAddToCart = (item: ServiceItem) => {
    triggerHaptic('heavy');
    try {
      const saved = localStorage.getItem('fabriq_cart_items');
      const cart = saved ? JSON.parse(saved) : [];
      const existing = cart.find((c: any) => c.id === item.id);
      if (existing) {
        existing.qty = (existing.qty || 1) + 1;
      } else {
        cart.push({
          id: item.id,
          name: item.name,
          service: item.treatment,
          price: item.offerPrice || item.regularPrice,
          originalPrice: item.regularPrice,
          qty: 1,
          unit: item.unit,
          division: item.division,
          category: item.category,
        });
      }
      localStorage.setItem('fabriq_cart_items', JSON.stringify(cart));
      window.dispatchEvent(new Event('storage'));
      showToast(`Added "${item.name}" to selection`);
    } catch {
      showToast(`Added to selection`);
    }
  };

  // Filtered Services for currently chosen Division, Category, and Treatment Filter
  const activeDivisionCategoryServices = DIVISION_SERVICES.filter(
    (s) => s.division === division && s.category === selectedCategory
  );

  const displayedServices =
    selectedTreatmentFilter === 'all'
      ? activeDivisionCategoryServices
      : activeDivisionCategoryServices.filter(
          (s) => s.serviceType === selectedTreatmentFilter
        );

  return (
    <div
      className={`flex flex-col w-full min-h-screen font-sans relative selection:bg-[#C29C6D] selection:text-white transition-colors duration-300 ${
        journeyStep === 'landing'
          ? 'bg-[#0B1528] text-white pt-14 pb-0'
          : 'pb-28 pt-16 bg-[#070F1E] text-[#FAF9F6]'
      }`}
    >
      {/* Offline Status Alert Banner */}
      {isOffline && (
        <div className="bg-amber-950/80 text-[#E5C07B] border-b border-[#C29C6D]/40 px-4 py-2 flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">wifi_off</span>
            <span>Offline Mode Active • Cached Catalog ({lastSyncTime})</span>
          </div>
          <span className="text-[10px] bg-[#C29C6D] text-slate-950 font-bold px-2 py-0.5 rounded">
            CACHED
          </span>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 bg-[#0B1528] text-white border border-[#C29C6D] px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-semibold animate-bounce">
          <span className="material-symbols-outlined text-[#E5C07B] text-[20px]">
            check_circle
          </span>
          <span>{toastMessage}</span>
          <button
            onClick={() => onNavigate('cart')}
            className="ml-2 text-[11px] bg-gradient-to-r from-[#D4AF37] to-[#C29C6D] text-[#0B1528] px-3 py-1 rounded-lg font-black hover:opacity-90 transition-opacity cursor-pointer"
          >
            View Cart
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STAGE 1: BRAND LANDING ENTRANCE (APPROVED — KEPT EXACT)                   */}
      {/* ========================================================================= */}
      {journeyStep === 'landing' && (
        <section
          onClick={handleLandingTap}
          className="cursor-pointer min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-between text-center px-6 py-10 sm:py-16 transition-all select-none relative overflow-hidden bg-gradient-to-b from-[#070F1E] via-[#0B1528] to-[#050A14] text-white"
        >
          {/* Subtle Ambient Radial Depth */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#D4AF37]/8 via-transparent to-transparent pointer-events-none" />

          {/* Top Delicate Accent */}
          <div className="flex items-center gap-3 opacity-60 z-10">
            <div className="h-[1px] w-8 sm:w-12 bg-gradient-to-r from-transparent to-[#D4AF37]" />
            <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.3em] text-[#E5C07B] font-semibold">
              Atelier & Fabric Care
            </span>
            <div className="h-[1px] w-8 sm:w-12 bg-gradient-to-l from-transparent to-[#D4AF37]" />
          </div>

          {/* Center Dominant Brand Core */}
          <div className="max-w-md w-full flex flex-col items-center relative z-10 my-auto py-4 animate-fadeIn">
            {/* 5-POINT IMPERIAL METALLIC GOLD CROWN */}
            <div className="mb-4 transition-transform duration-500 hover:scale-105">
              <svg
                viewBox="0 0 100 70"
                className="w-14 h-10 sm:w-18 sm:h-13 filter drop-shadow-[0_4px_14px_rgba(212,175,55,0.45)]"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="stage1CrownGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFF4CC" />
                    <stop offset="35%" stopColor="#E5C07B" />
                    <stop offset="70%" stopColor="#C29C6D" />
                    <stop offset="100%" stopColor="#83633B" />
                  </linearGradient>
                  <linearGradient id="stage1CrownShimmer" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#D4AF37" />
                    <stop offset="50%" stopColor="#FFFFFF" />
                    <stop offset="100%" stopColor="#C29C6D" />
                  </linearGradient>
                </defs>

                {/* Base band */}
                <path
                  d="M10 54 L90 54 Q92 54 92 57 L90 64 Q90 66 88 66 L12 66 Q10 66 10 64 L8 57 Q8 54 10 54 Z"
                  fill="url(#stage1CrownGoldGrad)"
                  stroke="#FFF1B8"
                  strokeWidth="1"
                />
                <circle cx="25" cy="60" r="2.5" fill="#FFFFFF" />
                <circle cx="50" cy="60" r="3" fill="#FFFFFF" />
                <circle cx="75" cy="60" r="2.5" fill="#FFFFFF" />

                {/* 5 Spikes */}
                <path
                  d="M12 54 L8 28 L28 44 L50 14 L72 44 L92 28 L88 54 Z"
                  fill="url(#stage1CrownGoldGrad)"
                  stroke="#FFE8A3"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />

                {/* Filigree Arch */}
                <path
                  d="M20 54 Q35 38 50 36 Q65 38 80 54"
                  stroke="#FFF9E6"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.85"
                />

                {/* Jewels */}
                <circle cx="8" cy="27" r="3.5" fill="url(#stage1CrownShimmer)" stroke="#FFF" strokeWidth="0.8" />
                <circle cx="28" cy="43" r="3" fill="url(#stage1CrownShimmer)" stroke="#FFF" strokeWidth="0.8" />
                <circle cx="50" cy="13" r="4.5" fill="url(#stage1CrownShimmer)" stroke="#FFF" strokeWidth="1" />
                <circle cx="72" cy="43" r="3" fill="url(#stage1CrownShimmer)" stroke="#FFF" strokeWidth="0.8" />
                <circle cx="92" cy="27" r="3.5" fill="url(#stage1CrownShimmer)" stroke="#FFF" strokeWidth="0.8" />
              </svg>
            </div>

            {/* DOMINANT BRAND WORDMARK: "Fabri" (Milky White) + "Q" (Glossy Metallic Gold) */}
            <div className="flex items-baseline justify-center leading-none mt-1 mb-3">
              <h1 className="font-['Libre_Caslon_Text',serif] font-bold text-4xl sm:text-5xl md:text-6xl tracking-tight text-[#FAF9F6] drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]">
                Fabri
                <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-[#FFF4CC] via-[#D4AF37] to-[#C29C6D] drop-shadow-[0_2px_14px_rgba(212,175,55,0.45)]">
                  Q
                </span>
              </h1>
            </div>

            {/* CONCISE BRAND STATEMENT */}
            <div className="space-y-1.5 mt-2 max-w-sm mx-auto">
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.25em] text-[#E5C07B]">
                Premium Fabric Care & Lifestyle
              </p>
              <p className="font-['Libre_Caslon_Text',serif] italic text-xs sm:text-sm text-slate-300 tracking-wide">
                Care. Craft. Confidence.
              </p>
            </div>

            {/* SINGLE PRIMARY CUSTOMER ACTION (CTA) */}
            <div className="mt-9">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLandingTap();
                }}
                className="group px-8 sm:px-10 py-3.5 sm:py-4 rounded-full bg-[#0E1B33] hover:bg-[#13264A] text-[#FAF9F6] border border-[#C29C6D]/70 hover:border-[#D4AF37] shadow-[0_4px_24px_rgba(0,0,0,0.45)] hover:shadow-[0_6px_32px_rgba(212,175,55,0.3)] transition-all duration-300 flex items-center gap-3 cursor-pointer active:scale-98"
              >
                <span className="text-xs sm:text-sm font-extrabold uppercase tracking-[0.22em] text-[#FAF9F6] group-hover:text-white">
                  ENTER FABRIQ
                </span>
                <span className="material-symbols-outlined text-[18px] text-[#D4AF37] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </button>
            </div>
          </div>

          {/* Location Anchor */}
          <div className="z-10 text-center opacity-65">
            <span className="text-[9px] sm:text-[10px] font-medium tracking-[0.2em] uppercase text-slate-400">
              Hyderabad • Jubilee Hills • Banjara Hills • Gachibowli
            </span>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* STAGE 2: MASTER BRAND MESSAGE & THREE DIVISIONS SELECTION                 */}
      {/* ========================================================================= */}
      {journeyStep === 'divisions' && (
        <section className="px-4 sm:px-6 py-8 max-w-5xl mx-auto w-full animate-fadeIn">
          {/* MASTER BRAND HERO STATEMENT */}
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0B1528] border border-[#C29C6D]/40 text-[10px] font-black uppercase tracking-[0.25em] text-[#E5C07B] mb-3 shadow-xs">
              <span>MASTER BRAND ARCHITECTURE</span>
            </div>

            <h1 className="font-['Libre_Caslon_Text',serif] text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#FAF9F6]">
              Fabri<span className="text-[#D4AF37]">Q</span>
            </h1>

            <div className="flex items-center justify-center gap-3 my-3">
              <div className="h-[1px] w-12 sm:w-16 bg-gradient-to-r from-transparent to-[#C29C6D]" />
              <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-[0.3em] text-[#E5C07B]">
                ONE BRAND. THREE DIVISIONS.
              </h2>
              <div className="h-[1px] w-12 sm:w-16 bg-gradient-to-l from-transparent to-[#C29C6D]" />
            </div>

            <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
              Experience the pinnacle of garment care, couture tailoring, and luxury apparel under
              one unified master atelier standard.
            </p>
          </div>

          {/* THREE LUXURY DIVISION CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* DIVISION 1: FabriQ AI (Laundry) */}
            <div
              onClick={() => handleSelectDivision('laundry')}
              className="p-6 rounded-3xl bg-[#0B1528] hover:bg-[#0E1A33] border-2 border-[#C29C6D]/40 hover:border-[#D4AF37] text-left transition-all duration-300 shadow-xl hover:shadow-[0_8px_32px_rgba(212,175,55,0.2)] group flex flex-col justify-between cursor-pointer relative overflow-hidden"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="shrink-0 group-hover:scale-105 transition-transform">
                    <FabriQAiCrownLogo size="sm" theme="navy" showSubtitle={false} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#0B1528] bg-[#E5C07B] px-2.5 py-0.5 rounded-full shadow-xs">
                    DIVISION 01
                  </span>
                </div>

                <h3 className="font-['Libre_Caslon_Text',serif] text-xl font-bold text-[#FAF9F6]">
                  Fabri<span className="text-[#D4AF37]">Q</span> AI Laundry
                </h3>
                <p className="text-xs font-bold text-[#E5C07B] mt-0.5 tracking-wide">
                  Premium Laundry & Fabric Care
                </p>

                <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                  Hydrocarbon zero-odor dry cleaning, Italian vacuum steam pressing, organic enzyme
                  wash & 4-hour valet turnaround.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#C29C6D]/20 flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#E5C07B] group-hover:text-white transition-colors">
                  Explore Laundry
                </span>
                <div className="w-8 h-8 rounded-full bg-[#070F1E] border border-[#C29C6D]/60 flex items-center justify-center group-hover:border-[#D4AF37] group-hover:translate-x-1 transition-all">
                  <span className="material-symbols-outlined text-[16px] text-[#D4AF37]">
                    arrow_forward
                  </span>
                </div>
              </div>
            </div>

            {/* DIVISION 2: FabriQ Boutique */}
            <div
              onClick={() => handleSelectDivision('boutique')}
              className="p-6 rounded-3xl bg-[#0B1528] hover:bg-[#0E1A33] border-2 border-[#C29C6D]/40 hover:border-[#D4AF37] text-left transition-all duration-300 shadow-xl hover:shadow-[0_8px_32px_rgba(212,175,55,0.2)] group flex flex-col justify-between cursor-pointer relative overflow-hidden"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-[#070F1E] text-[#E5C07B] border border-[#C29C6D]/60 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[22px]">checkroom</span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#0B1528] bg-[#E5C07B] px-2.5 py-0.5 rounded-full shadow-xs">
                    DIVISION 02
                  </span>
                </div>

                <h3 className="font-['Libre_Caslon_Text',serif] text-xl font-bold text-[#FAF9F6]">
                  Fabri<span className="text-[#D4AF37]">Q</span> Boutique
                </h3>
                <p className="text-xs font-bold text-[#E5C07B] mt-0.5 tracking-wide">
                  Premium Fashion & Tailoring
                </p>

                <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                  3D body scan tailoring, bespoke 2-piece suits, royal bridal fitting & couture
                  alterations by master craftsmen.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#C29C6D]/20 flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#E5C07B] group-hover:text-white transition-colors">
                  Explore Boutique
                </span>
                <div className="w-8 h-8 rounded-full bg-[#070F1E] border border-[#C29C6D]/60 flex items-center justify-center group-hover:border-[#D4AF37] group-hover:translate-x-1 transition-all">
                  <span className="material-symbols-outlined text-[16px] text-[#D4AF37]">
                    arrow_forward
                  </span>
                </div>
              </div>
            </div>

            {/* DIVISION 3: FabriQ Luxury Cloth Store */}
            <div
              onClick={() => handleSelectDivision('luxury_store')}
              className="p-6 rounded-3xl bg-[#0B1528] hover:bg-[#0E1A33] border-2 border-[#C29C6D]/40 hover:border-[#D4AF37] text-left transition-all duration-300 shadow-xl hover:shadow-[0_8px_32px_rgba(212,175,55,0.2)] group flex flex-col justify-between cursor-pointer relative overflow-hidden"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-[#070F1E] text-[#E5C07B] border border-[#C29C6D]/60 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[22px]">shopping_bag</span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#0B1528] bg-[#E5C07B] px-2.5 py-0.5 rounded-full shadow-xs">
                    DIVISION 03
                  </span>
                </div>

                <h3 className="font-['Libre_Caslon_Text',serif] text-xl font-bold text-[#FAF9F6]">
                  Fabri<span className="text-[#D4AF37]">Q</span> Luxury Cloth Store
                </h3>
                <p className="text-xs font-bold text-[#E5C07B] mt-0.5 tracking-wide">
                  Ready-to-Wear Luxury Apparel
                </p>

                <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                  Royal Giza Egyptian cotton shirts, Japanese selvedge denim, Italian calfskin shoes &
                  bespoke accessories.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#C29C6D]/20 flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#E5C07B] group-hover:text-white transition-colors">
                  Explore Store
                </span>
                <div className="w-8 h-8 rounded-full bg-[#070F1E] border border-[#C29C6D]/60 flex items-center justify-center group-hover:border-[#D4AF37] group-hover:translate-x-1 transition-all">
                  <span className="material-symbols-outlined text-[16px] text-[#D4AF37]">
                    arrow_forward
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Return to Landing CTA */}
          <div className="text-center mt-8">
            <button
              onClick={() => setJourneyStep('landing')}
              className="text-xs text-slate-400 hover:text-[#E5C07B] inline-flex items-center gap-1.5 transition-colors cursor-pointer font-bold"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Back to Brand Landing</span>
            </button>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* STAGE 3: CATEGORY SELECTION (MEN, WOMEN, KIDS, OTHERS)                    */}
      {/* ========================================================================= */}
      {journeyStep === 'categories' && (
        <section className="px-4 sm:px-6 py-8 max-w-5xl mx-auto w-full animate-fadeIn">
          {/* Top Back & Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-xs font-black text-[#E5C07B] uppercase tracking-wider block">
                {division === 'laundry'
                  ? 'FabriQ AI • Laundry Division'
                  : division === 'boutique'
                  ? 'FabriQ Boutique • Tailoring Division'
                  : 'FabriQ Luxury Store • Apparel Division'}
              </span>
              <h2 className="font-['Libre_Caslon_Text',serif] text-2xl sm:text-3xl font-bold text-[#FAF9F6] mt-1">
                Select Garment Category
              </h2>
            </div>
            <button
              onClick={() => setJourneyStep('divisions')}
              className="text-xs bg-[#0B1528] hover:bg-[#0E1A33] text-[#E5C07B] border border-[#C29C6D]/40 px-3.5 py-2 rounded-xl flex items-center gap-1 cursor-pointer transition-all font-bold"
            >
              <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
              <span>Switch Division</span>
            </button>
          </div>

          {/* 4 Clear Garment Category Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                id: 'men' as GarmentCategory,
                label: 'Men',
                icon: 'man',
                subtitle: 'Suits, Shirts & Kurta',
                count: '10 Treatments Available',
              },
              {
                id: 'women' as GarmentCategory,
                label: 'Women',
                icon: 'woman',
                subtitle: 'Sarees, Lehengas & Gowns',
                count: '8 Treatments Available',
              },
              {
                id: 'kids' as GarmentCategory,
                label: 'Kids',
                icon: 'child_care',
                subtitle: 'Party Frocks & Uniforms',
                count: '4 Treatments Available',
              },
              {
                id: 'others' as GarmentCategory,
                label: 'Others',
                icon: 'category',
                subtitle: 'Linens, Sneakers & Handbags',
                count: '7 Treatments Available',
              },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleSelectCategory(cat.id)}
                className="p-5 rounded-3xl bg-[#0B1528] hover:bg-[#0E1A33] border-2 border-[#C29C6D]/40 hover:border-[#D4AF37] text-left transition-all duration-300 cursor-pointer flex flex-col justify-between shadow-lg hover:shadow-[0_4px_24px_rgba(212,175,55,0.2)] group active:scale-98"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#070F1E] text-[#E5C07B] border border-[#C29C6D]/60 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[26px]">{cat.icon}</span>
                  </div>
                  <h3 className="font-['Libre_Caslon_Text',serif] text-xl font-bold text-[#FAF9F6]">
                    {cat.label}
                  </h3>
                  <p className="text-xs font-semibold text-[#E5C07B] mt-1">{cat.subtitle}</p>
                  <p className="text-[11px] text-slate-400 mt-2 font-medium">{cat.count}</p>
                </div>

                <div className="mt-5 pt-3 border-t border-[#C29C6D]/20 flex items-center justify-between text-xs font-bold text-[#E5C07B] group-hover:text-white">
                  <span>View Services</span>
                  <span className="material-symbols-outlined text-[16px] text-[#D4AF37] group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* STAGE 4: FULL SERVICE CATALOGUE, OFFERS & BOOKING FLOW                    */}
      {/* ========================================================================= */}
      {journeyStep === 'services' && (
        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-4 animate-fadeIn">
          {/* Shimmer Skeleton Loader */}
          {isDashboardLoading ? (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-[#0B1528] rounded-3xl p-6 border border-[#C29C6D]/30 space-y-3">
                <div className="w-32 h-4 bg-slate-800 rounded-full animate-pulse" />
                <div className="w-48 h-8 bg-slate-800 rounded-xl animate-pulse" />
                <div className="w-3/4 h-4 bg-slate-800 rounded-md animate-pulse" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="bg-[#0B1528] rounded-3xl p-4 border border-[#C29C6D]/30 space-y-3 h-80 animate-pulse"
                  />
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* TOP BRAND DIVISION BAR */}
              <section className="mb-5">
                <div className="bg-[#0B1528] text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-[#C29C6D]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#E5C07B] bg-[#070F1E] px-2.5 py-0.5 rounded-full border border-[#C29C6D]/30">
                        {division === 'laundry'
                          ? 'DIVISION 01 • LAUNDRY & FABRIC CARE'
                          : division === 'boutique'
                          ? 'DIVISION 02 • 3D BESPOKE BOUTIQUE'
                          : 'DIVISION 03 • LUXURY CLOTH STORE'}
                      </span>
                    </div>

                    <h1 className="font-['Libre_Caslon_Text',serif] text-2xl sm:text-3xl font-bold tracking-tight text-[#FAF9F6]">
                      {division === 'laundry'
                        ? 'FabriQ AI Fabric Care'
                        : division === 'boutique'
                        ? 'FabriQ Bespoke Boutique'
                        : 'FabriQ Luxury Cloth Store'}
                    </h1>

                    <p className="text-xs text-slate-300 font-normal mt-1">
                      {division === 'laundry'
                        ? 'Hydrocarbon Zero-Odor Dry Cleaning & Italian Vacuum Steam Pressing'
                        : division === 'boutique'
                        ? '3D Body Scan Bespoke Tailoring & Couture Alterations'
                        : 'Handcrafted Egyptian Cotton, Selvedge Denim & Calfskin Apparel'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setJourneyStep('divisions')}
                      className="text-xs bg-[#070F1E] hover:bg-[#0E1A33] text-[#E5C07B] border border-[#C29C6D]/50 px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
                      <span>Change Division</span>
                    </button>

                    <div
                      onClick={() => setShowBranchModal(true)}
                      className="text-xs bg-[#070F1E] text-slate-200 px-3.5 py-2 rounded-xl border border-[#C29C6D]/40 cursor-pointer flex items-center gap-1.5 font-bold shadow-xs hover:text-white"
                    >
                      <span className="material-symbols-outlined text-[16px] text-[#D4AF37]">
                        storefront
                      </span>
                      <span>{activeBranch.name}</span>
                    </div>
                  </div>
                </div>

                {/* Active Order Banner (If customer has placed an order) */}
                {activeOrder && (
                  <div
                    onClick={() => onNavigate('live-order-tracking')}
                    className="mt-3 p-3 rounded-2xl bg-[#0B1528] border border-[#C29C6D]/30 flex items-center justify-between text-xs text-slate-200 cursor-pointer hover:border-[#D4AF37] transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-[#D4AF37]">
                        local_shipping
                      </span>
                      <span>
                        Active Order <strong>#{activeOrder.id}</strong> ({activeOrder.status})
                      </span>
                    </div>
                    <span className="text-[#E5C07B] font-bold flex items-center gap-1">
                      <span>Track Order</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </span>
                  </div>
                )}
              </section>

              {/* CATEGORY SWITCHER TABS (MEN / WOMEN / KIDS / OTHERS) */}
              <section className="mb-4">
                <div className="bg-[#0B1528] rounded-2xl p-1.5 border border-[#C29C6D]/40 shadow-md flex items-center justify-around gap-1.5">
                  {[
                    { id: 'men' as GarmentCategory, label: 'Men', icon: 'man' },
                    { id: 'women' as GarmentCategory, label: 'Women', icon: 'woman' },
                    { id: 'kids' as GarmentCategory, label: 'Kids', icon: 'child_care' },
                    { id: 'others' as GarmentCategory, label: 'Others', icon: 'category' },
                  ].map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => handleSelectCategory(cat.id)}
                        className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          isSelected
                            ? 'bg-[#070F1E] text-[#E5C07B] border border-[#C29C6D] shadow-md'
                            : 'text-slate-400 hover:text-white hover:bg-[#070F1E]/50'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">{cat.icon}</span>
                        <span className="uppercase tracking-wider">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* SERVICE TREATMENT TYPE FILTER PILLS */}
              <section className="mb-5 overflow-x-auto pb-1">
                <div className="flex items-center gap-2 min-w-max">
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider mr-1">
                    Filter:
                  </span>
                  {[
                    { id: 'all' as ServiceTreatmentFilter, label: 'All Services' },
                    { id: 'steam_iron' as ServiceTreatmentFilter, label: 'Steam Iron' },
                    { id: 'wash_fold' as ServiceTreatmentFilter, label: 'Wash & Fold' },
                    { id: 'wash_iron' as ServiceTreatmentFilter, label: 'Wash & Iron' },
                    { id: 'dry_cleaning' as ServiceTreatmentFilter, label: 'Dry Cleaning' },
                    { id: 'premium' as ServiceTreatmentFilter, label: 'Couture & Silk' },
                    { id: 'specialty' as ServiceTreatmentFilter, label: 'Specialty Spa' },
                  ].map((filter) => {
                    const isActive = selectedTreatmentFilter === filter.id;
                    return (
                      <button
                        key={filter.id}
                        onClick={() => {
                          triggerHaptic('light');
                          setSelectedTreatmentFilter(filter.id);
                        }}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                          isActive
                            ? 'bg-[#E5C07B] text-[#0B1528] border-[#E5C07B] shadow-xs'
                            : 'bg-[#0B1528] text-slate-300 border-[#C29C6D]/30 hover:border-[#C29C6D] hover:text-white'
                        }`}
                      >
                        {filter.label}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* FABRIQ OFFERS & VOUCHERS (CLEAN, NO POPUPS, NO MARQUEE) */}
              <section className="mb-6">
                <div className="bg-[#0B1528] rounded-3xl p-5 border border-[#C29C6D]/40 shadow-lg">
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[20px] text-[#D4AF37]">
                        local_offer
                      </span>
                      <h3 className="font-['Libre_Caslon_Text',serif] text-base font-bold text-[#FAF9F6]">
                        FABRIQ OFFERS & VOUCHERS
                      </h3>
                    </div>
                    <span className="text-[10px] text-[#E5C07B] font-bold uppercase tracking-wider bg-[#070F1E] px-2 py-0.5 rounded border border-[#C29C6D]/30">
                      Auto-Applied at Cart
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Voucher 1 */}
                    <div className="p-3 rounded-2xl bg-[#070F1E] border border-[#C29C6D]/40 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-[#E5C07B] font-mono">
                            BESPOKE15
                          </span>
                          <span className="text-[9px] bg-[#D4AF37] text-[#0B1528] px-1.5 py-0.5 rounded font-black">
                            15% OFF
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-1">
                          Signature Care, Suits & Couture
                        </p>
                      </div>
                      <span className="material-symbols-outlined text-[18px] text-emerald-400">
                        check_circle
                      </span>
                    </div>

                    {/* Voucher 2 */}
                    <div className="p-3 rounded-2xl bg-[#070F1E] border border-[#C29C6D]/30 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-[#E5C07B] font-mono">
                            FABRIQ50
                          </span>
                          <span className="text-[9px] bg-[#D4AF37] text-[#0B1528] px-1.5 py-0.5 rounded font-black">
                            ₹50 OFF
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-1">Orders above ₹299</p>
                      </div>
                      <span className="material-symbols-outlined text-[18px] text-slate-500">
                        redeem
                      </span>
                    </div>

                    {/* Voucher 3 */}
                    <div className="p-3 rounded-2xl bg-[#070F1E] border border-[#C29C6D]/30 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-[#E5C07B] font-mono">
                            SILK25
                          </span>
                          <span className="text-[9px] bg-[#D4AF37] text-[#0B1528] px-1.5 py-0.5 rounded font-black">
                            25% OFF
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-1">Silk & Saree dry cleaning</p>
                      </div>
                      <span className="material-symbols-outlined text-[18px] text-slate-500">
                        redeem
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* COMPLETE AVAILABLE SERVICE MENU GRID */}
              <section className="mb-8">
                <div className="flex items-center justify-between mb-4 px-1">
                  <div>
                    <span className="text-xs font-black text-[#E5C07B] uppercase tracking-wider block">
                      {selectedCategory.toUpperCase()} CARE MENU
                    </span>
                    <h3 className="font-['Libre_Caslon_Text',serif] text-xl font-bold text-[#FAF9F6]">
                      Available Services ({displayedServices.length})
                    </h3>
                  </div>

                  <button
                    onClick={() => {
                      if (division === 'boutique') onNavigate('boutique-fitting');
                      else if (division === 'luxury_store') onNavigate('luxury-store');
                      else onNavigate('service-catalog');
                    }}
                    className="text-xs font-black text-[#E5C07B] hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>Interactive Catalog</span>
                    <span className="material-symbols-outlined text-[16px] text-[#D4AF37]">
                      arrow_forward
                    </span>
                  </button>
                </div>

                {displayedServices.length === 0 ? (
                  <div className="bg-[#0B1528] rounded-3xl p-8 text-center border border-[#C29C6D]/30">
                    <p className="text-slate-300 text-sm font-semibold">
                      No treatments found for this specific filter.
                    </p>
                    <button
                      onClick={() => setSelectedTreatmentFilter('all')}
                      className="mt-3 px-4 py-2 rounded-xl bg-[#E5C07B] text-[#0B1528] text-xs font-black cursor-pointer"
                    >
                      Show All {selectedCategory.toUpperCase()} Services
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {displayedServices.map((item) => (
                      <div
                        key={item.id}
                        className="bg-[#0B1528] rounded-3xl p-4 sm:p-5 border-2 border-[#C29C6D]/30 hover:border-[#D4AF37] shadow-xl hover:shadow-[0_8px_32px_rgba(212,175,55,0.15)] transition-all duration-300 flex flex-col justify-between group"
                      >
                        <div>
                          {/* Image Container */}
                          <div className="relative h-44 w-full rounded-2xl overflow-hidden mb-3.5 bg-[#070F1E]">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1528] via-transparent to-transparent" />

                            {item.badge && (
                              <span className="absolute top-3 left-3 bg-[#0B1528]/90 text-[#E5C07B] border border-[#C29C6D] text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm backdrop-blur-xs">
                                {item.badge}
                              </span>
                            )}

                            <span className="absolute bottom-3 right-3 bg-[#070F1E]/90 text-[#E5C07B] text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 backdrop-blur-xs border border-[#C29C6D]/40">
                              <span className="material-symbols-outlined text-[13px] text-[#D4AF37]">
                                schedule
                              </span>
                              <span>{item.turnaround}</span>
                            </span>
                          </div>

                          {/* Title and Treatment Protocol */}
                          <h4 className="font-['Libre_Caslon_Text',serif] text-lg font-bold text-[#FAF9F6] leading-snug">
                            {item.name}
                          </h4>

                          <p className="text-xs font-bold text-[#E5C07B] mt-1.5 flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[14px] text-[#D4AF37]">
                              verified
                            </span>
                            <span>{item.treatment}</span>
                          </p>

                          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                            {item.description}
                          </p>
                        </div>

                        {/* Price, Savings & Direct Add to Cart Action */}
                        <div className="mt-5 pt-3.5 border-t border-[#C29C6D]/20 flex items-center justify-between">
                          <div>
                            <div className="flex items-baseline gap-1.5">
                              <span className="font-['Libre_Caslon_Text',serif] text-xl font-black text-[#FAF9F6]">
                                ₹{item.offerPrice || item.regularPrice}
                              </span>
                              {item.offerPrice && (
                                <span className="text-xs text-slate-400 line-through font-medium">
                                  ₹{item.regularPrice}
                                </span>
                              )}
                              <span className="text-[10px] text-slate-400 font-semibold">
                                / {item.unit}
                              </span>
                            </div>
                            {item.offerCode && (
                              <span className="text-[10px] font-bold text-[#E5C07B] block mt-0.5">
                                Save ₹{item.regularPrice - (item.offerPrice || 0)} with{' '}
                                {item.offerCode}
                              </span>
                            )}
                          </div>

                          <button
                            onClick={() => handleAddToCart(item)}
                            className="px-4 py-2.5 min-h-[44px] rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C29C6D] hover:opacity-95 text-[#0B1528] font-black text-xs shadow-md flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              add_shopping_cart
                            </span>
                            <span>Add to Cart</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* PRIMARY BOOKING CTA: BOOK GARMENT CARE */}
              <section className="mb-6">
                <div className="bg-gradient-to-r from-[#0E1B33] to-[#0B1528] rounded-3xl p-5 border-2 border-[#C29C6D]/60 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-left">
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#E5C07B] block mb-1">
                      DOORSTEP VALET & BESPOKE ATELIER
                    </span>
                    <h3 className="font-['Libre_Caslon_Text',serif] text-lg sm:text-xl font-bold text-[#FAF9F6]">
                      Ready for White-Glove Fabric Care?
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Proceed with your customized garment selection to schedule slot & payment.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      triggerHaptic('heavy');
                      onNavigate('cart');
                    }}
                    className="w-full sm:w-auto px-8 py-3.5 min-h-[48px] bg-gradient-to-r from-[#D4AF37] to-[#C29C6D] hover:opacity-95 text-[#0B1528] rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl cursor-pointer transition-all active:scale-98 shrink-0"
                  >
                    <span>BOOK GARMENT CARE</span>
                    <span className="material-symbols-outlined text-[18px]">
                      arrow_forward
                    </span>
                  </button>
                </div>
              </section>

              {/* QUICK ASSISTANCE STRIP (CONCIERGE & AI ASSISTANT) */}
              <section className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setWhatsAppService('General Fabric Care Assistance');
                    setIsWhatsAppOpen(true);
                  }}
                  className="p-4 rounded-2xl bg-[#0B1528] text-white border border-emerald-500/50 hover:border-emerald-400 shadow-md flex items-center justify-between transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold">
                      <span className="material-symbols-outlined text-[22px]">chat</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-[#FAF9F6]">WhatsApp Valet Concierge</h4>
                      <p className="text-[11px] text-slate-300">
                        Instant pickup coordination & queries
                      </p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[18px] text-emerald-400">
                    arrow_forward
                  </span>
                </button>

                <button
                  onClick={() => setIsChatbotOpen(true)}
                  className="p-4 rounded-2xl bg-[#0B1528] text-white border border-[#C29C6D]/40 hover:border-[#D4AF37] shadow-md flex items-center justify-between transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#070F1E] text-[#E5C07B] border border-[#C29C6D]/60 flex items-center justify-center font-bold">
                      <span className="material-symbols-outlined text-[22px]">smart_toy</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-[#FAF9F6]">FabriQ AI Advisor</h4>
                      <p className="text-[11px] text-slate-300">
                        Instant fiber diagnostics & care tips
                      </p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[18px] text-[#D4AF37]">
                    arrow_forward
                  </span>
                </button>
              </section>
            </>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* THE FABRIQ AI LUXURY PROMISE (CLEAN STANDARDIZED BRAND PROMISE)           */}
      {/* ========================================================================= */}
      {journeyStep !== 'landing' && (
        <>
          <section className="px-4 sm:px-6 mt-6 mb-6 max-w-5xl mx-auto w-full">
            <div className="bg-[#0B1528] rounded-3xl p-6 sm:p-8 border border-[#C29C6D]/40 shadow-xl relative overflow-hidden text-center">
              <div className="flex flex-col items-center mb-6">
                <span className="text-[10px] font-black text-[#E5C07B] uppercase tracking-[0.25em] px-3 py-1 rounded-full bg-[#070F1E] border border-[#C29C6D]/40 mb-2">
                  OUR LUXURY COMMITMENT
                </span>
                <h3 className="font-['Libre_Caslon_Text',serif] text-xl sm:text-2xl font-bold text-[#FAF9F6] tracking-tight">
                  THE FABRIQ AI LUXURY PROMISE
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 font-normal mt-1">
                  Guaranteed Excellence in Every Garment
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-4 text-left">
                {/* 1. SAFE CARE */}
                <div className="p-4 rounded-2xl bg-[#070F1E] border border-[#C29C6D]/30 hover:border-[#D4AF37] transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-[#0B1528] text-[#E5C07B] border border-[#C29C6D]/40 flex items-center justify-center mb-2.5">
                    <span className="material-symbols-outlined text-[20px] text-[#D4AF37]">
                      verified_user
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-[#FAF9F6] tracking-wider uppercase">
                    SAFE CARE
                  </h4>
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed font-medium">
                    Zero Shrinkage Guarantee
                  </p>
                </div>

                {/* 2. ECO HYDRO SOLVENT */}
                <div className="p-4 rounded-2xl bg-[#070F1E] border border-[#C29C6D]/30 hover:border-[#D4AF37] transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-[#0B1528] text-[#E5C07B] border border-[#C29C6D]/40 flex items-center justify-center mb-2.5">
                    <span className="material-symbols-outlined text-[20px] text-[#D4AF37]">
                      eco
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-[#FAF9F6] tracking-wider uppercase">
                    ECO HYDRO SOLVENT
                  </h4>
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed font-medium">
                    Hypoallergenic & Zero Odor
                  </p>
                </div>

                {/* 3. EXPRESS VALET */}
                <div className="p-4 rounded-2xl bg-[#070F1E] border border-[#C29C6D]/30 hover:border-[#D4AF37] transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-[#0B1528] text-[#E5C07B] border border-[#C29C6D]/40 flex items-center justify-center mb-2.5">
                    <span className="material-symbols-outlined text-[20px] text-[#D4AF37]">
                      electric_bolt
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-[#FAF9F6] tracking-wider uppercase">
                    EXPRESS VALET
                  </h4>
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed font-medium">
                    4-Hour Doorstep Return
                  </p>
                </div>

                {/* 4. STEAM VACUUM PRESS */}
                <div className="p-4 rounded-2xl bg-[#070F1E] border border-[#C29C6D]/30 hover:border-[#D4AF37] transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-[#0B1528] text-[#E5C07B] border border-[#C29C6D]/40 flex items-center justify-center mb-2.5">
                    <span className="material-symbols-outlined text-[20px] text-[#D4AF37]">
                      iron
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-[#FAF9F6] tracking-wider uppercase">
                    STEAM VACUUM PRESS
                  </h4>
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed font-medium">
                    Italian Vacuum Boarding
                  </p>
                </div>

                {/* 5. UV SANITIZATION */}
                <div className="p-4 rounded-2xl bg-[#070F1E] border border-[#C29C6D]/30 hover:border-[#D4AF37] transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-[#0B1528] text-[#E5C07B] border border-[#C29C6D]/40 flex items-center justify-center mb-2.5">
                    <span className="material-symbols-outlined text-[20px] text-[#D4AF37]">
                      sanitizer
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-[#FAF9F6] tracking-wider uppercase">
                    UV SANITIZATION
                  </h4>
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed font-medium">
                    99.9% Germ Shield
                  </p>
                </div>

                {/* 6. 4.9★ RATED */}
                <div className="p-4 rounded-2xl bg-[#070F1E] border border-[#C29C6D]/30 hover:border-[#D4AF37] transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-[#0B1528] text-[#E5C07B] border border-[#C29C6D]/40 flex items-center justify-center mb-2.5">
                    <span className="material-symbols-outlined text-[20px] text-[#D4AF37]">
                      stars
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-[#FAF9F6] tracking-wider uppercase">
                    4.9★ RATED
                  </h4>
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed font-medium">
                    15,000+ Happy Guests
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Centered Brand Footer */}
          <div className="px-5 text-center mt-8 mb-6">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-[#C29C6D]" />
              <span className="text-[#D4AF37] text-xs">✦</span>
              <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-[#C29C6D]" />
            </div>
            <p className="text-[11px] font-black text-[#FAF9F6] uppercase tracking-[0.25em]">
              FABRIQ AI • ONE BRAND. THREE DIVISIONS.
            </p>
            <p className="text-[10px] font-medium text-slate-400 mt-1">
              Hyderabad • Jubilee Hills • Banjara Hills • Gachibowli • Madhapur • Suchitra
            </p>
          </div>

          {/* Canonical Customer Bottom Navigation */}
          <BottomNav activePath="home" onNavigate={onNavigate} />
        </>
      )}

      {/* WhatsApp Modal */}
      <WhatsAppModal
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
        defaultService={whatsAppService}
      />

      {/* AI Assistant Chatbot Modal */}
      <InstantBookingChatbotModal
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        onNavigate={onNavigate}
      />

      {/* Boutique Check-in QR Modal */}
      <BoutiqueCheckInQRModal
        isOpen={isBoutiqueCheckInOpen}
        onClose={() => setIsBoutiqueCheckInOpen(false)}
      />
    </div>
  );
};
