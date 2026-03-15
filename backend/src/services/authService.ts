import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserType } from '@prisma/client';
import { databaseManager } from './databaseManager';

export interface User {
  id: string;
  email: string;
  name: string;
  userType: UserType;
  organizationId?: string;
  orgAdmin?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
  mustChangePassword?: boolean;
}

export class AuthService {
  private jwtSecret: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
  }

  async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      const { email, password } = credentials;
      const db = databaseManager.getPrismaClient();

      if (!db) {
        return { success: false, error: 'Database connection unavailable. Please contact support.' };
      }

      const foundUser = await db.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          password: true,
          name: true,
          userType: true,
          organizationId: true,
          isActive: true,
          isDeleted: true,
          mustChangePassword: true,
          userRoles: { select: { role: { select: { name: true } } } },
        }
      });

      if (!foundUser) {
        return { success: false, error: 'No account found with this email address. Please check your email or contact support.' };
      }

      if (foundUser.isDeleted) {
        return { success: false, error: 'This account has been deleted. Please contact support if you believe this is an error.' };
      }

      if (!foundUser.isActive) {
        return { success: false, error: 'This account has been deactivated. Please contact support to reactivate your account.' };
      }

      const isValidPassword = await bcrypt.compare(password, foundUser.password);
      if (!isValidPassword) {
        return { success: false, error: 'Incorrect password. Please check your password and try again.' };
      }

      // Update login timestamps
      try {
        const now = new Date();
        await db.user.update({ where: { id: foundUser.id }, data: { lastLogin: now, lastActivity: now } });
      } catch (err) {
        console.error('Error updating lastLogin/lastActivity:', err);
      }

      const token = jwt.sign(
        { id: foundUser.id, email: foundUser.email, userType: foundUser.userType, organizationId: foundUser.organizationId },
        this.jwtSecret,
        { expiresIn: '24h' }
      );

      const isOrgAdmin = foundUser.userRoles.some((ur: any) => ur.role?.name === 'ADMIN');

      const userData: User = {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        userType: foundUser.userType,
        organizationId: foundUser.organizationId ?? undefined,
        orgAdmin: isOrgAdmin,
      };

      return { success: true, user: userData, token, mustChangePassword: foundUser.mustChangePassword };
    } catch (error) {
      console.error('AuthService.login error:', error);
      return { success: false, error: 'Internal server error' };
    }
  }

  async verifyToken(token: string): Promise<User | null> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as any;

      if (!Object.values(UserType).includes(decoded.userType)) {
        return null;
      }

      const db = databaseManager.getPrismaClient();
      const user = await db.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, email: true, name: true, userType: true, organizationId: true, isActive: true, isDeleted: true }
      });

      if (!user || !user.isActive || user.isDeleted) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.userType,
        organizationId: user.organizationId ?? undefined,
      };
    } catch (error) {
      console.error('Token verification error:', error);
      return null;
    }
  }

  async createUser(userData: {
    email: string;
    password: string;
    name: string;
    userType: UserType;
    organizationId?: string;
    mustChangePassword?: boolean;
  }): Promise<User> {
    const db = databaseManager.getPrismaClient();
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    const user = await db.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
        userType: userData.userType,
        organizationId: userData.organizationId ?? null,
        mustChangePassword: userData.mustChangePassword ?? false,
      }
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      userType: user.userType,
      organizationId: user.organizationId ?? undefined,
    };
  }

  async createAdminUser(userData: { email: string; password: string; name: string }): Promise<User> {
    return this.createUser({ ...userData, userType: UserType.SYSTEM_ADMIN });
  }

  async createRegularUser(userData: { email: string; password: string; name: string }): Promise<User> {
    return this.createUser({ ...userData, userType: UserType.SYSTEM_ADMIN });
  }

  private validatePasswordStrength(password: string): string | null {
    if (typeof password !== 'string' || password.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(password)) return 'Password must include at least one uppercase letter';
    if (!/[a-z]/.test(password)) return 'Password must include at least one lowercase letter';
    if (!/[0-9]/.test(password)) return 'Password must include at least one number';
    return null;
  }

  async changePassword(params: {
    email: string;
    currentPassword: string;
    newPassword: string;
  }): Promise<{ success: boolean; error?: string }> {
    const { email, currentPassword, newPassword } = params;

    const validationError = this.validatePasswordStrength(newPassword);
    if (validationError) return { success: false, error: validationError };

    const db = databaseManager.getPrismaClient();
    const user = await db.user.findFirst({ where: { email, isDeleted: false } });

    if (!user || !user.isActive) return { success: false, error: 'Account not found or inactive' };

    const isCurrentValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentValid) return { success: false, error: 'Current password is incorrect' };

    const hashed = await bcrypt.hash(newPassword, 12);
    try {
      await db.user.update({ where: { email }, data: { password: hashed, mustChangePassword: false } });
    } catch (err) {
      console.error('changePassword update error:', err);
      return { success: false, error: 'Failed to update password' };
    }

    return { success: true };
  }
}

export const authService = new AuthService();
export default authService;
