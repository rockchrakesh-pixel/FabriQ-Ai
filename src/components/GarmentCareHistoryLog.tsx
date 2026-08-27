import React, { useState, useEffect } from 'react';
import { ScreenId } from '../types';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { db, doc, getDoc, setDoc } from '../lib/firebase';
import { triggerHaptic } from '../lib/haptics';

export interface GarmentCareEntry {
  id: string;
  garmentName: string;
  category: 'suits' | 'sarees' | 'shirts' | 'winterwear' | 'ethnic' | 'shoes_bags' | 'other';
  fabricType: string; // e.g. 'Pure Mulberry Silk', 'Super 150s Italian Wool', '100% Cashmere'
  color: string;
  imageUrl: string;
  lastCleanedDate: string; // ISO date string e.g. '2026-08-10'
  cleaningCycleDays: number; // Recommended days between cleanings, e.g. 45
  totalCleaningsCount: number;
  careNotes: string; // Special notes e.g. 'Zero Starch, Hand-press Horn Buttons, Hydrocarbon Dry Clean'
  lastServiceType: string;
  rfidTagId?: string;
  preferredBranch?: string;
}

interface GarmentCareHistoryLogProps {
  onNavigate: (screen: ScreenId) => void;
  onBookGarmentCare?: (garment: GarmentCareEntry) => void;
}

const DEFAULT_PRESET_GARMENTS: GarmentCareEntry[] = [
  {
    id: 'garment-1',
    garmentName: 'Canali Midnight Navy Tuxedo (2-Piece)',
    category: 'suits',
    fabricType: 'Super 160s Italian Wool & Silk Lapel',
    color: 'Midnight Navy Blue',
    imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=600&auto=format&fit=crop',
    lastCleanedDate: '2026-08-04',
    cleaningCycleDays: 45,
    totalCleaningsCount: 6,
    careNotes: 'Hydrocarbon zero-odor dry clean only. Protect horn buttons. Hand-formed lapel roll at 140°C.',
    lastServiceType: 'Signature Hydrocarbon Dry Clean',
    rfidTagId: 'RFID-CNL-8821',
    preferredBranch: 'Jubilee Hills Atelier',
  },
  {
    id: 'garment-2',
    garmentName: 'Kanchipuram Crimson & Gold Brocade Saree',
    category: 'sarees',
    fabricType: 'Pure Mulberry Silk & Zari Weave',
    color: 'Crimson Red / Antique Gold',
    imageUrl: '/src/assets/images/premium_saree_care_1785808836511.png',
    lastCleanedDate: '2026-07-15',
    cleaningCycleDays: 30,
    totalCleaningsCount: 4,
    careNotes: 'Delicate silk care solvent. Special roll-finishing to preserve pure metallic zari border without folding.',
    lastServiceType: 'Bespoke Saree Dry Clean & Roll Press',
    rfidTagId: 'RFID-KNC-4409',
    preferredBranch: 'Banjara Hills Studio',
  },
  {
    id: 'garment-3',
    garmentName: 'Loro Piana Cashmere Knit Cardigan',
    category: 'winterwear',
    fabricType: '100% Mongolian Cashmere',
    color: 'Camel Tan',
    imageUrl: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=600&auto=format&fit=crop',
    lastCleanedDate: '2026-08-14',
    cleaningCycleDays: 60,
    totalCleaningsCount: 3,
    careNotes: 'Gentle wool wash with anti-pilling conditioning. Flat horizontal drying. Zero spin tension.',
    lastServiceType: 'Cashmere Conditioning & Eco-Care',
    rfidTagId: 'RFID-LRP-1192',
    preferredBranch: 'Gachibowli Lounge',
  },
  {
    id: 'garment-4',
    garmentName: 'Giza Egyptian Cotton French-Cuff Shirt',
    category: 'shirts',
    fabricType: '200/2 Giza Egyptian Long-Staple Cotton',
    color: 'Crisp Alabaster White',
    imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=600&auto=format&fit=crop',
    lastCleanedDate: '2026-08-18',
    cleaningCycleDays: 14,
    totalCleaningsCount: 12,
    careNotes: 'Collar & cuff stay reinforcement. Light corn-starch. Italian vacuum steam press.',
    lastServiceType: 'Steam Vacuum Iron & Sanitization',
    rfidTagId: 'RFID-GZA-3390',
    preferredBranch: 'Suchitra Junction',
  },
];

export const GarmentCareHistoryLog: React.FC<GarmentCareHistoryLogProps> = ({
  onNavigate,
  onBookGarmentCare,
}) => {
  const { user, profile } = useAuth();
  const { sendNotification } = useNotifications();

  const [garments, setGarments] = useState<GarmentCareEntry[]>(() => {
    try {
      const saved = localStorage.getItem('fabriq_user_garment_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return DEFAULT_PRESET_GARMENTS;
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGarment, setSelectedGarment] = useState<GarmentCareEntry | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  // New Garment Form State
  const [newGarment, setNewGarment] = useState<Partial<GarmentCareEntry>>({
    garmentName: '',
    category: 'suits',
    fabricType: 'Pure Egyptian Cotton',
    color: 'Navy Blue',
    imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=600&auto=format&fit=crop',
    lastCleanedDate: new Date().toISOString().split('T')[0],
    cleaningCycleDays: 30,
    totalCleaningsCount: 1,
    careNotes: 'Hydrocarbon zero-odor cleaning, gentle vacuum steam pressing.',
    lastServiceType: 'Dry Cleaning',
  });

  // Sync with Firestore on mount
  useEffect(() => {
    const fetchHistoryFromFirestore = async () => {
      const userId = user?.uid || profile?.id || 'customer_demo_uid';
      try {
        const docRef = doc(db, 'user_garment_history', userId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          if (data && Array.isArray(data.garments) && data.garments.length > 0) {
            setGarments(data.garments);
            localStorage.setItem('fabriq_user_garment_history', JSON.stringify(data.garments));
          }
        }
      } catch (err) {
        console.warn('Firestore garment history sync error, using local state:', err);
      }
    };
    fetchHistoryFromFirestore();
  }, [user, profile]);

  // Persist changes
  const saveGarmentsToStore = async (updated: GarmentCareEntry[]) => {
    setGarments(updated);
    try {
      localStorage.setItem('fabriq_user_garment_history', JSON.stringify(updated));
      const userId = user?.uid || profile?.id || 'customer_demo_uid';
      const docRef = doc(db, 'user_garment_history', userId);
      await setDoc(docRef, { garments: updated, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (err) {
      console.warn('Firestore save fallback:', err);
    }
  };

  // Photo Upload Handler (Supports both file input and camera upload)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setNewGarment((prev) => ({ ...prev, imageUrl: reader.result as string }));
          triggerHaptic('light');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateGarment = () => {
    if (!newGarment.garmentName) {
      alert('Please enter a garment title.');
      return;
    }

    const created: GarmentCareEntry = {
      id: `garment-${Date.now()}`,
      garmentName: newGarment.garmentName,
      category: (newGarment.category as any) || 'suits',
      fabricType: newGarment.fabricType || 'Premium Fabric',
      color: newGarment.color || 'Custom',
      imageUrl:
        newGarment.imageUrl ||
        'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=600&auto=format&fit=crop',
      lastCleanedDate: newGarment.lastCleanedDate || new Date().toISOString().split('T')[0],
      cleaningCycleDays: Number(newGarment.cleaningCycleDays) || 30,
      totalCleaningsCount: Number(newGarment.totalCleaningsCount) || 1,
      careNotes: newGarment.careNotes || 'Standard luxury fabric care treatment.',
      lastServiceType: newGarment.lastServiceType || 'Dry Cleaning & Steam Press',
      rfidTagId: `RFID-FBQ-${Math.floor(1000 + Math.random() * 9000)}`,
      preferredBranch: 'Flagship Atelier',
    };

    const next = [created, ...garments];
    saveGarmentsToStore(next);
    setIsAddModalOpen(false);
    triggerHaptic('medium');
    sendNotification(
      'Garment Logged in Wardrobe',
      `"${created.garmentName}" added with care notes & RFID tag #${created.rfidTagId}.`,
      'system'
    );
  };

  const handleUpdateLastCleanedToday = (garmentId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const updated = garments.map((g) => {
      if (g.id === garmentId) {
        return {
          ...g,
          lastCleanedDate: today,
          totalCleaningsCount: g.totalCleaningsCount + 1,
        };
      }
      return g;
    });
    saveGarmentsToStore(updated);
    triggerHaptic('medium');
    sendNotification('Care Date Updated', 'Marked garment as cleaned today.', 'system');
  };

  const handleDeleteGarment = (garmentId: string) => {
    if (confirm('Are you sure you want to remove this garment from your Care History log?')) {
      const next = garments.filter((g) => g.id !== garmentId);
      saveGarmentsToStore(next);
      setSelectedGarment(null);
      triggerHaptic('light');
    }
  };

  const handleBookCare = (g: GarmentCareEntry) => {
    triggerHaptic('medium');
    if (onBookGarmentCare) {
      onBookGarmentCare(g);
    } else {
      // Add garment as item into cart
      const cartItem = {
        id: `cart-history-${Date.now()}`,
        garmentName: g.garmentName,
        service: g.lastServiceType.includes('Dry Clean') ? 'Dry Cleaning' : 'Premium Care',
        price: 249,
        qty: 1,
        image: g.imageUrl,
      };
      try {
        const saved = localStorage.getItem('fabriq_cart_items');
        let current = saved ? JSON.parse(saved) : [];
        if (!Array.isArray(current)) current = [];
        current.unshift(cartItem);
        localStorage.setItem('fabriq_cart_items', JSON.stringify(current));
        sendNotification('Garment Added to Cart', `Scheduled valet care for ${g.garmentName}.`, 'system');
        onNavigate('cart');
      } catch {
        onNavigate('cart');
      }
    }
  };

  // Helper: Calculate days since last cleaning
  const getDaysSinceLastCleaning = (dateStr: string): number => {
    try {
      const last = new Date(dateStr).getTime();
      const now = new Date().getTime();
      const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));
      return Math.max(0, diffDays);
    } catch {
      return 0;
    }
  };

  // Filtered Garments
  const filteredGarments = garments.filter((g) => {
    const matchCategory = selectedCategory === 'all' || g.category === selectedCategory;
    const matchSearch =
      g.garmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.fabricType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.careNotes.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="w-full space-y-5 font-sans">
      {/* Top Banner & Action */}
      <div className="bg-gradient-to-br from-[#0B1528] via-[#111C30] to-[#1C2C4E] rounded-3xl p-5 sm:p-6 text-white border-2 border-[#C29C6D]/40 shadow-xl relative overflow-hidden">
        {/* Subtle Ambient Gold Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#C29C6D]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="material-symbols-outlined text-[#E5C07B] text-[20px]">inventory_2</span>
              <span className="text-[10px] sm:text-xs font-black text-[#E5C07B] uppercase tracking-[0.25em]">
                DIGITAL WARDROBE & FABRIC PASSPORT
              </span>
            </div>
            <h2 className="font-['Libre_Caslon_Text',serif] text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Garment Care History Log
            </h2>
            <p className="text-xs text-slate-300 font-medium mt-1 max-w-lg leading-relaxed">
              Upload garment photos, track cleaning intervals, view RFID tags, and maintain professional fabric treatment notes.
            </p>
          </div>

          <button
            onClick={() => {
              triggerHaptic('light');
              setIsAddModalOpen(true);
            }}
            className="btn-press px-4 py-3 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#C29C6D] hover:opacity-95 text-[#0B1528] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg cursor-pointer shrink-0 border border-amber-200"
          >
            <span className="material-symbols-outlined text-[18px]">add_a_photo</span>
            <span>Log New Garment</span>
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 pt-4 border-t border-white/10 text-center">
          <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <span className="text-xs text-slate-400 font-semibold block">Registered Items</span>
            <span className="font-['Libre_Caslon_Text',serif] text-xl font-bold text-white block mt-0.5">
              {garments.length}
            </span>
          </div>
          <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <span className="text-xs text-slate-400 font-semibold block">Care Cycles Done</span>
            <span className="font-['Libre_Caslon_Text',serif] text-xl font-bold text-[#E5C07B] block mt-0.5">
              {garments.reduce((acc, g) => acc + g.totalCleaningsCount, 0)}
            </span>
          </div>
          <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <span className="text-xs text-slate-400 font-semibold block">Due for Refresh</span>
            <span className="font-['Libre_Caslon_Text',serif] text-xl font-bold text-amber-300 block mt-0.5">
              {garments.filter((g) => getDaysSinceLastCleaning(g.lastCleanedDate) >= g.cleaningCycleDays).length}
            </span>
          </div>
          <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <span className="text-xs text-slate-400 font-semibold block">RFID Verified</span>
            <span className="font-['Libre_Caslon_Text',serif] text-xl font-bold text-emerald-400 block mt-0.5">
              100%
            </span>
          </div>
        </div>
      </div>

      {/* Search & Category Filter Tabs */}
      <div className="space-y-3">
        {/* Search Bar */}
        <div className="relative w-full">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search garments by name, fabric (e.g. Silk, Cashmere, Wool) or notes..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#0E1726] border-2 border-[#E5DDD2] dark:border-[#1F2D48] focus:border-[#C29C6D] dark:focus:border-[#C29C6D] rounded-2xl text-xs text-[#0B1528] dark:text-white placeholder-slate-400 outline-none shadow-2xs transition-colors font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: 'all', label: 'All Garments', icon: 'checkroom' },
            { id: 'suits', label: 'Suits & Blazers', icon: 'man' },
            { id: 'sarees', label: 'Sarees & Silks', icon: 'woman' },
            { id: 'shirts', label: 'Shirts & Tops', icon: 'dry_cleaning' },
            { id: 'winterwear', label: 'Cashmere & Coats', icon: 'ac_unit' },
            { id: 'shoes_bags', label: 'Shoes & Leather', icon: 'shopping_bag' },
          ].map((tab) => {
            const isSelected = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  triggerHaptic('light');
                  setSelectedCategory(tab.id);
                }}
                className={`btn-press px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#0B1528] dark:bg-[#C29C6D] text-[#E5C07B] dark:text-[#0B1528] border border-[#C29C6D] shadow-xs'
                    : 'bg-white dark:bg-[#0E1726] text-slate-700 dark:text-slate-300 border border-[#E5DDD2] dark:border-[#1F2D48] hover:border-[#C29C6D]'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Garments Grid */}
      {filteredGarments.length === 0 ? (
        <div className="bg-white dark:bg-[#0E1726] rounded-3xl p-8 text-center border-2 border-dashed border-[#E5DDD2] dark:border-[#1F2D48] space-y-3">
          <span className="material-symbols-outlined text-4xl text-[#C29C6D]">inventory</span>
          <h3 className="font-['Libre_Caslon_Text',serif] text-lg font-bold text-[#0B1528] dark:text-white">
            No garments match your filter
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Take a photo or upload an image to start tracking your wardrobe's professional care history.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-press px-4 py-2 bg-[#0B1528] text-[#E5C07B] rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs border border-[#C29C6D]"
          >
            <span className="material-symbols-outlined text-[16px]">add_a_photo</span>
            <span>Add First Garment</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGarments.map((item) => {
            const daysSince = getDaysSinceLastCleaning(item.lastCleanedDate);
            const isDue = daysSince >= item.cleaningCycleDays;

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-[#0E1726] rounded-3xl p-4 sm:p-5 border-2 border-[#E5DDD2] dark:border-[#1F2D48] hover:border-[#C29C6D] transition-all shadow-xs hover:shadow-md flex flex-col justify-between group relative overflow-hidden"
              >
                <div>
                  {/* Image & Badges */}
                  <div className="relative h-48 w-full rounded-2xl overflow-hidden mb-3.5 bg-slate-100 dark:bg-slate-900">
                    <img
                      src={item.imageUrl}
                      alt={item.garmentName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Status Pill */}
                    <span
                      className={`absolute top-2.5 left-2.5 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs backdrop-blur-xs flex items-center gap-1 border ${
                        isDue
                          ? 'bg-amber-500/90 text-slate-950 border-amber-300 animate-pulse'
                          : 'bg-emerald-600/90 text-white border-emerald-300'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[12px]">
                        {isDue ? 'warning' : 'check_circle'}
                      </span>
                      <span>{isDue ? 'Care Refresh Due' : 'Pristine Condition'}</span>
                    </span>

                    {/* RFID Tag Badge */}
                    {item.rfidTagId && (
                      <span className="absolute top-2.5 right-2.5 bg-[#0B1528]/85 text-[#E5C07B] border border-[#C29C6D]/40 text-[9px] font-mono font-bold px-2 py-0.5 rounded-lg shadow-xs backdrop-blur-xs">
                        {item.rfidTagId}
                      </span>
                    )}

                    {/* Last Cleaned Date Badge */}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white text-[10px] font-semibold">
                      <span className="bg-black/60 px-2 py-0.5 rounded-lg backdrop-blur-xs flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px] text-[#E5C07B]">history</span>
                        <span>Cleaned {daysSince === 0 ? 'Today' : `${daysSince} days ago`}</span>
                      </span>
                      <span className="bg-black/60 px-2 py-0.5 rounded-lg backdrop-blur-xs">
                        {item.totalCleaningsCount} Cycles Logged
                      </span>
                    </div>
                  </div>

                  {/* Title and Fabric Spec */}
                  <div className="space-y-1">
                    <h3 className="font-['Libre_Caslon_Text',serif] text-base font-bold text-[#0B1528] dark:text-white leading-snug">
                      {item.garmentName}
                    </h3>
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#83633B] dark:text-[#E5C07B]">
                      <span>{item.fabricType}</span>
                      <span>•</span>
                      <span className="text-slate-500 dark:text-slate-400 font-normal">{item.color}</span>
                    </div>
                  </div>

                  {/* Professional Care Instructions Note Box */}
                  <div className="mt-3 p-3 rounded-xl bg-amber-50/70 dark:bg-[#152033] border border-[#C29C6D]/40 dark:border-[#C29C6D]/30 space-y-1">
                    <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[#83633B] dark:text-[#E5C07B]">
                      <span className="material-symbols-outlined text-[13px]">verified</span>
                      <span>PROFESSIONAL CARE NOTES</span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                      {item.careNotes}
                    </p>
                  </div>
                </div>

                {/* Actions Row */}
                <div className="mt-4 pt-3 border-t border-[#E5DDD2] dark:border-[#1F2D48] flex items-center gap-2">
                  <button
                    onClick={() => handleBookCare(item)}
                    className="btn-press flex-1 py-2.5 bg-[#0B1528] hover:bg-[#13264D] text-[#E5C07B] dark:bg-[#C29C6D] dark:text-[#0B1528] font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer border border-[#C29C6D]/60"
                  >
                    <span className="material-symbols-outlined text-[16px]">dry_cleaning</span>
                    <span>Book Care</span>
                  </button>

                  <button
                    onClick={() => handleUpdateLastCleanedToday(item.id)}
                    className="btn-press p-2.5 rounded-xl bg-white dark:bg-[#111C30] text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 cursor-pointer text-xs font-bold"
                    title="Mark Cleaned Today"
                  >
                    <span className="material-symbols-outlined text-[18px]">done_all</span>
                  </button>

                  <button
                    onClick={() => handleDeleteGarment(item.id)}
                    className="btn-press p-2.5 rounded-xl bg-white dark:bg-[#111C30] text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer text-xs font-bold"
                    title="Delete Garment Log"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / UPLOAD NEW GARMENT WITH CARE SPECIFICATIONS */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#0E1726] text-[#0B1528] dark:text-white rounded-3xl shadow-2xl border-2 border-[#C29C6D] overflow-hidden my-8 animate-scaleUp">
            {/* Modal Header */}
            <div className="bg-[#0B1528] text-white p-4 px-6 flex items-center justify-between border-b border-[#C29C6D]/30">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#E5C07B]">add_a_photo</span>
                <div>
                  <h3 className="font-['Libre_Caslon_Text',serif] text-base font-bold text-white">
                    Log Garment in Care History
                  </h3>
                  <p className="text-[10px] text-slate-300 font-semibold uppercase tracking-wider">
                    Capture Photo & Professional Fabric Specs
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Photo Upload & Preview Section */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                  Garment Photo (Take with Camera or Upload)
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 border-2 border-[#C29C6D] shrink-0 relative">
                    <img
                      src={newGarment.imageUrl}
                      alt="Garment Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="btn-press cursor-pointer px-4 py-2 bg-[#0B1528] text-[#E5C07B] border border-[#C29C6D] rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-xs">
                      <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                      <span>Take / Upload Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[10px] text-slate-500 font-medium">
                      High-resolution photos allow our master tailors & fabric curators to tag exact seams.
                    </p>
                  </div>
                </div>
              </div>

              {/* Garment Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Garment Name / Brand
                </label>
                <input
                  type="text"
                  value={newGarment.garmentName || ''}
                  onChange={(e) => setNewGarment({ ...newGarment, garmentName: e.target.value })}
                  placeholder="e.g. Brioni Cashmere Blazer, Raw Mango Silk Saree"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#152033] border border-[#E5DDD2] dark:border-[#1F2D48] rounded-xl text-xs font-medium text-[#0B1528] dark:text-white outline-none focus:border-[#C29C6D]"
                />
              </div>

              {/* Category & Fabric Type Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Category
                  </label>
                  <select
                    value={newGarment.category}
                    onChange={(e) => setNewGarment({ ...newGarment, category: e.target.value as any })}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#152033] border border-[#E5DDD2] dark:border-[#1F2D48] rounded-xl text-xs font-medium text-[#0B1528] dark:text-white outline-none focus:border-[#C29C6D]"
                  >
                    <option value="suits">Suits & Blazers</option>
                    <option value="sarees">Sarees & Silks</option>
                    <option value="shirts">Shirts & Tops</option>
                    <option value="winterwear">Cashmere & Coats</option>
                    <option value="ethnic">Ethnic & Bridal</option>
                    <option value="shoes_bags">Shoes & Leather</option>
                    <option value="other">Other Garments</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Fabric Composition
                  </label>
                  <input
                    type="text"
                    value={newGarment.fabricType || ''}
                    onChange={(e) => setNewGarment({ ...newGarment, fabricType: e.target.value })}
                    placeholder="e.g. 100% Cashmere, Mulberry Silk"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#152033] border border-[#E5DDD2] dark:border-[#1F2D48] rounded-xl text-xs font-medium text-[#0B1528] dark:text-white outline-none focus:border-[#C29C6D]"
                  />
                </div>
              </div>

              {/* Last Cleaned Date & Recommended Cycle */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Last Cleaned Date
                  </label>
                  <input
                    type="date"
                    value={newGarment.lastCleanedDate || ''}
                    onChange={(e) => setNewGarment({ ...newGarment, lastCleanedDate: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#152033] border border-[#E5DDD2] dark:border-[#1F2D48] rounded-xl text-xs font-medium text-[#0B1528] dark:text-white outline-none focus:border-[#C29C6D]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Refresh Interval (Days)
                  </label>
                  <input
                    type="number"
                    value={newGarment.cleaningCycleDays || 30}
                    onChange={(e) =>
                      setNewGarment({ ...newGarment, cleaningCycleDays: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#152033] border border-[#E5DDD2] dark:border-[#1F2D48] rounded-xl text-xs font-medium text-[#0B1528] dark:text-white outline-none focus:border-[#C29C6D]"
                  />
                </div>
              </div>

              {/* Professional Care Notes */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Professional Care & Handling Notes
                </label>
                <textarea
                  rows={3}
                  value={newGarment.careNotes || ''}
                  onChange={(e) => setNewGarment({ ...newGarment, careNotes: e.target.value })}
                  placeholder="e.g. Zero Starch, Hydrocarbon dry clean only, protect mother-of-pearl buttons..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#152033] border border-[#E5DDD2] dark:border-[#1F2D48] rounded-xl text-xs font-medium text-[#0B1528] dark:text-white outline-none focus:border-[#C29C6D]"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  onClick={handleCreateGarment}
                  className="btn-press w-full py-3 bg-gradient-to-r from-[#D4AF37] to-[#C29C6D] text-[#0B1528] rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer border border-amber-200"
                >
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  <span>Save to Garment Care Passport</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
