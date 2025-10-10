// Temporarily disabled due to missing production database schema
// This service will be implemented when production database is set up

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

export class ProductionUnitService {
  async getUnitsByAgency(agencyId: string): Promise<Unit[]> {
    // Temporarily disabled - return empty array
    console.log('ProductionUnitService.getUnitsByAgency called but disabled');
    return [];
  }

  async getAllUnits(): Promise<Unit[]> {
    // Temporarily disabled - return empty array
    console.log('ProductionUnitService.getAllUnits called but disabled');
    return [];
  }

  async createUnit(unitData: Omit<Unit, 'id' | 'createdAt' | 'updatedAt'>): Promise<Unit> {
    // Temporarily disabled
    throw new Error('ProductionUnitService is temporarily disabled');
  }

  async updateUnit(id: string, unitData: Partial<Unit>): Promise<Unit> {
    // Temporarily disabled
    throw new Error('ProductionUnitService is temporarily disabled');
  }

  async deleteUnit(id: string): Promise<void> {
    // Temporarily disabled
    throw new Error('ProductionUnitService is temporarily disabled');
  }

  async updateUnitStatus(id: string, status: string): Promise<Unit> {
    // Temporarily disabled
    throw new Error('ProductionUnitService is temporarily disabled');
  }

  async getUnitStats(): Promise<{
    totalUnits: number;
    availableUnits: number;
    committedUnits: number;
    outOfServiceUnits: number;
    maintenanceUnits: number;
  }> {
    // Temporarily disabled - return empty stats
    return {
      totalUnits: 0,
      availableUnits: 0,
      committedUnits: 0,
      outOfServiceUnits: 0,
      maintenanceUnits: 0
    };
  }

  async getUnitAnalytics(): Promise<any> {
    // Temporarily disabled - return empty analytics
    return {
      totalUnits: 0,
      availableUnits: 0,
      committedUnits: 0,
      outOfServiceUnits: 0,
      maintenanceUnits: 0,
      statusDistribution: {},
      typeDistribution: {}
    };
  }
}

export const productionUnitService = new ProductionUnitService();