import React from 'react';
import { ScreenId } from '../types';
import { BottomNav } from '../components/BottomNav';
import { AnimatedTimeline } from '../components/AnimatedTimeline';

interface ScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const OrderTracking: React.FC<ScreenProps> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col w-full pb-28 pt-16 bg-[#FAFAFC] min-h-screen text-slate-900">
      
      {/* Top Header */}
      <div className="px-5 py-4 flex items-center justify-between border-b border-slate-200 bg-white">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('my-orders')}
            className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div>
            <span className="text-[10px] font-bold text-[#9E7B4F] uppercase tracking-wider font-sans">
              FABRIQ ITEM TRACKING
            </span>
            <h1 className="font-['Libre_Caslon_Text',serif] text-xl font-bold text-slate-900 leading-tight">
              Order #FBQ-8829
            </h1>
          </div>
        </div>

        <button
          onClick={() => onNavigate('live-order-tracking')}
          className="px-3 py-1.5 rounded-full bg-[#9E7B4F] text-white font-bold text-xs flex items-center gap-1 shadow-sm hover:bg-[#83633B] transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">location_on</span>
          <span>Live GPS</span>
        </button>
      </div>

      {/* Hero Treatment Status Banner */}
      <div className="px-5 my-5">
        <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="text-[10px] text-amber-400 uppercase font-bold tracking-widest font-sans">
                STAGE 3 OF 5 • ECO HYDRO-WASH
              </span>
              <h3 className="font-['Libre_Caslon_Text',serif] text-2xl font-bold text-white mt-1">
                Eco Wash & Pressing in Studio
              </h3>
            </div>
            <span className="bg-amber-500/20 text-amber-300 text-xs px-3 py-1 rounded-full font-bold border border-amber-500/30">
              In Progress
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mb-4 font-sans">
            Your 3 items (Armani Silk Blazer, Cashmere Sweater, Leather Sneakers) have passed barcode tagging and are currently undergoing organic dry clean & ozonated rinse.
          </p>

          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
            <div className="bg-gradient-to-r from-[#9E7B4F] to-[#E3C396] h-full w-[65%] rounded-full relative">
              <div className="absolute top-0 right-0 w-2 h-2 bg-white rounded-full animate-ping"></div>
            </div>
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 font-sans">
            <span>Valet Picked Up: Yesterday, 5 PM</span>
            <span className="text-amber-300 font-bold">Est. Return: Tomorrow, 4 PM</span>
          </div>
        </div>
      </div>

      {/* Itemized Garment Barcode Tagging List (FabriQ Studio Style) */}
      <div className="px-5 mb-6">
        <h3 className="font-['Libre_Caslon_Text',serif] text-lg font-bold text-slate-900 mb-3">
          Tagged Garments in Order
        </h3>
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
          {[
            { tag: 'TAG-8829-01', item: 'Armani Formal Blazer', service: 'Hydrocarbon Dry Clean', status: 'In Pressing', price: '₹200.00' },
            { tag: 'TAG-8829-02', item: 'Wool Hoodie & Jacket', service: 'Fleece Conditioning Spa', status: 'De-Pilling', price: '₹170.00' },
            { tag: 'TAG-8829-03', item: 'Leather Sneakers', service: 'Sneaker Deep Clean Spa', status: 'UV Sanitizing', price: '₹250.00' },
          ].map((garment) => (
            <div key={garment.tag} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-[#83633B] flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[18px]">qr_code_2</span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 font-sans">{garment.item}</h4>
                  <p className="text-[11px] text-slate-500">{garment.service} • {garment.tag}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-900 font-['Libre_Caslon_Text',serif]">{garment.price}</span>
                <span className="block text-[10px] font-bold text-[#9E7B4F]">{garment.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-5 space-y-3 mb-6">
        <button
          onClick={() => onNavigate('live-order-tracking')}
          className="w-full py-3.5 bg-[#9E7B4F] hover:bg-[#83633B] text-white rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">near_me</span>
          <span>Track Valet Delivery Courier</span>
        </button>

        <button
          onClick={() => onNavigate('schedule-pickup')}
          className="w-full py-3.5 bg-white border border-slate-200 text-slate-800 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-slate-500 text-[18px]">
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
