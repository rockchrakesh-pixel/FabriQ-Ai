import React, { useState } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { ScreenId } from '../types';
import { BottomNav } from '../components/BottomNav';
import { useBranch } from '../context/BranchContext';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

interface ScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const ServiceAddress: React.FC<ScreenProps> = ({ onNavigate }) => {
  const { activeBranch, gpsDetectedName, detectGPSLocation, isDetectingGPS, setCustomLocation } = useBranch();
  const [selectedTag, setSelectedTag] = useState<'Home' | 'Office' | 'Other'>('Home');
  const [streetQuery, setStreetQuery] = useState('');
  const [houseNo, setHouseNo] = useState('Suite 402, 4th Floor');
  const [landmark, setLandmark] = useState('Near main lobby, ring valet bell');
  const [isEditingPin, setIsEditingPin] = useState(false);

  const [markerPos, setMarkerPos] = useState({
    lat: activeBranch.lat || 17.4319,
    lng: activeBranch.lng || 78.4071,
  });

  const handleMapClick = (e: any) => {
    if (e.detail?.latLng) {
      setMarkerPos({
        lat: e.detail.latLng.lat,
        lng: e.detail.latLng.lng,
      });
      setGpsCustomLocationText(`📍 Pin Dropped: ${e.detail.latLng.lat.toFixed(4)}, ${e.detail.latLng.lng.toFixed(4)}`);
    }
  };

  const [gpsCustomLocationText, setGpsCustomLocationText] = useState<string | null>(null);

  return (
    <div className="flex flex-col w-full pb-28 pt-16 bg-[#070F1E] min-h-screen text-[#FAF9F6] font-sans">
      {/* Header */}
      <div className="px-5 py-3 flex items-center justify-between border-b border-[#C29C6D]/30 bg-[#0B1528] shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('cart')}
            className="w-10 h-10 min-h-[44px] flex items-center justify-center rounded-full bg-[#070F1E] text-[#E5C07B] border border-[#C29C6D]/40 hover:border-[#D4AF37] transition-colors cursor-pointer"
            aria-label="Back"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div>
            <span className="text-[10px] font-extrabold text-[#E5C07B] uppercase tracking-wider font-sans">
              VALET DOORSTEP LOCATION
            </span>
            <h1 className="font-['Libre_Caslon_Text',serif] text-xl font-bold text-[#FAF9F6]">
              Service Address
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#070F1E] rounded-full border border-[#C29C6D]/40 text-[10px] font-bold text-[#E5C07B]">
          <span className="material-symbols-outlined text-[14px]">map</span>
          <span>Google Maps API {hasValidKey ? 'Active' : 'Ready'}</span>
        </div>
      </div>

      {/* Map Section */}
      <div className="relative w-full h-64 bg-[#0B1528] overflow-hidden border-b border-[#C29C6D]/30">
        {hasValidKey ? (
          <APIProvider apiKey={API_KEY} version="weekly">
            <Map
              defaultCenter={{ lat: activeBranch.lat || 17.4319, lng: activeBranch.lng || 78.4071 }}
              defaultZoom={15}
              mapId="FABRIQ_SERVICE_ADDRESS_MAP"
              onClick={handleMapClick}
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              style={{ width: '100%', height: '100%' }}
            >
              <AdvancedMarker position={markerPos} title="Selected Doorstep Pin">
                <Pin background="#D4AF37" glyphColor="#0B1528" borderColor="#83633B" />
              </AdvancedMarker>
            </Map>
          </APIProvider>
        ) : (
          <div className="relative w-full h-full bg-[#050A14] flex flex-col items-center justify-center p-4 text-center">
            <img
              src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=800&auto=format&fit=crop"
              alt="Map Background"
              className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale"
            />
            <div className="relative z-10 bg-[#0B1528]/95 backdrop-blur-md p-4 rounded-2xl border border-[#C29C6D]/40 max-w-md space-y-2 text-white">
              <div className="flex items-center justify-center gap-2 text-[#E5C07B]">
                <span className="material-symbols-outlined text-[22px]">map</span>
                <span className="text-xs font-bold uppercase tracking-wider">Google Maps Platform Integration</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Add <code className="bg-[#070F1E] text-[#E5C07B] px-1 py-0.5 rounded font-mono border border-[#C29C6D]/30">GOOGLE_MAPS_PLATFORM_KEY</code> in <strong>Settings (⚙️) → Secrets</strong> to load live vector maps.
              </p>
              <div className="pt-1 flex items-center justify-center gap-2 text-[10px] text-emerald-400 font-bold">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                <span>GPS Auto-Detection & Autocomplete are fully functional below</span>
              </div>
            </div>

            {/* Floating Pin overlay */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full flex flex-col items-center pointer-events-none z-10">
              <span className="material-symbols-outlined text-[#D4AF37] text-5xl drop-shadow-xl animate-bounce">
                location_on
              </span>
              <div className="w-3 h-3 bg-[#070F1E] rounded-full mt-[-10px] border border-[#D4AF37]"></div>
            </div>
          </div>
        )}
      </div>

      {/* Address Form (FabriQ Style) */}
      <div className="px-5 -mt-6 relative z-10 max-w-2xl mx-auto w-full">
        <div className="bg-[#0B1528] rounded-3xl p-5 shadow-xl border border-[#C29C6D]/40 flex flex-col gap-4">
          
          {/* GPS Quick Button & Street Input */}
          <div className="bg-[#070F1E] rounded-2xl p-3 border border-[#C29C6D]/30 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-[#E5C07B] uppercase tracking-wider">
                SATELLITE GPS & LOCATION SEARCH
              </span>
              <button
                type="button"
                onClick={() => detectGPSLocation()}
                disabled={isDetectingGPS}
                className="bg-gradient-to-r from-[#D4AF37] to-[#C29C6D] text-[#0B1528] hover:opacity-90 px-3 py-1 rounded-xl text-[11px] font-black flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
              >
                <span className="material-symbols-outlined text-[14px]">
                  {isDetectingGPS ? 'sync' : 'my_location'}
                </span>
                <span>{isDetectingGPS ? 'Locating...' : 'Auto-Detect GPS'}</span>
              </button>
            </div>

            {isEditingPin ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (streetQuery) setCustomLocation(streetQuery);
                  setIsEditingPin(false);
                }}
                className="flex items-center gap-2 mt-1"
              >
                <input
                  type="text"
                  placeholder="Type street name or landmark (e.g. Jubilee Hills Road 36)..."
                  value={streetQuery}
                  onChange={(e) => setStreetQuery(e.target.value)}
                  className="w-full bg-[#0B1528] text-white px-3 py-1.5 rounded-xl text-xs border border-[#C29C6D]/50 font-bold focus:outline-none focus:border-[#D4AF37]"
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-[#D4AF37] to-[#C29C6D] text-[#0B1528] px-3 py-1.5 rounded-xl text-xs font-black shrink-0 cursor-pointer"
                >
                  Apply
                </button>
              </form>
            ) : (
              <div className="flex items-center justify-between pt-1">
                <span className="font-['Libre_Caslon_Text',serif] text-base font-bold text-[#FAF9F6] truncate">
                  {gpsCustomLocationText || gpsDetectedName || `${activeBranch.area ? activeBranch.area + ', ' : ''}${activeBranch.city}`}
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditingPin(true)}
                  className="text-xs text-[#E5C07B] font-bold flex items-center gap-1 hover:underline cursor-pointer shrink-0 ml-2"
                >
                  <span className="material-symbols-outlined text-[15px]">edit</span>
                  <span>Search Street</span>
                </button>
              </div>
            )}
            <p className="text-[11px] text-slate-300 font-sans">
              Assigned Store Branch: <strong className="text-[#E5C07B]">{activeBranch.name} ({activeBranch.city})</strong>
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs text-slate-300 font-bold block mb-1">
                Flat, Apartment / House No. & Floor
              </label>
              <input
                type="text"
                placeholder="e.g. Flat 4B, 4th Floor"
                value={houseNo}
                onChange={(e) => setHouseNo(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#070F1E] text-xs font-bold text-white border border-[#C29C6D]/30 focus:outline-none focus:border-[#D4AF37] transition-colors"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 font-bold block mb-1">
                Landmark & Doorstep Delivery Instructions
              </label>
              <input
                type="text"
                placeholder="e.g. Near West Gate, ring reception bell..."
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#070F1E] text-xs font-bold text-white border border-[#C29C6D]/30 focus:outline-none focus:border-[#D4AF37] transition-colors"
              />
            </div>
          </div>

          {/* Tag Selector */}
          <div>
            <span className="text-xs text-slate-300 font-bold block mb-2">Save Address As</span>
            <div className="flex gap-2">
              {(['Home', 'Office', 'Other'] as const).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(tag)}
                  className={`px-4 py-2 min-h-[44px] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    selectedTag === tag
                      ? 'bg-[#070F1E] text-[#E5C07B] border border-[#D4AF37] shadow-xs'
                      : 'bg-[#070F1E] text-slate-300 border border-[#C29C6D]/30 hover:border-[#C29C6D]'
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
      <div className="mt-5 px-5 max-w-2xl mx-auto w-full">
        <button
          onClick={() => onNavigate('cart')}
          className="w-full min-h-[48px] bg-gradient-to-r from-[#D4AF37] to-[#C29C6D] text-[#0B1528] rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg hover:opacity-95 transition-all cursor-pointer active:scale-98"
        >
          <span>Confirm Service Address</span>
          <span className="material-symbols-outlined text-[#0B1528] text-[18px]">check_circle</span>
        </button>
      </div>

      <BottomNav activePath="account" onNavigate={onNavigate} />
    </div>
  );
};
