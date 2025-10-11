"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const databaseManager_1 = require("../services/databaseManager");
const coordinateService_1 = require("../services/coordinateService");
const authenticateAdmin_1 = require("../middleware/authenticateAdmin");
const router = express_1.default.Router();
/**
 * GET /api/units/locations
 * Get current locations of all units
 */
router.get('/locations', authenticateAdmin_1.authenticateAdmin, async (req, res) => {
    try {
        const prisma = databaseManager_1.databaseManager.getEMSDB();
        const units = await prisma.unit.findMany({
            where: { isActive: true },
            select: {
                id: true,
                unitNumber: true,
                currentStatus: true,
                currentLocation: true,
                latitude: true,
                longitude: true,
                agency: {
                    select: {
                        name: true
                    }
                }
            }
        });
        // Transform units to include location data
        const unitsWithLocations = units.map(unit => ({
            id: unit.id,
            unitNumber: unit.unitNumber,
            currentStatus: unit.currentStatus,
            agencyName: unit.agency.name,
            currentLocation: unit.currentLocation || 'Not Set',
            coordinates: unit.latitude && unit.longitude ? {
                lat: unit.latitude,
                lng: unit.longitude
            } : null,
            hasLocation: !!(unit.latitude && unit.longitude)
        }));
        res.json({
            success: true,
            data: unitsWithLocations
        });
    }
    catch (error) {
        console.error('Error fetching unit locations:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch unit locations'
        });
    }
});
/**
 * PUT /api/units/:unitId/location
 * Update unit's current location
 */
router.put('/:unitId/location', authenticateAdmin_1.authenticateAdmin, async (req, res) => {
    try {
        const { unitId } = req.params;
        const { latitude, longitude, address, notes } = req.body;
        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                error: 'Latitude and longitude are required'
            });
        }
        // Validate coordinates
        if (!coordinateService_1.coordinateService.isValidCoordinates(latitude, longitude)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid coordinates provided'
            });
        }
        const prisma = databaseManager_1.databaseManager.getEMSDB();
        // Update unit location
        const updatedUnit = await prisma.unit.update({
            where: { id: unitId },
            data: {
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                currentLocation: address || `Lat: ${latitude}, Lng: ${longitude}`,
                updatedAt: new Date()
            },
            include: {
                agency: {
                    select: {
                        name: true
                    }
                }
            }
        });
        console.log(`TCC_DEBUG: Updated location for unit ${updatedUnit.unitNumber}:`, {
            latitude: updatedUnit.latitude,
            longitude: updatedUnit.longitude,
            address: updatedUnit.currentLocation
        });
        res.json({
            success: true,
            data: {
                id: updatedUnit.id,
                unitNumber: updatedUnit.unitNumber,
                currentLocation: updatedUnit.currentLocation,
                coordinates: {
                    lat: updatedUnit.latitude,
                    lng: updatedUnit.longitude
                },
                agencyName: updatedUnit.agency.name
            }
        });
    }
    catch (error) {
        console.error('Error updating unit location:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update unit location'
        });
    }
});
/**
 * POST /api/units/:unitId/location/clear
 * Clear unit's current location
 */
router.post('/:unitId/location/clear', authenticateAdmin_1.authenticateAdmin, async (req, res) => {
    try {
        const { unitId } = req.params;
        const prisma = databaseManager_1.databaseManager.getEMSDB();
        const updatedUnit = await prisma.unit.update({
            where: { id: unitId },
            data: {
                latitude: null,
                longitude: null,
                currentLocation: null,
                updatedAt: new Date()
            }
        });
        console.log(`TCC_DEBUG: Cleared location for unit ${updatedUnit.unitNumber}`);
        res.json({
            success: true,
            message: 'Unit location cleared successfully'
        });
    }
    catch (error) {
        console.error('Error clearing unit location:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to clear unit location'
        });
    }
});
/**
 * GET /api/units/:unitId/location/history
 * Get unit's location history (if implemented)
 */
router.get('/:unitId/location/history', authenticateAdmin_1.authenticateAdmin, async (req, res) => {
    try {
        const { unitId } = req.params;
        // For now, return empty array - could be implemented with location tracking
        res.json({
            success: true,
            data: [],
            message: 'Location history not yet implemented'
        });
    }
    catch (error) {
        console.error('Error fetching unit location history:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch location history'
        });
    }
});
exports.default = router;
//# sourceMappingURL=unitLocation.js.map