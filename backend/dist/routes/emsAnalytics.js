"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authenticateAdmin_1 = require("../middleware/authenticateAdmin");
const databaseManager_1 = require("../services/databaseManager");
const router = express_1.default.Router();
// Apply authentication to all routes
router.use(authenticateAdmin_1.authenticateAdmin);
// Restrict to EMS users only
router.use(async (req, res, next) => {
    if (!req.user || req.user.userType !== 'EMS') {
        return res.status(403).json({ success: false, error: 'EMS access required' });
    }
    next();
});
async function resolveAgencyContext(req) {
    const emsPrisma = databaseManager_1.databaseManager.getEMSDB();
    let agencyId = req.user?.id || null; // For EMS tokens, this should already be agencyId
    let agencyName = null;
    try {
        if (!agencyId && req.user?.email) {
            const emsUser = await emsPrisma.eMSUser.findUnique({ where: { email: req.user.email } });
            agencyId = emsUser?.agencyId || null;
        }
        if (agencyId) {
            const agency = await emsPrisma.eMSAgency.findUnique({ where: { id: agencyId } });
            agencyName = agency?.name || null;
        }
    }
    catch (error) {
        console.error('TCC_DEBUG: EMS agency resolution error:', error);
    }
    return { agencyId, agencyName };
}
/**
 * GET /api/ems/analytics/overview
 * Get agency-specific overview metrics
 */
router.get('/overview', async (req, res) => {
    try {
        const { agencyId, agencyName } = await resolveAgencyContext(req);
        if (!agencyId) {
            return res.status(400).json({ success: false, error: 'Unable to resolve EMS agency' });
        }
        const centerPrisma = databaseManager_1.databaseManager.getCenterDB();
        const [totalTrips, completedTrips, pendingTrips, responseTimes] = await Promise.all([
            centerPrisma.trip.count({ where: { assignedAgencyId: agencyId } }),
            centerPrisma.trip.count({ where: { assignedAgencyId: agencyId, status: 'COMPLETED' } }),
            centerPrisma.trip.count({ where: { assignedAgencyId: agencyId, status: 'PENDING' } }),
            centerPrisma.trip.findMany({
                where: { assignedAgencyId: agencyId, responseTimeMinutes: { not: null } },
                select: { responseTimeMinutes: true }
            })
        ]);
        const avgResponse = responseTimes.length > 0
            ? responseTimes.reduce((sum, t) => sum + (t.responseTimeMinutes || 0), 0) / responseTimes.length
            : 0;
        const efficiency = totalTrips > 0 ? completedTrips / totalTrips : 0;
        res.json({
            success: true,
            data: {
                totalTrips,
                completedTrips,
                pendingTrips,
                efficiency,
                averageResponseTime: avgResponse,
                agencyName: agencyName || 'Agency'
            }
        });
    }
    catch (error) {
        console.error('Get agency overview error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve agency overview'
        });
    }
});
/**
 * GET /api/ems/analytics/trips
 * Get agency-specific trip statistics
 */
router.get('/trips', async (req, res) => {
    try {
        const { agencyId } = await resolveAgencyContext(req);
        if (!agencyId) {
            return res.status(400).json({ success: false, error: 'Unable to resolve EMS agency' });
        }
        const prisma = databaseManager_1.databaseManager.getCenterDB();
        const [totalTrips, completedTrips, pendingTrips, cancelledTrips, responseTimes, tripDurations, byLevel, byPriority] = await Promise.all([
            prisma.transportRequest.count({ where: { assignedAgencyId: agencyId } }),
            prisma.transportRequest.count({ where: { assignedAgencyId: agencyId, status: 'COMPLETED' } }),
            prisma.transportRequest.count({ where: { assignedAgencyId: agencyId, status: 'PENDING' } }),
            prisma.transportRequest.count({ where: { assignedAgencyId: agencyId, status: 'CANCELLED' } }),
            prisma.transportRequest.findMany({ where: { assignedAgencyId: agencyId }, select: { acceptedTimestamp: true, requestTimestamp: true } }),
            prisma.transportRequest.findMany({ where: { assignedAgencyId: agencyId }, select: { completionTimestamp: true, departureTimestamp: true } }),
            prisma.transportRequest.groupBy({ by: ['transportLevel'], where: { assignedAgencyId: agencyId }, _count: { transportLevel: true } }),
            prisma.transportRequest.groupBy({ by: ['priority'], where: { assignedAgencyId: agencyId }, _count: { priority: true } })
        ]);
        const tripsByLevel = { BLS: 0, ALS: 0, CCT: 0 };
        byLevel.forEach((g) => { tripsByLevel[g.transportLevel] = g._count.transportLevel; });
        const tripsByPriority = { LOW: 0, MEDIUM: 0, HIGH: 0, URGENT: 0, CRITICAL: 0 };
        byPriority.forEach((g) => { tripsByPriority[g.priority] = g._count.priority; });
        const averageResponseTime = responseTimes.length > 0
            ? responseTimes.reduce((s, t) => {
                if (t.acceptedTimestamp && t.requestTimestamp) {
                    const responseTime = (new Date(t.acceptedTimestamp).getTime() - new Date(t.requestTimestamp).getTime()) / (1000 * 60); // minutes
                    return s + responseTime;
                }
                return s;
            }, 0) / responseTimes.length
            : 0;
        const averageTripDuration = tripDurations.length > 0
            ? tripDurations.reduce((s, t) => {
                if (t.completionTimestamp && t.departureTimestamp) {
                    const duration = (new Date(t.completionTimestamp).getTime() - new Date(t.departureTimestamp).getTime()) / (1000 * 60); // minutes
                    return s + duration;
                }
                return s;
            }, 0) / tripDurations.length
            : 0;
        res.json({
            success: true,
            data: {
                totalTrips,
                completedTrips,
                pendingTrips,
                cancelledTrips,
                tripsByLevel,
                tripsByPriority,
                averageTripDuration
            }
        });
    }
    catch (error) {
        console.error('Get agency trip statistics error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve agency trip statistics'
        });
    }
});
/**
 * GET /api/ems/analytics/units
 * Get agency-specific unit performance
 */
router.get('/units', async (req, res) => {
    try {
        const { agencyId } = await resolveAgencyContext(req);
        if (!agencyId) {
            return res.status(400).json({ success: false, error: 'Unable to resolve EMS agency' });
        }
        const emsPrisma = databaseManager_1.databaseManager.getEMSDB();
        const [totalUnits, activeUnits, availableUnits, committedUnits, outOfServiceUnits, topPerformingUnits] = await Promise.all([
            emsPrisma.unit.count({ where: { agencyId } }),
            emsPrisma.unit.count({ where: { agencyId, isActive: true } }),
            emsPrisma.unit.count({ where: { agencyId, currentStatus: 'AVAILABLE' } }),
            emsPrisma.unit.count({ where: { agencyId, currentStatus: { in: ['ASSIGNED', 'IN_PROGRESS'] } } }),
            emsPrisma.unit.count({ where: { agencyId, currentStatus: 'OUT_OF_SERVICE' } }),
            emsPrisma.unit.findMany({
                where: { agencyId },
                orderBy: { analytics: { totalTripsCompleted: 'desc' } },
                take: 5,
                select: {
                    id: true,
                    unitNumber: true,
                    analytics: {
                        select: { totalTripsCompleted: true, averageResponseTime: true }
                    }
                }
            })
        ]);
        const averageUtilization = totalUnits > 0 ? committedUnits / totalUnits : 0;
        res.json({
            success: true,
            data: {
                totalUnits,
                activeUnits,
                availableUnits,
                committedUnits,
                outOfServiceUnits,
                averageUtilization,
                topPerformingUnits
            }
        });
    }
    catch (error) {
        console.error('Get agency unit statistics error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve agency unit statistics'
        });
    }
});
/**
 * GET /api/ems/analytics/performance
 * Get agency-specific performance metrics
 * SIMPLIFIED: Reduced to basic metrics for Phase 3 simplification
 */
router.get('/performance', async (req, res) => {
    try {
        const { agencyId } = await resolveAgencyContext(req);
        if (!agencyId) {
            return res.status(400).json({ success: false, error: 'Unable to resolve EMS agency' });
        }
        const prisma = databaseManager_1.databaseManager.getCenterDB();
        // SIMPLIFIED: Only get basic trip counts, skip complex calculations
        const [totalTrips, completedTrips] = await Promise.all([
            prisma.transportRequest.count({ where: { assignedAgencyId: agencyId } }),
            prisma.transportRequest.count({ where: { assignedAgencyId: agencyId, status: 'COMPLETED' } })
        ]);
        // SIMPLIFIED: Basic completion rate only
        const completionRate = totalTrips > 0 ? completedTrips / totalTrips : 0;
        res.json({
            success: true,
            data: {
                totalTrips,
                completedTrips,
                completionRate,
                message: 'Simplified performance metrics - complex calculations removed for Phase 3'
            }
        });
    }
    catch (error) {
        console.error('Get agency performance statistics error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve agency performance statistics'
        });
    }
});
exports.default = router;
//# sourceMappingURL=emsAnalytics.js.map