import React, { useState } from 'react';
import {
  VendorEntity,
  ProcurementItem,
  PurchaseRequisition,
  PurchaseOrderEntity,
  PurchaseOrderVersionHistory,
  GoodsReceiptNote,
  PurchaseReturnEntity,
  VendorInvoiceMatchRecord,
  VendorPerformanceMetrics,
  ProcurementAuditTrailEntry,
} from '../../types';

export const EnterpriseProcurementDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'requisitions' | 'purchase_orders' | 'goods_receipts' | 'vendors' | 'invoices' | 'performance' | 'audit'
  >('overview');

  // Sample State
  const [requisitions, setRequisitions] = useState<PurchaseRequisition[]>([
    {
      requisitionId: 'req-2026-001',
      orgId: 'org-fabriq-global',
      divisionId: 'laundry',
      franchiseId: 'fr-hyd-01',
      branchId: 'b-hyd-bowenpally',
      requesterId: 'usr-mgr-bowenpally',
      requesterName: 'Ayesha Khan',
      requesterRole: 'store_manager',
      items: [
        {
          procurementItemId: 'pitem-hydrocarbon-solvent',
          sku: 'SKU-SOLVENT-HC-200L',
          itemName: 'Eco Hydrocarbon Dry Cleaning Solvent (200L Drum)',
          quantity: 2,
          unitOfMeasure: 'DRUM',
          estimatedUnitPriceInMinorUnits: 4500000,
          totalPriceInMinorUnits: 9000000,
        },
      ],
      totalQuantity: 2,
      totalEstimatedAmountInMinorUnits: 9000000,
      currency: 'INR',
      requiredByDate: '2026-09-01',
      reason: 'Q3 peak workload solvent buffer replenishment',
      preferredVendorId: 'v-solvents-india',
      status: 'APPROVED',
      approverId: 'usr-corp-admin-01',
      approvedAt: '2026-08-12T10:00:00.000Z',
      createdAt: '2026-08-12T08:00:00.000Z',
      updatedAt: '2026-08-12T10:00:00.000Z',
    },
    {
      requisitionId: 'req-2026-002',
      orgId: 'org-fabriq-global',
      divisionId: 'boutique',
      franchiseId: null,
      branchId: 'b-blr-indiranagar',
      requesterId: 'usr-atelier-lead',
      requesterName: 'Rohan Verma',
      requesterRole: 'store_manager',
      items: [
        {
          procurementItemId: 'pitem-silk-fabric-roll',
          sku: 'SKU-SILK-RAW-50M',
          itemName: 'Italian Raw Silk Fabric Roll (50m)',
          quantity: 1,
          unitOfMeasure: 'ROLL',
          estimatedUnitPriceInMinorUnits: 12500000,
          totalPriceInMinorUnits: 12500000,
        },
      ],
      totalQuantity: 1,
      totalEstimatedAmountInMinorUnits: 12500000,
      currency: 'INR',
      requiredByDate: '2026-09-05',
      reason: 'Bespoke bridal order raw material requirement',
      preferredVendorId: 'v-italian-silk',
      status: 'SUBMITTED',
      createdAt: '2026-08-15T09:00:00.000Z',
      updatedAt: '2026-08-15T09:00:00.000Z',
    },
  ]);

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderEntity[]>([
    {
      purchaseOrderId: 'po-2026-001',
      requisitionId: 'req-2026-001',
      vendorId: 'v-solvents-india',
      orgId: 'org-fabriq-global',
      divisionId: 'laundry',
      franchiseId: 'fr-hyd-01',
      branchId: 'b-hyd-bowenpally',
      version: 1,
      lineItems: [
        {
          lineItemId: 'poli-1',
          procurementItemId: 'pitem-hydrocarbon-solvent',
          sku: 'SKU-SOLVENT-HC-200L',
          itemName: 'Eco Hydrocarbon Dry Cleaning Solvent (200L Drum)',
          quantity: 2,
          receivedQuantity: 0,
          unitPriceInMinorUnits: 4500000,
          discountInMinorUnits: 0,
          taxInMinorUnits: 1620000,
          subtotalInMinorUnits: 9000000,
          totalInMinorUnits: 10620000,
        },
      ],
      totalQuantity: 2,
      totalReceivedQuantity: 0,
      subtotalInMinorUnits: 9000000,
      totalDiscountInMinorUnits: 0,
      totalTaxInMinorUnits: 1620000,
      totalAmountInMinorUnits: 10620000,
      currency: 'INR',
      expectedDeliveryDate: '2026-08-25',
      paymentTerms: 'NET_30',
      status: 'ISSUED',
      createdBy: 'usr-inventory-mgr',
      approvedBy: 'usr-corp-admin-01',
      issuedAt: '2026-08-13T11:00:00.000Z',
      createdAt: '2026-08-13T10:00:00.000Z',
      updatedAt: '2026-08-13T11:00:00.000Z',
    },
  ]);

  const [goodsReceipts, setGoodsReceipts] = useState<GoodsReceiptNote[]>([
    {
      grnId: 'grn-2026-001',
      purchaseOrderId: 'po-2026-001',
      vendorId: 'v-solvents-india',
      orgId: 'org-fabriq-global',
      divisionId: 'laundry',
      franchiseId: 'fr-hyd-01',
      branchId: 'b-hyd-bowenpally',
      receivedItems: [
        {
          lineItemId: 'poli-1',
          procurementItemId: 'pitem-hydrocarbon-solvent',
          sku: 'SKU-SOLVENT-HC-200L',
          itemName: 'Eco Hydrocarbon Dry Cleaning Solvent (200L Drum)',
          orderedQuantity: 2,
          receivedQuantity: 2,
          acceptedQuantity: 2,
          rejectedQuantity: 0,
          damagedQuantity: 0,
          batchLot: 'LOT-20260814-HC',
          inspectionNotes: 'Intact seals, chemical density within spec.',
        },
      ],
      totalReceivedQty: 2,
      totalAcceptedQty: 2,
      totalRejectedQty: 0,
      receivingEmployeeId: 'usr-mgr-bowenpally',
      receivingEmployeeName: 'Ayesha Khan',
      receivingDate: '2026-08-14T14:30:00.000Z',
      inspectionStatus: 'PASSED',
      status: 'QUALITY_CHECK',
      inventoryPosted: false,
      createdAt: '2026-08-14T14:30:00.000Z',
      updatedAt: '2026-08-14T15:00:00.000Z',
    },
  ]);

  const [vendors, setVendors] = useState<VendorEntity[]>([
    {
      vendorId: 'v-solvents-india',
      organizationId: 'org-fabriq-global',
      divisionId: 'laundry',
      vendorName: 'Solvents India Hydrocarbon Corp',
      legalName: 'Solvents India Private Limited',
      vendorType: 'CHEM_SOLVENT',
      registrationTaxId: '36AAACS1234F1Z1',
      primaryContact: {
        contactId: 'vc-1',
        name: 'Rajesh Sharma',
        email: 'rajesh@solventsindia.com',
        phone: '+919876543210',
        role: 'Sales Director',
        isPrimary: true,
      },
      contacts: [],
      email: 'orders@solventsindia.com',
      phone: '+914023456789',
      addresses: [],
      paymentTerms: 'NET_30',
      currency: 'INR',
      status: 'ACTIVE',
      approvalStatus: 'APPROVED',
      riskClassification: 'LOW',
      complianceStatus: 'VERIFIED',
      complianceExpiryDate: '2027-12-31T23:59:59.000Z',
      createdBy: 'usr-corp-admin-01',
      createdAt: '2026-01-10T10:00:00.000Z',
      updatedBy: 'usr-corp-admin-01',
      updatedAt: '2026-08-15T00:00:00.000Z',
    },
    {
      vendorId: 'v-italian-silk',
      organizationId: 'org-fabriq-global',
      divisionId: 'boutique',
      vendorName: 'Milano Silk & Textiles SpA',
      legalName: 'Milano Textiles Italia S.r.l.',
      vendorType: 'LUXURY_FABRIC',
      registrationTaxId: 'IT12345678901',
      primaryContact: {
        contactId: 'vc-2',
        name: 'Marco Rossi',
        email: 'marco.rossi@milanosilk.it',
        phone: '+39021234567',
        role: 'Export Manager',
        isPrimary: true,
      },
      contacts: [],
      email: 'export@milanosilk.it',
      phone: '+39021234567',
      addresses: [],
      paymentTerms: 'NET_60',
      currency: 'INR',
      status: 'ACTIVE',
      approvalStatus: 'APPROVED',
      riskClassification: 'LOW',
      complianceStatus: 'VERIFIED',
      complianceExpiryDate: '2027-06-30T23:59:59.000Z',
      createdBy: 'usr-corp-admin-01',
      createdAt: '2026-02-01T10:00:00.000Z',
      updatedBy: 'usr-corp-admin-01',
      updatedAt: '2026-08-15T00:00:00.000Z',
    },
  ]);

  const [invoices, setInvoices] = useState<VendorInvoiceMatchRecord[]>([
    {
      invoiceMatchId: 'invm-2026-001',
      orgId: 'org-fabriq-global',
      divisionId: 'laundry',
      franchiseId: 'fr-hyd-01',
      branchId: 'b-hyd-bowenpally',
      vendorId: 'v-solvents-india',
      vendorInvoiceRef: 'INV-SOL-9821',
      purchaseOrderId: 'po-2026-001',
      grnId: 'grn-2026-001',
      poAmountInMinorUnits: 10620000,
      grnAmountInMinorUnits: 9000000,
      invoiceAmountInMinorUnits: 10620000,
      poQuantity: 2,
      grnQuantity: 2,
      invoiceQuantity: 2,
      poCurrency: 'INR',
      invoiceCurrency: 'INR',
      quantityMismatch: false,
      priceMismatch: false,
      currencyMismatch: false,
      status: 'MATCHED',
      matchedBy: 'usr-finance-mgr',
      matchedAt: '2026-08-15T11:00:00.000Z',
      createdAt: '2026-08-15T11:00:00.000Z',
    },
  ]);

  // Modals state
  const [showReqModal, setShowReqModal] = useState(false);
  const [showPoModal, setShowPoModal] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);

  // Form states
  const [reqReason, setReqReason] = useState('');
  const [reqQty, setReqQty] = useState(2);
  const [invRefInput, setInvRefInput] = useState('');
  const [invAmountInput, setInvAmountInput] = useState(106200);

  // Metrics
  const openReqsCount = requisitions.filter((r) => r.status === 'SUBMITTED').length;
  const pendingPoApprovals = purchaseOrders.filter((p) => p.status === 'DRAFT' || p.status === 'PENDING_APPROVAL').length;
  const openPoCount = purchaseOrders.filter((p) => p.status === 'ISSUED' || p.status === 'PARTIALLY_RECEIVED').length;
  const totalPoValue = purchaseOrders.reduce((acc, p) => acc + p.totalAmountInMinorUnits, 0);
  const awaitingReceiptCount = goodsReceipts.filter((g) => !g.inventoryPosted).length;
  const mismatchCount = invoices.filter((i) => i.status === 'MISMATCH').length;

  const handlePostInventory = (grnId: string) => {
    setGoodsReceipts((prev) =>
      prev.map((g) => {
        if (g.grnId === grnId) {
          return { ...g, inventoryPosted: true, status: 'POSTED_TO_INVENTORY', inventoryPostedAt: new Date().toISOString() };
        }
        return g;
      })
    );

    // Update PO status
    const grnObj = goodsReceipts.find((g) => g.grnId === grnId);
    if (grnObj) {
      setPurchaseOrders((prev) =>
        prev.map((p) => {
          if (p.purchaseOrderId === grnObj.purchaseOrderId) {
            return { ...p, status: 'FULLY_RECEIVED', totalReceivedQuantity: p.totalQuantity };
          }
          return p;
        })
      );
    }
  };

  const handleCreateRequisition = (e: React.FormEvent) => {
    e.preventDefault();
    const newReq: PurchaseRequisition = {
      requisitionId: `req-${Date.now().toString().substring(8)}`,
      orgId: 'org-fabriq-global',
      divisionId: 'laundry',
      franchiseId: 'fr-hyd-01',
      branchId: 'b-hyd-bowenpally',
      requesterId: 'usr-current',
      requesterName: 'Store Manager',
      requesterRole: 'store_manager',
      items: [
        {
          procurementItemId: 'pitem-hydrocarbon-solvent',
          sku: 'SKU-SOLVENT-HC-200L',
          itemName: 'Eco Hydrocarbon Dry Cleaning Solvent (200L Drum)',
          quantity: reqQty,
          unitOfMeasure: 'DRUM',
          estimatedUnitPriceInMinorUnits: 4500000,
          totalPriceInMinorUnits: reqQty * 4500000,
        },
      ],
      totalQuantity: reqQty,
      totalEstimatedAmountInMinorUnits: reqQty * 4500000,
      currency: 'INR',
      requiredByDate: '2026-09-10',
      reason: reqReason || 'Store solvent replenishment',
      preferredVendorId: 'v-solvents-india',
      status: 'SUBMITTED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setRequisitions([newReq, ...requisitions]);
    setShowReqModal(false);
    setReqReason('');
  };

  const handleApproveRequisition = (reqId: string) => {
    setRequisitions((prev) =>
      prev.map((r) => {
        if (r.requisitionId === reqId) {
          return { ...r, status: 'APPROVED', approvedAt: new Date().toISOString(), approverId: 'usr-corp-admin' };
        }
        return r;
      })
    );
  };

  const handleMatchInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const invAmtMinor = Math.round(invAmountInput * 100);
    const po = purchaseOrders[0];
    const isMismatch = invAmtMinor !== (po ? po.totalAmountInMinorUnits : 10620000);

    const matchRec: VendorInvoiceMatchRecord = {
      invoiceMatchId: `invm-${Date.now().toString().substring(8)}`,
      orgId: 'org-fabriq-global',
      divisionId: 'laundry',
      franchiseId: 'fr-hyd-01',
      branchId: 'b-hyd-bowenpally',
      vendorId: 'v-solvents-india',
      vendorInvoiceRef: invRefInput || `INV-SUP-${Date.now().toString().substring(8)}`,
      purchaseOrderId: po ? po.purchaseOrderId : 'po-2026-001',
      grnId: goodsReceipts[0]?.grnId || 'grn-2026-001',
      poAmountInMinorUnits: po ? po.totalAmountInMinorUnits : 10620000,
      grnAmountInMinorUnits: 9000000,
      invoiceAmountInMinorUnits: invAmtMinor,
      poQuantity: 2,
      grnQuantity: 2,
      invoiceQuantity: 2,
      poCurrency: 'INR',
      invoiceCurrency: 'INR',
      quantityMismatch: false,
      priceMismatch: isMismatch,
      currencyMismatch: false,
      status: isMismatch ? 'MISMATCH' : 'MATCHED',
      mismatchReason: isMismatch ? `Invoice amount ₹${invAmountInput} differs from PO amount ₹106,200` : undefined,
      matchedBy: 'usr-finance-mgr',
      matchedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    setInvoices([matchRec, ...invoices]);
    setShowMatchModal(false);
    setInvRefInput('');
  };

  return (
    <div className="w-full bg-slate-950 text-slate-100 min-h-screen p-4 sm:p-6 space-y-6">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              PHASE 2E
            </span>
            <span className="text-xs text-slate-400 font-medium">Enterprise Supply-Chain Control Foundation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
            Procurement & Vendor Master Hub
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowReqModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-500/10 cursor-pointer flex items-center gap-2 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
            <span>New Requisition</span>
          </button>
          <button
            onClick={() => setShowMatchModal(true)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-slate-700 cursor-pointer flex items-center gap-2 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">receipt_long</span>
            <span>3-Way Invoice Match</span>
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-1">
          <p className="text-xs font-bold text-slate-400">Open Requisitions</p>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-400">{openReqsCount}</span>
            <span className="material-symbols-outlined text-slate-600 text-[20px]">assignment</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-1">
          <p className="text-xs font-bold text-slate-400">Pending PO Approvals</p>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-300">{pendingPoApprovals}</span>
            <span className="material-symbols-outlined text-slate-600 text-[20px]">pending_actions</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-1">
          <p className="text-xs font-bold text-slate-400">Active Issued POs</p>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-cyan-400">{openPoCount}</span>
            <span className="material-symbols-outlined text-slate-600 text-[20px]">local_shipping</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-1">
          <p className="text-xs font-bold text-slate-400">Total PO Value</p>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-emerald-400">
              ₹{(totalPoValue / 100).toLocaleString('en-IN')}
            </span>
            <span className="material-symbols-outlined text-slate-600 text-[20px]">payments</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-1">
          <p className="text-xs font-bold text-slate-400">Awaiting Receipt</p>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-indigo-400">{awaitingReceiptCount}</span>
            <span className="material-symbols-outlined text-slate-600 text-[20px]">inventory_2</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-1">
          <p className="text-xs font-bold text-slate-400">Invoice Mismatches</p>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-rose-400">{mismatchCount}</span>
            <span className="material-symbols-outlined text-slate-600 text-[20px]">warning</span>
          </div>
        </div>
      </div>

      {/* TABS HEADER */}
      <div className="flex items-center gap-2 border-b border-slate-800 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-sm font-bold cursor-pointer transition-all flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'bg-amber-400 text-slate-950 shadow-md font-black'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">dashboard</span>
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('requisitions')}
          className={`px-4 py-2 rounded-xl text-sm font-bold cursor-pointer transition-all flex items-center gap-2 ${
            activeTab === 'requisitions'
              ? 'bg-amber-400 text-slate-950 shadow-md font-black'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">assignment</span>
          <span>Requisitions ({requisitions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('purchase_orders')}
          className={`px-4 py-2 rounded-xl text-sm font-bold cursor-pointer transition-all flex items-center gap-2 ${
            activeTab === 'purchase_orders'
              ? 'bg-amber-400 text-slate-950 shadow-md font-black'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
          <span>Purchase Orders ({purchaseOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('goods_receipts')}
          className={`px-4 py-2 rounded-xl text-sm font-bold cursor-pointer transition-all flex items-center gap-2 ${
            activeTab === 'goods_receipts'
              ? 'bg-amber-400 text-slate-950 shadow-md font-black'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">fact_check</span>
          <span>Goods Receipts / GRN ({goodsReceipts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('vendors')}
          className={`px-4 py-2 rounded-xl text-sm font-bold cursor-pointer transition-all flex items-center gap-2 ${
            activeTab === 'vendors'
              ? 'bg-amber-400 text-slate-950 shadow-md font-black'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">store</span>
          <span>Vendor Master ({vendors.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-4 py-2 rounded-xl text-sm font-bold cursor-pointer transition-all flex items-center gap-2 ${
            activeTab === 'invoices'
              ? 'bg-amber-400 text-slate-950 shadow-md font-black'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">receipt_long</span>
          <span>Invoice Matching ({invoices.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('performance')}
          className={`px-4 py-2 rounded-xl text-sm font-bold cursor-pointer transition-all flex items-center gap-2 ${
            activeTab === 'performance'
              ? 'bg-amber-400 text-slate-950 shadow-md font-black'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">monitoring</span>
          <span>Performance</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl text-sm font-bold cursor-pointer transition-all flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'bg-amber-400 text-slate-950 shadow-md font-black'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">verified_user</span>
          <span>Audit Log</span>
        </button>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="font-bold text-lg text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-400">flowsheet</span>
              Procurement Lifecycle Pipeline
            </h3>
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">1. Purchase Requisitions</p>
                  <p className="font-bold text-sm text-white">{openReqsCount} Pending Approval</p>
                </div>
                <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-400 text-xs font-bold">In Review</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">2. Purchase Orders</p>
                  <p className="font-bold text-sm text-white">{openPoCount} Issued & Active</p>
                </div>
                <span className="px-2 py-1 rounded bg-cyan-500/20 text-cyan-400 text-xs font-bold">Issued</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">3. Goods Receipt & Quality Verification</p>
                  <p className="font-bold text-sm text-white">{goodsReceipts.filter((g) => g.status === 'QUALITY_CHECK').length} Inspected</p>
                </div>
                <span className="px-2 py-1 rounded bg-indigo-500/20 text-indigo-400 text-xs font-bold">Ready to Post</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">4. 3-Way Invoice Reconciliation</p>
                  <p className="font-bold text-sm text-white">{invoices.filter((i) => i.status === 'MATCHED').length} Matched</p>
                </div>
                <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-xs font-bold">Accounts Payable</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="font-bold text-lg text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-cyan-400">store</span>
              Active Preferred Vendors
            </h3>
            <div className="space-y-3">
              {vendors.map((vendor) => (
                <div key={vendor.vendorId} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm text-white">{vendor.vendorName}</p>
                    <p className="text-xs text-slate-400">{vendor.legalName} • {vendor.vendorType}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {vendor.complianceStatus}
                    </span>
                    <p className="text-[11px] text-slate-500 mt-1">Terms: {vendor.paymentTerms}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* REQUISITIONS TAB */}
      {activeTab === 'requisitions' && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-white">Purchase Requisitions</h3>
            <button
              onClick={() => setShowReqModal(true)}
              className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-xs cursor-pointer"
            >
              + Create Requisition
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold">
                  <th className="p-2">Req ID</th>
                  <th className="p-2">Requester</th>
                  <th className="p-2">Line Items</th>
                  <th className="p-2">Total Qty</th>
                  <th className="p-2">Est. Total (INR)</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {requisitions.map((req) => (
                  <tr key={req.requisitionId} className="hover:bg-slate-800/40">
                    <td className="p-2 font-mono text-cyan-400">{req.requisitionId}</td>
                    <td className="p-2">{req.requesterName} ({req.requesterRole})</td>
                    <td className="p-2">{req.items.map((i) => i.itemName).join(', ')}</td>
                    <td className="p-2 font-bold">{req.totalQuantity}</td>
                    <td className="p-2 font-bold text-emerald-400">
                      ₹{(req.totalEstimatedAmountInMinorUnits / 100).toLocaleString('en-IN')}
                    </td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          req.status === 'APPROVED'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : req.status === 'SUBMITTED'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="p-2">
                      {req.status === 'SUBMITTED' && (
                        <button
                          onClick={() => handleApproveRequisition(req.requisitionId)}
                          className="px-2 py-1 bg-emerald-500 text-slate-950 font-bold rounded text-[11px] cursor-pointer hover:bg-emerald-400"
                        >
                          Approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PURCHASE ORDERS TAB */}
      {activeTab === 'purchase_orders' && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="font-bold text-lg text-white">Purchase Orders</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold">
                  <th className="p-2">PO Ref</th>
                  <th className="p-2">Vendor</th>
                  <th className="p-2">Version</th>
                  <th className="p-2">Ordered Qty</th>
                  <th className="p-2">Received Qty</th>
                  <th className="p-2">Total Amount</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {purchaseOrders.map((po) => (
                  <tr key={po.purchaseOrderId} className="hover:bg-slate-800/40">
                    <td className="p-2 font-mono text-cyan-400">{po.purchaseOrderId}</td>
                    <td className="p-2">{po.vendorId}</td>
                    <td className="p-2 font-bold">v{po.version}</td>
                    <td className="p-2">{po.totalQuantity}</td>
                    <td className="p-2 font-bold text-amber-400">{po.totalReceivedQuantity}</td>
                    <td className="p-2 font-bold text-emerald-400">
                      ₹{(po.totalAmountInMinorUnits / 100).toLocaleString('en-IN')}
                    </td>
                    <td className="p-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                        {po.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* GOODS RECEIPTS (GRN) TAB */}
      {activeTab === 'goods_receipts' && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="font-bold text-lg text-white">Goods Receipt Notes (GRN) & Quality Control</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold">
                  <th className="p-2">GRN ID</th>
                  <th className="p-2">PO Ref</th>
                  <th className="p-2">Received Qty</th>
                  <th className="p-2">Accepted Qty</th>
                  <th className="p-2">Inspection Status</th>
                  <th className="p-2">Inventory Status</th>
                  <th className="p-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {goodsReceipts.map((grn) => (
                  <tr key={grn.grnId} className="hover:bg-slate-800/40">
                    <td className="p-2 font-mono text-cyan-400">{grn.grnId}</td>
                    <td className="p-2 font-mono text-slate-300">{grn.purchaseOrderId}</td>
                    <td className="p-2">{grn.totalReceivedQty}</td>
                    <td className="p-2 font-bold text-emerald-400">{grn.totalAcceptedQty}</td>
                    <td className="p-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                        {grn.inspectionStatus}
                      </span>
                    </td>
                    <td className="p-2">
                      {grn.inventoryPosted ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-400">
                          POSTED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400">
                          PENDING POSTING
                        </span>
                      )}
                    </td>
                    <td className="p-2">
                      {!grn.inventoryPosted && (
                        <button
                          onClick={() => handlePostInventory(grn.grnId)}
                          className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded text-[11px] cursor-pointer"
                        >
                          Post to Inventory
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VENDORS TAB */}
      {activeTab === 'vendors' && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="font-bold text-lg text-white">Vendor Master Directory</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold">
                  <th className="p-2">Vendor Name</th>
                  <th className="p-2">Category</th>
                  <th className="p-2">Tax Registration</th>
                  <th className="p-2">Payment Terms</th>
                  <th className="p-2">Risk</th>
                  <th className="p-2">Compliance</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {vendors.map((v) => (
                  <tr key={v.vendorId} className="hover:bg-slate-800/40">
                    <td className="p-2 font-bold text-white">{v.vendorName}</td>
                    <td className="p-2 text-slate-400">{v.vendorType}</td>
                    <td className="p-2 font-mono text-slate-300">{v.registrationTaxId}</td>
                    <td className="p-2">{v.paymentTerms}</td>
                    <td className="p-2 font-bold text-emerald-400">{v.riskClassification}</td>
                    <td className="p-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                        {v.complianceStatus}
                      </span>
                    </td>
                    <td className="p-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-400">
                        {v.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* INVOICE MATCHING TAB */}
      {activeTab === 'invoices' && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-white">3-Way Vendor Invoice Reconciliation</h3>
            <button
              onClick={() => setShowMatchModal(true)}
              className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-xs cursor-pointer"
            >
              + Perform 3-Way Match
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold">
                  <th className="p-2">Invoice Ref</th>
                  <th className="p-2">PO Ref</th>
                  <th className="p-2">GRN Ref</th>
                  <th className="p-2">PO Amount</th>
                  <th className="p-2">Invoice Amount</th>
                  <th className="p-2">Match Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {invoices.map((inv) => (
                  <tr key={inv.invoiceMatchId} className="hover:bg-slate-800/40">
                    <td className="p-2 font-mono text-amber-400">{inv.vendorInvoiceRef}</td>
                    <td className="p-2 font-mono text-cyan-400">{inv.purchaseOrderId}</td>
                    <td className="p-2 font-mono text-slate-300">{inv.grnId}</td>
                    <td className="p-2 font-bold text-slate-200">
                      ₹{(inv.poAmountInMinorUnits / 100).toLocaleString('en-IN')}
                    </td>
                    <td className="p-2 font-bold text-emerald-400">
                      ₹{(inv.invoiceAmountInMinorUnits / 100).toLocaleString('en-IN')}
                    </td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          inv.status === 'MATCHED'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VENDOR PERFORMANCE TAB */}
      {activeTab === 'performance' && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="font-bold text-lg text-white">Vendor Performance Scorecard</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vendors.map((v) => (
              <div key={v.vendorId} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <p className="font-bold text-base text-white">{v.vendorName}</p>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                    Score: 98%
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-slate-400">Fulfillment Rate</p>
                    <p className="font-bold text-emerald-400 text-sm">100%</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Quality Rejection Rate</p>
                    <p className="font-bold text-emerald-400 text-sm">0%</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Invoice Match Rate</p>
                    <p className="font-bold text-emerald-400 text-sm">100%</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Avg Lead Time</p>
                    <p className="font-bold text-cyan-400 text-sm">4 Days</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AUDIT LOG TAB */}
      {activeTab === 'audit' && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="font-bold text-lg text-white">Procurement Audit Logs</h3>
          <div className="p-4 bg-slate-950 rounded-xl font-mono text-xs text-slate-300 space-y-2 max-h-80 overflow-y-auto">
            <p className="text-cyan-400">[PAUDIT-101] CREATE_REQUISITION on PurchaseRequisition (req-2026-001) by usr-mgr-bowenpally [store_manager]</p>
            <p className="text-cyan-400">[PAUDIT-102] APPROVE_REQUISITION on PurchaseRequisition (req-2026-001) by usr-corp-admin-01 [super_admin]</p>
            <p className="text-cyan-400">[PAUDIT-103] CREATE_PURCHASE_ORDER on PurchaseOrder (po-2026-001) by usr-inventory-mgr [inventory]</p>
            <p className="text-cyan-400">[PAUDIT-104] APPROVE_PURCHASE_ORDER on PurchaseOrder (po-2026-001) by usr-corp-admin-01 [super_admin]</p>
            <p className="text-cyan-400">[PAUDIT-105] CREATE_GOODS_RECEIPT on GoodsReceipt (grn-2026-001) by usr-mgr-bowenpally [store_manager]</p>
            <p className="text-cyan-400">[PAUDIT-106] PERFORM_INVOICE_MATCH on VendorInvoiceMatch (invm-2026-001) by usr-finance-mgr [finance]</p>
          </div>
        </div>
      )}

      {/* REQUISITION MODAL */}
      {showReqModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold text-white">New Purchase Requisition</h3>
            <form onSubmit={handleCreateRequisition} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Item SKU / Material</label>
                <input
                  type="text"
                  disabled
                  value="SKU-SOLVENT-HC-200L (Eco Hydrocarbon Solvent 200L)"
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Quantity Required</label>
                <input
                  type="number"
                  min="1"
                  value={reqQty}
                  onChange={(e) => setReqQty(parseInt(e.target.value) || 1)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Business Reason</label>
                <textarea
                  rows={3}
                  value={reqReason}
                  onChange={(e) => setReqReason(e.target.value)}
                  placeholder="Explain why this requisition is needed..."
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReqModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-lg cursor-pointer"
                >
                  Submit Requisition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INVOICE MATCH MODAL */}
      {showMatchModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold text-white">3-Way Invoice Matching</h3>
            <form onSubmit={handleMatchInvoice} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Vendor Invoice Ref Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. INV-SOL-9822"
                  value={invRefInput}
                  onChange={(e) => setInvRefInput(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Invoice Total (₹)</label>
                <input
                  type="number"
                  required
                  value={invAmountInput}
                  onChange={(e) => setInvAmountInput(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-bold"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMatchModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-lg cursor-pointer"
                >
                  Perform Match
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
