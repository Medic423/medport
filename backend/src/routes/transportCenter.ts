import express, { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import transportCenterService, { addServiceSchema, updateServiceSchema } from '../services/transportCenterService';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Middleware to ensure only Transport Center users can access these endpoints
const requireTransportCenter = (req: any, res: Response, next: NextFunction) => {
  const user = req.user;
  
  if (!user || (user.role !== 'COORDINATOR' && user.role !== 'center')) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Transport Center access required.'
    });
  }
  
  next();
};

// Add new EMS service (Transport Center only)
router.post('/add-service', authenticateToken, requireTransportCenter, async (req: any, res: Response) => {
  try {
    console.log('[TRANSPORT-CENTER] Adding new service:', req.body);
    
    const userId = req.user.id;
    const serviceData = addServiceSchema.parse(req.body);
    
    const service = await transportCenterService.addService(serviceData, userId);
    
    res.status(201).json({
      success: true,
      message: 'Service added successfully',
      data: service
    });
  } catch (error) {
    console.error('[TRANSPORT-CENTER] Error adding service:', error);
    
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
      message: 'Failed to add service'
    });
  }
});

// Get all services (Transport Center only)
router.get('/services', authenticateToken, requireTransportCenter, async (req: any, res: Response) => {
  try {
    console.log('[TRANSPORT-CENTER] Fetching all services');
    
    const services = await transportCenterService.getAllServices();
    
    res.json({
      success: true,
      message: 'Services retrieved successfully',
      data: services
    });
  } catch (error) {
    console.error('[TRANSPORT-CENTER] Error fetching services:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve services'
    });
  }
});

// Get service by ID
router.get('/services/:id', authenticateToken, requireTransportCenter, async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    console.log('[TRANSPORT-CENTER] Fetching service:', id);
    
    const service = await transportCenterService.getServiceById(id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Service retrieved successfully',
      data: service
    });
  } catch (error) {
    console.error('[TRANSPORT-CENTER] Error fetching service:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve service'
    });
  }
});

// Update service details
router.put('/services/:id', authenticateToken, requireTransportCenter, async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    console.log('[TRANSPORT-CENTER] Updating service:', id, req.body);
    
    const updateData = updateServiceSchema.parse(req.body);
    const service = await transportCenterService.updateService(id, updateData);
    
    res.json({
      success: true,
      message: 'Service updated successfully',
      data: service
    });
  } catch (error) {
    console.error('[TRANSPORT-CENTER] Error updating service:', error);
    
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
      message: 'Failed to update service'
    });
  }
});

// Disable service (soft delete)
router.delete('/services/:id', authenticateToken, requireTransportCenter, async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    console.log('[TRANSPORT-CENTER] Disabling service:', id);
    
    const service = await transportCenterService.disableService(id);
    
    res.json({
      success: true,
      message: 'Service disabled successfully',
      data: service
    });
  } catch (error) {
    console.error('[TRANSPORT-CENTER] Error disabling service:', error);
    
    if (error instanceof Error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to disable service'
    });
  }
});

// Enable service
router.patch('/services/:id/enable', authenticateToken, requireTransportCenter, async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    console.log('[TRANSPORT-CENTER] Enabling service:', id);
    
    const service = await transportCenterService.enableService(id);
    
    res.json({
      success: true,
      message: 'Service enabled successfully',
      data: service
    });
  } catch (error) {
    console.error('[TRANSPORT-CENTER] Error enabling service:', error);
    
    if (error instanceof Error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to enable service'
    });
  }
});

// Get services added by current user
router.get('/my-services', authenticateToken, requireTransportCenter, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    console.log('[TRANSPORT-CENTER] Fetching services added by user:', userId);
    
    const services = await transportCenterService.getServicesAddedByUser(userId);
    
    res.json({
      success: true,
      message: 'User services retrieved successfully',
      data: services
    });
  } catch (error) {
    console.error('[TRANSPORT-CENTER] Error fetching user services:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user services'
    });
  }
});

// Get service statistics
router.get('/stats', authenticateToken, requireTransportCenter, async (req: any, res: Response) => {
  try {
    console.log('[TRANSPORT-CENTER] Fetching service statistics');
    
    const stats = await transportCenterService.getServiceStats();
    
    res.json({
      success: true,
      message: 'Service statistics retrieved successfully',
      data: stats
    });
  } catch (error) {
    console.error('[TRANSPORT-CENTER] Error fetching service stats:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve service statistics'
    });
  }
});

export default router;