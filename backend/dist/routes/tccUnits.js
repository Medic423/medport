"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authenticateAdmin_1 = require("../middleware/authenticateAdmin");
const databaseManager_1 = require("../services/databaseManager");
const router = express_1.default.Router();
/**
 * GET /api/tcc/units
 * Get all units from all EMS agencies (TCC Admin only)
 */
router.get('/', authenticateAdmin_1.authenticateAdmin, async (req, res) => {
    try {
        console.log('🔍 TCC Units API: req.user:', req.user);
        const emsDB = databaseManager_1.databaseManager.getEMSDB();
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
    }
    catch (error) {
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
router.get('/:agencyId', authenticateAdmin_1.authenticateAdmin, async (req, res) => {
    try {
        const { agencyId } = req.params;
        console.log('🔍 TCC Units API: Getting units for agency:', agencyId);
        const emsDB = databaseManager_1.databaseManager.getEMSDB();
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
    }
    catch (error) {
        console.error('Error fetching agency units:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch agency units'
        });
    }
});
exports.default = router;
//# sourceMappingURL=tccUnits.js.map