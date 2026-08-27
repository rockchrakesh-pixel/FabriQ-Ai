import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOrders, OrderItem } from '../context/OrderContext';
import { useBranch } from '../context/BranchContext';
import { ScreenId, getDefaultPortalForRole } from '../types';
import { ExportDataButton } from '../components/ExportDataButton';
import { EnterprisePortalHeader } from '../components/EnterprisePortalHeader';
import { BusinessConfigCenter } from '../components/admin/BusinessConfigCenter';

interface StoreManagerDashboardProps {
  onNavigate: (screen: ScreenId) => void;
}

export const StoreManagerDashboard: React.FC<StoreManagerDashboardProps> = ({ onNavigate }) => {
  const { currentRole, profile } = useAuth();
  const { activeBranch } = useBranch();
  const { orders, addOrder, updateOrderStatus, updateOrderDecision } = useOrders();

  // Component-level authorization check
  const isAuthorized = ['store_manager', 'store_staff', 'pickup_executive', 'delivery_executive', 'quality_inspector', 'inventory', 'area_manager', 'regional_manager', 'franchise_owner', 'owner', 'ceo', 'super_admin'].includes(currentRole);
  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center font-sans">
        <div className="bg-white border-2 border-rose-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 mx-auto flex items-center justify-center">
            <span className="material-symbols-outlined text-[36px]">shield_lock</span>
          </div>
          <div>
            <span className="bg-rose-100 text-rose-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider inline-block mb-1">
              ROLE RESTRICTION ENFORCED
            </span>
            <h2 className="font-['Libre_Caslon_Text',serif] text-xl font-bold text-slate-900">
              Store Manager Operations Restricted
            </h2>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Your role (<strong className="text-slate-900">{currentRole}</strong>) is restricted from access to branch counter ERP intake controls.
            </p>
          </div>
          <button
            onClick={() => onNavigate(getDefaultPortalForRole(currentRole))}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">home</span>
            <span>Return to Assigned Portal</span>
          </button>
        </div>
      </div>
    );
  }

  const [activeFilter, setActiveFilter] = useState<'intake' | 'config' | 'manual_order' | 'pricing' | 'reports' | 'machines'>('intake');
  const [isStoreOpen, setIsStoreOpen] = useState(true);
  const [reportDate, setReportDate] = useState('2026-08-05');

  // Manual Offline Order State
  const [showManualModal, setShowManualModal] = useState(false);
  const [walkinName, setWalkinName] = useState('');
  const [walkinPhone, setWalkinPhone] = useState('');
  const [walkinItem, setWalkinItem] = useState('Shirt (Wash & Iron)');
  const [walkinPrice, setWalkinPrice] = useState('79');
  const [walkinQty, setWalkinQty] = useState('2');
  const [createdInvoice, setCreatedInvoice] = useState<any>(null);

  // Garment Price Settings
  const [garmentPrices, setGarmentPrices] = useState([
    { garment: 'Shirt', washIron: 79, dryClean: 99, steamPress: 15 },
    { garment: 'T-Shirt', washIron: 69, dryClean: 89, steamPress: 15 },
    { garment: 'Trouser', washIron: 79, dryClean: 89, steamPress: 15 },
    { garment: 'Silk Saree', washIron: 149, dryClean: 299, steamPress: 99 },
    { garment: 'Suit (2 Piece)', washIron: 199, dryClean: 449, steamPress: 149 },
  ]);

  const pickupReports = [
    { time: '09:00 AM - 11:00 AM', customer: 'Siddharth Rao', address: 'Jubilee Hills Road #36', driver: 'Ramesh (Valet #4)', status: 'Picked Up' },
    { time: '11:30 AM - 01:30 PM', customer: 'Meera Kapoor', address: 'Banjara Hills Road #12', driver: 'Suresh (Valet #2)', status: 'Picked Up' },
    { time: '03:00 PM - 05:00 PM', customer: 'Vikram Joshi', address: 'Film Nagar Phase 2', driver: 'Ramesh (Valet #4)', status: 'Scheduled' },
  ];

  const deliveryReports = [
    { time: '10:00 AM', customer: 'CH Rakesh', address: 'Madhapur Near Metro', driver: 'Kiran (Valet #1)', payment: 'Paid Online', status: 'Delivered' },
    { time: '02:00 PM', customer: 'Karan Mehra', address: 'Gachibowli DLF Cybercity', driver: 'Suresh (Valet #2)', payment: 'Collect Cash ₹449', status: 'Out For Delivery' },
    { time: '06:00 PM', customer: 'Deepak Reddy', address: 'Kondapur Main Rd', driver: 'Kiran (Valet #1)', payment: 'Collect Cash ₹890', status: 'Ready' },
  ];

  const toggleOrderStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Received' ? 'In Processing' : currentStatus === 'In Processing' ? 'Ready for delivery' : 'Delivered';
    const nextStage = nextStatus === 'In Processing' ? 'Hydro Washing & Extraction' : nextStatus === 'Ready for delivery' ? 'Steam Press & Hanger' : 'Valet Delivered';
    await updateOrderStatus(id, nextStatus as any, nextStage);
  };

  const handleAcceptReject = async (id: string, decision: 'Accepted' | 'Rejected') => {
    await updateOrderDecision(id, decision);
  };

  const handleCreateOfflineOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const total = parseInt(walkinPrice || '0') * parseInt(walkinQty || '1');
    const orderCode = `OFFLINE-${Math.floor(1000 + Math.random() * 9000)}`;
    const custName = walkinName || 'Walk-in Client';

    await addOrder({
      orderCode,
      customerName: custName,
      customerPhone: walkinPhone || '+91 98765 43210',
      items: `${walkinQty}x ${walkinItem}`,
      tagId: `COUNTER-${Math.floor(100 + Math.random() * 900)}`,
      status: 'Received',
      stage: 'Store Counter Intake',
      priority: 'Walk-in Standard',
      amount: total,
      type: 'Manual Offline Order',
      paymentMode: 'Cash (Collected at Counter)',
      decision: 'Accepted',
      branchId: activeBranch.id,
      branchName: activeBranch.name,
      estReturnDate: 'Tomorrow, 7:00 PM',
    });

    setCreatedInvoice({
      invoiceNo: `INV-${Date.now().toString().slice(-6)}`,
      date: new Date().toLocaleDateString('en-IN'),
      customer: custName,
      phone: walkinPhone || '+91 98765 43210',
      item: walkinItem,
      qty: walkinQty,
      price: walkinPrice,
      total,
      paymentMode: 'Cash (Paid)',
    });
  };

  return (
    <div className="flex flex-col w-full min-h-screen pt-16 pb-28 bg-[#FAFAFC] text-slate-900 font-sans">
      <section className="px-5 pt-4 pb-2">
        <EnterprisePortalHeader
          portalTitle="Store Manager Counter ERP"
          portalBadge="BRANCH OPERATIONS • COUNTER ERP"
          portalIcon="storefront"
          activeScreen="dashboard-store-manager"
          onNavigate={onNavigate}
          extraActions={
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsStoreOpen(!isStoreOpen)}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors shadow-sm ${
                  isStoreOpen ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-current animate-ping" />
                {isStoreOpen ? 'Branch Open' : 'Branch Closed'}
              </button>
              <button
                onClick={() => setShowManualModal(true)}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
              >
                <span className="material-symbols-outlined text-[15px]">add_circle</span>
                <span>+ Walk-in Booking</span>
              </button>
            </div>
          }
        />

      </section>

      {/* Navigation Filter Tabs */}
      <section className="px-5 my-3">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'intake', label: '📋 Booking & Status Management' },
            { id: 'config', label: '⚙️ Business & Service Config' },
            { id: 'manual_order', label: '➕ Manual Walk-in Order' },
            { id: 'pricing', label: '🏷️ Garment Pricing Setup' },
            { id: 'reports', label: '🚚 Pickup & Delivery Reports' },
            { id: 'machines', label: '🧺 Machine & Atelier Telemetry' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-xs border border-[#9E7B4F]'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* TAB: Business Config */}
      {activeFilter === 'config' && (
        <section className="px-5 my-2">
          <BusinessConfigCenter />
        </section>
      )}

      {/* TAB 1: Booking & Status Management */}
      {activeFilter === 'intake' && (
        <section className="px-5 my-2">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold text-[#9E7B4F] uppercase tracking-widest block">
                  BRANCH ORDER FULFILLMENT PANEL
                </span>
                <h2 className="font-['Libre_Caslon_Text',serif] text-lg font-bold text-slate-900">
                  Live Customer Bookings & Progress
                </h2>
              </div>
            </div>

            <div className="space-y-3">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200 space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-['Libre_Caslon_Text',serif] font-bold text-slate-900">
                          #{ord.orderCode || ord.id}
                        </span>
                        <span className="bg-slate-900 text-amber-300 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase">
                          {ord.type}
                        </span>
                        <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-full">
                          ₹{ord.amount} • {ord.paymentMode}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-700 mt-1">
                        {ord.customerName || (ord as any).customer} • {
                          typeof ord.items === 'string'
                            ? ord.items
                            : Array.isArray(ord.items)
                            ? ord.items.map((i) => `${i.qty}x ${i.garmentName}`).join(', ')
                            : 'Garments'
                        }
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          ord.status === 'Ready for delivery'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : ord.status === 'In Processing'
                            ? 'bg-sky-100 text-sky-800 border border-sky-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {ord.status}
                      </span>
                      {ord.decision === 'Pending' && (
                        <div className="flex gap-1.5 mt-1">
                          <button
                            onClick={() => handleAcceptReject(ord.id, 'Accepted')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-lg cursor-pointer"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleAcceptReject(ord.id, 'Rejected')}
                            className="bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-lg cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {ord.decision === 'Rejected' && (
                        <span className="text-[10px] font-bold text-rose-600">Order Rejected</span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-200/60 text-xs">
                    <span className="text-slate-500 font-medium">
                      Current Stage: <strong className="text-slate-800">{ord.stage}</strong>
                    </span>
                    <button
                      onClick={() => toggleOrderStatus(ord.id, ord.status)}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-1 rounded-lg text-[11px] shadow-2xs transition-all cursor-pointer"
                    >
                      Update Status
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TAB 2: Manual Offline Order Creation */}
      {(activeFilter === 'manual_order' || showManualModal) && (
        <section className="px-5 my-2">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold text-[#9E7B4F] uppercase tracking-widest block">
                  WALK-IN COUNTER ORDER & CASH INVOICING
                </span>
                <h2 className="font-['Libre_Caslon_Text',serif] text-lg font-bold text-slate-900">
                  Manual Offline Order Creation
                </h2>
              </div>
            </div>

            <form onSubmit={handleCreateOfflineOrder} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Customer Full Name
                </label>
                <input
                  type="text"
                  value={walkinName}
                  onChange={(e) => setWalkinName(e.target.value)}
                  placeholder="e.g. Rahul Verma"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#9E7B4F]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Mobile Number (for SMS & WhatsApp Invoice)
                </label>
                <input
                  type="tel"
                  value={walkinPhone}
                  onChange={(e) => setWalkinPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#9E7B4F]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Garment & Service Category
                </label>
                <select
                  value={walkinItem}
                  onChange={(e) => setWalkinItem(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#9E7B4F]"
                >
                  <option value="Shirt (Wash & Iron)">Shirt (Wash & Iron)</option>
                  <option value="Trouser (Dry Cleaning)">Trouser (Dry Cleaning)</option>
                  <option value="Silk Saree (Premium Care)">Silk Saree (Premium Care)</option>
                  <option value="Suit 2-Piece (Steam Press)">Suit 2-Piece (Steam Press)</option>
                  <option value="Blanket / Quilt (Deep Extract)">Blanket / Quilt (Deep Extract)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Price per Unit (₹)
                  </label>
                  <input
                    type="number"
                    value={walkinPrice}
                    onChange={(e) => setWalkinPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#9E7B4F]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Quantity Pcs
                  </label>
                  <input
                    type="number"
                    value={walkinQty}
                    onChange={(e) => setWalkinQty(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#9E7B4F]"
                  />
                </div>
              </div>

              <div className="sm:col-span-2 flex justify-between items-center pt-2">
                <div className="text-xs">
                  <span className="text-slate-500 block">Total Amount to Collect at Counter:</span>
                  <strong className="text-base font-bold text-slate-900 font-mono">
                    ₹{parseInt(walkinPrice || '0') * parseInt(walkinQty || '1')} (Cash Mode)
                  </strong>
                </div>

                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                  <span>Create Order & Generate Invoice</span>
                </button>
              </div>
            </form>

            {/* Generated Invoice Box */}
            {createdInvoice && (
              <div className="mt-4 p-4 bg-amber-50/90 border border-amber-300 rounded-2xl space-y-2 text-xs">
                <div className="flex justify-between items-center border-b border-amber-200 pb-2">
                  <span className="font-extrabold text-amber-900">TAX INVOICE GENERATED — {createdInvoice.invoiceNo}</span>
                  <span className="text-[10px] font-mono text-amber-800">{createdInvoice.date}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-800 font-mono">
                  <div>Client: <strong>{createdInvoice.customer}</strong> ({createdInvoice.phone})</div>
                  <div>Payment: <strong>{createdInvoice.paymentMode}</strong></div>
                  <div>Item: <strong>{createdInvoice.item}</strong></div>
                  <div>Qty & Total: <strong>{createdInvoice.qty} pcs • ₹{createdInvoice.total}</strong></div>
                </div>
                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => alert(`Invoice ${createdInvoice.invoiceNo} printed to thermal receipt printer!`)}
                    className="bg-slate-900 text-white px-3 py-1 rounded-lg font-bold text-[11px] cursor-pointer"
                  >
                    🖨️ Print Receipt
                  </button>
                  <button
                    onClick={() => alert(`Invoice details sent via SMS/WhatsApp to ${createdInvoice.phone}!`)}
                    className="bg-emerald-700 text-white px-3 py-1 rounded-lg font-bold text-[11px] cursor-pointer"
                  >
                    💬 WhatsApp Receipt
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* TAB 3: Garment Pricing Setup */}
      {activeFilter === 'pricing' && (
        <section className="px-5 my-2">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold text-[#9E7B4F] uppercase tracking-widest block">
                  SERVICE PRICING MANAGEMENT
                </span>
                <h2 className="font-['Libre_Caslon_Text',serif] text-lg font-bold text-slate-900">
                  Set Pricing per Garment Item
                </h2>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                    <th className="p-2.5 rounded-l-xl">Garment Item</th>
                    <th className="p-2.5">Wash & Iron (₹)</th>
                    <th className="p-2.5">Dry Cleaning (₹)</th>
                    <th className="p-2.5">Steam Press (₹)</th>
                    <th className="p-2.5 rounded-r-xl">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {garmentPrices.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-slate-900">{row.garment}</td>
                      <td className="p-2.5">
                        <input
                          type="number"
                          value={row.washIron}
                          onChange={(e) => {
                            const val = parseInt(e.target.value || '0');
                            setGarmentPrices((prev) =>
                              prev.map((r, i) => (i === idx ? { ...r, washIron: val } : r))
                            );
                          }}
                          className="w-20 bg-slate-50 border border-slate-200 rounded px-2 py-1 font-mono font-bold"
                        />
                      </td>
                      <td className="p-2.5">
                        <input
                          type="number"
                          value={row.dryClean}
                          onChange={(e) => {
                            const val = parseInt(e.target.value || '0');
                            setGarmentPrices((prev) =>
                              prev.map((r, i) => (i === idx ? { ...r, dryClean: val } : r))
                            );
                          }}
                          className="w-20 bg-slate-50 border border-slate-200 rounded px-2 py-1 font-mono font-bold"
                        />
                      </td>
                      <td className="p-2.5">
                        <input
                          type="number"
                          value={row.steamPress}
                          onChange={(e) => {
                            const val = parseInt(e.target.value || '0');
                            setGarmentPrices((prev) =>
                              prev.map((r, i) => (i === idx ? { ...r, steamPress: val } : r))
                            );
                          }}
                          className="w-20 bg-slate-50 border border-slate-200 rounded px-2 py-1 font-mono font-bold"
                        />
                      </td>
                      <td className="p-2.5">
                        <button
                          onClick={() => alert(`Saved updated prices for ${row.garment}!`)}
                          className="bg-slate-900 text-white px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer"
                        >
                          Save Price
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* TAB 4: Pickup & Delivery Reports */}
      {activeFilter === 'reports' && (
        <section className="px-5 my-2">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold text-[#9E7B4F] uppercase tracking-widest block">
                  VALET LOGISTICS & DAILY AUDIT
                </span>
                <h2 className="font-['Libre_Caslon_Text',serif] text-lg font-bold text-slate-900">
                  Pickup & Delivery Reports per Date
                </h2>
              </div>
              <input
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pickup Report */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-amber-600">local_shipping</span>
                  <span>Pickup Log for {reportDate}</span>
                </h3>
                <div className="space-y-2">
                  {pickupReports.map((p, i) => (
                    <div key={i} className="bg-white p-3 rounded-xl border border-slate-200 text-xs flex justify-between">
                      <div>
                        <div className="font-bold text-slate-900">{p.customer} ({p.time})</div>
                        <div className="text-slate-500 text-[11px]">{p.address} • Driver: {p.driver}</div>
                      </div>
                      <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded text-[10px] font-bold h-fit">
                        {p.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Report */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">task_alt</span>
                  <span>Delivery Log for {reportDate}</span>
                </h3>
                <div className="space-y-2">
                  {deliveryReports.map((d, i) => (
                    <div key={i} className="bg-white p-3 rounded-xl border border-slate-200 text-xs flex justify-between">
                      <div>
                        <div className="font-bold text-slate-900">{d.customer} ({d.time})</div>
                        <div className="text-slate-500 text-[11px]">{d.address} • {d.payment}</div>
                      </div>
                      <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded text-[10px] font-bold h-fit">
                        {d.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Machine & Detergent Telemetry */}
      {activeFilter === 'machines' && (
        <section className="px-5 my-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
            <span className="text-[10px] font-extrabold text-[#9E7B4F] uppercase tracking-widest block">
              ATELIER EQUIPMENT & CHEMICAL LOGS
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-amber-50/50 rounded-2xl border border-amber-200/80">
                <span className="text-xs font-bold text-slate-800 block">Dry Cleaning Drum #01</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">Perc Solvent Level: 92%</span>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-[#9E7B4F] h-full w-[92%]"></div>
                </div>
              </div>
              <div className="p-3 bg-sky-50/50 rounded-2xl border border-sky-200/80">
                <span className="text-xs font-bold text-slate-800 block">Vacuum Steam Press #03</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">Boiler Pressure: 4.2 Bar</span>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-sky-600 h-full w-[85%]"></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
