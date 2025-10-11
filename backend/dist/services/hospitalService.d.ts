export interface HospitalData {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone?: string;
    email?: string;
    type: string;
    capabilities: string[];
    region: string;
    coordinates?: {
        lat: number;
        lng: number;
    };
    latitude?: number;
    longitude?: number;
    operatingHours?: string;
    isActive?: boolean;
    requiresReview?: boolean;
}
export interface HospitalSearchFilters {
    name?: string;
    city?: string;
    state?: string;
    type?: string;
    region?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
}
export interface HospitalListResult {
    hospitals: any[];
    total: number;
    page: number;
    totalPages: number;
}
export declare class HospitalService {
    createHospital(data: HospitalData): Promise<any>;
    getHospitals(filters?: HospitalSearchFilters): Promise<HospitalListResult>;
    getHospitalById(id: string): Promise<any | null>;
    updateHospital(id: string, data: Partial<HospitalData>): Promise<any>;
    deleteHospital(id: string): Promise<void>;
    searchHospitals(query: string): Promise<any[]>;
    approveHospital(id: string, approvedBy: string): Promise<any>;
    rejectHospital(id: string, approvedBy: string): Promise<any>;
}
export declare const hospitalService: HospitalService;
export default hospitalService;
//# sourceMappingURL=hospitalService.d.ts.map