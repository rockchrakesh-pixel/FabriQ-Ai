// Offline Storage and Service Worker Helper

import { useState, useEffect } from 'react';

export interface CachedCatalogItem {
  id: string;
  name: string;
  category: string;
  price: number;
  turnaround: string;
  isCached?: boolean;
}

export function registerServiceWorker() {
  if ('serviceWorker' in navigator && window.self === window.top && window.location.protocol.startsWith('http')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then(() => {
          // Service worker registered
        })
        .catch(() => {
          // Fallback gracefully in dev/sandbox environments
        });
    });
  }
}

export function useOfflineStatus() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [lastSyncTime, setLastSyncTime] = useState<string>(() => {
    return localStorage.getItem('fabriq_last_cache_sync') || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  });

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastSyncTime(timeStr);
      localStorage.setItem('fabriq_last_cache_sync', timeStr);
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOffline, lastSyncTime };
}

// Function to save catalog and orders to localStorage as fallback cache
export function cacheCatalogAndOrders(catalog: any[], orders: any[]) {
  try {
    localStorage.setItem('fabriq_offline_catalog', JSON.stringify(catalog));
    localStorage.setItem('fabriq_offline_orders', JSON.stringify(orders));
    localStorage.setItem('fabriq_last_cache_sync', new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  } catch (e) {
    console.warn('Failed to cache data offline:', e);
  }
}

export function getOfflineCachedCatalog(): any[] {
  try {
    const cached = localStorage.getItem('fabriq_offline_catalog');
    if (cached) return JSON.parse(cached);
  } catch (e) {
    console.warn(e);
  }
  return [
    { id: '1', name: 'Italian Silk Saree Dry Clean', category: 'Dry Cleaning', price: 450, turnaround: '24 Hours' },
    { id: '2', name: 'Bespoke Executive Suit Care', category: 'Suit Care', price: 650, turnaround: '48 Hours' },
    { id: '3', name: 'Luxury Sneaker & Leather Spa', category: 'Shoe Spa', price: 500, turnaround: '3 Days' },
    { id: '4', name: 'Vacuum Steam Press - Formals', category: 'Steam Ironing', price: 45, turnaround: 'Same Day' },
    { id: '5', name: 'Eco Hydro Wash & Fold', category: 'Wash & Fold', price: 89, turnaround: '24 Hours' }
  ];
}

export function getOfflineCachedOrders(): any[] {
  try {
    const cached = localStorage.getItem('fabriq_offline_orders');
    if (cached) return JSON.parse(cached);
  } catch (e) {
    console.warn(e);
  }
  return [
    {
      id: 'ORD-9821',
      date: 'Aug 12, 2026',
      items: '2x Silk Saree, 1x Tuxedo Suit',
      status: 'In Atelier Hydro Wash',
      totalAmount: 1550,
      cachedOffline: true,
    },
    {
      id: 'ORD-9740',
      date: 'Aug 04, 2026',
      items: '3x Italian Formal Shirts',
      status: 'Delivered',
      totalAmount: 480,
      cachedOffline: true,
    }
  ];
}
