import React, { useState } from 'react';

export interface InventoryItem {
  id: string;
  name: string;
  category: 'solvents' | 'packaging' | 'machinery' | 'boutique_apparel' | 'dyes';
  stockOnHand: number;
  minThreshold: number;
  unit: string;
  unitCost: number;
  lastSynced: string;
  status: 'optimal' | 'low_stock' | 'critical';
}

export interface FranchiseOrder {
  orderId: string;
  customerName: string;
  garmentCount: number;
  serviceType: string;
  currentStatus: 'Received' | 'In Inspection' | 'Solvent Wash' | 'Steam Pressing' | 'QC Signoff' | 'Valet Ready';
  deliveryDate: string;
  totalAmount: number;
}

const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'INV-01',
    name: 'GreenEarth® Hydrocarbon Solvent',
    category: 'solvents',
    stockOnHand: 6,
    minThreshold: 50,
    unit: 'Liters',
    unitCost: 850,
    lastSynced: '10 mins ago',
    status: 'critical',
  },
  {
    id: 'INV-02',
    name: 'FabriQ Gold Monogram Velvet Hangers',
    category: 'packaging',
    stockOnHand: 320,
    minThreshold: 100,
    unit: 'Pieces',
    unitCost: 120,
    lastSynced: '10 mins ago',
    status: 'optimal',
  },
  {
    id: 'INV-03',
    name: 'Breathable Silk & Leather Garment Covers',
    category: 'packaging',
    stockOnHand: 180,
    minThreshold: 150,
    unit: 'Covers',
    unitCost: 95,
    lastSynced: '10 mins ago',
    status: 'optimal',
  },
  {
    id: 'INV-04',
    name: 'Italian Vacuum Steam Table Replacement Pad',
    category: 'machinery',
    stockOnHand: 0,
    minThreshold: 2,
    unit: 'Pads',
    unitCost: 4500,
    lastSynced: '10 mins ago',
    status: 'critical',
  },
  {
    id: 'INV-05',
    name: 'German Leather Dye & Sneaker Recraft Kit',
    category: 'dyes',
    stockOnHand: 15,
    minThreshold: 10,
    unit: 'Kits',
    unitCost: 2200,
    lastSynced: '10 mins ago',
    status: 'optimal',
  },
];

const INITIAL_ORDERS: FranchiseOrder[] = [
  {
    orderId: 'ORD-9821',
    customerName: 'Ananya Birman',
    garmentCount: 3,
    serviceType: 'Couture Silk Lehenga & Zardozi Steam',
    currentStatus: 'In Inspection',
    deliveryDate: 'Today, 6:00 PM',
    totalAmount: 4800,
  },
  {
    orderId: 'ORD-9822',
    customerName: 'Karan Singhania',
    garmentCount: 2,
    serviceType: 'Italian Tuxedo Dry Clean & Press',
    currentStatus: 'Solvent Wash',
    deliveryDate: 'Tomorrow, 12:00 PM',
    totalAmount: 3200,
  },
  {
    orderId: 'ORD-9823',
    customerName: 'Radhika Merchant',
    garmentCount: 4,
    serviceType: 'Hermès Birkin Leather Spa & Recraft',
    currentStatus: 'Steam Pressing',
    deliveryDate: 'Aug 16, 2026',
    totalAmount: 9500,
  },
  {
    orderId: 'ORD-9824',
    customerName: 'Devendra Jhunjhunwala',
    garmentCount: 1,
    serviceType: 'Sabyasachi Bridal Saree Preservation',
    currentStatus: 'QC Signoff',
    deliveryDate: 'Aug 16, 2026',
    totalAmount: 6500,
  },
];

export const FranchiseInventorySync: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders'>('inventory');
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [orders, setOrders] = useState<FranchiseOrder[]>(INITIAL_ORDERS);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Sync inventory with central warehouse
  const handleTriggerSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setInventory((prev) =>
        prev.map((item) => ({
          ...item,
          lastSynced: 'Just Now',
          stockOnHand: item.status === 'critical' ? item.stockOnHand + 10 : item.stockOnHand,
          status: item.status === 'critical' ? 'optimal' : item.status,
        }))
      );
      setSyncMessage('Inventory synchronized with Central FabriQ Warehouse stock engine.');
      setTimeout(() => setSyncMessage(null), 4000);
    }, 1200);
  };

  // Adjust stock
  const handleAdjustStock = (id: string, delta: number) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(0, item.stockOnHand + delta);
          const newStatus =
            newQty <= item.minThreshold / 2
              ? 'critical'
              : newQty <= item.minThreshold
              ? 'low_stock'
              : 'optimal';
          return { ...item, stockOnHand: newQty, status: newStatus };
        }
        return item;
      })
    );
  };

  // Update order status directly
  const handleUpdateOrderStatus = (orderId: string, nextStatus: FranchiseOrder['currentStatus']) => {
    setOrders((prev) =>
      prev.map((o) => (o.orderId === orderId ? { ...o, currentStatus: nextStatus } : o))
    );
    setSyncMessage(`Order ${orderId} updated to "${nextStatus}". Valet & Customer notified.`);
    setTimeout(() => setSyncMessage(null), 4000);
  };

  const statusOptions: FranchiseOrder['currentStatus'][] = [
    'Received',
    'In Inspection',
    'Solvent Wash',
    'Steam Pressing',
    'QC Signoff',
    'Valet Ready',
  ];

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4 font-sans">
      {/* Toast Notification */}
      {syncMessage && (
        <div className="bg-slate-900 text-amber-300 p-3 rounded-2xl border border-amber-400/50 text-xs font-bold flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-400 text-[18px]">sync</span>
            <span>{syncMessage}</span>
          </div>
          <button onClick={() => setSyncMessage(null)} className="text-slate-400 hover:text-white">
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <span className="text-[10px] font-extrabold text-[#9E7B4F] uppercase tracking-widest bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
            BOUTIQUE INVENTORY & ORDER SYNC
          </span>
          <h3 className="font-['Libre_Caslon_Text',serif] text-xl font-bold text-slate-900 mt-1">
            Real-Time Atelier Inventory & Order Workflow
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Tab Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'inventory'
                  ? 'bg-slate-900 text-amber-300 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Stock Inventory ({inventory.length})
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-slate-900 text-amber-300 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Order Flow ({orders.length})
            </button>
          </div>

          <button
            onClick={handleTriggerSync}
            disabled={isSyncing}
            className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-xs cursor-pointer transition-all flex items-center gap-1 shrink-0"
          >
            <span className={`material-symbols-outlined text-[16px] ${isSyncing ? 'animate-spin' : ''}`}>
              sync
            </span>
            <span>{isSyncing ? 'Syncing...' : 'Pull Sync'}</span>
          </button>
        </div>
      </div>

      {/* TAB 1: STOCK INVENTORY MANAGEMENT */}
      {activeTab === 'inventory' && (
        <div className="space-y-3">
          {/* Automated Low Stock System Warning Banner */}
          {inventory.filter((item) => (item.stockOnHand / item.minThreshold) < 0.15).length > 0 && (
            <div className="bg-rose-950 text-white p-4 rounded-2xl border border-rose-500/80 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold shrink-0">
                  <span className="material-symbols-outlined text-[24px]">warning</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase text-rose-300 tracking-wider">
                      AUTOMATED LOW-STOCK SYSTEM ALERT
                    </span>
                    <span className="bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                      CRITICAL (&lt;15% THRESHOLD)
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-white mt-0.5">
                    {inventory.filter((item) => (item.stockOnHand / item.minThreshold) < 0.15).length} Items Falling Below 15% Minimum Safety Threshold
                  </h4>
                  <p className="text-xs text-rose-200">
                    {inventory
                      .filter((item) => (item.stockOnHand / item.minThreshold) < 0.15)
                      .map((i) => `${i.name} (${i.stockOnHand} ${i.unit} left, ${Math.round((i.stockOnHand / i.minThreshold) * 100)}% of min)`)
                      .join(' • ')}
                  </p>
                </div>
              </div>

              <button
                onClick={handleTriggerSync}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-1.5 shrink-0"
              >
                <span className="material-symbols-outlined text-[16px]">local_shipping</span>
                <span>Trigger Emergency Dispatch PO</span>
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {inventory.map((item) => {
              const stockRatio = (item.stockOnHand / item.minThreshold) * 100;
              const isBelow15Percent = stockRatio < 15;
              const isCritical = item.status === 'critical' || isBelow15Percent;
              const isLow = item.status === 'low_stock';

              return (
                <div
                  key={item.id}
                  className={`rounded-2xl p-4 border transition-all ${
                    isBelow15Percent
                      ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-200 shadow-xs'
                      : isCritical
                      ? 'bg-rose-50 border-rose-300'
                      : isLow
                      ? 'bg-amber-50 border-amber-300'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[9px] font-mono text-slate-400 font-bold block">{item.id}</span>
                      <h4 className="font-['Libre_Caslon_Text',serif] font-bold text-slate-900 text-sm">
                        {item.name}
                      </h4>
                    </div>

                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                        isBelow15Percent
                          ? 'bg-rose-600 text-white border-rose-700 animate-pulse'
                          : isCritical
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : isLow
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      }`}
                    >
                      {isBelow15Percent ? '<15% CRITICAL' : item.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200 my-2">
                    <div>
                      <span className="text-[9px] text-slate-400 block font-bold uppercase">Current Stock</span>
                      <span className="font-bold text-slate-900 text-base">
                        {item.stockOnHand} {item.unit}
                      </span>
                      <span className={`text-[10px] font-bold block ${isBelow15Percent ? 'text-rose-600' : 'text-slate-500'}`}>
                        {Math.round(stockRatio)}% of Min Safety Level
                      </span>
                    </div>

                    {/* Stock Adjustment Controls */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                      <button
                        onClick={() => handleAdjustStock(item.id, -1)}
                        className="w-6 h-6 rounded bg-white hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center cursor-pointer shadow-xs"
                      >
                        -
                      </button>
                      <button
                        onClick={() => handleAdjustStock(item.id, 1)}
                        className="w-6 h-6 rounded bg-white hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center cursor-pointer shadow-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                    <span>Min Threshold: {item.minThreshold} {item.unit}</span>
                    <span>Synced: {item.lastSynced}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: ORDER WORKFLOW & STATUS UPDATER */}
      {activeTab === 'orders' && (
        <div className="space-y-3">
          {orders.map((ord) => (
            <div
              key={ord.orderId}
              className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-900 text-amber-300 border border-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                  <span className="material-symbols-outlined text-[20px]">local_laundry_service</span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{ord.orderId}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs font-semibold text-slate-700">{ord.customerName}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[11px] font-bold text-amber-700">₹{ord.totalAmount}</span>
                  </div>

                  <h4 className="font-['Libre_Caslon_Text',serif] font-bold text-slate-900 text-sm mt-0.5">
                    {ord.serviceType} ({ord.garmentCount} Items)
                  </h4>

                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Scheduled Delivery: <strong className="text-slate-800">{ord.deliveryDate}</strong>
                  </p>
                </div>
              </div>

              {/* Status Selector dropdown */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Update Status:</span>
                <select
                  value={ord.currentStatus}
                  onChange={(e) =>
                    handleUpdateOrderStatus(ord.orderId, e.target.value as FranchiseOrder['currentStatus'])
                  }
                  className="bg-slate-900 text-amber-300 border border-slate-700 font-bold text-xs px-3 py-1.5 rounded-xl focus:outline-none focus:border-amber-400 cursor-pointer shadow-xs"
                >
                  {statusOptions.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
