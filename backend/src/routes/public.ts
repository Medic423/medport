import express from 'express';
import { GeocodingService } from '../utils/geocodingService';
import { databaseManager } from '../services/databaseManager';

const router = express.Router();

// Public geocoding endpoint (no auth required)
router.post('/geocode', async (req, res) => {
  const startTime = Date.now();
  try {
    console.log('TCC_DEBUG: Public geocoding endpoint called with body:', JSON.stringify(req.body));
    const { address, city, state, zipCode, facilityName } = req.body;

    if (!address || !city || !state || !zipCode) {
      console.warn('TCC_DEBUG: Missing required fields:', { address: !!address, city: !!city, state: !!state, zipCode: !!zipCode });
      return res.status(400).json({
        success: false,
        error: 'Address, city, state, and zipCode are required'
      });
    }

    console.log('TCC_DEBUG: Calling GeocodingService with:', { address, city, state, zipCode, facilityName });
    const result = await GeocodingService.geocodeAddress(
      address,
      city,
      state,
      zipCode,
      facilityName
    );

    const duration = Date.now() - startTime;
    console.log(`TCC_DEBUG: GeocodingService completed in ${duration}ms, result:`, JSON.stringify(result));

    if (result.success) {
      res.json({
        success: true,
        data: {
          latitude: result.latitude,
          longitude: result.longitude
        }
      });
    } else {
      console.warn('TCC_DEBUG: Geocoding failed:', result.error);
      // Return 200 with success: false instead of 404 to avoid confusion with route not found
      res.status(200).json({
        success: false,
        error: result.error || 'Could not find coordinates for this address'
      });
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`TCC_DEBUG: Geocoding endpoint error after ${duration}ms:`, error);
    console.error('TCC_DEBUG: Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to geocode address'
    });
  }
});

// Public categories endpoint
router.get('/categories', async (req, res) => {
  try {
    const hospitalPrisma = databaseManager.getPrismaClient();
    
    const categories = await hospitalPrisma.dropdownOption.findMany({
      select: {
        category: true
      },
      distinct: ['category'],
      where: {
        isActive: true
      }
    });

    res.json({
      success: true,
      data: categories.map((c: { category: string }) => c.category),
      message: 'Categories retrieved successfully'
    });
  } catch (error) {
    console.error('TCC_DEBUG: Get public categories error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get categories'
    });
  }
});

// Public hospitals endpoint
router.get('/hospitals', async (req, res) => {
  try {
    const prisma = databaseManager.getPrismaClient();
    
    // Only query hospitals table for production data (schema uses Hospital model)
    const hospitals = await prisma.hospital.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        phone: true,
        email: true,
        type: true,
        latitude: true,
        longitude: true
      }
    });

    // Sort by name
    hospitals.sort((a, b) => a.name.localeCompare(b.name));

    console.log('TCC_DEBUG: Public hospitals endpoint - Hospitals:', hospitals.length);

    res.json({
      success: true,
      data: hospitals,
      message: 'Hospitals retrieved successfully'
    });
  } catch (error) {
    console.error('TCC_DEBUG: Get public hospitals error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get hospitals'
    });
  }
});

export default router;

