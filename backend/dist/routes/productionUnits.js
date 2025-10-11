"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const productionUnitService_1 = require("../services/productionUnitService");
const authenticateAdmin_1 = require("../middleware/authenticateAdmin");
const router = express_1.default.Router();
// Get all units for TCC admin
router.get('/tcc', authenticateAdmin_1.authenticateAdmin, async (req, res) => {
    try {
        console.log('🔍 TCC Units API: req.user:', req.user);
        const units = await productionUnitService_1.productionUnitService.getAllUnits();
        console.log('🔍 TCC Units API: units found:', units.length);
        res.json({ success: true, data: units });
    }
    catch (error) {
        console.error('Error fetching TCC units:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch units'
        });
    }
});
// Get units for EMS agency (placeholder - would need authentication)
router.get('/', async (req, res) => {
    try {
        // This would need proper EMS authentication
        // For now, return empty array
        res.json({ success: true, data: [] });
    }
    catch (error) {
        console.error('Error fetching EMS units:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch units'
        });
    }
});
// Get unit analytics
router.get('/analytics', authenticateAdmin_1.authenticateAdmin, async (req, res) => {
    try {
        const analytics = await productionUnitService_1.productionUnitService.getUnitAnalytics();
        res.json({ success: true, data: analytics });
    }
    catch (error) {
        console.error('Error fetching unit analytics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch unit analytics'
        });
    }
});
exports.default = router;
//# sourceMappingURL=productionUnits.js.map