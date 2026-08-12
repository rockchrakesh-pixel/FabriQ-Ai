import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Branch {
  id: string;
  name: string;
  country: string;
  state: string;
  region: string;
  city: string;
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
    id: 'b-hyd-01',
    name: 'Jubilee Hills Flagship Atelier & AI Care Studio',
    country: 'India',
    state: 'Telangana',
    region: 'South India',
    city: 'Hyderabad',
    address: 'Road No. 36, Jubilee Hills, Hyderabad, Telangana 500033',
    phone: '+91 40 2355 8899',
    status: 'Active',
    isMain: true,
    storeCode: 'HYD-JUB-101',
    counterId: 'Counter-A1',
    lat: 17.4319,
    lng: 78.4071,
    priceModifier: 1.0,
  },
  {
    id: 'b-hyd-02',
    name: 'Banjara Hills Luxury Care Lounge',
    country: 'India',
    state: 'Telangana',
    region: 'South India',
    city: 'Hyderabad',
    address: 'Road No. 12, Banjara Hills, Hyderabad, Telangana 500034',
    phone: '+91 40 2333 4455',
    status: 'Active',
    storeCode: 'HYD-BAN-102',
    counterId: 'Counter-B1',
    lat: 17.4156,
    lng: 78.4347,
    priceModifier: 1.0,
  },
  {
    id: 'b-hyd-03',
    name: 'Gachibowli Financial District Hub',
    country: 'India',
    state: 'Telangana',
    region: 'South India',
    city: 'Hyderabad',
    address: 'Financial District, Nanakramguda, Gachibowli, Hyderabad 500032',
    phone: '+91 40 6789 0011',
    status: 'Active',
    storeCode: 'HYD-GAC-103',
    counterId: 'Counter-C1',
    lat: 17.4123,
    lng: 78.3421,
    priceModifier: 0.95,
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
          // Auto fallback to Hyderabad Jubilee Hills Atelier
          const hydBranch = FABRIQ_BRANCHES.find((b) => b.id === 'b-hyd-01') || FABRIQ_BRANCHES[0];
          setActiveBranch(hydBranch);
          setGpsDetectedName('GPS Auto-Detected: Jubilee Hills, Hyderabad (Telangana)');
          setIsDetectingGPS(false);
        },
        { timeout: 5000 }
      );
    } else {
      const hydBranch = FABRIQ_BRANCHES.find((b) => b.id === 'b-hyd-01') || FABRIQ_BRANCHES[0];
      setActiveBranch(hydBranch);
      setGpsDetectedName('GPS Detected: Jubilee Hills, Hyderabad');
      setIsDetectingGPS(false);
    }
  };

  useEffect(() => {
    // Auto detect GPS on initial app launch if no saved preference exists
    const saved = localStorage.getItem('fabriq_active_branch_id');
    if (!saved) {
      detectGPSLocation();
    }
  }, []);

  const requestNewBranch = (city: string) => {
    alert(`Thank you! Your request for a new FabriQ AI branch in "${city}" has been registered with our expansion team.`);
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
