import express from 'express';
import { authenticateAdmin, AuthenticatedRequest } from '../middleware/authenticateAdmin';
import { databaseManager } from '../services/databaseManager';

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

export default router;
