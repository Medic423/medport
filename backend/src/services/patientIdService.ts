/**
 * Patient ID Generation Service
 * Generates HIPAA-compliant patient IDs for trip requests
 */

export class PatientIdService {
  /**
   * Generate a unique patient ID in the format: PMTC + timestamp + random
   * Example: PMTC1NJKZ, PMTC2ABC3, etc.
   */
  static generatePatientId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `PMTC${timestamp}${random}`.toUpperCase();
  }

  /**
   * Validate patient ID format
   */
  static isValidPatientId(patientId: string): boolean {
    const pattern = /^PMTC[A-Z0-9]{8,12}$/;
    return pattern.test(patientId);
  }

  /**
   * Generate QR code data for patient tracking
   */
  static generateQRCodeData(tripId: string, patientId: string): string {
    // In a real implementation, this would be a URL to a patient tracking page
    // For now, we'll create a simple encoded string
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return `${baseUrl}/trip-tracking/${tripId}?patient=${patientId}`;
  }
}

/**
 * Diagnosis options for the dropdown
 */
export const DIAGNOSIS_OPTIONS = [
  'UTI',
  'Dialysis',
  'Cardiac',
  'Respiratory',
  'Neurological',
  'Orthopedic',
  'General Medical',
  'Other'
] as const;

export type DiagnosisOption = typeof DIAGNOSIS_OPTIONS[number];

/**
 * Mobility level options
 */
export const MOBILITY_OPTIONS = [
  'Ambulatory',
  'Wheelchair',
  'Stretcher',
  'Bed'
] as const;

export type MobilityOption = typeof MOBILITY_OPTIONS[number];

/**
 * Transport level options
 */
export const TRANSPORT_LEVEL_OPTIONS = [
  'BLS',
  'ALS',
  'CCT',
  'Other'
] as const;

export type TransportLevelOption = typeof TRANSPORT_LEVEL_OPTIONS[number];

/**
 * Urgency level options
 */
export const URGENCY_OPTIONS = [
  'Routine',
  'Urgent',
  'Emergent'
] as const;

export type UrgencyOption = typeof URGENCY_OPTIONS[number];
