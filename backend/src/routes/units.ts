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
      const agencyId = user.agencyId || user.id; // Use agencyId if available, fallback to user.id for EMS
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
  // Unit mutations are disabled in Option B. Return 410 Gone.
  return res.status(410).json({ success: false, error: 'Unit creation is disabled. Units are inventory-only.' });
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
  // On-duty listing is disabled (no unit assignment in workflow).
  return res.status(410).json({ success: false, error: 'On-duty unit listing is disabled.' });
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
  return res.status(410).json({ success: false, error: 'Unit updates are disabled. Units are inventory-only.' });
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
// Duplicate PUT/:id above is also disabled via 410.

/**
 * DELETE /api/units/:id
 * Delete a unit
 */
router.delete('/:id', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  return res.status(410).json({ success: false, error: 'Unit deletion is disabled. Units are inventory-only.' });
});

/**
 * PATCH /api/units/:id/duty
 * Toggle unit duty status (on/off duty)
 */
router.patch('/:id/duty', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  return res.status(410).json({ success: false, error: 'Unit duty status changes are disabled.' });
});

export default router;
