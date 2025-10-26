import express from 'express';
import { unitService, UnitFormData, UnitStatusUpdate } from '../services/unitService';
import { authenticateAdmin, AuthenticatedRequest } from '../middleware/authenticateAdmin';

const router = express.Router();

/**
 * GET /api/units
 * Get all units for the authenticated agency
 */
router.get('/', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user;
    console.log('🔍 Units API: req.user:', req.user);
    
    let units;
    
    if (user?.userType === 'EMS') {
      // For EMS users, get units for their agency
      const agencyId = user.id; // EMS users have agencyId as their id
      console.log('🔍 Units API: agencyId for EMS user:', agencyId);
      units = await unitService.getUnitsByAgency(agencyId);
    } else {
      // For admin users, get all units
      console.log('🔍 Units API: Getting all units for admin user');
      units = await unitService.getAllUnits();
    }
    
    console.log('🔍 Units API: units found:', units.length);
    
    res.json({
      success: true,
      data: units
    });
  } catch (error) {
    console.error('Error getting units:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve units'
    });
  }
});

/**
 * POST /api/units
 * Create a new unit for the authenticated agency
 */
router.post('/', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const agencyId = req.user?.id;
    console.log('🔍 Units API POST: req.user:', req.user);
    console.log('🔍 Units API POST: agencyId:', agencyId);
    console.log('🔍 Units API POST: body:', req.body);
    
    if (!agencyId) {
      return res.status(400).json({
        success: false,
        error: 'Agency ID not found'
      });
    }

    const unitData: UnitFormData = req.body;
    
    // Validate required fields
    if (!unitData.unitNumber || !unitData.type) {
      return res.status(400).json({
        success: false,
        error: 'Unit number and type are required'
      });
    }

    const unit = await unitService.createUnit(unitData, agencyId);
    console.log('🔍 Units API POST: unit created:', unit);
    
    res.status(201).json({
      success: true,
      data: unit,
      message: 'Unit created successfully'
    });
  } catch (error) {
    console.error('Error creating unit:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create unit'
    });
  }
});

/**
 * GET /api/units/available
 * Get available units for optimization
 */
router.get('/available', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const agencyId = req.user?.id;
    
    if (!agencyId) {
      return res.status(400).json({
        success: false,
        error: 'Agency ID not found'
      });
    }

    const units = await unitService.getAvailableUnits(agencyId);
    
    res.json({
      success: true,
      data: units
    });
  } catch (error) {
    console.error('Error getting available units:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve available units'
    });
  }
});

/**
 * GET /api/units/on-duty
 * Get on-duty units for the authenticated EMS agency (for trip assignment)
 */
router.get('/on-duty', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user;
    console.log('TCC_DEBUG: Get on-duty units request from user:', user);

    if (!user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    let units;
    if (user.userType === 'EMS') {
      const agencyId = user.id; // EMS users have agencyId as their id
      console.log('TCC_DEBUG: Getting on-duty units for EMS agency:', agencyId);
      units = await unitService.getOnDutyUnits(agencyId);
    } else if (user.userType === 'ADMIN') {
      console.log('TCC_DEBUG: ADMIN requesting on-duty units across all agencies');
      const allUnits = await unitService.getAllUnits();
      units = allUnits.filter(u => u.isActive && u.currentStatus === 'AVAILABLE');
    } else {
      console.log('TCC_DEBUG: Non-EMS user requesting on-duty units - returning global available list');
      const allUnits = await unitService.getAllUnits();
      units = allUnits.filter(u => u.isActive && u.currentStatus === 'AVAILABLE');
    }

    console.log('TCC_DEBUG: Found on-duty units:', units.length);

    res.json({ success: true, data: units });
  } catch (error) {
    console.error('Error getting on-duty units:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve on-duty units'
    });
  }
});

/**
 * GET /api/units/analytics
 * Get unit analytics for the agency
 */
router.get('/analytics', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const agencyId = req.user?.id;
    
    if (!agencyId) {
      return res.status(400).json({
        success: false,
        error: 'Agency ID not found'
      });
    }

    const analytics = await unitService.getUnitAnalytics(agencyId);
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error getting unit analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve unit analytics'
    });
  }
});

/**
 * GET /api/units/:id
 * Get a specific unit by ID
 */
router.get('/:id', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const unit = await unitService.getUnitById(id);
    
    if (!unit) {
      return res.status(404).json({
        success: false,
        error: 'Unit not found'
      });
    }

    res.json({
      success: true,
      data: unit
    });
  } catch (error) {
    console.error('Error getting unit:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve unit'
    });
  }
});


/**
 * PUT /api/units/:id
 * Update unit details
 */
router.put('/:id', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const unitData: Partial<UnitFormData> = req.body;
    
    // Validate required fields for update
    if (unitData.unitNumber !== undefined && !unitData.unitNumber) {
      return res.status(400).json({
        success: false,
        error: 'Unit number cannot be empty'
      });
    }
    
    if (unitData.type !== undefined && !unitData.type) {
      return res.status(400).json({
        success: false,
        error: 'Unit type cannot be empty'
      });
    }
    
    const unit = await unitService.updateUnit(id, unitData as UnitFormData);
    
    res.json({
      success: true,
      data: unit
    });
  } catch (error) {
    console.error('Error updating unit:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update unit'
    });
  }
});

/**
 * PUT /api/units/:id/status
 * Update unit status
 */
router.put('/:id/status', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const statusUpdate: UnitStatusUpdate = req.body;
    
    if (!statusUpdate.status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required'
      });
    }

    const unit = await unitService.updateUnitStatus(id, statusUpdate);
    
    res.json({
      success: true,
      data: unit
    });
  } catch (error) {
    console.error('Error updating unit status:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update unit status'
    });
  }
});


/**
 * PUT /api/units/:id
 * Update a unit
 */
router.put('/:id', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const agencyId = req.user?.id;
    console.log('🔍 Units API PUT: req.user:', req.user);
    console.log('🔍 Units API PUT: agencyId:', agencyId);
    console.log('🔍 Units API PUT: unitId:', id);
    console.log('🔍 Units API PUT: body:', req.body);
    
    if (!agencyId) {
      return res.status(400).json({
        success: false,
        error: 'Agency ID not found'
      });
    }

    const unitData: UnitFormData = req.body;
    
    // Validate required fields
    if (!unitData.unitNumber || !unitData.type) {
      return res.status(400).json({
        success: false,
        error: 'Unit number and type are required'
      });
    }

    const unit = await unitService.updateUnit(id, unitData, agencyId);
    console.log('🔍 Units API PUT: unit updated:', unit);
    
    res.json({
      success: true,
      data: unit,
      message: 'Unit updated successfully'
    });
  } catch (error) {
    console.error('Error updating unit:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update unit'
    });
  }
});

/**
 * DELETE /api/units/:id
 * Delete a unit
 */
router.delete('/:id', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const agencyId = req.user?.id;
    console.log('🔍 Units API DELETE: req.user:', req.user);
    console.log('🔍 Units API DELETE: agencyId:', agencyId);
    console.log('🔍 Units API DELETE: unitId:', id);
    
    if (!agencyId) {
      return res.status(400).json({
        success: false,
        error: 'Agency ID not found'
      });
    }

    await unitService.deleteUnit(id);
    console.log('🔍 Units API DELETE: unit deleted');
    
    res.json({
      success: true,
      message: 'Unit deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting unit:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete unit'
    });
  }
});

/**
 * PATCH /api/units/:id/duty
 * Toggle unit duty status (on/off duty)
 */
router.patch('/:id/duty', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const agencyId = req.user?.id;
    
    console.log('🔍 Units API PATCH duty: req.user:', req.user);
    console.log('🔍 Units API PATCH duty: agencyId:', agencyId);
    console.log('🔍 Units API PATCH duty: unitId:', id);
    console.log('🔍 Units API PATCH duty: isActive:', isActive);
    
    if (!agencyId) {
      return res.status(400).json({
        success: false,
        error: 'Agency ID not found'
      });
    }

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'isActive must be a boolean value'
      });
    }

    const updatedUnit = await unitService.updateUnitDutyStatus(id, isActive);
    console.log('🔍 Units API PATCH duty: unit updated:', updatedUnit);
    
    res.json({
      success: true,
      data: updatedUnit,
      message: `Unit ${isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Error updating unit duty status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update unit duty status'
    });
  }
});

export default router;
