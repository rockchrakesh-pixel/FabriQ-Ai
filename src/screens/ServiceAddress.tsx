import React, { useState } from 'react';
import { ScreenId } from '../types';
import { BottomNav } from '../components/BottomNav';

interface ScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const ServiceAddress: React.FC<ScreenProps> = ({ onNavigate }) => {
  const [selectedTag, setSelectedTag] = useState<'Home' | 'Office' | 'Other'>('Home');

  return (
    <div className="flex flex-col w-full pb-28 pt-16 bg-[#FAFAFC] min-h-screen text-slate-900 font-sans">
      {/* Header */}
      <div className="px-5 py-3 flex items-center justify-between border-b border-slate-200 bg-white">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('schedule-pickup')}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
            aria-label="Back"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div>
            <span className="text-[10px] font-bold text-[#9E7B4F] uppercase tracking-wider font-sans">
              VALET DOORSTEP LOCATION
            </span>
            <h1 className="font-['Libre_Caslon_Text',serif] text-xl font-bold text-slate-900">
              Service Address
            </h1>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="relative w-full h-56 bg-slate-200 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=800&auto=format&fit=crop"
          alt="Map Location"
          className="w-full h-full object-cover grayscale-[20%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent pointer-events-none"></div>

        {/* Floating Pin */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full flex flex-col items-center pointer-events-none">
          <div className="relative">
            <span className="material-symbols-outlined text-[#9E7B4F] text-5xl drop-shadow-lg">
              location_on
            </span>
          </div>
          <div className="w-2.5 h-2.5 bg-slate-900 rounded-full mt-[-8px]"></div>
        </div>
      </div>

      {/* Address Form (FabriQ Style) */}
      <div className="px-5 -mt-6 relative z-10">
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 flex flex-col gap-4">
          <div className="flex flex-col gap-1 border-b border-slate-100 pb-3">
            <span className="text-[10px] font-bold text-[#9E7B4F] uppercase tracking-widest font-sans">
              SELECTED GPS STREET LOCATION
            </span>
            <div className="flex items-center justify-between">
              <span className="font-['Libre_Caslon_Text',serif] text-lg font-bold text-slate-900">
                42 Berkeley Square, Mayfair
              </span>
              <button className="text-xs text-[#9E7B4F] font-bold flex items-center gap-1 hover:underline cursor-pointer">
                <span className="material-symbols-outlined text-[16px]">edit</span>
                <span>Change Pin</span>
              </button>
            </div>
            <p className="text-xs text-slate-500 font-sans">London, W1J 5AW • United Kingdom</p>
          </div>

          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs text-slate-700 font-bold block mb-1">
                Flat, Apartment / House No. & Floor
              </label>
              <input
                type="text"
                placeholder="e.g. Flat 4B, 4th Floor"
                defaultValue="Suite 402, 4th Floor"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 text-xs font-bold text-slate-900 border border-slate-200 focus:outline-none focus:border-[#9E7B4F] transition-colors"
              />
            </div>

            <div>
              <label className="text-xs text-slate-700 font-bold block mb-1">
                Landmark & Valet Pickup Instructions
              </label>
              <input
                type="text"
                placeholder="e.g. Near West Gate, ring reception bell..."
                defaultValue="Ring concierge bell upon arrival."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 text-xs font-bold text-slate-900 border border-slate-200 focus:outline-none focus:border-[#9E7B4F] transition-colors"
              />
            </div>
          </div>

          {/* Tag Selector */}
          <div>
            <span className="text-xs text-slate-700 font-bold block mb-2">Save Address As</span>
            <div className="flex gap-2">
              {(['Home', 'Office', 'Other'] as const).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(tag)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    selectedTag === tag
                      ? 'bg-[#9E7B4F] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {tag === 'Home' ? 'home' : tag === 'Office' ? 'work' : 'more_horiz'}
                  </span>
                  <span>{tag}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Save Action */}
      <div className="mt-5 px-5">
        <button
          onClick={() => onNavigate('schedule-pickup')}
          className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg hover:bg-slate-800 transition-all cursor-pointer"
        >
          <span>Confirm Service Address</span>
          <span className="material-symbols-outlined text-[#E3C396] text-[18px]">check_circle</span>
        </button>
      </div>

      <BottomNav activePath="schedule" onNavigate={onNavigate} />
    </div>
  );
};
