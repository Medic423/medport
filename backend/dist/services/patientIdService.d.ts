/**
 * Patient ID Generation Service
 * Generates HIPAA-compliant patient IDs for trip requests
 */
export declare class PatientIdService {
    /**
     * Generate a unique patient ID in the format: PMTC + timestamp + random
     * Example: PMTC1NJKZ, PMTC2ABC3, etc.
     */
    static generatePatientId(): string;
    /**
     * Validate patient ID format
     */
    static isValidPatientId(patientId: string): boolean;
    /**
     * Generate QR code data for patient tracking
     */
    static generateQRCodeData(tripId: string, patientId: string): string;
}
/**
 * Diagnosis options for the dropdown
 */
export declare const DIAGNOSIS_OPTIONS: readonly ["UTI", "Dialysis", "Cardiac", "Respiratory", "Neurological", "Orthopedic", "General Medical", "Other"];
export type DiagnosisOption = typeof DIAGNOSIS_OPTIONS[number];
/**
 * Mobility level options
 */
export declare const MOBILITY_OPTIONS: readonly ["Ambulatory", "Wheelchair", "Stretcher", "Bed"];
export type MobilityOption = typeof MOBILITY_OPTIONS[number];
/**
 * Transport level options
 */
export declare const TRANSPORT_LEVEL_OPTIONS: readonly ["BLS", "ALS", "CCT", "Other"];
export type TransportLevelOption = typeof TRANSPORT_LEVEL_OPTIONS[number];
/**
 * Urgency level options
 */
export declare const URGENCY_OPTIONS: readonly ["Routine", "Urgent", "Emergent"];
export type UrgencyOption = typeof URGENCY_OPTIONS[number];
//# sourceMappingURL=patientIdService.d.ts.map