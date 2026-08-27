import React, { useState } from 'react';
import { ScreenId } from '../types';
import { BottomNav } from '../components/BottomNav';
import { useBranch } from '../context/BranchContext';
import { AnimatedTimeline } from '../components/AnimatedTimeline';

interface ScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

interface FleetAgent {
  id: string;
  type: 'pickup' | 'delivery' | 'branch';
  name: string;
  roleTitle: string;
  status: string;
  eta: string;
  vehicle: string;
  coords: { x: number; y: number }; // Percentage offsets on map
  phone: string;
  rating: string;
}

export const LiveOrderTracking: React.FC<ScreenProps> = ({ onNavigate }) => {
  const { activeBranch } = useBranch();
  const [activeFilter, setActiveFilter] = useState<'all' | 'pickup' | 'delivery' | 'branch'>('all');
  const [selectedAgent, setSelectedAgent] = useState<FleetAgent | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'timeline'>('map');

  const FLEET_AGENTS: FleetAgent[] = [
    {
      id: 'agent-1',
      type: 'pickup',
      name: 'Suresh Varma (Pickup Captain)',
      roleTitle: 'Live Pickup Executive',
      status: 'On En Route Route #04',
      eta: '6 mins away',
      vehicle: 'FabriQ EV Van #04 (TS 09 EQ 4001)',
      coords: { x: 38, y: 42 },
      phone: '+91 98222 11001',
      rating: '4.9 ★',
    },
    {
      id: 'agent-2',
      type: 'delivery',
      name: 'Ramesh Naidu (Express Delivery)',
      roleTitle: 'Live Delivery Executive',
      status: 'Out for Doorstep Delivery #08',
      eta: '12 mins away',
      vehicle: 'FabriQ EV Bike #08 (TS 09 ED 9902)',
      coords: { x: 62, y: 55 },
      phone: '+91 98333 22112',
      rating: '4.9 ★',
    },
    {
      id: 'agent-3',
      type: 'branch',
      name: 'Jubilee Hills Flagship Atelier',
      roleTitle: 'Live Branch Location',
      status: 'Active Steam Studio & Care Hub',
      eta: 'Open • Processing 42 Orders',
      vehicle: 'Store Code: HYD-JUB-101',
      coords: { x: 50, y: 35 },
      phone: '+91 40 2355 8899',
      rating: '5.0 ★',
    },
    {
      id: 'agent-4',
      type: 'branch',
      name: 'Banjara Hills Luxury Care Lounge',
      roleTitle: 'Live Branch Location',
      status: 'Active Hydrocarbon Hub',
      eta: 'Open • Processing 28 Orders',
      vehicle: 'Store Code: HYD-BAN-102',
      coords: { x: 28, y: 65 },
      phone: '+91 40 2333 4455',
      rating: '4.9 ★',
    },
  ];

  const visibleAgents = FLEET_AGENTS.filter(
    (a) => activeFilter === 'all' || a.type === activeFilter
  );

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#FAFAFC] relative">
      {/* Background GPS Map Visual */}
      <div className="fixed inset-0 w-full h-full z-0 overflow-hidden bg-slate-900">
        <img
          src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=1200&auto=format&fit=crop"
          alt="Valet GPS Route Map"
          className="w-full h-full object-cover grayscale-[30%] brightness-90 opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-transparent to-slate-950/80 pointer-events-none" />

        {/* Dynamic Pins on Map */}
        {visibleAgents.map((agent) => (
          <div
            key={agent.id}
            onClick={() => setSelectedAgent(agent)}
            style={{ left: `${agent.coords.x}%`, top: `${agent.coords.y}%` }}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
          >
            <div className="relative flex flex-col items-center">
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center shadow-2xl border-2 border-white transition-transform group-hover:scale-125 ${
                  agent.type === 'pickup'
                    ? 'bg-blue-600 text-white'
                    : agent.type === 'delivery'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-400 text-slate-950 font-bold'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {agent.type === 'pickup'
                    ? 'local_shipping'
                    : agent.type === 'delivery'
                    ? 'two_wheeler'
                    : 'storefront'}
                </span>
              </div>
              <div className="mt-1 bg-slate-900/90 text-amber-300 px-2 py-0.5 rounded-full text-[9px] font-extrabold whitespace-nowrap shadow-md border border-amber-400/40">
                {agent.name.split(' ')[0]}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Top Floating Bar Header */}
      <div className="fixed top-16 left-4 right-4 z-30 flex items-center justify-between gap-2 max-w-xl mx-auto">
        <button
          onClick={() => onNavigate('home')}
          className="w-10 h-10 flex items-center justify-center bg-slate-900 text-amber-400 rounded-full shadow-xl border border-amber-400/50 hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </button>

        {/* Filter Pills and View Mode Toggle */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-full border border-amber-400/40 backdrop-blur-md overflow-x-auto">
          <button
            onClick={() => setViewMode('map')}
            className={`px-3 py-1 rounded-full text-[10px] font-extrabold cursor-pointer transition-all flex items-center gap-1 ${
              viewMode === 'map'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[13px]">map</span>
            <span>GPS Fleet</span>
          </button>
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-3 py-1 rounded-full text-[10px] font-extrabold cursor-pointer transition-all flex items-center gap-1 ${
              viewMode === 'timeline'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[13px]">timeline</span>
            <span>Stage Timeline</span>
          </button>
        </div>
      </div>

      {/* View Mode Timeline Container */}
      {viewMode === 'timeline' ? (
        <div className="fixed inset-0 z-30 pt-28 pb-28 px-4 overflow-y-auto bg-slate-950/95 backdrop-blur-md">
          <div className="max-w-xl mx-auto">
            <AnimatedTimeline />
          </div>
        </div>
      ) : null}

      {/* Bottom Floating Executive Fleet Details Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0B1528]/95 text-[#FAF9F6] backdrop-blur-xl rounded-t-3xl shadow-2xl p-5 pb-24 border-t-2 border-[#C29C6D]/40 max-w-2xl mx-auto">
        <div className="w-12 h-1 bg-[#D4AF37]/60 rounded-full mx-auto mb-3" />

        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[10px] font-black text-[#E5C07B] uppercase tracking-widest block font-sans">
              REAL-TIME ENTERPRISE FLEET GPS
            </span>
            <h2 className="font-['Libre_Caslon_Text',serif] text-xl font-bold text-[#FAF9F6]">
              {selectedAgent ? selectedAgent.name : `Live Fleet in ${activeBranch.city}`}
            </h2>
          </div>
          <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-400/40 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>4 Active Tracking Nodes</span>
          </span>
        </div>

        {/* Active Selected Agent Card */}
        {selectedAgent ? (
          <div className="bg-[#070F1E] p-4 rounded-2xl border border-[#C29C6D]/40 space-y-2 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#E5C07B] uppercase tracking-wider">
                {selectedAgent.roleTitle}
              </span>
              <span className="text-xs font-bold text-[#E5C07B]">{selectedAgent.rating}</span>
            </div>
            <p className="text-xs text-slate-300 font-medium">{selectedAgent.status}</p>
            <p className="text-[11px] text-slate-400 font-mono">{selectedAgent.vehicle}</p>
            <p className="text-[11px] text-emerald-400 font-bold">{selectedAgent.eta}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
            {FLEET_AGENTS.map((ag) => (
              <div
                key={ag.id}
                onClick={() => setSelectedAgent(ag)}
                className="bg-[#070F1E] p-3 rounded-2xl border border-[#C29C6D]/30 hover:border-[#D4AF37] transition-colors cursor-pointer flex items-center gap-3"
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    ag.type === 'pickup'
                      ? 'bg-blue-600/30 text-blue-400'
                      : ag.type === 'delivery'
                      ? 'bg-emerald-600/30 text-emerald-400'
                      : 'bg-amber-400/30 text-[#E5C07B]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {ag.type === 'pickup'
                      ? 'local_shipping'
                      : ag.type === 'delivery'
                      ? 'two_wheeler'
                      : 'storefront'}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-xs text-[#FAF9F6] truncate">{ag.name}</h4>
                  <p className="text-[10px] text-slate-400 truncate">{ag.eta}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onNavigate('concierge-chat')}
            className="py-3 min-h-[44px] rounded-2xl bg-[#070F1E] text-[#FAF9F6] text-xs font-bold uppercase tracking-wider hover:bg-[#121E36] transition-colors flex items-center justify-center gap-2 cursor-pointer border border-[#C29C6D]/40"
          >
            <span className="material-symbols-outlined text-[#E5C07B] text-[18px]">chat</span>
            <span>Dispatch Chat</span>
          </button>

          <button
            onClick={() => onNavigate('home')}
            className="py-3 min-h-[44px] rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#C29C6D] text-[#0B1528] text-xs font-black uppercase tracking-wider shadow-md hover:opacity-90 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">dashboard</span>
            <span>Return to App</span>
          </button>
        </div>
      </div>

      <BottomNav activePath="orders" onNavigate={onNavigate} />
    </div>
  );
};
