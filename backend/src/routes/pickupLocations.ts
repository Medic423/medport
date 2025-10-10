import express from 'express';
import { databaseManager } from '../services/databaseManager';
import { authenticateAdmin, AuthenticatedRequest } from '../middleware/authenticateAdmin';

const router = express.Router();

// Get all pickup locations for a specific hospital or facility
router.get('/hospital/:hospitalId', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { hospitalId } = req.params;
    const { includeInactive } = req.query;

    console.log('TCC_DEBUG: Loading pickup locations for ID:', hospitalId);

    // Check if this ID is a healthcare location (for multi-location facilities)
    const healthcareLocation = await databaseManager.getPrismaClient().healthcareLocation.findUnique({
      where: { id: hospitalId }
    });

    let actualHospitalId = hospitalId;
    
    if (healthcareLocation) {
      console.log('TCC_DEBUG: Found healthcare location:', healthcareLocation.locationName);
      // Use the healthcare location ID directly
      actualHospitalId = healthcareLocation.id;
    } else {
      // First, try to find if this ID is a facility
      const facility = await databaseManager.getPrismaClient().facility.findUnique({
        where: { id: hospitalId }
      });
      
      if (facility) {
        console.log('TCC_DEBUG: Found facility:', facility.name, 'type:', facility.type);
        
        // If it's a facility, we need to find the corresponding hospital
        if (facility.type === 'HOSPITAL') {
          // Find matching hospital by name
          const matchingHospital = await databaseManager.getPrismaClient().hospital.findFirst({
            where: {
              OR: [
                { name: { contains: facility.name, mode: 'insensitive' } },
                { name: { contains: 'Altoona Regional', mode: 'insensitive' } } // Special case for Altoona facilities
              ]
            }
          });
          
          if (matchingHospital) {
            actualHospitalId = matchingHospital.id;
            console.log('TCC_DEBUG: Mapped facility to hospital:', matchingHospital.name);
          } else {
            console.log('TCC_DEBUG: No matching hospital found for facility:', facility.name);
            // Return empty array if no matching hospital
            return res.json({
              success: true,
              data: []
            });
          }
        } else {
          console.log('TCC_DEBUG: Facility is not a hospital type:', facility.type);
          // Return empty array for non-hospital facilities
          return res.json({
            success: true,
            data: []
          });
        }
      }
    }

    const whereClause: any = {
      hospitalId: actualHospitalId
    };

    // Only include active locations unless specifically requested
    if (includeInactive !== 'true') {
      whereClause.isActive = true;
    }

    console.log('TCC_DEBUG: Querying pickup locations with hospitalId:', actualHospitalId);

    const pickup_locationss = await databaseManager.getPrismaClient().pickup_locations.findMany({
      where: whereClause,
      orderBy: {
        name: 'asc'
      }
    });

    console.log('TCC_DEBUG: Found pickup locations:', pickup_locationss.length);

    res.json({
      success: true,
      data: pickup_locationss
    });
  } catch (error) {
    console.error('Error fetching pickup locations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pickup locations'
    });
  }
});

// Get a specific pickup location by ID
router.get('/:id', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    const pickup_locations = await databaseManager.getPrismaClient().pickup_locations.findUnique({
      where: { id }
    });

    if (!pickup_locations) {
      return res.status(404).json({
        success: false,
        error: 'Pickup location not found'
      });
    }

    res.json({
      success: true,
      data: pickup_locations
    });
  } catch (error) {
    console.error('Error fetching pickup location:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pickup location'
    });
  }
});

// Create a new pickup location
router.post('/', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const {
      hospitalId,
      name,
      description,
      contactPhone,
      contactEmail,
      floor,
      room
    } = req.body;

    // Validate required fields
    if (!hospitalId || !name) {
      return res.status(400).json({
        success: false,
        error: 'Hospital ID and name are required'
      });
    }

    // Verify hospital or healthcare location exists
    const hospital = await databaseManager.getPrismaClient().hospital.findUnique({
      where: { id: hospitalId }
    });

    // If not found in Hospital table, check HealthcareLocation table
    if (!hospital) {
      const healthcareLocation = await databaseManager.getPrismaClient().healthcareLocation.findUnique({
        where: { id: hospitalId }
      });

      if (!healthcareLocation) {
        return res.status(404).json({
          success: false,
          error: 'Hospital or healthcare location not found'
        });
      }

      console.log('TCC_DEBUG: Creating pickup location for healthcare location:', healthcareLocation.locationName);
    } else {
      console.log('TCC_DEBUG: Creating pickup location for hospital:', hospital.name);
    }

    // Check if pickup location with same name already exists for this hospital
    const existingLocation = await databaseManager.getPrismaClient().pickup_locations.findFirst({
      where: {
        hospitalId,
        name: name.trim(),
        isActive: true
      }
    });

    if (existingLocation) {
      return res.status(409).json({
        success: false,
        error: 'A pickup location with this name already exists for this hospital'
      });
    }

    const pickup_locations = await databaseManager.getPrismaClient().pickup_locations.create({
      data: {
        id: `pickup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        hospitalId,
        name: name.trim(),
        description: description?.trim() || null,
        contactPhone: contactPhone?.trim() || null,
        contactEmail: contactEmail?.trim() || null,
        floor: floor?.trim() || null,
        room: room?.trim() || null,
        updatedAt: new Date()
      }
      // Note: Not including hospitals relation since it's optional and may not exist for healthcare locations
    });

    res.status(201).json({
      success: true,
      data: pickup_locations,
      message: 'Pickup location created successfully'
    });
  } catch (error) {
    console.error('Error creating pickup location:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('Error details:', errorMessage);
    console.error('Error stack:', errorStack);
    res.status(500).json({
      success: false,
      error: 'Failed to create pickup location',
      details: errorMessage
    });
  }
});

// Update a pickup location
router.put('/:id', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      contactPhone,
      contactEmail,
      floor,
      room,
      isActive
    } = req.body;

    // Check if pickup location exists
    const existingLocation = await databaseManager.getPrismaClient().pickup_locations.findUnique({
      where: { id }
    });

    if (!existingLocation) {
      return res.status(404).json({
        success: false,
        error: 'Pickup location not found'
      });
    }

    // If updating name, check for duplicates
    if (name && name.trim() !== existingLocation.name) {
      const duplicateLocation = await databaseManager.getPrismaClient().pickup_locations.findFirst({
        where: {
          hospitalId: existingLocation.hospitalId,
          name: name.trim(),
          isActive: true,
          id: { not: id }
        }
      });

      if (duplicateLocation) {
        return res.status(409).json({
          success: false,
          error: 'A pickup location with this name already exists for this hospital'
        });
      }
    }

    const updatedLocation = await databaseManager.getPrismaClient().pickup_locations.update({
      where: { id },
      data: {
        name: name?.trim() || existingLocation.name,
        description: description?.trim() || existingLocation.description,
        contactPhone: contactPhone?.trim() || existingLocation.contactPhone,
        contactEmail: contactEmail?.trim() || existingLocation.contactEmail,
        floor: floor?.trim() || existingLocation.floor,
        room: room?.trim() || existingLocation.room,
        isActive: isActive !== undefined ? isActive : existingLocation.isActive
      }
    });

    res.json({
      success: true,
      data: updatedLocation,
      message: 'Pickup location updated successfully'
    });
  } catch (error) {
    console.error('Error updating pickup location:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update pickup location'
    });
  }
});

// Delete a pickup location (soft delete by setting isActive to false)
router.delete('/:id', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    // Check if pickup location exists
    const existingLocation = await databaseManager.getPrismaClient().pickup_locations.findUnique({
      where: { id }
    });

    if (!existingLocation) {
      return res.status(404).json({
        success: false,
        error: 'Pickup location not found'
      });
    }

    // Check if pickup location is being used by any trips
    const tripsUsingLocation = await databaseManager.getPrismaClient().trip.findFirst({
      where: {
        pickupLocationId: id
      }
    });

    if (tripsUsingLocation) {
      return res.status(409).json({
        success: false,
        error: 'Cannot delete pickup location that is being used by existing trips. Deactivate instead.'
      });
    }

    // Soft delete by setting isActive to false
    await databaseManager.getPrismaClient().pickup_locations.update({
      where: { id },
      data: { isActive: false }
    });

    res.json({
      success: true,
      message: 'Pickup location deactivated successfully'
    });
  } catch (error) {
    console.error('Error deleting pickup location:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete pickup location'
    });
  }
});

// Hard delete a pickup location (permanent deletion)
router.delete('/:id/hard', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    // Check if pickup location exists
    const existingLocation = await databaseManager.getPrismaClient().pickup_locations.findUnique({
      where: { id }
    });

    if (!existingLocation) {
      return res.status(404).json({
        success: false,
        error: 'Pickup location not found'
      });
    }

    // Check if pickup location is being used by any trips
    const tripsUsingLocation = await databaseManager.getPrismaClient().trip.findFirst({
      where: {
        pickupLocationId: id
      }
    });

    if (tripsUsingLocation) {
      return res.status(409).json({
        success: false,
        error: 'Cannot delete pickup location that is being used by existing trips'
      });
    }

    // Hard delete
    await databaseManager.getPrismaClient().pickup_locations.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Pickup location permanently deleted'
    });
  } catch (error) {
    console.error('Error hard deleting pickup location:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete pickup location'
    });
  }
});

export default router;
