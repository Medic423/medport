export interface Unit {
    id: string;
    agencyId: string;
    unitNumber: string;
    type: string;
    capabilities: string[];
    currentStatus: string;
    currentLocation?: string;
    shiftStart?: string;
    shiftEnd?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare class ProductionUnitService {
    getUnitsByAgency(agencyId: string): Promise<Unit[]>;
    getAllUnits(): Promise<Unit[]>;
    createUnit(unitData: Omit<Unit, 'id' | 'createdAt' | 'updatedAt'>): Promise<Unit>;
    updateUnit(id: string, unitData: Partial<Unit>): Promise<Unit>;
    deleteUnit(id: string): Promise<void>;
    updateUnitStatus(id: string, status: string): Promise<Unit>;
    getUnitStats(): Promise<{
        totalUnits: number;
        availableUnits: number;
        committedUnits: number;
        outOfServiceUnits: number;
        maintenanceUnits: number;
    }>;
    getUnitAnalytics(): Promise<any>;
}
export declare const productionUnitService: ProductionUnitService;
//# sourceMappingURL=productionUnitService.d.ts.map