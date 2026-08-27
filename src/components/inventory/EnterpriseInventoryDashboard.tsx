import React, { useState } from 'react';
import {
  AppDivision,
  EnrichedInventoryStock,
  StockMovementLedger,
  StockMovementType,
  SupplierEntity,
} from '../../types';

const INITIAL_STOCK: EnrichedInventoryStock[] = [
  // FabriQ AI (Laundry) Central Warehouse
  {
    stockId: 'stk-wh-hyd-item-lnd-01',
    itemId: 'item-lnd-01',
    itemName: 'GreenEarth® Hydrocarbon Solvent',
    sku: 'LND-SOLV-GRE-01',
    unitOfMeasure: 'Liters',
    unitCost: 850,
    category: 'laundry_chemical',
    orgId: 'org-fabriq-global',
    divisionId: 'laundry',
    franchiseId: null,
    branchId: null,
    warehouseId: 'wh-central-hyd',
    locationType: 'warehouse',
    locationName: 'FabriQ Central Solvents Depot (HYD)',
    currentQuantity: 450,
    reservedQuantity: 20,
    availableQuantity: 430,
    minStockLevel: 100,
    reorderLevel: 150,
    targetStockLevel: 600,
    reorderQuantity: 300,
    preferredSupplierId: 'sup-greenearth',
    lastRestockedAt: '2026-08-10T00:00:00.000Z',
    updatedAt: '2026-08-15T00:00:00.000Z',
    isLowStock: false,
    isCritical: false,
  },
  // FabriQ AI Branch Stock (Bowenpally - Franchise Owned)
  {
    stockId: 'stk-b-bowenpally-item-lnd-01',
    itemId: 'item-lnd-01',
    itemName: 'GreenEarth® Hydrocarbon Solvent',
    sku: 'LND-SOLV-GRE-01',
    unitOfMeasure: 'Liters',
    unitCost: 850,
    category: 'laundry_chemical',
    orgId: 'org-fabriq-global',
    divisionId: 'laundry',
    franchiseId: 'fr-hyd-01',
    branchId: 'b-hyd-bowenpally',
    warehouseId: null,
    locationType: 'branch',
    locationName: 'Bowenpally Care Atelier',
    currentQuantity: 12,
    reservedQuantity: 2,
    availableQuantity: 10,
    minStockLevel: 15,
    reorderLevel: 25,
    targetStockLevel: 50,
    reorderQuantity: 30,
    preferredSupplierId: 'sup-greenearth',
    lastRestockedAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-15T00:00:00.000Z',
    isLowStock: true,
    isCritical: true,
  },
  {
    stockId: 'stk-b-bowenpally-item-lnd-02',
    itemId: 'item-lnd-02',
    itemName: 'FabriQ Gold Monogram Velvet Hangers',
    sku: 'LND-PKG-HNG-500',
    unitOfMeasure: 'Pieces',
    unitCost: 120,
    category: 'packaging_supplies',
    orgId: 'org-fabriq-global',
    divisionId: 'laundry',
    franchiseId: 'fr-hyd-01',
    branchId: 'b-hyd-bowenpally',
    warehouseId: null,
    locationType: 'branch',
    locationName: 'Bowenpally Care Atelier',
    currentQuantity: 320,
    reservedQuantity: 10,
    availableQuantity: 310,
    minStockLevel: 100,
    reorderLevel: 150,
    targetStockLevel: 500,
    reorderQuantity: 200,
    preferredSupplierId: 'sup-fabriq-mfg',
    lastRestockedAt: '2026-08-12T00:00:00.000Z',
    updatedAt: '2026-08-15T00:00:00.000Z',
    isLowStock: false,
    isCritical: false,
  },

  // FabriQ Boutique Stock
  {
    stockId: 'stk-wh-btq-item-btq-01',
    itemId: 'item-btq-01',
    itemName: 'Italian Pure Mulberry Silk (Cream White)',
    sku: 'BTQ-FAB-SILK-ITA',
    unitOfMeasure: 'Meters',
    unitCost: 3200,
    category: 'boutique_fabric',
    orgId: 'org-fabriq-global',
    divisionId: 'boutique',
    franchiseId: null,
    branchId: null,
    warehouseId: 'wh-boutique-hub',
    locationType: 'warehouse',
    locationName: 'FabriQ Atelier Fabric Central Depot (SEC)',
    currentQuantity: 120,
    reservedQuantity: 15,
    availableQuantity: 105,
    minStockLevel: 30,
    reorderLevel: 50,
    targetStockLevel: 200,
    reorderQuantity: 100,
    preferredSupplierId: 'sup-taroni-italy',
    lastRestockedAt: '2026-08-05T00:00:00.000Z',
    updatedAt: '2026-08-15T00:00:00.000Z',
    isLowStock: false,
    isCritical: false,
  },

  // FabriQ Luxury Store Stock (Corporate Flagship Mayfair)
  {
    stockId: 'stk-b-mayfair-item-lux-02',
    itemId: 'item-lux-02',
    itemName: 'Couture Cashmere Double-Breasted Trench Coat',
    sku: 'LUX-COAT-CASH-NVY',
    unitOfMeasure: 'Pieces',
    unitCost: 35000,
    category: 'luxury_garment',
    orgId: 'org-fabriq-global',
    divisionId: 'luxury_store',
    franchiseId: null, // Corporate owned branch
    branchId: 'b-lon-mayfair',
    warehouseId: null,
    locationType: 'branch',
    locationName: 'Mayfair Flagship Atelier (London)',
    currentQuantity: 8,
    reservedQuantity: 2,
    availableQuantity: 6,
    minStockLevel: 3,
    reorderLevel: 5,
    targetStockLevel: 15,
    reorderQuantity: 10,
    preferredSupplierId: 'sup-fabriq-maison',
    lastRestockedAt: '2026-08-14T00:00:00.000Z',
    updatedAt: '2026-08-15T00:00:00.000Z',
    isLowStock: false,
    isCritical: false,
  },
];

const INITIAL_MOVEMENTS: StockMovementLedger[] = [
  {
    movementId: 'mvt-1001',
    orgId: 'org-fabriq-global',
    divisionId: 'laundry',
    franchiseId: null,
    branchId: null,
    warehouseId: 'wh-central-hyd',
    itemId: 'item-lnd-01',
    itemName: 'GreenEarth® Hydrocarbon Solvent',
    movementType: 'OPENING_BALANCE',
    quantity: 500,
    previousQuantity: 0,
    resultingQuantity: 500,
    unitCost: 850,
    reason: 'Initial central warehouse stock audit',
    userId: 'usr-admin-01',
    timestamp: '2026-08-01T08:00:00.000Z',
  },
  {
    movementId: 'mvt-1002',
    orgId: 'org-fabriq-global',
    divisionId: 'laundry',
    franchiseId: 'fr-hyd-01',
    branchId: 'b-hyd-bowenpally',
    warehouseId: null,
    itemId: 'item-lnd-01',
    itemName: 'GreenEarth® Hydrocarbon Solvent',
    movementType: 'TRANSFER_IN',
    quantity: 30,
    previousQuantity: 0,
    resultingQuantity: 30,
    unitCost: 850,
    sourceLocationId: 'wh-central-hyd',
    destinationLocationId: 'b-hyd-bowenpally',
    reason: 'Inter-facility inventory transfer from central depot',
    referenceDocId: 'trf-2026-0801',
    userId: 'usr-admin-01',
    timestamp: '2026-08-01T10:30:00.000Z',
  },
  {
    movementId: 'mvt-1003',
    orgId: 'org-fabriq-global',
    divisionId: 'laundry',
    franchiseId: 'fr-hyd-01',
    branchId: 'b-hyd-bowenpally',
    warehouseId: null,
    itemId: 'item-lnd-01',
    itemName: 'GreenEarth® Hydrocarbon Solvent',
    movementType: 'CONSUMPTION',
    quantity: -18,
    previousQuantity: 30,
    resultingQuantity: 12,
    unitCost: 850,
    reason: 'Batch cleaning run for couture silk order #ORD-9821',
    referenceDocId: 'ORD-9821',
    userId: 'usr-tech-04',
    timestamp: '2026-08-14T16:00:00.000Z',
  },
];

const INITIAL_SUPPLIERS: SupplierEntity[] = [
  {
    supplierId: 'sup-greenearth',
    orgId: 'org-fabriq-global',
    name: 'GreenEarth® Cleaning Systems International',
    contactPerson: 'Marcus Vance',
    email: 'orders@greenearthcleaning.com',
    phone: '+1 800 555 4733',
    city: 'Kansas City, USA',
    categories: ['laundry_chemical'],
    leadTimeDays: 7,
    rating: 4.9,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2026-08-15T00:00:00.000Z',
  },
  {
    supplierId: 'sup-taroni-italy',
    orgId: 'org-fabriq-global',
    name: 'Taroni S.p.A. Silk Weavers',
    contactPerson: 'Elena Rossi',
    email: 'export@taroni.it',
    phone: '+39 031 223344',
    city: 'Como, Italy',
    categories: ['boutique_fabric'],
    leadTimeDays: 14,
    rating: 5.0,
    createdAt: '2025-02-01T00:00:00.000Z',
    updatedAt: '2026-08-15T00:00:00.000Z',
  },
  {
    supplierId: 'sup-fabriq-maison',
    orgId: 'org-fabriq-global',
    name: 'FabriQ Maison Craftsmanship Studio',
    contactPerson: 'Pierre Dupont',
    email: 'atelier@fabriq-maison.com',
    phone: '+33 1 42 68 00 00',
    city: 'Paris, France',
    categories: ['luxury_accessory', 'luxury_garment'],
    leadTimeDays: 10,
    rating: 4.95,
    createdAt: '2025-03-01T00:00:00.000Z',
    updatedAt: '2026-08-15T00:00:00.000Z',
  },
];

export const EnterpriseInventoryDashboard: React.FC = () => {
  const [selectedDivision, setSelectedDivision] = useState<AppDivision | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'stock' | 'ledger' | 'alerts' | 'transfer' | 'suppliers'>('stock');
  const [stockList, setStockList] = useState<EnrichedInventoryStock[]>(INITIAL_STOCK);
  const [movements, setMovements] = useState<StockMovementLedger[]>(INITIAL_MOVEMENTS);
  const [suppliers] = useState<SupplierEntity[]>(INITIAL_SUPPLIERS);

  // Transfer Form State
  const [transferItemId, setTransferItemId] = useState('item-lnd-01');
  const [transferQty, setTransferQty] = useState<number>(10);
  const [transferReason, setTransferReason] = useState('Routine store replenishment request');
  const [transferMessage, setTransferMessage] = useState<string | null>(null);

  // Adjustment Form State
  const [adjustingStockId, setAdjustingStockId] = useState<string | null>(null);
  const [adjustQty, setAdjustQty] = useState<number>(5);
  const [adjustType, setAdjustType] = useState<StockMovementType>('RECEIPT');
  const [adjustReason, setAdjustReason] = useState('Restock shipment from supplier');

  // Filter Stock by Division
  const filteredStock = stockList.filter((s) =>
    selectedDivision === 'all' ? true : s.divisionId === selectedDivision
  );

  // Filter Movements by Division
  const filteredMovements = movements.filter((m) =>
    selectedDivision === 'all' ? true : m.divisionId === selectedDivision
  );

  // Low stock alerts count
  const lowStockAlerts = stockList.filter((s) => s.currentQuantity <= s.reorderLevel);

  // Handle Transfer Submit
  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const sourceStock = stockList.find((s) => s.stockId === 'stk-wh-hyd-item-lnd-01');
    const destStock = stockList.find((s) => s.stockId === 'stk-b-bowenpally-item-lnd-01');

    if (!sourceStock || !destStock) return;

    if (sourceStock.availableQuantity < transferQty) {
      setTransferMessage(`⚠️ Insufficient available stock at Central Depot! (Available: ${sourceStock.availableQuantity})`);
      return;
    }

    const now = new Date().toISOString();
    const docId = `trf-${Date.now()}`;

    // Update state
    setStockList((prev) =>
      prev.map((s) => {
        if (s.stockId === sourceStock.stockId) {
          const newCurrent = s.currentQuantity - transferQty;
          return {
            ...s,
            currentQuantity: newCurrent,
            availableQuantity: Math.max(0, newCurrent - s.reservedQuantity),
            updatedAt: now,
          };
        }
        if (s.stockId === destStock.stockId) {
          const newCurrent = s.currentQuantity + transferQty;
          return {
            ...s,
            currentQuantity: newCurrent,
            availableQuantity: Math.max(0, newCurrent - s.reservedQuantity),
            isLowStock: newCurrent <= s.reorderLevel,
            isCritical: newCurrent <= s.minStockLevel,
            lastRestockedAt: now,
            updatedAt: now,
          };
        }
        return s;
      })
    );

    // Ledger entries
    const newOut: StockMovementLedger = {
      movementId: `mvt-out-${Date.now()}`,
      orgId: 'org-fabriq-global',
      divisionId: sourceStock.divisionId,
      franchiseId: null,
      branchId: null,
      warehouseId: sourceStock.warehouseId,
      itemId: sourceStock.itemId,
      itemName: sourceStock.itemName,
      movementType: 'TRANSFER_OUT',
      quantity: -transferQty,
      previousQuantity: sourceStock.currentQuantity,
      resultingQuantity: sourceStock.currentQuantity - transferQty,
      unitCost: sourceStock.unitCost,
      sourceLocationId: 'wh-central-hyd',
      destinationLocationId: 'b-hyd-bowenpally',
      reason: transferReason,
      referenceDocId: docId,
      userId: 'usr-admin-01',
      timestamp: now,
    };

    const newIn: StockMovementLedger = {
      movementId: `mvt-in-${Date.now()}`,
      orgId: 'org-fabriq-global',
      divisionId: destStock.divisionId,
      franchiseId: destStock.franchiseId,
      branchId: destStock.branchId,
      warehouseId: null,
      itemId: destStock.itemId,
      itemName: destStock.itemName,
      movementType: 'TRANSFER_IN',
      quantity: transferQty,
      previousQuantity: destStock.currentQuantity,
      resultingQuantity: destStock.currentQuantity + transferQty,
      unitCost: destStock.unitCost,
      sourceLocationId: 'wh-central-hyd',
      destinationLocationId: 'b-hyd-bowenpally',
      reason: transferReason,
      referenceDocId: docId,
      userId: 'usr-admin-01',
      timestamp: now,
    };

    setMovements((prev) => [newOut, newIn, ...prev]);
    setTransferMessage(`✅ Successfully transferred ${transferQty} units from Central Depot to Bowenpally Care Atelier! Ref: ${docId}`);
  };

  // Handle Adjustment Submit
  const handleExecuteAdjustment = (stockId: string) => {
    const target = stockList.find((s) => s.stockId === stockId);
    if (!target) return;

    const isDeduction = ['CONSUMPTION', 'DAMAGE', 'SALE'].includes(adjustType);
    const delta = isDeduction ? -Math.abs(adjustQty) : Math.abs(adjustQty);

    if (target.currentQuantity + delta < 0) {
      alert(`Invalid Operation: Resulting stock cannot be negative! (Current: ${target.currentQuantity})`);
      return;
    }

    const now = new Date().toISOString();
    const newQty = target.currentQuantity + delta;

    setStockList((prev) =>
      prev.map((s) => {
        if (s.stockId === stockId) {
          return {
            ...s,
            currentQuantity: newQty,
            availableQuantity: Math.max(0, newQty - s.reservedQuantity),
            isLowStock: newQty <= s.reorderLevel,
            isCritical: newQty <= s.minStockLevel,
            updatedAt: now,
          };
        }
        return s;
      })
    );

    const mvt: StockMovementLedger = {
      movementId: `mvt-${Date.now()}`,
      orgId: target.orgId,
      divisionId: target.divisionId,
      franchiseId: target.franchiseId,
      branchId: target.branchId,
      warehouseId: target.warehouseId,
      itemId: target.itemId,
      itemName: target.itemName,
      movementType: adjustType,
      quantity: delta,
      previousQuantity: target.currentQuantity,
      resultingQuantity: newQty,
      unitCost: target.unitCost,
      reason: adjustReason,
      userId: 'usr-manager-01',
      timestamp: now,
    };

    setMovements((prev) => [mvt, ...prev]);
    setAdjustingStockId(null);
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6 font-sans">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <span className="text-[10px] font-extrabold text-amber-700 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            PHASE 2B ENTERPRISE INVENTORY FOUNDATION
          </span>
          <h2 className="font-['Libre_Caslon_Text',serif] text-2xl font-bold text-slate-900 mt-1">
            Enterprise Shared Inventory Engine
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Auditable Multi-Tenant & Multi-Division Inventory Ledger (FabriQ AI • FabriQ Boutique • FabriQ Luxury Store)
          </p>
        </div>

        {/* Division Selector Filter */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setSelectedDivision('all')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              selectedDivision === 'all' ? 'bg-slate-900 text-amber-300 font-black shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Divisions
          </button>
          <button
            onClick={() => setSelectedDivision('laundry')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              selectedDivision === 'laundry' ? 'bg-slate-900 text-amber-300 font-black shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            FabriQ AI (Laundry)
          </button>
          <button
            onClick={() => setSelectedDivision('boutique')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              selectedDivision === 'boutique' ? 'bg-slate-900 text-amber-300 font-black shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            FabriQ Boutique
          </button>
          <button
            onClick={() => setSelectedDivision('luxury_store')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              selectedDivision === 'luxury_store' ? 'bg-slate-900 text-amber-300 font-black shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            FabriQ Luxury Store
          </button>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('stock')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'stock'
              ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">inventory_2</span>
          <span>Stock Balances & Locations ({filteredStock.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'ledger'
              ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">history_edu</span>
          <span>Auditable Movement Ledger ({filteredMovements.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'alerts'
              ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">notifications_active</span>
          <span>Reorder Alerts & Triggers</span>
          {lowStockAlerts.length > 0 && (
            <span className="bg-rose-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full font-mono">
              {lowStockAlerts.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('transfer')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'transfer'
              ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
          <span>Controlled Stock Transfers</span>
        </button>

        <button
          onClick={() => setActiveTab('suppliers')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'suppliers'
              ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">local_shipping</span>
          <span>Suppliers & Master Catalog ({suppliers.length})</span>
        </button>
      </div>

      {/* TAB 1: STOCK BALANCES */}
      {activeTab === 'stock' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStock.map((stk) => (
              <div
                key={stk.stockId}
                className={`rounded-2xl p-4 border transition-all ${
                  stk.isCritical
                    ? 'bg-rose-50/60 border-rose-300'
                    : stk.isLowStock
                    ? 'bg-amber-50/60 border-amber-300'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex justify-between items-start gap-2 border-b border-slate-200/80 pb-2.5">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 font-bold block">{stk.sku}</span>
                    <h4 className="font-bold text-slate-900 text-sm mt-0.5">{stk.itemName}</h4>
                  </div>
                  <span
                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${
                      stk.divisionId === 'laundry'
                        ? 'bg-blue-100 text-blue-900 border-blue-300'
                        : stk.divisionId === 'boutique'
                        ? 'bg-purple-100 text-purple-900 border-purple-300'
                        : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    }`}
                  >
                    {stk.divisionId}
                  </span>
                </div>

                <div className="space-y-2 text-xs py-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Location:</span>
                    <span className="font-bold text-slate-800 text-right">{stk.locationName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Stock Ownership:</span>
                    <span className="font-mono text-[11px] font-bold text-amber-800">
                      {stk.locationType === 'warehouse'
                        ? 'Corporate Warehouse'
                        : stk.franchiseId
                        ? `Franchise (${stk.franchiseId})`
                        : 'Corporate Branch'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                    <span className="text-slate-600 font-bold">Current Stock:</span>
                    <span className="font-mono text-base font-black text-slate-900">
                      {stk.currentQuantity} <span className="text-xs font-normal text-slate-500">{stk.unitOfMeasure}</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-500">Available / Reserved:</span>
                    <span className="font-mono font-bold text-slate-700">
                      {stk.availableQuantity} / {stk.reservedQuantity}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-500">Min / Reorder Threshold:</span>
                    <span className="font-mono font-bold text-slate-700">
                      {stk.minStockLevel} / {stk.reorderLevel}
                    </span>
                  </div>
                </div>

                {/* Status Badge & Adjust Button */}
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                  {stk.isCritical ? (
                    <span className="bg-rose-600 text-white font-black text-[10px] px-2.5 py-1 rounded-md uppercase tracking-wider">
                      CRITICAL STOCK OUT
                    </span>
                  ) : stk.isLowStock ? (
                    <span className="bg-amber-600 text-white font-black text-[10px] px-2.5 py-1 rounded-md uppercase tracking-wider">
                      REORDER THRESHOLD
                    </span>
                  ) : (
                    <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[10px] px-2.5 py-0.5 rounded-md uppercase">
                      OPTIMAL STOCK
                    </span>
                  )}

                  <button
                    onClick={() => setAdjustingStockId(stk.stockId === adjustingStockId ? null : stk.stockId)}
                    className="text-[11px] font-bold text-slate-800 hover:text-amber-600 underline cursor-pointer"
                  >
                    Adjust Stock
                  </button>
                </div>

                {/* Inline Stock Adjustment Modal */}
                {adjustingStockId === stk.stockId && (
                  <div className="mt-3 p-3 bg-slate-900 text-white rounded-xl space-y-2 text-xs border border-amber-400/40">
                    <h5 className="font-bold text-amber-300">Auditable Stock Movement Entry</h5>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400 block">Movement Type</label>
                        <select
                          value={adjustType}
                          onChange={(e) => setAdjustType(e.target.value as StockMovementType)}
                          className="w-full bg-slate-800 border border-slate-700 text-white rounded p-1 text-xs"
                        >
                          <option value="RECEIPT">RECEIPT (+)</option>
                          <option value="CONSUMPTION">CONSUMPTION (-)</option>
                          <option value="DAMAGE">DAMAGE (-)</option>
                          <option value="RETURN">RETURN (+)</option>
                          <option value="ADJUSTMENT">ADJUSTMENT (+/-)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block">Quantity</label>
                        <input
                          type="number"
                          value={adjustQty}
                          onChange={(e) => setAdjustQty(Number(e.target.value))}
                          className="w-full bg-slate-800 border border-slate-700 text-white rounded p-1 text-xs font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block">Audit Reason</label>
                      <input
                        type="text"
                        value={adjustReason}
                        onChange={(e) => setAdjustReason(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded p-1 text-xs"
                      />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleExecuteAdjustment(stk.stockId)}
                        className="bg-amber-400 text-slate-950 font-black px-3 py-1 rounded text-xs cursor-pointer hover:bg-amber-300"
                      >
                        Commit Movement
                      </button>
                      <button
                        onClick={() => setAdjustingStockId(null)}
                        className="bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: AUDITABLE STOCK MOVEMENT LEDGER */}
      {activeTab === 'ledger' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-600">
              Immutable Stock Movement Ledger Entries
            </h4>
            <span className="text-xs text-slate-500">
              Showing <strong>{filteredMovements.length} Movements</strong>
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left border-collapse text-xs font-sans">
              <thead>
                <tr className="bg-slate-900 text-white border-b border-slate-800">
                  <th className="p-3 font-bold">Movement ID</th>
                  <th className="p-3 font-bold">Type</th>
                  <th className="p-3 font-bold">Item Name</th>
                  <th className="p-3 font-bold text-center">Qty Shift</th>
                  <th className="p-3 font-bold text-center">Prev $\rightarrow$ Result</th>
                  <th className="p-3 font-bold">Audit Reason / Doc</th>
                  <th className="p-3 font-bold">User</th>
                  <th className="p-3 font-bold">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMovements.map((m) => (
                  <tr key={m.movementId} className="hover:bg-slate-50">
                    <td className="p-3 font-mono text-[11px] font-bold text-amber-700">{m.movementId}</td>
                    <td className="p-3">
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                          m.movementType.includes('RECEIPT') || m.movementType.includes('IN') || m.movementType.includes('RETURN')
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : m.movementType.includes('CONSUMPTION') || m.movementType.includes('DAMAGE') || m.movementType.includes('OUT')
                            ? 'bg-rose-100 text-rose-900 border border-rose-300'
                            : 'bg-amber-100 text-amber-900 border border-amber-300'
                        }`}
                      >
                        {m.movementType}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-slate-900">{m.itemName}</td>
                    <td
                      className={`p-3 text-center font-mono font-black text-sm ${
                        m.quantity > 0 ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                    </td>
                    <td className="p-3 text-center font-mono text-slate-600">
                      {m.previousQuantity} $\rightarrow$ <strong>{m.resultingQuantity}</strong>
                    </td>
                    <td className="p-3 text-slate-700">
                      <p className="font-medium">{m.reason}</p>
                      {m.referenceDocId && (
                        <span className="text-[10px] font-mono text-slate-400">Ref: {m.referenceDocId}</span>
                      )}
                    </td>
                    <td className="p-3 font-mono text-slate-500 text-[11px]">{m.userId}</td>
                    <td className="p-3 font-mono text-slate-400 text-[10px]">
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: REORDER ALERTS */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-600">
            Automated Reorder Trigger Architecture
          </h4>

          {lowStockAlerts.length === 0 ? (
            <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-200 text-center text-emerald-800 text-xs">
              🎉 All inventory items across facilities are currently optimal! No reorder thresholds breached.
            </div>
          ) : (
            <div className="space-y-3">
              {lowStockAlerts.map((alert) => (
                <div key={alert.stockId} className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <span className="bg-rose-600 text-white font-extrabold text-[9px] px-2 py-0.5 rounded uppercase">
                      REORDER THRESHOLD BREACHED
                    </span>
                    <h5 className="font-bold text-slate-900 text-sm mt-1">{alert.itemName} ({alert.sku})</h5>
                    <p className="text-xs text-slate-600">
                      Location: <strong>{alert.locationName}</strong> • Current Stock: <span className="font-mono font-bold text-rose-700">{alert.currentQuantity}</span> (Reorder Level: {alert.reorderLevel})
                    </p>
                  </div>
                  <div className="text-right text-xs">
                    <p className="text-slate-500">Suggested Order Qty:</p>
                    <span className="font-mono text-lg font-black text-slate-900 block">{alert.reorderQuantity} Units</span>
                    <span className="text-[10px] text-amber-800 font-bold block">Preferred Supplier: {alert.preferredSupplierId || 'GreenEarth®'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: CONTROLLED STOCK TRANSFERS */}
      {activeTab === 'transfer' && (
        <div className="bg-slate-900 text-white rounded-2xl p-6 border border-amber-400/40 space-y-4">
          <div>
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
              INTER-FACILITY CONTROLLED STOCK TRANSFER ENGINE
            </span>
            <h4 className="font-['Libre_Caslon_Text',serif] text-lg font-bold text-white mt-1">
              Warehouse $\rightarrow$ Branch & Branch $\rightarrow$ Branch Transfers
            </h4>
          </div>

          <form onSubmit={handleExecuteTransfer} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-[11px] text-slate-300 block mb-1">Source Inventory Item</label>
              <select
                value={transferItemId}
                onChange={(e) => setTransferItemId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white p-2.5 rounded-xl text-xs font-bold"
              >
                <option value="item-lnd-01">GreenEarth® Hydrocarbon Solvent (LND-SOLV-GRE-01)</option>
                <option value="item-lnd-02">FabriQ Gold Monogram Velvet Hangers (LND-PKG-HNG-500)</option>
                <option value="item-btq-01">Italian Pure Mulberry Silk (BTQ-FAB-SILK-ITA)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-300 block mb-1">Transfer Quantity</label>
              <input
                type="number"
                value={transferQty}
                onChange={(e) => setTransferQty(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 text-white p-2.5 rounded-xl text-xs font-mono font-bold"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-[11px] text-slate-300 block mb-1">Transfer Authorization & Reason</label>
              <input
                type="text"
                value={transferReason}
                onChange={(e) => setTransferReason(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white p-2.5 rounded-xl text-xs"
              />
            </div>

            <div className="md:col-span-2 flex justify-between items-center pt-2">
              <span className="text-[11px] text-slate-400 italic">
                ℹ️ Transfers enforce same-org validation and generate dual TRANSFER_OUT & TRANSFER_IN ledger entries.
              </span>
              <button
                type="submit"
                className="bg-amber-400 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs hover:bg-amber-300 transition-all cursor-pointer shadow-md"
              >
                Execute Inter-Facility Transfer
              </button>
            </div>
          </form>

          {transferMessage && (
            <div className="p-3 bg-slate-800 border border-amber-400/50 rounded-xl text-xs font-mono font-bold text-amber-300 mt-2">
              {transferMessage}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: SUPPLIERS & CATALOG */}
      {activeTab === 'suppliers' && (
        <div className="space-y-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-600">
            Master Supplier Foundation Records
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {suppliers.map((sup) => (
              <div key={sup.supplierId} className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
                <span className="text-[10px] font-mono text-amber-700 font-bold">{sup.supplierId}</span>
                <h5 className="font-bold text-slate-900 text-sm">{sup.name}</h5>
                <p className="text-xs text-slate-600">Contact: <strong>{sup.contactPerson}</strong></p>
                <p className="text-xs text-slate-500">{sup.email} • {sup.phone}</p>
                <div className="flex justify-between items-center text-[11px] border-t border-slate-200 pt-2 mt-2">
                  <span className="text-slate-500">Lead Time: <strong>{sup.leadTimeDays} Days</strong></span>
                  <span className="font-bold text-amber-600">⭐ {sup.rating} / 5.0</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
