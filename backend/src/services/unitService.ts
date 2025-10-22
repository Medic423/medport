import { PrismaClient as EMSPrismaClient } from '@prisma/client';
import { databaseManager } from './databaseManager';

// Types for unit management
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

class UnitService {
  private prisma: EMSPrismaClient;

  constructor() {
    this.prisma = new EMSPrismaClient();
  }

  /**
   * Get all units (for admin users)
   */
  async getAllUnits(): Promise<Unit[]> {
    try {
      console.log('TCC_DEBUG: getAllUnits called');
      
      const prisma = databaseManager.getEMSDB();
      const units = await prisma.unit.findMany({
        where: {
          isActive: true
        },
        include: {
          analytics: true,
          agency: true
        },
        orderBy: {
          unitNumber: 'asc'
        }
      });

      // Transform Prisma units to our Unit interface
      const transformedUnits: Unit[] = units.map((unit: any) => ({
        id: unit.id,
        agencyId: unit.agencyId,
        unitNumber: unit.unitNumber,
        type: unit.type as any,
        capabilities: unit.capabilities,
        currentStatus: unit.status as any,
        currentLocation: unit.location ? JSON.stringify(unit.location) : 'Unknown',
        crew: [], // Will be populated from separate crew management
        isActive: unit.isActive,
        totalTripsCompleted: unit.analytics?.totalTripsCompleted || 0,
        averageResponseTime: unit.analytics?.averageResponseTime?.toNumber() || 0,
        lastMaintenanceDate: unit.lastMaintenance || new Date(),
        nextMaintenanceDate: unit.nextMaintenance || new Date(),
        createdAt: unit.createdAt,
        updatedAt: unit.updatedAt
      }));

      console.log('TCC_DEBUG: Found all units:', transformedUnits.length);
      return transformedUnits;
    } catch (error) {
      console.error('Error getting all units:', error);
      throw new Error('Failed to retrieve units');
    }
  }

  /**
   * Get all units for an agency
   */
  async getUnitsByAgency(agencyId: string): Promise<Unit[]> {
    try {
      console.log('TCC_DEBUG: getUnitsByAgency called with agencyId:', agencyId);
      
      const prisma = databaseManager.getEMSDB();
      const units = await prisma.unit.findMany({
        where: {
          agencyId: agencyId,
          isActive: true
        },
        include: {
          analytics: true
        },
        orderBy: {
          unitNumber: 'asc'
        }
      });

      // Transform Prisma units to our Unit interface
      const transformedUnits: Unit[] = units.map((unit: any) => ({
        id: unit.id,
        agencyId: unit.agencyId,
        unitNumber: unit.unitNumber,
        type: unit.type as any,
        capabilities: unit.capabilities,
        currentStatus: unit.status as any,
        currentLocation: unit.location ? JSON.stringify(unit.location) : 'Unknown',
        crew: [], // Will be populated from separate crew management
        isActive: unit.isActive,
        totalTripsCompleted: unit.analytics?.totalTripsCompleted || 0,
        averageResponseTime: unit.analytics?.averageResponseTime?.toNumber() || 0,
        lastMaintenanceDate: unit.lastMaintenance || new Date(),
        nextMaintenanceDate: unit.nextMaintenance || new Date(),
        createdAt: unit.createdAt,
        updatedAt: unit.updatedAt
      }));

      console.log('TCC_DEBUG: Found units:', transformedUnits.length);
      return transformedUnits;
    } catch (error) {
      console.error('Error getting units by agency:', error);
      throw new Error('Failed to retrieve units');
    }
  }

  /**
   * Get a single unit by ID
   */
  async getUnitById(unitId: string): Promise<Unit | null> {
    try {
      // TODO: Implement proper Unit model in Prisma schema
      // For now, return mock data
      console.log('TCC_DEBUG: getUnitById called with unitId:', unitId);
      
      const mockUnit: Unit = {
        id: unitId,
        agencyId: 'mock-agency',
        unitNumber: 'U001',
        type: 'AMBULANCE',
        capabilities: ['BLS'],
        currentStatus: 'AVAILABLE',
        currentLocation: 'Station 1',
        crew: ['John Doe', 'Jane Smith'],
        isActive: true,
        totalTripsCompleted: 0,
        averageResponseTime: 0,
        lastMaintenanceDate: new Date(),
        nextMaintenanceDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      return mockUnit;
    } catch (error) {
      console.error('Error getting unit by ID:', error);
      throw new Error('Failed to retrieve unit');
    }
  }

  /**
   * Create a new unit
   */
  async createUnit(unitData: UnitFormData, agencyId: string): Promise<Unit> {
    try {
      console.log('TCC_DEBUG: createUnit called with data:', unitData);
      
      const prisma = databaseManager.getEMSDB();
      
      // Create the unit in the database
      const newUnit = await prisma.unit.create({
        data: {
          agencyId: agencyId,
          unitNumber: unitData.unitNumber,
          type: unitData.type,
          capabilities: unitData.capabilities,
          status: 'AVAILABLE',
          crewSize: 2, // Default crew size
          equipment: [], // Default empty equipment array
          isActive: unitData.isActive,
          lastMaintenance: new Date(),
          nextMaintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
        },
        include: {
          analytics: true
        }
      });

      // Create analytics record for the new unit
      await prisma.unit_analytics.create({
        data: {
          id: `analytics-${newUnit.id}`,
          unitId: newUnit.id,
          totalTripsCompleted: 0,
          averageResponseTime: 0,
          performanceScore: 0,
          efficiency: 0
        }
      });

      // Transform to our Unit interface
      const transformedUnit: Unit = {
        id: newUnit.id,
        agencyId: newUnit.agencyId,
        unitNumber: newUnit.unitNumber,
        type: newUnit.type as any,
        capabilities: newUnit.capabilities,
        currentStatus: newUnit.status as any,
        currentLocation: newUnit.location ? JSON.stringify(newUnit.location) : 'Station 1',
        crew: [],
        isActive: newUnit.isActive,
        totalTripsCompleted: 0,
        averageResponseTime: 0,
        lastMaintenanceDate: newUnit.lastMaintenance || new Date(),
        nextMaintenanceDate: newUnit.nextMaintenance || new Date(),
        createdAt: newUnit.createdAt,
        updatedAt: newUnit.updatedAt
      };

      console.log('TCC_DEBUG: Unit created successfully:', transformedUnit);
      return transformedUnit;
    } catch (error) {
      console.error('Error creating unit:', error);
      throw new Error('Failed to create unit');
    }
  }

  /**
   * Update a unit
   */
  async updateUnit(unitId: string, unitData: UnitFormData): Promise<Unit> {
    try {
      console.log('TCC_DEBUG: updateUnit called with unitId:', unitId, 'data:', unitData);
      
      const prisma = databaseManager.getEMSDB();
      
      // Update the unit in the database
      const updatedUnit = await prisma.unit.update({
        where: { id: unitId },
        data: {
          unitNumber: unitData.unitNumber,
          type: unitData.type,
          capabilities: unitData.capabilities,
          status: unitData.currentStatus || 'AVAILABLE',
          currentStatus: unitData.currentStatus || 'AVAILABLE',
          isActive: unitData.isActive,
          updatedAt: new Date()
        },
        include: {
          analytics: true,
          agency: true
        }
      });

      // Transform to our Unit interface
      const transformedUnit: Unit = {
        id: updatedUnit.id,
        agencyId: updatedUnit.agencyId,
        unitNumber: updatedUnit.unitNumber,
        type: updatedUnit.type as any,
        capabilities: updatedUnit.capabilities,
        currentStatus: updatedUnit.currentStatus as any,
        currentLocation: updatedUnit.location ? JSON.stringify(updatedUnit.location) : 'Unknown',
        crew: [], // Will be populated from separate crew management
        isActive: updatedUnit.isActive,
        totalTripsCompleted: updatedUnit.analytics?.totalTripsCompleted || 0,
        averageResponseTime: updatedUnit.analytics?.averageResponseTime?.toNumber() || 0,
        lastMaintenanceDate: updatedUnit.lastMaintenance || new Date(),
        nextMaintenanceDate: updatedUnit.nextMaintenance || new Date(),
        createdAt: updatedUnit.createdAt,
        updatedAt: updatedUnit.updatedAt
      };

      console.log('TCC_DEBUG: Unit updated successfully:', transformedUnit.unitNumber);
      return transformedUnit;
    } catch (error) {
      console.error('Error updating unit:', error);
      throw new Error('Failed to update unit');
    }
  }

  /**
   * Delete a unit
   */
  async deleteUnit(unitId: string): Promise<void> {
    try {
      console.log('TCC_DEBUG: deleteUnit called with unitId:', unitId);
      
      const prisma = databaseManager.getEMSDB();
      
      // First delete the analytics record if it exists
      await prisma.unit_analytics.deleteMany({
        where: { unitId: unitId }
      });
      
      // Then delete the unit
      await prisma.unit.delete({
        where: { id: unitId }
      });
      
      console.log('TCC_DEBUG: Unit deleted successfully:', unitId);
    } catch (error) {
      console.error('Error deleting unit:', error);
      throw new Error('Failed to delete unit');
    }
  }

  /**
   * Update unit status
   */
  async updateUnitStatus(unitId: string, statusUpdate: UnitStatusUpdate): Promise<Unit> {
    try {
      // TODO: Implement proper Unit model in Prisma schema
      console.log('TCC_DEBUG: updateUnitStatus called with unitId:', unitId, 'status:', statusUpdate);
      
      const mockUnit: Unit = {
        id: unitId,
        agencyId: 'mock-agency',
        unitNumber: 'U001',
        type: 'AMBULANCE',
        capabilities: ['BLS'],
        currentStatus: statusUpdate.status,
        currentLocation: statusUpdate.location || 'Station 1',
        crew: statusUpdate.crew || ['John Doe', 'Jane Smith'],
        isActive: true,
        totalTripsCompleted: 0,
        averageResponseTime: 0,
        lastMaintenanceDate: new Date(),
        nextMaintenanceDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      return mockUnit;
    } catch (error) {
      console.error('Error updating unit status:', error);
      throw new Error('Failed to update unit status');
    }
  }

  /**
   * Get available units for optimization
   */
  async getAvailableUnits(agencyId: string): Promise<Unit[]> {
    try {
      // TODO: Implement proper Unit model in Prisma schema
      console.log('TCC_DEBUG: getAvailableUnits called with agencyId:', agencyId);
      
      const mockUnits: Unit[] = [
        {
          id: '1',
          agencyId: agencyId,
          unitNumber: 'U001',
          type: 'AMBULANCE',
          capabilities: ['BLS'],
          currentStatus: 'AVAILABLE',
          currentLocation: 'Station 1',
          crew: ['John Doe', 'Jane Smith'],
          isActive: true,
          totalTripsCompleted: 0,
          averageResponseTime: 0,
          lastMaintenanceDate: new Date(),
          nextMaintenanceDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      return mockUnits;
    } catch (error) {
      console.error('Error getting available units:', error);
      throw new Error('Failed to retrieve available units');
    }
  }

  /**
   * Get on-duty units for trip assignment (AVAILABLE status only)
   */
  async getOnDutyUnits(agencyId: string): Promise<Unit[]> {
    try {
      console.log('TCC_DEBUG: getOnDutyUnits called with agencyId:', agencyId);
      
      const prisma = databaseManager.getEMSDB();
      const units = await prisma.unit.findMany({
        where: {
          agencyId: agencyId,
          isActive: true,
          status: 'AVAILABLE' // Only return units that are on-duty and available
        },
        include: {
          analytics: true,
          agency: true
        },
        orderBy: {
          unitNumber: 'asc'
        }
      });

      // Transform Prisma units to our Unit interface
      const transformedUnits: Unit[] = units.map((unit: any) => ({
        id: unit.id,
        agencyId: unit.agencyId,
        unitNumber: unit.unitNumber,
        type: unit.type as any,
        capabilities: unit.capabilities,
        currentStatus: unit.status as any,
        currentLocation: unit.location ? JSON.stringify(unit.location) : 'Station',
        crew: [], // Will be populated from separate crew management
        isActive: unit.isActive,
        totalTripsCompleted: unit.analytics?.totalTripsCompleted || 0,
        averageResponseTime: unit.analytics?.averageResponseTime?.toNumber() || 0,
        lastMaintenanceDate: unit.lastMaintenance || new Date(),
        nextMaintenanceDate: unit.nextMaintenance || new Date(),
        createdAt: unit.createdAt,
        updatedAt: unit.updatedAt
      }));

      console.log('TCC_DEBUG: Found on-duty units:', transformedUnits.length);
      return transformedUnits;
    } catch (error) {
      console.error('Error getting on-duty units:', error);
      throw new Error('Failed to retrieve on-duty units');
    }
  }

  /**
   * Get unit analytics for an agency
   */
  async getUnitAnalytics(agencyId: string): Promise<UnitAnalytics> {
    try {
      console.log('TCC_DEBUG: getUnitAnalytics called with agencyId:', agencyId);
      
      const prisma = databaseManager.getEMSDB();
      
      // Get all units for the agency
      const units = await prisma.unit.findMany({
        where: {
          agencyId: agencyId,
          isActive: true
        },
        include: {
          analytics: true
        }
      });

      // Calculate analytics from actual data
      const totalUnits = units.length;
      const availableUnits = units.filter(u => u.status === 'AVAILABLE').length;
      const committedUnits = units.filter(u => u.status === 'COMMITTED').length;
      const outOfServiceUnits = units.filter(u => u.status === 'OUT_OF_SERVICE').length;
      const maintenanceUnits = units.filter(u => u.status === 'MAINTENANCE').length;
      const offDutyUnits = units.filter(u => u.status === 'OFF_DUTY').length;
      
      // Calculate average response time from analytics
      const totalResponseTime = units.reduce((sum, unit) => {
        return sum + (unit.analytics?.averageResponseTime?.toNumber() || 0);
      }, 0);
      const averageResponseTime = totalUnits > 0 ? totalResponseTime / totalUnits : 0;
      
      // Calculate total trips today (placeholder - would need actual trip data)
      const totalTripsToday = 0;
      
      // Calculate efficiency (placeholder calculation)
      const efficiency = totalUnits > 0 ? (availableUnits / totalUnits) : 0;

      const analytics: UnitAnalytics = {
        totalUnits,
        availableUnits,
        committedUnits,
        outOfServiceUnits,
        maintenanceUnits,
        offDutyUnits,
        totalTripsToday,
        averageResponseTime,
        efficiency
      };

      console.log('TCC_DEBUG: Calculated analytics:', analytics);
      return analytics;
    } catch (error) {
      console.error('Error getting unit analytics:', error);
      throw new Error('Failed to retrieve unit analytics');
    }
  }

  /**
   * Update unit duty status (on/off duty)
   */
  async updateUnitDutyStatus(unitId: string, isActive: boolean): Promise<Unit> {
    try {
      console.log('TCC_DEBUG: updateUnitDutyStatus called with unitId:', unitId, 'isActive:', isActive);
      
      const prisma = databaseManager.getEMSDB();
      
      // Update the unit's isActive status
      const updatedUnit = await prisma.unit.update({
        where: {
          id: unitId
        },
        data: {
          isActive: isActive
        },
        include: {
          analytics: true,
          agency: true
        }
      });

      // Transform to our Unit interface
      const transformedUnit: Unit = {
        id: updatedUnit.id,
        agencyId: updatedUnit.agencyId,
        unitNumber: updatedUnit.unitNumber,
        type: updatedUnit.type as any,
        capabilities: updatedUnit.capabilities,
        currentStatus: updatedUnit.status as any,
        currentLocation: updatedUnit.location ? JSON.stringify(updatedUnit.location) : 'Station 1',
        crew: [],
        isActive: updatedUnit.isActive,
        totalTripsCompleted: updatedUnit.analytics?.totalTripsCompleted || 0,
        averageResponseTime: updatedUnit.analytics?.averageResponseTime?.toNumber() || 0,
        lastMaintenanceDate: updatedUnit.lastMaintenance || new Date(),
        nextMaintenanceDate: updatedUnit.nextMaintenance || new Date(),
        createdAt: updatedUnit.createdAt,
        updatedAt: updatedUnit.updatedAt
      };

      console.log('TCC_DEBUG: Unit duty status updated successfully:', transformedUnit);
      return transformedUnit;
    } catch (error) {
      console.error('Error updating unit duty status:', error);
      throw new Error('Failed to update unit duty status');
    }
  }

  /**
   * Map Prisma unit to Unit interface
   */
  private mapPrismaUnitToUnit(unit: any): Unit {
    return {
      id: unit.id,
      agencyId: unit.agencyId,
      unitNumber: unit.unitNumber,
      type: unit.type,
      capabilities: unit.capabilities || [],
      currentStatus: unit.currentStatus || 'AVAILABLE',
      currentLocation: unit.currentLocation || 'Unknown',
      crew: unit.crew || [],
      isActive: unit.isActive !== false,
      totalTripsCompleted: unit.totalTripsCompleted || 0,
      averageResponseTime: unit.averageResponseTime || 0,
      lastMaintenanceDate: unit.lastMaintenanceDate ? new Date(unit.lastMaintenanceDate) : new Date(),
      nextMaintenanceDate: unit.nextMaintenanceDate ? new Date(unit.nextMaintenanceDate) : new Date(),
      createdAt: unit.createdAt ? new Date(unit.createdAt) : new Date(),
      updatedAt: unit.updatedAt ? new Date(unit.updatedAt) : new Date()
    };
  }
}

export const unitService = new UnitService();