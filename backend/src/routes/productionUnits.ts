import express from 'express';
import { productionUnitService } from '../services/productionUnitService';
import { authenticateAdmin } from '../middleware/authenticateAdmin';

const router = express.Router();

// Get all units for TCC admin
router.get('/tcc', authenticateAdmin, async (req: any, res) => {
  try {
    console.log('🔍 TCC Units API: req.user:', req.user);
    const units = await productionUnitService.getAllUnits();
    console.log('🔍 TCC Units API: units found:', units.length);
    res.json({ success: true, data: units });
  } catch (error) {
    console.error('Error fetching TCC units:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch units' 
    });
  }
});

// Get units for EMS agency (placeholder - would need authentication)
router.get('/', async (req: any, res) => {
  try {
    // This would need proper EMS authentication
    // For now, return empty array
    res.json({ success: true, data: [] });
  } catch (error) {
    console.error('Error fetching EMS units:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch units' 
    });
  }
});

// Get unit analytics
router.get('/analytics', authenticateAdmin, async (req: any, res) => {
  try {
    const analytics = await productionUnitService.getUnitAnalytics();
    res.json({ success: true, data: analytics });
  } catch (error) {
    console.error('Error fetching unit analytics:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch unit analytics' 
    });
  }
});

export default router;
