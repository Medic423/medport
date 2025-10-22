import express from 'express';
import { authenticateAdmin, AuthenticatedRequest } from '../middleware/authenticateAdmin';
import { databaseManager } from '../services/databaseManager';
import { unitService, UnitFormData } from '../services/unitService';

const router = express.Router();

/**
 * GET /api/tcc/units
 * Get all units from all EMS agencies (TCC Admin only)
 */
router.get('/', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    console.log('🔍 TCC Units API: req.user:', req.user);
    
    const emsDB = databaseManager.getEMSDB();
    console.log('🔍 TCC Units API: emsDB obtained:', !!emsDB);
    
    // Get all units from all agencies
    const units = await emsDB.unit.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('🔍 TCC Units API: units found:', units.length);

    res.json({
      success: true,
      data: units
    });

  } catch (error) {
    console.error('🔍 TCC Units API: Error details:', error);
    console.error('🔍 TCC Units API: Error message:', error instanceof Error ? error.message : String(error));
    console.error('🔍 TCC Units API: Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve units',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * GET /api/tcc/units/:agencyId
 * Get all units for a specific agency (TCC Admin only)
 */
router.get('/:agencyId', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { agencyId } = req.params;
    console.log('🔍 TCC Units API: Getting units for agency:', agencyId);
    
    const emsDB = databaseManager.getEMSDB();
    
    const units = await emsDB.unit.findMany({
      where: {
        agencyId: agencyId,
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('🔍 TCC Units API: units found for agency:', units.length);

    res.json({
      success: true,
      data: units
    });

  } catch (error) {
    console.error('Error fetching agency units:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch agency units'
    });
  }
});

/**
 * PUT /api/tcc/units/:id
 * Update a unit (TCC Admin only)
 */
router.put('/:id', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const unitData: UnitFormData = req.body;
    
    console.log('🔍 TCC Units API PUT: unitId:', id);
    console.log('🔍 TCC Units API PUT: body:', req.body);
    
    // Validate required fields
    if (!unitData.unitNumber || !unitData.type) {
      return res.status(400).json({
        success: false,
        error: 'Unit number and type are required'
      });
    }

    const unit = await unitService.updateUnit(id, unitData);
    console.log('🔍 TCC Units API PUT: unit updated:', unit);
    
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
 * DELETE /api/tcc/units/:id
 * Delete a unit (TCC Admin only)
 */
router.delete('/:id', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    console.log('🔍 TCC Units API DELETE: unitId:', id);
    
    await unitService.deleteUnit(id);
    console.log('🔍 TCC Units API DELETE: unit deleted');
    
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

export default router;
