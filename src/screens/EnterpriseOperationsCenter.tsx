import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDivision } from '../context/DivisionContext';
import { useBranch } from '../context/BranchContext';
import {
  ScreenId,
  AppDivision,
  OperationsCommandCenterSummary,
  OrderSLAMetrics,
  WorkflowException,
  BranchCapacityMetrics,
  ExceptionSeverity,
  ExceptionStatus,
} from '../types';
import { EnterprisePortalHeader } from '../components/EnterprisePortalHeader';
import { EnterpriseConfiguration } from '../components/EnterpriseConfiguration';

interface OperationsCenterProps {
  onNavigate: (screen: ScreenId) => void;
}

export const EnterpriseOperationsCenter: React.FC<OperationsCenterProps> = ({ onNavigate }) => {
  const { currentRole, user } = useAuth();
  const { division } = useDivision();
  const { activeBranch } = useBranch();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'sla_matrix' | 'exceptions' | 'quality_rework' | 'capacity' | 'enterprise_config'
  >('overview');
  const [selectedDivision, setSelectedDivision] = useState<string>('all');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [summary, setSummary] = useState<OperationsCommandCenterSummary | null>(null);
  const [slaList, setSlaList] = useState<OrderSLAMetrics[]>([]);
  const [exceptions, setExceptions] = useState<WorkflowException[]>([]);
  const [capacityList, setCapacityList] = useState<BranchCapacityMetrics[]>([]);
  const [qualityData, setQualityData] = useState<any>(null);
  const [notificationMsg, setNotificationMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modals state
  const [isRaiseModalOpen, setIsRaiseModalOpen] = useState<boolean>(false);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState<boolean>(false);
  const [isEscalateModalOpen, setIsEscalateModalOpen] = useState<boolean>(false);
  const [activeExceptionId, setActiveExceptionId] = useState<string | null>(null);
  const [actionNotes, setActionNotes] = useState<string>('');
  const [escalateTargetRole, setEscalateTargetRole] = useState<string>('area_manager');
  const [newExceptionPayload, setNewExceptionPayload] = useState({
    title: '',
    description: '',
    exceptionType: 'QUALITY_FAILURE',
    severity: 'HIGH' as ExceptionSeverity,
    orderId: '',
    branchId: 'b-hyd-bowenpally',
  });

  const isAuthorized = [
    'super_admin',
    'ceo',
    'owner',
    'franchise_owner',
    'regional_manager',
    'area_manager',
    'store_manager',
    'store_staff',
    'quality_inspector',
    'pickup_executive',
    'delivery_executive',
    'mis',
    'finance',
    'inventory',
  ].includes(currentRole);

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': 'Bearer mock-token-enterprise-ops-session',
    'x-fabriq-role': currentRole,
    'x-fabriq-org-id': 'org-fabriq-global',
  });

  const fetchOperationsData = async () => {
    setLoading(true);
    try {
      const headers = getHeaders();
      const divisionParam = selectedDivision !== 'all' ? `&divisionId=${selectedDivision}` : '';
      const branchParam = selectedBranch !== 'all' ? `&branchId=${selectedBranch}` : '';

      // Parallel data fetching from API
      const [sumRes, slaRes, excRes, capRes, qRes] = await Promise.all([
        fetch(`/api/operations/command-center?orgId=org-fabriq-global${divisionParam}${branchParam}`, { headers }).then((r) => r.json()),
        fetch(`/api/operations/sla?orgId=org-fabriq-global${divisionParam}${branchParam}`, { headers }).then((r) => r.json()),
        fetch(`/api/operations/exceptions?orgId=org-fabriq-global${divisionParam}${branchParam}`, { headers }).then((r) => r.json()),
        fetch(`/api/operations/capacity?orgId=org-fabriq-global${branchParam}`, { headers }).then((r) => r.json()),
        fetch(`/api/operations/quality?orgId=org-fabriq-global${branchParam}`, { headers }).then((r) => r.json()),
      ]);

      if (sumRes.success) setSummary(sumRes.summary);
      if (slaRes.success) setSlaList(slaRes.slaList || []);
      if (excRes.success) setExceptions(excRes.exceptions || []);
      if (capRes.success) setCapacityList(capRes.capacity || []);
      if (qRes.success) setQualityData(qRes.quality || null);
    } catch (err: any) {
      console.error('Failed to load operations data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchOperationsData();
    }
  }, [selectedDivision, selectedBranch, isAuthorized]);

  const handleTriggerSLAMonitoring = async () => {
    try {
      const res = await fetch('/api/operations/sla-monitor/job', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ orgId: 'org-fabriq-global' }),
      });
      const data = await res.json();
      if (data.success) {
        setNotificationMsg({ type: 'success', text: `Background SLA Scan Job enqueued successfully [Job ID: ${data.jobId}]` });
        fetchOperationsData();
      }
    } catch (err: any) {
      setNotificationMsg({ type: 'error', text: 'Failed to enqueue SLA scan' });
    }
  };

  const handleEscalateOrderSLA = async (orderId: string) => {
    try {
      const res = await fetch(`/api/operations/sla/${orderId}/escalate`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ reason: 'Manual operator escalation due to turnaround priority' }),
      });
      const data = await res.json();
      if (data.success) {
        setNotificationMsg({
          type: 'success',
          text: `Order ${orderId} escalated to ${data.escalationLevel} successfully.`,
        });
        fetchOperationsData();
      }
    } catch (err: any) {
      setNotificationMsg({ type: 'error', text: 'Failed to escalate order SLA' });
    }
  };

  const handleAcknowledgeException = async (exceptionId: string) => {
    try {
      const res = await fetch(`/api/operations/exceptions/${exceptionId}/acknowledge`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ notes: 'Operator acknowledged exception and initiated triage' }),
      });
      const data = await res.json();
      if (data.success) {
        setNotificationMsg({ type: 'success', text: `Exception ${exceptionId} acknowledged.` });
        fetchOperationsData();
      }
    } catch (err: any) {
      setNotificationMsg({ type: 'error', text: 'Failed to acknowledge exception' });
    }
  };

  const handleResolveException = async () => {
    if (!activeExceptionId || !actionNotes) return;
    try {
      const res = await fetch(`/api/operations/exceptions/${activeExceptionId}/resolve`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ resolutionNotes: actionNotes }),
      });
      const data = await res.json();
      if (data.success) {
        setNotificationMsg({ type: 'success', text: `Exception ${activeExceptionId} resolved successfully.` });
        setIsResolveModalOpen(false);
        setActionNotes('');
        setActiveExceptionId(null);
        fetchOperationsData();
      }
    } catch (err: any) {
      setNotificationMsg({ type: 'error', text: 'Failed to resolve exception' });
    }
  };

  const handleEscalateException = async () => {
    if (!activeExceptionId || !actionNotes) return;
    try {
      const res = await fetch(`/api/operations/exceptions/${activeExceptionId}/escalate`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ targetRole: escalateTargetRole, reason: actionNotes }),
      });
      const data = await res.json();
      if (data.success) {
        setNotificationMsg({ type: 'success', text: `Exception ${activeExceptionId} escalated to ${escalateTargetRole}.` });
        setIsEscalateModalOpen(false);
        setActionNotes('');
        setActiveExceptionId(null);
        fetchOperationsData();
      }
    } catch (err: any) {
      setNotificationMsg({ type: 'error', text: 'Failed to escalate exception' });
    }
  };

  const handleCreateNewException = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/operations/exceptions', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          ...newExceptionPayload,
          orgId: 'org-fabriq-global',
          divisionId: selectedDivision !== 'all' ? selectedDivision : 'laundry',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNotificationMsg({ type: 'success', text: `New workflow exception created [ID: ${data.exception.exceptionId}]` });
        setIsRaiseModalOpen(false);
        setNewExceptionPayload({
          title: '',
          description: '',
          exceptionType: 'QUALITY_FAILURE',
          severity: 'HIGH',
          orderId: '',
          branchId: 'b-hyd-bowenpally',
        });
        fetchOperationsData();
      }
    } catch (err: any) {
      setNotificationMsg({ type: 'error', text: 'Failed to create exception' });
    }
  };

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center font-sans">
        <div className="bg-white border-2 border-rose-200 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 mx-auto flex items-center justify-center">
            <span className="material-symbols-outlined text-[36px]">shield_lock</span>
          </div>
          <div>
            <span className="bg-rose-100 text-rose-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider inline-block mb-1">
              ACCESS RESTRICTED
            </span>
            <h2 className="font-['Libre_Caslon_Text',serif] text-xl font-bold text-slate-900">
              Operations Command Center Restricted
            </h2>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Role (<strong className="text-slate-900">{currentRole}</strong>) does not have authorization to view internal operations command controls.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-6 lg:p-8 font-['Manrope',sans-serif] space-y-6">
      <EnterprisePortalHeader
        portalTitle="Enterprise Operations Command Center"
        portalBadge="PHASE 2H-6 ORCHESTRATION"
        portalIcon="hub"
        activeScreen="operations-center"
        onNavigate={onNavigate}
      />

      {/* Top Banner Header */}
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950/80 border border-amber-500/30 p-5 rounded-2xl shadow-xl backdrop-blur-md">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold tracking-widest uppercase border border-amber-500/30">
                Phase 2H-6 Orchestration
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold tracking-widest uppercase border border-emerald-500/30">
                Live Deterministic
              </span>
            </div>
            <h1 className="font-['Libre_Caslon_Text',serif] text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
              <span className="material-symbols-outlined text-amber-400 text-[30px]">hub</span>
              <span>Enterprise Operations Command Center</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Real-time multi-division workflow orchestration, deterministic SLA monitoring, capacity telemetry & exception triage.
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button
              onClick={handleTriggerSLAMonitoring}
              className="px-3.5 py-2 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <span className="material-symbols-outlined text-[16px]">schedule</span>
              <span>Run Batch SLA Scan</span>
            </button>

            <button
              onClick={() => setIsRaiseModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-rose-600/30 text-rose-200 hover:bg-rose-600/40 border border-rose-500/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <span className="material-symbols-outlined text-[16px]">report_problem</span>
              <span>Raise Exception</span>
            </button>

            <button
              onClick={fetchOperationsData}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition-all cursor-pointer"
              title="Refresh Data"
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span>
            </button>
          </div>
        </div>

        {/* Global Notification Banner */}
        {notificationMsg && (
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold ${
              notificationMsg.type === 'success'
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">
                {notificationMsg.type === 'success' ? 'check_circle' : 'error'}
              </span>
              <span>{notificationMsg.text}</span>
            </div>
            <button onClick={() => setNotificationMsg(null)} className="text-slate-400 hover:text-white cursor-pointer">
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        )}

        {/* Scoping Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Division Filter</label>
            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="all">All Divisions (Cross-Aggregated)</option>
              <option value="laundry">FabriQ AI (Laundry & Care)</option>
              <option value="boutique">FabriQ Atelier (Boutique)</option>
              <option value="luxury_store">FabriQ Maison (Luxury Retail)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Branch / Facility Filter</label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="all">All Hubs & Branches</option>
              <option value="b-hyd-bowenpally">Bowenpally Premium Hub</option>
              <option value="b-hyd-jubilee">Jubilee Hills Atelier</option>
              <option value="b-blr-indiranagar">Indiranagar Experience Center</option>
              <option value="b-mum-bandra">Bandra Luxury Flagship</option>
              <option value="b-del-south-ext">South Extension Suite</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Role Permission Context</label>
            <div className="bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-amber-300 font-mono flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px]">badge</span>
              <span className="capitalize">{currentRole.replace(/_/g, ' ')}</span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Live Engine State</label>
            <div className="bg-slate-900/90 border border-emerald-500/30 rounded-lg px-3 py-1.5 text-xs text-emerald-400 font-mono flex items-center justify-between">
              <span>SLA Clock Active</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-800">
          {[
            { id: 'overview', label: 'Command Overview', icon: 'dashboard' },
            { id: 'sla_matrix', label: 'SLA Matrix & Escalations', icon: 'timelapse', badge: summary?.slaBreakdown?.breached || 0 },
            { id: 'exceptions', label: 'Exceptions Queue', icon: 'warning', badge: summary?.exceptionMetrics?.totalOpen || 0 },
            { id: 'quality_rework', label: 'Quality & Rework QA', icon: 'verified', badge: summary?.stageBreakdown?.reworkQueue || 0 },
            { id: 'capacity', label: 'Capacity & Bottlenecks', icon: 'analytics' },
            { id: 'enterprise_config', label: 'Enterprise Configuration', icon: 'settings_suggest' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                  : 'bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
              <span>{tab.label}</span>
              {typeof tab.badge === 'number' && tab.badge > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    activeTab === tab.id ? 'bg-slate-950 text-amber-400' : 'bg-rose-600 text-white'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Top SLA Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Active Orders</span>
                <div className="text-2xl font-bold text-white mt-1">{summary?.activeOrdersCount ?? 0}</div>
                <span className="text-[10px] text-emerald-400">In Pipeline</span>
              </div>

              <div className="bg-slate-950 border border-emerald-500/30 p-4 rounded-xl">
                <span className="text-[11px] text-emerald-400 uppercase font-semibold">On Track</span>
                <div className="text-2xl font-bold text-emerald-400 mt-1">{summary?.slaBreakdown?.onTrack ?? 0}</div>
                <span className="text-[10px] text-slate-400">SLA Nominal</span>
              </div>

              <div className="bg-slate-950 border border-amber-500/30 p-4 rounded-xl">
                <span className="text-[11px] text-amber-400 uppercase font-semibold">At Risk (&lt;4h)</span>
                <div className="text-2xl font-bold text-amber-400 mt-1">{summary?.slaBreakdown?.atRisk ?? 0}</div>
                <span className="text-[10px] text-amber-300">Warning Window</span>
              </div>

              <div className="bg-slate-950 border border-rose-500/30 p-4 rounded-xl">
                <span className="text-[11px] text-rose-400 uppercase font-semibold">Breached SLA</span>
                <div className="text-2xl font-bold text-rose-400 mt-1">{summary?.slaBreakdown?.breached ?? 0}</div>
                <span className="text-[10px] text-rose-300">Target Exceeded</span>
              </div>

              <div className="bg-slate-950 border border-purple-500/30 p-4 rounded-xl">
                <span className="text-[11px] text-purple-400 uppercase font-semibold">Escalated</span>
                <div className="text-2xl font-bold text-purple-400 mt-1">{summary?.slaBreakdown?.escalated ?? 0}</div>
                <span className="text-[10px] text-purple-300">Management Tier</span>
              </div>

              <div className="bg-slate-950 border border-amber-500/40 p-4 rounded-xl">
                <span className="text-[11px] text-amber-400 uppercase font-semibold">SLA Compliance</span>
                <div className="text-2xl font-bold text-white mt-1">{summary?.slaBreakdown?.slaComplianceRate ?? 100}%</div>
                <span className="text-[10px] text-slate-400">Target &gt;95%</span>
              </div>
            </div>

            {/* Workflow Stage Pipeline */}
            <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl shadow-lg">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400 text-[18px]">account_tree</span>
                <span>Active Workflow Stage Pipeline</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
                  <div className="text-[10px] font-semibold text-slate-400">Pickup Pending</div>
                  <div className="text-xl font-bold text-white mt-1">{summary?.stageBreakdown?.pickupPending ?? 0}</div>
                  <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
                    <div className="bg-blue-500 h-full w-full"></div>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
                  <div className="text-[10px] font-semibold text-slate-400">Intake / Inspected</div>
                  <div className="text-xl font-bold text-white mt-1">{summary?.stageBreakdown?.intakeInspected ?? 0}</div>
                  <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
                    <div className="bg-cyan-500 h-full w-full"></div>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
                  <div className="text-[10px] font-semibold text-slate-400">Processing</div>
                  <div className="text-xl font-bold text-amber-400 mt-1">{summary?.stageBreakdown?.processing ?? 0}</div>
                  <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
                    <div className="bg-amber-400 h-full w-full"></div>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
                  <div className="text-[10px] font-semibold text-slate-400">QA Inspection</div>
                  <div className="text-xl font-bold text-white mt-1">{summary?.stageBreakdown?.qualityInspection ?? 0}</div>
                  <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
                    <div className="bg-purple-400 h-full w-full"></div>
                  </div>
                </div>

                <div className="bg-slate-900 border border-rose-500/40 p-3 rounded-xl">
                  <div className="text-[10px] font-semibold text-rose-400">Rework Queue</div>
                  <div className="text-xl font-bold text-rose-400 mt-1">{summary?.stageBreakdown?.reworkQueue ?? 0}</div>
                  <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
                    <div className="bg-rose-500 h-full w-full"></div>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
                  <div className="text-[10px] font-semibold text-slate-400">Ready Dispatch</div>
                  <div className="text-xl font-bold text-emerald-400 mt-1">{summary?.stageBreakdown?.readyForDispatch ?? 0}</div>
                  <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
                    <div className="bg-emerald-400 h-full w-full"></div>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
                  <div className="text-[10px] font-semibold text-slate-400">Out for Delivery</div>
                  <div className="text-xl font-bold text-teal-400 mt-1">{summary?.stageBreakdown?.outForDelivery ?? 0}</div>
                  <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
                    <div className="bg-teal-400 h-full w-full"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Division Comparison Table */}
            <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl shadow-lg">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400 text-[18px]">domain</span>
                <span>Multi-Division Operational Comparison</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 text-[11px] uppercase border-b border-slate-800">
                    <tr>
                      <th className="p-3">Division</th>
                      <th className="p-3">Active Orders</th>
                      <th className="p-3">Breached / Escalated</th>
                      <th className="p-3">Rework Count</th>
                      <th className="p-3">Open Exceptions</th>
                      <th className="p-3 text-right">Operational Health</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200">
                    {summary?.divisionBreakdown?.map((div) => (
                      <tr key={div.divisionId} className="hover:bg-slate-900/50">
                        <td className="p-3 font-semibold text-white">{div.divisionName}</td>
                        <td className="p-3">{div.activeOrders}</td>
                        <td className="p-3">
                          <span className={div.breachedSlaCount > 0 ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                            {div.breachedSlaCount}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={div.reworkCount > 0 ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                            {div.reworkCount}
                          </span>
                        </td>
                        <td className="p-3">{div.exceptionCount}</td>
                        <td className="p-3 text-right">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              div.breachedSlaCount === 0
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {div.breachedSlaCount === 0 ? 'Optimal' : 'Action Required'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Critical Operational Alerts */}
            {summary?.criticalAlerts && summary.criticalAlerts.length > 0 && (
              <div className="bg-slate-950 border border-rose-500/30 p-5 rounded-2xl shadow-lg space-y-3">
                <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">notification_important</span>
                  <span>Active Critical Alerts ({summary.criticalAlerts.length})</span>
                </h3>

                <div className="space-y-2">
                  {summary.criticalAlerts.map((alert) => (
                    <div
                      key={alert.alertId}
                      className="p-3 rounded-xl bg-slate-900 border border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0"></span>
                        <div>
                          <p className="text-white font-semibold">{alert.message}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Branch: <span className="text-amber-300 font-mono">{alert.branchId}</span>
                            {alert.orderId && <> | Order: <span className="text-amber-300 font-mono">{alert.orderId}</span></>}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500 shrink-0">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SLA MATRIX */}
        {activeTab === 'sla_matrix' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400 text-[18px]">timelapse</span>
                <span>Deterministic Order SLA Matrix ({slaList.length})</span>
              </h3>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 text-[11px] uppercase border-b border-slate-800">
                    <tr>
                      <th className="p-3">Order Reference</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Current State</th>
                      <th className="p-3">Elapsed / Target</th>
                      <th className="p-3">Remaining</th>
                      <th className="p-3">SLA Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200">
                    {slaList.map((order) => (
                      <tr key={order.orderId} className="hover:bg-slate-900/50">
                        <td className="p-3 font-mono text-amber-300 font-semibold">{order.orderId}</td>
                        <td className="p-3">{order.customerName}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold border border-slate-700">
                            {order.currentState}
                          </span>
                        </td>
                        <td className="p-3 font-mono">
                          {order.elapsedHours}h / <strong className="text-white">{order.slaTargetHours}h</strong>
                        </td>
                        <td className="p-3 font-mono">
                          <span className={order.remainingHours <= 4 ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                            {order.remainingHours}h
                          </span>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase border ${
                              order.slaState === 'ON_TRACK'
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                : order.slaState === 'AT_RISK'
                                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                : order.slaState === 'BREACHED'
                                ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                                : order.slaState === 'ESCALATED'
                                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}
                          >
                            {order.slaState}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {order.slaState !== 'RESOLVED' && (
                            <button
                              onClick={() => handleEscalateOrderSLA(order.orderId)}
                              disabled={order.isEscalated}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                order.isEscalated
                                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                  : 'bg-purple-600/30 text-purple-200 hover:bg-purple-600/40 border border-purple-500/40'
                              }`}
                            >
                              {order.isEscalated ? 'Escalated' : 'Escalate SLA'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {slaList.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-500">
                          No active orders found matching the filter criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: EXCEPTIONS QUEUE */}
        {activeTab === 'exceptions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-rose-400 text-[18px]">warning</span>
                <span>Operational Exceptions Queue ({exceptions.length})</span>
              </h3>

              <button
                onClick={() => setIsRaiseModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-500 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[14px]">add</span>
                <span>Raise Exception</span>
              </button>
            </div>

            <div className="space-y-3">
              {exceptions.map((exc) => (
                <div
                  key={exc.exceptionId}
                  className="bg-slate-950 border border-slate-800 p-4 rounded-2xl shadow-md hover:border-slate-700 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          exc.severity === 'CRITICAL'
                            ? 'bg-rose-500/30 text-rose-300 border border-rose-500/50'
                            : exc.severity === 'HIGH'
                            ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50'
                            : 'bg-blue-500/30 text-blue-300 border border-blue-500/50'
                        }`}
                      >
                        {exc.severity}
                      </span>
                      <span className="font-mono text-xs text-amber-400 font-bold">{exc.exceptionId}</span>
                      <span className="text-slate-500">|</span>
                      <span className="text-xs font-bold text-white">{exc.title}</span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        exc.status === 'OPEN'
                          ? 'bg-rose-950 text-rose-400 border border-rose-800'
                          : exc.status === 'ACKNOWLEDGED'
                          ? 'bg-blue-950 text-blue-400 border border-blue-800'
                          : exc.status === 'IN_PROGRESS'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : exc.status === 'ESCALATED'
                          ? 'bg-purple-950 text-purple-400 border border-purple-800'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      }`}
                    >
                      {exc.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{exc.description}</p>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-slate-400 pt-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span>Type: <strong className="text-slate-200">{exc.exceptionType}</strong></span>
                      <span>Branch: <strong className="text-slate-200">{exc.branchId}</strong></span>
                      {exc.orderId && <span>Order: <strong className="text-amber-300 font-mono">{exc.orderId}</strong></span>}
                      <span>Assigned: <strong className="text-slate-200">{exc.assignedRole}</strong></span>
                    </div>

                    {exc.status !== 'RESOLVED' && (
                      <div className="flex items-center gap-2">
                        {exc.status === 'OPEN' && (
                          <button
                            onClick={() => handleAcknowledgeException(exc.exceptionId)}
                            className="px-2.5 py-1 rounded bg-blue-600/30 text-blue-200 hover:bg-blue-600/50 text-[10px] font-bold transition-all cursor-pointer"
                          >
                            Acknowledge
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setActiveExceptionId(exc.exceptionId);
                            setIsResolveModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded bg-emerald-600/30 text-emerald-200 hover:bg-emerald-600/50 text-[10px] font-bold transition-all cursor-pointer"
                        >
                          Resolve
                        </button>
                        <button
                          onClick={() => {
                            setActiveExceptionId(exc.exceptionId);
                            setIsEscalateModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded bg-purple-600/30 text-purple-200 hover:bg-purple-600/50 text-[10px] font-bold transition-all cursor-pointer"
                        >
                          Escalate
                        </button>
                      </div>
                    )}
                  </div>

                  {exc.resolutionNotes && (
                    <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/20 text-xs text-emerald-300">
                      <strong>Resolution:</strong> {exc.resolutionNotes}
                    </div>
                  )}
                </div>
              ))}
              {exceptions.length === 0 && (
                <div className="bg-slate-950 border border-slate-800 p-8 rounded-2xl text-center text-slate-500 text-xs">
                  No active exceptions logged for the selected scope.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: QUALITY & REWORK */}
        {activeTab === 'quality_rework' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Total Inspected</span>
                <div className="text-2xl font-bold text-white mt-1">{qualityData?.totalGarmentsInspected ?? 0}</div>
              </div>
              <div className="bg-slate-950 border border-emerald-500/30 p-4 rounded-xl">
                <span className="text-[11px] text-emerald-400 uppercase font-semibold">First Pass Yield</span>
                <div className="text-2xl font-bold text-emerald-400 mt-1">{qualityData?.firstPassYieldRate ?? 98.4}%</div>
              </div>
              <div className="bg-slate-950 border border-rose-500/30 p-4 rounded-xl">
                <span className="text-[11px] text-rose-400 uppercase font-semibold">Rework Rate</span>
                <div className="text-2xl font-bold text-rose-400 mt-1">{qualityData?.reworkRate ?? 1.6}%</div>
              </div>
              <div className="bg-slate-950 border border-amber-500/30 p-4 rounded-xl">
                <span className="text-[11px] text-amber-400 uppercase font-semibold">Active Rework Queue</span>
                <div className="text-2xl font-bold text-amber-400 mt-1">{qualityData?.reworkCount ?? 0}</div>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400 text-[18px]">assignment_late</span>
                <span>Active Garment Rework Items</span>
              </h3>

              <div className="divide-y divide-slate-800 text-xs">
                {qualityData?.reworkQueue?.map((item: any, idx: number) => (
                  <div key={idx} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-amber-300 font-bold">{item.garmentId}</span>
                        <span className="text-slate-400">|</span>
                        <span className="font-semibold text-white">{item.itemName}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Order: <span className="text-amber-300 font-mono">{item.orderId}</span> | Branch: {item.branchId}
                      </p>
                      {item.notes && <p className="text-[11px] text-amber-300/90 mt-1 italic">"{item.notes}"</p>}
                    </div>

                    <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/30 uppercase">
                      Reprocessing Station
                    </span>
                  </div>
                ))}
                {(!qualityData?.reworkQueue || qualityData.reworkQueue.length === 0) && (
                  <div className="py-8 text-center text-slate-500">
                    No garments currently in the rework queue.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: CAPACITY & BOTTLENECKS */}
        {activeTab === 'capacity' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-400 text-[18px]">analytics</span>
              <span>Branch Workload & Capacity Telemetry</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {capacityList.map((branch) => (
                <div
                  key={branch.branchId}
                  className={`bg-slate-950 border p-4 rounded-2xl shadow-md space-y-3 ${
                    branch.isOverCapacity ? 'border-rose-500/50 bg-rose-950/10' : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h4 className="font-bold text-white text-xs">{branch.branchName}</h4>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        branch.isOverCapacity
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      }`}
                    >
                      {branch.isOverCapacity ? 'Over Capacity' : 'Operational'}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span>Daily Workload Utilization</span>
                      <strong className="text-white">{branch.utilizationPercentage}%</strong>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          branch.utilizationPercentage > 85
                            ? 'bg-rose-500'
                            : branch.utilizationPercentage > 60
                            ? 'bg-amber-400'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, branch.utilizationPercentage)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                    <div className="bg-slate-900 p-2 rounded-lg">
                      <span className="text-slate-500 text-[10px] block">Active Orders</span>
                      <strong className="text-white text-sm">{branch.activeOrdersCount}</strong>
                    </div>
                    <div className="bg-slate-900 p-2 rounded-lg">
                      <span className="text-slate-500 text-[10px] block">Max Daily Cap</span>
                      <strong className="text-white text-sm">{branch.maxDailyCapacity}</strong>
                    </div>
                    <div className="bg-slate-900 p-2 rounded-lg">
                      <span className="text-slate-500 text-[10px] block">QA Backlog</span>
                      <strong className="text-purple-400 text-sm">{branch.pendingInspectionCount}</strong>
                    </div>
                    <div className="bg-slate-900 p-2 rounded-lg">
                      <span className="text-slate-500 text-[10px] block">Dispatch Ready</span>
                      <strong className="text-emerald-400 text-sm">{branch.dispatchBacklogCount}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: ENTERPRISE CONFIGURATION */}
        {activeTab === 'enterprise_config' && (
          <div className="pt-2">
            <EnterpriseConfiguration
              targetBranchId={selectedBranch !== 'all' ? selectedBranch : undefined}
            />
          </div>
        )}
      </div>

      {/* MODAL: RAISE NEW EXCEPTION */}
      {isRaiseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-amber-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-rose-400 text-[18px]">report_problem</span>
                <span>Raise Workflow Exception</span>
              </h3>
              <button onClick={() => setIsRaiseModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateNewException} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Exception Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Silk garment staining during hydro clean"
                  value={newExceptionPayload.title}
                  onChange={(e) => setNewExceptionPayload({ ...newExceptionPayload, title: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Exception Type</label>
                <select
                  value={newExceptionPayload.exceptionType}
                  onChange={(e) => setNewExceptionPayload({ ...newExceptionPayload, exceptionType: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="QUALITY_FAILURE">Quality Inspection Failure</option>
                  <option value="REWORK_REQUIRED">Rework Required</option>
                  <option value="DELAYED_PROCESSING">Delayed Processing / Bottleneck</option>
                  <option value="MISSING_GARMENT">Missing Garment</option>
                  <option value="INVENTORY_SHORTAGE">Chemical / Fabric Shortage</option>
                  <option value="BRANCH_CAPACITY_ISSUE">Branch Over-Capacity</option>
                  <option value="SLA_BREACH">SLA Breach Escalation</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Severity</label>
                  <select
                    value={newExceptionPayload.severity}
                    onChange={(e) => setNewExceptionPayload({ ...newExceptionPayload, severity: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Order Reference (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. ord-101"
                    value={newExceptionPayload.orderId}
                    onChange={(e) => setNewExceptionPayload({ ...newExceptionPayload, orderId: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Description & Operational Details</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Provide explicit operational details..."
                  value={newExceptionPayload.description}
                  onChange={(e) => setNewExceptionPayload({ ...newExceptionPayload, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-amber-400"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRaiseModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer shadow-lg"
                >
                  Log Exception
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RESOLVE EXCEPTION */}
      {isResolveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-emerald-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">task_alt</span>
              <span>Resolve Exception [{activeExceptionId}]</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Resolution Summary & Corrective Action</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Specify resolution actions taken..."
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-400"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => {
                    setIsResolveModalOpen(false);
                    setActionNotes('');
                  }}
                  className="px-3.5 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResolveException}
                  disabled={!actionNotes}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  Confirm Resolution
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ESCALATE EXCEPTION */}
      {isEscalateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-purple-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-purple-400 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">publish</span>
              <span>Escalate Exception [{activeExceptionId}]</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Target Escalation Role</label>
                <select
                  value={escalateTargetRole}
                  onChange={(e) => setEscalateTargetRole(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-purple-400 cursor-pointer"
                >
                  <option value="area_manager">Area Manager</option>
                  <option value="regional_manager">Regional Manager</option>
                  <option value="franchise_owner">Franchise Owner</option>
                  <option value="ceo">CEO Suite</option>
                  <option value="super_admin">Corporate Super Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Escalation Reason</label>
                <textarea
                  rows={3}
                  required
                  placeholder="State justification for tier escalation..."
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-purple-400"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => {
                    setIsEscalateModalOpen(false);
                    setActionNotes('');
                  }}
                  className="px-3.5 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEscalateException}
                  disabled={!actionNotes}
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  Submit Escalation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
