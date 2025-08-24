import express from 'express';
import qrCodeService from '../services/qrCodeService';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * @route GET /api/qr/transport-request/:requestId
 * @desc Generate QR code for a specific transport request
 * @access Private
 */
router.get('/transport-request/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    
    if (!requestId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Transport request ID is required' 
      });
    }

    const result = await qrCodeService.generateTransportRequestQR(requestId);
    
    res.json({
      success: true,
      data: {
        qrCodeDataUrl: result.qrCodeDataUrl,
        qrCodeData: result.qrCodeData,
        requestId
      }
    });
      } catch (error) {
      console.error('[MedPort:QRCode] Error in transport request QR endpoint:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to generate transport request QR code'
      });
    }
});

/**
 * @route GET /api/qr/patient/:patientId
 * @desc Generate QR code for patient identification
 * @access Private
 */
router.get('/patient/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    
    if (!patientId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Patient ID is required' 
      });
    }

    const result = await qrCodeService.generatePatientQR(patientId);
    
    res.json({
      success: true,
      data: {
        qrCodeDataUrl: result.qrCodeDataUrl,
        qrCodeData: result.qrCodeData,
        patientId
      }
    });
      } catch (error) {
      console.error('[MedPort:QRCode] Error in patient QR endpoint:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to generate patient QR code'
      });
    }
});

/**
 * @route GET /api/qr/route/:routeId
 * @desc Generate QR code for route information
 * @access Private
 */
router.get('/route/:routeId', async (req, res) => {
  try {
    const { routeId } = req.params;
    
    if (!routeId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Route ID is required' 
      });
    }

    const result = await qrCodeService.generateRouteQR(routeId);
    
    res.json({
      success: true,
      data: {
        qrCodeDataUrl: result.qrCodeDataUrl,
        qrCodeData: result.qrCodeData,
        routeId
      }
    });
      } catch (error) {
      console.error('[MedPort:QRCode] Error in route QR endpoint:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to generate route QR code'
      });
    }
});

/**
 * @route GET /api/qr/facility/:facilityId
 * @desc Generate QR code for facility information
 * @access Private
 */
router.get('/facility/:facilityId', async (req, res) => {
  try {
    const { facilityId } = req.params;
    
    if (!facilityId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Facility ID is required' 
      });
    }

    const result = await qrCodeService.generateFacilityQR(facilityId);
    
    res.json({
      success: true,
      data: {
        qrCodeDataUrl: result.qrCodeDataUrl,
        qrCodeData: result.qrCodeData,
        facilityId
      }
    });
      } catch (error) {
      console.error('[MedPort:QRCode] Error in facility QR endpoint:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to generate facility QR code'
      });
    }
});

/**
 * @route POST /api/qr/bulk-transport-requests
 * @desc Generate QR codes for multiple transport requests
 * @access Private
 */
router.post('/bulk-transport-requests', async (req, res) => {
  try {
    const { requestIds } = req.body;
    
    if (!requestIds || !Array.isArray(requestIds) || requestIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Array of transport request IDs is required' 
      });
    }

    // Limit bulk generation to prevent abuse
    if (requestIds.length > 50) {
      return res.status(400).json({ 
        success: false, 
        message: 'Maximum 50 transport requests allowed for bulk generation' 
      });
    }

    const results = await qrCodeService.generateBulkTransportRequestQRs(requestIds);
    
    res.json({
      success: true,
      data: {
        results,
        totalGenerated: results.filter(r => r.qrCodeDataUrl).length,
        totalFailed: results.filter(r => !r.qrCodeDataUrl).length
      }
    });
      } catch (error) {
      console.error('[MedPort:QRCode] Error in bulk transport request QR endpoint:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to generate bulk transport request QR codes'
      });
    }
});

/**
 * @route POST /api/qr/validate
 * @desc Validate and decode QR code data
 * @access Private
 */
router.post('/validate', async (req, res) => {
  try {
    const { qrCodeString } = req.body;
    
    if (!qrCodeString) {
      return res.status(400).json({ 
        success: false, 
        message: 'QR code string is required' 
      });
    }

    const qrCodeData = qrCodeService.validateQRCode(qrCodeString);
    
    res.json({
      success: true,
      data: {
        qrCodeData,
        isValid: true,
        message: 'QR code is valid'
      }
    });
      } catch (error) {
      console.error('[MedPort:QRCode] Error in QR validation endpoint:', error);
      res.status(400).json({
        success: false,
        data: {
          isValid: false,
          message: error instanceof Error ? error.message : 'Invalid QR code'
        }
      });
    }
});

/**
 * @route GET /api/qr/health
 * @desc Health check endpoint for QR code service
 * @access Private
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'QR Code service is operational',
    timestamp: new Date().toISOString(),
    version: '1.0'
  });
});

export default router;
