import { Router } from 'express';
import { authenticateAdmin, AuthenticatedRequest } from '../middleware/authenticateAdmin';
import { databaseManager } from '../services/databaseManager';

const router = Router();
const centerDb = databaseManager.getPrismaClient();
const emsDb = databaseManager.getPrismaClient();

// WARNING: Dev-only reset endpoint. Resets trips/units to a clean state.
router.post('/reset-dev-state', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    console.log('TCC_DEBUG: RESET_DEV_STATE invoked by', req.user?.email);

    const cancel = await centerDb.transportRequest.updateMany({
      where: { status: { in: ['PENDING','ACCEPTED','IN_PROGRESS'] } },
      data: { status: 'CANCELLED', completionTimestamp: new Date() }
    });
    const cleared = await centerDb.transportRequest.updateMany({
      where: { status: { not: 'COMPLETED' } },
      data: { assignedUnitId: null }
    });
    const freeUnits = await emsDb.unit.updateMany({
      where: {},
      data: { status: 'AVAILABLE', currentStatus: 'AVAILABLE' }
    });

    res.json({ success: true, data: { tripsCancelled: cancel.count, tripsCleared: cleared.count, unitsFreed: freeUnits.count } });
  } catch (e: any) {
    console.error('TCC_DEBUG: RESET_DEV_STATE error', e);
    res.status(500).json({ success: false, error: e?.message || 'Failed to reset dev state' });
  }
});

export default router;


