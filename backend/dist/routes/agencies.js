"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const agencyService_1 = require("../services/agencyService");
const router = express_1.default.Router();
// Test endpoint without authentication for debugging
router.get('/test', async (req, res) => {
    try {
        console.log('TCC_DEBUG: Test agencies endpoint called');
        const agencyService = require('../services/agencyService').agencyService;
        const result = await agencyService.getAgencies({});
        console.log('TCC_DEBUG: Test agencies result:', result);
        res.json({
            success: true,
            data: result.agencies,
            total: result.total,
            message: 'Test endpoint - authentication bypassed'
        });
    }
    catch (error) {
        console.error('TCC_DEBUG: Test agencies error:', error);
        res.status(500).json({
            success: false,
            error: 'Test endpoint failed: ' + error.message
        });
    }
});
// Temporarily disable authentication for testing
// router.use(authenticateAdmin);
/**
 * GET /api/tcc/agencies
 * List all EMS agencies with optional filtering
 */
router.get('/', async (req, res) => {
    try {
        const filters = {
            name: req.query.name,
            city: req.query.city,
            state: req.query.state,
            capabilities: req.query.capabilities ? req.query.capabilities.split(',') : undefined,
            isActive: req.query.isActive ? req.query.isActive === 'true' : undefined,
            page: req.query.page ? parseInt(req.query.page) : 1,
            limit: req.query.limit ? parseInt(req.query.limit) : 50
        };
        const result = await agencyService_1.agencyService.getAgencies(filters);
        res.json({
            success: true,
            data: result.agencies,
            pagination: {
                page: result.page,
                totalPages: result.totalPages,
                total: result.total,
                limit: filters.limit
            }
        });
    }
    catch (error) {
        console.error('Get agencies error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve agencies'
        });
    }
});
/**
 * POST /api/tcc/agencies
 * Create new EMS agency
 */
router.post('/', async (req, res) => {
    try {
        const agencyData = req.body;
        // Validate required fields
        const requiredFields = ['name', 'contactName', 'phone', 'email', 'address', 'city', 'state', 'zipCode', 'capabilities'];
        const missingFields = requiredFields.filter(field => !agencyData[field]);
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                error: `Missing required fields: ${missingFields.join(', ')}`
            });
        }
        const agency = await agencyService_1.agencyService.createAgency(agencyData);
        res.status(201).json({
            success: true,
            message: 'Agency created successfully',
            data: agency
        });
    }
    catch (error) {
        console.error('Create agency error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create agency'
        });
    }
});
/**
 * GET /api/tcc/agencies/:id
 * Get agency by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const agency = await agencyService_1.agencyService.getAgencyById(id);
        if (!agency) {
            return res.status(404).json({
                success: false,
                error: 'Agency not found'
            });
        }
        res.json({
            success: true,
            data: agency
        });
    }
    catch (error) {
        console.error('Get agency error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve agency'
        });
    }
});
/**
 * PUT /api/tcc/agencies/:id
 * Update agency
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const agency = await agencyService_1.agencyService.updateAgency(id, updateData);
        res.json({
            success: true,
            message: 'Agency updated successfully',
            data: agency
        });
    }
    catch (error) {
        console.error('Update agency error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update agency'
        });
    }
});
/**
 * DELETE /api/tcc/agencies/:id
 * Delete agency
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await agencyService_1.agencyService.deleteAgency(id);
        res.json({
            success: true,
            message: 'Agency deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete agency error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete agency'
        });
    }
});
/**
 * GET /api/tcc/agencies/search
 * Search agencies
 */
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || typeof q !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Search query is required'
            });
        }
        const agencies = await agencyService_1.agencyService.searchAgencies(q);
        res.json({
            success: true,
            data: agencies
        });
    }
    catch (error) {
        console.error('Search agencies error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to search agencies'
        });
    }
});
exports.default = router;
//# sourceMappingURL=agencies.js.map