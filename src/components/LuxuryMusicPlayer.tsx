import React, { useState, useEffect } from 'react';
import { musicEngine, LUXURY_TRACKS, MusicTrack } from '../lib/musicEngine';

export const LuxuryMusicPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTrack, setCurrentTrack] = useState<MusicTrack>(LUXURY_TRACKS[0]);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.3);

  useEffect(() => {
    const status = musicEngine.getStatus();
    setIsPlaying(status.isPlaying);
    setCurrentTrack(status.currentTrack);
  }, []);

  const handleTogglePlay = () => {
    const playing = musicEngine.togglePlayPause();
    setIsPlaying(playing);
    setCurrentTrack(musicEngine.getStatus().currentTrack);
  };

  const handleNext = () => {
    const track = musicEngine.nextTrack();
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    const track = musicEngine.prevTrack();
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    musicEngine.setVolume(val);
  };

  return (
    <div className="relative">
      {/* Quick Audio Play Button in Navigation Bar */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border shadow-sm cursor-pointer ${
          isPlaying
            ? 'bg-amber-100/90 border-[#C29C6D] text-[#83633B]'
            : 'bg-slate-100 border-slate-200 text-slate-700 hover:border-[#C29C6D]'
        }`}
        title="Ambient FabriQ AI Music Player"
      >
        <span className={`material-symbols-outlined text-[18px] ${isPlaying ? 'animate-bounce text-[#83633B]' : 'text-slate-500'}`}>
          {isPlaying ? 'graphic_eq' : 'music_note'}
        </span>
        <span className="hidden sm:inline font-['Libre_Caslon_Text',serif] truncate max-w-[110px]">
          {isPlaying ? currentTrack.title : 'Ambient Audio'}
        </span>
        <span className="material-symbols-outlined text-[14px]">
          {isExpanded ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {/* Expanded Music Control Popover */}
      {isExpanded && (
        <div className="absolute right-0 top-11 z-50 w-72 bg-white border border-amber-200 rounded-2xl shadow-2xl p-4 text-slate-800 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-[10px] font-bold text-[#83633B] uppercase tracking-wider flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">headphones</span>
              FABRIQ AI MUSIC ROOM
            </span>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-slate-400 hover:text-slate-700 p-0.5"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>

          <div className="my-3 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#9E7B4F] to-[#E3C396] flex items-center justify-center text-white shadow-md shrink-0">
              <span className="material-symbols-outlined text-[24px]">music_note</span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-['Libre_Caslon_Text',serif] text-sm font-bold text-slate-900 truncate">
                {currentTrack.title}
              </h4>
              <p className="text-[11px] text-[#83633B] truncate">{currentTrack.composer}</p>
              <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{currentTrack.description}</p>
            </div>
          </div>

          {/* Sound Wave Equalizer Effect */}
          {isPlaying && (
            <div className="flex items-center justify-center gap-1 my-2 h-4">
              <span className="w-1 h-3 bg-[#9E7B4F] rounded-full animate-pulse"></span>
              <span className="w-1 h-4 bg-[#C29C6D] rounded-full animate-pulse delay-75"></span>
              <span className="w-1 h-2 bg-[#9E7B4F] rounded-full animate-pulse delay-150"></span>
              <span className="w-1 h-4 bg-[#E3C396] rounded-full animate-pulse delay-200"></span>
              <span className="w-1 h-3 bg-[#83633B] rounded-full animate-pulse"></span>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-center gap-3 my-2">
            <button
              onClick={handlePrev}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-700 transition-colors"
              title="Previous Track"
            >
              <span className="material-symbols-outlined text-[20px]">skip_previous</span>
            </button>

            <button
              onClick={handleTogglePlay}
              className="w-10 h-10 rounded-full bg-[#9E7B4F] text-white flex items-center justify-center shadow-lg hover:bg-[#83633B] transition-all"
            >
              <span className="material-symbols-outlined text-[24px]">
                {isPlaying ? 'pause' : 'play_arrow'}
              </span>
            </button>

            <button
              onClick={handleNext}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-700 transition-colors"
              title="Next Track"
            >
              <span className="material-symbols-outlined text-[20px]">skip_next</span>
            </button>
          </div>

          {/* Volume Control */}
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
            <span className="material-symbols-outlined text-[16px]">volume_down</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              className="flex-1 accent-[#9E7B4F] h-1 bg-slate-200 rounded-lg cursor-pointer"
            />
            <span className="material-symbols-outlined text-[16px]">volume_up</span>
          </div>
        </div>
      )}
    </div>
  );
};
