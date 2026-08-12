import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface GarmentHealthData {
  month: string;
  itemsCleaned: number;
  healthScore: number;
  restoredRatio: number;
}

const MONTHLY_HEALTH_DATA: GarmentHealthData[] = [
  { month: 'Jan', itemsCleaned: 142, healthScore: 94.2, restoredRatio: 98.5 },
  { month: 'Feb', itemsCleaned: 188, healthScore: 95.8, restoredRatio: 99.1 },
  { month: 'Mar', itemsCleaned: 230, healthScore: 96.5, restoredRatio: 99.4 },
  { month: 'Apr', itemsCleaned: 310, healthScore: 97.8, restoredRatio: 99.6 },
  { month: 'May', itemsCleaned: 290, healthScore: 98.2, restoredRatio: 99.8 },
  { month: 'Jun', itemsCleaned: 380, healthScore: 98.9, restoredRatio: 99.9 },
  { month: 'Jul', itemsCleaned: 420, healthScore: 99.4, restoredRatio: 100.0 },
  { month: 'Aug', itemsCleaned: 460, healthScore: 99.7, restoredRatio: 100.0 },
];

const FABRIC_PRESERVATION_CATEGORIES = [
  { name: 'Silk & Zari Sarees', count: 320, preservationRate: 99.8, color: '#9E7B4F' },
  { name: 'Wool Suits & Blazers', count: 280, preservationRate: 99.5, color: '#1e293b' },
  { name: 'Couture & Gowns', count: 190, preservationRate: 99.9, color: '#db2777' },
  { name: 'Denim & Cotton', count: 410, preservationRate: 98.9, color: '#0284c7' },
  { name: 'Footwear & Leather', count: 160, preservationRate: 99.2, color: '#b45309' },
];

const PRESERVATION_STATUS_DONUT = [
  { name: 'Fiber Intact (100%)', value: 72, color: '#10b981' },
  { name: 'Color Lock Restored', value: 20, color: '#3b82f6' },
  { name: 'Stain Extraction Complete', value: 6, color: '#f59e0b' },
  { name: 'Moth/UV Protection Applied', value: 2, color: '#8b5cf6' },
];

export const GarmentHealthSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'trends' | 'categories' | 'status'>('trends');

  return (
    <div className="bg-white rounded-3xl p-5 md:p-6 border border-slate-200 shadow-md relative my-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#9E7B4F] animate-ping" />
            <span className="text-[10px] font-extrabold text-[#9E7B4F] uppercase tracking-widest block font-sans">
              ATELIER ANALYTICS • GARMENT HEALTH & LONGEVITY
            </span>
          </div>
          <h2 className="font-['Libre_Caslon_Text',serif] text-xl font-bold text-slate-900 leading-tight mt-0.5">
            Preservation Statistics & Quality Index
          </h2>
        </div>

        {/* View Selector Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('trends')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === 'trends'
                ? 'bg-slate-900 text-amber-400 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Health Score Trends
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === 'categories'
                ? 'bg-slate-900 text-amber-400 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            By Fabric Category
          </button>
          <button
            onClick={() => setActiveTab('status')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === 'status'
                ? 'bg-slate-900 text-amber-400 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Status Breakdown
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Garments Cleaned
          </span>
          <p className="font-['Libre_Caslon_Text',serif] text-2xl font-bold text-slate-900 mt-1">
            2,420 <span className="text-xs font-sans text-emerald-600 font-bold">+18.4%</span>
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">Zero Fiber Damage Audit</p>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Garment Health Score
          </span>
          <p className="font-['Libre_Caslon_Text',serif] text-2xl font-bold text-[#9E7B4F] mt-1">
            99.7% <span className="text-xs font-sans text-emerald-600 font-bold">Top 0.1%</span>
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">pH Hydrocarbon Balance</p>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Fabric Life Extension
          </span>
          <p className="font-['Libre_Caslon_Text',serif] text-2xl font-bold text-slate-900 mt-1">
            +4.2 Yrs
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">Vs Standard Commercial Wash</p>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Eco Water Saved
          </span>
          <p className="font-['Libre_Caslon_Text',serif] text-2xl font-bold text-emerald-700 mt-1">
            18,400 L
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">Recycled Ozone Filtration</p>
        </div>
      </div>

      {/* Main Chart Rendering Container */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 md:p-5 border border-amber-400/30">
        {activeTab === 'trends' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-['Libre_Caslon_Text',serif] text-base font-bold text-white">
                  Monthly Garments Processed vs Health Score Index
                </h4>
                <p className="text-xs text-slate-400">
                  Hydrocarbon Dry Cleaning & Ozonated Wash Statistics (2026)
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-amber-300 bg-slate-800 px-3 py-1 rounded-full border border-amber-400/40">
                Avg Score: 98.2%
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MONTHLY_HEALTH_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="itemsColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#9E7B4F" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#9E7B4F" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="healthColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#9E7B4F', borderRadius: '12px', fontSize: '12px' }}
                    labelStyle={{ color: '#fbbf24', fontWeight: 'bold' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="itemsCleaned"
                    name="Items Cleaned"
                    stroke="#9E7B4F"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#itemsColor)"
                  />
                  <Area
                    type="monotone"
                    dataKey="healthScore"
                    name="Health Score Index (%)"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={0.2}
                    fill="url(#healthColor)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-['Libre_Caslon_Text',serif] text-base font-bold text-white">
                  Garment Cleaned Volume by Material Category
                </h4>
                <p className="text-xs text-slate-400">
                  Preservation rate maintained above 98.9% across all fabric types
                </p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={FABRIC_PRESERVATION_CATEGORIES} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#fbbf24', borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" name="Garment Count" fill="#fbbf24" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'status' && (
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="w-full md:w-1/2 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={PRESERVATION_STATUS_DONUT}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {PRESERVATION_STATUS_DONUT.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#38bdf8', borderRadius: '12px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="w-full md:w-1/2 space-y-3">
              <h4 className="font-['Libre_Caslon_Text',serif] text-base font-bold text-white">
                Preservation & Care Status Distribution
              </h4>
              {PRESERVATION_STATUS_DONUT.map((status) => (
                <div key={status.name} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: status.color }} />
                    <span className="text-xs font-bold text-slate-200">{status.name}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-300">{status.value}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
