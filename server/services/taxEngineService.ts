import {
  AppDivision,
  TaxClassification,
  TaxSchedule,
  TaxScheduleVersion,
  TaxComponentBreakdown,
  TaxSnapshot,
  TaxAuditRecord,
  TaxCodeType,
  TaxTreatmentType,
  TaxScheduleStatus,
} from '../../src/types';

// In-Memory persistent collections
const TAX_CLASSIFICATIONS: TaxClassification[] = [
  // SAC 998812 — Laundry, Dry Cleaning & Garment Care Services (Division: Laundry)
  {
    classificationId: 'class-sac-998812',
    code: '998812',
    codeType: 'SAC',
    description: 'Textile and apparel cleaning, pressing, dry cleaning and garment care services',
    category: 'Laundry & Dry Cleaning',
    serviceOrProduct: 'SERVICE',
    defaultTaxScheduleId: 'sched-sac-998812-std',
    active: true,
    effectiveFrom: '2025-01-01T00:00:00.000Z',
    version: 1,
    orgId: 'org-fabriq-global',
    divisionScope: ['laundry'],
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    createdBy: 'sys-seed',
    updatedBy: 'sys-seed',
  },
  // SAC 998822 — Tailoring, Fitting & Custom Garment Alteration Services (Division: Boutique)
  {
    classificationId: 'class-sac-998822',
    code: '998822',
    codeType: 'SAC',
    description: 'Custom tailoring, fitting, 3D body measurement alteration services',
    category: 'Tailoring & Alterations',
    serviceOrProduct: 'SERVICE',
    defaultTaxScheduleId: 'sched-sac-998822-std',
    active: true,
    effectiveFrom: '2025-01-01T00:00:00.000Z',
    version: 1,
    orgId: 'org-fabriq-global',
    divisionScope: ['boutique'],
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    createdBy: 'sys-seed',
    updatedBy: 'sys-seed',
  },
  // HSN 6205 — Men's or Boys' Shirts (Division: Luxury Store)
  {
    classificationId: 'class-hsn-6205',
    code: '6205',
    codeType: 'HSN',
    description: "Men's or boys' woven shirts, luxury cotton & silk apparel",
    category: 'Men Apparel',
    serviceOrProduct: 'PRODUCT',
    defaultTaxScheduleId: 'sched-hsn-6205-std',
    active: true,
    effectiveFrom: '2025-01-01T00:00:00.000Z',
    version: 1,
    orgId: 'org-fabriq-global',
    divisionScope: ['luxury_store', 'boutique'],
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    createdBy: 'sys-seed',
    updatedBy: 'sys-seed',
  },
  // HSN 6204 — Women's Suits, Dresses & Kurtas (Division: Boutique & Luxury Store)
  {
    classificationId: 'class-hsn-6204',
    code: '6204',
    codeType: 'HSN',
    description: "Women's or girls' suits, ensembles, jackets, dresses, skirts, trousers",
    category: 'Women Apparel',
    serviceOrProduct: 'PRODUCT',
    defaultTaxScheduleId: 'sched-hsn-6204-std',
    active: true,
    effectiveFrom: '2025-01-01T00:00:00.000Z',
    version: 1,
    orgId: 'org-fabriq-global',
    divisionScope: ['boutique', 'luxury_store'],
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    createdBy: 'sys-seed',
    updatedBy: 'sys-seed',
  },
  // HSN 6403 — Luxury Footwear (Division: Luxury Store)
  {
    classificationId: 'class-hsn-6403',
    code: '6403',
    codeType: 'HSN',
    description: 'Footwear with outer soles of rubber, plastics, leather or composition leather',
    category: 'Footwear',
    serviceOrProduct: 'PRODUCT',
    defaultTaxScheduleId: 'sched-hsn-6403-std',
    active: true,
    effectiveFrom: '2025-01-01T00:00:00.000Z',
    version: 1,
    orgId: 'org-fabriq-global',
    divisionScope: ['luxury_store'],
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    createdBy: 'sys-seed',
    updatedBy: 'sys-seed',
  },
];

const TAX_SCHEDULES: TaxSchedule[] = [
  // Schedule for SAC 998812 (Laundry)
  {
    taxScheduleId: 'sched-sac-998812-std',
    name: 'Laundry & Garment Care Standard Tax Schedule',
    scheduleCode: 'TAX-SAC-998812-V1',
    classificationCode: '998812',
    codeType: 'SAC',
    description: 'Standard GST schedule for FabriQ AI Laundry services',
    activeVersionNumber: 1,
    status: 'ACTIVE',
    orgId: 'org-fabriq-global',
    divisionScope: ['laundry'],
    versions: [
      {
        versionId: 'ver-sac-998812-v1',
        taxScheduleId: 'sched-sac-998812-std',
        versionNumber: 1,
        status: 'ACTIVE',
        cgstRatePercent: 9.0,
        sgstRatePercent: 9.0,
        igstRatePercent: 18.0,
        effectiveFrom: '2025-01-01T00:00:00.000Z',
        jurisdiction: 'IN-ALL',
        orgId: 'org-fabriq-global',
        divisionId: 'laundry',
        createdBy: 'sys-seed',
        createdAt: '2025-01-01T00:00:00.000Z',
      },
    ],
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    createdBy: 'sys-seed',
    updatedBy: 'sys-seed',
  },
  // Schedule for SAC 998822 (Boutique Tailoring)
  {
    taxScheduleId: 'sched-sac-998822-std',
    name: 'Boutique Tailoring & Fitting Tax Schedule',
    scheduleCode: 'TAX-SAC-998822-V1',
    classificationCode: '998822',
    codeType: 'SAC',
    description: 'GST schedule for custom tailoring and alteration services',
    activeVersionNumber: 1,
    status: 'ACTIVE',
    orgId: 'org-fabriq-global',
    divisionScope: ['boutique'],
    versions: [
      {
        versionId: 'ver-sac-998822-v1',
        taxScheduleId: 'sched-sac-998822-std',
        versionNumber: 1,
        status: 'ACTIVE',
        cgstRatePercent: 6.0,
        sgstRatePercent: 6.0,
        igstRatePercent: 12.0,
        effectiveFrom: '2025-01-01T00:00:00.000Z',
        jurisdiction: 'IN-ALL',
        orgId: 'org-fabriq-global',
        divisionId: 'boutique',
        createdBy: 'sys-seed',
        createdAt: '2025-01-01T00:00:00.000Z',
      },
    ],
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    createdBy: 'sys-seed',
    updatedBy: 'sys-seed',
  },
  // Schedule for HSN 6205 (Men Shirts)
  {
    taxScheduleId: 'sched-hsn-6205-std',
    name: 'Woven Shirts Tax Schedule',
    scheduleCode: 'TAX-HSN-6205-V1',
    classificationCode: '6205',
    codeType: 'HSN',
    description: 'GST schedule for luxury woven garments',
    activeVersionNumber: 1,
    status: 'ACTIVE',
    orgId: 'org-fabriq-global',
    divisionScope: ['luxury_store'],
    versions: [
      {
        versionId: 'ver-hsn-6205-v1',
        taxScheduleId: 'sched-hsn-6205-std',
        versionNumber: 1,
        status: 'ACTIVE',
        cgstRatePercent: 6.0,
        sgstRatePercent: 6.0,
        igstRatePercent: 12.0,
        effectiveFrom: '2025-01-01T00:00:00.000Z',
        jurisdiction: 'IN-ALL',
        orgId: 'org-fabriq-global',
        divisionId: 'luxury_store',
        createdBy: 'sys-seed',
        createdAt: '2025-01-01T00:00:00.000Z',
      },
    ],
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    createdBy: 'sys-seed',
    updatedBy: 'sys-seed',
  },
  // Schedule for HSN 6204 (Women Dresses)
  {
    taxScheduleId: 'sched-hsn-6204-std',
    name: 'Women Apparel Tax Schedule',
    scheduleCode: 'TAX-HSN-6204-V1',
    classificationCode: '6204',
    codeType: 'HSN',
    description: 'GST schedule for women suits and couture apparel',
    activeVersionNumber: 1,
    status: 'ACTIVE',
    orgId: 'org-fabriq-global',
    divisionScope: ['boutique', 'luxury_store'],
    versions: [
      {
        versionId: 'ver-hsn-6204-v1',
        taxScheduleId: 'sched-hsn-6204-std',
        versionNumber: 1,
        status: 'ACTIVE',
        cgstRatePercent: 6.0,
        sgstRatePercent: 6.0,
        igstRatePercent: 12.0,
        effectiveFrom: '2025-01-01T00:00:00.000Z',
        jurisdiction: 'IN-ALL',
        orgId: 'org-fabriq-global',
        createdBy: 'sys-seed',
        createdAt: '2025-01-01T00:00:00.000Z',
      },
    ],
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    createdBy: 'sys-seed',
    updatedBy: 'sys-seed',
  },
  // Schedule for HSN 6403 (Luxury Footwear)
  {
    taxScheduleId: 'sched-hsn-6403-std',
    name: 'Footwear & Shoes Tax Schedule',
    scheduleCode: 'TAX-HSN-6403-V1',
    classificationCode: '6403',
    codeType: 'HSN',
    description: 'GST schedule for luxury footwear',
    activeVersionNumber: 1,
    status: 'ACTIVE',
    orgId: 'org-fabriq-global',
    divisionScope: ['luxury_store'],
    versions: [
      {
        versionId: 'ver-hsn-6403-v1',
        taxScheduleId: 'sched-hsn-6403-std',
        versionNumber: 1,
        status: 'ACTIVE',
        cgstRatePercent: 9.0,
        sgstRatePercent: 9.0,
        igstRatePercent: 18.0,
        effectiveFrom: '2025-01-01T00:00:00.000Z',
        jurisdiction: 'IN-ALL',
        orgId: 'org-fabriq-global',
        divisionId: 'luxury_store',
        createdBy: 'sys-seed',
        createdAt: '2025-01-01T00:00:00.000Z',
      },
    ],
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    createdBy: 'sys-seed',
    updatedBy: 'sys-seed',
  },
];

const TAX_AUDIT_LOGS: TaxAuditRecord[] = [];

export class TaxEngineService {
  // --------------------------------------------------------------------
  // Classification Master Operations
  // --------------------------------------------------------------------

  static getClassifications(orgId: string, filter?: { codeType?: TaxCodeType; division?: AppDivision }): TaxClassification[] {
    let list = TAX_CLASSIFICATIONS.filter((c) => c.orgId === orgId);
    if (filter?.codeType) {
      list = list.filter((c) => c.codeType === filter.codeType);
    }
    if (filter?.division) {
      list = list.filter((c) => !c.divisionScope || c.divisionScope.includes(filter.division!));
    }
    return list;
  }

  static getClassificationByCode(orgId: string, code: string): TaxClassification | undefined {
    return TAX_CLASSIFICATIONS.find((c) => c.orgId === orgId && c.code === code && c.active);
  }

  static createClassification(
    orgId: string,
    createdBy: string,
    actorRole: string,
    data: {
      code: string;
      codeType: TaxCodeType;
      description: string;
      category: string;
      serviceOrProduct: 'PRODUCT' | 'SERVICE';
      divisionScope?: AppDivision[];
      effectiveFrom?: string;
    }
  ): TaxClassification {
    const existing = TAX_CLASSIFICATIONS.find((c) => c.orgId === orgId && c.code === data.code);
    if (existing) {
      throw new Error(`Tax classification with code '${data.code}' already exists for organization '${orgId}'.`);
    }

    const newClass: TaxClassification = {
      classificationId: `class-${data.codeType.toLowerCase()}-${data.code}`,
      code: data.code,
      codeType: data.codeType,
      description: data.description,
      category: data.category,
      serviceOrProduct: data.serviceOrProduct,
      active: true,
      effectiveFrom: data.effectiveFrom || new Date().toISOString(),
      version: 1,
      orgId,
      divisionScope: data.divisionScope,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy,
      updatedBy: createdBy,
    };

    TAX_CLASSIFICATIONS.push(newClass);

    this.recordAudit(
      orgId,
      createdBy,
      actorRole,
      'CREATE_CLASSIFICATION',
      'TaxClassification',
      newClass.classificationId,
      `Created ${data.codeType} classification code '${data.code}'`
    );

    return newClass;
  }

  // --------------------------------------------------------------------
  // Tax Schedule & Versioning Operations
  // --------------------------------------------------------------------

  static getSchedules(orgId: string, filter?: { codeType?: TaxCodeType; classificationCode?: string }): TaxSchedule[] {
    let list = TAX_SCHEDULES.filter((s) => s.orgId === orgId);
    if (filter?.codeType) {
      list = list.filter((s) => s.codeType === filter.codeType);
    }
    if (filter?.classificationCode) {
      list = list.filter((s) => s.classificationCode === filter.classificationCode);
    }
    return list;
  }

  static getScheduleById(orgId: string, taxScheduleId: string): TaxSchedule | undefined {
    return TAX_SCHEDULES.find((s) => s.orgId === orgId && s.taxScheduleId === taxScheduleId);
  }

  static validateNoOverlappingSchedules(
    schedule: TaxSchedule,
    newVersion: {
      effectiveFrom: string;
      effectiveTo?: string;
      jurisdiction: string;
      divisionId?: AppDivision;
    }
  ) {
    const newFrom = new Date(newVersion.effectiveFrom).getTime();
    const newTo = newVersion.effectiveTo ? new Date(newVersion.effectiveTo).getTime() : Infinity;

    for (const v of schedule.versions) {
      if (v.jurisdiction !== newVersion.jurisdiction) continue;
      if (v.divisionId !== newVersion.divisionId) continue;

      const vFrom = new Date(v.effectiveFrom).getTime();
      const vTo = v.effectiveTo ? new Date(v.effectiveTo).getTime() : Infinity;

      // If existing version v is open-ended (vTo === Infinity), and new version is also open-ended (newTo === Infinity)
      // and starts after vFrom, this is a valid sequential version progression (v will be capped at newFrom - 1).
      if (vTo === Infinity && newTo === Infinity && newFrom > vFrom) {
        continue;
      }

      // Check overlap range: [newFrom, newTo] overlaps with [vFrom, vTo]
      const overlaps = newFrom < vTo && newTo > vFrom;
      if (overlaps) {
        throw new Error(
          `Overlapping active tax schedule version detected. Version ${v.versionNumber} covers period ${v.effectiveFrom} to ${
            v.effectiveTo || 'Indefinite'
          }, which overlaps with proposed range.`
        );
      }
    }
  }

  static createSchedule(
    orgId: string,
    createdBy: string,
    actorRole: string,
    data: {
      name: string;
      classificationCode: string;
      codeType: TaxCodeType;
      description: string;
      cgstRatePercent: number;
      sgstRatePercent: number;
      igstRatePercent: number;
      utgstRatePercent?: number;
      cessRatePercent?: number;
      effectiveFrom?: string;
      jurisdiction?: string;
      divisionScope?: AppDivision[];
    }
  ): TaxSchedule {
    const classification = this.getClassificationByCode(orgId, data.classificationCode);
    if (!classification) {
      throw new Error(`Tax classification code '${data.classificationCode}' not found.`);
    }

    const scheduleId = `sched-${data.codeType.toLowerCase()}-${data.classificationCode}-${Date.now()}`;
    const versionId = `ver-${data.codeType.toLowerCase()}-${data.classificationCode}-v1`;
    const effectiveFrom = data.effectiveFrom || new Date().toISOString();

    const initialVersion: TaxScheduleVersion = {
      versionId,
      taxScheduleId: scheduleId,
      versionNumber: 1,
      status: 'ACTIVE',
      cgstRatePercent: data.cgstRatePercent,
      sgstRatePercent: data.sgstRatePercent,
      igstRatePercent: data.igstRatePercent,
      utgstRatePercent: data.utgstRatePercent,
      cessRatePercent: data.cessRatePercent,
      effectiveFrom,
      jurisdiction: data.jurisdiction || 'IN-ALL',
      orgId,
      createdBy,
      createdAt: new Date().toISOString(),
    };

    const newSchedule: TaxSchedule = {
      taxScheduleId: scheduleId,
      name: data.name,
      scheduleCode: `TAX-${data.codeType}-${data.classificationCode}-V1`,
      classificationCode: data.classificationCode,
      codeType: data.codeType,
      description: data.description,
      activeVersionNumber: 1,
      versions: [initialVersion],
      orgId,
      divisionScope: data.divisionScope || classification.divisionScope,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy,
      updatedBy: createdBy,
    };

    TAX_SCHEDULES.push(newSchedule);
    classification.defaultTaxScheduleId = scheduleId;

    this.recordAudit(
      orgId,
      createdBy,
      actorRole,
      'CREATE_TAX_SCHEDULE',
      'TaxSchedule',
      scheduleId,
      `Created tax schedule '${data.name}' for code '${data.classificationCode}' (IGST: ${data.igstRatePercent}%)`
    );

    return newSchedule;
  }

  static addVersionToSchedule(
    orgId: string,
    taxScheduleId: string,
    createdBy: string,
    actorRole: string,
    data: {
      cgstRatePercent: number;
      sgstRatePercent: number;
      igstRatePercent: number;
      utgstRatePercent?: number;
      cessRatePercent?: number;
      effectiveFrom: string;
      effectiveTo?: string;
      jurisdiction?: string;
      divisionId?: AppDivision;
      description?: string;
    }
  ): TaxScheduleVersion {
    const schedule = this.getScheduleById(orgId, taxScheduleId);
    if (!schedule) {
      throw new Error(`Tax schedule '${taxScheduleId}' not found.`);
    }

    const jurisdiction = data.jurisdiction || 'IN-ALL';

    // Validate non-overlapping rule
    this.validateNoOverlappingSchedules(schedule, {
      effectiveFrom: data.effectiveFrom,
      effectiveTo: data.effectiveTo,
      jurisdiction,
      divisionId: data.divisionId,
    });

    const nextVersionNumber = schedule.versions.length + 1;
    const versionId = `ver-${schedule.codeType.toLowerCase()}-${schedule.classificationCode}-v${nextVersionNumber}`;

    // Close earlier active version if no effectiveTo was set
    const effectiveFromTime = new Date(data.effectiveFrom).getTime();
    for (const v of schedule.versions) {
      if (v.status === 'ACTIVE' && v.jurisdiction === jurisdiction) {
        if (!v.effectiveTo || new Date(v.effectiveTo).getTime() > effectiveFromTime) {
          v.effectiveTo = new Date(effectiveFromTime - 1).toISOString();
        }
      }
    }

    const newVersion: TaxScheduleVersion = {
      versionId,
      taxScheduleId,
      versionNumber: nextVersionNumber,
      status: 'ACTIVE',
      cgstRatePercent: data.cgstRatePercent,
      sgstRatePercent: data.sgstRatePercent,
      igstRatePercent: data.igstRatePercent,
      utgstRatePercent: data.utgstRatePercent,
      cessRatePercent: data.cessRatePercent,
      effectiveFrom: data.effectiveFrom,
      effectiveTo: data.effectiveTo,
      jurisdiction,
      divisionId: data.divisionId,
      description: data.description,
      orgId,
      createdBy,
      createdAt: new Date().toISOString(),
    };

    schedule.versions.push(newVersion);
    schedule.activeVersionNumber = nextVersionNumber;
    schedule.updatedAt = new Date().toISOString();
    schedule.updatedBy = createdBy;

    this.recordAudit(
      orgId,
      createdBy,
      actorRole,
      'VERSION_TAX_SCHEDULE',
      'TaxScheduleVersion',
      versionId,
      `Added Version ${nextVersionNumber} to schedule '${schedule.name}' effective from ${data.effectiveFrom}`
    );

    return newVersion;
  }

  // --------------------------------------------------------------------
  // Effective-Date Schedule Resolution & Tax Calculation Engine
  // --------------------------------------------------------------------

  static resolveScheduleVersion(
    orgId: string,
    classificationCode: string,
    effectiveDate: string, // ISO Date
    opts?: {
      jurisdiction?: string;
      divisionId?: AppDivision;
    }
  ): { schedule: TaxSchedule; version: TaxScheduleVersion } {
    const targetTime = new Date(effectiveDate).getTime();
    const schedule = TAX_SCHEDULES.find((s) => s.orgId === orgId && s.classificationCode === classificationCode && s.status === 'ACTIVE');

    if (!schedule) {
      // Fallback: Default General Tax Schedule (18% GST standard)
      const fallbackSchedule = TAX_SCHEDULES[0];
      return { schedule: fallbackSchedule, version: fallbackSchedule.versions[0] };
    }

    // Filter versions that match jurisdiction/division and contain effectiveDate
    const matchingVersions = schedule.versions.filter((v) => {
      const vFrom = new Date(v.effectiveFrom).getTime();
      const vTo = v.effectiveTo ? new Date(v.effectiveTo).getTime() : Infinity;
      const timeMatches = targetTime >= vFrom && targetTime <= vTo;

      if (!timeMatches) return false;

      if (opts?.divisionId && v.divisionId && v.divisionId !== opts.divisionId) {
        return false;
      }

      return true;
    });

    if (matchingVersions.length > 0) {
      // Pick highest version number among matching
      matchingVersions.sort((a, b) => b.versionNumber - a.versionNumber);
      return { schedule, version: matchingVersions[0] };
    }

    // Fallback to active version
    const activeVersion = schedule.versions.find((v) => v.versionNumber === schedule.activeVersionNumber) || schedule.versions[0];
    return { schedule, version: activeVersion };
  }

  static calculateTax(
    orgId: string,
    taxableAmountInMinorUnits: number,
    classificationCode: string,
    effectiveDate: string,
    opts?: {
      taxTreatment?: TaxTreatmentType;
      jurisdiction?: string;
      divisionId?: AppDivision;
    }
  ): { breakdown: TaxComponentBreakdown; snapshot: TaxSnapshot; scheduleVersion: TaxScheduleVersion } {
    const { schedule, version } = this.resolveScheduleVersion(orgId, classificationCode, effectiveDate, opts);
    const taxTreatment = opts?.taxTreatment || 'INTRA_STATE';

    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;
    let utgstAmount = 0;
    let cessAmount = 0;

    let cgstRate = 0;
    let sgstRate = 0;
    let igstRate = 0;
    let utgstRate = 0;
    let cessRate = version.cessRatePercent || 0;

    if (taxTreatment === 'INTRA_STATE') {
      cgstRate = version.cgstRatePercent;
      sgstRate = version.sgstRatePercent;
      cgstAmount = Math.round(taxableAmountInMinorUnits * (cgstRate / 100));
      sgstAmount = Math.round(taxableAmountInMinorUnits * (sgstRate / 100));
    } else if (taxTreatment === 'INTER_STATE') {
      igstRate = version.igstRatePercent;
      igstAmount = Math.round(taxableAmountInMinorUnits * (igstRate / 100));
    } else if (taxTreatment === 'UNION_TERRITORY') {
      cgstRate = version.cgstRatePercent;
      utgstRate = version.utgstRatePercent || version.sgstRatePercent;
      cgstAmount = Math.round(taxableAmountInMinorUnits * (cgstRate / 100));
      utgstAmount = Math.round(taxableAmountInMinorUnits * (utgstRate / 100));
    } else if (taxTreatment === 'EXEMPT') {
      // 0 tax
    }

    if (cessRate > 0) {
      cessAmount = Math.round(taxableAmountInMinorUnits * (cessRate / 100));
    }

    const totalTax = cgstAmount + sgstAmount + igstAmount + utgstAmount + cessAmount;

    const breakdown: TaxComponentBreakdown = {
      taxableAmountInMinorUnits,
      cgstAmountInMinorUnits: cgstAmount,
      cgstRatePercent: cgstRate,
      sgstAmountInMinorUnits: sgstAmount,
      sgstRatePercent: sgstRate,
      igstAmountInMinorUnits: igstAmount,
      igstRatePercent: igstRate,
      utgstAmountInMinorUnits: utgstAmount,
      utgstRatePercent: utgstRate,
      cessAmountInMinorUnits: cessAmount,
      cessRatePercent: cessRate,
      totalTaxAmountInMinorUnits: totalTax,
    };

    const snapshotId = `taxsnap_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const snapshot: TaxSnapshot = {
      snapshotId,
      taxScheduleId: schedule.taxScheduleId,
      taxScheduleVersionId: version.versionId,
      versionNumber: version.versionNumber,
      classificationCode,
      codeType: schedule.codeType,
      taxTreatment,
      taxableAmountInMinorUnits,
      breakdown,
      effectiveDateUsed: effectiveDate,
      calculatedAt: new Date().toISOString(),
    };

    return { breakdown, snapshot, scheduleVersion: version };
  }

  // --------------------------------------------------------------------
  // Audit Trail Operations
  // --------------------------------------------------------------------

  static recordAudit(
    orgId: string,
    actorId: string,
    actorRole: string,
    action: TaxAuditRecord['action'],
    entity: TaxAuditRecord['entity'],
    entityId: string,
    changeSummary: string,
    opts?: { divisionId?: AppDivision; previousVersion?: number; newVersion?: number }
  ): TaxAuditRecord {
    const entry: TaxAuditRecord = {
      auditId: `taxaudit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      orgId,
      divisionId: opts?.divisionId,
      actorId,
      actorRole,
      action,
      entity,
      entityId,
      previousVersion: opts?.previousVersion,
      newVersion: opts?.newVersion,
      changeSummary,
      timestamp: new Date().toISOString(),
    };
    TAX_AUDIT_LOGS.push(entry);
    console.log(`[Tax Schedule Audit Log] ${action} on ${entity} (${entityId}) by ${actorId}: ${changeSummary}`);
    return entry;
  }

  static getAuditLogs(orgId: string): TaxAuditRecord[] {
    return TAX_AUDIT_LOGS.filter((a) => a.orgId === orgId);
  }
}
