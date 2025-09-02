import { PrismaClient as HospitalPrismaClient } from '../../dist/prisma/hospital';
import { PrismaClient as EMSPrismaClient } from '../../dist/prisma/ems';
import { PrismaClient as CenterPrismaClient } from '../../dist/prisma/center';

/**
 * DatabaseManager - Manages connections to three siloed databases
 * 
 * Architecture:
 * - Hospital DB (Port 5432): Contains all trips, hospital users, facilities
 * - EMS DB (Port 5433): Contains EMS agencies, units, bids, routes
 * - Center DB (Port 5434): Contains ALL user accounts, system config, analytics
 */
export class DatabaseManager {
  private hospitalDB: HospitalPrismaClient;
  private emsDB: EMSPrismaClient;
  private centerDB: CenterPrismaClient;
  private static instance: DatabaseManager;

  private constructor() {
    // Initialize Hospital Database (Port 5432)
    this.hospitalDB = new HospitalPrismaClient({
      datasources: {
        db: {
          url: process.env.HOSPITAL_DATABASE_URL || 'postgresql://postgres:password@localhost:5432/medport_hospital'
        }
      }
    });

    // Initialize EMS Database (Port 5433)
    this.emsDB = new EMSPrismaClient({
      datasources: {
        db: {
          url: process.env.EMS_DATABASE_URL || 'postgresql://postgres:password@localhost:5433/medport_ems'
        }
      }
    });

    // Initialize Center Database (Port 5434)
    this.centerDB = new CenterPrismaClient({
      datasources: {
        db: {
          url: process.env.CENTER_DATABASE_URL || 'postgresql://postgres:password@localhost:5434/medport_center'
        }
      }
    });
  }

  /**
   * Singleton pattern to ensure single instance
   */
  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  /**
   * Get database based on user type
   */
  public getDatabase(userType: 'hospital' | 'ems' | 'center'): HospitalPrismaClient | EMSPrismaClient | CenterPrismaClient {
    switch (userType) {
      case 'hospital': return this.hospitalDB;
      case 'ems': return this.emsDB;
      case 'center': return this.centerDB;
      default: throw new Error(`Invalid user type: ${userType}`);
    }
  }

  /**
   * Get Hospital Database - Contains all trips, hospital users, facilities
   */
  public getHospitalDB(): HospitalPrismaClient {
    return this.hospitalDB;
  }

  /**
   * Get EMS Database - Contains EMS agencies, units, bids, routes
   */
  public getEMSDB(): EMSPrismaClient {
    return this.emsDB;
  }

  /**
   * Get Center Database - Contains ALL user accounts, system config, analytics
   */
  public getCenterDB(): CenterPrismaClient {
    return this.centerDB;
  }

  /**
   * Cross-database operations
   */

  /**
   * Hospital needs to see EMS agencies (from Center DB)
   */
  public async getAvailableAgencies() {
    return this.centerDB.eMSAgency.findMany({ 
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        contactName: true,
        phone: true,
        email: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        serviceArea: true,
        operatingHours: true,
        capabilities: true,
        pricingStructure: true,
        isActive: true,
        status: true
      }
    });
  }

  /**
   * Transport Center needs to see all trips (from Hospital DB)
   */
  public async getAllTrips() {
    return this.hospitalDB.transportRequest.findMany({
      include: { 
        originFacility: true, 
        destinationFacility: true,
        hospitalUser: true
      }
    });
  }

  /**
   * EMS agencies need to see all available trips (from Hospital DB)
   */
  public async getAvailableTrips(agencyId?: string) {
    return this.hospitalDB.transportRequest.findMany({
      where: { status: 'PENDING' },
      include: { 
        originFacility: true, 
        destinationFacility: true,
        hospitalUser: true
      }
    });
  }

  /**
   * All user authentication handled by Center DB
   */
  public async authenticateUser(email: string, password: string) {
    const user = await this.centerDB.user.findUnique({
      where: { email },
      include: { 
        hospital: true, 
        agency: true 
      }
    });
    
    if (user) {
      // Route to appropriate database based on userType
      switch (user.userType) {
        case 'HOSPITAL':
          return { user, database: 'hospital' };
        case 'EMS':
          return { user, database: 'ems' };
        case 'CENTER':
          return { user, database: 'center' };
      }
    }
    return null;
  }

  /**
   * Health check for all databases
   */
  public async healthCheck() {
    const results = {
      hospital: false,
      ems: false,
      center: false
    };

    try {
      await this.hospitalDB.$queryRaw`SELECT 1`;
      results.hospital = true;
    } catch (error) {
      console.error('Hospital DB health check failed:', error);
    }

    try {
      await this.emsDB.$queryRaw`SELECT 1`;
      results.ems = true;
    } catch (error) {
      console.error('EMS DB health check failed:', error);
    }

    try {
      await this.centerDB.$queryRaw`SELECT 1`;
      results.center = true;
    } catch (error) {
      console.error('Center DB health check failed:', error);
    }

    return results;
  }

  /**
   * Graceful shutdown of all database connections
   */
  public async disconnect() {
    await Promise.all([
      this.hospitalDB.$disconnect(),
      this.emsDB.$disconnect(),
      this.centerDB.$disconnect()
    ]);
  }
}

// Export singleton instance
export const databaseManager = DatabaseManager.getInstance();

