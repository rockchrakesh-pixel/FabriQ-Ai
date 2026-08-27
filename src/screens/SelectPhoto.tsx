import React, { useState } from 'react';
import { ScreenId } from '../types';
import { BottomNav } from '../components/BottomNav';

interface ScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

const PHOTOS = [
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop',
];

export const SelectPhoto: React.FC<ScreenProps> = ({ onNavigate }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <div className="flex flex-col w-full pb-28 pt-16 bg-[#070F1E] text-[#FAF9F6] min-h-screen font-sans">
      {/* Search Header */}
      <div className="px-5 py-3 sticky top-16 bg-[#0B1528]/90 backdrop-blur-md z-30 space-y-3 border-b border-[#C29C6D]/20">
        <div className="flex gap-2 font-sans">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#E5C07B] text-[20px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search portrait photos, fabrics..."
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#070F1E] text-xs font-bold text-white focus:outline-none focus:border-[#D4AF37] border border-[#C29C6D]/30"
            />
          </div>
          <button className="h-11 px-4 rounded-xl bg-[#0E1B33] text-[#E5C07B] border border-[#C29C6D]/40 text-xs font-bold flex items-center gap-1 hover:border-[#D4AF37] transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">tune</span>
            <span>Filter</span>
          </button>
        </div>

        {/* Quick Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar font-sans">
          <span className="px-3.5 py-1 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#C29C6D] text-[#0B1528] text-xs font-black whitespace-nowrap shadow-xs">
            All Gallery Photos
          </span>
          <span className="px-3.5 py-1 rounded-full bg-[#0E1B33] text-[#FAF9F6] border border-[#C29C6D]/30 text-xs font-bold whitespace-nowrap">
            Portraits
          </span>
          <span className="px-3.5 py-1 rounded-full bg-[#0E1B33] text-[#FAF9F6] border border-[#C29C6D]/30 text-xs font-bold whitespace-nowrap">
            Studio Shots
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="px-5 grid grid-cols-3 gap-2.5 my-4">
        {PHOTOS.map((url, idx) => {
          const isSelected = selectedIndex === idx;
          return (
            <div
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group active:scale-95 transition-all shadow-md border border-[#C29C6D]/20"
            >
              <img src={url} alt={`Asset ${idx}`} className="w-full h-full object-cover" />
              {isSelected ? (
                <div className="absolute inset-0 bg-[#050A14]/50 flex items-center justify-center border-2 border-[#D4AF37]">
                  <div className="w-8 h-8 rounded-full bg-[#D4AF37] text-[#0B1528] flex items-center justify-center shadow-lg font-black">
                    <span className="material-symbols-outlined text-[20px]">check</span>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-40"></div>
              )}
            </div>
          );
        })}

        {/* Upload Placeholder */}
        <div className="aspect-square rounded-2xl border-2 border-dashed border-[#C29C6D]/40 flex flex-col items-center justify-center gap-1 bg-[#0B1528] cursor-pointer hover:border-[#D4AF37] transition-colors">
          <span className="material-symbols-outlined text-[#E5C07B] text-[24px]">add_a_photo</span>
          <span className="text-[10px] font-black text-[#E5C07B] uppercase tracking-wider font-sans">
            UPLOAD
          </span>
        </div>
      </div>

      {/* Floating Action Button Bar */}
      <div className="fixed bottom-20 left-0 w-full px-5 z-40 max-w-7xl mx-auto">
        <div className="bg-[#0B1528]/95 backdrop-blur-xl p-3.5 rounded-2xl shadow-2xl border border-[#C29C6D]/40 flex items-center justify-between">
          <div className="pl-4 font-sans">
            <p className="text-[10px] font-bold text-[#E5C07B] uppercase">Selected Photo</p>
            <p className="text-xs font-bold text-white">Image #{selectedIndex + 1}</p>
          </div>
          <button
            onClick={() => onNavigate('update-profile-picture')}
            className="flex items-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#C29C6D] text-[#0B1528] px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer font-sans shadow-md"
          >
            <span>Confirm Photo</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </div>

      <BottomNav activePath="account" onNavigate={onNavigate} />
    </div>
  );
};
