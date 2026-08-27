import React, { useState } from 'react';
import { useNotifications, AppNotification } from '../context/NotificationContext';

interface NotificationCenterProps {
  onNavigate: (screenId: any) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onNavigate }) => {
  const {
    notifications,
    unreadCount,
    activePushToast,
    dismissToast,
    isDrawerOpen,
    setIsDrawerOpen,
    markAsRead,
    markAllAsRead,
    clearAll,
    triggerOrderConfirmedNotification,
    triggerOutForDeliveryNotification,
    triggerDeliveredNotification,
    triggerPromoNotification,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState<'all' | 'orders' | 'promos'>('all');

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'orders') return n.type === 'order_confirmed' || n.type === 'out_for_delivery' || n.type === 'delivered';
    if (activeTab === 'promos') return n.type === 'promo';
    return true;
  });

  const getNotificationIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'order_confirmed':
        return { icon: 'task_alt', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
      case 'out_for_delivery':
        return { icon: 'local_shipping', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
      case 'delivered':
        return { icon: 'verified', color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' };
      case 'promo':
        return { icon: 'auto_awesome', color: 'text-[#C29C6D] bg-[#C29C6D]/10 border-[#C29C6D]/20' };
      default:
        return { icon: 'notifications', color: 'text-gray-300 bg-gray-500/10 border-gray-500/20' };
    }
  };

  return (
    <>
      {/* Active Floating Push Notification Banner Toast */}
      {activePushToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] w-[92%] max-w-md bg-[#161616] border border-[#C29C6D]/40 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] p-4 animate-in slide-in-from-top-5 duration-300 backdrop-blur-xl">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-xl border ${getNotificationIcon(activePushToast.type).color} flex items-center justify-center`}>
                <span className="material-symbols-outlined text-[20px]">{getNotificationIcon(activePushToast.type).icon}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#C29C6D] uppercase tracking-wider px-1.5 py-0.2 rounded bg-[#C29C6D]/10 border border-[#C29C6D]/20">
                    {activePushToast.badgeText || 'PUSH ALERT'}
                  </span>
                  <span className="text-[10px] text-gray-400">{activePushToast.timestamp}</span>
                </div>
                <h4 className="text-sm font-bold text-[#F2F2F2] mt-0.5">{activePushToast.title}</h4>
                <p className="text-xs text-gray-300 leading-snug">{activePushToast.message}</p>
              </div>
            </div>
            <button
              onClick={dismissToast}
              className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Dismiss Push Notification"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#2A2A2A] flex items-center justify-between">
            <span className="text-[10px] text-gray-400">FabriQ Ai Push Service</span>
            <div className="flex gap-2">
              {activePushToast.orderId && (
                <button
                  onClick={() => {
                    dismissToast();
                    onNavigate('live-order-tracking');
                  }}
                  className="bg-[#C29C6D] text-[#0A0A0A] font-bold text-xs px-3 py-1 rounded-lg hover:bg-[#d4b187] transition-colors"
                >
                  Track Order
                </button>
              )}
              {activePushToast.promoCode && (
                <button
                  onClick={() => {
                    dismissToast();
                    onNavigate('service-catalog');
                  }}
                  className="bg-[#C29C6D] text-[#0A0A0A] font-bold text-xs px-3 py-1 rounded-lg hover:bg-[#d4b187] transition-colors"
                >
                  Use Code: {activePushToast.promoCode}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Slide-over Notification Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-[90] flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="fixed inset-0"
            onClick={() => setIsDrawerOpen(false)}
          ></div>

          <div className="relative w-full max-w-md bg-[#0F0F0F] border-l border-[#2A2A2A] h-full flex flex-col shadow-2xl z-10">
            {/* Header */}
            <div className="p-5 border-b border-[#2A2A2A] flex items-center justify-between bg-[#141414]">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#C29C6D]/10 border border-[#C29C6D]/30 text-[#C29C6D]">
                  <span className="material-symbols-outlined text-[20px]">notifications_active</span>
                </div>
                <div>
                  <h2 className="font-['Libre_Caslon_Text',serif] text-lg font-bold text-[#F2F2F2]">
                    Notifications Center
                  </h2>
                  <p className="text-[11px] text-gray-400">Order Updates & FabriQ AI Alerts</p>
                </div>
              </div>

              <button
                onClick={() => setIsDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-[#1A1A1A] text-gray-300 hover:text-white hover:bg-[#2A2A2A] flex items-center justify-center transition-colors border border-[#2A2A2A]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Quick Demo Test Trigger Buttons */}
            <div className="p-3 bg-[#121212] border-b border-[#2A2A2A]">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#C29C6D] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">bolt</span>
                  Simulate Push Alerts
                </span>
                <span className="text-[10px] text-gray-500">Click to test live push</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => triggerOrderConfirmedNotification()}
                  className="bg-[#1A1A1A] hover:bg-[#252525] border border-emerald-500/30 text-emerald-400 text-[11px] font-medium py-1.5 px-2 rounded-lg flex items-center gap-1 transition-colors text-left truncate"
                >
                  <span className="material-symbols-outlined text-[14px]">task_alt</span>
                  Order Confirmed
                </button>
                <button
                  onClick={() => triggerOutForDeliveryNotification()}
                  className="bg-[#1A1A1A] hover:bg-[#252525] border border-amber-500/30 text-amber-400 text-[11px] font-medium py-1.5 px-2 rounded-lg flex items-center gap-1 transition-colors text-left truncate"
                >
                  <span className="material-symbols-outlined text-[14px]">local_shipping</span>
                  Out for Delivery
                </button>
                <button
                  onClick={() => triggerDeliveredNotification()}
                  className="bg-[#1A1A1A] hover:bg-[#252525] border border-sky-500/30 text-sky-400 text-[11px] font-medium py-1.5 px-2 rounded-lg flex items-center gap-1 transition-colors text-left truncate"
                >
                  <span className="material-symbols-outlined text-[14px]">verified</span>
                  Delivered Success
                </button>
                <button
                  onClick={() => triggerPromoNotification()}
                  className="bg-[#1A1A1A] hover:bg-[#252525] border border-[#C29C6D]/30 text-[#C29C6D] text-[11px] font-medium py-1.5 px-2 rounded-lg flex items-center gap-1 transition-colors text-left truncate"
                >
                  <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                  Promo Offer 20%
                </button>
              </div>
            </div>

            {/* Filter Tabs & Quick Actions */}
            <div className="px-5 py-3 border-b border-[#2A2A2A] flex items-center justify-between bg-[#0F0F0F]">
              <div className="flex gap-1 bg-[#1A1A1A] p-1 rounded-xl border border-[#2A2A2A]">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'all' ? 'bg-[#C29C6D] text-[#0A0A0A]' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  All ({notifications.length})
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'orders' ? 'bg-[#C29C6D] text-[#0A0A0A]' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Orders
                </button>
                <button
                  onClick={() => setActiveTab('promos')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'promos' ? 'bg-[#C29C6D] text-[#0A0A0A]' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Offers
                </button>
              </div>

              {notifications.length > 0 && (
                <div className="flex gap-2 text-xs">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[#C29C6D] hover:underline"
                    >
                      Read All
                    </button>
                  )}
                  <button
                    onClick={clearAll}
                    className="text-gray-500 hover:text-rose-400"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filteredNotifications.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-gray-500">
                  <span className="material-symbols-outlined text-[48px] text-gray-600 mb-2">notifications_off</span>
                  <p className="text-sm font-semibold text-gray-300">No notifications found</p>
                  <p className="text-xs text-gray-500 mt-1">Use the simulation buttons above to generate live push notifications!</p>
                </div>
              ) : (
                filteredNotifications.map((item) => {
                  const style = getNotificationIcon(item.type);
                  return (
                    <div
                      key={item.id}
                      onClick={() => markAsRead(item.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                        item.read
                          ? 'bg-[#121212] border-[#222222] opacity-80 hover:opacity-100'
                          : 'bg-[#161616] border-[#C29C6D]/40 shadow-md'
                      }`}
                    >
                      {!item.read && (
                        <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[#C29C6D] animate-ping"></span>
                      )}

                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-xl border ${style.color} flex items-center justify-center shrink-0`}>
                          <span className="material-symbols-outlined text-[18px]">{style.icon}</span>
                        </div>

                        <div className="flex-1 pr-4">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold text-[#C29C6D] uppercase tracking-wider">
                              {item.badgeText || item.type.replace('_', ' ')}
                            </span>
                            <span className="text-[10px] text-gray-500">• {item.timestamp}</span>
                          </div>

                          <h4 className="text-sm font-bold text-[#F2F2F2] leading-snug">{item.title}</h4>
                          <p className="text-xs text-gray-400 mt-1 leading-relaxed">{item.message}</p>

                          <div className="mt-3 flex items-center gap-2">
                            {item.orderId && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsDrawerOpen(false);
                                  onNavigate('live-order-tracking');
                                }}
                                className="text-xs bg-[#C29C6D] text-[#0A0A0A] font-bold px-3 py-1 rounded-lg hover:bg-[#d4b187] transition-colors flex items-center gap-1"
                              >
                                <span className="material-symbols-outlined text-[14px]">map</span>
                                Track Order
                              </button>
                            )}

                            {item.promoCode && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(item.promoCode || '');
                                  setIsDrawerOpen(false);
                                  onNavigate('service-catalog');
                                }}
                                className="text-xs bg-[#1A1A1A] border border-[#C29C6D]/40 text-[#C29C6D] font-bold px-3 py-1 rounded-lg hover:bg-[#2A2A2A] transition-colors flex items-center gap-1"
                              >
                                <span className="material-symbols-outlined text-[14px]">content_copy</span>
                                Copy Code: {item.promoCode}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
