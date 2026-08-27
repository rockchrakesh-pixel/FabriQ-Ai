import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Branch {
  id: string;
  name: string;
  country: string;
  state: string;
  region: string;
  city: string;
  area?: string;
  address: string;
  phone: string;
  status: 'Active' | 'Opening Soon';
  isMain?: boolean;
  storeCode: string;
  counterId: string;
  lat?: number;
  lng?: number;
  priceModifier: number; // e.g. 1.0 = standard, 1.05 = express premium
}

export const FABRIQ_BRANCHES: Branch[] = [
  {
    id: 'b-hyd-bowenpally',
    name: 'Bowenpally Care Atelier & AI Hub (Opening Oct/Nov 2026)',
    country: 'India',
    state: 'Telangana',
    region: 'South India',
    city: 'Hyderabad',
    area: 'Bowenpally',
    address: 'Near Diamond Point, Bowenpally, Secunderabad, Hyderabad, Telangana 500011',
    phone: '+91 40 2775 1001',
    status: 'Active',
    isMain: true,
    storeCode: 'HYD-BOW-101',
    counterId: 'Counter-BW1',
    lat: 17.4720,
    lng: 78.4820,
    priceModifier: 1.0,
  },
  {
    id: 'b-hyd-suchitra',
    name: 'Suchitra Junction Premium Lounge (Opening Oct/Nov 2026)',
    country: 'India',
    state: 'Telangana',
    region: 'South India',
    city: 'Hyderabad',
    area: 'Suchitra',
    address: 'Suchitra Junction, Medchal Highway, Hyderabad, Telangana 500067',
    phone: '+91 40 2775 1002',
    status: 'Active',
    storeCode: 'HYD-SUC-102',
    counterId: 'Counter-SU1',
    lat: 17.5140,
    lng: 78.4720,
    priceModifier: 1.0,
  },
  {
    id: 'b-hyd-kompally',
    name: 'Kompally Luxury Care Studio (Opening Oct/Nov 2026)',
    country: 'India',
    state: 'Telangana',
    region: 'South India',
    city: 'Hyderabad',
    area: 'Kompally',
    address: 'Main Road, Kompally, Hyderabad, Telangana 500100',
    phone: '+91 40 2775 1003',
    status: 'Active',
    storeCode: 'HYD-KOM-103',
    counterId: 'Counter-KM1',
    lat: 17.5380,
    lng: 78.4860,
    priceModifier: 1.0,
  },
  {
    id: 'b-blr-01',
    name: 'Indiranagar 100ft Rd Care Atelier',
    country: 'India',
    state: 'Karnataka',
    region: 'South India',
    city: 'Bangalore',
    address: '100 Feet Rd, Indiranagar, Bengaluru, Karnataka 560038',
    phone: '+91 80 4112 3344',
    status: 'Active',
    storeCode: 'BLR-IND-201',
    counterId: 'Counter-A2',
    lat: 12.9784,
    lng: 77.6408,
    priceModifier: 1.0,
  },
  {
    id: 'b-lon-01',
    name: 'Mayfair Flagship Store & AI Lab',
    country: 'United Kingdom',
    state: 'Greater London',
    region: 'London Metro',
    city: 'London',
    address: '14 Mount Street, Mayfair, London W1K 2RF',
    phone: '+44 20 7946 0912',
    status: 'Active',
    storeCode: 'LON-MAY-301',
    counterId: 'Counter-L1',
    lat: 51.5098,
    lng: -0.1504,
    priceModifier: 1.15,
  },
  {
    id: 'b-lon-02',
    name: 'South Kensington Care Hub',
    country: 'United Kingdom',
    state: 'Greater London',
    region: 'London Metro',
    city: 'London',
    address: '88 Old Brompton Rd, Kensington, SW7 3LQ',
    phone: '+44 20 7946 0988',
    status: 'Active',
    storeCode: 'LON-KEN-302',
    counterId: 'Counter-L2',
    lat: 51.4938,
    lng: -0.1789,
    priceModifier: 1.1,
  },
];

interface BranchContextType {
  activeBranch: Branch;
  setActiveBranch: (branch: Branch) => void;
  showBranchModal: boolean;
  setShowBranchModal: (show: boolean) => void;
  branches: Branch[];
  requestNewBranch: (city: string) => void;
  detectGPSLocation: () => Promise<void>;
  setCustomLocation: (locationQuery: string) => void;
  isDetectingGPS: boolean;
  gpsDetectedName: string | null;
  selectedCountry: string;
  setSelectedCountry: (c: string) => void;
  selectedCity: string;
  setSelectedCity: (c: string) => void;
}

const BranchContext = createContext<BranchContextType>({
  activeBranch: FABRIQ_BRANCHES[0],
  setActiveBranch: () => {},
  showBranchModal: false,
  setShowBranchModal: () => {},
  branches: FABRIQ_BRANCHES,
  requestNewBranch: () => {},
  detectGPSLocation: async () => {},
  setCustomLocation: () => {},
  isDetectingGPS: false,
  gpsDetectedName: null,
  selectedCountry: 'All',
  setSelectedCountry: () => {},
  selectedCity: 'All',
  setSelectedCity: () => {},
});

export const BranchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeBranch, setActiveBranchState] = useState<Branch>(() => {
    const saved = localStorage.getItem('fabriq_active_branch_id');
    const found = FABRIQ_BRANCHES.find((b) => b.id === saved);
    return found || FABRIQ_BRANCHES[0];
  });

  const [showBranchModal, setShowBranchModal] = useState<boolean>(false);
  const [isDetectingGPS, setIsDetectingGPS] = useState<boolean>(false);
  const [gpsDetectedName, setGpsDetectedName] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>('All');
  const [selectedCity, setSelectedCity] = useState<string>('All');

  const setActiveBranch = (branch: Branch) => {
    setActiveBranchState(branch);
    localStorage.setItem('fabriq_active_branch_id', branch.id);
  };

  const detectGPSLocation = async () => {
    setIsDetectingGPS(true);
    setGpsDetectedName('Detecting via satellite GPS...');

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Find nearest branch mathematically
          let nearest = FABRIQ_BRANCHES[0];
          let minDistance = Number.MAX_VALUE;

          FABRIQ_BRANCHES.forEach((b) => {
            if (b.lat && b.lng) {
              const dist = Math.hypot(b.lat - latitude, b.lng - longitude);
              if (dist < minDistance) {
                minDistance = dist;
                nearest = b;
              }
            }
          });

          setActiveBranch(nearest);
          setGpsDetectedName(`GPS Detected: ${nearest.name} (${nearest.city})`);
          setIsDetectingGPS(false);
        },
        (error) => {
          console.warn('GPS position fallback:', error);
          // Auto fallback to Bowenpally Care Atelier
          const hydBranch = FABRIQ_BRANCHES.find((b) => b.id === 'b-hyd-bowenpally') || FABRIQ_BRANCHES[0];
          setActiveBranch(hydBranch);
          setGpsDetectedName('GPS Auto-Detected: Bowenpally, Secunderabad (Telangana)');
          setIsDetectingGPS(false);
        },
        { timeout: 5000 }
      );
    } else {
      const hydBranch = FABRIQ_BRANCHES.find((b) => b.id === 'b-hyd-bowenpally') || FABRIQ_BRANCHES[0];
      setActiveBranch(hydBranch);
      setGpsDetectedName('GPS Detected: Bowenpally, Hyderabad');
      setIsDetectingGPS(false);
    }
  };

  const setCustomLocation = (locationQuery: string) => {
    if (!locationQuery || !locationQuery.trim()) return;
    const query = locationQuery.toLowerCase().trim();
    
    // Find matching branch
    let matchedBranch = FABRIQ_BRANCHES.find(
      (b) =>
        b.city.toLowerCase().includes(query) ||
        b.name.toLowerCase().includes(query) ||
        b.address.toLowerCase().includes(query) ||
        (b.area ? b.area.toLowerCase().includes(query) : false)
    );

    if (!matchedBranch) {
      if (query.includes('bowenpally') || query.includes('secunderabad')) {
        matchedBranch = FABRIQ_BRANCHES.find((b) => b.id === 'b-hyd-bowenpally') || FABRIQ_BRANCHES[0];
      } else if (query.includes('suchitra')) {
        matchedBranch = FABRIQ_BRANCHES.find((b) => b.id === 'b-hyd-suchitra') || FABRIQ_BRANCHES[0];
      } else if (query.includes('kompally')) {
        matchedBranch = FABRIQ_BRANCHES.find((b) => b.id === 'b-hyd-kompally') || FABRIQ_BRANCHES[0];
      } else if (query.includes('bangalore') || query.includes('bengaluru') || query.includes('indiranagar')) {
        matchedBranch = FABRIQ_BRANCHES.find((b) => b.city === 'Bangalore') || FABRIQ_BRANCHES[0];
      } else if (query.includes('london') || query.includes('mayfair') || query.includes('uk') || query.includes('kensington')) {
        matchedBranch = FABRIQ_BRANCHES.find((b) => b.city === 'London') || FABRIQ_BRANCHES[0];
      } else {
        matchedBranch = FABRIQ_BRANCHES.find((b) => b.city === 'Hyderabad') || FABRIQ_BRANCHES[0];
      }
    }

    setActiveBranch(matchedBranch);
    setGpsDetectedName(`📍 Location Set: ${locationQuery} (${matchedBranch.name})`);
    localStorage.setItem('fabriq_custom_location', locationQuery);
  };

  useEffect(() => {
    // Auto detect GPS on initial app launch if no saved preference exists
    const savedCustom = localStorage.getItem('fabriq_custom_location');
    if (savedCustom) {
      setCustomLocation(savedCustom);
    } else {
      const saved = localStorage.getItem('fabriq_active_branch_id');
      if (!saved) {
        detectGPSLocation();
      }
    }
  }, []);

  const requestNewBranch = (city: string) => {
    console.info(`Request registered for new FabriQ AI branch in: ${city}`);
  };

  return (
    <BranchContext.Provider
      value={{
        activeBranch,
        setActiveBranch,
        showBranchModal,
        setShowBranchModal,
        branches: FABRIQ_BRANCHES,
        requestNewBranch,
        detectGPSLocation,
        setCustomLocation,
        isDetectingGPS,
        gpsDetectedName,
        selectedCountry,
        setSelectedCountry,
        selectedCity,
        setSelectedCity,
      }}
    >
      {children}
    </BranchContext.Provider>
  );
};

export const useBranch = () => useContext(BranchContext);
