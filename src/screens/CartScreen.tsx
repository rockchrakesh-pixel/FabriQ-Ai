import React, { useState, useEffect, useMemo } from 'react';
import { ScreenId } from '../types';
import { BottomNav } from '../components/BottomNav';
import { useAuth } from '../context/AuthContext';
import { useBranch } from '../context/BranchContext';
import { useNotifications } from '../context/NotificationContext';
import { useOrders } from '../context/OrderContext';
import { WhatsAppModal } from '../components/WhatsAppModal';
import { OnlineBillingModal } from '../components/OnlineBillingModal';
import { triggerHaptic } from '../lib/haptics';

interface ScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export type ServiceType = 'Wash & Fold' | 'Wash & Iron' | 'Steam Iron' | 'Dry Cleaning' | 'Premium Care';

const SERVICE_PRICES_MAP: Record<string, Partial<Record<ServiceType, number>>> = {
  'Shirt': { 'Steam Iron': 15, 'Wash & Fold': 45, 'Wash & Iron': 79, 'Dry Cleaning': 99, 'Premium Care': 149 },
  'T-Shirt': { 'Steam Iron': 15, 'Wash & Fold': 39, 'Wash & Iron': 69, 'Dry Cleaning': 89, 'Premium Care': 129 },
  'Polo T-Shirt': { 'Steam Iron': 15, 'Wash & Fold': 45, 'Wash & Iron': 79, 'Dry Cleaning': 89, 'Premium Care': 139 },
  'Trouser': { 'Steam Iron': 15, 'Wash & Fold': 45, 'Wash & Iron': 89, 'Dry Cleaning': 99, 'Premium Care': 149 },
  'Jeans': { 'Steam Iron': 25, 'Wash & Fold': 55, 'Wash & Iron': 99, 'Dry Cleaning': 119, 'Premium Care': 159 },
  'Shorts': { 'Steam Iron': 15, 'Wash & Fold': 39, 'Wash & Iron': 69, 'Dry Cleaning': 79, 'Premium Care': 119 },
  'Blazer': { 'Steam Iron': 99, 'Wash & Fold': 149, 'Wash & Iron': 199, 'Dry Cleaning': 249, 'Premium Care': 349 },
  'Suit (2 Piece)': { 'Steam Iron': 149, 'Wash & Fold': 249, 'Wash & Iron': 349, 'Dry Cleaning': 449, 'Premium Care': 599 },
  'Suit (3 Piece)': { 'Steam Iron': 199, 'Wash & Fold': 299, 'Wash & Iron': 449, 'Dry Cleaning': 599, 'Premium Care': 799 },
  'Sherwani': { 'Steam Iron': 149, 'Wash & Fold': 249, 'Wash & Iron': 349, 'Dry Cleaning': 499, 'Premium Care': 699 },
  'Kurta': { 'Steam Iron': 25, 'Wash & Fold': 59, 'Wash & Iron': 99, 'Dry Cleaning': 129, 'Premium Care': 189 },
  'Pyjama': { 'Steam Iron': 15, 'Wash & Fold': 45, 'Wash & Iron': 79, 'Dry Cleaning': 89, 'Premium Care': 129 },
  'Dhoti': { 'Steam Iron': 25, 'Wash & Fold': 59, 'Wash & Iron': 99, 'Dry Cleaning': 129, 'Premium Care': 189 },
  'Jacket': { 'Steam Iron': 99, 'Wash & Fold': 149, 'Wash & Iron': 199, 'Dry Cleaning': 249, 'Premium Care': 349 },
  'Sweater': { 'Steam Iron': 49, 'Wash & Fold': 99, 'Wash & Iron': 129, 'Dry Cleaning': 169, 'Premium Care': 249 },
  'Hoodie': { 'Steam Iron': 49, 'Wash & Fold': 99, 'Wash & Iron': 129, 'Dry Cleaning': 179, 'Premium Care': 249 },
  'Waistcoat': { 'Steam Iron': 49, 'Wash & Fold': 89, 'Wash & Iron': 119, 'Dry Cleaning': 149, 'Premium Care': 219 },
  'Tie': { 'Steam Iron': 15, 'Wash & Fold': 29, 'Wash & Iron': 39, 'Dry Cleaning': 49, 'Premium Care': 79 },
  'Cap': { 'Steam Iron': 15, 'Wash & Fold': 29, 'Wash & Iron': 39, 'Dry Cleaning': 49, 'Premium Care': 79 },
  'Top': { 'Steam Iron': 15, 'Wash & Fold': 45, 'Wash & Iron': 79, 'Dry Cleaning': 89, 'Premium Care': 139 },
  'Kurti': { 'Steam Iron': 25, 'Wash & Fold': 55, 'Wash & Iron': 99, 'Dry Cleaning': 129, 'Premium Care': 169 },
  'Leggings': { 'Steam Iron': 15, 'Wash & Fold': 45, 'Wash & Iron': 79, 'Dry Cleaning': 89, 'Premium Care': 129 },
  'Skirt': { 'Steam Iron': 25, 'Wash & Fold': 69, 'Wash & Iron': 119, 'Dry Cleaning': 139, 'Premium Care': 189 },
  'Palazzo': { 'Steam Iron': 25, 'Wash & Fold': 55, 'Wash & Iron': 99, 'Dry Cleaning': 119, 'Premium Care': 159 },
  'Western Dress': { 'Steam Iron': 49, 'Wash & Fold': 119, 'Wash & Iron': 159, 'Dry Cleaning': 199, 'Premium Care': 299 },
  'Gown': { 'Steam Iron': 99, 'Wash & Fold': 179, 'Wash & Iron': 229, 'Dry Cleaning': 299, 'Premium Care': 449 },
  'Blouse': { 'Steam Iron': 25, 'Wash & Fold': 49, 'Wash & Iron': 79, 'Dry Cleaning': 99, 'Premium Care': 149 },
  'Silk Saree': { 'Steam Iron': 99, 'Wash & Fold': 199, 'Wash & Iron': 249, 'Dry Cleaning': 299, 'Premium Care': 399 },
  'Cotton Saree': { 'Steam Iron': 49, 'Wash & Fold': 99, 'Wash & Iron': 129, 'Dry Cleaning': 199, 'Premium Care': 299 },
  'Lehenga': { 'Steam Iron': 99, 'Wash & Fold': 229, 'Wash & Iron': 299, 'Dry Cleaning': 399, 'Premium Care': 599 },
  'Bridal Lehenga': { 'Steam Iron': 249, 'Wash & Fold': 499, 'Wash & Iron': 699, 'Dry Cleaning': 999, 'Premium Care': 1499 },
  'Dupatta': { 'Steam Iron': 25, 'Wash & Fold': 45, 'Wash & Iron': 69, 'Dry Cleaning': 79, 'Premium Care': 119 },
  'Shawl': { 'Steam Iron': 49, 'Wash & Fold': 89, 'Wash & Iron': 119, 'Dry Cleaning': 149, 'Premium Care': 219 },
  'School Uniform': { 'Steam Iron': 15, 'Wash & Fold': 45, 'Wash & Iron': 79, 'Dry Cleaning': 89, 'Premium Care': 129 },
  'Bedsheet': { 'Steam Iron': 49, 'Wash & Fold': 89, 'Wash & Iron': 119, 'Dry Cleaning': 149, 'Premium Care': 219 },
  'Blanket': { 'Steam Iron': 99, 'Wash & Fold': 199, 'Wash & Iron': 249, 'Dry Cleaning': 299, 'Premium Care': 399 },
  'Quilt': { 'Steam Iron': 129, 'Wash & Fold': 249, 'Wash & Iron': 299, 'Dry Cleaning': 399, 'Premium Care': 549 },
  'Comforter': { 'Steam Iron': 149, 'Wash & Fold': 279, 'Wash & Iron': 349, 'Dry Cleaning': 449, 'Premium Care': 599 },
  'Curtains': { 'Steam Iron': 49, 'Wash & Fold': 89, 'Wash & Iron': 119, 'Dry Cleaning': 149, 'Premium Care': 219 },
  'Carpet': { 'Steam Iron': 199, 'Wash & Fold': 299, 'Wash & Iron': 399, 'Dry Cleaning': 499, 'Premium Care': 699 },
  'Rug': { 'Steam Iron': 99, 'Wash & Fold': 179, 'Wash & Iron': 229, 'Dry Cleaning': 299, 'Premium Care': 419 },
  'Sofa Cover': { 'Steam Iron': 79, 'Wash & Fold': 149, 'Wash & Iron': 199, 'Dry Cleaning': 249, 'Premium Care': 349 },
  'Sneakers': { 'Steam Iron': 99, 'Wash & Fold': 199, 'Wash & Iron': 249, 'Dry Cleaning': 299, 'Premium Care': 399 },
  'Sports Shoes': { 'Steam Iron': 99, 'Wash & Fold': 219, 'Wash & Iron': 279, 'Dry Cleaning': 349, 'Premium Care': 449 },
  'Leather Shoes': { 'Steam Iron': 129, 'Wash & Fold': 249, 'Wash & Iron': 299, 'Dry Cleaning': 399, 'Premium Care': 549 },
  'Handbag': { 'Steam Iron': 99, 'Wash & Fold': 219, 'Wash & Iron': 279, 'Dry Cleaning': 349, 'Premium Care': 499 },
  'Bridal Wear': { 'Steam Iron': 249, 'Wash & Fold': 499, 'Wash & Iron': 699, 'Dry Cleaning': 999, 'Premium Care': 1499 },
  'Designer Dress': { 'Steam Iron': 149, 'Wash & Fold': 299, 'Wash & Iron': 399, 'Dry Cleaning': 599, 'Premium Care': 899 },
  'Luxury Suit': { 'Steam Iron': 199, 'Wash & Fold': 399, 'Wash & Iron': 499, 'Dry Cleaning': 699, 'Premium Care': 999 },
  'Leather Jacket': { 'Steam Iron': 249, 'Wash & Fold': 449, 'Wash & Iron': 549, 'Dry Cleaning': 799, 'Premium Care': 1099 },
  'Wool Coat': { 'Steam Iron': 149, 'Wash & Fold': 299, 'Wash & Iron': 399, 'Dry Cleaning': 499, 'Premium Care': 699 },
  'Vintage Garments': { 'Steam Iron': 249, 'Wash & Fold': 499, 'Wash & Iron': 699, 'Dry Cleaning': 999, 'Premium Care': 1499 },
};

export const getExactServicePrice = (garmentName: string, service: ServiceType, catalogFallback: number): number => {
  const garmentMatch = Object.keys(SERVICE_PRICES_MAP).find((k) =>
    garmentName.toLowerCase().includes(k.toLowerCase())
  );
  if (garmentMatch && SERVICE_PRICES_MAP[garmentMatch]?.[service]) {
    return SERVICE_PRICES_MAP[garmentMatch][service]!;
  }
  switch (service) {
    case 'Steam Iron': return 15;
    case 'Wash & Fold': return 45;
    case 'Wash & Iron': return catalogFallback;
    case 'Dry Cleaning': return Math.round(catalogFallback * 1.25);
    case 'Premium Care': return Math.round(catalogFallback * 1.75);
    default: return catalogFallback;
  }
};

export interface GarmentCatalogItem {
  id: string;
  category: 'men' | 'women' | 'kids' | 'home' | 'shoes_bags' | 'premium';
  categoryLabel: string;
  name: string;
  price: number;
  deliveryHours: number;
  image: string;
  popular?: boolean;
  unit?: string;
}

const CATALOG_ITEMS: GarmentCatalogItem[] = [
  // 🧺 MEN - KG LAUNDRY
  { id: 'kg_m1', category: 'men', categoryLabel: '👨 MEN', name: 'Men Everyday Laundry By KG (Wash & Fold)', price: 89, deliveryHours: 24, image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?q=80&w=400&auto=format&fit=crop', popular: true, unit: 'KG' },
  { id: 'kg_m2', category: 'men', categoryLabel: '👨 MEN', name: 'Men Everyday Laundry By KG (Wash & Iron)', price: 129, deliveryHours: 24, image: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?q=80&w=400&auto=format&fit=crop', popular: true, unit: 'KG' },

  // MEN
  { id: 'm1', category: 'men', categoryLabel: '👨 MEN', name: 'Shirt', price: 79, deliveryHours: 24, image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=400&auto=format&fit=crop', popular: true },
  { id: 'm2', category: 'men', categoryLabel: '👨 MEN', name: 'T-Shirt', price: 69, deliveryHours: 24, image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=400&auto=format&fit=crop' },

  // 🧺 WOMEN - KG LAUNDRY
  { id: 'kg_w1', category: 'women', categoryLabel: '👩 WOMEN', name: 'Women Everyday Laundry By KG (Wash & Fold)', price: 89, deliveryHours: 24, image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?q=80&w=400&auto=format&fit=crop', popular: true, unit: 'KG' },
  { id: 'kg_w2', category: 'women', categoryLabel: '👩 WOMEN', name: 'Women Everyday Laundry By KG (Wash & Iron)', price: 129, deliveryHours: 24, image: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?q=80&w=400&auto=format&fit=crop', popular: true, unit: 'KG' },

  // 🧺 KIDS - KG LAUNDRY
  { id: 'kg_k1', category: 'kids', categoryLabel: '👶 KIDS', name: 'Kids Everyday Laundry By KG (Wash & Fold)', price: 79, deliveryHours: 24, image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?q=80&w=400&auto=format&fit=crop', popular: true, unit: 'KG' },
  { id: 'kg_k2', category: 'kids', categoryLabel: '👶 KIDS', name: 'Kids Everyday Laundry By KG (Wash & Iron)', price: 109, deliveryHours: 24, image: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?q=80&w=400&auto=format&fit=crop', popular: true, unit: 'KG' },
  { id: 'm3', category: 'men', categoryLabel: '👨 MEN', name: 'Polo T-Shirt', price: 79, deliveryHours: 24, image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=400&auto=format&fit=crop' },
  { id: 'm4', category: 'men', categoryLabel: '👨 MEN', name: 'Jeans', price: 99, deliveryHours: 24, image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=400&auto=format&fit=crop' },
  { id: 'm5', category: 'men', categoryLabel: '👨 MEN', name: 'Trouser', price: 89, deliveryHours: 24, image: 'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?q=80&w=400&auto=format&fit=crop', popular: true },
  { id: 'm6', category: 'men', categoryLabel: '👨 MEN', name: 'Shorts', price: 69, deliveryHours: 24, image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=400&auto=format&fit=crop' },
  { id: 'm7', category: 'men', categoryLabel: '👨 MEN', name: 'Blazer', price: 249, deliveryHours: 48, image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=400&auto=format&fit=crop' },
  { id: 'm8', category: 'men', categoryLabel: '👨 MEN', name: 'Suit (2 Piece)', price: 449, deliveryHours: 48, image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=400&auto=format&fit=crop', popular: true },
  { id: 'm9', category: 'men', categoryLabel: '👨 MEN', name: 'Suit (3 Piece)', price: 599, deliveryHours: 48, image: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?q=80&w=400&auto=format&fit=crop' },
  { id: 'm10', category: 'men', categoryLabel: '👨 MEN', name: 'Sherwani', price: 499, deliveryHours: 48, image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=400&auto=format&fit=crop' },
  { id: 'm11', category: 'men', categoryLabel: '👨 MEN', name: 'Kurta', price: 99, deliveryHours: 24, image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=400&auto=format&fit=crop' },
  { id: 'm12', category: 'men', categoryLabel: '👨 MEN', name: 'Pyjama', price: 79, deliveryHours: 24, image: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?q=80&w=400&auto=format&fit=crop' },
  { id: 'm13', category: 'men', categoryLabel: '👨 MEN', name: 'Dhoti', price: 99, deliveryHours: 24, image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=400&auto=format&fit=crop' },
  { id: 'm14', category: 'men', categoryLabel: '👨 MEN', name: 'Jacket', price: 249, deliveryHours: 48, image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=400&auto=format&fit=crop' },
  { id: 'm15', category: 'men', categoryLabel: '👨 MEN', name: 'Sweater', price: 169, deliveryHours: 48, image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=400&auto=format&fit=crop' },
  { id: 'm16', category: 'men', categoryLabel: '👨 MEN', name: 'Hoodie', price: 179, deliveryHours: 24, image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=400&auto=format&fit=crop' },
  { id: 'm17', category: 'men', categoryLabel: '👨 MEN', name: 'Waistcoat', price: 149, deliveryHours: 24, image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=400&auto=format&fit=crop' },
  { id: 'm18', category: 'men', categoryLabel: '👨 MEN', name: 'Tie', price: 49, deliveryHours: 24, image: 'https://images.unsplash.com/photo-1589756823695-278bc923f962?q=80&w=400&auto=format&fit=crop' },
  { id: 'm19', category: 'men', categoryLabel: '👨 MEN', name: 'Cap', price: 49, deliveryHours: 24, image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=400&auto=format&fit=crop' },

  // WOMEN
  { id: 'w1', category: 'women', categoryLabel: '👩 WOMEN', name: 'Top', price: 79, deliveryHours: 24, image: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?q=80&w=400&auto=format&fit=crop' },
  { id: 'w2', category: 'women', categoryLabel: '👩 WOMEN', name: 'T-Shirt', price: 69, deliveryHours: 24, image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=400&auto=format&fit=crop' },
  { id: 'w3', category: 'women', categoryLabel: '👩 WOMEN', name: 'Kurti', price: 99, deliveryHours: 24, image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=400&auto=format&fit=crop', popular: true },
  { id: 'w4', category: 'women', categoryLabel: '👩 WOMEN', name: 'Leggings', price: 79, deliveryHours: 24, image: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?q=80&w=400&auto=format&fit=crop' },
  { id: 'w5', category: 'women', categoryLabel: '👩 WOMEN', name: 'Jeans', price: 99, deliveryHours: 24, image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=400&auto=format&fit=crop' },
  { id: 'w6', category: 'women', categoryLabel: '👩 WOMEN', name: 'Skirt', price: 119, deliveryHours: 24, image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?q=80&w=400&auto=format&fit=crop' },
  { id: 'w7', category: 'women', categoryLabel: '👩 WOMEN', name: 'Palazzo', price: 99, deliveryHours: 24, image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=400&auto=format&fit=crop' },
  { id: 'w8', category: 'women', categoryLabel: '👩 WOMEN', name: 'Western Dress', price: 199, deliveryHours: 48, image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=400&auto=format&fit=crop' },
  { id: 'w9', category: 'women', categoryLabel: '👩 WOMEN', name: 'Gown', price: 299, deliveryHours: 48, image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=400&auto=format&fit=crop' },
  { id: 'w10', category: 'women', categoryLabel: '👩 WOMEN', name: 'Blouse', price: 79, deliveryHours: 24, image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=400&auto=format&fit=crop' },
  { id: 'w11', category: 'women', categoryLabel: '👩 WOMEN', name: 'Cotton Saree', price: 199, deliveryHours: 24, image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=400&auto=format&fit=crop' },
  { id: 'w12', category: 'women', categoryLabel: '👩 WOMEN', name: 'Silk Saree', price: 299, deliveryHours: 48, image: '/src/assets/images/premium_saree_care_1785808836511.png', popular: true },
  { id: 'w13', category: 'women', categoryLabel: '👩 WOMEN', name: 'Designer Saree', price: 499, deliveryHours: 48, image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=400&auto=format&fit=crop' },
  { id: 'w14', category: 'women', categoryLabel: '👩 WOMEN', name: 'Salwar Suit', price: 179, deliveryHours: 24, image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=400&auto=format&fit=crop' },
  { id: 'w15', category: 'women', categoryLabel: '👩 WOMEN', name: 'Lehenga', price: 399, deliveryHours: 48, image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=400&auto=format&fit=crop' },
  { id: 'w16', category: 'women', categoryLabel: '👩 WOMEN', name: 'Bridal Lehenga', price: 999, deliveryHours: 48, image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=400&auto=format&fit=crop', popular: true },
  { id: 'w17', category: 'women', categoryLabel: '👩 WOMEN', name: 'Dupatta', price: 79, deliveryHours: 24, image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=400&auto=format&fit=crop' },
  { id: 'w18', category: 'women', categoryLabel: '👩 WOMEN', name: 'Shawl', price: 149, deliveryHours: 24, image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=400&auto=format&fit=crop' },
  { id: 'w19', category: 'women', categoryLabel: '👩 WOMEN', name: 'Sweater', price: 169, deliveryHours: 48, image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=400&auto=format&fit=crop' },
  { id: 'w20', category: 'women', categoryLabel: '👩 WOMEN', name: 'Jacket', price: 249, deliveryHours: 48, image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=400&auto=format&fit=crop' },

  // KIDS
  { id: 'k1', category: 'kids', categoryLabel: '👶 KIDS', name: 'School Uniform', price: 79, deliveryHours: 24, image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=400&auto=format&fit=crop' },
  { id: 'k2', category: 'kids', categoryLabel: '👶 KIDS', name: 'Shirt', price: 59, deliveryHours: 24, image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=400&auto=format&fit=crop' },
  { id: 'k3', category: 'kids', categoryLabel: '👶 KIDS', name: 'T-Shirt', price: 49, deliveryHours: 24, image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=400&auto=format&fit=crop' },
  { id: 'k4', category: 'kids', categoryLabel: '👶 KIDS', name: 'Shorts', price: 49, deliveryHours: 24, image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=400&auto=format&fit=crop' },
  { id: 'k5', category: 'kids', categoryLabel: '👶 KIDS', name: 'Jeans', price: 69, deliveryHours: 24, image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=400&auto=format&fit=crop' },
  { id: 'k6', category: 'kids', categoryLabel: '👶 KIDS', name: 'Pants', price: 69, deliveryHours: 24, image: 'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?q=80&w=400&auto=format&fit=crop' },
  { id: 'k7', category: 'kids', categoryLabel: '👶 KIDS', name: 'Dress', price: 99, deliveryHours: 24, image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=400&auto=format&fit=crop' },
  { id: 'k8', category: 'kids', categoryLabel: '👶 KIDS', name: 'Frock', price: 99, deliveryHours: 24, image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?q=80&w=400&auto=format&fit=crop' },
  { id: 'k9', category: 'kids', categoryLabel: '👶 KIDS', name: 'Sweater', price: 99, deliveryHours: 24, image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=400&auto=format&fit=crop' },
  { id: 'k10', category: 'kids', categoryLabel: '👶 KIDS', name: 'Jacket', price: 149, deliveryHours: 24, image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=400&auto=format&fit=crop' },
  { id: 'k11', category: 'kids', categoryLabel: '👶 KIDS', name: 'Baby Blanket', price: 199, deliveryHours: 24, image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?q=80&w=400&auto=format&fit=crop' },

  // HOME CARE
  { id: 'h1', category: 'home', categoryLabel: '🏠 HOME CARE', name: 'Bedsheet', price: 149, deliveryHours: 48, image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?q=80&w=400&auto=format&fit=crop' },
  { id: 'h2', category: 'home', categoryLabel: '🏠 HOME CARE', name: 'Blanket', price: 299, deliveryHours: 48, image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?q=80&w=400&auto=format&fit=crop', popular: true },
  { id: 'h3', category: 'home', categoryLabel: '🏠 HOME CARE', name: 'Quilt', price: 399, deliveryHours: 48, image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?q=80&w=400&auto=format&fit=crop' },
  { id: 'h4', category: 'home', categoryLabel: '🏠 HOME CARE', name: 'Comforter', price: 449, deliveryHours: 48, image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?q=80&w=400&auto=format&fit=crop' },
  { id: 'h5', category: 'home', categoryLabel: '🏠 HOME CARE', name: 'Curtains (each)', price: 149, deliveryHours: 48, image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=400&auto=format&fit=crop' },
  { id: 'h6', category: 'home', categoryLabel: '🏠 HOME CARE', name: 'Carpet', price: 499, deliveryHours: 48, image: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?q=80&w=400&auto=format&fit=crop' },
  { id: 'h7', category: 'home', categoryLabel: '🏠 HOME CARE', name: 'Rug', price: 299, deliveryHours: 48, image: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?q=80&w=400&auto=format&fit=crop' },
  { id: 'h8', category: 'home', categoryLabel: '🏠 HOME CARE', name: 'Sofa Cover', price: 249, deliveryHours: 48, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=400&auto=format&fit=crop' },
  { id: 'h9', category: 'home', categoryLabel: '🏠 HOME CARE', name: 'Cushion Cover', price: 49, deliveryHours: 24, image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?q=80&w=400&auto=format&fit=crop' },
  { id: 'h10', category: 'home', categoryLabel: '🏠 HOME CARE', name: 'Pillow Cover', price: 39, deliveryHours: 24, image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?q=80&w=400&auto=format&fit=crop' },
  { id: 'h11', category: 'home', categoryLabel: '🏠 HOME CARE', name: 'Mattress Protector', price: 299, deliveryHours: 48, image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?q=80&w=400&auto=format&fit=crop' },

  // SHOES & BAGS
  { id: 'sb1', category: 'shoes_bags', categoryLabel: '👟 SHOES & BAGS', name: 'Sneakers', price: 299, deliveryHours: 48, image: '/src/assets/images/luxury_shoe_cleaning_1785808816402.png', popular: true },
  { id: 'sb2', category: 'shoes_bags', categoryLabel: '👟 SHOES & BAGS', name: 'Sports Shoes', price: 349, deliveryHours: 48, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400&auto=format&fit=crop' },
  { id: 'sb3', category: 'shoes_bags', categoryLabel: '👟 SHOES & BAGS', name: 'Leather Shoes', price: 399, deliveryHours: 48, image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=400&auto=format&fit=crop' },
  { id: 'sb4', category: 'shoes_bags', categoryLabel: '👟 SHOES & BAGS', name: 'Heels', price: 299, deliveryHours: 48, image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=400&auto=format&fit=crop' },
  { id: 'sb5', category: 'shoes_bags', categoryLabel: '👟 SHOES & BAGS', name: 'Sandals', price: 199, deliveryHours: 24, image: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?q=80&w=400&auto=format&fit=crop' },
  { id: 'sb6', category: 'shoes_bags', categoryLabel: '👟 SHOES & BAGS', name: 'Handbag', price: 349, deliveryHours: 48, image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=400&auto=format&fit=crop' },
  { id: 'sb7', category: 'shoes_bags', categoryLabel: '👟 SHOES & BAGS', name: 'Laptop Bag', price: 299, deliveryHours: 48, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=400&auto=format&fit=crop' },
  { id: 'sb8', category: 'shoes_bags', categoryLabel: '👟 SHOES & BAGS', name: 'Backpack', price: 249, deliveryHours: 48, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=400&auto=format&fit=crop' },
  { id: 'sb9', category: 'shoes_bags', categoryLabel: '👟 SHOES & BAGS', name: 'Travel Bag', price: 399, deliveryHours: 48, image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=400&auto=format&fit=crop' },
  { id: 'sb10', category: 'shoes_bags', categoryLabel: '👟 SHOES & BAGS', name: 'Wallet', price: 149, deliveryHours: 24, image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=400&auto=format&fit=crop' },

  // PREMIUM CARE
  { id: 'p1', category: 'premium', categoryLabel: '💎 PREMIUM CARE', name: 'Bridal Wear', price: 999, deliveryHours: 48, image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=400&auto=format&fit=crop', popular: true },
  { id: 'p2', category: 'premium', categoryLabel: '💎 PREMIUM CARE', name: 'Designer Dress', price: 599, deliveryHours: 48, image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=400&auto=format&fit=crop' },
  { id: 'p3', category: 'premium', categoryLabel: '💎 PREMIUM CARE', name: 'Luxury Suit', price: 699, deliveryHours: 48, image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=400&auto=format&fit=crop' },
  { id: 'p4', category: 'premium', categoryLabel: '💎 PREMIUM CARE', name: 'Leather Jacket', price: 799, deliveryHours: 48, image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=400&auto=format&fit=crop' },
  { id: 'p5', category: 'premium', categoryLabel: '💎 PREMIUM CARE', name: 'Silk Saree', price: 499, deliveryHours: 48, image: '/src/assets/images/premium_saree_care_1785808836511.png' },
  { id: 'p6', category: 'premium', categoryLabel: '💎 PREMIUM CARE', name: 'Wool Coat', price: 499, deliveryHours: 48, image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=400&auto=format&fit=crop' },
  { id: 'p7', category: 'premium', categoryLabel: '💎 PREMIUM CARE', name: 'Vintage Garments', price: 999, deliveryHours: 48, image: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?q=80&w=400&auto=format&fit=crop' },
];

export interface CartItemState {
  id: string;
  garmentName: string;
  service: ServiceType;
  price: number;
  qty: number;
  image: string;
}

export const CartScreen: React.FC<ScreenProps> = ({ onNavigate }) => {
  const { profile } = useAuth();
  const { activeBranch } = useBranch();
  const { triggerOrderConfirmedNotification } = useNotifications();
  const { addOrder } = useOrders();

  // Initial cart pre-loaded items per prompt example (or restored from localStorage on re-order):
  const [cartItems, setCartItems] = useState<CartItemState[]>(() => {
    try {
      const saved = localStorage.getItem('fabriq_cart_items');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return [
      {
        id: 'cart-1',
        garmentName: 'Shirt',
        service: 'Wash & Iron',
        price: 50,
        qty: 5,
        image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=400&auto=format&fit=crop',
      },
      {
        id: 'cart-2',
        garmentName: 'Trouser',
        service: 'Dry Cleaning',
        price: 120,
        qty: 3,
        image: 'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?q=80&w=400&auto=format&fit=crop',
      },
      {
        id: 'cart-3',
        garmentName: 'Suit (2 Piece)',
        service: 'Premium Care',
        price: 449,
        qty: 1,
        image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=400&auto=format&fit=crop',
      },
      {
        id: 'cart-4',
        garmentName: 'Silk Saree',
        service: 'Dry Cleaning',
        price: 299,
        qty: 2,
        image: '/src/assets/images/premium_saree_care_1785808836511.png',
      },
      {
        id: 'cart-5',
        garmentName: 'Blanket',
        service: 'Wash & Fold',
        price: 299,
        qty: 1,
        image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?q=80&w=400&auto=format&fit=crop',
      },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('fabriq_cart_items', JSON.stringify(cartItems));
    } catch {
      // ignore
    }
  }, [cartItems]);

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [selectedServiceMap, setSelectedServiceMap] = useState<Record<string, ServiceType>>({});

  // Promo Code State
  const [couponCode, setCouponCode] = useState('FABRIQ50');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>('FABRIQ50');
  const [couponDiscount, setCouponDiscount] = useState(50);

  // Rewards State
  const [useRewardPoints, setUseRewardPoints] = useState(true);
  const rewardPointsAvailable = 240; // 240 pts = ₹24
  const rewardPointsValue = 24;

  // Add-ons
  const [addStainProtection, setAddStainProtection] = useState(false);
  const [addExpressDelivery, setAddExpressDelivery] = useState(false);
  const [addFabricSanitization, setAddFabricSanitization] = useState(false);

  // Pickup Details State
  const [pickupAddress, setPickupAddress] = useState(
    profile?.address || `${activeBranch.address} (Near ${activeBranch.name})`
  );
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [pickupDate, setPickupDate] = useState('Tomorrow, Aug 5');
  const [pickupSlot, setPickupSlot] = useState('10:00 AM - 12:00 PM');

  // Payment Method
  const [selectedPayment, setSelectedPayment] = useState<'upi' | 'card' | 'netbanking' | 'wallet' | 'cod'>('upi');

  // Modals
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [isBillingOpen, setIsBillingOpen] = useState(false);

  // Filter Catalog
  const filteredCatalog = useMemo(() => {
    if (activeCategoryFilter === 'all') return CATALOG_ITEMS;
    return CATALOG_ITEMS.filter((item) => item.category === activeCategoryFilter);
  }, [activeCategoryFilter]);

  // Handle Qty Changes for existing Cart items
  const updateCartQty = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.qty + delta;
            return nextQty > 0 ? { ...item, qty: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItemState[]
    );
  };

  const removeCartItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateCartItemService = (id: string, newService: ServiceType) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newPrice = getExactServicePrice(item.garmentName, newService, item.price);
          return { ...item, service: newService, price: newPrice };
        }
        return item;
      })
    );
  };

  // Add from Catalog to Cart
  const addItemFromCatalog = (catalogItem: GarmentCatalogItem) => {
    const service = selectedServiceMap[catalogItem.id] || 'Wash & Iron';
    const itemPrice = getExactServicePrice(catalogItem.name, service, catalogItem.price);
    setCartItems((prev) => {
      const existing = prev.find(
        (i) => i.garmentName === catalogItem.name && i.service === service
      );
      if (existing) {
        return prev.map((i) =>
          i.id === existing.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [
        ...prev,
        {
          id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          garmentName: catalogItem.name,
          service,
          price: itemPrice,
          qty: 1,
          image: catalogItem.image,
        },
      ];
    });
  };

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Calculations
  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  }, [cartItems]);

  const addOnsTotal = cartItems.length === 0 ? 0 : (
    (addStainProtection ? 49 : 0) +
    (addExpressDelivery ? 99 : 0) +
    (addFabricSanitization ? 39 : 0)
  );

  const discountVal = appliedCoupon ? couponDiscount : 0;
  const rewardVal = useRewardPoints ? rewardPointsValue : 0;
  const membershipDiscount = subtotal > 1000 ? Math.round(subtotal * 0.1) : 0; // 10% for Gold/VIP

  const taxableAmount = cartItems.length === 0 ? 0 : Math.max(0, subtotal + addOnsTotal - discountVal - rewardVal - membershipDiscount);
  const gst = cartItems.length === 0 ? 0 : Math.round(taxableAmount * 0.18);
  const pickupCharge = cartItems.length === 0 ? 0 : (subtotal >= 799 ? 0 : 50); // Free 5km pickup if cart value >= ₹799
  const grandTotal = cartItems.length === 0 ? 0 : (taxableAmount + gst + pickupCharge);

  const handleApplyCoupon = () => {
    if (couponCode.trim().toUpperCase() === 'FABRIQ50') {
      setAppliedCoupon('FABRIQ50');
      setCouponDiscount(50);
    } else if (couponCode.trim().toUpperCase() === 'VIP100') {
      setAppliedCoupon('VIP100');
      setCouponDiscount(100);
    } else {
      alert('Invalid Promo Code. Try "FABRIQ50" or "VIP100"');
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty! Please add garments to proceed.');
      return;
    }
    setIsBillingOpen(true);
  };

  return (
    <div className="flex flex-col w-full pb-32 pt-16 bg-[#FAFAFC] text-slate-900 min-h-screen font-sans relative">
      {/* Top Header */}
      <section className="px-5 pt-4 pb-2 border-b border-slate-200/80 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-[#9E7B4F] uppercase tracking-widest block">
              LUXURY GARMENT CARE BASKET
            </span>
            <h1 className="font-['Libre_Caslon_Text',serif] text-2xl font-bold text-slate-900">
              Your FabriQ Cart
            </h1>
          </div>
          <button
            onClick={() => setIsWhatsAppOpen(true)}
            className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shadow-xs hover:bg-emerald-100 transition-colors cursor-pointer"
            title="Instant Chat Support"
          >
            <span className="material-symbols-outlined text-[22px]">chat</span>
          </button>
        </div>
      </section>

      {/* Main Cart Content or Empty State */}
      {cartItems.length === 0 ? (
        /* SECTION 12: EMPTY CART VIEW */
        <section className="px-5 py-12 text-center flex flex-col items-center justify-center my-auto">
          <div className="w-24 h-24 rounded-full bg-amber-50 border-2 border-amber-300 flex items-center justify-center text-[#9E7B4F] shadow-xl mb-4">
            <span className="material-symbols-outlined text-[48px]">shopping_cart</span>
          </div>
          <div className="inline-flex items-center gap-2 bg-slate-100 border border-slate-300 px-3 py-1 rounded-full mb-3 text-slate-700 text-xs font-bold">
            <span className="material-symbols-outlined text-[16px] text-amber-600">shopping_cart</span>
            <span>0 Items • Cart Value: ₹0</span>
          </div>
          <h2 className="font-['Libre_Caslon_Text',serif] text-2xl font-bold text-slate-900 mb-1">
            Your Cart is Empty (₹0)
          </h2>
          <p className="text-xs text-slate-500 max-w-xs mb-6 font-medium">
            Discover our haute couture dry cleaning, eco wash & iron, and shoe restoration menu.
          </p>
          <button
            onClick={() => onNavigate('service-catalog')}
            className="px-6 py-3 bg-[#9E7B4F] text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg hover:bg-slate-900 transition-all cursor-pointer flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
            <span>Explore Services & Add Garments</span>
          </button>
        </section>
      ) : (
        <div className="space-y-5 mt-4">
          {/* SECTION 1: LAUNDRY ITEMS IN CART */}
          <section className="px-5">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#9E7B4F] text-[18px]">checkroom</span>
                <span>Selected Garments ({cartItems.reduce((a, b) => a + b.qty, 0)})</span>
              </h3>
              <button
                onClick={() => setCartItems([])}
                className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
              >
                Clear Cart
              </button>
            </div>

            <div className="space-y-3">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5 hover:border-amber-400/80 transition-all"
                >
                  <img
                    src={item.image}
                    alt={item.garmentName}
                    className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-100"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-slate-900 truncate">{item.garmentName}</h4>
                    <div className="mt-1">
                      <select
                        value={item.service}
                        onChange={(e) => updateCartItemService(item.id, e.target.value as ServiceType)}
                        className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md focus:outline-none focus:border-[#9E7B4F] cursor-pointer"
                      >
                        {(['Steam Iron', 'Wash & Fold', 'Wash & Iron', 'Dry Cleaning', 'Premium Care'] as ServiceType[]).map((svc) => (
                          <option key={svc} value={svc}>
                            {svc} — ₹{getExactServicePrice(item.garmentName, svc, item.price)}/pc
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-xs font-black text-slate-900">
                        ₹{item.price * item.qty}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        (₹{item.price} x {item.qty})
                      </span>
                    </div>
                  </div>

                  {/* Quantity & Delete Controls */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
                      <button
                        onClick={() => updateCartQty(item.id, -1)}
                        className="w-6 h-6 rounded-lg bg-white text-slate-900 flex items-center justify-center font-bold text-xs shadow-2xs hover:bg-slate-200 transition-colors cursor-pointer"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-slate-900">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateCartQty(item.id, 1)}
                        className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs hover:bg-[#9E7B4F] transition-colors cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeCartItem(item.id)}
                      className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                      title="Remove Item"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 2: ADD MORE SERVICES SHORTCUTS */}
          <section className="px-5">
            <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">
              ADD MORE SERVICES TO THIS ORDER
            </h4>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {[
                { name: '+ Wash & Fold', category: 'men' },
                { name: '+ Dry Cleaning', category: 'women' },
                { name: '+ Steam Ironing', category: 'men' },
                { name: '+ Shoe Cleaning', category: 'shoes_bags' },
                { name: '+ Curtain Cleaning', category: 'home' },
                { name: '+ Carpet Cleaning', category: 'home' },
                { name: '+ Sofa Cleaning', category: 'home' },
              ].map((svc) => (
                <button
                  key={svc.name}
                  onClick={() => {
                    const matched = CATALOG_ITEMS.find((c) => c.category === svc.category);
                    if (matched) addItemFromCatalog(matched);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white text-slate-800 text-xs font-bold border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 whitespace-nowrap transition-all cursor-pointer shadow-2xs flex items-center gap-1 shrink-0"
                >
                  <span>{svc.name}</span>
                </button>
              ))}
            </div>
          </section>

          {/* SECTION 9: AI RECOMMENDATIONS CARDS */}
          <section className="px-5">
            <div className="bg-slate-900 text-white rounded-2xl p-4 border border-amber-400/40 shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-amber-400 text-[18px]">psychology</span>
                <span className="text-[10px] font-extrabold text-amber-300 uppercase tracking-widest">
                  FABRIQ AI CARE RECOMMENDATIONS
                </span>
              </div>

              <div className="space-y-2">
                <label className="flex items-center justify-between p-2.5 bg-slate-800/80 rounded-xl border border-slate-700 cursor-pointer hover:border-amber-400/60 transition-colors">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={addStainProtection}
                      onChange={(e) => setAddStainProtection(e.target.checked)}
                      className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
                    />
                    <div>
                      <p className="text-xs font-bold text-white">Add Nano Stain Shield Protection</p>
                      <p className="text-[10px] text-slate-400">Repels liquids & coffee spills on silks & suits</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-300">+₹49</span>
                </label>

                <label className="flex items-center justify-between p-2.5 bg-slate-800/80 rounded-xl border border-slate-700 cursor-pointer hover:border-amber-400/60 transition-colors">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={addExpressDelivery}
                      onChange={(e) => setAddExpressDelivery(e.target.checked)}
                      className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
                    />
                    <div>
                      <p className="text-xs font-bold text-white">Express 4-Hour Valet Delivery</p>
                      <p className="text-[10px] text-slate-400">Priority processing at Jubilee Hills Atelier</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-300">+₹99</span>
                </label>

                <label className="flex items-center justify-between p-2.5 bg-slate-800/80 rounded-xl border border-slate-700 cursor-pointer hover:border-amber-400/60 transition-colors">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={addFabricSanitization}
                      onChange={(e) => setAddFabricSanitization(e.target.checked)}
                      className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
                    />
                    <div>
                      <p className="text-xs font-bold text-white">Ozone Anti-Microbial Sanitization</p>
                      <p className="text-[10px] text-slate-400">Deep pathogen neutralization</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-300">+₹39</span>
                </label>
              </div>
            </div>
          </section>

          {/* FREE PICKUP & DROP RADIUS POLICY BANNER */}
          <section className="px-5">
            <div className="bg-[#9E7B4F]/10 border border-[#9E7B4F]/30 rounded-2xl p-3.5 flex items-start gap-3">
              <span className="material-symbols-outlined text-[#9E7B4F] text-[22px] shrink-0 mt-0.5">local_shipping</span>
              <div className="text-xs space-y-1">
                <span className="font-extrabold text-[#83633B] uppercase tracking-wider block text-[10px]">
                  🚚 FREE PICKUP & DROP POLICY
                </span>
                <p className="text-slate-800 text-[11px] leading-snug font-medium">
                  • <strong>Free 5 km Radius</strong>: On Cart value <strong>₹799 & above</strong><br />
                  • <strong>Free 10 km Radius</strong>: On Cart value <strong>₹2,599 & above</strong>
                </p>
                {subtotal < 799 ? (
                  <p className="text-[10px] text-amber-900 font-bold mt-1 bg-amber-200/60 px-2 py-0.5 rounded w-fit">
                    💡 Add ₹{799 - subtotal} more to unlock Free 5 km Pickup!
                  </p>
                ) : subtotal < 2599 ? (
                  <p className="text-[10px] text-emerald-800 font-bold mt-1 bg-emerald-100 px-2 py-0.5 rounded w-fit">
                    🎉 Free 5 km Pickup Unlocked! Add ₹{2599 - subtotal} more for Free 10 km Radius.
                  </p>
                ) : (
                  <p className="text-[10px] text-emerald-800 font-bold mt-1 bg-emerald-100 px-2 py-0.5 rounded w-fit">
                    🌟 Free 10 km Extended Radius Doorstep Pickup Unlocked!
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* SECTION 3: PICKUP & DELIVERY DETAILS */}
          <section className="px-5">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#9E7B4F] text-[18px]">location_on</span>
                  <span>Doorstep Pickup Address</span>
                </span>
                <button
                  onClick={() => setIsEditingAddress(!isEditingAddress)}
                  className="text-xs font-bold text-[#9E7B4F] hover:underline cursor-pointer"
                >
                  {isEditingAddress ? 'Done' : 'Edit'}
                </button>
              </div>

              {isEditingAddress ? (
                <input
                  type="text"
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-400"
                />
              ) : (
                <p className="text-xs font-medium text-slate-700 leading-snug">{pickupAddress}</p>
              )}

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                    Pickup Date
                  </label>
                  <select
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-bold text-slate-800"
                  >
                    <option value="Today, Aug 4">Today, Aug 4</option>
                    <option value="Tomorrow, Aug 5">Tomorrow, Aug 5</option>
                    <option value="Wednesday, Aug 6">Wednesday, Aug 6</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                    Time Slot
                  </label>
                  <select
                    value={pickupSlot}
                    onChange={(e) => setPickupSlot(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-bold text-slate-800"
                  >
                    <option value="08:00 AM - 10:00 AM">08:00 AM - 10:00 AM</option>
                    <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM</option>
                    <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                    <option value="06:00 PM - 08:00 PM">06:00 PM - 08:00 PM</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 4 & 5: PROMO CODE & LOYALTY REWARDS */}
          <section className="px-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Promo Code */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1.5">
                PROMO CODE / COUPON
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="e.g. FABRIQ50"
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold uppercase text-slate-900 focus:outline-none focus:border-amber-400"
                />
                <button
                  onClick={handleApplyCoupon}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-[#9E7B4F] text-amber-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </div>
              {appliedCoupon && (
                <p className="text-[10px] font-bold text-emerald-600 mt-1.5 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  <span>Coupon "{appliedCoupon}" applied! (-₹{couponDiscount})</span>
                </p>
              )}
            </div>

            {/* Loyalty Rewards */}
            <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200 shadow-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-widest">
                  FABRIQ REWARD POINTS
                </span>
                <span className="bg-amber-200 text-amber-900 text-[9px] font-bold px-1.5 py-0.2 rounded">
                  {rewardPointsAvailable} Pts Available
                </span>
              </div>
              <label className="flex items-center justify-between mt-2 cursor-pointer">
                <span className="text-xs font-bold text-slate-900">
                  Redeem 240 Pts for ₹24 Off
                </span>
                <input
                  type="checkbox"
                  checked={useRewardPoints}
                  onChange={(e) => setUseRewardPoints(e.target.checked)}
                  className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                />
              </label>
            </div>
          </section>

          {/* SECTION 6: ORDER SUMMARY */}
          <section className="px-5">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
                Order Financial Summary
              </h3>

              <div className="flex justify-between text-xs text-slate-600 pt-1">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">₹{subtotal}</span>
              </div>

              {addOnsTotal > 0 && (
                <div className="flex justify-between text-xs text-slate-600">
                  <span>AI Care Add-ons</span>
                  <span className="font-bold text-slate-900">+₹{addOnsTotal}</span>
                </div>
              )}

              {appliedCoupon && (
                <div className="flex justify-between text-xs text-emerald-600 font-bold">
                  <span>Coupon Discount ({appliedCoupon})</span>
                  <span>-₹{couponDiscount}</span>
                </div>
              )}

              {membershipDiscount > 0 && (
                <div className="flex justify-between text-xs text-purple-700 font-bold">
                  <span>VIP Gold Member Discount (10%)</span>
                  <span>-₹{membershipDiscount}</span>
                </div>
              )}

              {useRewardPoints && (
                <div className="flex justify-between text-xs text-amber-700 font-bold">
                  <span>Reward Points (240 Pts)</span>
                  <span>-₹{rewardPointsValue}</span>
                </div>
              )}

              <div className="flex justify-between text-xs text-slate-600">
                <span>GST (18%)</span>
                <span className="font-bold text-slate-900">₹{gst}</span>
              </div>

              <div className="flex justify-between text-xs text-slate-600">
                <span>Doorstep Pickup & Delivery</span>
                <span className="font-bold text-emerald-600">
                  {pickupCharge === 0 ? 'FREE' : `₹${pickupCharge}`}
                </span>
              </div>

              <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Amount</span>
                <span className="text-amber-700 text-base">₹{grandTotal}</span>
              </div>
            </div>
          </section>

          {/* SECTION 7: PAYMENT METHODS */}
          <section className="px-5">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2">
              Select Payment Method
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {[
                { id: 'upi', label: 'UPI / GPay', icon: 'account_balance_wallet' },
                { id: 'card', label: 'Cards', icon: 'credit_card' },
                { id: 'netbanking', label: 'Net Banking', icon: 'account_balance' },
                { id: 'wallet', label: 'Wallet', icon: 'wallet' },
                { id: 'cod', label: 'Cash on Delivery', icon: 'payments' },
              ].map((pm) => (
                <button
                  key={pm.id}
                  onClick={() => setSelectedPayment(pm.id as any)}
                  className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    selectedPayment === pm.id
                      ? 'bg-slate-900 text-amber-300 border-amber-400 shadow-md ring-2 ring-amber-400/30'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{pm.icon}</span>
                  <span className="text-[10px] font-bold">{pm.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* SECTION 8: CHECKOUT BUTTON */}
          <section className="px-5 pt-2">
            <button
              onClick={handleCheckout}
              className="w-full py-4 bg-gradient-to-r from-amber-500 via-[#9E7B4F] to-slate-900 text-slate-950 font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer fabriq-glow"
            >
              <span className="material-symbols-outlined text-[20px]">lock</span>
              <span>Proceed to Secure Checkout (₹{grandTotal})</span>
            </button>
          </section>
        </div>
      )}

      {/* SECTION 11: FLOATING WHATSAPP SUPPORT */}
      <div className="fixed bottom-20 right-4 z-40">
        <button
          onClick={() => setIsWhatsAppOpen(true)}
          className="w-11 h-11 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xl hover:bg-emerald-600 transition-all hover:scale-105 cursor-pointer border-2 border-white ring-4 ring-emerald-500/20"
          title="Instant Chat Support"
        >
          <span className="material-symbols-outlined text-[24px]">chat</span>
        </button>
      </div>

      <WhatsAppModal
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
        defaultService="Cart & Order Inquiry"
      />

      <OnlineBillingModal
        isOpen={isBillingOpen}
        onClose={() => setIsBillingOpen(false)}
        items={cartItems.map((c) => ({
          id: c.id,
          name: `${c.garmentName} (${c.service})`,
          price: c.price,
          qty: c.qty,
          unit: 'pc',
        }))}
        onPaymentSuccess={async () => {
          const generatedCode = `FBQ-${Math.floor(1000 + Math.random() * 9000)}`;
          await addOrder({
            orderCode: generatedCode,
            customerName: profile?.name || 'CH Rakesh',
            customerPhone: profile?.phone || '+91 98765 43210',
            customerEmail: profile?.email || 'rakesh.ch@fabriq.ai',
            items: cartItems.map((c) => ({
              garmentName: c.garmentName,
              service: c.service,
              qty: c.qty,
              price: c.price,
            })),
            tagId: `RFID-${Math.floor(1000 + Math.random() * 9000)}-APP`,
            status: 'Received',
            stage: 'Order Intake & Hydro Tagging',
            priority: addExpressDelivery ? 'VIP Express' : 'Standard',
            amount: grandTotal,
            type: 'Online App Booking',
            paymentMode: selectedPayment === 'cod' ? 'Pay on Delivery' : 'Online Paid',
            decision: 'Accepted',
            branchId: activeBranch.id,
            branchName: activeBranch.name,
            estReturnDate: addExpressDelivery ? 'Today, 8:00 PM' : 'Tomorrow, 5:30 PM',
          });
          triggerOrderConfirmedNotification(generatedCode);
          triggerHaptic('heavy');
          setCartItems([]);
          onNavigate('payment-success');
        }}
      />

      <BottomNav activePath="cart" onNavigate={onNavigate} />
    </div>
  );
};
