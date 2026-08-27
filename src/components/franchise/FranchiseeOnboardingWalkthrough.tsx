import React, { useState } from 'react';

export interface OnboardingDocument {
  id: string;
  name: string;
  category: 'legal' | 'tax' | 'safety' | 'financial';
  required: boolean;
  status: 'approved' | 'under_review' | 'rejected' | 'pending_upload';
  uploadedDate?: string;
  fileSize?: string;
}

export interface ServiceCertification {
  id: string;
  title: string;
  holderName: string;
  role: 'Master Spotter' | 'Valet Lead' | 'Dry Cleaner' | 'Press Technician';
  issueDate: string;
  validUntil: string;
  status: 'certified' | 'renewal_due' | 'in_training';
  badgeCode: string;
  score: number;
}

const INITIAL_DOCUMENTS: OnboardingDocument[] = [
  {
    id: 'DOC-101',
    name: 'GST Registration Certificate (Form REG-06)',
    category: 'tax',
    required: true,
    status: 'approved',
    uploadedDate: 'Aug 02, 2026',
    fileSize: '1.4 MB (PDF)',
  },
  {
    id: 'DOC-102',
    name: 'Atelier Commercial Lease Agreement (Min 5 Yrs)',
    category: 'legal',
    required: true,
    status: 'approved',
    uploadedDate: 'Aug 04, 2026',
    fileSize: '3.8 MB (PDF)',
  },
  {
    id: 'DOC-103',
    name: 'Hydrocarbon Distillation Safety Clearance (Pollution Control Board)',
    category: 'safety',
    required: true,
    status: 'under_review',
    uploadedDate: 'Aug 10, 2026',
    fileSize: '2.1 MB (PDF)',
  },
  {
    id: 'DOC-104',
    name: 'Franchisee Bank Mandate & Canceled Cheque',
    category: 'financial',
    required: true,
    status: 'approved',
    uploadedDate: 'Aug 05, 2026',
    fileSize: '850 KB (PDF)',
  },
  {
    id: 'DOC-105',
    name: 'Municipal Trade License & Fire Safety NOC',
    category: 'legal',
    required: true,
    status: 'pending_upload',
  },
];

const INITIAL_CERTIFICATIONS: ServiceCertification[] = [
  {
    id: 'CERT-001',
    title: 'Hydrocarbon Zero-Odor Solvent Master Certification',
    holderName: 'Ramesh Kumar',
    role: 'Dry Cleaner',
    issueDate: 'Jan 15, 2026',
    validUntil: 'Jan 15, 2028',
    status: 'certified',
    badgeCode: 'FBQ-HC-992',
    score: 98,
  },
  {
    id: 'CERT-002',
    title: 'Italian Steam Pressing & Silk Care Master',
    holderName: 'Anil Sharma',
    role: 'Press Technician',
    issueDate: 'Feb 10, 2026',
    validUntil: 'Feb 10, 2028',
    status: 'certified',
    badgeCode: 'FBQ-SP-841',
    score: 95,
  },
  {
    id: 'CERT-003',
    title: 'Luxury Leather, Designer Handbag & Sneaker Spa Specialist',
    holderName: 'Priya Nair',
    role: 'Master Spotter',
    issueDate: 'Mar 22, 2026',
    validUntil: 'Mar 22, 2028',
    status: 'certified',
    badgeCode: 'FBQ-SPA-309',
    score: 99,
  },
  {
    id: 'CERT-004',
    title: 'FabriQ AI Counter ERP & White-Glove Concierge Protocols',
    holderName: 'Siddharth Rao',
    role: 'Valet Lead',
    issueDate: 'Aug 01, 2026',
    validUntil: 'Aug 01, 2028',
    status: 'certified',
    badgeCode: 'FBQ-ERP-110',
    score: 92,
  },
];

export const FranchiseeOnboardingWalkthrough: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'walkthrough' | 'documents' | 'certifications'>('walkthrough');
  const [currentStep, setCurrentStep] = useState<number>(3); // Step 3 in progress
  const [documents, setDocuments] = useState<OnboardingDocument[]>(INITIAL_DOCUMENTS);
  const [certifications] = useState<ServiceCertification[]>(INITIAL_CERTIFICATIONS);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  const steps = [
    {
      number: 1,
      title: 'Site Selection & Layout Approval',
      desc: 'Location feasibility survey, footfall heatmapping, and 3D architectural blueprint signoff by FabriQ AI Design Team.',
      status: 'completed',
    },
    {
      number: 2,
      title: 'Equipment & Hydrocarbon Plant Setup',
      desc: 'Delivery and calibration of Italian Firbimatic Hydrocarbon dry cleaning machines and vacuum steam tables.',
      status: 'completed',
    },
    {
      number: 3,
      title: 'Legal Documents & Statutory Clearances',
      desc: 'Submission of GST certificate, Pollution Control Board NOC, and Franchisee Banking Mandate.',
      status: 'in_progress',
    },
    {
      number: 4,
      title: 'Staff Training & Service Certifications',
      desc: 'On-site training by FabriQ AI Master Care Specialists in stain removal, silk care, and leather restoration.',
      status: 'pending',
    },
    {
      number: 5,
      title: 'Grand Opening & FabriQ AI ERP Go-Live',
      desc: 'Live POS synchronization, local valet dispatch activation, and digital marketing launch campaign.',
      status: 'pending',
    },
  ];

  const handleSimulateUpload = (docId: string) => {
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === docId
          ? {
              ...d,
              status: 'under_review',
              uploadedDate: 'Just Now',
              fileSize: '1.9 MB (PDF)',
            }
          : d
      )
    );
    setUploadMessage('Document submitted successfully. FabriQ HQ Compliance Team is reviewing.');
    setTimeout(() => setUploadMessage(null), 4000);
  };

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-5 font-sans">
      {/* Toast Notification */}
      {uploadMessage && (
        <div className="bg-slate-900 text-amber-300 p-3 rounded-2xl border border-amber-400/50 text-xs font-bold flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-400 text-[18px]">verified</span>
            <span>{uploadMessage}</span>
          </div>
          <button onClick={() => setUploadMessage(null)} className="text-slate-400 hover:text-white">
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Header & Section Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <span className="text-[10px] font-extrabold text-[#9E7B4F] uppercase tracking-widest bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
            FRANCHISEE ONBOARDING & COMPLIANCE HUB
          </span>
          <h3 className="font-['Libre_Caslon_Text',serif] text-xl font-bold text-slate-900 mt-1">
            New Franchise Atelier Launch Suite
          </h3>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
          <button
            onClick={() => setActiveTab('walkthrough')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'walkthrough'
                ? 'bg-slate-900 text-amber-300 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Walkthrough (Step 3/5)
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'documents'
                ? 'bg-slate-900 text-amber-300 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Doc Portal (4/5 Approved)
          </button>
          <button
            onClick={() => setActiveTab('certifications')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'certifications'
                ? 'bg-slate-900 text-amber-300 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Staff Certifications ({certifications.length})
          </button>
        </div>
      </div>

      {/* TAB 1: STEP-BY-STEP WALKTHROUGH */}
      {activeTab === 'walkthrough' && (
        <div className="space-y-4">
          <div className="bg-slate-900 text-white rounded-2xl p-4 border border-amber-400/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest">
                LAUNCH PROGRESS: 60% COMPLETED
              </span>
              <h4 className="font-['Libre_Caslon_Text',serif] text-lg font-bold text-white mt-0.5">
                Target Launch Date: September 01, 2026
              </h4>
              <p className="text-xs text-slate-300">
                Mayfair Atelier #101 • Complete Step 3 document verification to trigger ERP equipment onboarding.
              </p>
            </div>
            <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700 text-center shrink-0">
              <span className="text-[10px] text-slate-400 block font-bold">HQ Onboarding Lead</span>
              <span className="text-xs font-bold text-amber-300 block">Vikram Malhotra (Senior Director)</span>
            </div>
          </div>

          <div className="space-y-3 relative before:absolute before:inset-0 before:left-5 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-200">
            {steps.map((s) => {
              const isCompleted = s.status === 'completed';
              const isInProgress = s.status === 'in_progress';

              return (
                <div key={s.number} className="relative flex items-start gap-4 pl-2">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 font-bold text-xs border z-10 transition-all ${
                      isCompleted
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                        : isInProgress
                        ? 'bg-amber-400 text-slate-950 border-amber-500 ring-4 ring-amber-100 font-extrabold'
                        : 'bg-slate-100 text-slate-400 border-slate-300'
                    }`}
                  >
                    {isCompleted ? (
                      <span className="material-symbols-outlined text-[20px]">check</span>
                    ) : (
                      s.number
                    )}
                  </div>

                  <div
                    className={`flex-1 p-4 rounded-2xl border transition-all ${
                      isInProgress
                        ? 'bg-amber-50/80 border-amber-300 shadow-xs'
                        : isCompleted
                        ? 'bg-slate-50 border-slate-200 opacity-80'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-['Libre_Caslon_Text',serif] font-bold text-slate-900 text-sm">
                        {s.title}
                      </h4>
                      <span
                        className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : isInProgress
                            ? 'bg-amber-200 text-amber-900 border-amber-400 animate-pulse'
                            : 'bg-slate-100 text-slate-500 border-slate-300'
                        }`}
                      >
                        {isInProgress ? 'IN PROGRESS' : s.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: DOCUMENT SUBMISSION PORTAL */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-600">upload_file</span>
              <span>Submit required legal, tax, and safety certifications for HQ audit signoff.</span>
            </div>
            <span className="font-bold text-slate-900">4 / 5 Required Documents Approved</span>
          </div>

          <div className="space-y-3">
            {documents.map((doc) => {
              const isApproved = doc.status === 'approved';
              const isReview = doc.status === 'under_review';
              const isPending = doc.status === 'pending_upload';

              return (
                <div
                  key={doc.id}
                  className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 font-bold border ${
                        isApproved
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : isReview
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-slate-200 text-slate-600 border-slate-300'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {isApproved ? 'verified' : isReview ? 'pending' : 'file_upload'}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono font-bold text-slate-400">{doc.id}</span>
                        <span className="text-xs font-bold text-slate-900">{doc.name}</span>
                        {doc.required && (
                          <span className="text-[9px] font-black text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                            REQUIRED
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {isApproved || isReview
                          ? `Uploaded: ${doc.uploadedDate} • ${doc.fileSize}`
                          : 'Not uploaded yet. PDF/PNG format up to 10MB accepted.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                        isApproved
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : isReview
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-slate-200 text-slate-700 border-slate-300'
                      }`}
                    >
                      {doc.status.replace('_', ' ').toUpperCase()}
                    </span>

                    {isPending && (
                      <button
                        onClick={() => handleSimulateUpload(doc.id)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-all flex items-center gap-1 shrink-0"
                      >
                        <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
                        <span>Upload File</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: SERVICE CERTIFICATION TRACKING */}
      {activeTab === 'certifications' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {certifications.map((cert) => (
              <div
                key={cert.id}
                className="bg-slate-900 text-white rounded-2xl p-4 border border-[#9E7B4F]/50 shadow-md space-y-3 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />

                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-400 text-[24px]">workspace_premium</span>
                    <div>
                      <span className="text-[9px] font-mono text-amber-300 font-bold block">{cert.badgeCode}</span>
                      <h4 className="font-['Libre_Caslon_Text',serif] font-bold text-sm text-white">
                        {cert.title}
                      </h4>
                    </div>
                  </div>
                  <span className="bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                    ACTIVE
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                  <div>
                    <span className="text-slate-400 block text-[9px] font-bold uppercase">Certified Staff</span>
                    <span className="font-bold text-white">{cert.holderName}</span>
                    <span className="text-[10px] text-slate-400 block">{cert.role}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] font-bold uppercase">Exam Score</span>
                    <span className="font-bold text-amber-300 text-sm">{cert.score} / 100</span>
                    <span className="text-[10px] text-emerald-400 block">Passed Mastery Exam</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                  <span>Issued: {cert.issueDate}</span>
                  <span>Valid Until: {cert.validUntil}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
