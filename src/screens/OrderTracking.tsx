import React from 'react';
import { ScreenId } from '../types';
import { BottomNav } from '../components/BottomNav';
import { AnimatedTimeline } from '../components/AnimatedTimeline';

interface ScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const OrderTracking: React.FC<ScreenProps> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col w-full pb-28 pt-16 bg-[#070F1E] min-h-screen text-[#FAF9F6] font-sans">
      
      {/* Top Header */}
      <div className="px-5 py-4 flex items-center justify-between border-b border-[#C29C6D]/30 bg-[#0B1528] shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('my-orders')}
            className="w-10 h-10 min-h-[44px] rounded-full bg-[#070F1E] border border-[#C29C6D]/40 flex items-center justify-center text-[#E5C07B] hover:border-[#D4AF37] transition-colors cursor-pointer"
            aria-label="Back to orders"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div>
            <span className="text-[10px] font-extrabold text-[#E5C07B] uppercase tracking-wider font-sans">
              FABRIQ ITEM TRACKING
            </span>
            <h1 className="font-['Libre_Caslon_Text',serif] text-xl font-bold text-[#FAF9F6] leading-tight">
              Order #FBQ-8829
            </h1>
          </div>
        </div>

        <button
          onClick={() => onNavigate('live-order-tracking')}
          className="px-4 py-2 min-h-[44px] rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C29C6D] text-[#0B1528] font-black text-xs flex items-center gap-1.5 shadow-md hover:opacity-90 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">location_on</span>
          <span>Live GPS</span>
        </button>
      </div>

      {/* Hero Treatment Status Banner */}
      <div className="px-5 my-5">
        <div className="bg-[#0B1528] text-white rounded-3xl p-6 shadow-xl relative overflow-hidden border-2 border-[#C29C6D]/40">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="text-[10px] text-[#E5C07B] uppercase font-black tracking-widest font-sans">
                STAGE 3 OF 5 • ECO HYDRO-WASH
              </span>
              <h3 className="font-['Libre_Caslon_Text',serif] text-2xl font-bold text-[#FAF9F6] mt-1">
                Eco Wash & Pressing in Studio
              </h3>
            </div>
            <span className="bg-[#E5C07B]/20 text-[#E5C07B] text-xs px-3 py-1 rounded-full font-bold border border-[#E5C07B]/40">
              In Progress
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mb-4 font-sans font-normal">
            Your 3 items (Armani Silk Blazer, Cashmere Sweater, Leather Sneakers) have passed barcode tagging and are currently undergoing organic dry clean & ozonated rinse.
          </p>

          <div className="w-full bg-[#070F1E] h-2.5 rounded-full overflow-hidden mb-2 border border-[#C29C6D]/20">
            <div className="bg-gradient-to-r from-[#D4AF37] to-[#C29C6D] h-full w-[65%] rounded-full relative">
              <div className="absolute top-0 right-0 w-2 h-2 bg-white rounded-full animate-ping"></div>
            </div>
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 font-sans">
            <span>Valet Picked Up: Yesterday, 5 PM</span>
            <span className="text-[#E5C07B] font-bold">Est. Return: Tomorrow, 4 PM</span>
          </div>
        </div>
      </div>

      {/* Itemized Garment Barcode Tagging List (FabriQ Studio Style) */}
      <div className="px-5 mb-6">
        <h3 className="font-['Libre_Caslon_Text',serif] text-lg font-bold text-[#FAF9F6] mb-3">
          Tagged Garments in Order
        </h3>
        <div className="bg-[#0B1528] rounded-3xl p-4 border-2 border-[#C29C6D]/40 shadow-md space-y-3">
          {[
            { tag: 'TAG-8829-01', item: 'Armani Formal Blazer', service: 'Hydrocarbon Dry Clean', status: 'In Pressing', price: '₹200.00' },
            { tag: 'TAG-8829-02', item: 'Wool Hoodie & Jacket', service: 'Fleece Conditioning Spa', status: 'De-Pilling', price: '₹170.00' },
            { tag: 'TAG-8829-03', item: 'Leather Sneakers', service: 'Sneaker Deep Clean Spa', status: 'UV Sanitizing', price: '₹250.00' },
          ].map((garment) => (
            <div key={garment.tag} className="flex items-center justify-between p-3.5 rounded-2xl bg-[#070F1E] border border-[#C29C6D]/30 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#0B1528] border border-[#C29C6D]/40 text-[#E5C07B] flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[18px]">qr_code_2</span>
                </div>
                <div>
                  <h4 className="font-bold text-[#FAF9F6] font-sans">{garment.item}</h4>
                  <p className="text-[11px] text-slate-400">{garment.service} • {garment.tag}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-[#FAF9F6] font-['Libre_Caslon_Text',serif]">{garment.price}</span>
                <span className="block text-[10px] font-bold text-[#E5C07B]">{garment.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-5 space-y-3 mb-6">
        <button
          onClick={() => onNavigate('live-order-tracking')}
          className="w-full py-3.5 min-h-[44px] bg-gradient-to-r from-[#D4AF37] to-[#C29C6D] text-[#0B1528] rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer hover:opacity-90"
        >
          <span className="material-symbols-outlined text-[18px]">near_me</span>
          <span>Track Valet Delivery Courier</span>
        </button>

        <button
          onClick={() => onNavigate('schedule-pickup')}
          className="w-full py-3.5 min-h-[44px] bg-[#0B1528] border border-[#C29C6D]/40 text-[#FAF9F6] rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#121E36] transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[#E5C07B] text-[18px]">
            edit_calendar
          </span>
          <span>Reschedule Delivery Slot</span>
        </button>
      </div>

      {/* Treatment Progress Timeline */}
      <div className="px-5">
        <AnimatedTimeline />
      </div>

      <BottomNav activePath="orders" onNavigate={onNavigate} />
    </div>
  );
};
