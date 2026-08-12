import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

export interface AreaData {
  id: string;
  name: string;
  zipcode: string;
  orders: number;
  revenue: number; // in INR
  demandIndex: number; // 0-100
  topService: string;
  activeValets: number;
  avgTurnaroundHours: number;
  lat: number;
  lng: number;
  zone: 'West' | 'Central' | 'North' | 'South';
}

const HYDERABAD_AREAS: AreaData[] = [
  {
    id: 'HYD-01',
    name: 'Hitec City',
    zipcode: '500081',
    orders: 5120,
    revenue: 1920000,
    demandIndex: 99,
    topService: 'Executive Shirts & Express Dry Clean',
    activeValets: 18,
    avgTurnaroundHours: 18,
    lat: 17.4435,
    lng: 78.3772,
    zone: 'West',
  },
  {
    id: 'HYD-02',
    name: 'Jubilee Hills',
    zipcode: '500033',
    orders: 4820,
    revenue: 1840000,
    demandIndex: 98,
    topService: 'Bespoke Italian Suits & Saree Care',
    activeValets: 15,
    avgTurnaroundHours: 12,
    lat: 17.4319,
    lng: 78.4073,
    zone: 'West',
  },
  {
    id: 'HYD-03',
    name: 'Banjara Hills',
    zipcode: '500034',
    orders: 4210,
    revenue: 1610000,
    demandIndex: 94,
    topService: 'Hydrocarbon Eco Wash & Leather Care',
    activeValets: 14,
    avgTurnaroundHours: 16,
    lat: 17.4156,
    lng: 78.4347,
    zone: 'West',
  },
  {
    id: 'HYD-04',
    name: 'Gachibowli',
    zipcode: '500032',
    orders: 3950,
    revenue: 1480000,
    demandIndex: 89,
    topService: 'Laundry By KG & Vacuum Steam Press',
    activeValets: 12,
    avgTurnaroundHours: 24,
    lat: 17.4401,
    lng: 78.3489,
    zone: 'West',
  },
  {
    id: 'HYD-05',
    name: 'Financial District',
    zipcode: '500032',
    orders: 3800,
    revenue: 1520000,
    demandIndex: 92,
    topService: 'Corporate Uniforms & Express Valet',
    activeValets: 11,
    avgTurnaroundHours: 14,
    lat: 17.412,
    lng: 78.34,
    zone: 'West',
  },
  {
    id: 'HYD-06',
    name: 'Madhapur',
    zipcode: '500081',
    orders: 3400,
    revenue: 1250000,
    demandIndex: 86,
    topService: 'Designer Lehengas & Shoe Care',
    activeValets: 10,
    avgTurnaroundHours: 20,
    lat: 17.4483,
    lng: 78.3915,
    zone: 'West',
  },
  {
    id: 'HYD-07',
    name: 'Kondapur',
    zipcode: '500084',
    orders: 3100,
    revenue: 1100000,
    demandIndex: 84,
    topService: 'Steam Ironing & Casual Wear',
    activeValets: 9,
    avgTurnaroundHours: 24,
    lat: 17.4622,
    lng: 78.3568,
    zone: 'West',
  },
  {
    id: 'HYD-08',
    name: 'Kukatpally',
    zipcode: '500072',
    orders: 2900,
    revenue: 1020000,
    demandIndex: 81,
    topService: 'Household Blankets & Curtain Wash',
    activeValets: 8,
    avgTurnaroundHours: 28,
    lat: 17.4849,
    lng: 78.4138,
    zone: 'North',
  },
  {
    id: 'HYD-09',
    name: 'Secunderabad',
    zipcode: '500003',
    orders: 2600,
    revenue: 890000,
    demandIndex: 78,
    topService: 'Eco Dry Cleaning & Uniform Care',
    activeValets: 7,
    avgTurnaroundHours: 32,
    lat: 17.4399,
    lng: 78.4983,
    zone: 'North',
  },
  {
    id: 'HYD-10',
    name: 'Begumpet',
    zipcode: '500016',
    orders: 2150,
    revenue: 780000,
    demandIndex: 72,
    topService: 'Carpet & Rug Deep Sanitization',
    activeValets: 6,
    avgTurnaroundHours: 36,
    lat: 17.4447,
    lng: 78.4664,
    zone: 'Central',
  },
  {
    id: 'HYD-11',
    name: 'Himayatnagar',
    zipcode: '500029',
    orders: 1950,
    revenue: 690000,
    demandIndex: 68,
    topService: 'Ethnic Wear & Embroidery Care',
    activeValets: 5,
    avgTurnaroundHours: 36,
    lat: 17.4018,
    lng: 78.4843,
    zone: 'Central',
  },
  {
    id: 'HYD-12',
    name: 'Mehdipatnam',
    zipcode: '500028',
    orders: 1750,
    revenue: 590000,
    demandIndex: 62,
    topService: 'Daily Wash & Fold (KG)',
    activeValets: 4,
    avgTurnaroundHours: 40,
    lat: 17.395,
    lng: 78.4382,
    zone: 'South',
  },
];

export const HyderabadDemandHeatmap: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  const [metric, setMetric] = useState<'demandIndex' | 'orders' | 'revenue'>('demandIndex');
  const [selectedArea, setSelectedArea] = useState<AreaData | null>(HYDERABAD_AREAS[0]);
  const [hoveredArea, setHoveredArea] = useState<AreaData | null>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    // Clear existing SVG content
    d3.select(svgRef.current).selectAll('*').remove();

    const containerWidth = containerRef.current.clientWidth || 600;
    const height = 340;
    const margin = { top: 30, right: 20, bottom: 40, left: 20 };
    const width = containerWidth;

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('style', 'max-width: 100%; height: auto;');

    // Color Scale: Deep Indigo -> Amber Gold -> Crimson Peak
    const colorScale = d3
      .scaleSequential()
      .domain([
        metric === 'demandIndex' ? 50 : metric === 'orders' ? 1500 : 500000,
        metric === 'demandIndex' ? 100 : metric === 'orders' ? 5500 : 2000000,
      ])
      .interpolator(d3.interpolateYlOrRd);

    // Grid Layout Logic (4 columns x 3 rows matrix heatmap)
    const cols = 4;
    const padding = 8;
    const availableWidth = width - margin.left - margin.right;
    const cellWidth = (availableWidth - padding * (cols - 1)) / cols;
    const cellHeight = 65;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Draw Heatmap Cells
    const cells = g
      .selectAll('.cell')
      .data(HYDERABAD_AREAS)
      .enter()
      .append('g')
      .attr('class', 'cell')
      .attr('transform', (d, i) => {
        const row = Math.floor(i / cols);
        const col = i % cols;
        const x = col * (cellWidth + padding);
        const y = row * (cellHeight + padding);
        return `translate(${x}, ${y})`;
      })
      .style('cursor', 'pointer');

    // Cell Background Rects
    cells
      .append('rect')
      .attr('width', cellWidth)
      .attr('height', cellHeight)
      .attr('rx', 12)
      .attr('ry', 12)
      .attr('fill', (d) => colorScale(d[metric]))
      .attr('stroke', (d) => (selectedArea?.id === d.id ? '#0F172A' : '#E2E8F0'))
      .attr('stroke-width', (d) => (selectedArea?.id === d.id ? 3 : 1))
      .attr('filter', 'drop-shadow(0px 2px 4px rgba(0,0,0,0.06))')
      .on('mouseenter', (event, d) => {
        setHoveredArea(d);
        d3.select(event.currentTarget)
          .transition()
          .duration(150)
          .attr('transform', 'scale(1.03)')
          .attr('stroke-width', 3)
          .attr('stroke', '#D4AF37');
      })
      .on('mouseleave', (event, d) => {
        setHoveredArea(null);
        d3.select(event.currentTarget)
          .transition()
          .duration(150)
          .attr('transform', 'scale(1)')
          .attr('stroke-width', selectedArea?.id === d.id ? 3 : 1)
          .attr('stroke', selectedArea?.id === d.id ? '#0F172A' : '#E2E8F0');
      })
      .on('click', (event, d) => {
        setSelectedArea(d);
      });

    // Area Name Label
    cells
      .append('text')
      .attr('x', 10)
      .attr('y', 20)
      .attr('fill', '#0F172A')
      .attr('font-size', '11px')
      .attr('font-weight', '800')
      .text((d) => d.name);

    // Zipcode Badge
    cells
      .append('text')
      .attr('x', 10)
      .attr('y', 34)
      .attr('fill', '#475569')
      .attr('font-size', '9px')
      .attr('font-family', 'monospace')
      .text((d) => `Pin ${d.zipcode}`);

    // Main Metric Display
    cells
      .append('text')
      .attr('x', cellWidth - 10)
      .attr('y', 22)
      .attr('text-anchor', 'end')
      .attr('fill', '#0F172A')
      .attr('font-size', '12px')
      .attr('font-weight', '900')
      .text((d) => {
        if (metric === 'demandIndex') return `${d.demandIndex}%`;
        if (metric === 'orders') return `${d.orders.toLocaleString()}`;
        return `₹${(d.revenue / 100000).toFixed(1)}L`;
      });

    // Sub-metric Label (Demand tag or valet count)
    cells
      .append('text')
      .attr('x', cellWidth - 10)
      .attr('y', 36)
      .attr('text-anchor', 'end')
      .attr('fill', '#64748B')
      .attr('font-size', '8.5px')
      .attr('font-weight', '700')
      .text((d) => {
        if (d.demandIndex >= 90) return '🔥 PEAK';
        if (d.demandIndex >= 80) return '⚡ HIGH';
        return '📈 MODERATE';
      });

    // Active Valets indicator bar
    cells
      .append('rect')
      .attr('x', 10)
      .attr('y', 48)
      .attr('width', (d) => Math.min(cellWidth - 20, (d.activeValets / 20) * (cellWidth - 20)))
      .attr('height', 4)
      .attr('rx', 2)
      .attr('fill', '#0F172A')
      .attr('opacity', 0.8);

  }, [metric, selectedArea]);

  const activeDisplayArea = hoveredArea || selectedArea || HYDERABAD_AREAS[0];

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4 font-sans">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="material-symbols-outlined text-[#83633B] text-[18px]">local_fire_department</span>
            <span className="text-[10px] font-extrabold text-[#83633B] uppercase tracking-widest">
              HYDERABAD GEOGRAPHIC TELEMETRY (D3.JS)
            </span>
          </div>
          <h2 className="font-['Libre_Caslon_Text',serif] text-lg font-bold text-slate-900">
            High-Demand Service Area Heat Map
          </h2>
          <p className="text-xs text-slate-500">
            Real-time zone order density, revenue concentration & valet dispatch matrix
          </p>
        </div>

        {/* Metric Selector Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => setMetric('demandIndex')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              metric === 'demandIndex'
                ? 'bg-slate-900 text-amber-300 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Demand %
          </button>
          <button
            onClick={() => setMetric('orders')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              metric === 'orders'
                ? 'bg-slate-900 text-amber-300 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Order Vol
          </button>
          <button
            onClick={() => setMetric('revenue')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              metric === 'revenue'
                ? 'bg-slate-900 text-amber-300 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Revenue ₹
          </button>
        </div>
      </div>

      {/* D3 SVG Heatmap Container */}
      <div ref={containerRef} className="w-full bg-slate-50/80 rounded-2xl p-2 border border-slate-200/80 overflow-hidden">
        <svg ref={svgRef} className="w-full h-auto"></svg>
      </div>

      {/* Legend & Selected Area Telemetry Box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Heat Legend */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
            🎨 Demand Intensity Scale
          </span>
          <div className="h-3 w-full rounded-full bg-gradient-to-r from-amber-100 via-amber-400 to-rose-600 border border-slate-300"></div>
          <div className="flex justify-between text-[9px] font-bold text-slate-600">
            <span>60% Moderate</span>
            <span>85% High</span>
            <span>99% Peak Demand</span>
          </div>
        </div>

        {/* Selected Area Detail Banner */}
        <div className="md:col-span-2 p-3.5 bg-slate-900 text-white rounded-2xl border border-amber-400/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-md">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded uppercase">
                PIN {activeDisplayArea.zipcode}
              </span>
              <h3 className="font-['Libre_Caslon_Text',serif] text-base font-bold text-amber-300">
                {activeDisplayArea.name} ({activeDisplayArea.zone} Zone)
              </h3>
            </div>
            <p className="text-xs text-slate-300 font-medium">
              Top Service: <span className="text-white font-bold">{activeDisplayArea.topService}</span>
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0 text-center border-t sm:border-t-0 sm:border-l border-slate-800 pt-2 sm:pt-0 sm:pl-4 w-full sm:w-auto justify-between sm:justify-start">
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase block">Total Orders</span>
              <span className="text-sm font-black text-amber-300">{activeDisplayArea.orders.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase block">Est. Revenue</span>
              <span className="text-sm font-black text-emerald-400">₹{(activeDisplayArea.revenue / 100000).toFixed(2)}L</span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase block">Active Valets</span>
              <span className="text-sm font-black text-sky-300">{activeDisplayArea.activeValets} Units</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
