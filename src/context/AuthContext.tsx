import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  auth, 
  db, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  serverTimestamp,
  User 
} from '../lib/firebase';
import { MfaVerificationModal } from '../components/MfaVerificationModal';
import { UserProfile, UserRole } from '../types';

export const ROLE_PROFILES: Record<UserRole, UserProfile> = {
  customer: {
    name: 'CH Rakesh',
    email: 'rakesh.ch@fabriq.ai',
    phone: '+91 98765 43210',
    tier: 'Prestige VIP Member',
    credits: 12,
    garmentsSaved: 48,
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop',
    address: 'Road No. 36, Jubilee Hills, Hyderabad',
    pickupTime: 'Today, 2:00 PM - 4:00 PM',
    role: 'customer',
    storeLocation: 'Jubilee Hills Atelier',
  },
  pickup_executive: {
    name: 'Suresh Varma',
    email: 'suresh.pickup@fabriq.ai',
    phone: '+91 98222 11001',
    tier: 'Senior Pickup Captain',
    credits: 50,
    garmentsSaved: 820,
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
    address: 'Hyderguda Logistics Fleet Depot',
    pickupTime: 'Active Express Route #04',
    role: 'pickup_executive',
    storeLocation: 'Hyderabad Central Logistics',
  },
  delivery_executive: {
    name: 'Ramesh Naidu',
    email: 'ramesh.delivery@fabriq.ai',
    phone: '+91 98333 22112',
    tier: 'Express Delivery Specialist',
    credits: 45,
    garmentsSaved: 910,
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=200&auto=format&fit=crop',
    address: 'Banjara Hills Express Hub',
    pickupTime: 'On Delivery Route #08',
    role: 'delivery_executive',
    storeLocation: 'Banjara Hills Lounge',
  },
  store_staff: {
    name: 'Kavitha Rao',
    email: 'kavitha.staff@fabriq.ai',
    phone: '+91 98444 33223',
    tier: 'Front-Desk Specialist & Garment Tagging',
    credits: 80,
    garmentsSaved: 1250,
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
    address: 'Jubilee Hills Front Desk Suite',
    pickupTime: 'Counter Shift 1',
    role: 'store_staff',
    storeLocation: 'Jubilee Hills Store #101',
  },
  quality_inspector: {
    name: 'Master Tailor Mohan',
    email: 'mohan.qc@fabriq.ai',
    phone: '+91 98555 44334',
    tier: 'Chief Garment & Silk Quality Inspector',
    credits: 150,
    garmentsSaved: 3400,
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop',
    address: 'FabriQ AI Hydrocarbon Studio Lab',
    pickupTime: 'Inspection Shift Active',
    role: 'quality_inspector',
    storeLocation: 'Hyderabad Central AI Studio',
  },
  store_manager: {
    name: 'Rajesh Kumar',
    email: 'rajesh.manager@fabriq.ai',
    phone: '+91 98123 45678',
    tier: 'Senior Store Manager',
    credits: 100,
    garmentsSaved: 1420,
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop',
    address: 'FabriQ Store #01, Jubilee Hills',
    pickupTime: 'On Duty (Shift 1)',
    role: 'store_manager',
    storeLocation: 'Jubilee Hills Flagship #101',
  },
  area_manager: {
    name: 'Arjun Reddy',
    email: 'arjun.area@fabriq.ai',
    phone: '+91 98666 55445',
    tier: 'Area Operations Manager (West Hyd)',
    credits: 200,
    garmentsSaved: 4800,
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200&auto=format&fit=crop',
    address: 'Gachibowli Area Command',
    pickupTime: '4 Stores Overseen',
    role: 'area_manager',
    storeLocation: 'Hyderabad West Cluster',
  },
  regional_manager: {
    name: 'Deepak Choudhury',
    email: 'deepak.regional@fabriq.ai',
    phone: '+91 98777 66556',
    tier: 'Regional Director - South India',
    credits: 350,
    garmentsSaved: 12000,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
    address: 'South India Regional HQ, HITEC City',
    pickupTime: '12 Stores Region Overseen',
    role: 'regional_manager',
    storeLocation: 'South India Region (Telangana & Karnataka)',
  },
  mis: {
    name: 'Priya Nair',
    email: 'priya.mis@fabriq.ai',
    phone: '+91 97111 22334',
    tier: 'Head of MIS & Analytics',
    credits: 250,
    garmentsSaved: 12000,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
    address: 'Data Operations Hub, Server Suite 4',
    pickupTime: 'Continuous Pipeline Live',
    role: 'mis',
    storeLocation: 'Database & MIS Data Pipeline',
  },
  finance: {
    name: 'Sunil Mehta, CA',
    email: 'sunil.finance@fabriq.ai',
    phone: '+91 98888 77667',
    tier: 'Chief Financial Controller & GST Lead',
    credits: 300,
    garmentsSaved: 8500,
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop',
    address: 'Finance & GST Audit Division',
    pickupTime: 'Audit Cycle Open',
    role: 'finance',
    storeLocation: 'Enterprise Finance Unit',
  },
  inventory: {
    name: 'Lakshmi Narayana',
    email: 'lakshmi.inventory@fabriq.ai',
    phone: '+91 98999 88778',
    tier: 'Supply Chain & Detergent Stock Lead',
    credits: 180,
    garmentsSaved: 6200,
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop',
    address: 'Central Chemical Warehouse, Jeedimetla',
    pickupTime: 'Stock Replenishment Active',
    role: 'inventory',
    storeLocation: 'Central Eco-Detergent Warehouse',
  },
  franchise_owner: {
    name: 'Srikanth Raju',
    email: 'srikanth.franchise@fabriq.ai',
    phone: '+91 99111 00223',
    tier: 'Franchise Store Partner',
    credits: 400,
    garmentsSaved: 5400,
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=200&auto=format&fit=crop',
    address: 'Gachibowli Franchise Store #03',
    pickupTime: 'Franchise Yield Active',
    role: 'franchise_owner',
    storeLocation: 'Gachibowli Franchise Branch',
  },
  owner: {
    name: 'Vikramaditya Singhania',
    email: 'vikram.owner@fabriq.ai',
    phone: '+91 99999 88888',
    tier: 'Franchise Store Owner',
    credits: 500,
    garmentsSaved: 8950,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    address: 'Singhania Luxury Holdings, Jubilee Hills',
    pickupTime: 'Multi-Store Overseer',
    role: 'owner',
    storeLocation: '5 Active Stores (Hyderabad & London)',
  },
  ceo: {
    name: 'Dr. Evelyn Vance',
    email: 'evelyn.ceo@fabriq.ai',
    phone: '+91 1800 202 0000',
    tier: 'Global CEO & Co-Founder',
    credits: 1000,
    garmentsSaved: 45000,
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop',
    address: 'FabriQ Ai HQ, Penthouse 50, Executive Tower',
    pickupTime: 'Global Command Center',
    role: 'ceo',
    storeLocation: 'Global HQ • Enterprise Wide',
  },
  super_admin: {
    name: 'System Super Admin',
    email: 'admin@fabriq.ai',
    phone: '+1 800 555 0199',
    tier: 'Root Platform Administrator',
    credits: 9999,
    garmentsSaved: 99999,
    avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop',
    address: 'Root Cloud Server Cluster #01',
    pickupTime: 'Full System Access',
    role: 'super_admin',
    storeLocation: 'All Global Nodes & Databases',
  },
};

export type MfaMethod = 'authenticator' | 'sms' | 'email';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  currentRole: UserRole;
  loading: boolean;
  mfaEnabled: boolean;
  mfaMethod: MfaMethod;
  mfaVerifiedSession: boolean;
  mfaModalOpen: boolean;
  mfaRecoveryCodes: string[];
  triggerMfaChallenge: (onSuccessCallback?: () => void) => void;
  closeMfaModal: () => void;
  toggleMfa: (enabled: boolean, method?: MfaMethod) => Promise<void>;
  generateNewRecoveryCodes: () => string[];
  switchRole: (role: UserRole) => void;
  signUp: (email: string, pass: string, name: string, phone?: string) => Promise<void>;
  login: (email: string, pass: string, role?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: ROLE_PROFILES.customer,
  currentRole: 'customer',
  loading: true,
  mfaEnabled: true,
  mfaMethod: 'sms',
  mfaVerifiedSession: false,
  mfaModalOpen: false,
  mfaRecoveryCodes: ['FABRIQ-8291-MFA', 'FABRIQ-4720-MFA', 'FABRIQ-9104-MFA', 'FABRIQ-3382-MFA'],
  triggerMfaChallenge: () => {},
  closeMfaModal: () => {},
  toggleMfa: async () => {},
  generateNewRecoveryCodes: () => [],
  switchRole: () => {},
  signUp: async () => {},
  login: async () => {},
  logout: async () => {},
  resetPassword: async () => {},
  updateProfileData: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole>('customer');
  const [profile, setProfile] = useState<UserProfile | null>(ROLE_PROFILES.customer);
  const [loading, setLoading] = useState<boolean>(true);

  // MFA State
  const [mfaEnabled, setMfaEnabled] = useState<boolean>(() => {
    return localStorage.getItem('fabriq_mfa_enabled') !== 'false';
  });
  const [mfaMethod, setMfaMethod] = useState<MfaMethod>(() => {
    return (localStorage.getItem('fabriq_mfa_method') as MfaMethod) || 'sms';
  });
  const [mfaVerifiedSession, setMfaVerifiedSession] = useState<boolean>(false);
  const [mfaModalOpen, setMfaModalOpen] = useState<boolean>(false);
  const [pendingMfaCallback, setPendingMfaCallback] = useState<(() => void) | null>(null);
  const [mfaRecoveryCodes, setMfaRecoveryCodes] = useState<string[]>([
    'FABRIQ-8291-MFA',
    'FABRIQ-4720-MFA',
    'FABRIQ-9104-MFA',
    'FABRIQ-3382-MFA',
    'FABRIQ-5912-MFA',
    'FABRIQ-7023-MFA',
  ]);

  const switchRole = (role: UserRole) => {
    setCurrentRole(role);
    setProfile(ROLE_PROFILES[role]);
  };

  const triggerMfaChallenge = (onSuccessCallback?: () => void) => {
    if (!mfaEnabled) {
      setMfaVerifiedSession(true);
      if (onSuccessCallback) onSuccessCallback();
      return;
    }
    setPendingMfaCallback(() => onSuccessCallback || null);
    setMfaModalOpen(true);
  };

  const handleMfaVerificationSuccess = () => {
    setMfaVerifiedSession(true);
    setMfaModalOpen(false);
    if (pendingMfaCallback) {
      pendingMfaCallback();
      setPendingMfaCallback(null);
    }
  };

  const closeMfaModal = () => {
    setMfaModalOpen(false);
    setPendingMfaCallback(null);
  };

  const toggleMfa = async (enabled: boolean, method?: MfaMethod) => {
    setMfaEnabled(enabled);
    localStorage.setItem('fabriq_mfa_enabled', enabled ? 'true' : 'false');
    if (method) {
      setMfaMethod(method);
      localStorage.setItem('fabriq_mfa_method', method);
    }
  };

  const generateNewRecoveryCodes = (): string[] => {
    const newCodes = Array.from({ length: 6 }, () => {
      const rand = Math.floor(1000 + Math.random() * 9000);
      return `FABRIQ-${rand}-MFA`;
    });
    setMfaRecoveryCodes(newCodes);
    return newCodes;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            setProfile(data);
            if (data.role) setCurrentRole(data.role);
          } else {
            const newProf: UserProfile = {
              ...ROLE_PROFILES[currentRole],
              name: currentUser.displayName || currentUser.email?.split('@')[0] || 'FabriQ Member',
              email: currentUser.email || '',
            };
            await setDoc(userDocRef, {
              ...newProf,
              createdAt: serverTimestamp(),
            });
            setProfile(newProf);
          }
        } catch (err) {
          console.error('Error fetching Firestore user profile:', err);
          setProfile(ROLE_PROFILES[currentRole]);
        }
      } else {
        setProfile(ROLE_PROFILES[currentRole]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentRole]);

  const signUp = async (email: string, pass: string, name: string, phone?: string) => {
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    const newProf: UserProfile = {
      ...ROLE_PROFILES.customer,
      name: name || 'Valued Member',
      email: email,
      phone: phone || '+91 98765 00000',
    };
    try {
      await setDoc(doc(db, 'users', res.user.uid), {
        ...newProf,
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      console.warn('Firestore user doc write error:', e);
    }
    setProfile(newProf);
  };

  const login = async (email: string, pass: string, role: UserRole = 'customer') => {
    switchRole(role);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (e) {
      // Local demo login fallback if Firebase user is mock
      console.warn('Logging in with demo profile:', e);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setMfaVerifiedSession(false);
    switchRole('customer');
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const updateProfileData = async (data: Partial<UserProfile>) => {
    if (!profile) return;
    const updated = { ...profile, ...data };
    setProfile(updated);
    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), data);
      } catch (e) {
        console.warn('Error updating Firestore user profile:', e);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        currentRole,
        loading,
        mfaEnabled,
        mfaMethod,
        mfaVerifiedSession,
        mfaModalOpen,
        mfaRecoveryCodes,
        triggerMfaChallenge,
        closeMfaModal,
        toggleMfa,
        generateNewRecoveryCodes,
        switchRole,
        signUp,
        login,
        logout,
        resetPassword,
        updateProfileData,
      }}
    >
      {children}
      <MfaVerificationModal
        isOpen={mfaModalOpen}
        onClose={closeMfaModal}
        onSuccess={handleMfaVerificationSuccess}
        userPhone={profile?.phone || '+91 98765 43210'}
        userEmail={profile?.email || 'ananya@fabriq.ai'}
        mfaMethod={mfaMethod}
      />
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

