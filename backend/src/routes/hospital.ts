import express from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authenticateToken } from '../middleware/auth';

const prisma = new PrismaClient();

const router = express.Router();

// Validation schemas
const hospitalRegistrationSchema = z.object({
  name: z.string().min(2, 'Hospital name must be at least 2 characters'),
  type: z.enum(['HOSPITAL', 'NURSING_HOME', 'CANCER_CENTER', 'REHAB_FACILITY', 'URGENT_CARE', 'SPECIALTY_CLINIC']),
  contactName: z.string().min(2, 'Contact name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  email: z.string().email('Invalid email format'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  state: z.string().length(2, 'State must be 2 characters'),
  zipCode: z.string().min(5, 'Zip code must be at least 5 characters'),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number()
  }).optional(),
  operatingHours: z.object({
    monday: z.object({ open: z.string(), close: z.string() }).optional(),
    tuesday: z.object({ open: z.string(), close: z.string() }).optional(),
    wednesday: z.object({ open: z.string(), close: z.string() }).optional(),
    thursday: z.object({ open: z.string(), close: z.string() }).optional(),
    friday: z.object({ open: z.string(), close: z.string() }).optional(),
    saturday: z.object({ open: z.string(), close: z.string() }).optional(),
    sunday: z.object({ open: z.string(), close: z.string() }).optional()
  }).optional(),
  capabilities: z.array(z.string()).optional(),
  adminUser: z.object({
    email: z.string().email('Invalid admin email format'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().min(2, 'Admin name must be at least 2 characters'),
    phone: z.string().optional(),
    role: z.enum(['ADMIN', 'COORDINATOR']).default('COORDINATOR')
  })
});

const hospitalLoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

// Hospital Registration (Public)
router.post('/register', async (req, res) => {
  try {
    console.log('[HOSPITAL-REGISTER] Registration attempt:', { email: req.body.email, name: req.body.name });
    
    const validatedData = hospitalRegistrationSchema.parse(req.body);
    
    // Check if hospital already exists
    const existingHospital = await prisma.facility.findFirst({
      where: {
        OR: [
          { name: validatedData.name },
          { email: validatedData.email }
        ]
      }
    });

    if (existingHospital) {
      return res.status(400).json({
        success: false,
        message: 'Hospital with this name or email already exists'
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.adminUser.email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(validatedData.adminUser.password, saltRounds);

    // Create hospital facility
    const hospital = await prisma.facility.create({
      data: {
        name: validatedData.name,
        type: validatedData.type,
        address: validatedData.address,
        city: validatedData.city,
        state: validatedData.state,
        zipCode: validatedData.zipCode,
        coordinates: validatedData.coordinates,
        phone: validatedData.phone,
        email: validatedData.email,
        operatingHours: validatedData.operatingHours,
        capabilities: validatedData.capabilities,
        isActive: true
      }
    });

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email: validatedData.adminUser.email,
        password: hashedPassword,
        name: validatedData.adminUser.name,
        role: validatedData.adminUser.role,
        isActive: true
      }
    });

    // Create hospital organization record
    const hospitalOrg = await prisma.transportAgency.create({
      data: {
        name: validatedData.name,
        contactName: validatedData.contactName,
        phone: validatedData.phone,
        email: validatedData.email,
        address: validatedData.address,
        city: validatedData.city,
        state: validatedData.state,
        zipCode: validatedData.zipCode,
        serviceArea: { type: 'hospital', facilityId: hospital.id },
        isActive: true
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: adminUser.id, 
        email: adminUser.email, 
        role: adminUser.role,
        hospitalId: hospital.id,
        organizationId: hospitalOrg.id
      },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    console.log('[HOSPITAL-REGISTER] Success:', { 
      hospitalId: hospital.id, 
      userId: adminUser.id,
      organizationId: hospitalOrg.id
    });

    res.status(201).json({
      success: true,
      message: 'Hospital registered successfully',
      data: {
        hospital: {
          id: hospital.id,
          name: hospital.name,
          type: hospital.type,
          email: hospital.email
        },
        adminUser: {
          id: adminUser.id,
          name: adminUser.name,
          email: adminUser.email,
          role: adminUser.role
        },
        organization: {
          id: hospitalOrg.id,
          name: hospitalOrg.name
        },
        token: token
      }
    });
  } catch (error) {
    console.error('[HOSPITAL-REGISTER] Error:', error);
    
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

// Hospital Login
router.post('/login', async (req, res) => {
  try {
    console.log('[HOSPITAL-LOGIN] Login attempt:', { email: req.body.email });
    
    const validatedData = hospitalLoginSchema.parse(req.body);

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

    // For demo purposes, we'll check if the user has a hospital-related role
    if (!['ADMIN', 'COORDINATOR'].includes(user.role)) {
      return res.status(401).json({
        success: false,
        message: 'User is not authorized for hospital access'
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

    // For demo purposes, we'll create a simple hospital identifier
    const hospitalId = 'demo-hospital-001';

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        hospitalId: hospitalId,
        isDemo: true
      },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    console.log('[HOSPITAL-LOGIN] Success:', { userId: user.id, hospitalId: hospitalId });

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
        hospital: {
          id: hospitalId,
          name: 'Demo Hospital',
          type: 'HOSPITAL'
        },
        token: token
      }
    });
  } catch (error) {
    console.error('[HOSPITAL-LOGIN] Error:', error);
    
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

// Demo Hospital Login
router.post('/demo/login', async (req, res) => {
  try {
    console.log('[HOSPITAL-DEMO-LOGIN] Demo login attempt');
    
    // Create demo hospital data
    const demoHospital = {
      id: 'demo-hospital-001',
      name: 'UPMC Altoona',
      type: 'HOSPITAL',
      email: 'demo@upmc-altoona.com'
    };

    const demoUser = {
      id: 'demo-hospital-user-001',
      name: 'Demo Hospital Coordinator',
      email: 'coordinator@upmc-altoona.com',
      role: 'HOSPITAL_COORDINATOR'
    };

    const demoOrg = {
      id: 'demo-hospital-org-001',
      name: 'UPMC Altoona'
    };

    // Generate demo token
    const token = jwt.sign(
      { 
        id: demoUser.id, 
        email: demoUser.email, 
        role: demoUser.role,
        hospitalId: demoHospital.id,
        organizationId: demoOrg.id,
        isDemo: true
      },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    console.log('[HOSPITAL-DEMO-LOGIN] Success');

    res.json({
      success: true,
      message: 'Demo login successful',
      data: {
        user: demoUser,
        hospital: demoHospital,
        organization: demoOrg,
        token: token
      }
    });
  } catch (error) {
    console.error('[HOSPITAL-DEMO-LOGIN] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get hospital profile (Protected)
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
            },
            hospital: {
              id: 'demo-hospital-001',
              name: 'Demo Hospital',
              type: 'HOSPITAL',
              address: '123 Demo Street',
              city: 'Demo City',
              state: 'PA',
              zipCode: '16601',
              phone: '555-0123',
              email: 'demo@hospital.com'
            }
          }
        });
  } catch (error) {
    console.error('[HOSPITAL-PROFILE] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get hospital transport requests (Protected)
router.get('/transports', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { status, limit = 50, offset = 0 } = req.query;
    
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // For demo purposes, we'll get all transports
    const whereClause: any = {};

    if (status) {
      whereClause.status = status;
    }

    const transports = await prisma.transportRequest.findMany({
      where: whereClause,
      include: {
        originFacility: true,
        destinationFacility: true,
        assignedAgency: true,
        assignedUnit: true,
        createdBy: true
      },
      orderBy: { requestTimestamp: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    const total = await prisma.transportRequest.count({
      where: whereClause
    });

    res.json({
      success: true,
      data: {
        transports,
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      }
    });
  } catch (error) {
    console.error('[HOSPITAL-TRANSPORTS] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
