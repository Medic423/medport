export interface AgencyData {
    name: string;
    contactName: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    serviceArea: string[];
    operatingHours?: any;
    capabilities: string[];
    pricingStructure?: any;
    isActive?: boolean;
    status?: string;
}
export interface AgencySearchFilters {
    name?: string;
    city?: string;
    state?: string;
    capabilities?: string[];
    isActive?: boolean;
    page?: number;
    limit?: number;
}
export interface AgencyListResult {
    agencies: any[];
    total: number;
    page: number;
    totalPages: number;
}
export declare class AgencyService {
    createAgency(data: AgencyData): Promise<any>;
    getAgencies(filters?: AgencySearchFilters): Promise<AgencyListResult>;
    getAgencyById(id: string): Promise<any | null>;
    updateAgency(id: string, data: Partial<AgencyData>): Promise<any>;
    deleteAgency(id: string): Promise<void>;
    searchAgencies(query: string): Promise<any[]>;
}
export declare const agencyService: AgencyService;
export default agencyService;
//# sourceMappingURL=agencyService.d.ts.map