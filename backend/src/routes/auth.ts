import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole } from '../middleware/auth';
import { AuthService } from '../services/authService';
import { UserService } from '../services/userService';

const router = Router();
const prisma = new PrismaClient();

// User registration
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name, role } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || 'USER'
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

    // Find user
    const user = await prisma.user.findUnique({
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
    const user = await prisma.user.findUnique({
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

    const updatedUser = await prisma.user.update({
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
router.get('/users', authenticateToken, requireRole(['ADMIN']), async (req: any, res: Response) => {
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

router.post('/users', authenticateToken, requireRole(['ADMIN']), async (req: any, res: Response) => {
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

router.put('/users/:id', authenticateToken, requireRole(['ADMIN']), async (req: any, res: Response) => {
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

router.delete('/users/:id', authenticateToken, requireRole(['ADMIN']), async (req: any, res: Response) => {
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

router.get('/users/stats', authenticateToken, requireRole(['ADMIN']), async (req: any, res: Response) => {
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

export default router;
