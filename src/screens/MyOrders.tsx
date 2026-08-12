import React from 'react';
import { ScreenId } from '../types';
import { BottomNav } from '../components/BottomNav';
import { useNotifications } from '../context/NotificationContext';
import { useOrders, OrderItem } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';

interface ScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const MyOrders: React.FC<ScreenProps> = ({ onNavigate }) => {
  const { profile } = useAuth();
  const { orders, loading, getUserOrders, updateOrderStatus } = useOrders();
  const {
    sendNotification,
    triggerOrderConfirmedNotification,
    triggerOutForDeliveryNotification,
    triggerDeliveredNotification,
  } = useNotifications();

  const [orderFilter, setOrderFilter] = React.useState<'All' | 'Active' | 'Completed' | 'Cancelled'>('All');

  const userOrdersList = getUserOrders(profile?.email);
  
  const activeOrders = userOrdersList.filter((o) => o.status !== 'Delivered' && o.status !== 'Cancelled');
  const completedOrders = userOrdersList.filter((o) => o.status === 'Delivered');
  const cancelledOrders = userOrdersList.filter((o) => o.status === 'Cancelled');

  const filteredOrders = React.useMemo(() => {
    if (orderFilter === 'Active') return activeOrders;
    if (orderFilter === 'Completed') return completedOrders;
    if (orderFilter === 'Cancelled') return cancelledOrders;
    return userOrdersList;
  }, [orderFilter, userOrdersList, activeOrders, completedOrders, cancelledOrders]);

  const handleReorder = (order: typeof userOrdersList[0]) => {
    let reorderItems: Array<{
      id: string;
      garmentName: string;
      service: string;
      price: number;
      qty: number;
      image: string;
    }> = [];

    if (Array.isArray(order.items)) {
      reorderItems = order.items.map((it, idx) => ({
        id: `reorder-${Date.now()}-${idx}`,
        garmentName: it.garmentName,
        service: it.service,
        price: it.price,
        qty: it.qty,
        image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=400&auto=format&fit=crop',
      }));
    } else {
      reorderItems = [
        {
          id: `reorder-${Date.now()}-0`,
          garmentName: 'Garment Care Package',
          service: 'Wash & Iron',
          price: order.amount || 299,
          qty: 1,
          image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=400&auto=format&fit=crop',
        },
      ];
    }

    try {
      localStorage.setItem('fabriq_cart_items', JSON.stringify(reorderItems));
      sendNotification(
        'Order Re-created',
        `Populated cart with items from Order #${order.orderCode}. Ready for checkout!`,
        'system'
      );
      onNavigate('cart');
    } catch {
      // fallback
      onNavigate('cart');
    }
  };

  const formatItemsString = (items: string | OrderItem[]): string => {
    if (typeof items === 'string') return items;
    if (Array.isArray(items)) {
      return items.map((i) => `${i.qty}x ${i.garmentName} (${i.service})`).join(', ');
    }
    return 'Garment Care Package';
  };

  return (
    <div className="flex flex-col w-full pb-28 pt-16 bg-[#FAFAFC] text-slate-900 min-h-screen">
      {/* Top Header */}
      <div className="px-5 pt-6 pb-2 flex justify-between items-center">
        <div>
          <span className="text-[11px] font-bold text-[#9E7B4F] uppercase tracking-widest font-sans flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">local_shipping</span>
            GARMENT CARE LOG & ORDERS
          </span>
          <h1 className="font-['Libre_Caslon_Text',serif] text-2xl font-bold text-slate-900 mt-0.5">
            My Orders & Tracking
          </h1>
        </div>
        <button
          onClick={() => onNavigate('order-receipt')}
          className="text-xs font-bold text-[#9E7B4F] flex items-center gap-1 bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-full hover:bg-amber-100 transition-colors shadow-xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">receipt_long</span>
          <span>Receipts</span>
        </button>
      </div>

      {/* Segmented Control Filter */}
      <div className="px-5 mb-5 mt-2">
        <div className="bg-slate-200/80 p-1 rounded-2xl flex items-center gap-1">
          {(['All', 'Active', 'Completed', 'Cancelled'] as const).map((filterOpt) => {
            const count =
              filterOpt === 'All'
                ? userOrdersList.length
                : filterOpt === 'Active'
                ? activeOrders.length
                : filterOpt === 'Completed'
                ? completedOrders.length
                : cancelledOrders.length;
            const isActive = orderFilter === filterOpt;

            return (
              <button
                key={filterOpt}
                onClick={() => setOrderFilter(filterOpt)}
                className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  isActive
                    ? 'bg-slate-900 text-amber-300 shadow-md scale-[1.02]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>{filterOpt}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-amber-400 text-slate-950' : 'bg-slate-300 text-slate-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders List Content */}
      <div className="px-5 mb-6 space-y-4">
        {loading ? (
          /* SKELETON SCREEN LOADERS FOR MYORDERS GRID */
          <div className="space-y-4">
            {[1, 2, 3].map((idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4 animate-pulse"
              >
                <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                  <div className="space-y-2">
                    <div className="h-2.5 w-24 bg-slate-200 rounded" />
                    <div className="h-6 w-32 bg-slate-300 rounded" />
                  </div>
                  <div className="h-6 w-20 bg-amber-100/60 rounded-full" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-3/4 bg-slate-200 rounded" />
                  <div className="h-3 w-1/2 bg-slate-200 rounded" />
                </div>
                <div className="flex justify-between items-center pt-2">
                  <div className="h-4 w-28 bg-slate-200 rounded" />
                  <div className="h-8 w-24 bg-slate-300 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-6 text-center border border-slate-200 shadow-xs space-y-3">
            <span className="material-symbols-outlined text-4xl text-amber-500">dry_cleaning</span>
            <p className="text-sm font-bold text-slate-800">No {orderFilter.toLowerCase()} orders found</p>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Place a new valet laundry or dry cleaning request from the service catalog!
            </p>
            <button
              onClick={() => onNavigate('service-catalog')}
              className="px-5 py-2.5 bg-[#9E7B4F] text-white font-bold text-xs rounded-xl shadow-md hover:bg-[#83633B] transition-colors cursor-pointer"
            >
              Browse Care Catalog
            </button>
          </div>
        ) : (
          filteredOrders.map((ord) => {
            const isCompleted = ord.status === 'Delivered';
            const isCancelled = ord.status === 'Cancelled';
            const isActive = !isCompleted && !isCancelled;

            return (
              <div key={ord.id} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 space-y-4">
                <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-[#9E7B4F] uppercase tracking-widest block">
                      {ord.priority || 'STANDARD CARE'} • {ord.type}
                    </span>
                    <h3 className="font-['Libre_Caslon_Text',serif] text-xl font-bold text-slate-900 mt-0.5">
                      #{ord.orderCode}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-1 border ${
                        isCompleted
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : isCancelled
                          ? 'bg-rose-50 text-rose-800 border-rose-300'
                          : 'bg-amber-100 text-[#83633B] border-amber-300'
                      }`}
                    >
                      {ord.status}
                    </span>
                    <span className="text-xs font-bold text-slate-900 block font-mono">₹{ord.amount}</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs font-sans">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Garments:</span>
                    <span className="font-bold text-slate-900 text-right max-w-[220px]">
                      {formatItemsString(ord.items)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Current Facility Stage:</span>
                    <span className="font-bold text-emerald-700">{ord.stage || 'In Inspection'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Est. Valet Return:</span>
                    <span className="font-bold text-[#9E7B4F]">{ord.estReturnDate || 'Completed'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Atelier Branch:</span>
                    <span className="font-medium text-slate-700">{ord.branchName}</span>
                  </div>
                </div>

                {/* Quick Status Simulation for Active Orders */}
                {isActive && (
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Simulate Live Firestore Status Update:
                      </span>
                      <span className="text-[10px] font-mono text-[#9E7B4F]">Real-Time Sync</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                      <button
                        onClick={() => {
                          updateOrderStatus(ord.id, 'In Processing', 'Hydro-Extractor Washing');
                          triggerOrderConfirmedNotification(ord.orderCode);
                        }}
                        className="bg-white hover:bg-emerald-50 border border-emerald-300 text-emerald-700 py-1.5 rounded-xl text-center font-bold transition-colors cursor-pointer"
                      >
                        Washing
                      </button>
                      <button
                        onClick={() => {
                          updateOrderStatus(ord.id, 'Out for Delivery', 'Courier Valet en route');
                          triggerOutForDeliveryNotification(ord.orderCode);
                        }}
                        className="bg-white hover:bg-amber-50 border border-amber-300 text-amber-700 py-1.5 rounded-xl text-center font-bold transition-colors cursor-pointer"
                      >
                        Out for Delivery
                      </button>
                      <button
                        onClick={() => {
                          updateOrderStatus(ord.id, 'Delivered', 'Valet Hand Delivered');
                          triggerDeliveredNotification(ord.orderCode);
                        }}
                        className="bg-white hover:bg-sky-50 border border-sky-300 text-sky-700 py-1.5 rounded-xl text-center font-bold transition-colors cursor-pointer"
                      >
                        Delivered
                      </button>
                    </div>
                  </div>
                )}

                <div className="pt-1 flex gap-2">
                  {isCompleted || isCancelled ? (
                    <>
                      <button
                        onClick={() => handleReorder(ord)}
                        className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-[#9E7B4F] hover:from-amber-400 hover:to-[#83633B] text-slate-950 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer active:scale-95"
                      >
                        <span className="material-symbols-outlined text-[18px]">replay</span>
                        <span>Re-order Items</span>
                      </button>
                      <button
                        onClick={() => onNavigate('order-receipt')}
                        className="px-4 py-3 bg-slate-100 text-slate-800 border border-slate-200 rounded-2xl text-xs font-bold hover:bg-slate-200 cursor-pointer shadow-2xs flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[16px]">receipt</span>
                        <span>Receipt</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => onNavigate('order-tracking')}
                        className="flex-1 py-3 bg-[#9E7B4F] hover:bg-[#83633B] text-white rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                      >
                        <span>Track Stage Details</span>
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </button>
                      <button
                        onClick={() => onNavigate('live-order-tracking')}
                        className="px-3 py-3 bg-slate-900 text-amber-300 rounded-2xl text-xs font-bold flex items-center justify-center hover:bg-slate-800 cursor-pointer shadow-sm"
                        title="Live Courier GPS Map"
                      >
                        <span className="material-symbols-outlined text-[18px]">location_on</span>
                      </button>
                      <button
                        onClick={() => onNavigate('order-receipt')}
                        className="px-3 py-3 bg-slate-100 text-slate-800 border border-slate-200 rounded-2xl text-xs font-bold flex items-center justify-center hover:bg-slate-200 cursor-pointer shadow-2xs"
                        title="Tax Invoice & Receipt"
                      >
                        <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <BottomNav activePath="orders" onNavigate={onNavigate} />
    </div>
  );
};
