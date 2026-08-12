import React, { useState } from 'react';
import { useBranch, FABRIQ_BRANCHES, Branch } from '../context/BranchContext';
import fabriqLogo from '../assets/images/fabriq_ai_logo_1785771380575.jpg';

export const BranchSelectorModal: React.FC = () => {
  const {
    activeBranch,
    setActiveBranch,
    showBranchModal,
    setShowBranchModal,
    requestNewBranch,
    detectGPSLocation,
    isDetectingGPS,
    selectedCountry,
    setSelectedCountry,
    selectedCity,
    setSelectedCity,
  } = useBranch();

  const [newCityInput, setNewCityInput] = useState('');

  if (!showBranchModal) return null;

  const countries = ['All', 'India', 'United Kingdom'];
  const cities = ['All', 'Hyderabad', 'Bangalore', 'London'];

  const filteredBranches = FABRIQ_BRANCHES.filter((b) => {
    if (selectedCountry !== 'All' && b.country !== selectedCountry) return false;
    if (selectedCity !== 'All' && b.city !== selectedCity) return false;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-amber-400/60 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 border-b border-amber-400/40 relative">
          <button
            onClick={() => setShowBranchModal(false)}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl overflow-hidden border-2 border-amber-400 bg-slate-900 flex items-center justify-center shadow-lg shrink-0">
              <img
                src={fabriqLogo}
                alt="FabriQ AI Logo"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest block font-sans">
                ENTERPRISE MULTI-BRANCH ERP
              </span>
              <h2 className="font-['Libre_Caslon_Text',serif] text-xl font-bold text-white">
                Select Store & Counter Location
              </h2>
            </div>
          </div>
        </div>

        {/* GPS Quick Detect Banner */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 px-5 py-3 flex flex-col gap-2 border-b border-amber-400/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">my_location</span>
              <span className="text-xs font-bold">Auto-Detect GPS Location</span>
            </div>
            <button
              onClick={() => detectGPSLocation()}
              disabled={isDetectingGPS}
              className="bg-slate-950 hover:bg-slate-900 text-amber-300 px-3.5 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer transition-colors flex items-center gap-1 shadow-md"
            >
              {isDetectingGPS ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[14px]">sync</span>
                  <span>Locating via Satellite...</span>
                </>
              ) : (
                <>
                  <span>Locate Me</span>
                  <span className="material-symbols-outlined text-[14px]">radar</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-slate-950/90 text-amber-200 p-2 rounded-xl text-[10px] font-mono flex items-center justify-between border border-amber-400/30">
            <span>📍 Current GPS: Jubilee Hills, Hyderabad (Telangana 500033, India)</span>
            <span className="text-emerald-400 font-bold">0.8 km to Store</span>
          </div>
        </div>

        {/* Hierarchy Filters */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Country
            </label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-amber-400"
            >
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              City
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-amber-400"
            >
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

          {/* Active Branches List */}
          <div className="p-5 overflow-y-auto space-y-3 flex-1">
            {filteredBranches.length === 0 ? (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-center text-rose-900 space-y-2">
                <span className="material-symbols-outlined text-rose-600 text-[28px]">location_off</span>
                <h4 className="font-bold text-sm">No Store Branch Found in Selected Radius</h4>
                <p className="text-xs text-rose-700 leading-relaxed">
                  We currently do not have a physical FabriQ AI store branch operating in this exact location radius. Please select another city or suggest a new franchise branch location below.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredBranches.map((b) => {
                  const isSelected = activeBranch.id === b.id;
                  const isOpeningSoon = b.status === 'Opening Soon';

                  return (
                <div
                  key={b.id}
                  onClick={() => {
                    if (!isOpeningSoon) {
                      setActiveBranch(b);
                      setShowBranchModal(false);
                    }
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-amber-50/90 border-amber-400 shadow-md ring-2 ring-amber-400/40'
                      : isOpeningSoon
                      ? 'bg-slate-50 border-slate-200 opacity-70 cursor-not-allowed'
                      : 'bg-white border-slate-200 hover:border-amber-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <span
                        className={`material-symbols-outlined text-[22px] mt-0.5 ${
                          isSelected ? 'text-[#9E7B4F]' : 'text-slate-400'
                        }`}
                      >
                        storefront
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-bold text-sm text-slate-900">{b.name}</h4>
                          <span className="bg-slate-900 text-amber-300 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded">
                            {b.storeCode}
                          </span>
                          {b.isMain && (
                            <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded uppercase">
                              Flagship
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">{b.address}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-500 font-mono">
                          <span>Phone: {b.phone}</span>
                          <span>Counter: {b.counterId}</span>
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <span className="material-symbols-outlined text-amber-600 text-[20px] shrink-0">
                        check_circle
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Request Expansion */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 border border-amber-400/40 space-y-2 mt-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-400 text-[20px]">add_location_alt</span>
              <h4 className="font-bold text-xs text-amber-300 uppercase tracking-wider">
                Suggest New Franchise Location
              </h4>
            </div>
            <p className="text-[11px] text-slate-300">
              Want a FabriQ AI store branch near your residence or office? Submit details below:
            </p>
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={newCityInput}
                onChange={(e) => setNewCityInput(e.target.value)}
                placeholder="Enter city or neighborhood (e.g. Madhapur, Hitech City, Dubai)"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
              <button
                onClick={() => {
                  if (newCityInput.trim()) {
                    requestNewBranch(newCityInput);
                    setNewCityInput('');
                  }
                }}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
