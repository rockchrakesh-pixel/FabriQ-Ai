import React, { useState } from 'react';
import { FranchiseEntity, FranchiseAgreement, BranchEntity } from '../../types';

const INITIAL_FRANCHISE: FranchiseEntity = {
  franchiseId: 'fr-hyd-01',
  orgId: 'org-fabriq-global',
  franchiseName: 'FabriQ Jubilee & Secunderabad Atelier Franchise',
  legalEntityName: 'Deccan Luxury Retail & Fabric Care Pvt Ltd',
  ownerName: 'Dr. Siddharth Singhania',
  ownerEmail: 'siddharth@fabriq-deccan.com',
  ownerPhone: '+91 98490 11223',
  territory: 'Hyderabad North & Central (Secunderabad, Bowenpally, Jubilee Hills)',
  country: 'India',
  stateRegion: 'Telangana',
  city: 'Hyderabad',
  status: 'active',
  agreementRefId: 'agr-2026-v1.2',
  agreementStartDate: '2025-01-01',
  agreementEndDate: '2030-12-31',
  operatingDivisions: ['laundry', 'boutique', 'luxury_store'],
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2026-08-15T04:00:00.000Z',
};

const INITIAL_AGREEMENT: FranchiseAgreement = {
  agreementId: 'agr-2026-v1.2',
  franchiseId: 'fr-hyd-01',
  orgId: 'org-fabriq-global',
  status: 'active',
  effectiveDate: '2025-01-01',
  expiryDate: '2030-12-31',
  territory: 'Hyderabad North & Central',
  royaltyModel: 'fixed_percentage',
  royaltyPercentage: 8.5,
  fixedFee: 50000,
  settlementFrequency: 'monthly',
  currency: 'INR',
  paymentTerms: 'Net 15 Days after month end',
  version: '1.2',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const INITIAL_BRANCHES: BranchEntity[] = [
  {
    branchId: 'b-hyd-bowenpally',
    orgId: 'org-fabriq-global',
    franchiseId: 'fr-hyd-01',
    divisionIds: ['laundry', 'boutique', 'luxury_store'],
    name: 'Bowenpally Care Atelier',
    city: 'Secunderabad',
    address: 'Near Diamond Point, Bowenpally, Secunderabad 500011',
    status: 'active',
    isCorporateOwned: false,
    createdAt: '2025-01-15T00:00:00.000Z',
    updatedAt: '2026-08-15T00:00:00.000Z',
  },
  {
    branchId: 'b-hyd-suchitra',
    orgId: 'org-fabriq-global',
    franchiseId: 'fr-hyd-01',
    divisionIds: ['laundry', 'luxury_store'],
    name: 'Suchitra Junction Lounge',
    city: 'Hyderabad',
    address: 'Suchitra Junction, Medchal Highway 500067',
    status: 'active',
    isCorporateOwned: false,
    createdAt: '2025-03-01T00:00:00.000Z',
    updatedAt: '2026-08-15T00:00:00.000Z',
  },
  {
    branchId: 'b-hyd-kompally',
    orgId: 'org-fabriq-global',
    franchiseId: 'fr-hyd-01',
    divisionIds: ['laundry', 'boutique'],
    name: 'Kompally Luxury Studio',
    city: 'Hyderabad',
    address: 'Main Road, Kompally, Hyderabad 500100',
    status: 'active',
    isCorporateOwned: false,
    createdAt: '2025-05-10T00:00:00.000Z',
    updatedAt: '2026-08-15T00:00:00.000Z',
  },
];

export const FranchiseProfileFoundation: React.FC = () => {
  const [franchise] = useState<FranchiseEntity>(INITIAL_FRANCHISE);
  const [agreement] = useState<FranchiseAgreement>(INITIAL_AGREEMENT);
  const [branches] = useState<BranchEntity[]>(INITIAL_BRANCHES);
  const [activeTab, setActiveTab] = useState<'profile' | 'agreement' | 'branches'>('profile');

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <span className="text-[10px] font-extrabold text-[#9E7B4F] uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            PHASE 2A FRANCHISE ARCHITECTURE FOUNDATION
          </span>
          <h2 className="font-['Libre_Caslon_Text',serif] text-xl font-bold text-slate-900 mt-1.5 flex items-center gap-2">
            <span>{franchise.franchiseName}</span>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full uppercase border border-emerald-300 font-mono">
              {franchise.status}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Legal Entity: <strong className="text-slate-800">{franchise.legalEntityName}</strong> • ID: <span className="font-mono text-amber-700">{franchise.franchiseId}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-slate-900 text-amber-300 font-black shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Franchise Profile
          </button>
          <button
            onClick={() => setActiveTab('agreement')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'agreement'
                ? 'bg-slate-900 text-amber-300 font-black shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Agreement Meta (v{agreement.version})
          </button>
          <button
            onClick={() => setActiveTab('branches')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'branches'
                ? 'bg-slate-900 text-amber-300 font-black shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Assigned Branches ({branches.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Franchise Profile */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1.5">
              Ownership & Contact Scope
            </h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Owner Name:</span>
                <span className="font-bold text-slate-900">{franchise.ownerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Owner Email:</span>
                <span className="font-mono text-amber-700 font-bold">{franchise.ownerEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Contact Phone:</span>
                <span className="font-bold text-slate-800">{franchise.ownerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Organization Tenant:</span>
                <span className="font-mono text-slate-700">{franchise.orgId}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1.5">
              Territory & Multi-Division Operations
            </h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Territory Bounds:</span>
                <span className="font-bold text-slate-900 text-right">{franchise.territory}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Location:</span>
                <span className="font-bold text-slate-800">{franchise.city}, {franchise.stateRegion}, {franchise.country}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-500">Operating Divisions:</span>
                <div className="flex items-center gap-1">
                  {franchise.operatingDivisions.map((div) => (
                    <span
                      key={div}
                      className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300"
                    >
                      {div}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Agreement Meta */}
      {activeTab === 'agreement' && (
        <div className="bg-slate-900 text-white rounded-2xl p-5 border border-amber-400/40 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <div>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                FRANCHISE AGREEMENT METADATA ARCHITECTURE
              </span>
              <h4 className="font-['Libre_Caslon_Text',serif] text-base font-bold text-white mt-0.5">
                Agreement Version {agreement.version} (Ref: {agreement.agreementId})
              </h4>
            </div>
            <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/40">
              Status: {agreement.status.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
              <span className="text-[9px] text-slate-400 uppercase font-bold block">Effective Date</span>
              <span className="font-mono text-amber-300 font-bold block mt-0.5">{agreement.effectiveDate}</span>
            </div>
            <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
              <span className="text-[9px] text-slate-400 uppercase font-bold block">Expiry Date</span>
              <span className="font-mono text-amber-300 font-bold block mt-0.5">{agreement.expiryDate}</span>
            </div>
            <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
              <span className="text-[9px] text-slate-400 uppercase font-bold block">Royalty Model</span>
              <span className="font-bold text-white block mt-0.5">{agreement.royaltyModel} ({agreement.royaltyPercentage}%)</span>
            </div>
            <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
              <span className="text-[9px] text-slate-400 uppercase font-bold block">Settlement Schedule</span>
              <span className="font-bold text-white block mt-0.5">{agreement.settlementFrequency} ({agreement.currency})</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 italic bg-slate-800/60 p-2.5 rounded-xl border border-slate-700">
            ℹ️ <strong>Architecture Note:</strong> Agreement model supports versioning without altering historical financial calculations. Financial split billing calculation engine triggers in Phase 2B.
          </p>
        </div>
      )}

      {/* Tab 3: Assigned Branches */}
      {activeTab === 'branches' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-600">
              Organization ➔ Franchise ➔ Branch Hierarchy
            </h4>
            <span className="text-xs text-slate-500">
              Total Assigned: <strong>{branches.length} Branches</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {branches.map((b) => (
              <div key={b.branchId} className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-mono text-slate-400 font-bold">{b.branchId}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${b.isCorporateOwned ? 'bg-purple-100 text-purple-800' : 'bg-emerald-100 text-emerald-800'}`}>
                    {b.isCorporateOwned ? 'Corporate Flagship' : 'Franchise Branch'}
                  </span>
                </div>
                <h5 className="font-bold text-slate-900 text-sm">{b.name}</h5>
                <p className="text-[11px] text-slate-500">{b.address}</p>
                <div className="flex items-center gap-1 pt-1">
                  {b.divisionIds.map((div) => (
                    <span key={div} className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                      {div}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
