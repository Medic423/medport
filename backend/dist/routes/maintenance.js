"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticateAdmin_1 = require("../middleware/authenticateAdmin");
const databaseManager_1 = require("../services/databaseManager");
const router = (0, express_1.Router)();
const centerDb = databaseManager_1.databaseManager.getCenterDB();
const emsDb = databaseManager_1.databaseManager.getEMSDB();
// WARNING: Dev-only reset endpoint. Resets trips/units to a clean state.
router.post('/reset-dev-state', authenticateAdmin_1.authenticateAdmin, async (req, res) => {
    try {
        console.log('TCC_DEBUG: RESET_DEV_STATE invoked by', req.user?.email);
        const cancel = await centerDb.transportRequest.updateMany({
            where: { status: { in: ['PENDING', 'ACCEPTED', 'IN_PROGRESS'] } },
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
    }
    catch (e) {
        console.error('TCC_DEBUG: RESET_DEV_STATE error', e);
        res.status(500).json({ success: false, error: e?.message || 'Failed to reset dev state' });
    }
});
exports.default = router;
//# sourceMappingURL=maintenance.js.map