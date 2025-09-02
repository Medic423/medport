import express from 'express';
import { z } from 'zod';
import { databaseManager } from '../services/databaseManager';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Validation schemas
const createAgencySchema = z.object({
  name: z.string().min(1, 'Agency name is required'),
  contactName: z.string().min(1, 'Contact name is required'),
  phone: z.string().min(1, 'Phone number is required'),
  email: z.string().email('Valid email is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(1, 'ZIP code is required'),
  serviceArea: z.array(z.string()).optional().default([]),
  operatingHours: z.string().optional().default('24/7'),
  capabilities: z.array(z.string()).optional().default([]),
  pricingStructure: z.any().optional()
});

const updateAgencySchema = z.object({
  name: z.string().min(1, 'Agency name is required').optional(),
  contactName: z.string().min(1, 'Contact name is required').optional(),
  phone: z.string().min(1, 'Phone number is required').optional(),
  email: z.string().email('Valid email is required').optional(),
  address: z.string().min(1, 'Address is required').optional(),
  city: z.string().min(1, 'City is required').optional(),
  state: z.string().min(1, 'State is required').optional(),
  zipCode: z.string().min(1, 'ZIP code is required').optional(),
  serviceArea: z.array(z.string()).optional(),
  operatingHours: z.string().optional(),
  capabilities: z.array(z.string()).optional(),
  pricingStructure: z.any().optional(),
  isActive: z.boolean().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING']).optional()
});

// Middleware to ensure only Center users can access these endpoints
const requireCenterAccess = (req: any, res: express.Response, next: express.NextFunction) => {
  const user = req.user;
  
  console.log('[CENTER_EMS_AGENCIES] Access check:', {
    hasUser: !!user,
    userRole: user?.role,
    userType: user?.userType,
    userId: user?.id
  });
  
  if (!user || user.role !== 'COORDINATOR' || user.userType !== 'center') {
    console.log('[CENTER_EMS_AGENCIES] Access denied:', {
      reason: !user ? 'No user' : 
              user.role !== 'COORDINATOR' ? 'Wrong role' : 
              user.userType !== 'center' ? 'Wrong userType' : 'Unknown'
    });
    return res.status(403).json({
      success: false,
      message: 'Access denied. Center access required.'
    });
  }
  
  console.log('[CENTER_EMS_AGENCIES] Access granted');
  next();
};

// Get all EMS agencies (Center only)
router.get('/', authenticateToken, requireCenterAccess, async (req: any, res: express.Response) => {
  try {
    console.log('[CENTER-EMS-AGENCIES] Fetching all EMS agencies');
    
    const centerDB = databaseManager.getCenterDB();
    const agencies = await centerDB.eMSAgency.findMany({
      orderBy: [
        { name: 'asc' }
      ]
    });
    
    res.json({
      success: true,
      message: 'EMS agencies retrieved successfully',
      data: agencies
    });
  } catch (error) {
    console.error('[CENTER-EMS-AGENCIES] Error fetching agencies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve EMS agencies'
    });
  }
});

// Get EMS agency by ID (Center only)
router.get('/:id', authenticateToken, requireCenterAccess, async (req: any, res: express.Response) => {
  try {
    const { id } = req.params;
    console.log('[CENTER-EMS-AGENCIES] Fetching agency:', id);
    
    const centerDB = databaseManager.getCenterDB();
    const agency = await centerDB.eMSAgency.findUnique({
      where: { id }
    });
    
    if (!agency) {
      return res.status(404).json({
        success: false,
        message: 'EMS agency not found'
      });
    }
    
    res.json({
      success: true,
      message: 'EMS agency retrieved successfully',
      data: agency
    });
  } catch (error) {
    console.error('[CENTER-EMS-AGENCIES] Error fetching agency:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve EMS agency'
    });
  }
});

// Create new EMS agency (Center only)
router.post('/', authenticateToken, requireCenterAccess, async (req: any, res: express.Response) => {
  try {
    console.log('[CENTER-EMS-AGENCIES] Creating new EMS agency:', req.body);
    
    const userId = req.user.id;
    const agencyData = createAgencySchema.parse(req.body);
    
    const centerDB = databaseManager.getCenterDB();
    const agency = await centerDB.eMSAgency.create({
      data: {
        ...agencyData,
        addedBy: userId,
        isActive: true,
        status: 'ACTIVE'
      }
    });
    
    res.status(201).json({
      success: true,
      message: 'EMS agency created successfully',
      data: agency
    });
  } catch (error) {
    console.error('[CENTER-EMS-AGENCIES] Error creating agency:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }
    
    if (error instanceof Error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create EMS agency'
    });
  }
});

// Update EMS agency (Center only)
router.put('/:id', authenticateToken, requireCenterAccess, async (req: any, res: express.Response) => {
  try {
    const { id } = req.params;
    console.log('[CENTER-EMS-AGENCIES] Updating agency:', id, req.body);
    
    const updateData = updateAgencySchema.parse(req.body);
    
    const centerDB = databaseManager.getCenterDB();
    const agency = await centerDB.eMSAgency.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    });
    
    res.json({
      success: true,
      message: 'EMS agency updated successfully',
      data: agency
    });
  } catch (error) {
    console.error('[CENTER-EMS-AGENCIES] Error updating agency:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }
    
    if (error instanceof Error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update EMS agency'
    });
  }
});

// Delete EMS agency (soft delete - Center only)
router.delete('/:id', authenticateToken, requireCenterAccess, async (req: any, res: express.Response) => {
  try {
    const { id } = req.params;
    console.log('[CENTER-EMS-AGENCIES] Deleting agency:', id);
    
    const centerDB = databaseManager.getCenterDB();
    const agency = await centerDB.eMSAgency.update({
      where: { id },
      data: {
        isActive: false,
        status: 'INACTIVE',
        updatedAt: new Date()
      }
    });
    
    res.json({
      success: true,
      message: 'EMS agency deleted successfully',
      data: agency
    });
  } catch (error) {
    console.error('[CENTER-EMS-AGENCIES] Error deleting agency:', error);
    
    if (error instanceof Error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to delete EMS agency'
    });
  }
});

// Get EMS agency statistics (Center only)
router.get('/stats/overview', authenticateToken, requireCenterAccess, async (req: any, res: express.Response) => {
  try {
    console.log('[CENTER-EMS-AGENCIES] Fetching agency statistics');
    
    const centerDB = databaseManager.getCenterDB();
    const [total, active, inactive, pending] = await Promise.all([
      centerDB.eMSAgency.count(),
      centerDB.eMSAgency.count({ where: { isActive: true, status: 'ACTIVE' } }),
      centerDB.eMSAgency.count({ where: { isActive: false, status: 'INACTIVE' } }),
      centerDB.eMSAgency.count({ where: { status: 'PENDING' } })
    ]);
    
    const stats = {
      total,
      active,
      inactive,
      pending,
      activePercentage: total > 0 ? Math.round((active / total) * 100) : 0
    };
    
    res.json({
      success: true,
      message: 'EMS agency statistics retrieved successfully',
      data: stats
    });
  } catch (error) {
    console.error('[CENTER-EMS-AGENCIES] Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve EMS agency statistics'
    });
  }
});

export default router;
