import { databaseManager } from './databaseManager';
import { eventBus } from './eventBus';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

/**
 * Siloed Authentication Service
 * 
 * Handles authentication across the three-database architecture
 * with centralized user management in the Center DB.
 */
export class SiloedAuthService {
  private static instance: SiloedAuthService;

  private constructor() {}

  public static getInstance(): SiloedAuthService {
    if (!SiloedAuthService.instance) {
      SiloedAuthService.instance = new SiloedAuthService();
    }
    return SiloedAuthService.instance;
  }

  /**
   * Authenticate user across siloed databases
   */
  async authenticateUser(email: string, password: string) {
    try {
      // All authentication handled by Center DB
      const centerDB = databaseManager.getCenterDB();
      
      const user = await centerDB.user.findUnique({
        where: { email },
        include: {
          hospital: true,
          agency: true
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new Error('Invalid password');
      }

      if (!user.isActive) {
        throw new Error('User account is inactive');
      }

      // Generate JWT token with user type information
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          userType: user.userType,
          hospitalId: user.hospitalId,
          agencyId: user.agencyId,
          name: user.name
        },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '24h' }
      );

      // Emit user authentication event
      eventBus.emitUserUpdated({
        userId: user.id,
        userType: user.userType,
        changes: { lastLogin: new Date() }
      });

      return {
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          userType: user.userType,
          hospitalId: user.hospitalId,
          agencyId: user.agencyId,
          hospital: user.hospital,
          agency: user.agency
        }
      };

    } catch (error) {
      console.error('[SiloedAuth] Authentication error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create new user account (all user types)
   */
  async createUser(userData: {
    email: string;
    password: string;
    name: string;
    userType: 'HOSPITAL' | 'EMS' | 'CENTER';
    hospitalId?: string;
    agencyId?: string;
  }) {
    try {
      const centerDB = databaseManager.getCenterDB();
      
      // Check if user already exists
      const existingUser = await centerDB.user.findUnique({
        where: { email: userData.email }
      });

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Create user in Center DB
      const user = await centerDB.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          name: userData.name,
          userType: userData.userType,
          hospitalId: userData.hospitalId,
          agencyId: userData.agencyId,
          isActive: true
        },
        include: {
          hospital: true,
          agency: true
        }
      });

      // Create user-specific record in appropriate database
      await this.createUserSpecificRecord(user);

      // Emit user creation event
      eventBus.emitUserCreated({
        userId: user.id,
        userType: user.userType,
        email: user.email,
        name: user.name
      });

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          userType: user.userType,
          hospitalId: user.hospitalId,
          agencyId: user.agencyId
        }
      };

    } catch (error) {
      console.error('[SiloedAuth] User creation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create user-specific record in appropriate database
   */
  private async createUserSpecificRecord(user: any) {
    switch (user.userType) {
      case 'HOSPITAL':
        await this.createHospitalUser(user);
        break;
      case 'EMS':
        // EMS users don't need separate records in EMS DB
        // They're managed through the agency relationship
        break;
      case 'CENTER':
        // Center users don't need separate records
        break;
    }
  }

  /**
   * Create hospital user record
   */
  private async createHospitalUser(user: any) {
    const hospitalDB = databaseManager.getHospitalDB();
    
    await hospitalDB.hospitalUser.create({
      data: {
        id: user.id,
        email: user.email,
        password: user.password,
        name: user.name,
        hospitalName: user.hospital?.name || 'Unknown Hospital',
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  }

  /**
   * Get user by ID with cross-database information
   */
  async getUserById(userId: string) {
    try {
      const centerDB = databaseManager.getCenterDB();
      
      const user = await centerDB.user.findUnique({
        where: { id: userId },
        include: {
          hospital: true,
          agency: true
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          userType: user.userType,
          hospitalId: user.hospitalId,
          agencyId: user.agencyId,
          hospital: user.hospital,
          agency: user.agency,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      };

    } catch (error) {
      console.error('[SiloedAuth] Get user error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update user information
   */
  async updateUser(userId: string, updateData: {
    name?: string;
    email?: string;
    isActive?: boolean;
  }) {
    try {
      const centerDB = databaseManager.getCenterDB();
      
      const user = await centerDB.user.update({
        where: { id: userId },
        data: updateData,
        include: {
          hospital: true,
          agency: true
        }
      });

      // Update user-specific record if needed
      if (user.userType === 'HOSPITAL') {
        const hospitalDB = databaseManager.getHospitalDB();
        await hospitalDB.hospitalUser.update({
          where: { id: userId },
          data: {
            name: updateData.name,
            email: updateData.email,
            isActive: updateData.isActive
          }
        });
      }

      // Emit user update event
      eventBus.emitUserUpdated({
        userId: user.id,
        userType: user.userType,
        changes: updateData
      });

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          userType: user.userType,
          hospitalId: user.hospitalId,
          agencyId: user.agencyId,
          isActive: user.isActive
        }
      };

    } catch (error) {
      console.error('[SiloedAuth] Update user error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Verify JWT token and get user information
   */
  async verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
      
      const result = await this.getUserById(decoded.userId);
      if (!result.success) {
        throw new Error('User not found');
      }

      return {
        success: true,
        user: result.user,
        decoded
      };

    } catch (error) {
      console.error('[SiloedAuth] Token verification error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get appropriate database for user type
   */
  getDatabaseForUser(userType: string) {
    return databaseManager.getDatabase(userType.toLowerCase() as 'hospital' | 'ems' | 'center');
  }

  /**
   * Cross-database access methods
   */

  /**
   * Get available EMS agencies for hospital users
   */
  async getAvailableAgencies() {
    return databaseManager.getAvailableAgencies();
  }

  /**
   * Get all trips for transport center users
   */
  async getAllTrips() {
    return databaseManager.getAllTrips();
  }

  /**
   * Get available trips for EMS users
   */
  async getAvailableTrips(agencyId?: string) {
    return databaseManager.getAvailableTrips(agencyId);
  }
}

// Export singleton instance
export const siloedAuthService = SiloedAuthService.getInstance();

