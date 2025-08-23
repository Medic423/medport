import { PrismaClient, TransportAgency, AgencyUser, AgencyProfile, Unit, UnitAvailability, ServiceArea, AgencyPerformance } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export interface AgencyRegistrationData {
  name: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  serviceArea?: any;
  operatingHours?: any;
  capabilities?: any;
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
  status: 'AVAILABLE' | 'IN_USE' | 'OUT_OF_SERVICE' | 'MAINTENANCE';
  location?: any;
  shiftStart?: Date;
  shiftEnd?: Date;
  crewMembers?: any;
  currentAssignment?: string;
  notes?: string;
}

export interface ServiceAreaData {
  name: string;
  description?: string;
  geographicBoundaries: any;
  coverageRadius?: number;
  primaryServiceArea?: boolean;
  operatingHours?: any;
  specialRestrictions?: string;
}

export class AgencyService {
  // Agency Registration and Management
  async registerAgency(data: AgencyRegistrationData): Promise<{ agency: TransportAgency; adminUser: AgencyUser; token: string }> {
    try {
      // Check if agency email already exists
      const existingAgency = await prisma.transportAgency.findFirst({
        where: { email: data.email }
      });

      if (existingAgency) {
        throw new Error('Agency with this email already exists');
      }

      // Check if admin user email already exists
      const existingUser = await prisma.agencyUser.findFirst({
        where: { email: data.adminUser.email }
      });

      if (existingUser) {
        throw new Error('Admin user with this email already exists');
      }

      // Create agency
      const agency = await prisma.transportAgency.create({
        data: {
          name: data.name,
          contactName: data.contactName,
          phone: data.phone,
          email: data.email,
          address: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          serviceArea: data.serviceArea,
          operatingHours: data.operatingHours,
          capabilities: data.capabilities,
          pricingStructure: data.pricingStructure,
        }
      });

      // Hash admin user password
      const hashedPassword = await bcrypt.hash(data.adminUser.password, 12);

      // Create admin user
      const adminUser = await prisma.agencyUser.create({
        data: {
          agencyId: agency.id,
          email: data.adminUser.email,
          password: hashedPassword,
          name: data.adminUser.name,
          role: 'ADMIN',
          phone: data.adminUser.phone,
        }
      });

      // Create default agency profile
      await prisma.agencyProfile.create({
        data: {
          agencyId: agency.id,
          description: `Transport agency serving ${data.city}, ${data.state}`,
        }
      });

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: adminUser.id, 
          agencyId: agency.id, 
          role: adminUser.role,
          type: 'agency'
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

  async loginAgencyUser(email: string, password: string): Promise<{ user: AgencyUser; agency: TransportAgency; token: string }> {
    try {
      const user = await prisma.agencyUser.findFirst({
        where: { email, isActive: true },
        include: { agency: true }
      });

      if (!user) {
        throw new Error('Invalid credentials');
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      // Update last login
      await prisma.agencyUser.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      });

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          agencyId: user.agencyId, 
          role: user.role,
          type: 'agency'
        },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '24h' }
      );

      return { user, agency: user.agency, token };
    } catch (error) {
      console.error('Agency login error:', error);
      throw error;
    }
  }

  async getAgencyById(agencyId: string): Promise<TransportAgency | null> {
    try {
      return await prisma.transportAgency.findUnique({
        where: { id: agencyId },
        include: {
          agencyProfiles: true,
          serviceAreas: true,
          units: {
            include: {
              unitAvailability: true
            }
          }
        }
      });
    } catch (error) {
      console.error('Get agency error:', error);
      throw error;
    }
  }

  async updateAgencyProfile(agencyId: string, data: Partial<AgencyProfile>): Promise<AgencyProfile> {
    try {
      // Filter out problematic fields and handle JSON types
      const { id, createdAt, updatedAt, agencyId: _, ...restData } = data;
      
      // Convert JsonValue to proper Prisma JSON type
      const cleanData: any = {};
      Object.keys(restData).forEach(key => {
        const value = (restData as any)[key];
        if (value !== undefined) {
          cleanData[key] = value;
        }
      });
      
      return await prisma.agencyProfile.upsert({
        where: { agencyId },
        update: cleanData,
        create: {
          agencyId,
          ...cleanData
        }
      });
    } catch (error) {
      console.error('Update agency profile error:', error);
      throw error;
    }
  }

  // Agency User Management
  async createAgencyUser(agencyId: string, data: AgencyUserData): Promise<AgencyUser> {
    try {
      const hashedPassword = await bcrypt.hash(data.password, 12);

      return await prisma.agencyUser.create({
        data: {
          agencyId,
          email: data.email,
          password: hashedPassword,
          name: data.name,
          role: data.role || 'STAFF',
          phone: data.phone,
        }
      });
    } catch (error) {
      console.error('Create agency user error:', error);
      throw error;
    }
  }

  async getAgencyUsers(agencyId: string): Promise<Partial<AgencyUser>[]> {
    try {
      return await prisma.agencyUser.findMany({
        where: { agencyId, isActive: true },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          phone: true,
          lastLogin: true,
          createdAt: true
        }
      });
    } catch (error) {
      console.error('Get agency users error:', error);
      throw error;
    }
  }

  async updateAgencyUser(userId: string, data: Partial<AgencyUser>): Promise<AgencyUser> {
    try {
      if (data.password) {
        data.password = await bcrypt.hash(data.password, 12);
      }

      return await prisma.agencyUser.update({
        where: { id: userId },
        data
      });
    } catch (error) {
      console.error('Update agency user error:', error);
      throw error;
    }
  }

  // Unit Management
  async createUnit(agencyId: string, data: any): Promise<Unit> {
    try {
      const unit = await prisma.unit.create({
        data: {
          agencyId,
          ...data
        }
      });

      // Create initial unit availability record
      await prisma.unitAvailability.create({
        data: {
          unitId: unit.id,
          status: 'AVAILABLE'
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
      return await prisma.unit.findMany({
        where: { agencyId, isActive: true },
        include: {
          unitAvailability: true,
          unitAssignments: {
            where: { status: 'ACTIVE' },
            include: { transportRequest: true }
          }
        }
      });
    } catch (error) {
      console.error('Get agency units error:', error);
      throw error;
    }
  }

  async updateUnitAvailability(unitId: string, data: UnitAvailabilityData): Promise<UnitAvailability> {
    try {
      // First try to find existing availability record
      const existing = await prisma.unitAvailability.findFirst({
        where: { unitId }
      });

      if (existing) {
        // Update existing record
        return await prisma.unitAvailability.update({
          where: { id: existing.id },
          data: {
            ...data,
            lastUpdated: new Date()
          }
        });
      } else {
        // Create new record
        return await prisma.unitAvailability.create({
          data: {
            ...data
          }
        });
      }
    } catch (error) {
      console.error('Update unit availability error:', error);
      throw error;
    }
  }

  // Service Area Management
  async createServiceArea(agencyId: string, data: ServiceAreaData): Promise<ServiceArea> {
    try {
      return await prisma.serviceArea.create({
        data: {
          agencyId,
          ...data
        }
      });
    } catch (error) {
      console.error('Create service area error:', error);
      throw error;
    }
  }

  async getAgencyServiceAreas(agencyId: string): Promise<ServiceArea[]> {
    try {
      return await prisma.serviceArea.findMany({
        where: { agencyId, isActive: true }
      });
    } catch (error) {
      console.error('Get service areas error:', error);
      throw error;
    }
  }

  // Performance Tracking
  async getAgencyPerformance(agencyId: string, periodStart: Date, periodEnd: Date): Promise<AgencyPerformance | null> {
    try {
      return await prisma.agencyPerformance.findFirst({
        where: {
          agencyId,
          periodStart,
          periodEnd
        }
      });
    } catch (error) {
      console.error('Get agency performance error:', error);
      throw error;
    }
  }

  async updateAgencyPerformance(agencyId: string, data: Partial<AgencyPerformance>): Promise<AgencyPerformance> {
    try {
      if (!data.periodStart || !data.periodEnd) {
        throw new Error('Period start and end dates are required');
      }

      // First try to find existing performance record
      const existing = await prisma.agencyPerformance.findFirst({
        where: {
          agencyId,
          periodStart: data.periodStart,
          periodEnd: data.periodEnd
        }
      });

      if (existing) {
        // Update existing record
        const { id, createdAt, updatedAt, agencyId: _, ...cleanData } = data;
        return await prisma.agencyPerformance.update({
          where: { id: existing.id },
          data: cleanData
        });
      } else {
        // Create new record
        const { id, createdAt, updatedAt, ...cleanData } = data;
        return await prisma.agencyPerformance.create({
          data: {
            agencyId,
            periodStart: data.periodStart!,
            periodEnd: data.periodEnd!,
            ...cleanData
          }
        });
      }
    } catch (error) {
      console.error('Update agency performance error:', error);
      throw error;
    }
  }

  // Utility Methods
  async validateAgencyAccess(userId: string, agencyId: string): Promise<boolean> {
    try {
      const user = await prisma.agencyUser.findFirst({
        where: { id: userId, agencyId, isActive: true }
      });
      return !!user;
    } catch (error) {
      console.error('Validate agency access error:', error);
      return false;
    }
  }

  async getAgencyStats(agencyId: string): Promise<any> {
    try {
      const [totalUnits, availableUnits, totalTransports, completedTransports] = await Promise.all([
        prisma.unit.count({ where: { agencyId, isActive: true } }),
        prisma.unitAvailability.count({ 
          where: { 
            unit: { agencyId, isActive: true },
            status: 'AVAILABLE'
          }
        }),
        prisma.transportRequest.count({ where: { assignedAgencyId: agencyId } }),
        prisma.transportRequest.count({ 
          where: { 
            assignedAgencyId: agencyId,
            status: 'COMPLETED'
          }
        })
      ]);

      return {
        totalUnits,
        availableUnits,
        totalTransports,
        completedTransports,
        completionRate: totalTransports > 0 ? (completedTransports / totalTransports) * 100 : 0
      };
    } catch (error) {
      console.error('Get agency stats error:', error);
      throw error;
    }
  }
}

export default new AgencyService();
