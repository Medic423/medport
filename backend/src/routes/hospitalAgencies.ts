import express from 'express';
import { z } from 'zod';
import hospitalAgencyService from '../services/hospitalAgencyService';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Validation schemas
const agencySearchSchema = z.object({
  transportLevel: z.enum(['BLS', 'ALS', 'CCT', 'OTHER']).optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  hasAvailableUnits: z.boolean().optional(),
  searchTerm: z.string().optional()
});

const addPreferredAgencySchema = z.object({
  agencyId: z.string().min(1, 'Agency ID is required'),
  preferenceOrder: z.number().int().min(0).optional(),
  notes: z.string().optional()
});

const updatePreferenceOrderSchema = z.object({
  preferenceOrder: z.number().int().min(0, 'Preference order must be non-negative')
});

// Get all available agencies with optional filtering
router.get('/available', authenticateToken, async (req, res) => {
  try {
    console.log('[HOSPITAL-AGENCIES] Fetching available agencies with filters:', req.query);
    
    const filters = agencySearchSchema.parse(req.query);
    const agencies = await hospitalAgencyService.getAgenciesWithAvailability(filters);
    
    res.json({
      success: true,
      message: 'Available agencies retrieved successfully',
      data: agencies
    });
  } catch (error) {
    console.error('[HOSPITAL-AGENCIES] Error fetching available agencies:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve available agencies'
    });
  }
});

// Get hospital's preferred agencies
router.get('/preferred', authenticateToken, async (req, res) => {
  try {
    const hospitalId = (req as any).user.id;
    console.log('[HOSPITAL-AGENCIES] Fetching preferred agencies for hospital:', hospitalId);
    
    const preferredAgencies = await hospitalAgencyService.getHospitalPreferredAgencies(hospitalId);
    
    res.json({
      success: true,
      message: 'Preferred agencies retrieved successfully',
      data: preferredAgencies
    });
  } catch (error) {
    console.error('[HOSPITAL-AGENCIES] Error fetching preferred agencies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve preferred agencies'
    });
  }
});

// Add agency to hospital's preferred list
router.post('/preferred', authenticateToken, async (req, res) => {
  try {
    const hospitalId = (req as any).user.id;
    const validatedData = addPreferredAgencySchema.parse(req.body);
    
    console.log('[HOSPITAL-AGENCIES] Adding preferred agency:', { hospitalId, ...validatedData });
    
    const preference = await hospitalAgencyService.addPreferredAgency({
      hospitalId,
      ...validatedData
    });
    
    res.status(201).json({
      success: true,
      message: 'Agency added to preferred list successfully',
      data: preference
    });
  } catch (error) {
    console.error('[HOSPITAL-AGENCIES] Error adding preferred agency:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to add agency to preferred list'
    });
  }
});

// Remove agency from hospital's preferred list
router.delete('/preferred/:agencyId', authenticateToken, async (req, res) => {
  try {
    const hospitalId = (req as any).user.id;
    const { agencyId } = req.params;
    
    console.log('[HOSPITAL-AGENCIES] Removing preferred agency:', { hospitalId, agencyId });
    
    await hospitalAgencyService.removePreferredAgency(hospitalId, agencyId);
    
    res.json({
      success: true,
      message: 'Agency removed from preferred list successfully'
    });
  } catch (error) {
    console.error('[HOSPITAL-AGENCIES] Error removing preferred agency:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove agency from preferred list'
    });
  }
});

// Update preference order
router.put('/preferred/:agencyId/order', authenticateToken, async (req, res) => {
  try {
    const hospitalId = (req as any).user.id;
    const { agencyId } = req.params;
    const validatedData = updatePreferenceOrderSchema.parse(req.body);
    
    console.log('[HOSPITAL-AGENCIES] Updating preference order:', { hospitalId, agencyId, ...validatedData });
    
    const preference = await hospitalAgencyService.updatePreferenceOrder(
      hospitalId,
      agencyId,
      validatedData.preferenceOrder
    );
    
    res.json({
      success: true,
      message: 'Preference order updated successfully',
      data: preference
    });
  } catch (error) {
    console.error('[HOSPITAL-AGENCIES] Error updating preference order:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update preference order'
    });
  }
});

// Get agency details by ID
router.get('/:agencyId', authenticateToken, async (req, res) => {
  try {
    const { agencyId } = req.params;
    console.log('[HOSPITAL-AGENCIES] Fetching agency details:', agencyId);
    
    const agency = await hospitalAgencyService.getAgencyById(agencyId);
    
    if (!agency) {
      return res.status(404).json({
        success: false,
        message: 'Agency not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Agency details retrieved successfully',
      data: agency
    });
  } catch (error) {
    console.error('[HOSPITAL-AGENCIES] Error fetching agency details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve agency details'
    });
  }
});

// Check if agency is preferred by hospital
router.get('/:agencyId/preferred', authenticateToken, async (req, res) => {
  try {
    const hospitalId = (req as any).user.id;
    const { agencyId } = req.params;
    
    console.log('[HOSPITAL-AGENCIES] Checking if agency is preferred:', { hospitalId, agencyId });
    
    const isPreferred = await hospitalAgencyService.isAgencyPreferred(hospitalId, agencyId);
    
    res.json({
      success: true,
      message: 'Preference status retrieved successfully',
      data: { isPreferred }
    });
  } catch (error) {
    console.error('[HOSPITAL-AGENCIES] Error checking preference status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check preference status'
    });
  }
});

export default router;
