"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const tripService_1 = require("../services/tripService");
const authenticateAdmin_1 = require("../middleware/authenticateAdmin");
const router = express_1.default.Router();
/**
 * POST /api/trips
 * Create a new transport request
 */
router.post('/', async (req, res) => {
    try {
        console.log('TCC_DEBUG: Create trip request received:', req.body);
        const { patientId, originFacilityId, destinationFacilityId, transportLevel, urgencyLevel, priority, specialNeeds, readyStart, readyEnd, isolation, bariatric, pickupLocationId, } = req.body;
        // Validation
        if (!patientId || !originFacilityId || !destinationFacilityId || !transportLevel || !priority) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: patientId, originFacilityId, destinationFacilityId, transportLevel, priority'
            });
        }
        if (!['BLS', 'ALS', 'CCT'].includes(transportLevel)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid transport level. Must be BLS, ALS, or CCT'
            });
        }
        if (!['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(priority)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid priority. Must be LOW, MEDIUM, HIGH, or CRITICAL'
            });
        }
        const tripData = {
            patientId,
            originFacilityId,
            destinationFacilityId,
            transportLevel,
            urgencyLevel: urgencyLevel || 'Routine',
            priority,
            specialNeeds,
            readyStart,
            readyEnd,
            isolation: isolation || false,
            bariatric: bariatric || false,
            createdById: null, // TODO: Get from authenticated user
        };
        const result = await tripService_1.tripService.createTrip({
            ...tripData,
            pickupLocationId,
        });
        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: result.error
            });
        }
        res.status(201).json({
            success: true,
            message: 'Transport request created successfully',
            data: result.data
        });
    }
    catch (error) {
        console.error('TCC_DEBUG: Create trip error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
/**
 * POST /api/trips/enhanced
 * Create a new enhanced transport request with comprehensive patient and clinical details
 */
router.post('/enhanced', authenticateAdmin_1.authenticateAdmin, async (req, res) => {
    try {
        console.log('TCC_DEBUG: Create enhanced trip request received:', req.body);
        console.log('TCC_DEBUG: Authenticated user:', req.user);
        const { patientId, patientWeight, specialNeeds, insuranceCompany, fromLocation, fromLocationId, pickupLocationId, toLocation, scheduledTime, transportLevel, urgencyLevel, diagnosis, mobilityLevel, oxygenRequired, monitoringRequired, generateQRCode, selectedAgencies, notificationRadius, notes, priority, 
        // TCC Command: Audit trail fields
        createdByTCCUserId, createdByTCCUserEmail, createdVia } = req.body;
        // Validation
        if (!fromLocation || !toLocation || !transportLevel || !urgencyLevel) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: fromLocation, toLocation, transportLevel, urgencyLevel'
            });
        }
        // Set default scheduled time if not provided
        const finalScheduledTime = scheduledTime || new Date().toISOString();
        if (!['BLS', 'ALS', 'CCT', 'Other'].includes(transportLevel)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid transport level. Must be BLS, ALS, CCT, or Other'
            });
        }
        if (!['Routine', 'Urgent', 'Emergent'].includes(urgencyLevel)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid urgency level. Must be Routine, Urgent, or Emergent'
            });
        }
        const enhancedTripData = {
            patientId,
            patientWeight,
            specialNeeds,
            insuranceCompany,
            fromLocation,
            fromLocationId,
            pickupLocationId,
            toLocation,
            scheduledTime: finalScheduledTime,
            transportLevel,
            urgencyLevel,
            diagnosis,
            mobilityLevel,
            oxygenRequired: oxygenRequired || false,
            monitoringRequired: monitoringRequired || false,
            generateQRCode: generateQRCode || false,
            selectedAgencies: selectedAgencies || [],
            notificationRadius: notificationRadius || 100,
            notes,
            priority,
            healthcareUserId: req.user?.userType === 'HEALTHCARE' ? req.user.id : undefined, // ✅ CRITICAL: Set healthcare user ID
            // ✅ TCC Command: Audit trail
            createdByTCCUserId,
            createdByTCCUserEmail,
            createdVia
        };
        // Log TCC command audit trail if applicable
        if (createdByTCCUserId) {
            console.log('TCC_COMMAND: Trip being created by TCC staff:', {
                tccUserId: createdByTCCUserId,
                tccUserEmail: createdByTCCUserEmail,
                facilityId: fromLocationId,
                facility: fromLocation,
                createdVia
            });
        }
        const result = await tripService_1.tripService.createEnhancedTrip(enhancedTripData);
        console.log('TCC_DEBUG: Enhanced trip created successfully:', result);
        res.status(201).json(result);
    }
    catch (error) {
        console.error('TCC_DEBUG: Error creating enhanced trip:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create enhanced transport request'
        });
    }
});
/**
 * GET /api/trips
 * Get all transport requests with optional filtering
 */
router.get('/', authenticateAdmin_1.authenticateAdmin, async (req, res) => {
    try {
        console.log('TCC_DEBUG: Get trips request with query:', req.query);
        console.log('TCC_DEBUG: Authenticated user:', req.user);
        const filters = {
            status: req.query.status,
            transportLevel: req.query.transportLevel,
            priority: req.query.priority,
            agencyId: req.query.agencyId,
            healthcareUserId: req.user?.userType === 'HEALTHCARE' ? req.user.id : undefined, // ✅ NEW: Filter by healthcare user
        };
        const result = await tripService_1.tripService.getTrips(filters);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: result.error
            });
        }
        res.json({
            success: true,
            data: result.data
        });
    }
    catch (error) {
        console.error('TCC_DEBUG: Get trips error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
/**
 * GET /api/trips/history
 * Get trip history with timeline and filtering
 */
router.get('/history', authenticateAdmin_1.authenticateAdmin, async (req, res) => {
    try {
        console.log('TCC_DEBUG: Get trip history request with query:', req.query);
        const { status, agencyId, dateFrom, dateTo, limit = '50', offset = '0', search } = req.query;
        const result = await tripService_1.tripService.getTripHistory({
            status: status,
            agencyId: agencyId,
            dateFrom: dateFrom,
            dateTo: dateTo,
            limit: parseInt(limit),
            offset: parseInt(offset),
            search: search
        });
        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: result.error
            });
        }
        res.json({
            success: true,
            data: result.data
        });
    }
    catch (error) {
        console.error('TCC_DEBUG: Get trip history error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
/**
 * GET /api/trips/:id
 * Get a single transport request by ID
 */
router.get('/:id', authenticateAdmin_1.authenticateAdmin, async (req, res) => {
    try {
        console.log('TCC_DEBUG: Get trip by ID request:', req.params.id);
        const { id } = req.params;
        const result = await tripService_1.tripService.getTripById(id);
        if (!result.success) {
            return res.status(404).json({
                success: false,
                error: result.error
            });
        }
        res.json({
            success: true,
            data: result.data
        });
    }
    catch (error) {
        console.error('TCC_DEBUG: Get trip by ID error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
/**
 * PUT /api/trips/:id/status
 * Update trip status (accept/decline/complete)
 */
router.put('/:id/status', async (req, res) => {
    try {
        console.log('TCC_DEBUG: Update trip status request:', { id: req.params.id, body: req.body });
        const { id } = req.params;
        const { status, assignedAgencyId, assignedUnitId, acceptedTimestamp, pickupTimestamp, arrivalTimestamp, departureTimestamp, completionTimestamp, urgencyLevel, transportLevel, diagnosis, mobilityLevel, insuranceCompany, specialNeeds, oxygenRequired, monitoringRequired, pickupLocation, } = req.body;
        if (!status) {
            return res.status(400).json({
                success: false,
                error: 'Status is required'
            });
        }
        if (!['PENDING', 'ACCEPTED', 'DECLINED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status. Must be PENDING, ACCEPTED, DECLINED, IN_PROGRESS, COMPLETED, or CANCELLED'
            });
        }
        const updateData = {
            status,
            assignedAgencyId,
            assignedUnitId,
            acceptedTimestamp,
            pickupTimestamp,
            arrivalTimestamp,
            departureTimestamp,
            completionTimestamp,
            urgencyLevel,
            transportLevel,
            diagnosis,
            mobilityLevel,
            insuranceCompany,
            specialNeeds,
            oxygenRequired,
            monitoringRequired,
            pickupLocation,
        };
        const result = await tripService_1.tripService.updateTripStatus(id, updateData);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: result.error
            });
        }
        res.json({
            success: true,
            message: 'Transport request status updated successfully',
            data: result.data
        });
    }
    catch (error) {
        console.error('TCC_DEBUG: Update trip status error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
/**
 * GET /api/trips/agencies/available
 * Get available EMS agencies for assignment
 */
router.get('/agencies/available', async (req, res) => {
    try {
        console.log('TCC_DEBUG: Get available agencies request');
        const result = await tripService_1.tripService.getAvailableAgencies();
        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: result.error
            });
        }
        res.json({
            success: true,
            data: result.data
        });
    }
    catch (error) {
        console.error('TCC_DEBUG: Get available agencies error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
/**
 * GET /api/trips/notifications/settings
 * Get notification settings for a user
 */
router.get('/notifications/settings', authenticateAdmin_1.authenticateAdmin, async (req, res) => {
    try {
        console.log('TCC_DEBUG: Get notification settings request for user:', req.user?.id);
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated'
            });
        }
        const settings = await tripService_1.tripService.getNotificationSettings(userId);
        res.json({
            success: true,
            data: settings
        });
    }
    catch (error) {
        console.error('TCC_DEBUG: Get notification settings error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
/**
 * PUT /api/trips/notifications/settings
 * Update notification settings for a user
 */
router.put('/notifications/settings', authenticateAdmin_1.authenticateAdmin, async (req, res) => {
    try {
        console.log('TCC_DEBUG: Update notification settings request for user:', req.user?.id);
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated'
            });
        }
        const { emailNotifications, smsNotifications, newTripAlerts, statusUpdates, emailAddress, phoneNumber } = req.body;
        const settings = {
            emailNotifications: emailNotifications !== undefined ? emailNotifications : true,
            smsNotifications: smsNotifications !== undefined ? smsNotifications : true,
            newTripAlerts: newTripAlerts !== undefined ? newTripAlerts : true,
            statusUpdates: statusUpdates !== undefined ? statusUpdates : true,
            emailAddress: emailAddress || null,
            phoneNumber: phoneNumber || null
        };
        const result = await tripService_1.tripService.updateNotificationSettings(userId, settings);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: result.error
            });
        }
        res.json({
            success: true,
            message: 'Notification settings updated successfully',
            data: settings
        });
    }
    catch (error) {
        console.error('TCC_DEBUG: Update notification settings error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
/**
 * POST /api/trips/test-email
 * Test email service connection
 */
router.post('/test-email', authenticateAdmin_1.authenticateAdmin, async (req, res) => {
    try {
        console.log('TCC_DEBUG: Test email service request received');
        console.log('TCC_DEBUG: Authenticated user:', req.user);
        console.log('TCC_DEBUG: Importing email service...');
        const emailService = (await Promise.resolve().then(() => __importStar(require('../services/emailService')))).default;
        console.log('TCC_DEBUG: Email service imported successfully');
        console.log('TCC_DEBUG: Testing email connection...');
        const isConnected = await emailService.testEmailConnection();
        console.log('TCC_DEBUG: Email connection test result:', isConnected);
        if (isConnected) {
            console.log('TCC_DEBUG: Email service connection successful');
            res.json({
                success: true,
                message: 'Email service connection successful'
            });
        }
        else {
            console.log('TCC_DEBUG: Email service connection failed');
            res.status(500).json({
                success: false,
                error: 'Email service connection failed'
            });
        }
    }
    catch (error) {
        console.error('TCC_DEBUG: Test email service error:', error);
        console.error('TCC_DEBUG: Error stack:', error?.stack);
        res.status(500).json({
            success: false,
            error: 'Internal server error: ' + (error?.message || 'Unknown error')
        });
    }
});
/**
 * POST /api/trips/test-sms
 * Test SMS service connection
 */
router.post('/test-sms', authenticateAdmin_1.authenticateAdmin, async (req, res) => {
    try {
        console.log('TCC_DEBUG: Test SMS service request received');
        console.log('TCC_DEBUG: Authenticated user:', req.user);
        console.log('TCC_DEBUG: Importing email service for SMS...');
        const emailService = (await Promise.resolve().then(() => __importStar(require('../services/emailService')))).default;
        console.log('TCC_DEBUG: Email service imported successfully for SMS');
        console.log('TCC_DEBUG: Testing SMS connection...');
        const isConnected = await emailService.testSMSConnection();
        console.log('TCC_DEBUG: SMS connection test result:', isConnected);
        if (isConnected) {
            console.log('TCC_DEBUG: SMS service connection successful');
            res.json({
                success: true,
                message: 'SMS service connection successful'
            });
        }
        else {
            console.log('TCC_DEBUG: SMS service connection failed');
            res.status(500).json({
                success: false,
                error: 'SMS service connection failed'
            });
        }
    }
    catch (error) {
        console.error('TCC_DEBUG: Test SMS service error:', error);
        console.error('TCC_DEBUG: Error stack:', error?.stack);
        res.status(500).json({
            success: false,
            error: 'Internal server error: ' + (error?.message || 'Unknown error')
        });
    }
});
/**
 * GET /api/trips/agencies/:hospitalId
 * Get agencies within distance for a hospital
 */
router.get('/agencies/:hospitalId', authenticateAdmin_1.authenticateAdmin, async (req, res) => {
    try {
        const { hospitalId } = req.params;
        const { radius = 100 } = req.query;
        const result = await tripService_1.tripService.getAgenciesForHospital(hospitalId);
        res.json(result);
    }
    catch (error) {
        console.error('TCC_DEBUG: Get agencies error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get agencies for hospital'
        });
    }
});
/**
 * PUT /api/trips/:id/assign-unit
 * Assign a unit to a trip
 */
router.put('/:id/assign-unit', async (req, res) => {
    try {
        console.log('TCC_DEBUG: Assign unit request:', { id: req.params.id, body: req.body });
        const { id } = req.params;
        const { unitId, agencyId } = req.body;
        if (!unitId) {
            return res.status(400).json({
                success: false,
                error: 'Unit ID is required'
            });
        }
        // Use the existing updateTripStatus method to assign the unit
        const result = await tripService_1.tripService.updateTripStatus(id, {
            status: 'ACCEPTED', // Keep current status or set to ACCEPTED
            assignedUnitId: unitId,
            assignedAgencyId: agencyId
        });
        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: result.error
            });
        }
        res.json({
            success: true,
            message: 'Unit assigned successfully',
            data: result.data
        });
    }
    catch (error) {
        console.error('TCC_DEBUG: Assign unit error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to assign unit to trip'
        });
    }
});
/**
 * PUT /api/trips/:id/times
 * Update trip time tracking
 */
router.put('/:id/times', async (req, res) => {
    try {
        const { id } = req.params;
        const { transferAcceptedTime, emsArrivalTime, emsDepartureTime } = req.body;
        const result = await tripService_1.tripService.updateTripTimes(id, {
            transferAcceptedTime,
            emsArrivalTime,
            emsDepartureTime
        });
        res.json(result);
    }
    catch (error) {
        console.error('TCC_DEBUG: Update trip times error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update trip times'
        });
    }
});
/**
 * GET /api/trips/options/diagnosis
 * Get diagnosis options
 */
router.get('/options/diagnosis', async (req, res) => {
    try {
        const result = tripService_1.tripService.getDiagnosisOptions();
        res.json(result);
    }
    catch (error) {
        console.error('TCC_DEBUG: Get diagnosis options error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get diagnosis options'
        });
    }
});
/**
 * GET /api/trips/options/mobility
 * Get mobility options
 */
router.get('/options/mobility', async (req, res) => {
    try {
        const result = tripService_1.tripService.getMobilityOptions();
        res.json(result);
    }
    catch (error) {
        console.error('TCC_DEBUG: Get mobility options error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get mobility options'
        });
    }
});
/**
 * GET /api/trips/options/transport-level
 * Get transport level options
 */
router.get('/options/transport-level', async (req, res) => {
    try {
        const result = tripService_1.tripService.getTransportLevelOptions();
        res.json(result);
    }
    catch (error) {
        console.error('TCC_DEBUG: Get transport level options error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get transport level options'
        });
    }
});
/**
 * GET /api/trips/options/urgency
 * Get urgency options
 */
router.get('/options/urgency', async (req, res) => {
    try {
        const result = tripService_1.tripService.getUrgencyOptions();
        res.json(result);
    }
    catch (error) {
        console.error('TCC_DEBUG: Get urgency options error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get urgency options'
        });
    }
});
/**
 * GET /api/trips/options/insurance
 * Get insurance company options
 */
router.get('/options/insurance', async (req, res) => {
    try {
        const result = await tripService_1.tripService.getInsuranceOptions();
        res.json(result);
    }
    catch (error) {
        console.error('TCC_DEBUG: Get insurance options error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get insurance options'
        });
    }
});
// ============================================================================
// NEW TRIP ENDPOINTS WITH RESPONSE HANDLING
// Phase 1C: Basic API Endpoints implementation
// ============================================================================
/**
 * POST /api/trips/with-responses
 * Create a new trip with response handling capabilities
 */
router.post('/with-responses', authenticateAdmin_1.authenticateAdmin, async (req, res) => {
    try {
        console.log('TCC_DEBUG: Create trip with responses request received:', req.body);
        console.log('TCC_DEBUG: Authenticated user (with-responses):', req.user);
        const { patientId, patientWeight, specialNeeds, insuranceCompany, fromLocation, pickupLocationId, toLocation, scheduledTime, transportLevel, urgencyLevel, diagnosis, mobilityLevel, oxygenRequired, monitoringRequired, generateQRCode, selectedAgencies, notificationRadius, notes, priority, responseDeadline, maxResponses, selectionMode } = req.body;
        // Validation
        if (!fromLocation || !toLocation || !transportLevel || !urgencyLevel) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: fromLocation, toLocation, transportLevel, urgencyLevel'
            });
        }
        if (!['BLS', 'ALS', 'CCT', 'Other'].includes(transportLevel)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid transport level. Must be BLS, ALS, CCT, or Other'
            });
        }
        if (!['Routine', 'Urgent', 'Emergent'].includes(urgencyLevel)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid urgency level. Must be Routine, Urgent, or Emergent'
            });
        }
        if (selectionMode && !['BROADCAST', 'SPECIFIC_AGENCIES'].includes(selectionMode)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid selection mode. Must be BROADCAST or SPECIFIC_AGENCIES'
            });
        }
        const tripData = {
            patientId,
            patientWeight,
            specialNeeds,
            insuranceCompany,
            fromLocation,
            pickupLocationId,
            toLocation,
            scheduledTime: scheduledTime || new Date().toISOString(),
            transportLevel,
            urgencyLevel,
            diagnosis,
            mobilityLevel,
            oxygenRequired: oxygenRequired || false,
            monitoringRequired: monitoringRequired || false,
            generateQRCode: generateQRCode || false,
            selectedAgencies: selectedAgencies || [],
            notificationRadius: notificationRadius || 100,
            notes,
            priority,
            responseDeadline,
            maxResponses: maxResponses || 5,
            selectionMode: selectionMode || 'SPECIFIC_AGENCIES',
            // ✅ Ensure healthcareCreatedById is set by passing healthcareUserId into service
            healthcareUserId: req.user?.userType === 'HEALTHCARE' ? req.user.id : undefined
        };
        const result = await tripService_1.tripService.createTripWithResponses(tripData);
        console.log('TCC_DEBUG: Trip with responses created successfully:', result);
        res.status(201).json(result);
    }
    catch (error) {
        console.error('TCC_DEBUG: Error creating trip with responses:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create trip with response handling'
        });
    }
});
/**
 * PUT /api/trips/:id/response-fields
 * Update trip response handling fields
 */
router.put('/:id/response-fields', async (req, res) => {
    try {
        console.log('TCC_DEBUG: Update trip response fields request:', { id: req.params.id, body: req.body });
        const { id } = req.params;
        const { responseDeadline, maxResponses, responseStatus, selectionMode } = req.body;
        if (responseStatus && !['PENDING', 'RESPONSES_RECEIVED', 'AGENCY_SELECTED'].includes(responseStatus)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid response status. Must be PENDING, RESPONSES_RECEIVED, or AGENCY_SELECTED'
            });
        }
        if (selectionMode && !['BROADCAST', 'SPECIFIC_AGENCIES'].includes(selectionMode)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid selection mode. Must be BROADCAST or SPECIFIC_AGENCIES'
            });
        }
        const updateData = {
            responseDeadline,
            maxResponses,
            responseStatus,
            selectionMode
        };
        const result = await tripService_1.tripService.updateTripResponseFields(id, updateData);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: result.error
            });
        }
        res.json({
            success: true,
            message: 'Trip response fields updated successfully',
            data: result.data
        });
    }
    catch (error) {
        console.error('TCC_DEBUG: Update trip response fields error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
/**
 * GET /api/trips/:id/with-responses
 * Get a trip with all agency responses
 */
router.get('/:id/with-responses', async (req, res) => {
    try {
        console.log('TCC_DEBUG: Get trip with responses request:', req.params.id);
        const { id } = req.params;
        const result = await tripService_1.tripService.getTripWithResponses(id);
        if (!result.success) {
            return res.status(404).json({
                success: false,
                error: result.error
            });
        }
        res.json({
            success: true,
            data: result.data
        });
    }
    catch (error) {
        console.error('TCC_DEBUG: Get trip with responses error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
/**
 * GET /api/trips/:id/response-summary
 * Get response summary for a trip
 */
router.get('/:id/response-summary', async (req, res) => {
    try {
        console.log('TCC_DEBUG: Get response summary request:', req.params.id);
        const { id } = req.params;
        const result = await tripService_1.tripService.getTripResponseSummary(id);
        if (!result.success) {
            return res.status(404).json({
                success: false,
                error: result.error
            });
        }
        res.json({
            success: true,
            data: result.data
        });
    }
    catch (error) {
        console.error('TCC_DEBUG: Get response summary error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
/**
 * POST /api/trips/calculate-distance
 * Calculate distance and estimated time for a trip
 */
router.post('/calculate-distance', async (req, res) => {
    try {
        console.log('TCC_DEBUG: Calculate distance request:', req.body);
        const { fromLocation, toLocation, fromLocationId, destinationFacilityId } = req.body;
        if (!fromLocation && !fromLocationId) {
            return res.status(400).json({
                success: false,
                error: 'Either fromLocation or fromLocationId is required'
            });
        }
        if (!toLocation && !destinationFacilityId) {
            return res.status(400).json({
                success: false,
                error: 'Either toLocation or destinationFacilityId is required'
            });
        }
        const result = await tripService_1.tripService.calculateTripDistanceAndTime({
            fromLocation,
            toLocation,
            fromLocationId,
            destinationFacilityId
        });
        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: result.error
            });
        }
        res.json({
            success: true,
            data: result.data
        });
    }
    catch (error) {
        console.error('TCC_DEBUG: Calculate distance error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=trips.js.map