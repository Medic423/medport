export interface FacilityData {
    name: string;
    type: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone?: string;
    email?: string;
    coordinates?: {
        lat: number;
        lng: number;
    };
    isActive?: boolean;
}
export interface FacilitySearchFilters {
    name?: string;
    type?: string;
    city?: string;
    state?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
    radius?: number;
    originLat?: number;
    originLng?: number;
    showAllStates?: boolean;
}
export interface FacilityListResult {
    facilities: any[];
    total: number;
    page: number;
    totalPages: number;
}
export declare class FacilityService {
    /**
     * Calculate distance between two coordinates using Haversine formula
     * Returns distance in miles
     */
    private calculateDistance;
    private toRadians;
    createFacility(data: FacilityData): Promise<any>;
    getFacilities(filters?: FacilitySearchFilters): Promise<FacilityListResult>;
    getFacilityById(id: string): Promise<any | null>;
    updateFacility(id: string, data: Partial<FacilityData>): Promise<any>;
    deleteFacility(id: string): Promise<void>;
    searchFacilities(query: string): Promise<any[]>;
}
export declare const facilityService: FacilityService;
export default facilityService;
//# sourceMappingURL=facilityService.d.ts.map