"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const hospitalService_1 = require("../services/hospitalService");
const authenticateAdmin_1 = require("../middleware/authenticateAdmin");
const router = express_1.default.Router();
// Apply authentication to all routes
router.use(authenticateAdmin_1.authenticateAdmin);
/**
 * GET /api/tcc/hospitals
 * List all hospitals with optional filtering
 */
router.get('/', async (req, res) => {
    try {
        const filters = {
            name: req.query.name,
            city: req.query.city,
            state: req.query.state,
            type: req.query.type,
            region: req.query.region,
            isActive: req.query.isActive ? req.query.isActive === 'true' : undefined,
            page: req.query.page ? parseInt(req.query.page) : 1,
            limit: req.query.limit ? parseInt(req.query.limit) : 50
        };
        const result = await hospitalService_1.hospitalService.getHospitals(filters);
        res.json({
            success: true,
            data: result.hospitals,
            pagination: {
                page: result.page,
                totalPages: result.totalPages,
                total: result.total,
                limit: filters.limit
            }
        });
    }
    catch (error) {
        console.error('Get hospitals error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve hospitals'
        });
    }
});
/**
 * POST /api/tcc/hospitals
 * Create new hospital
 */
router.post('/', async (req, res) => {
    try {
        const hospitalData = req.body;
        // Validate required fields
        const requiredFields = ['name', 'address', 'city', 'state', 'zipCode', 'type', 'capabilities', 'region'];
        const missingFields = requiredFields.filter(field => !hospitalData[field]);
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                error: `Missing required fields: ${missingFields.join(', ')}`
            });
        }
        const hospital = await hospitalService_1.hospitalService.createHospital(hospitalData);
        res.status(201).json({
            success: true,
            message: 'Hospital created successfully',
            data: hospital
        });
    }
    catch (error) {
        console.error('Create hospital error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create hospital'
        });
    }
});
/**
 * GET /api/tcc/hospitals/search
 * Search hospitals
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
        const hospitals = await hospitalService_1.hospitalService.searchHospitals(q);
        res.json({
            success: true,
            data: hospitals
        });
    }
    catch (error) {
        console.error('Search hospitals error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to search hospitals'
        });
    }
});
/**
 * GET /api/tcc/hospitals/:id
 * Get hospital by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const hospital = await hospitalService_1.hospitalService.getHospitalById(id);
        if (!hospital) {
            return res.status(404).json({
                success: false,
                error: 'Hospital not found'
            });
        }
        res.json({
            success: true,
            data: hospital
        });
    }
    catch (error) {
        console.error('Get hospital error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve hospital'
        });
    }
});
/**
 * PUT /api/tcc/hospitals/:id
 * Update hospital
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const hospital = await hospitalService_1.hospitalService.updateHospital(id, updateData);
        res.json({
            success: true,
            message: 'Hospital updated successfully',
            data: hospital
        });
    }
    catch (error) {
        console.error('Update hospital error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update hospital'
        });
    }
});
/**
 * DELETE /api/tcc/hospitals/:id
 * Delete hospital
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await hospitalService_1.hospitalService.deleteHospital(id);
        res.json({
            success: true,
            message: 'Hospital deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete hospital error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete hospital'
        });
    }
});
/**
 * PUT /api/tcc/hospitals/:id/approve
 * Approve hospital
 */
router.put('/:id/approve', async (req, res) => {
    try {
        const { id } = req.params;
        const approvedBy = req.user?.id; // Get user ID from auth middleware
        if (!approvedBy) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated'
            });
        }
        const hospital = await hospitalService_1.hospitalService.approveHospital(id, approvedBy);
        res.json({
            success: true,
            message: 'Hospital approved successfully',
            data: hospital
        });
    }
    catch (error) {
        console.error('Approve hospital error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to approve hospital'
        });
    }
});
/**
 * PUT /api/tcc/hospitals/:id/reject
 * Reject hospital
 */
router.put('/:id/reject', async (req, res) => {
    try {
        const { id } = req.params;
        const approvedBy = req.user?.id; // Get user ID from auth middleware
        if (!approvedBy) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated'
            });
        }
        const hospital = await hospitalService_1.hospitalService.rejectHospital(id, approvedBy);
        res.json({
            success: true,
            message: 'Hospital rejected successfully',
            data: hospital
        });
    }
    catch (error) {
        console.error('Reject hospital error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to reject hospital'
        });
    }
});
exports.default = router;
//# sourceMappingURL=hospitals.js.map