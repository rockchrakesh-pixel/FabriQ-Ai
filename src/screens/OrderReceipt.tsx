import React, { useState, useEffect } from 'react';
import { ScreenId } from '../types';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { db, collection, query, where, getDocs } from '../lib/firebase';
import { FabriQAiLogoFramed } from '../components/FabriQAiLogoFramed';
import { BottomNav } from '../components/BottomNav';

interface OrderReceiptProps {
  onNavigate: (screen: ScreenId) => void;
  selectedOrderId?: string;
}

interface ReceiptOrder {
  id: string;
  orderNumber: string;
  invoiceNumber: string;
  date: string;
  time: string;
  status: 'Delivered' | 'In Progress' | 'Processing' | 'Scheduled';
  paymentStatus: 'PAID' | 'PENDING';
  paymentMode: 'UPI (GPay / PhonePe)' | 'Credit Card' | 'Cash on Valet' | 'FabriQ Credits';
  pickupAddress: string;
  deliveryAddress: string;
  branchName: string;
  valetName: string;
  valetPhone: string;
  items: {
    name: string;
    service: string;
    qty: number;
    unitPrice: number;
    subtotal: number;
  }[];
  subtotal: number;
  valetFee: number;
  addonFee: number;
  tax: number; // 18% GST
  discount: number;
  total: number;
}

const MOCK_RECEIPTS: ReceiptOrder[] = [
  {
    id: 'receipt_1',
    orderNumber: '#FBQ-89421',
    invoiceNumber: 'INV-2026-0806-01',
    date: '06 Aug 2026',
    time: '11:30 AM',
    status: 'Delivered',
    paymentStatus: 'PAID',
    paymentMode: 'UPI (GPay / PhonePe)',
    pickupAddress: 'Plot 42, Road No 36, Jubilee Hills, Hyderabad',
    deliveryAddress: 'Plot 42, Road No 36, Jubilee Hills, Hyderabad',
    branchName: 'Jubilee Hills Flagship Atelier',
    valetName: 'Suresh Varma (Valet Captain)',
    valetPhone: '+91 98222 11001',
    items: [
      { name: 'Men Formal Shirt', service: 'Wash & Iron', qty: 3, unitPrice: 79, subtotal: 237 },
      { name: 'Men Italian Trouser', service: 'Dry Cleaning', qty: 2, unitPrice: 89, subtotal: 178 },
      { name: 'Silk Saree (Kanjeevaram)', service: 'Hydrocarbon Dry Cleaning', qty: 1, unitPrice: 299, subtotal: 299 },
      { name: 'Designer Sneakers', service: 'Deep Shoe Spa', qty: 1, unitPrice: 349, subtotal: 349 },
    ],
    subtotal: 1063,
    valetFee: 0, // Free delivery
    addonFee: 49, // Eco Fabric Shield
    tax: 199.98, // 18% GST
    discount: 100, // VIP Credit Discount
    total: 1211.98,
  },
  {
    id: 'receipt_2',
    orderNumber: '#FBQ-89415',
    invoiceNumber: 'INV-2026-0802-04',
    date: '02 Aug 2026',
    time: '04:15 PM',
    status: 'Delivered',
    paymentStatus: 'PAID',
    paymentMode: 'Credit Card',
    pickupAddress: 'Flat 301, Fortune Towers, Madhapur, Hyderabad',
    deliveryAddress: 'Flat 301, Fortune Towers, Madhapur, Hyderabad',
    branchName: 'Madhapur Express Lounge',
    valetName: 'Ramesh Naidu (Express Valet)',
    valetPhone: '+91 98333 22112',
    items: [
      { name: 'Men 2-Piece Suit', service: 'Dry Cleaning', qty: 1, unitPrice: 449, subtotal: 449 },
      { name: 'Bespoke Blazer', service: 'Premium Care', qty: 1, unitPrice: 349, subtotal: 349 },
      { name: 'Women Silk Top', service: 'Steam Iron', qty: 4, unitPrice: 25, subtotal: 100 },
    ],
    subtotal: 898,
    valetFee: 49,
    addonFee: 0,
    tax: 170.46,
    discount: 50,
    total: 1067.46,
  },
];

export const OrderReceipt: React.FC<OrderReceiptProps> = ({ onNavigate, selectedOrderId }) => {
  const { sendNotification } = useNotifications();
  const { profile, user } = useAuth();
  const [receiptsList, setReceiptsList] = useState<ReceiptOrder[]>(MOCK_RECEIPTS);
  const [activeReceiptId, setActiveReceiptId] = useState<string>(
    selectedOrderId || MOCK_RECEIPTS[0].id
  );

  useEffect(() => {
    const fetchFirestoreOrders = async () => {
      try {
        const userId = user?.uid || profile?.id;
        if (!userId) return;
        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, where('userId', '==', userId));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const fsReceipts: ReceiptOrder[] = snap.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              orderNumber: data.orderNumber || `#FBQ-${docSnap.id.slice(0, 5).toUpperCase()}`,
              invoiceNumber: data.invoiceNumber || `INV-2026-${docSnap.id.slice(0, 6).toUpperCase()}`,
              date: data.date || '06 Aug 2026',
              time: data.time || '10:00 AM',
              status: data.status || 'Delivered',
              paymentStatus: data.paymentStatus || 'PAID',
              paymentMode: data.paymentMode || 'UPI (GPay / PhonePe)',
              pickupAddress: data.pickupAddress || 'Plot 42, Jubilee Hills, Hyderabad',
              deliveryAddress: data.deliveryAddress || 'Plot 42, Jubilee Hills, Hyderabad',
              branchName: data.branchName || 'Jubilee Hills Flagship Atelier',
              valetName: data.valetName || 'Suresh Varma (Valet Captain)',
              valetPhone: data.valetPhone || '+91 98222 11001',
              items: data.items || [
                { name: 'Men Formal Shirt', service: 'Wash & Iron', qty: 2, unitPrice: 79, subtotal: 158 },
                { name: 'Men Trouser', service: 'Dry Cleaning', qty: 1, unitPrice: 89, subtotal: 89 },
              ],
              subtotal: data.subtotal || 247,
              valetFee: data.valetFee || 0,
              addonFee: data.addonFee || 0,
              tax: data.tax || 44.46,
              discount: data.discount || 0,
              total: data.total || 291.46,
            };
          });
          setReceiptsList([...fsReceipts, ...MOCK_RECEIPTS]);
          if (selectedOrderId) {
            setActiveReceiptId(selectedOrderId);
          } else {
            setActiveReceiptId(fsReceipts[0].id);
          }
        }
      } catch (err) {
        console.warn('Firestore order receipt fetch fallback:', err);
      }
    };
    fetchFirestoreOrders();
  }, [user, profile, selectedOrderId]);

  const activeReceipt = receiptsList.find((r) => r.id === activeReceiptId || r.orderNumber === activeReceiptId || r.orderNumber === selectedOrderId) || receiptsList[0];

  const handlePrint = () => {
    window.print();
    sendNotification('Receipt Printed', 'Digital receipt sent to print queue.', 'system');
  };

  const handleShareWhatsApp = () => {
    const text = `Hello! Here is my official FabriQ Invoice ${activeReceipt.invoiceNumber} for Order ${activeReceipt.orderNumber}. Total Paid: ₹${activeReceipt.total.toFixed(2)}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="flex flex-col w-full min-h-screen overflow-y-auto pb-36 pt-20 sm:pt-24 bg-[#070F1E] text-[#FAF9F6] font-sans">
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 space-y-6">
        
        {/* Top Header Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0B1528] p-5 rounded-3xl border border-[#C29C6D]/30 shadow-md">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="material-symbols-outlined text-[#E5C07B] text-[20px]">receipt_long</span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#E5C07B]">
                TAX INVOICE & ORDER BILL
              </span>
            </div>
            <h1 className="font-['Libre_Caslon_Text',serif] text-2xl font-bold text-[#FAF9F6]">
              Tax Receipt & Order Breakdown
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('my-orders')}
              className="px-3.5 py-2 min-h-[44px] bg-[#070F1E] hover:bg-[#0E1B33] text-slate-200 border border-[#C29C6D]/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">list_alt</span>
              <span>All Orders</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 min-h-[44px] bg-gradient-to-r from-[#D4AF37] to-[#C29C6D] text-[#0B1528] rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-md hover:opacity-90"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              <span>Print / PDF</span>
            </button>
          </div>
        </div>

        {/* Receipt Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {receiptsList.map((rec) => (
            <button
              key={rec.id}
              onClick={() => setActiveReceiptId(rec.id)}
              className={`px-4 py-2.5 min-h-[44px] rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 border cursor-pointer ${
                activeReceipt.id === rec.id
                  ? 'bg-[#0E1B33] text-[#E5C07B] border-[#D4AF37] shadow-md'
                  : 'bg-[#0B1528] text-slate-300 border-[#C29C6D]/30 hover:border-[#D4AF37]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">receipt</span>
              <span>{rec.orderNumber} ({rec.date})</span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold">
                ₹{rec.total.toFixed(0)}
              </span>
            </button>
          ))}
        </div>

        {/* MAIN TAX INVOICE CARD */}
        <div id="printable-receipt" className="bg-[#0B1528] rounded-3xl border-2 border-[#C29C6D]/40 shadow-xl overflow-hidden p-6 sm:p-8 space-y-6">
          
          {/* Header Branding & Invoice Meta */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#C29C6D]/20">
            <div className="flex items-center gap-3">
              <FabriQAiLogoFramed size="md" showSubtitle={true} />
              <div className="pl-2 border-l border-[#C29C6D]/20">
                <p className="text-[11px] font-bold text-[#E5C07B]">GSTIN: 36AAFCS9021K1ZM</p>
                <p className="text-[10px] text-slate-400 font-mono">ISO 9001:2025 Certified Care Atelier</p>
              </div>
            </div>

            <div className="sm:text-right bg-[#070F1E] p-3 rounded-2xl border border-[#C29C6D]/30 text-xs space-y-1">
              <div className="flex justify-between sm:justify-end gap-3 font-mono">
                <span className="text-slate-400">Invoice No:</span>
                <span className="font-bold text-[#FAF9F6]">{activeReceipt.invoiceNumber}</span>
              </div>
              <div className="flex justify-between sm:justify-end gap-3 font-mono">
                <span className="text-slate-400">Order ID:</span>
                <span className="font-bold text-[#E5C07B]">{activeReceipt.orderNumber}</span>
              </div>
              <div className="flex justify-between sm:justify-end gap-3 font-mono">
                <span className="text-slate-400">Date & Time:</span>
                <span className="font-semibold text-slate-300">{activeReceipt.date}, {activeReceipt.time}</span>
              </div>
            </div>
          </div>

          {/* Customer & Branch Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#070F1E] p-4 rounded-2xl border border-[#C29C6D]/30 text-xs">
            <div className="space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase text-[#E5C07B] tracking-wider block font-sans">
                CUSTOMER & PICKUP LOCATION
              </span>
              <p className="font-bold text-[#FAF9F6] text-sm">{profile?.name || 'CH Rakesh'}</p>
              <p className="text-slate-300 font-medium">{activeReceipt.pickupAddress}</p>
              <p className="text-slate-400 font-mono">{profile?.phone || '+91 98765 43210'} • {profile?.email || 'rakesh.ch@fabriq.ai'}</p>
            </div>

            <div className="space-y-1.5 md:border-l md:border-[#C29C6D]/20 md:pl-4">
              <span className="text-[10px] font-extrabold uppercase text-[#E5C07B] tracking-wider block font-sans">
                ATELIER BRANCH & VALET CAPTAIN
              </span>
              <p className="font-bold text-[#FAF9F6] text-sm">{activeReceipt.branchName}</p>
              <p className="text-slate-300 font-medium">Valet Captain: {activeReceipt.valetName}</p>
              <p className="text-slate-400 font-mono">Contact: {activeReceipt.valetPhone}</p>
              <div className="pt-1 flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold uppercase tracking-wider">
                  Payment Mode: {activeReceipt.paymentMode}
                </span>
              </div>
            </div>
          </div>

          {/* Itemized Garment Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#070F1E] text-[#E5C07B] font-mono text-[10px] uppercase tracking-wider">
                  <th className="p-3 rounded-l-xl">#</th>
                  <th className="p-3">Garment Item</th>
                  <th className="p-3">Care Service</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-right">Rate</th>
                  <th className="p-3 text-right rounded-r-xl">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C29C6D]/15 font-sans">
                {activeReceipt.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#0E1B33]/50 transition-colors">
                    <td className="p-3 font-mono text-slate-400 font-bold">{idx + 1}</td>
                    <td className="p-3 font-bold text-[#FAF9F6]">{item.name}</td>
                    <td className="p-3">
                      <span className="px-2.5 py-1 bg-[#070F1E] text-[#E5C07B] border border-[#C29C6D]/40 rounded-lg font-bold text-[10px]">
                        {item.service}
                      </span>
                    </td>
                    <td className="p-3 text-center font-bold text-slate-200">{item.qty}</td>
                    <td className="p-3 text-right font-mono text-slate-300">₹{item.unitPrice}</td>
                    <td className="p-3 text-right font-mono font-bold text-[#E5C07B]">₹{item.subtotal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Calculation Summary */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-4 border-t border-[#C29C6D]/20">
            <div className="max-w-xs space-y-2 text-xs">
              <span className="text-[10px] font-extrabold uppercase text-[#E5C07B] tracking-wider block font-sans">
                QUALITY GUARANTEE & TERMS
              </span>
              <p className="text-slate-300 leading-relaxed font-sans text-[11px]">
                All items are treated using eco-friendly hydrocarbon solvents and micro-filtered soft water. Any query regarding this bill must be raised within 48 hours of delivery.
              </p>
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px] pt-1">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span>100% Color & Shrinkage Insured</span>
              </div>
            </div>

            <div className="w-full sm:w-72 bg-[#070F1E] p-4 rounded-2xl border border-[#C29C6D]/30 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-300">
                <span>Items Subtotal:</span>
                <span className="font-bold text-white">₹{activeReceipt.subtotal}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Doorstep Valet Pick & Drop:</span>
                <span className="font-bold text-emerald-400">
                  {activeReceipt.valetFee === 0 ? 'FREE' : `₹${activeReceipt.valetFee}`}
                </span>
              </div>
              {activeReceipt.addonFee > 0 && (
                <div className="flex justify-between text-slate-300">
                  <span>Eco Fabric Protection Addon:</span>
                  <span className="font-bold text-white">₹{activeReceipt.addonFee}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-300">
                <span>GST (18% Statutory Tax):</span>
                <span className="font-bold text-white">₹{activeReceipt.tax.toFixed(2)}</span>
              </div>
              {activeReceipt.discount > 0 && (
                <div className="flex justify-between text-rose-400 font-bold">
                  <span>VIP Promo / Credit Discount:</span>
                  <span>- ₹{activeReceipt.discount}</span>
                </div>
              )}
              <div className="border-t border-[#C29C6D]/30 pt-2 flex justify-between items-center text-sm font-sans font-black">
                <span className="text-white">Total Net Amount Paid:</span>
                <span className="text-[#E5C07B] text-base font-mono font-black">₹{activeReceipt.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Action Bar inside Receipt */}
          <div className="pt-4 border-t border-[#C29C6D]/20 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handleShareWhatsApp}
                className="px-3.5 py-2 min-h-[44px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md font-sans"
              >
                <span className="material-symbols-outlined text-[16px]">chat</span>
                <span>Share Bill on WhatsApp</span>
              </button>
              <button
                onClick={() => {
                  sendNotification('Re-Order Added', `Re-added ${activeReceipt.items.length} garments to your cart.`, 'system');
                  onNavigate('cart');
                }}
                className="px-3.5 py-2 min-h-[44px] bg-gradient-to-r from-[#D4AF37] to-[#C29C6D] text-[#0B1528] rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-md font-sans"
              >
                <span className="material-symbols-outlined text-[16px]">repeat</span>
                <span>Re-Order Items</span>
              </button>
            </div>

            <button
              onClick={() => onNavigate('live-order-tracking')}
              className="px-3.5 py-2 min-h-[44px] bg-[#070F1E] hover:bg-[#0E1B33] text-[#E5C07B] border border-[#C29C6D]/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer font-sans"
            >
              <span className="material-symbols-outlined text-[16px]">map</span>
              <span>Track Live Delivery</span>
            </button>
          </div>

        </div>

      </div>
      <BottomNav activePath="orders" onNavigate={onNavigate} />
    </div>
  );
};
