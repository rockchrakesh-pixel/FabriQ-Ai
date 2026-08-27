import React from 'react';
import { ScreenId } from '../types';
import { BottomNav } from '../components/BottomNav';
import { useNotifications } from '../context/NotificationContext';
import { useOrders, OrderItem } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { triggerHaptic } from '../lib/haptics';

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

  const mostRecentOrder = userOrdersList[0];

  const handleReorder = (order: typeof userOrdersList[0]) => {
    triggerHaptic('medium');
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
        image:
          it.image ||
          'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=400&auto=format&fit=crop',
      }));
    } else {
      reorderItems = [
        {
          id: `reorder-${Date.now()}-0`,
          garmentName: 'Luxury Care Garments',
          service: 'Signature Dry Clean',
          price: order.amount || 299,
          qty: 1,
          image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=400&auto=format&fit=crop',
        },
      ];
    }

    try {
      localStorage.setItem('fabriq_cart_items', JSON.stringify(reorderItems));
      sendNotification(
        '⚡ Quick Reorder Added to Cart',
        `Restored ${reorderItems.length} item(s) from Order #${order.orderCode} into your cart for seamless repeat checkout.`,
        'system'
      );
      onNavigate('cart');
    } catch {
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
    <div className="flex flex-col w-full pb-28 pt-16 bg-[#070F1E] text-[#FAF9F6] min-h-screen font-sans">
      {/* Top Header */}
      <div className="px-5 pt-6 pb-2 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div>
          <span className="text-[11px] font-black text-[#E5C07B] uppercase tracking-widest font-sans flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px] text-[#D4AF37]">local_shipping</span>
            ORDER HISTORY & REPEAT CARE
          </span>
          <h1 className="font-['Libre_Caslon_Text',serif] text-2xl sm:text-3xl font-bold text-[#FAF9F6] mt-0.5">
            My Orders & Tracking
          </h1>
        </div>
        <button
          onClick={() => {
            triggerHaptic('light');
            onNavigate('order-receipt');
          }}
          className="btn-press text-xs font-bold text-[#E5C07B] flex items-center gap-1.5 bg-[#0B1528] border-2 border-[#C29C6D]/50 px-4 min-h-[44px] rounded-full hover:border-[#D4AF37] transition-all shadow-xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px] text-[#D4AF37]">receipt_long</span>
          <span>Receipts</span>
        </button>
      </div>

      {/* QUICK REORDER HERO BANNER (TOP OF SCREEN IF ORDERS EXIST) */}
      {mostRecentOrder && (
        <div className="px-5 mb-3 mt-2 max-w-7xl mx-auto w-full">
          <div className="bg-gradient-to-r from-[#0B1528] via-[#111C30] to-[#16274B] rounded-3xl p-5 border-2 border-[#C29C6D]/60 shadow-xl text-[#FAF9F6] flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
            <div className="relative z-10 space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="text-amber-400">⚡</span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#E5C07B]">
                  REPEAT YOUR USUAL CARE
                </span>
              </div>
              <h2 className="font-['Libre_Caslon_Text',serif] text-base sm:text-lg font-bold text-white">
                Quick Reorder Last Service (#{mostRecentOrder.orderCode})
              </h2>
              <p className="text-xs text-slate-300 font-medium line-clamp-1 max-w-md">
                {formatItemsString(mostRecentOrder.items)}
              </p>
            </div>

            <button
              onClick={() => handleReorder(mostRecentOrder)}
              className="btn-press relative z-10 px-5 min-h-[44px] rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#C29C6D] hover:opacity-95 text-[#0B1528] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer shrink-0 border border-amber-200"
            >
              <span className="material-symbols-outlined text-[18px]">replay</span>
              <span>Quick Reorder (₹{mostRecentOrder.amount})</span>
            </button>
          </div>
        </div>
      )}

      {/* Segmented Control Filter */}
      <div className="px-5 mb-4 mt-2 max-w-7xl mx-auto w-full">
        <div className="bg-[#0B1528] p-1.5 rounded-2xl flex items-center gap-1 border border-[#C29C6D]/30">
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
                onClick={() => {
                  triggerHaptic('light');
                  setOrderFilter(filterOpt);
                }}
                className={`flex-1 min-h-[44px] rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#C29C6D] text-[#0B1528] shadow-md scale-[1.01]'
                    : 'text-slate-300 hover:text-white hover:bg-[#121E36]'
                }`}
              >
                <span>{filterOpt}</span>
                <span
                  className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-bold ${
                    isActive
                      ? 'bg-[#0B1528] text-[#E5C07B]'
                      : 'bg-[#121E36] text-slate-300'
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
      <div className="px-5 mb-6 space-y-4 max-w-7xl mx-auto w-full">
        {loading ? (
          /* SKELETON SCREEN LOADERS FOR MYORDERS GRID */
          <div className="space-y-4">
            {[1, 2, 3].map((idx) => (
              <div
                key={idx}
                className="bg-[#0B1528] rounded-3xl p-5 border border-[#C29C6D]/20 shadow-md space-y-4 animate-pulse"
              >
                <div className="flex justify-between items-start border-b border-[#C29C6D]/10 pb-3">
                  <div className="space-y-2">
                    <div className="h-2.5 w-24 bg-slate-700 rounded" />
                    <div className="h-6 w-32 bg-slate-600 rounded" />
                  </div>
                  <div className="h-6 w-20 bg-amber-900/30 rounded-full" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-3/4 bg-slate-700 rounded" />
                  <div className="h-3 w-1/2 bg-slate-700 rounded" />
                </div>
                <div className="flex justify-between items-center pt-2">
                  <div className="h-4 w-28 bg-slate-700 rounded" />
                  <div className="h-8 w-24 bg-slate-600 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-[#0B1528] rounded-3xl p-8 text-center border-2 border-[#C29C6D]/40 shadow-xl space-y-4">
            <span className="material-symbols-outlined text-4xl text-[#D4AF37]">dry_cleaning</span>
            <p className="text-base font-bold text-[#FAF9F6] font-['Libre_Caslon_Text',serif]">
              No {orderFilter.toLowerCase()} orders found
            </p>
            <p className="text-xs text-slate-300 max-w-xs mx-auto">
              Schedule premium doorstep laundry or dry cleaning from our master care catalogue!
            </p>
            <button
              onClick={() => onNavigate('service-catalog')}
              className="btn-press px-6 min-h-[44px] bg-gradient-to-r from-[#D4AF37] to-[#C29C6D] text-[#0B1528] font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all cursor-pointer border border-amber-200"
            >
              BOOK GARMENT CARE
            </button>
          </div>
        ) : (
          filteredOrders.map((ord) => {
            const isCompleted = ord.status === 'Delivered';
            const isCancelled = ord.status === 'Cancelled';
            const isActive = !isCompleted && !isCancelled;

            return (
              <div
                key={ord.id}
                className="bg-[#0B1528] rounded-3xl p-5 shadow-lg border-2 border-[#C29C6D]/30 hover:border-[#D4AF37] transition-all space-y-4"
              >
                <div className="flex justify-between items-start border-b border-[#C29C6D]/20 pb-3">
                  <div>
                    <span className="text-[10px] font-black text-[#E5C07B] uppercase tracking-widest block">
                      {ord.priority || 'STANDARD CARE'} • {ord.type}
                    </span>
                    <h3 className="font-['Libre_Caslon_Text',serif] text-xl font-bold text-[#FAF9F6] mt-0.5">
                      #{ord.orderCode}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider mb-1 border ${
                        isCompleted
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500'
                          : isCancelled
                          ? 'bg-rose-950/80 text-rose-300 border-rose-500'
                          : 'bg-amber-950/80 text-amber-300 border-amber-500'
                      }`}
                    >
                      {ord.status}
                    </span>
                    <span className="text-sm font-black text-[#E5C07B] block font-mono">
                      ₹{ord.amount}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs font-sans">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Garments:</span>
                    <span className="font-bold text-[#FAF9F6] text-right max-w-[240px]">
                      {formatItemsString(ord.items)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Current Facility Stage:</span>
                    <span className="font-bold text-emerald-400">
                      {ord.stage || 'In Inspection'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Est. Valet Return:</span>
                    <span className="font-bold text-[#E5C07B]">
                      {ord.estReturnDate || 'Completed'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Atelier Branch:</span>
                    <span className="font-semibold text-slate-200">{ord.branchName}</span>
                  </div>
                </div>

                {/* Quick Status Simulation for Active Orders */}
                {isActive && (
                  <div className="p-3 bg-[#070F1E] rounded-2xl border border-[#C29C6D]/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Facility Status Tracking:
                      </span>
                      <span className="text-[10px] font-mono text-[#E5C07B]">Real-Time Sync</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                      <button
                        onClick={() => {
                          updateOrderStatus(ord.id, 'In Processing', 'Hydro-Extractor Washing');
                          triggerOrderConfirmedNotification(ord.orderCode);
                        }}
                        className="bg-[#0B1528] hover:bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 min-h-[38px] rounded-xl text-center font-bold transition-all cursor-pointer"
                      >
                        Washing
                      </button>
                      <button
                        onClick={() => {
                          updateOrderStatus(ord.id, 'Out for Delivery', 'Courier Valet en route');
                          triggerOutForDeliveryNotification(ord.orderCode);
                        }}
                        className="bg-[#0B1528] hover:bg-amber-950/60 border border-amber-500/50 text-amber-300 min-h-[38px] rounded-xl text-center font-bold transition-all cursor-pointer"
                      >
                        Out for Delivery
                      </button>
                      <button
                        onClick={() => {
                          updateOrderStatus(ord.id, 'Delivered', 'Valet Hand Delivered');
                          triggerDeliveredNotification(ord.orderCode);
                        }}
                        className="bg-[#0B1528] hover:bg-sky-950/60 border border-sky-500/50 text-sky-300 min-h-[38px] rounded-xl text-center font-bold transition-all cursor-pointer"
                      >
                        Delivered
                      </button>
                    </div>
                  </div>
                )}

                {/* Action Buttons with Primary Quick Reorder Button on Every Order */}
                <div className="pt-1 flex flex-wrap gap-2">
                  <button
                    onClick={() => handleReorder(ord)}
                    className="btn-press flex-1 min-w-[140px] min-h-[44px] bg-gradient-to-r from-[#D4AF37] to-[#C29C6D] hover:opacity-95 text-[#0B1528] rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer border border-amber-200"
                    title="Add all items from this order into your cart"
                  >
                    <span className="material-symbols-outlined text-[17px]">replay</span>
                    <span>Quick Reorder</span>
                  </button>

                  {isActive ? (
                    <>
                      <button
                        onClick={() => onNavigate('order-tracking')}
                        className="btn-press px-4 min-h-[44px] bg-[#070F1E] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer border border-[#C29C6D]/40 hover:border-[#D4AF37]"
                      >
                        <span>Track Stage</span>
                        <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                      </button>
                      <button
                        onClick={() => onNavigate('live-order-tracking')}
                        className="btn-press px-3.5 min-h-[44px] bg-[#070F1E] text-[#E5C07B] rounded-xl text-xs font-bold flex items-center justify-center hover:bg-[#121E36] cursor-pointer border border-[#C29C6D]/40"
                        title="Live Courier GPS Map"
                      >
                        <span className="material-symbols-outlined text-[18px]">location_on</span>
                      </button>
                    </>
                  ) : null}

                  <button
                    onClick={() => onNavigate('order-receipt')}
                    className="btn-press px-4 min-h-[44px] bg-[#070F1E] text-slate-200 border border-[#C29C6D]/40 rounded-xl text-xs font-bold hover:bg-[#121E36] cursor-pointer flex items-center gap-1.5"
                    title="Tax Invoice & Receipt"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#D4AF37]">receipt</span>
                    <span>Receipt</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Centered Guarantee Statement */}
      <div className="px-5 text-center mt-2 mb-4">
        <p className="text-[11px] font-black text-[#C29C6D] uppercase tracking-widest">
          ✦ FabriQ • DOORSTEP PICKUP & EXPRESS LUXURY CARE ✦
        </p>
      </div>

      <BottomNav activePath="orders" onNavigate={onNavigate} />
    </div>
  );
};
