export interface Unit {
    id: string;
    agencyId: string;
    unitNumber: string;
    type: 'AMBULANCE' | 'HELICOPTER' | 'FIRE_TRUCK' | 'RESCUE_VEHICLE';
    capabilities: string[];
    currentStatus: 'AVAILABLE' | 'COMMITTED' | 'OUT_OF_SERVICE' | 'MAINTENANCE' | 'OFF_DUTY' | 'ON_CALL';
    currentLocation: string;
    crew: string[];
    isActive: boolean;
    totalTripsCompleted: number;
    averageResponseTime: number;
    lastMaintenanceDate: Date;
    nextMaintenanceDate: Date;
    lastStatusUpdate: Date;
    createdAt: Date;
    updatedAt: Date;
}
export interface UnitFormData {
    unitNumber: string;
    type: 'AMBULANCE' | 'HELICOPTER' | 'FIRE_TRUCK' | 'RESCUE_VEHICLE';
    capabilities: string[];
    customCapabilities: string[];
    currentStatus?: 'AVAILABLE' | 'COMMITTED' | 'OUT_OF_SERVICE' | 'MAINTENANCE' | 'OFF_DUTY' | 'ON_CALL';
    isActive: boolean;
}
export interface UnitStatusUpdate {
    status: 'AVAILABLE' | 'COMMITTED' | 'OUT_OF_SERVICE' | 'MAINTENANCE' | 'OFF_DUTY' | 'ON_CALL';
    location?: string;
    crew?: string[];
}
export interface UnitAnalytics {
    totalUnits: number;
    availableUnits: number;
    committedUnits: number;
    outOfServiceUnits: number;
    maintenanceUnits: number;
    offDutyUnits: number;
    totalTripsToday: number;
    averageResponseTime: number;
    efficiency: number;
}
declare class UnitService {
    private prisma;
    constructor();
    /**
     * Get all units (for admin users)
     */
    getAllUnits(): Promise<Unit[]>;
    /**
     * Get all units for an agency
     */
    getUnitsByAgency(agencyId: string): Promise<Unit[]>;
    /**
     * Get a single unit by ID
     */
    getUnitById(unitId: string): Promise<Unit | null>;
    /**
     * Create a new unit
     */
    createUnit(unitData: UnitFormData, agencyId: string): Promise<Unit>;
    /**
     * Update a unit
     */
    updateUnit(unitId: string, unitData: UnitFormData): Promise<Unit>;
    /**
     * Delete a unit
     */
    deleteUnit(unitId: string): Promise<void>;
    /**
     * Update unit status
     */
    updateUnitStatus(unitId: string, statusUpdate: UnitStatusUpdate): Promise<Unit>;
    /**
     * Get available units for optimization
     */
    getAvailableUnits(agencyId: string): Promise<Unit[]>;
    /**
     * Get on-duty units for trip assignment (AVAILABLE status only)
     */
    getOnDutyUnits(agencyId: string): Promise<Unit[]>;
    /**
     * Get unit analytics for an agency
     */
    getUnitAnalytics(agencyId: string): Promise<UnitAnalytics>;
    /**
     * Update unit duty status (on/off duty)
     */
    updateUnitDutyStatus(unitId: string, isActive: boolean): Promise<Unit>;
    /**
     * Map Prisma unit to Unit interface
     */
    private mapPrismaUnitToUnit;
}
export declare const unitService: UnitService;
export {};
//# sourceMappingURL=unitService.d.ts.map