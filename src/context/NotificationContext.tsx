import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'order_confirmed' | 'out_for_delivery' | 'delivered' | 'promo' | 'system';
  timestamp: string;
  read: boolean;
  orderId?: string;
  promoCode?: string;
  badgeText?: string;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  activePushToast: AppNotification | null;
  dismissToast: () => void;
  sendNotification: (
    title: string,
    message: string,
    type: AppNotification['type'],
    meta?: { orderId?: string; promoCode?: string; badgeText?: string }
  ) => void;
  triggerOrderConfirmedNotification: (orderId?: string) => void;
  triggerOutForDeliveryNotification: (orderId?: string) => void;
  triggerDeliveredNotification: (orderId?: string) => void;
  triggerPromoNotification: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
}

const initialNotifications: AppNotification[] = [
  {
    id: 'n1',
    title: 'Order #FAB-8921 Confirmed',
    message: 'Your silk & cashmere garment care order has been accepted. Valet pickup scheduled today at 2:00 PM.',
    type: 'order_confirmed',
    timestamp: '10 mins ago',
    read: false,
    orderId: 'FAB-8921',
    badgeText: 'CONFIRMED',
  },
  {
    id: 'n2',
    title: 'Out for Delivery 🚚',
    message: 'Valet Marco is en route with your pristine dry cleaned tailored suits. Estimated arrival in 12 mins.',
    type: 'out_for_delivery',
    timestamp: '2 hours ago',
    read: false,
    orderId: 'FAB-8890',
    badgeText: 'EN ROUTE',
  },
  {
    id: 'n3',
    title: '✨ Exclusive FabriQ AI Offer',
    message: 'Get 25% OFF luxury Leather & Shoe Spa treatments this weekend with code SILK25.',
    type: 'promo',
    timestamp: '1 day ago',
    read: true,
    promoCode: 'SILK25',
    badgeText: 'PROMO 25% OFF',
  },
  {
    id: 'n4',
    title: 'Garments Delivered Successfully',
    message: 'Order #FAB-8760 was safely handed over to concierge. Inspection report verified 100% stain removal.',
    type: 'delivered',
    timestamp: '2 days ago',
    read: true,
    orderId: 'FAB-8760',
    badgeText: 'DELIVERED',
  },
];

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  activePushToast: null,
  dismissToast: () => {},
  sendNotification: () => {},
  triggerOrderConfirmedNotification: () => {},
  triggerOutForDeliveryNotification: () => {},
  triggerDeliveredNotification: () => {},
  triggerPromoNotification: () => {},
  markAsRead: () => {},
  markAllAsRead: () => {},
  clearAll: () => {},
  isDrawerOpen: false,
  setIsDrawerOpen: () => {},
});

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('fabriq_notifications');
    return saved ? JSON.parse(saved) : initialNotifications;
  });
  const [activePushToast, setActivePushToast] = useState<AppNotification | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('fabriq_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const playChimeSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.2); // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      // Audio context might be restricted before interaction
    }
  };

  const sendNotification = (
    title: string,
    message: string,
    type: AppNotification['type'],
    meta?: { orderId?: string; promoCode?: string; badgeText?: string }
  ) => {
    const newNotif: AppNotification = {
      id: 'notif_' + Date.now(),
      title,
      message,
      type,
      timestamp: 'Just now',
      read: false,
      orderId: meta?.orderId,
      promoCode: meta?.promoCode,
      badgeText: meta?.badgeText || type.toUpperCase().replace(/_/g, ' '),
    };

    setNotifications((prev) => [newNotif, ...prev]);
    setActivePushToast(newNotif);
    playChimeSound();

    // Auto dismiss active toast banner after 6s
    setTimeout(() => {
      setActivePushToast((curr) => (curr?.id === newNotif.id ? null : curr));
    }, 6000);
  };

  const dismissToast = () => {
    setActivePushToast(null);
  };

  const triggerOrderConfirmedNotification = (orderId = 'FAB-9042') => {
    sendNotification(
      `Order #${orderId} Confirmed!`,
      `Your premium fabric care order has been placed. Our valet driver has accepted your pickup request for Today at 2:30 PM.`,
      'order_confirmed',
      { orderId, badgeText: 'CONFIRMED' }
    );
  };

  const triggerOutForDeliveryNotification = (orderId = 'FAB-9042') => {
    sendNotification(
      `Out for Delivery 🚚`,
      `Order #${orderId} is currently with Valet Driver Alex. Live GPS tracking active — 8 mins away!`,
      'out_for_delivery',
      { orderId, badgeText: 'OUT FOR DELIVERY' }
    );
  };

  const triggerDeliveredNotification = (orderId = 'FAB-9042') => {
    sendNotification(
      `Garments Delivered Successfully ✨`,
      `Order #${orderId} has been delivered in anti-wrinkle breathable wardrobe covers. Thank you for choosing FabriQ Ai!`,
      'delivered',
      { orderId, badgeText: 'DELIVERED' }
    );
  };

  const triggerPromoNotification = () => {
    const promos = [
      {
        title: '🌟 FabriQ AI VIP Promo: 20% OFF',
        message: 'Enjoy 20% off Eco-Laundry & Silk Steam Press using code FABRIQ20 on your next booking!',
        code: 'FABRIQ20',
      },
      {
        title: '👟 Shoe & Sneaker Spa Offer',
        message: 'Complimentary waterproofing shield on all designer footwear restoration this week. Code: SHOESPA',
        code: 'SHOESPA',
      },
      {
        title: '🌱 Eco Green Friday 30% OFF',
        message: '100% biodegradable zero-emission laundry special. Save 30% with promo code ECO30!',
        code: 'ECO30',
      },
    ];
    const item = promos[Math.floor(Math.random() * promos.length)];
    sendNotification(item.title, item.message, 'promo', {
      promoCode: item.code,
      badgeText: 'PROMOTIONAL OFFER',
    });
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        activePushToast,
        dismissToast,
        sendNotification,
        triggerOrderConfirmedNotification,
        triggerOutForDeliveryNotification,
        triggerDeliveredNotification,
        triggerPromoNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
        isDrawerOpen,
        setIsDrawerOpen,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
