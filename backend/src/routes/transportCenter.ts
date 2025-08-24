import express from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authenticateToken } from '../middleware/auth';

const prisma = new PrismaClient();

const router = express.Router();

// Validation schemas
const coordinatorRegistrationSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  role: z.enum(['ADMIN', 'COORDINATOR']).default('COORDINATOR'),
  permissions: z.array(z.string()).optional()
});

const coordinatorLoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

// Transport Center Coordinator Registration (Protected - only admins can create coordinators)
router.post('/register', authenticateToken, async (req: any, res) => {
  try {
    // Check if user has permission to create coordinators
    if (!['ADMIN'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to create coordinators'
      });
    }

    console.log('[TRANSPORT-CENTER-REGISTER] Registration attempt:', { email: req.body.email, name: req.body.name });
    
    const validatedData = coordinatorRegistrationSchema.parse(req.body);
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(validatedData.password, saltRounds);

    // Create coordinator user
    const coordinator = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name,
        role: validatedData.role,
        isActive: true,


      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: coordinator.id, 
        email: coordinator.email, 
        role: coordinator.role,
        isTransportCenter: true
      },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    console.log('[TRANSPORT-CENTER-REGISTER] Success:', { coordinatorId: coordinator.id });

    res.status(201).json({
      success: true,
      message: 'Transport Center coordinator created successfully',
      data: {
        coordinator: {
          id: coordinator.id,
          name: coordinator.name,
          email: coordinator.email,
          role: coordinator.role
        },
        token: token
      }
    });
  } catch (error) {
    console.error('[TRANSPORT-CENTER-REGISTER] Error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: (error as any).errors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Transport Center Coordinator Login
router.post('/login', async (req, res) => {
  try {
    console.log('[TRANSPORT-CENTER-LOGIN] Login attempt:', { email: req.body.email });
    
    const validatedData = coordinatorLoginSchema.parse(req.body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is a transport center coordinator
    if (!['ADMIN', 'COORDINATOR'].includes(user.role)) {
      return res.status(401).json({
        success: false,
        message: 'User is not authorized for Transport Center access'
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(validatedData.password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        isTransportCenter: true
      },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    console.log('[TRANSPORT-CENTER-LOGIN] Success:', { userId: user.id, role: user.role });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token: token
      }
    });
  } catch (error) {
    console.error('[TRANSPORT-CENTER-LOGIN] Error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: (error as any).errors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Demo Transport Center Login
router.post('/demo/login', async (req, res) => {
  try {
    console.log('[TRANSPORT-CENTER-DEMO-LOGIN] Demo login attempt');
    
    // Create demo coordinator data
    const demoCoordinator = {
      id: 'demo-coordinator-001',
      name: 'Demo Transport Coordinator',
      email: 'coordinator@medport-transport.com',
      role: 'COORDINATOR'
    };

    // Generate demo token
    const token = jwt.sign(
      { 
        id: demoCoordinator.id, 
        email: demoCoordinator.email, 
        role: demoCoordinator.role,
        isTransportCenter: true,
        isDemo: true
      },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    console.log('[TRANSPORT-CENTER-DEMO-LOGIN] Success');

    res.json({
      success: true,
      message: 'Demo login successful',
      data: {
        user: demoCoordinator,
        token: token
      }
    });
  } catch (error) {
    console.error('[TRANSPORT-CENTER-DEMO-LOGIN] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get Transport Center dashboard data (Protected)
router.get('/dashboard', authenticateToken, async (req: any, res) => {
  try {
    // Check if user is a transport center coordinator
    if (!['ADMIN', 'COORDINATOR'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    // Get system overview data
    const [
      totalTransports,
      pendingTransports,
      activeUnits,
      totalAgencies,
      totalHospitals
    ] = await Promise.all([
      prisma.transportRequest.count(),
      prisma.transportRequest.count({ where: { status: 'PENDING' } }),
      prisma.unit.count({ where: { isActive: true, currentStatus: 'AVAILABLE' } }),
      prisma.transportAgency.count({ where: { isActive: true } }),
      prisma.transportAgency.count({ where: { isActive: true } })
    ]);

    // Get recent transport requests
    const recentTransports = await prisma.transportRequest.findMany({
      take: 10,
      orderBy: { requestTimestamp: 'desc' },
      include: {
        originFacility: true,
        destinationFacility: true,
        assignedAgency: true,
        assignedUnit: true
      }
    });

    // Get system alerts
    const alerts = [];
    
    if (pendingTransports > 10) {
      alerts.push({
        type: 'WARNING',
        message: `${pendingTransports} transport requests pending assignment`,
        severity: 'MEDIUM'
      });
    }

    if (activeUnits < 5) {
      alerts.push({
        type: 'ALERT',
        message: 'Low unit availability - only ${activeUnits} units available',
        severity: 'HIGH'
      });
    }

    res.json({
      success: true,
      data: {
        overview: {
          totalTransports,
          pendingTransports,
          activeUnits,
          totalAgencies,
          totalHospitals
        },
        recentTransports,
        alerts
      }
    });
  } catch (error) {
    console.error('[TRANSPORT-CENTER-DASHBOARD] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get Transport Center profile (Protected)
router.get('/profile', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('[TRANSPORT-CENTER-PROFILE] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
