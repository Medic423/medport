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
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`TCC_DEBUG: Geocoding endpoint error after ${duration}ms:`, error);
    console.error('TCC_DEBUG: Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('TCC_DEBUG: Error details:', {
      message: error.message,
      name: error.name,
      code: error.code
    });
    
    // Return 200 with success: false for better frontend handling
    // Frontend can distinguish between "not found" (200, success: false) and "server error" (500)
    res.status(200).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to geocode address. You can still save the destination and add coordinates manually.'
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

// Static subscription plans (used when subscription_plans table is not yet migrated)
const STATIC_PLANS: Record<string, any[]> = {
  HEALTHCARE: [
    { id: 'healthcare-free-plan', name: 'FREE', displayName: 'Free Trial', description: '7-day free trial to explore TRACC features', userType: 'HEALTHCARE', monthlyPrice: '0', annualPrice: '0', features: ['Create transport requests', 'View available EMS providers', 'Track transport status', 'Basic analytics', 'Email notifications'], trialDays: 7, isActive: true },
    { id: 'healthcare-regular-plan', name: 'REGULAR', displayName: 'Regular Plan', description: 'Full access to TRACC for small to medium healthcare facilities', userType: 'HEALTHCARE', monthlyPrice: '99', annualPrice: '990', features: ['All Free Trial features', 'Unlimited transport requests', 'Advanced analytics and reporting', 'Priority support', 'SMS notifications', 'Multi-location management', 'Custom integrations'], trialDays: 0, isActive: true },
    { id: 'healthcare-premium-plan', name: 'PREMIUM', displayName: 'Premium Plan', description: 'Enterprise features for large healthcare systems', userType: 'HEALTHCARE', monthlyPrice: '299', annualPrice: '2990', features: ['All Regular Plan features', 'Dedicated account manager', 'Custom API access', 'Advanced route optimization', 'White-label options', '24/7 phone support', 'Custom training sessions'], trialDays: 0, isActive: true },
  ],
  EMS: [
    { id: 'ems-free-plan', name: 'FREE', displayName: 'Free Trial', description: '7-day free trial to explore TRACC features', userType: 'EMS', monthlyPrice: '0', annualPrice: '0', features: ['Receive trip notifications', 'View available trips', 'Accept/decline requests', 'Track completed transports', 'Basic analytics'], trialDays: 7, isActive: true },
    { id: 'ems-regular-plan', name: 'REGULAR', displayName: 'Regular Plan', description: 'Full access to TRACC for small to medium EMS agencies', userType: 'EMS', monthlyPrice: '79', annualPrice: '790', features: ['All Free Trial features', 'Unlimited trip responses', 'Advanced analytics and reporting', 'Priority trip notifications', 'SMS notifications', 'Multi-unit management', 'Route optimization'], trialDays: 0, isActive: true },
    { id: 'ems-premium-plan', name: 'PREMIUM', displayName: 'Premium Plan', description: 'Enterprise features for large EMS operations', userType: 'EMS', monthlyPrice: '199', annualPrice: '1990', features: ['All Regular Plan features', 'Dedicated account manager', 'Custom API access', 'Advanced route optimization', 'Revenue analytics', '24/7 phone support', 'Custom training sessions'], trialDays: 0, isActive: true },
  ],
};

router.get('/subscription-plans', async (req, res) => {
  try {
    const userType = (req.query.userType as string) || 'HEALTHCARE';
    const plans = STATIC_PLANS[userType] || STATIC_PLANS.HEALTHCARE;
    res.json({ success: true, data: plans });
  } catch (error) {
    console.error('TCC_DEBUG: Get subscription plans error:', error);
    res.status(500).json({ success: false, error: 'Failed to load subscription plans' });
  }
});

export default router;

