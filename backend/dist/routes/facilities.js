"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const facilityService_1 = require("../services/facilityService");
const router = express_1.default.Router();
// Apply authentication to all routes - allow both admin and healthcare users
router.use((req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ success: false, error: 'Access token required' });
    }
    next();
});
/**
 * GET /api/tcc/facilities
 * List all facilities with optional filtering
 */
router.get('/', async (req, res) => {
    try {
        const filters = {
            name: req.query.name,
            type: req.query.type,
            city: req.query.city,
            state: req.query.state,
            isActive: req.query.isActive ? req.query.isActive === 'true' : undefined,
            page: req.query.page ? parseInt(req.query.page) : 1,
            limit: req.query.limit ? parseInt(req.query.limit) : 50,
            // Phase A: Geographic filtering parameters
            radius: req.query.radius ? parseFloat(req.query.radius) : undefined,
            originLat: req.query.originLat ? parseFloat(req.query.originLat) : undefined,
            originLng: req.query.originLng ? parseFloat(req.query.originLng) : undefined,
            showAllStates: req.query.showAllStates ? req.query.showAllStates === 'true' : undefined
        };
        console.log('PHASE_A: Facilities API called with filters:', filters);
        const result = await facilityService_1.facilityService.getFacilities(filters);
        console.log('PHASE_A: Found', result.facilities.length, 'facilities');
        res.json({
            success: true,
            data: result.facilities,
            pagination: {
                page: result.page,
                totalPages: result.totalPages,
                total: result.total,
                limit: filters.limit
            }
        });
    }
    catch (error) {
        console.error('Get facilities error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve facilities'
        });
    }
});
/**
 * POST /api/tcc/facilities
 * Create new facility
 */
router.post('/', async (req, res) => {
    try {
        const facilityData = req.body;
        // Validate required fields
        const requiredFields = ['name', 'type', 'address', 'city', 'state', 'zipCode'];
        const missingFields = requiredFields.filter(field => !facilityData[field]);
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                error: `Missing required fields: ${missingFields.join(', ')}`
            });
        }
        const facility = await facilityService_1.facilityService.createFacility(facilityData);
        res.status(201).json({
            success: true,
            message: 'Facility created successfully',
            data: facility
        });
    }
    catch (error) {
        console.error('Create facility error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create facility'
        });
    }
});
/**
 * GET /api/tcc/facilities/:id
 * Get facility by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const facility = await facilityService_1.facilityService.getFacilityById(id);
        if (!facility) {
            return res.status(404).json({
                success: false,
                error: 'Facility not found'
            });
        }
        res.json({
            success: true,
            data: facility
        });
    }
    catch (error) {
        console.error('Get facility error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve facility'
        });
    }
});
/**
 * PUT /api/tcc/facilities/:id
 * Update facility
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const facility = await facilityService_1.facilityService.updateFacility(id, updateData);
        res.json({
            success: true,
            message: 'Facility updated successfully',
            data: facility
        });
    }
    catch (error) {
        console.error('Update facility error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update facility'
        });
    }
});
/**
 * DELETE /api/tcc/facilities/:id
 * Delete facility
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await facilityService_1.facilityService.deleteFacility(id);
        res.json({
            success: true,
            message: 'Facility deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete facility error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete facility'
        });
    }
});
/**
 * GET /api/tcc/facilities/search
 * Search facilities
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
        const facilities = await facilityService_1.facilityService.searchFacilities(q);
        res.json({
            success: true,
            data: facilities
        });
    }
    catch (error) {
        console.error('Search facilities error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to search facilities'
        });
    }
});
exports.default = router;
//# sourceMappingURL=facilities.js.map