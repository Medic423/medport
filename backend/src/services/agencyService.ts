import { EMSAgency, Unit, UnitAvailability, ServiceStatus, UnitType, UnitStatus, AvailabilityStatus } from '../../dist/prisma/ems';
import { databaseManager } from './databaseManager';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export interface AgencyRegistrationData {
  name: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  serviceArea?: string[];
  operatingHours?: string;
  capabilities?: string[];
  pricingStructure?: any;
  adminUser: {
    email: string;
    password: string;
    name: string;
    phone?: string;
  };
}

export interface AgencyUserData {
  email: string;
  password: string;
  name: string;
  role?: 'ADMIN' | 'STAFF' | 'BILLING_STAFF';
  phone?: string;
}

export interface UnitAvailabilityData {
  unitId: string;
  status: 'AVAILABLE' | 'ASSIGNED' | 'ON_BREAK' | 'OFF_DUTY';
  location?: any;
  shiftStart?: Date;
  shiftEnd?: Date;
  crewMembers?: any;
  currentAssignment?: string;
  notes?: string;
}

export class AgencyService {
  // Agency Registration and Management
  async registerAgency(data: AgencyRegistrationData): Promise<{ agency: EMSAgency; adminUser: any; token: string }> {
    try {
      // Check if agency email already exists
      const emsDB = databaseManager.getEMSDB();
      const existingAgency = await emsDB.eMSAgency.findFirst({
        where: { email: data.email }
      });

      if (existingAgency) {
        throw new Error('Agency with this email already exists');
      }

      // Create agency in EMS database
      const agency = await emsDB.eMSAgency.create({
        data: {
          name: data.name,
          contactName: data.contactName,
          phone: data.phone,
          email: data.email,
          address: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          serviceArea: data.serviceArea || [],
          operatingHours: data.operatingHours || '24/7',
          capabilities: data.capabilities || [],
          pricingStructure: data.pricingStructure,
          status: 'ACTIVE',
          isActive: true
        }
      });

      // Create admin user in Center database
      const centerDB = databaseManager.getCenterDB();
      const hashedPassword = await bcrypt.hash(data.adminUser.password, 12);
      
      const adminUser = await centerDB.user.create({
        data: {
          email: data.adminUser.email,
          password: hashedPassword,
          name: data.adminUser.name,
          userType: 'EMS',
          agencyId: agency.id,
          isActive: true
        }
      });

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: adminUser.id, 
          agencyId: agency.id, 
          userType: 'EMS',
          role: 'ADMIN'
        },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '24h' }
      );

      return { agency, adminUser, token };
    } catch (error) {
      console.error('Agency registration error:', error);
      throw error;
    }
  }

  async loginAgencyUser(email: string, password: string): Promise<{ user: any; agency: EMSAgency; token: string }> {
    try {
      const centerDB = databaseManager.getCenterDB();
      const user = await centerDB.user.findFirst({
        where: { 
          email, 
          isActive: true,
          userType: 'EMS'
        },
        include: { agency: true }
      });

      if (!user) {
        throw new Error('Invalid credentials');
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      // Get agency details from EMS database
      const emsDB = databaseManager.getEMSDB();
      const agency = await emsDB.eMSAgency.findUnique({
        where: { id: user.agencyId! }
      });

      if (!agency) {
        throw new Error('Agency not found');
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          agencyId: user.agencyId, 
          userType: 'EMS',
          role: user.role
        },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '24h' }
      );

      return { user, agency, token };
    } catch (error) {
      console.error('Agency login error:', error);
      throw error;
    }
  }

  async getAgencyById(agencyId: string): Promise<EMSAgency | null> {
    try {
      const emsDB = databaseManager.getEMSDB();
      return await emsDB.eMSAgency.findUnique({
        where: { id: agencyId },
        include: {
          units: {
            include: {
              availability: true
            }
          }
        }
      });
    } catch (error) {
      console.error('Get agency error:', error);
      throw error;
    }
  }

  async updateAgencyProfile(agencyId: string, data: any): Promise<EMSAgency> {
    try {
      const emsDB = databaseManager.getEMSDB();
      return await emsDB.eMSAgency.update({
        where: { id: agencyId },
        data: {
          ...data,
          updatedAt: new Date()
        }
      });
    } catch (error) {
      console.error('Update agency profile error:', error);
      throw error;
    }
  }

  // Agency User Management (using Center database)
  async createAgencyUser(agencyId: string, data: AgencyUserData): Promise<any> {
    try {
      const centerDB = databaseManager.getCenterDB();
      const hashedPassword = await bcrypt.hash(data.password, 12);

      return await centerDB.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          name: data.name,
          userType: 'EMS',
          agencyId: agencyId,
          role: data.role === 'STAFF' ? 'COORDINATOR' : (data.role === 'ADMIN' ? 'ADMIN' : 'COORDINATOR'),
          isActive: true
        }
      });
    } catch (error) {
      console.error('Create agency user error:', error);
      throw error;
    }
  }

  async getAgencyUsers(agencyId: string): Promise<any[]> {
    try {
      const centerDB = databaseManager.getCenterDB();
      return await centerDB.user.findMany({
        where: { 
          agencyId, 
          isActive: true,
          userType: 'EMS'
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true
        }
      });
    } catch (error) {
      console.error('Get agency users error:', error);
      throw error;
    }
  }

  async updateAgencyUser(userId: string, data: any): Promise<any> {
    try {
      const centerDB = databaseManager.getCenterDB();
      if (data.password) {
        data.password = await bcrypt.hash(data.password, 12);
      }

      return await centerDB.user.update({
        where: { id: userId },
        data
      });
    } catch (error) {
      console.error('Update agency user error:', error);
      throw error;
    }
  }

  // Unit Management (using EMS database)
  async createUnit(agencyId: string, data: any): Promise<Unit> {
    try {
      const emsDB = databaseManager.getEMSDB();
      const unit = await emsDB.unit.create({
        data: {
          agencyId,
          unitNumber: data.unitNumber,
          type: data.type || 'BLS',
          capabilities: data.capabilities || [],
          currentStatus: 'AVAILABLE',
          currentLocation: data.currentLocation,
          shiftStart: data.shiftStart,
          shiftEnd: data.shiftEnd,
          isActive: true
        }
      });

      // Create initial unit availability record
      await emsDB.unitAvailability.create({
        data: {
          unitId: unit.id,
          status: 'AVAILABLE',
          startTime: new Date()
        }
      });

      return unit;
    } catch (error) {
      console.error('Create unit error:', error);
      throw error;
    }
  }

  async getAgencyUnits(agencyId: string): Promise<Unit[]> {
    try {
      const emsDB = databaseManager.getEMSDB();
      return await emsDB.unit.findMany({
        where: { agencyId, isActive: true },
        include: {
          availability: true
        }
      });
    } catch (error) {
      console.error('Get agency units error:', error);
      throw error;
    }
  }

  async updateUnitAvailability(unitId: string, data: UnitAvailabilityData): Promise<UnitAvailability> {
    try {
      const emsDB = databaseManager.getEMSDB();
      // First try to find existing availability record
      const existing = await emsDB.unitAvailability.findFirst({
        where: { unitId }
      });

      if (existing) {
        // Update existing record
        return await emsDB.unitAvailability.update({
          where: { id: existing.id },
          data: {
            status: data.status as any,
            startTime: data.shiftStart || new Date(),
            endTime: data.shiftEnd,
            notes: data.notes,
            updatedAt: new Date()
          }
        });
      } else {
        // Create new record
        return await emsDB.unitAvailability.create({
          data: {
            unitId,
            status: data.status as any,
            startTime: data.shiftStart || new Date(),
            endTime: data.shiftEnd,
            notes: data.notes
          }
        });
      }
    } catch (error) {
      console.error('Update unit availability error:', error);
      throw error;
    }
  }

  // Utility Methods
  async validateAgencyAccess(userId: string, agencyId: string): Promise<boolean> {
    try {
      const centerDB = databaseManager.getCenterDB();
      const user = await centerDB.user.findFirst({
        where: { 
          id: userId, 
          agencyId, 
          isActive: true,
          userType: 'EMS'
        }
      });
      return !!user;
    } catch (error) {
      console.error('Validate agency access error:', error);
      return false;
    }
  }

  async getAgencyStats(agencyId: string): Promise<any> {
    try {
      const emsDB = databaseManager.getEMSDB();
      const [totalUnits, availableUnits] = await Promise.all([
        emsDB.unit.count({ where: { agencyId, isActive: true } }),
        emsDB.unitAvailability.count({ 
          where: { 
            unit: { agencyId, isActive: true },
            status: 'AVAILABLE'
          }
        })
      ]);

      return {
        totalUnits,
        availableUnits,
        utilizationRate: totalUnits > 0 ? (availableUnits / totalUnits) * 100 : 0
      };
    } catch (error) {
      console.error('Get agency stats error:', error);
      throw error;
    }
  }
}

export default new AgencyService();