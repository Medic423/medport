import { PrismaClient, TransportAgency, ServiceStatus } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
export const addServiceSchema = z.object({
  name: z.string().min(1, 'Service name is required'),
  contactName: z.string().optional(),
  phone: z.string().min(1, 'Phone number is required'),
  email: z.string().email('Valid email is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(1, 'ZIP code is required'),
  serviceArea: z.any().optional(),
  operatingHours: z.any().optional(),
  capabilities: z.any().optional(),
  pricingStructure: z.any().optional()
});

export const updateServiceSchema = z.object({
  name: z.string().min(1, 'Service name is required').optional(),
  contactName: z.string().optional(),
  phone: z.string().min(1, 'Phone number is required').optional(),
  email: z.string().email('Valid email is required').optional(),
  address: z.string().min(1, 'Address is required').optional(),
  city: z.string().min(1, 'City is required').optional(),
  state: z.string().min(1, 'State is required').optional(),
  zipCode: z.string().min(1, 'ZIP code is required').optional(),
  serviceArea: z.any().optional(),
  operatingHours: z.any().optional(),
  capabilities: z.any().optional(),
  pricingStructure: z.any().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING']).optional()
});

export interface AddServiceData {
  name: string;
  contactName?: string;
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
}

export interface UpdateServiceData {
  name?: string;
  contactName?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  serviceArea?: any;
  operatingHours?: any;
  capabilities?: any;
  pricingStructure?: any;
  status?: ServiceStatus;
}

export class TransportCenterService {
  // Add new EMS service (Transport Center only)
  async addService(data: AddServiceData, addedByUserId: string): Promise<TransportAgency> {
    try {
      // Check if service with same email already exists
      const existingService = await prisma.transportAgency.findFirst({
        where: { email: data.email }
      });

      if (existingService) {
        throw new Error('A service with this email already exists');
      }

      // Create new service
      const service = await prisma.transportAgency.create({
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
          addedBy: addedByUserId,
          status: 'ACTIVE',
          addedAt: new Date()
        },
        include: {
          addedByUser: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      return service;
    } catch (error) {
      console.error('Error adding service:', error);
      throw error;
    }
  }

  // Get all services (Transport Center only)
  async getAllServices(): Promise<TransportAgency[]> {
    try {
      const services = await prisma.transportAgency.findMany({
        include: {
          addedByUser: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          units: {
            where: { isActive: true },
            select: {
              id: true,
              unitNumber: true,
              type: true,
              currentStatus: true
            }
          },
          serviceAreas: {
            where: { isActive: true },
            select: {
              id: true,
              name: true,
              description: true
            }
          }
        },
        orderBy: [
          { status: 'asc' },
          { name: 'asc' }
        ]
      });

      return services;
    } catch (error) {
      console.error('Error getting all services:', error);
      throw error;
    }
  }

  // Get service by ID
  async getServiceById(serviceId: string): Promise<TransportAgency | null> {
    try {
      const service = await prisma.transportAgency.findUnique({
        where: { id: serviceId },
        include: {
          addedByUser: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          units: {
            where: { isActive: true },
            include: {
              unitAvailability: true
            }
          },
          serviceAreas: {
            where: { isActive: true }
          },
          agencyProfiles: true
        }
      });

      return service;
    } catch (error) {
      console.error('Error getting service by ID:', error);
      throw error;
    }
  }

  // Update service details
  async updateService(serviceId: string, data: UpdateServiceData): Promise<TransportAgency> {
    try {
      // Check if service exists
      const existingService = await prisma.transportAgency.findUnique({
        where: { id: serviceId }
      });

      if (!existingService) {
        throw new Error('Service not found');
      }

      // If email is being updated, check for duplicates
      if (data.email && data.email !== existingService.email) {
        const duplicateService = await prisma.transportAgency.findFirst({
          where: { 
            email: data.email,
            id: { not: serviceId }
          }
        });

        if (duplicateService) {
          throw new Error('A service with this email already exists');
        }
      }

      // Update service
      const updatedService = await prisma.transportAgency.update({
        where: { id: serviceId },
        data: {
          ...data,
          updatedAt: new Date()
        },
        include: {
          addedByUser: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      return updatedService;
    } catch (error) {
      console.error('Error updating service:', error);
      throw error;
    }
  }

  // Disable service (soft delete)
  async disableService(serviceId: string): Promise<TransportAgency> {
    try {
      const service = await prisma.transportAgency.update({
        where: { id: serviceId },
        data: {
          status: 'INACTIVE',
          isActive: false,
          updatedAt: new Date()
        },
        include: {
          addedByUser: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      return service;
    } catch (error) {
      console.error('Error disabling service:', error);
      throw error;
    }
  }

  // Enable service
  async enableService(serviceId: string): Promise<TransportAgency> {
    try {
      const service = await prisma.transportAgency.update({
        where: { id: serviceId },
        data: {
          status: 'ACTIVE',
          isActive: true,
          updatedAt: new Date()
        },
        include: {
          addedByUser: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      return service;
    } catch (error) {
      console.error('Error enabling service:', error);
      throw error;
    }
  }

  // Get services added by specific Transport Center user
  async getServicesAddedByUser(userId: string): Promise<TransportAgency[]> {
    try {
      const services = await prisma.transportAgency.findMany({
        where: { addedBy: userId },
        include: {
          addedByUser: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: [
          { status: 'asc' },
          { name: 'asc' }
        ]
      });

      return services;
    } catch (error) {
      console.error('Error getting services added by user:', error);
      throw error;
    }
  }

  // Get service statistics
  async getServiceStats(): Promise<{
    totalServices: number;
    activeServices: number;
    inactiveServices: number;
    pendingServices: number;
    servicesAddedThisMonth: number;
  }> {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const [
        totalServices,
        activeServices,
        inactiveServices,
        pendingServices,
        servicesAddedThisMonth
      ] = await Promise.all([
        prisma.transportAgency.count(),
        prisma.transportAgency.count({ where: { status: 'ACTIVE' } }),
        prisma.transportAgency.count({ where: { status: 'INACTIVE' } }),
        prisma.transportAgency.count({ where: { status: 'PENDING' } }),
        prisma.transportAgency.count({
          where: {
            addedAt: {
              gte: startOfMonth
            }
          }
        })
      ]);

      return {
        totalServices,
        activeServices,
        inactiveServices,
        pendingServices,
        servicesAddedThisMonth
      };
    } catch (error) {
      console.error('Error getting service stats:', error);
      throw error;
    }
  }
}

export default new TransportCenterService();
