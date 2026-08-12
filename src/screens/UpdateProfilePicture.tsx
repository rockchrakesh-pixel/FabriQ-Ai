import React from 'react';
import { ScreenId } from '../types';
import { BottomNav } from '../components/BottomNav';

interface ScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const UpdateProfilePicture: React.FC<ScreenProps> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col w-full pb-28 pt-16 bg-[#FAFAFC] text-slate-900 min-h-screen">
      {/* Header Navigation */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-white">
        <button
          onClick={() => onNavigate('account')}
          className="flex items-center gap-1 text-slate-600 hover:text-slate-900 text-xs font-bold cursor-pointer font-sans"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
          <span>Cancel</span>
        </button>
        <h1 className="font-['Libre_Caslon_Text',serif] text-xl font-bold text-slate-900">
          Edit Profile Photo
        </h1>
        <button
          onClick={() => onNavigate('account')}
          className="text-xs font-bold text-[#9E7B4F] hover:underline cursor-pointer font-sans"
        >
          Save Photo
        </button>
      </div>

      {/* Upload/Crop Interface */}
      <div className="relative w-full aspect-square bg-slate-100 flex items-center justify-center overflow-hidden group my-2">
        <img
          className="absolute inset-0 w-full h-full object-cover"
          alt="Profile Preview"
          src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop"
        />

        {/* Radial Dimming Overlay */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle 140px at center, transparent 99%, rgba(15, 23, 42, 0.6) 100%)',
          }}
        ></div>

        {/* Cropping Guide Ring */}
        <div className="absolute z-20 w-[280px] h-[280px] rounded-full border-2 border-[#9E7B4F] flex items-center justify-center shadow-[0_0_0_9999px_rgba(0,0,0,0.15)]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-[#9E7B4F]"></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-[#9E7B4F]"></div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[2px] bg-[#9E7B4F]"></div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-[2px] bg-[#9E7B4F]"></div>
        </div>

        {/* AI Auto-Center Badge */}
        <div className="absolute bottom-4 z-30 bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-full border border-slate-200 shadow-md flex items-center gap-2">
          <span className="material-symbols-outlined text-[#9E7B4F] text-[18px]">auto_fix_high</span>
          <span className="text-[11px] font-bold text-slate-900 tracking-wider font-sans">
            AI AUTO-CENTER ACTIVE
          </span>
        </div>
      </div>

      {/* Instruction */}
      <div className="px-5 py-4 text-center">
        <h2 className="font-['Libre_Caslon_Text',serif] text-xl font-bold text-slate-900 mb-1">
          Adjust Profile Picture
        </h2>
        <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed font-sans">
          Reposition or upload a high-resolution portrait for personalized valet fittings.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="px-5 flex flex-col gap-3 font-sans">
        <button
          onClick={() => onNavigate('select-photo')}
          className="w-full h-13 bg-slate-900 text-white rounded-2xl flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider hover:bg-slate-800 transition-all cursor-pointer shadow-md"
        >
          <span className="material-symbols-outlined text-[#E3C396] text-[18px]">photo_camera</span>
          <span>Take Photo with Camera</span>
        </button>

        <button
          onClick={() => onNavigate('select-photo')}
          className="w-full h-13 bg-white border border-slate-200 text-slate-800 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider hover:bg-slate-50 transition-all cursor-pointer shadow-xs"
        >
          <span className="material-symbols-outlined text-[#9E7B4F] text-[18px]">image</span>
          <span>Select from Device Gallery</span>
        </button>
      </div>

      <BottomNav activePath="account" onNavigate={onNavigate} />
    </div>
  );
};
