import { LoggerService } from './loggerService';

export interface BespokeMeasurements {
  chestCm?: number;
  waistCm?: number;
  sleeveCm?: number;
  shoulderCm?: number;
  neckCm?: number;
  inseamCm?: number;
  hipsCm?: number;
  jacketLengthCm?: number;
  thighCm?: number;
  postureNotes?: string;
  avatarMeshRef?: string;
  [key: string]: any;
}

export interface MeasurementVersionEntry {
  version: number;
  measurements: BespokeMeasurements;
  notes?: string;
  updatedBy: string;
  updatedByRole: string;
  updatedAt: string;
  changeReason?: string;
}

export interface CustomerMeasurementProfile {
  measurementProfileId: string;
  customerId: string;
  orgId: string;
  divisionId: string;
  franchiseId?: string | null;
  branchId?: string | null;
  profileName: string;
  measurementVersion: number;
  measurements: BespokeMeasurements;
  measurementUnit: 'cm' | 'inch';
  notes?: string;
  active: boolean;
  history: MeasurementVersionEntry[];
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

// In-Memory persistent store for Bespoke Tailoring Customer Measurements
const measurementProfilesStore = new Map<string, CustomerMeasurementProfile>();

export class MeasurementService {
  /**
   * Create a new measurement profile for a customer
   */
  public static createProfile(params: {
    customerId: string;
    orgId: string;
    divisionId?: string;
    franchiseId?: string | null;
    branchId?: string | null;
    profileName?: string;
    measurements: BespokeMeasurements;
    measurementUnit?: 'cm' | 'inch';
    notes?: string;
    createdBy: string;
    createdByRole: string;
  }): CustomerMeasurementProfile {
    const {
      customerId,
      orgId,
      divisionId = 'div-fabriq-boutique',
      franchiseId = null,
      branchId = null,
      profileName = 'Primary Bespoke Fit Profile',
      measurements,
      measurementUnit = 'cm',
      notes,
      createdBy,
      createdByRole,
    } = params;

    const now = new Date().toISOString();
    const profileId = `meas-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const initialVersion: MeasurementVersionEntry = {
      version: 1,
      measurements,
      notes,
      updatedBy: createdBy,
      updatedByRole: createdByRole,
      updatedAt: now,
      changeReason: 'Initial measurement profile baseline creation',
    };

    const newProfile: CustomerMeasurementProfile = {
      measurementProfileId: profileId,
      customerId,
      orgId,
      divisionId,
      franchiseId,
      branchId,
      profileName,
      measurementVersion: 1,
      measurements,
      measurementUnit,
      notes,
      active: true,
      history: [initialVersion],
      createdBy,
      updatedBy: createdBy,
      createdAt: now,
      updatedAt: now,
    };

    measurementProfilesStore.set(profileId, newProfile);

    LoggerService.info(`Created measurement profile '${profileId}' (v1) for customer '${customerId}'`, {
      orgId,
      profileId,
      customerId,
    });

    return newProfile;
  }

  /**
   * Get active measurement profile for a customer within tenant org scope
   */
  public static getProfileByCustomer(customerId: string, orgId: string): CustomerMeasurementProfile | null {
    for (const profile of measurementProfilesStore.values()) {
      if (profile.customerId === customerId && profile.orgId === orgId && profile.active) {
        return profile;
      }
    }
    return null;
  }

  /**
   * Get specific profile by profileId within tenant org scope
   */
  public static getProfileById(profileId: string, orgId: string): CustomerMeasurementProfile | null {
    const profile = measurementProfilesStore.get(profileId);
    if (profile && profile.orgId === orgId) {
      return profile;
    }
    return null;
  }

  /**
   * Update measurement profile, incrementing version and preserving history
   */
  public static updateProfile(
    profileId: string,
    orgId: string,
    params: {
      measurements?: BespokeMeasurements;
      profileName?: string;
      measurementUnit?: 'cm' | 'inch';
      notes?: string;
      changeReason?: string;
      updatedBy: string;
      updatedByRole: string;
    }
  ): CustomerMeasurementProfile {
    const profile = this.getProfileById(profileId, orgId);
    if (!profile) {
      throw new Error(`Measurement profile '${profileId}' not found within tenant '${orgId}'`);
    }

    const now = new Date().toISOString();
    const newVersionNumber = profile.measurementVersion + 1;

    const mergedMeasurements: BespokeMeasurements = {
      ...profile.measurements,
      ...(params.measurements || {}),
    };

    const newHistoryEntry: MeasurementVersionEntry = {
      version: newVersionNumber,
      measurements: mergedMeasurements,
      notes: params.notes || profile.notes,
      updatedBy: params.updatedBy,
      updatedByRole: params.updatedByRole,
      updatedAt: now,
      changeReason: params.changeReason || `Version ${newVersionNumber} update`,
    };

    profile.measurementVersion = newVersionNumber;
    profile.measurements = mergedMeasurements;
    if (params.profileName) profile.profileName = params.profileName;
    if (params.measurementUnit) profile.measurementUnit = params.measurementUnit;
    if (params.notes !== undefined) profile.notes = params.notes;
    profile.updatedBy = params.updatedBy;
    profile.updatedAt = now;
    profile.history.push(newHistoryEntry);

    measurementProfilesStore.set(profileId, profile);

    LoggerService.info(`Updated measurement profile '${profileId}' to version ${newVersionNumber}`, {
      orgId,
      profileId,
      version: newVersionNumber,
    });

    return profile;
  }

  /**
   * List version history for a customer's measurement profile
   */
  public static getProfileHistory(customerId: string, orgId: string): MeasurementVersionEntry[] {
    const profile = this.getProfileByCustomer(customerId, orgId);
    if (!profile) return [];
    return profile.history;
  }

  /**
   * Reset store (for testing)
   */
  public static clearStore(): void {
    measurementProfilesStore.clear();
  }
}
