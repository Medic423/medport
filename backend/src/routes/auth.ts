import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authenticateToken } from '../middleware/auth';
import { AuthService } from '../services/authService';
import { UserService } from '../services/userService';
import { databaseManager } from '../services/databaseManager';

const router = Router();

// User registration
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name, role } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // All user accounts stored in Center DB
    const centerDB = databaseManager.getCenterDB();

    // Check if user already exists
    const existingUser = await centerDB.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await centerDB.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || 'COORDINATOR',
        userType: 'CENTER' // Default to CENTER for new users
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    // Return user data (without password) and token
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({
      message: 'User created successfully',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('[MedPort] Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// User login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // All user authentication handled by Center DB
    const centerDB = databaseManager.getCenterDB();

    // Find user
    const user = await centerDB.user.findUnique({
      where: { email }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    // Return user data (without password) and token
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('[MedPort] Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user profile (protected route)
router.get('/profile', authenticateToken, async (req: any, res: Response) => {
  try {
    // All user data in Center DB
    const centerDB = databaseManager.getCenterDB();
    const user = await centerDB.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('[MedPort] Profile fetch error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user profile (protected route)
router.put('/profile', authenticateToken, async (req: any, res: Response) => {
  try {
    const { name } = req.body;

    // All user data in Center DB
    const centerDB = databaseManager.getCenterDB();
    const updatedUser = await centerDB.user.update({
      where: { id: req.user.id },
      data: { name },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('[MedPort] Profile update error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Refresh access token
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ 
        message: 'Refresh token is required' 
      });
    }

    const result = await AuthService.refreshToken(refreshToken);

    res.json({
      message: 'Token refreshed successfully',
      ...result
    });
  } catch (error: any) {
    console.error('[MedPort] Token refresh error:', error);
    res.status(401).json({ 
      message: error.message || 'Token refresh failed' 
    });
  }
});

// Change password (protected route)
router.put('/change-password', authenticateToken, async (req: any, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        message: 'Current and new password are required' 
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ 
        message: 'New password must be at least 8 characters long' 
      });
    }

    const result = await AuthService.changePassword(
      req.user.id, 
      currentPassword, 
      newPassword
    );

    res.json(result);
  } catch (error: any) {
    console.error('[MedPort] Password change error:', error);
    res.status(400).json({ 
      message: error.message || 'Password change failed' 
    });
  }
});

// Admin routes
router.get('/users', authenticateToken, async (req: any, res: Response) => {
  try {
    const { page = 1, limit = 20, role, isActive, search } = req.query;
    const result = await UserService.getUsers(
      { role, isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined, search },
      parseInt(page as string),
      parseInt(limit as string)
    );
    res.json(result);
  } catch (error: any) {
    console.error('[MedPort] Get users error:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to get users' 
    });
  }
});

router.post('/users', authenticateToken, async (req: any, res: Response) => {
  try {
    const { email, password, name, role } = req.body;
    const user = await UserService.createUser(
      { email, password, name, role },
      req.user.id
    );
    res.status(201).json({ 
      message: 'User created successfully',
      user 
    });
  } catch (error: any) {
    console.error('[MedPort] Create user error:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to create user' 
    });
  }
});

router.put('/users/:id', authenticateToken, async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, role, isActive } = req.body;
    const user = await UserService.updateUser(
      id,
      { name, email, role, isActive },
      req.user.id
    );
    res.json({ 
      message: 'User updated successfully',
      user 
    });
  } catch (error: any) {
    console.error('[MedPort] Update user error:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to update user' 
    });
  }
});

router.delete('/users/:id', authenticateToken, async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const result = await UserService.deleteUser(id, req.user.id);
    res.json(result);
  } catch (error: any) {
    console.error('[MedPort] Password change error:', error);
    res.status(400).json({ 
      message: error.message || 'Failed to delete user' 
    });
  }
});

router.get('/users/stats', authenticateToken, async (req: any, res: Response) => {
  try {
    const stats = await UserService.getUserStats();
    res.json(stats);
  } catch (error: any) {
    console.error('[MedPort] Get user stats error:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to get user stats' 
    });
  }
});

// Demo login for development and testing
router.post('/demo/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    console.log('[AUTH-DEMO-LOGIN] Demo login attempt:', { email });

    // Check if this is a developer demo credential
    if (email === 'developer@medport-transport.com' && password === 'dev123') {
      console.log('[AUTH-DEMO-LOGIN] Developer credentials detected, creating developer session');
      
      // Create developer user data with full permissions
      const developerUser = {
        id: 'developer-001',
        name: 'System Developer',
        email: 'developer@medport-transport.com',
        role: 'ADMIN',
        permissions: [
          'user:create', 'user:read', 'user:update', 'user:delete',
          'facility:manage', 'agency:manage', 'route:optimize',
          'system:admin', 'settings:full', 'module:all', 'role:manage',
          'system:configure', 'analytics:full', 'financial:full', 'dispatch:full', 'tracking:full',
          'transport:read', 'transport:create', 'transport:update', 'transport:delete',
          'unit:assign', 'unit:manage', 'unit:read',
          'route:view', 'notifications:manage',
          'analytics:view', 'analytics:financial',
          'facility:read', 'agency:read',
          'agency:profile', 'bid:manage', 'bid:read'
        ]
      };

      // Generate demo token with permissions
      const token = jwt.sign(
        { 
          id: developerUser.id, 
          email: developerUser.email, 
          role: developerUser.role,
          permissions: developerUser.permissions,
          isDemo: true,
          isDeveloper: true
        },
        process.env.JWT_SECRET!,
        { expiresIn: '24h' }
      );

      console.log('[AUTH-DEMO-LOGIN] Developer login successful');

      return res.json({
        success: true,
        message: 'Developer demo login successful',
        data: {
          user: developerUser,
          token: token
        }
      });
    }

    // Check if this is a regular demo credential
    if (email === 'coordinator@medport-transport.com' && password === 'demo123') {
      console.log('[AUTH-DEMO-LOGIN] Coordinator demo credentials detected');
      
      // Create coordinator user data
      const coordinatorUser = {
        id: 'demo-coordinator-001',
        name: 'Demo Transport Coordinator',
        email: 'coordinator@medport-transport.com',
        role: 'COORDINATOR'
      };

      // Generate demo token
      const token = jwt.sign(
        { 
          id: coordinatorUser.id, 
          email: coordinatorUser.email, 
          role: coordinatorUser.role,
          isDemo: true
        },
        process.env.JWT_SECRET!,
        { expiresIn: '24h' }
      );

      console.log('[AUTH-DEMO-LOGIN] Coordinator demo login successful');

      return res.json({
        success: true,
        message: 'Coordinator demo login successful',
        data: {
          user: coordinatorUser,
          token: token
        }
      });
    }

    // Check if this is a billing staff demo credential
    if (email === 'billing@medport.com' && password === 'demo123') {
      console.log('[AUTH-DEMO-LOGIN] Billing staff demo credentials detected');
      
      // Create billing staff user data
      const billingUser = {
        id: 'demo-billing-001',
        name: 'Demo Billing Staff',
        email: 'billing@medport.com',
        role: 'BILLING_STAFF'
      };

      // Generate demo token
      const token = jwt.sign(
        { 
          id: billingUser.id, 
          email: billingUser.email, 
          role: billingUser.role,
          isDemo: true
        },
        process.env.JWT_SECRET!,
        { expiresIn: '24h' }
      );

      console.log('[AUTH-DEMO-LOGIN] Billing staff demo login successful');

      return res.json({
        success: true,
        message: 'Billing staff demo login successful',
        data: {
          user: billingUser,
          token: token
        }
      });
    }

    // If no demo credentials match, return error
    return res.status(401).json({
      success: false,
      message: 'Invalid demo credentials'
    });

  } catch (error) {
    console.error('[AUTH-DEMO-LOGIN] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
