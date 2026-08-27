import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AppDivision } from '../../types';
import { EnterpriseConfiguration } from '../EnterpriseConfiguration';

export interface LaundryServiceConfigItem {
  id: string;
  name: string;
  category: 'men' | 'women' | 'kids' | 'others';
  serviceType: 'Steam Iron' | 'Wash & Fold' | 'Wash & Iron' | 'Dry Cleaning' | 'Premium Cleaning' | 'Couture Care' | 'Specialty Care' | 'KG Care';
  treatment: string;
  price: number;
  taxRatePercent: number;
  turnaroundHours: number;
  minQuantity: number;
  unit: string;
  active: boolean;
  offerEligible: boolean;
  voucherEligible: boolean;
}

export interface BoutiqueConfigItem {
  id: string;
  name: string;
  category: 'Tailoring' | 'Custom Blouse' | 'Custom Wear' | 'Party Wear' | 'Festive Wear' | 'Bridal Couture' | 'Designer Wear' | 'Alterations' | 'Bespoke';
  description: string;
  basePrice: number;
  leadTimeDays: number;
  requiresFittingAppointment: boolean;
  active: boolean;
}

export interface RetailProductConfigItem {
  id: string;
  name: string;
  sku: string;
  gender: 'ALL' | 'MEN' | 'WOMEN' | 'KIDS' | 'OTHERS';
  category: 'Shirts' | 'T-Shirts' | 'Jeans' | 'Kurthas' | 'Shoes' | 'Accessories';
  price: number;
  sizes: string[];
  stockCount: number;
  inStock: boolean;
  onSale: boolean;
  active: boolean;
}

export interface OfferVoucherConfigItem {
  id: string;
  code: string;
  title: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  eligibleDivision: 'all' | AppDivision;
  eligibleCategory: string;
  startDate: string;
  endDate: string;
  usageLimit: number;
  currentUsages: number;
  active: boolean;
}

export interface MembershipTierConfigItem {
  id: string;
  name: string;
  price: number;
  durationMonths: number;
  discountPercent: number;
  freeExpressDeliveries: number;
  perks: string[];
  active: boolean;
}

const INITIAL_LAUNDRY_SERVICES: LaundryServiceConfigItem[] = [
  { id: 'LS-01', name: 'Executive Formal Shirt', category: 'men', serviceType: 'Steam Iron', treatment: 'Vacuum suction board & crisp collar shaping', price: 120, taxRatePercent: 18, turnaroundHours: 24, minQuantity: 1, unit: 'piece', active: true, offerEligible: true, voucherEligible: true },
  { id: 'LS-02', name: 'Italian 2-Piece Suit', category: 'men', serviceType: 'Dry Cleaning', treatment: 'Solvent hydrocarbon eco-care & hand finishing', price: 850, taxRatePercent: 18, turnaroundHours: 48, minQuantity: 1, unit: 'set', active: true, offerEligible: true, voucherEligible: true },
  { id: 'LS-03', name: 'Designer Silk Saree', category: 'women', serviceType: 'Couture Care', treatment: 'Cold-solvent bath, zari restoration & rolling', price: 950, taxRatePercent: 18, turnaroundHours: 72, minQuantity: 1, unit: 'piece', active: true, offerEligible: true, voucherEligible: true },
  { id: 'LS-04', name: 'Evening Gown / Lehenga', category: 'women', serviceType: 'Premium Cleaning', treatment: 'Delicate beadwork protection & steam revival', price: 1450, taxRatePercent: 18, turnaroundHours: 72, minQuantity: 1, unit: 'piece', active: true, offerEligible: false, voucherEligible: true },
  { id: 'LS-05', name: 'Kids Daily Wear Set', category: 'kids', serviceType: 'Wash & Fold', treatment: 'Hypoallergenic organic detergent wash', price: 180, taxRatePercent: 18, turnaroundHours: 24, minQuantity: 1, unit: 'set', active: true, offerEligible: true, voucherEligible: true },
  { id: 'LS-06', name: 'Household Quilt & Comforter', category: 'others', serviceType: 'Specialty Care', treatment: 'Thermal sanitization & anti-mite treatment', price: 750, taxRatePercent: 18, turnaroundHours: 48, minQuantity: 1, unit: 'piece', active: true, offerEligible: true, voucherEligible: true },
  { id: 'LS-07', name: 'Everyday Wash & Fold (By Weight)', category: 'others', serviceType: 'KG Care', treatment: 'Color-sorted wash, tumble dry & steam fold', price: 140, taxRatePercent: 18, turnaroundHours: 24, minQuantity: 3, unit: 'kg', active: true, offerEligible: true, voucherEligible: true },
];

const INITIAL_BOUTIQUE_SERVICES: BoutiqueConfigItem[] = [
  { id: 'BS-01', name: 'Custom Hand-Embroidered Blouse', category: 'Custom Blouse', description: '3D biometric scan, zari threadwork & bridal piping', basePrice: 2800, leadTimeDays: 5, requiresFittingAppointment: true, active: true },
  { id: 'BS-02', name: 'Bespoke 3-Piece Tuxedo', category: 'Bespoke', description: 'English wool, hand-canvassed lapels & custom lining', basePrice: 24500, leadTimeDays: 14, requiresFittingAppointment: true, active: true },
  { id: 'BS-03', name: 'Designer Anarkali & Festive Gown', category: 'Festive Wear', description: 'Raw silk flare, handcrafted tassels & precision hem', basePrice: 8500, leadTimeDays: 7, requiresFittingAppointment: true, active: true },
  { id: 'BS-04', name: 'Bridal Heritage Ensemble', category: 'Bridal Couture', description: 'Master artisan zari embroidery & heirloom fitting', basePrice: 48000, leadTimeDays: 21, requiresFittingAppointment: true, active: true },
  { id: 'BS-05', name: 'Precision Silhouette Alterations', category: 'Alterations', description: 'Waist tapering, sleeve adjustment & hem reshaping', basePrice: 650, leadTimeDays: 2, requiresFittingAppointment: false, active: true },
];

const INITIAL_RETAIL_PRODUCTS: RetailProductConfigItem[] = [
  { id: 'RP-01', name: 'Giza Royal Egyptian Cotton Shirt', sku: 'FBQ-SH-01', gender: 'MEN', category: 'Shirts', price: 4200, sizes: ['38', '40', '42', '44'], stockCount: 42, inStock: true, onSale: false, active: true },
  { id: 'RP-02', name: 'Japanese Selvedge Denim Trouser', sku: 'FBQ-JN-02', gender: 'MEN', category: 'Jeans', price: 6800, sizes: ['30', '32', '34', '36'], stockCount: 18, inStock: true, onSale: false, active: true },
  { id: 'RP-03', name: 'Pure Mulberry Silk Kurtha', sku: 'FBQ-KT-03', gender: 'WOMEN', category: 'Kurthas', price: 8900, sizes: ['S', 'M', 'L', 'XL'], stockCount: 25, inStock: true, onSale: true, active: true },
  { id: 'RP-04', name: 'Italian Hand-Polished Oxford Shoes', sku: 'FBQ-SH-04', gender: 'MEN', category: 'Shoes', price: 14500, sizes: ['7', '8', '9', '10', '11'], stockCount: 12, inStock: true, onSale: false, active: true },
  { id: 'RP-05', name: 'Heritage Kids Linen Festive Set', sku: 'FBQ-KD-05', gender: 'KIDS', category: 'Kurthas', price: 2900, sizes: ['2-3Y', '4-5Y', '6-7Y', '8-9Y'], stockCount: 30, inStock: true, onSale: false, active: true },
];

const INITIAL_OFFERS: OfferVoucherConfigItem[] = [
  { id: 'OV-01', code: 'FABRIQ50', title: '50% First Care Experience', discountType: 'percentage', discountValue: 50, minOrderValue: 499, eligibleDivision: 'all', eligibleCategory: 'All', startDate: '2026-08-01', endDate: '2026-12-31', usageLimit: 1000, currentUsages: 284, active: true },
  { id: 'OV-02', code: 'SUITCARE100', title: '₹100 Off Premium Suit Dry Cleaning', discountType: 'fixed', discountValue: 100, minOrderValue: 999, eligibleDivision: 'laundry', eligibleCategory: 'Dry Cleaning', startDate: '2026-08-01', endDate: '2026-09-30', usageLimit: 500, currentUsages: 112, active: true },
  { id: 'OV-03', code: 'VIPATELIER15', title: '15% Off Bespoke Tailoring & Fitting', discountType: 'percentage', discountValue: 15, minOrderValue: 2500, eligibleDivision: 'boutique', eligibleCategory: 'Tailoring', startDate: '2026-08-15', endDate: '2026-10-31', usageLimit: 300, currentUsages: 48, active: true },
];

const INITIAL_MEMBERSHIPS: MembershipTierConfigItem[] = [
  { id: 'MEM-01', name: 'Silver Garment Care Club', price: 2999, durationMonths: 6, discountPercent: 10, freeExpressDeliveries: 6, perks: ['10% Flat Laundry Discount', '6 Complimentary Priority Deliveries', 'Quarterly Garment Health Review'], active: true },
  { id: 'MEM-02', name: 'Gold Atelier Privilege', price: 5499, durationMonths: 12, discountPercent: 15, freeExpressDeliveries: 18, perks: ['15% Laundry & Boutique Discount', '18 Priority Doorstep Pickups', 'Free Zari Restoration on 1 Saree', 'Dedicated Concierge Line'], active: true },
  { id: 'MEM-03', name: 'Platinum Imperial Wardrobe', price: 9999, durationMonths: 12, discountPercent: 20, freeExpressDeliveries: 36, perks: ['20% Universal VIP Discount across 3 Divisions', 'Unlimited 4-Hour Express Pickups', 'Complimentary Bespoke Suit Fitting Session', 'Annual Garment Ozone Sanitization'], active: true },
];

export const BusinessConfigCenter: React.FC = () => {
  const { currentRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'brand' | 'matrix' | 'laundry' | 'boutique' | 'retail' | 'offers' | 'memberships'>('brand');
  
  // State for configs
  const [laundryServices, setLaundryServices] = useState<LaundryServiceConfigItem[]>(INITIAL_LAUNDRY_SERVICES);
  const [boutiqueServices, setBoutiqueServices] = useState<BoutiqueConfigItem[]>(INITIAL_BOUTIQUE_SERVICES);
  const [retailProducts, setRetailProducts] = useState<RetailProductConfigItem[]>(INITIAL_RETAIL_PRODUCTS);
  const [offers, setOffers] = useState<OfferVoucherConfigItem[]>(INITIAL_OFFERS);
  const [memberships, setMemberships] = useState<MembershipTierConfigItem[]>(INITIAL_MEMBERSHIPS);
  
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const handleToggleLaundry = (id: string) => {
    setLaundryServices(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
    showSaveToast('Laundry service availability updated.');
  };

  const handleToggleBoutique = (id: string) => {
    setBoutiqueServices(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
    showSaveToast('Boutique workflow configuration updated.');
  };

  const handleToggleRetail = (id: string) => {
    setRetailProducts(prev => prev.map(p => p.id === id ? { ...p, active: !p.active, inStock: !p.active } : p));
    showSaveToast('Luxury retail SKU status updated.');
  };

  const handleToggleOffer = (id: string) => {
    setOffers(prev => prev.map(o => o.id === id ? { ...o, active: !o.active } : o));
    showSaveToast('Promotional voucher rule updated.');
  };

  const handleToggleMembership = (id: string) => {
    setMemberships(prev => prev.map(m => m.id === id ? { ...m, active: !m.active } : m));
    showSaveToast('Membership tier status updated.');
  };

  const showSaveToast = (msg: string) => {
    setSaveStatus(msg);
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const isAuthorized = ['super_admin', 'ceo', 'owner', 'franchise_owner', 'store_manager'].includes(currentRole);
  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="bg-[#0B1528] border-2 border-[#C29C6D]/40 rounded-3xl p-6 text-[#FAF9F6] shadow-2xl space-y-6">
      {/* Header & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#C29C6D]/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-gradient-to-r from-[#D4AF37] to-[#C29C6D] text-[#0B1528] text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest">
              ADMIN CONTROL CENTER
            </span>
            <span className="text-[10px] text-[#E5C07B] font-extrabold font-mono">
              TENANT: ORG-FABRIQ-CORP
            </span>
          </div>
          <h2 className="font-['Libre_Caslon_Text',serif] text-xl sm:text-2xl font-bold text-[#FAF9F6] mt-1">
            Enterprise Business Configuration
          </h2>
          <p className="text-xs text-slate-300">
            Real-time configuration of brand parameters, multi-division catalogues, pricing rules, and VIP privileges.
          </p>
        </div>

        {saveStatus && (
          <div className="bg-emerald-950/80 border border-emerald-500 text-emerald-300 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 self-start animate-fade-in">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            <span>{saveStatus}</span>
          </div>
        )}
      </div>

      {/* Configuration Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: 'brand', label: '🏛️ Brand & Branches', icon: 'domain' },
          { id: 'matrix', label: '🏬 Scoped Branch & Turnaround Matrix', icon: 'tune' },
          { id: 'laundry', label: '🧺 Division 01: Laundry', icon: 'local_laundry_service' },
          { id: 'boutique', label: '✂️ Division 02: Boutique', icon: 'styler' },
          { id: 'retail', label: '👗 Division 03: Luxury Store', icon: 'storefront' },
          { id: 'offers', label: '🎟️ Offers & Vouchers', icon: 'confirmation_number' },
          { id: 'memberships', label: '👑 VIP Memberships', icon: 'workspace_premium' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 min-h-[44px] rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#C29C6D] text-[#0B1528] shadow-md scale-102'
                : 'bg-[#070F1E] text-slate-300 border border-[#C29C6D]/30 hover:border-[#D4AF37]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: BRAND & BRANCH CONFIGURATION */}
      {activeTab === 'brand' && (
        <div className="space-y-4">
          <div className="bg-[#070F1E] rounded-2xl p-4 border border-[#C29C6D]/30 space-y-3">
            <h3 className="font-['Libre_Caslon_Text',serif] text-base font-bold text-[#E5C07B] flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">verified</span>
              Master Brand & Divisions Architecture
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-[#0B1528] rounded-xl border border-[#C29C6D]/20">
                <span className="text-[9px] font-black text-[#E5C07B] uppercase block">DIVISION 01</span>
                <h4 className="text-xs font-bold text-white mt-0.5">FabriQ AI</h4>
                <p className="text-[11px] text-slate-300">Premium Laundry Powered by AI</p>
                <span className="mt-2 inline-block px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-600 rounded text-[9px] font-bold">OPERATIONAL</span>
              </div>

              <div className="p-3 bg-[#0B1528] rounded-xl border border-[#C29C6D]/20">
                <span className="text-[9px] font-black text-[#E5C07B] uppercase block">DIVISION 02</span>
                <h4 className="text-xs font-bold text-white mt-0.5">FabriQ Boutique</h4>
                <p className="text-[11px] text-slate-300">Luxury Boutique & Custom Wear</p>
                <span className="mt-2 inline-block px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-600 rounded text-[9px] font-bold">OPERATIONAL</span>
              </div>

              <div className="p-3 bg-[#0B1528] rounded-xl border border-[#C29C6D]/20">
                <span className="text-[9px] font-black text-[#E5C07B] uppercase block">DIVISION 03</span>
                <h4 className="text-xs font-bold text-white mt-0.5">FabriQ Luxury Cloth Store</h4>
                <p className="text-[11px] text-slate-300">Premium Clothing & Lifestyle Retail</p>
                <span className="mt-2 inline-block px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-600 rounded text-[9px] font-bold">OPERATIONAL</span>
              </div>
            </div>
          </div>

          {/* Branches & Service Radii */}
          <div className="bg-[#070F1E] rounded-2xl p-4 border border-[#C29C6D]/30 space-y-3">
            <h3 className="font-['Libre_Caslon_Text',serif] text-base font-bold text-[#E5C07B] flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">store</span>
              Active Branch Network & Operating Hours
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#0B1528] text-[#E5C07B] font-bold uppercase text-[10px] border-b border-[#C29C6D]/30">
                    <th className="p-3 rounded-l-xl">Branch Code</th>
                    <th className="p-3">Branch Location</th>
                    <th className="p-3">Operating Hours</th>
                    <th className="p-3">Delivery Service</th>
                    <th className="p-3">Express Turnaround</th>
                    <th className="p-3 rounded-r-xl">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#C29C6D]/10">
                  {[
                    { code: 'HYD-JUB-101', name: 'Jubilee Hills Flagship Atelier', hours: '08:00 AM – 09:00 PM', delivery: 'Doorstep Active (15km)', turnaround: '24–48 Hours', status: 'Online' },
                    { code: 'HYD-BAN-102', name: 'Banjara Hills Luxury Care', hours: '08:00 AM – 09:00 PM', delivery: 'Doorstep Active (12km)', turnaround: '24–48 Hours', status: 'Online' },
                    { code: 'HYD-GAC-103', name: 'Gachibowli Tech Financial Hub', hours: '07:30 AM – 09:30 PM', delivery: 'Doorstep Active (20km)', turnaround: '24–48 Hours', status: 'Online' },
                    { code: 'BLR-IND-201', name: 'Indiranagar 100ft Care Atelier', hours: '08:00 AM – 09:00 PM', delivery: 'Doorstep Active (15km)', turnaround: '24–48 Hours', status: 'Online' },
                    { code: 'LON-MAY-301', name: 'Mayfair Flagship Store (London)', hours: '09:00 AM – 07:00 PM', delivery: 'Concierge Valet (Zone 1)', turnaround: '24 Hours', status: 'Online' },
                  ].map((b, idx) => (
                    <tr key={idx} className="hover:bg-[#0B1528]/50">
                      <td className="p-3 font-mono font-bold text-[#E5C07B]">{b.code}</td>
                      <td className="p-3 font-bold text-white">{b.name}</td>
                      <td className="p-3 text-slate-300">{b.hours}</td>
                      <td className="p-3 text-emerald-400 font-medium">{b.delivery}</td>
                      <td className="p-3 text-slate-300">{b.turnaround}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-500 rounded-md text-[10px] font-bold">
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: SCOPED BRANCH & TURNAROUND MATRIX */}
      {activeTab === 'matrix' && (
        <div className="pt-2">
          <EnterpriseConfiguration />
        </div>
      )}

      {/* TAB 2: DIVISION 01 LAUNDRY SERVICE CONFIGURATION */}
      {activeTab === 'laundry' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300">
              Manage treatments, pricing, turnaround hours, and offer eligibility across MEN, WOMEN, KIDS, and OTHERS.
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#070F1E] text-[#E5C07B] font-bold uppercase text-[10px] border-b border-[#C29C6D]/30">
                  <th className="p-3 rounded-l-xl">Service ID</th>
                  <th className="p-3">Service Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Service Type</th>
                  <th className="p-3">Base Price</th>
                  <th className="p-3">GST Rate</th>
                  <th className="p-3">SLA Turnaround</th>
                  <th className="p-3">Offer Eligible</th>
                  <th className="p-3 rounded-r-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C29C6D]/10">
                {laundryServices.map((s) => (
                  <tr key={s.id} className="hover:bg-[#070F1E]/50">
                    <td className="p-3 font-mono font-bold text-[#E5C07B]">{s.id}</td>
                    <td className="p-3 font-bold text-white">
                      <div>{s.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{s.treatment}</div>
                    </td>
                    <td className="p-3 uppercase font-extrabold text-[10px] text-amber-300">{s.category}</td>
                    <td className="p-3 text-slate-300">{s.serviceType}</td>
                    <td className="p-3 font-bold text-[#FAF9F6]">₹{s.price} / {s.unit}</td>
                    <td className="p-3 text-slate-400">{s.taxRatePercent}% GST</td>
                    <td className="p-3 text-slate-300">{s.turnaroundHours}h</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${s.offerEligible ? 'bg-emerald-950 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                        {s.offerEligible ? 'YES' : 'NO'}
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleToggleLaundry(s.id)}
                        className={`px-3 py-1.5 min-h-[36px] rounded-xl text-[10px] font-bold cursor-pointer transition-all ${
                          s.active
                            ? 'bg-emerald-900/80 text-emerald-200 border border-emerald-500 hover:bg-rose-900/80 hover:text-rose-200'
                            : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-emerald-900/80 hover:text-emerald-200'
                        }`}
                      >
                        {s.active ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: DIVISION 02 BOUTIQUE CONFIGURATION */}
      {activeTab === 'boutique' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300">
              Configure master bespoke tailoring, custom wear, bridal couture, and fitting appointment rules.
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#070F1E] text-[#E5C07B] font-bold uppercase text-[10px] border-b border-[#C29C6D]/30">
                  <th className="p-3 rounded-l-xl">Service ID</th>
                  <th className="p-3">Service Name</th>
                  <th className="p-3">Boutique Category</th>
                  <th className="p-3">Base Price</th>
                  <th className="p-3">Lead Time</th>
                  <th className="p-3">Requires Fitting</th>
                  <th className="p-3 rounded-r-xl">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C29C6D]/10">
                {boutiqueServices.map((b) => (
                  <tr key={b.id} className="hover:bg-[#070F1E]/50">
                    <td className="p-3 font-mono font-bold text-[#E5C07B]">{b.id}</td>
                    <td className="p-3 font-bold text-white">
                      <div>{b.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{b.description}</div>
                    </td>
                    <td className="p-3 font-medium text-purple-300">{b.category}</td>
                    <td className="p-3 font-bold text-[#FAF9F6]">₹{b.basePrice.toLocaleString()}</td>
                    <td className="p-3 text-slate-300">{b.leadTimeDays} Days</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${b.requiresFittingAppointment ? 'bg-amber-950 text-amber-300 border border-amber-500' : 'bg-slate-800 text-slate-400'}`}>
                        {b.requiresFittingAppointment ? 'Mandatory' : 'Optional'}
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleToggleBoutique(b.id)}
                        className={`px-3 py-1.5 min-h-[36px] rounded-xl text-[10px] font-bold cursor-pointer transition-all ${
                          b.active
                            ? 'bg-emerald-900/80 text-emerald-200 border border-emerald-500'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {b.active ? 'Available' : 'Paused'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: DIVISION 03 LUXURY STORE CONFIGURATION */}
      {activeTab === 'retail' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300">
              Manage ready-to-wear inventory, SKUs, gender collections (MEN, WOMEN, KIDS, OTHERS), and stock.
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#070F1E] text-[#E5C07B] font-bold uppercase text-[10px] border-b border-[#C29C6D]/30">
                  <th className="p-3 rounded-l-xl">SKU Code</th>
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Gender Collection</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Sizes Available</th>
                  <th className="p-3">Retail Price</th>
                  <th className="p-3">Stock Units</th>
                  <th className="p-3 rounded-r-xl">Inventory Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C29C6D]/10">
                {retailProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-[#070F1E]/50">
                    <td className="p-3 font-mono font-bold text-[#E5C07B]">{p.sku}</td>
                    <td className="p-3 font-bold text-white">{p.name}</td>
                    <td className="p-3 font-extrabold text-[10px] text-amber-300">{p.gender}</td>
                    <td className="p-3 text-slate-300">{p.category}</td>
                    <td className="p-3 text-slate-400 font-mono text-[10px]">{p.sizes.join(', ')}</td>
                    <td className="p-3 font-bold text-[#FAF9F6]">₹{p.price.toLocaleString()}</td>
                    <td className="p-3 font-bold text-emerald-400">{p.stockCount} in stock</td>
                    <td className="p-3">
                      <button
                        onClick={() => handleToggleRetail(p.id)}
                        className={`px-3 py-1.5 min-h-[36px] rounded-xl text-[10px] font-bold cursor-pointer transition-all ${
                          p.inStock
                            ? 'bg-emerald-900/80 text-emerald-200 border border-emerald-500'
                            : 'bg-rose-900/80 text-rose-200 border border-rose-500'
                        }`}
                      >
                        {p.inStock ? 'In Stock' : 'Out of Stock'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: OFFERS & VOUCHERS CONFIGURATION */}
      {activeTab === 'offers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300">
              Configure contextual discount vouchers with min order limits, division scoping, and validity periods.
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#070F1E] text-[#E5C07B] font-bold uppercase text-[10px] border-b border-[#C29C6D]/30">
                  <th className="p-3 rounded-l-xl">Voucher Code</th>
                  <th className="p-3">Campaign Title</th>
                  <th className="p-3">Discount</th>
                  <th className="p-3">Min Order</th>
                  <th className="p-3">Eligible Division</th>
                  <th className="p-3">Validity</th>
                  <th className="p-3">Redemptions</th>
                  <th className="p-3 rounded-r-xl">Toggle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C29C6D]/10">
                {offers.map((o) => (
                  <tr key={o.id} className="hover:bg-[#070F1E]/50">
                    <td className="p-3 font-mono font-black text-[#E5C07B]">{o.code}</td>
                    <td className="p-3 font-bold text-white">{o.title}</td>
                    <td className="p-3 font-bold text-emerald-400">
                      {o.discountType === 'percentage' ? `${o.discountValue}%` : `₹${o.discountValue}`}
                    </td>
                    <td className="p-3 text-slate-300 font-mono">₹{o.minOrderValue}</td>
                    <td className="p-3 uppercase font-bold text-[10px] text-amber-300">{o.eligibleDivision}</td>
                    <td className="p-3 text-slate-400 text-[10px]">{o.startDate} to {o.endDate}</td>
                    <td className="p-3 text-slate-300 font-mono">{o.currentUsages} / {o.usageLimit}</td>
                    <td className="p-3">
                      <button
                        onClick={() => handleToggleOffer(o.id)}
                        className={`px-3 py-1.5 min-h-[36px] rounded-xl text-[10px] font-bold cursor-pointer transition-all ${
                          o.active
                            ? 'bg-emerald-900/80 text-emerald-200 border border-emerald-500'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {o.active ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: VIP MEMBERSHIP CONFIGURATION */}
      {activeTab === 'memberships' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300">
              Configure VIP Garment Care Club tiers, prices, validity durations, and express delivery quotas.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {memberships.map((m) => (
              <div
                key={m.id}
                className="bg-[#070F1E] rounded-2xl p-5 border border-[#C29C6D]/30 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-[#E5C07B]">{m.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${m.active ? 'bg-emerald-950 text-emerald-300 border border-emerald-500' : 'bg-slate-800 text-slate-400'}`}>
                      {m.active ? 'LIVE IN APP' : 'PAUSED'}
                    </span>
                  </div>

                  <h3 className="font-['Libre_Caslon_Text',serif] text-base font-bold text-[#FAF9F6] mt-2">
                    {m.name}
                  </h3>

                  <div className="mt-2 text-xl font-bold text-[#E5C07B] font-['Libre_Caslon_Text',serif]">
                    ₹{m.price.toLocaleString()}
                    <span className="text-xs text-slate-400 font-sans font-normal"> / {m.durationMonths} Months</span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-[#C29C6D]/20 space-y-1.5">
                    <span className="text-[9px] font-black text-[#E5C07B] uppercase tracking-wider block">INCLUDED BENEFITS:</span>
                    {m.perks.map((p, idx) => (
                      <div key={idx} className="text-xs text-slate-300 flex items-start gap-1.5">
                        <span className="material-symbols-outlined text-[14px] text-emerald-400 shrink-0 mt-0.5">check_circle</span>
                        <span>{p}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleToggleMembership(m.id)}
                  className={`w-full py-2.5 min-h-[44px] rounded-xl text-xs font-bold cursor-pointer transition-all ${
                    m.active
                      ? 'bg-rose-900/40 text-rose-200 border border-rose-500/50 hover:bg-rose-900/60'
                      : 'bg-emerald-900/40 text-emerald-200 border border-emerald-500/50 hover:bg-emerald-900/60'
                  }`}
                >
                  {m.active ? 'Deactivate Tier' : 'Activate Tier'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
