import { db, doc, getDoc, setDoc } from './firebase';

export interface BranchOperationalConfig {
  branchId: string;
  branchName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  operatingStatus: 'Active' | 'Under Maintenance' | 'Temporary Closed';
  
  // Turnaround times in hours
  turnaroundStandardHours: number; // e.g. 24
  turnaroundDryCleanHours: number; // e.g. 48
  turnaroundExpressHours: number; // e.g. 12
  turnaroundTailoringHours: number; // e.g. 72
  turnaroundRestorationHours: number; // e.g. 96

  // Operational Availability Hours
  weekdayOpeningTime: string; // e.g. "08:00 AM"
  weekdayClosingTime: string; // e.g. "09:00 PM"
  weekendOpeningTime: string; // e.g. "09:00 AM"
  weekendClosingTime: string; // e.g. "08:00 PM"
  valetPickupCutoffTime: string; // e.g. "06:00 PM"
  sameDayDeliveryCutoffTime: string; // e.g. "12:00 PM"
  isSundayOpen: boolean;
  holidayNotice?: string;
  
  updatedAt: string;
  updatedBy: string;
}

export interface DynamicServiceDefinition {
  id: string;
  name: string;
  category: 'dry_cleaning' | 'laundry' | 'steam_press' | 'tailoring' | 'luxury_care';
  description: string;
  basePrice: number;
  expressPriceMultiplier: number;
  turnaroundHours: number;
  isActive: boolean;
  eligibleGarments: string[];
  features: string[];
}

export const DEFAULT_SERVICE_DEFINITIONS: DynamicServiceDefinition[] = [
  {
    id: 'srv-wash-iron',
    name: 'Eco Wash & Steam Press',
    category: 'laundry',
    description: 'Gentle pH-neutral hydro-extraction washing followed by crisp Italian steam finishing.',
    basePrice: 50,
    expressPriceMultiplier: 1.5,
    turnaroundHours: 24,
    isActive: true,
    eligibleGarments: ['Shirts', 'Trousers', 'T-Shirts', 'Kurtas', 'Casual Wear'],
    features: ['German Eco Detergent', 'Zero Bleach Formula', 'Precision Steam Ironing'],
  },
  {
    id: 'srv-dry-clean',
    name: 'Haute Couture Dry Cleaning',
    category: 'dry_cleaning',
    description: 'Closed-loop hydrocarbon purification engineered for silks, cashmeres, and formal wear.',
    basePrice: 120,
    expressPriceMultiplier: 1.5,
    turnaroundHours: 48,
    isActive: true,
    eligibleGarments: ['Suits', 'Silk Sarees', 'Blazers', 'Designer Gowns', 'Woolen Coats'],
    features: ['Hydrocarbon Green Solvent', 'Fiber Texture Restoration', 'Anti-Static Care'],
  },
  {
    id: 'srv-steam-press',
    name: 'Artisan Steam Ironing',
    category: 'steam_press',
    description: 'Form-finishing vacuum steam press removing creases without heat friction or sheen.',
    basePrice: 35,
    expressPriceMultiplier: 1.5,
    turnaroundHours: 12,
    isActive: true,
    eligibleGarments: ['Cotton Shirts', 'Trousers', 'Linen Wear', 'Dresses'],
    features: ['No Sheen Burn-Free', 'Hanger / Fold Packaging', 'Anti-Crease Starch Optional'],
  },
  {
    id: 'srv-premium-care',
    name: 'Atelier Premium & Wedding Care',
    category: 'luxury_care',
    description: 'Bespoke bridal, lehenga, and tuxedo preservation with RFID tracking & micro-inspection.',
    basePrice: 399,
    expressPriceMultiplier: 1.8,
    turnaroundHours: 48,
    isActive: true,
    eligibleGarments: ['Bridal Lehengas', 'Sherwanis', 'Designer Gowns', 'Tuxedos', 'Vintage Heirlooms'],
    features: ['Microscopic Stain Removal', 'Acid-Free Garment Box', 'Master Inspector Sign-off'],
  },
  {
    id: 'srv-shoe-bag',
    name: 'Luxury Shoes & Leather Spa',
    category: 'luxury_care',
    description: 'Handcrafted cleansing, deep conditioning, and edge recoloring for luxury footwear and leather bags.',
    basePrice: 299,
    expressPriceMultiplier: 1.5,
    turnaroundHours: 48,
    isActive: true,
    eligibleGarments: ['Sneakers', 'Leather Shoes', 'Handbags', 'Suede Boots'],
    features: ['UV Ozone Sterilization', 'Organic Beeswax Conditioning', 'Sole Whitening'],
  },
];

export const getDefaultBranchConfig = (branchId: string, branchName: string): BranchOperationalConfig => {
  return {
    branchId,
    branchName,
    addressLine1: 'Near Diamond Point, Bowenpally',
    addressLine2: 'Secunderabad',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500011',
    phone: '+91 40 2775 1001',
    email: 'bowenpally@fabriq.ai',
    operatingStatus: 'Active',
    turnaroundStandardHours: 24,
    turnaroundDryCleanHours: 48,
    turnaroundExpressHours: 12,
    turnaroundTailoringHours: 72,
    turnaroundRestorationHours: 96,
    weekdayOpeningTime: '08:00 AM',
    weekdayClosingTime: '09:00 PM',
    weekendOpeningTime: '09:00 AM',
    weekendClosingTime: '08:00 PM',
    valetPickupCutoffTime: '06:00 PM',
    sameDayDeliveryCutoffTime: '12:00 PM',
    isSundayOpen: true,
    updatedAt: new Date().toISOString(),
    updatedBy: 'system',
  };
};

const listeners: Array<() => void> = [];

export const subscribeEnterpriseConfig = (listener: () => void) => {
  listeners.push(listener);
  return () => {
    const idx = listeners.indexOf(listener);
    if (idx >= 0) listeners.splice(idx, 1);
  };
};

const notifyListeners = () => {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.warn('Listener error:', e);
    }
  });
};

export const getBranchConfig = (branchId: string, branchName = 'FabriQ Atelier'): BranchOperationalConfig => {
  try {
    const saved = localStorage.getItem(`fabriq_branch_config_${branchId}`);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Branch config parse error:', e);
  }
  return getDefaultBranchConfig(branchId, branchName);
};

export const saveBranchConfig = async (
  config: BranchOperationalConfig,
  actorName = 'Admin'
): Promise<boolean> => {
  const updated: BranchOperationalConfig = {
    ...config,
    updatedAt: new Date().toISOString(),
    updatedBy: actorName,
  };

  try {
    localStorage.setItem(`fabriq_branch_config_${config.branchId}`, JSON.stringify(updated));
    
    // Sync with Firestore
    const docRef = doc(db, 'branch_configurations', config.branchId);
    await setDoc(docRef, updated, { merge: true });
    
    notifyListeners();
    return true;
  } catch (err) {
    console.warn('Firestore branch config save fallback:', err);
    notifyListeners();
    return true;
  }
};

export const getDynamicServiceDefinitions = (): DynamicServiceDefinition[] => {
  try {
    const saved = localStorage.getItem('fabriq_dynamic_service_definitions');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Service definitions parse error:', e);
  }
  return DEFAULT_SERVICE_DEFINITIONS;
};

export const saveDynamicServiceDefinitions = async (
  services: DynamicServiceDefinition[],
  actorName = 'Admin'
): Promise<boolean> => {
  try {
    localStorage.setItem('fabriq_dynamic_service_definitions', JSON.stringify(services));
    
    // Sync to Firestore
    const docRef = doc(db, 'system_configuration', 'service_catalog_metadata');
    await setDoc(
      docRef,
      {
        services,
        updatedAt: new Date().toISOString(),
        updatedBy: actorName,
      },
      { merge: true }
    );

    notifyListeners();
    return true;
  } catch (err) {
    console.warn('Firestore service definitions save fallback:', err);
    notifyListeners();
    return true;
  }
};
