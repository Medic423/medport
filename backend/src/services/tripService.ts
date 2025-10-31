import { databaseManager } from './databaseManager';
import emailService from './emailService';
import { PatientIdService, DIAGNOSIS_OPTIONS, MOBILITY_OPTIONS, TRANSPORT_LEVEL_OPTIONS, URGENCY_OPTIONS } from './patientIdService';
import { DistanceService } from './distanceService';

const prisma = databaseManager.getPrismaClient();

export interface CreateTripRequest {
  // Legacy fields (keeping for backward compatibility)
  patientId: string;
  originFacilityId: string;
  destinationFacilityId: string;
  transportLevel: 'BLS' | 'ALS' | 'CCT';
  urgencyLevel?: 'Routine' | 'Urgent' | 'Emergent';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  specialNeeds?: string;
  readyStart: string; // ISO string
  readyEnd: string; // ISO string
  isolation: boolean;
  bariatric: boolean;
  createdById: string | null;
}

export interface UpdateTripStatusRequest {
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  assignedAgencyId?: string;
  assignedUnitId?: string;
  acceptedTimestamp?: string;
  pickupTimestamp?: string;
  arrivalTimestamp?: string;
  departureTimestamp?: string;
  completionTimestamp?: string;
  urgencyLevel?: 'Routine' | 'Urgent' | 'Emergent';
  transportLevel?: string;
  diagnosis?: string;
  mobilityLevel?: string;
  insuranceCompany?: string;
  specialNeeds?: string;
  oxygenRequired?: boolean;
  monitoringRequired?: boolean;
  pickupLocation?: {
    name?: string;
    floor?: string;
    room?: string;
    contactPhone?: string;
    contactEmail?: string;
  };
}

export interface EnhancedCreateTripRequest {
  patientId?: string;
  patientWeight?: string;
  specialNeeds?: string;
  insuranceCompany?: string;
  // Patient age fields
  patientAgeYears?: number;
  patientAgeCategory?: 'NEWBORN' | 'INFANT' | 'TODDLER' | 'ADULT';
  fromLocation: string;
  fromLocationId?: string; // ✅ NEW: Reference to healthcare location
  pickupLocationId?: string;
  toLocation: string;
  scheduledTime: string; // ISO string
  transportLevel: 'BLS' | 'ALS' | 'CCT' | 'Other';
  urgencyLevel: 'Routine' | 'Urgent' | 'Emergent';
  diagnosis?: string;
  mobilityLevel?: 'Ambulatory' | 'Wheelchair' | 'Stretcher' | 'Bed';
  oxygenRequired?: boolean;
  monitoringRequired?: boolean;
  generateQRCode?: boolean;
  selectedAgencies?: string[];
  notificationRadius?: number;
  notes?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  healthcareUserId?: string; // ✅ NEW: For determining if multi-location facility
  // ✅ TCC Command: Audit trail for trips created by TCC staff
  createdByTCCUserId?: string; // TCC admin/user who created trip
  createdByTCCUserEmail?: string; // Email of TCC staff member
  createdVia?: string; // Source: 'TCC_ADMIN_PORTAL' or 'HEALTHCARE_PORTAL'
}

export class TripService {
  /**
   * Create a new transport request
   */
  async createTrip(data: CreateTripRequest) {
    console.log('TCC_DEBUG: Creating trip with data:', data);
    
    try {
      const tripNumber = `TRP-${Date.now()}`;
      
      const tripData: any = {
        tripNumber,
        patientId: data.patientId,
        patientWeight: null,
        specialNeeds: data.specialNeeds || null,
        // Use relation connects for facilities (Prisma expects relation objects here)
        fromLocation: null,
        toLocation: null,
        scheduledTime: new Date(data.readyStart),
        transportLevel: data.transportLevel,
        urgencyLevel: data.urgencyLevel || 'Routine',
        priority: data.priority,
        status: 'PENDING',
        // assignedUnitId removed from default; units are not used in trip lifecycle
        specialRequirements: data.specialNeeds || null,
        diagnosis: null,
        mobilityLevel: null,
        oxygenRequired: false,
        monitoringRequired: false,
        generateQRCode: false,
        qrCodeData: null,
        selectedAgencies: [],
        notificationRadius: null,
        requestTimestamp: new Date(),
        acceptedTimestamp: null,
        pickupTimestamp: null,
        notes: null,
        isolation: data.isolation || false,
        bariatric: data.bariatric || false,
      };

      // Connect origin/destination facilities if provided
      if (data.originFacilityId) {
        tripData.originFacility = { connect: { id: data.originFacilityId } };
      }
      if (data.destinationFacilityId) {
        tripData.destinationFacility = { connect: { id: data.destinationFacilityId } };
      }
      // Connect pickup location if provided
      if ((data as any).pickupLocationId) {
        tripData.pickupLocation = { connect: { id: (data as any).pickupLocationId } };
      }

      const trip = await prisma.transportRequest.create({
        data: tripData
      });

      console.log('TCC_DEBUG: Trip created successfully:', trip.id);
      return { success: true, data: trip };
    } catch (error) {
      console.error('TCC_DEBUG: Error creating trip:', error);
      return { success: false, error: 'Failed to create transport request' };
    }
  }

  /**
   * Get all transport requests with optional filtering
   */
  async getTrips(filters?: {
    status?: string;
    transportLevel?: string;
    priority?: string;
    agencyId?: string;
    fromLocationId?: string; // ✅ NEW: Filter by healthcare location
    healthcareUserId?: string; // ✅ NEW: Filter by healthcare user's locations
  }) {
    console.log('TCC_DEBUG: Getting trips with filters:', filters);
    console.log('MULTI_LOC: Location filters - fromLocationId:', filters?.fromLocationId, 'healthcareUserId:', filters?.healthcareUserId);
    
    try {
      const where: any = {};
      
      if (filters?.status) {
        // Handle comma-separated status values (e.g., "ACCEPTED,IN_PROGRESS,COMPLETED")
        if (filters.status.includes(',')) {
          const statuses = filters.status.split(',').map(s => s.trim());
          where.status = {
            in: statuses
          };
        } else {
          where.status = filters.status;
        }
      }
      
      // ✅ NEW: Filter by specific location
      if (filters?.fromLocationId) {
        where.fromLocationId = filters.fromLocationId;
        console.log('MULTI_LOC: Filtering by location ID:', filters.fromLocationId);
      }
      
      // ✅ NEW: Filter by all locations for a healthcare user
      if (filters?.healthcareUserId && !filters?.fromLocationId) {
        console.log('TCC_FILTER_DEBUG: Filtering trips for healthcareUserId:', filters.healthcareUserId);
        
        // Get all location IDs for this user
        const locations = await prisma.healthcareLocation.findMany({
          where: { healthcareUserId: filters.healthcareUserId },
          select: { id: true }
        });
        const locationIds = locations.map(loc => loc.id);
        
        console.log('TCC_FILTER_DEBUG: Found', locationIds.length, 'locations for user');
        
        if (locationIds.length > 0) {
          // Multi-location user: filter by their locations OR trips they created
          where.OR = [
            { fromLocationId: { in: locationIds } },
            { healthcareCreatedById: filters.healthcareUserId }
          ];
          console.log('MULTI_LOC: Filtering by user locations OR created trips:', locationIds.length, 'locations');
          console.log('TCC_FILTER_DEBUG: OR filter applied:', JSON.stringify(where.OR, null, 2));
        } else {
          // Single-facility user: filter by trips they created
          where.healthcareCreatedById = filters.healthcareUserId;
          console.log('SINGLE_LOC: Filtering by created user ID:', filters.healthcareUserId);
          console.log('TCC_FILTER_DEBUG: Filter applied - healthcareCreatedById:', filters.healthcareUserId);
        }
      }
      if (filters?.transportLevel) {
        where.transportLevel = filters.transportLevel;
      }
      if (filters?.priority) {
        where.priority = filters.priority;
      }
      // Note: assignedAgencyId doesn't exist in TransportRequest model, so we'll skip this filter for now

      const trips = await prisma.transportRequest.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          originFacility: {
            select: {
              id: true,
              name: true,
              type: true
            }
          },
          destinationFacility: {
            select: {
              id: true,
              name: true,
              type: true
            }
          },
          pickupLocation: {
            select: {
              id: true,
              name: true,
              floor: true,
              room: true,
              contactPhone: true,
              contactEmail: true
            }
          },
          healthcareLocation: {
            select: {
              id: true,
              locationName: true,
              city: true,
              state: true,
              facilityType: true
            }
          },
          assignedUnit: {
            select: {
              id: true,
              unitNumber: true,
              type: true,
              agency: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      });

      console.log('TCC_DEBUG: Found trips:', trips.length);
      try {
        console.log('TCC_DEBUG: Trips sample fields →',
          trips.slice(0, 3).map(t => ({
            id: t.id,
            status: (t as any).status,
            assignedUnitId: (t as any).assignedUnitId,
            assignedUnit: t.assignedUnit ? { id: t.assignedUnit.id, unitNumber: t.assignedUnit.unitNumber, type: t.assignedUnit.type } : null
          }))
        );
        console.log('TCC_FILTER_DEBUG: Trips healthcareCreatedById sample →',
          trips.slice(0, 3).map(t => ({
            id: t.id,
            healthcareCreatedById: (t as any).healthcareCreatedById
          }))
        );
      } catch {}

      // Calculate distance and time for each trip
      const tripsWithDistance = await Promise.all(trips.map(async (trip) => {
        try {
          // Calculate distance and time if we have location data
          if (trip.fromLocation && trip.toLocation) {
            const distanceResult = await this.calculateTripDistanceAndTime({
              fromLocation: trip.fromLocation,
              toLocation: trip.toLocation
            });
            
            if (distanceResult.success && distanceResult.data) {
              return {
                ...trip,
                distanceMiles: distanceResult.data.distance,
                estimatedTripTimeMinutes: distanceResult.data.estimatedTimeMinutes
              };
            }
          }
          
          // If no location data or calculation failed, return trip as-is
          return {
            ...trip,
            distanceMiles: null,
            estimatedTripTimeMinutes: null
          };
        } catch (error) {
          console.error('TCC_DEBUG: Error calculating distance for trip:', trip.id, error);
          return {
            ...trip,
            distanceMiles: null,
            estimatedTripTimeMinutes: null
          };
        }
      }));

      return { success: true, data: tripsWithDistance };
    } catch (error) {
      console.error('TCC_DEBUG: Error getting trips:', error);
      return { success: false, error: 'Failed to fetch transport requests' };
    }
  }

  /**
   * Get a single transport request by ID
   */
  async getTripById(id: string) {
    console.log('TCC_DEBUG: Getting trip by ID:', id);
    
    try {
      const trip = await prisma.transportRequest.findUnique({
        where: { id },
        include: {
          originFacility: {
            select: {
              id: true,
              name: true,
              type: true
            }
          },
          destinationFacility: {
            select: {
              id: true,
              name: true,
              type: true
            }
          },
          pickupLocation: {
            select: {
              id: true,
              name: true,
              floor: true,
              room: true,
              contactPhone: true,
              contactEmail: true
            }
          },
          assignedUnit: {
            select: {
              id: true,
              unitNumber: true,
              type: true,
              agency: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      });

      if (!trip) {
        return { success: false, error: 'Transport request not found' };
      }

      console.log('TCC_DEBUG: Trip found:', trip.id);
      return { success: true, data: trip };
    } catch (error) {
      console.error('TCC_DEBUG: Error getting trip by ID:', error);
      return { success: false, error: 'Failed to fetch transport request' };
    }
  }

  /**
   * Update trip status
   */
  async updateTripStatus(id: string, data: UpdateTripStatusRequest) {
    console.log('TCC_DEBUG: Updating trip status:', { id, data });
    console.log('EMS_UNIT_ASSIGN: updateTripStatus called with:', {
      tripId: id,
      status: data.status,
      assignedUnitId: data.assignedUnitId,
      assignedAgencyId: data.assignedAgencyId
    });
    
    try {
      // Ignore assignedUnitId: unit assignment is disabled (Option B)

      const updateData: any = {
        status: data.status,
        updatedAt: new Date()
      };

      // TCC_EDIT_DEBUG: Log incoming payload for validation
      console.log('TCC_EDIT_DEBUG: Incoming update payload:', {
        urgencyLevel: data.urgencyLevel,
        transportLevel: data.transportLevel,
        diagnosis: data.diagnosis,
        mobilityLevel: data.mobilityLevel,
        insuranceCompany: data.insuranceCompany,
        specialNeeds: data.specialNeeds,
        oxygenRequired: data.oxygenRequired,
        monitoringRequired: data.monitoringRequired
      });

      // Update optional fields if provided (only non-empty strings)
      // TypeScript-safe: check for undefined and truthy (non-empty) values
      if (data.urgencyLevel !== undefined && data.urgencyLevel) {
        updateData.urgencyLevel = data.urgencyLevel;
        console.log('TCC_EDIT_DEBUG: Setting urgencyLevel:', data.urgencyLevel);
      } else if (data.urgencyLevel !== undefined && !data.urgencyLevel) {
        console.log('TCC_EDIT_DEBUG: Skipping empty urgencyLevel');
      }
      
      if (data.transportLevel !== undefined && data.transportLevel) {
        updateData.transportLevel = data.transportLevel;
        console.log('TCC_EDIT_DEBUG: Setting transportLevel:', data.transportLevel);
      } else if (data.transportLevel !== undefined && !data.transportLevel) {
        console.log('TCC_EDIT_DEBUG: Skipping empty transportLevel');
      }
      
      if (data.diagnosis !== undefined && data.diagnosis) {
        updateData.diagnosis = data.diagnosis;
        console.log('TCC_EDIT_DEBUG: Setting diagnosis:', data.diagnosis);
      } else if (data.diagnosis !== undefined && !data.diagnosis) {
        console.log('TCC_EDIT_DEBUG: Skipping empty diagnosis');
      }
      
      if (data.mobilityLevel !== undefined && data.mobilityLevel) {
        updateData.mobilityLevel = data.mobilityLevel;
        console.log('TCC_EDIT_DEBUG: Setting mobilityLevel:', data.mobilityLevel);
      } else if (data.mobilityLevel !== undefined && !data.mobilityLevel) {
        console.log('TCC_EDIT_DEBUG: Skipping empty mobilityLevel');
      }
      
      if (data.insuranceCompany !== undefined && data.insuranceCompany) {
        updateData.insuranceCompany = data.insuranceCompany;
        console.log('TCC_EDIT_DEBUG: Setting insuranceCompany:', data.insuranceCompany);
      } else if (data.insuranceCompany !== undefined && !data.insuranceCompany) {
        console.log('TCC_EDIT_DEBUG: Skipping empty insuranceCompany');
      }
      
      if (data.specialNeeds !== undefined && data.specialNeeds) {
        updateData.specialNeeds = data.specialNeeds;
        console.log('TCC_EDIT_DEBUG: Setting specialNeeds:', data.specialNeeds);
      } else if (data.specialNeeds !== undefined && !data.specialNeeds) {
        console.log('TCC_EDIT_DEBUG: Skipping empty specialNeeds');
      }
      
      if (data.oxygenRequired !== undefined) {
        updateData.oxygenRequired = data.oxygenRequired;
        console.log('TCC_EDIT_DEBUG: Setting oxygenRequired:', data.oxygenRequired);
      }
      
      if (data.monitoringRequired !== undefined) {
        updateData.monitoringRequired = data.monitoringRequired;
        console.log('TCC_EDIT_DEBUG: Setting monitoringRequired:', data.monitoringRequired);
      }

      // Handle pickup location updates
      if (data.pickupLocation) {
        console.log('TCC_EDIT_DEBUG: Processing pickup location update:', data.pickupLocation);
        
        // First, get the current trip to find the existing pickup location
        const currentTrip = await prisma.transportRequest.findUnique({
          where: { id },
          include: { pickupLocation: true }
        });

        if (currentTrip?.pickupLocation) {
          // Update existing pickup location
          const pickupLocationUpdate: any = {};
          
          if (data.pickupLocation.name !== undefined) {
            pickupLocationUpdate.name = data.pickupLocation.name || null;
          }
          if (data.pickupLocation.floor !== undefined) {
            pickupLocationUpdate.floor = data.pickupLocation.floor || null;
          }
          if (data.pickupLocation.room !== undefined) {
            pickupLocationUpdate.room = data.pickupLocation.room || null;
          }
          if (data.pickupLocation.contactPhone !== undefined) {
            pickupLocationUpdate.contactPhone = data.pickupLocation.contactPhone || null;
          }
          if (data.pickupLocation.contactEmail !== undefined) {
            pickupLocationUpdate.contactEmail = data.pickupLocation.contactEmail || null;
          }

          console.log('TCC_EDIT_DEBUG: Updating pickup location with:', pickupLocationUpdate);

          // Update the pickup location
          await prisma.pickup_locations.update({
            where: { id: currentTrip.pickupLocation.id },
            data: pickupLocationUpdate
          });
        } else {
          console.log('TCC_EDIT_DEBUG: No existing pickup location found, skipping update');
        }
      }

      // Do not set assignedUnitId
      if (data.assignedAgencyId) {
        updateData.assignedAgencyId = data.assignedAgencyId;
      }

      // Handle timestamps
      if (data.acceptedTimestamp) {
        updateData.acceptedTimestamp = new Date(data.acceptedTimestamp);
      }
      if (data.pickupTimestamp) {
        updateData.pickupTimestamp = new Date(data.pickupTimestamp);
      }
      if (data.arrivalTimestamp) {
        updateData.arrivalTimestamp = new Date(data.arrivalTimestamp);
      }
      if (data.departureTimestamp) {
        updateData.departureTimestamp = new Date(data.departureTimestamp);
      }
      if (data.completionTimestamp) {
        updateData.completionTimestamp = new Date(data.completionTimestamp);
      }

      // Do not update unit status; units are not in workflow

      // TCC_EDIT_DEBUG: Log final update data before Prisma call
      console.log('TCC_EDIT_DEBUG: Final updateData to be sent to Prisma:', JSON.stringify(updateData, null, 2));

      const trip = await prisma.transportRequest.update({
        where: { id },
        data: updateData,
        include: {
          assignedUnit: true,
          pickupLocation: true,
          originFacility: true,
          destinationFacility: true
        }
      });

      console.log('TCC_DEBUG: Trip status updated successfully:', trip.id);
      return { success: true, data: trip };
    } catch (error: any) {
      console.error('TCC_EDIT_DEBUG: Error updating trip status:', error);
      console.error('TCC_EDIT_DEBUG: Error message:', error?.message);
      console.error('TCC_EDIT_DEBUG: Error code:', error?.code);
      console.error('TCC_EDIT_DEBUG: Error meta:', error?.meta);
      return { success: false, error: error?.message || 'Failed to update transport request status' };
    }
  }

  /**
   * Get agencies for a specific hospital (simplified version)
   */
  async getAgenciesForHospital(hospitalId: string) {
    console.log('TCC_DEBUG: getAgenciesForHospital called with hospitalId:', hospitalId);
    
    try {
      // For now, return a simple list of agencies
      // This can be expanded later to actually query agencies based on hospital location
      const agencies = await prisma.eMSAgency.findMany({
        where: {
          isActive: true
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          city: true,
          state: true
        }
      });

      console.log('TCC_DEBUG: Found agencies:', agencies.length);
      return { success: true, data: agencies };
    } catch (error) {
      console.error('TCC_DEBUG: Error getting agencies for hospital:', error);
      return { success: false, error: 'Failed to get agencies for hospital' };
    }
  }

  /**
   * Create an enhanced transport request
   */
  async createEnhancedTrip(data: EnhancedCreateTripRequest) {
    console.log('TCC_DEBUG: Creating enhanced trip with data:', data);
    console.log('MULTI_LOC: fromLocationId:', data.fromLocationId, 'healthcareUserId:', data.healthcareUserId);
    console.log('TCC_CREATE_DEBUG: healthcareUserId will be used for healthcareCreatedById:', data.healthcareUserId);
    
    try {
      const tripNumber = `TRP-${Date.now()}`;
      
      // ✅ Determine if this is from a multi-location facility
      let isMultiLocationFacility = false;
      if (data.healthcareUserId) {
        const healthcareUser = await prisma.healthcareUser.findUnique({
          where: { id: data.healthcareUserId },
          select: { manageMultipleLocations: true }
        });
        isMultiLocationFacility = healthcareUser?.manageMultipleLocations || false;
        console.log('MULTI_LOC: User manages multiple locations:', isMultiLocationFacility);
      }
      
      const tripData: any = {
        tripNumber,
        patientId: data.patientId || 'PAT-UNKNOWN',
        patientWeight: data.patientWeight || null,
        specialNeeds: data.specialNeeds || null,
        patientAgeYears: data.patientAgeCategory === 'ADULT' ? (data.patientAgeYears ?? null) : null,
        patientAgeCategory: data.patientAgeCategory || null,
        fromLocation: data.fromLocation,
        isMultiLocationFacility, // ✅ NEW: Analytics flag
        toLocation: data.toLocation,
        scheduledTime: new Date(data.scheduledTime),
        transportLevel: data.transportLevel,
        urgencyLevel: data.urgencyLevel,
        priority: data.priority || 'MEDIUM',
        status: 'PENDING',
        specialRequirements: data.specialNeeds || null,
        diagnosis: data.diagnosis || null,
        mobilityLevel: data.mobilityLevel || null,
        oxygenRequired: data.oxygenRequired || false,
        monitoringRequired: data.monitoringRequired || false,
        generateQRCode: data.generateQRCode || false,
        qrCodeData: null,
        selectedAgencies: data.selectedAgencies || [],
        notificationRadius: data.notificationRadius || null,
        requestTimestamp: new Date(),
        acceptedTimestamp: null,
        pickupTimestamp: null,
        notes: data.notes || null,
        isolation: false,
        bariatric: false,
        healthcareCreatedById: data.healthcareUserId || null,
      };
      
      console.log('TCC_CREATE_DEBUG: Trip data healthcareCreatedById before create:', tripData.healthcareCreatedById);

      // Connect pickup location relation if provided
      if (data.pickupLocationId) {
        console.log('TCC_DEBUG: Validating pickup location:', data.pickupLocationId);
        // First verify the pickup location exists
        const pickupLocation = await prisma.pickup_locations.findUnique({
          where: { id: data.pickupLocationId }
        });
        
        console.log('TCC_DEBUG: Pickup location lookup result:', pickupLocation ? `Found: ${pickupLocation.name}` : 'NOT FOUND');
        
        if (!pickupLocation) {
          console.error('TCC_DEBUG: Pickup location not found:', data.pickupLocationId);
          return { 
            success: false, 
            error: `Pickup location "${data.pickupLocationId}" not found. Please select a valid pickup location from the dropdown.` 
          };
        }
        
        console.log('TCC_DEBUG: Pickup location validated:', pickupLocation.name);
        tripData.pickupLocation = { connect: { id: data.pickupLocationId } };
      } else {
        console.log('TCC_DEBUG: No pickupLocationId provided, skipping pickup location connection');
      }

      // Connect healthcare location relation if provided
      if (data.fromLocationId) {
        console.log('TCC_DEBUG: Validating healthcare location:', data.fromLocationId);
        // Verify the healthcare location exists
        const healthcareLocation = await prisma.healthcareLocation.findUnique({
          where: { id: data.fromLocationId }
        });
        
        console.log('TCC_DEBUG: Healthcare location lookup result:', healthcareLocation ? `Found: ${healthcareLocation.locationName}` : 'NOT FOUND');
        
        if (!healthcareLocation) {
          console.error('TCC_DEBUG: From Location not found:', data.fromLocationId);
          return { 
            success: false, 
            error: `From Location "${data.fromLocation}" not found. Please select a valid from location from the dropdown.` 
          };
        }
        
        console.log('TCC_DEBUG: Healthcare location validated:', healthcareLocation.locationName);
        tripData.healthcareLocation = { connect: { id: data.fromLocationId } };
      } else {
        console.log('TCC_DEBUG: No fromLocationId provided, skipping healthcare location connection');
      }

      const trip = await prisma.transportRequest.create({
        data: tripData,
        include: {
          healthcareLocation: {
            select: {
              id: true,
              locationName: true,
              city: true,
              state: true,
              facilityType: true
            }
          }
        }
      });

      console.log('TCC_DEBUG: Enhanced trip created successfully:', trip.id);
      console.log('MULTI_LOC: Trip created with location:', trip.healthcareLocation?.locationName || 'N/A');
      console.log('TCC_CREATE_DEBUG: Created trip healthcareCreatedById:', (trip as any).healthcareCreatedById);
      return { success: true, data: trip };
    } catch (error) {
      console.error('TCC_DEBUG: Error creating enhanced trip:', error);
      return { success: false, error: 'Failed to create enhanced transport request' };
    }
  }

  /**
   * Get trip history with filtering
   */
  async getTripHistory(filters: {
    status?: string;
    agencyId?: string;
    dateFrom?: string;
    dateTo?: string;
    limit: number;
    offset: number;
    search?: string;
  }) {
    console.log('TCC_DEBUG: Getting trip history with filters:', filters);
    
    try {
      const where: any = {};
      
      if (filters.status) {
        where.status = filters.status;
      }
      if (filters.dateFrom) {
        where.createdAt = { gte: new Date(filters.dateFrom) };
      }
      if (filters.dateTo) {
        where.createdAt = { 
          ...where.createdAt,
          lte: new Date(filters.dateTo) 
        };
      }
      if (filters.search) {
        where.OR = [
          { tripNumber: { contains: filters.search } },
          { patientId: { contains: filters.search } },
          { fromLocation: { contains: filters.search } },
          { toLocation: { contains: filters.search } }
        ];
      }

      const trips = await prisma.transportRequest.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        take: filters.limit,
        skip: filters.offset,
      });

      console.log('TCC_DEBUG: Found trip history:', trips.length);
      return { success: true, data: trips };
    } catch (error) {
      console.error('TCC_DEBUG: Error getting trip history:', error);
      return { success: false, error: 'Failed to fetch trip history' };
    }
  }

  /**
   * Get available agencies
   */
  async getAvailableAgencies() {
    console.log('TCC_DEBUG: Getting available agencies');
    
    try {
      const agencies = await prisma.eMSAgency.findMany({
        where: {
          isActive: true
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          city: true,
          state: true,
          capabilities: true,
          serviceArea: true
        }
      });

      console.log('TCC_DEBUG: Found available agencies:', agencies.length);
      return { success: true, data: agencies };
    } catch (error) {
      console.error('TCC_DEBUG: Error getting available agencies:', error);
      return { success: false, error: 'Failed to get available agencies' };
    }
  }

  /**
   * Get notification settings for a user
   */
  async getNotificationSettings(userId: string) {
    console.log('TCC_DEBUG: Getting notification settings for user:', userId);
    
    // For now, return default settings
    // This can be expanded to actually store/retrieve user preferences
    return {
      emailNotifications: true,
      smsNotifications: true,
      newTripAlerts: true,
      statusUpdates: true,
      emailAddress: null,
      phoneNumber: null
    };
  }

  /**
   * Update notification settings for a user
   */
  async updateNotificationSettings(userId: string, settings: any) {
    console.log('TCC_DEBUG: Updating notification settings for user:', userId, settings);
    
    // For now, just return success
    // This can be expanded to actually store user preferences
    return { success: true, data: settings, error: null };
  }

  /**
   * Update trip times
   */
  async updateTripTimes(id: string, times: {
    transferAcceptedTime?: string;
    emsArrivalTime?: string;
    emsDepartureTime?: string;
  }) {
    console.log('TCC_DEBUG: Updating trip times:', { id, times });
    
    try {
      const updateData: any = {};
      
      if (times.transferAcceptedTime) {
        updateData.acceptedTimestamp = new Date(times.transferAcceptedTime);
      }
      if (times.emsArrivalTime) {
        updateData.pickupTimestamp = new Date(times.emsArrivalTime);
      }
      if (times.emsDepartureTime) {
        updateData.completionTimestamp = new Date(times.emsDepartureTime);
      }

      const trip = await prisma.transportRequest.update({
        where: { id },
        data: updateData
      });

      console.log('TCC_DEBUG: Trip times updated successfully:', trip.id);
      return { success: true, data: trip };
    } catch (error) {
      console.error('TCC_DEBUG: Error updating trip times:', error);
      return { success: false, error: 'Failed to update trip times' };
    }
  }

  /**
   * Get diagnosis options
   */
  getDiagnosisOptions() {
    return { success: true, data: DIAGNOSIS_OPTIONS };
  }

  /**
   * Get mobility options
   */
  getMobilityOptions() {
    return { success: true, data: MOBILITY_OPTIONS };
  }

  /**
   * Get transport level options
   */
  getTransportLevelOptions() {
    return { success: true, data: TRANSPORT_LEVEL_OPTIONS };
  }

  /**
   * Get urgency options
   */
  getUrgencyOptions() {
    return { success: true, data: URGENCY_OPTIONS };
  }

  /**
   * Get insurance options
   */
  async getInsuranceOptions() {
    console.log('TCC_DEBUG: Getting insurance options');
    
    // For now, return a simple list
    // This can be expanded to query from a database table
    const options = [
      'Medicare',
      'Medicaid',
      'Blue Cross Blue Shield',
      'Aetna',
      'Cigna',
      'UnitedHealth',
      'Self-Pay',
      'Other'
    ];

    return { success: true, data: options };
  }

  /**
   * Create trip with responses
   */
  async createTripWithResponses(data: any) {
    console.log('TCC_DEBUG: Creating trip with responses:', data);
    
    // For now, just create a regular trip
    // This can be expanded to handle response-specific logic
    return await this.createEnhancedTrip(data);
  }

  /**
   * Update trip response fields
   */
  async updateTripResponseFields(id: string, data: any) {
    console.log('TCC_DEBUG: Updating trip response fields:', { id, data });
    
    try {
      const trip = await prisma.transportRequest.update({
        where: { id },
        data: {
          updatedAt: new Date()
        }
      });

      console.log('TCC_DEBUG: Trip response fields updated successfully:', trip.id);
      return { success: true, data: trip };
    } catch (error) {
      console.error('TCC_DEBUG: Error updating trip response fields:', error);
      return { success: false, error: 'Failed to update trip response fields' };
    }
  }

  /**
   * Get trip with responses
   */
  async getTripWithResponses(id: string) {
    console.log('TCC_DEBUG: Getting trip with responses:', id);
    
    try {
      const trip = await prisma.transportRequest.findUnique({
        where: { id }
      });

      if (!trip) {
        return { success: false, error: 'Trip not found' };
      }

      // For now, return the trip without responses
      // This can be expanded to include agency responses
      return { success: true, data: trip };
    } catch (error) {
      console.error('TCC_DEBUG: Error getting trip with responses:', error);
      return { success: false, error: 'Failed to get trip with responses' };
    }
  }

  /**
   * Get trip response summary
   */
  async getTripResponseSummary(id: string) {
    console.log('TCC_DEBUG: Getting trip response summary:', id);
    
    // For now, return a simple summary
    // This can be expanded to calculate actual response statistics
    return {
      success: true,
      data: {
        totalResponses: 0,
        acceptedResponses: 0,
        declinedResponses: 0,
        pendingResponses: 0
      },
      error: null
    };
  }

  /**
   * Create agency response
   */
  async createAgencyResponse(data: any) {
    console.log('TCC_DEBUG: Creating agency response:', data);
    
    try {
      // Create the agency response record
      const agencyResponse = await prisma.agencyResponse.create({
        data: {
          tripId: data.tripId,
          agencyId: data.agencyId,
          response: data.response, // ACCEPTED or DECLINED
          responseNotes: data.responseNotes || null,
          estimatedArrival: data.estimatedArrival ? new Date(data.estimatedArrival) : null,
          responseTimestamp: new Date(),
          isSelected: false // Will be set to true when healthcare provider selects this agency
        }
      });
      
      console.log('TCC_DEBUG: Agency response created successfully:', agencyResponse.id);
      
      // DO NOT update trip status here - leave it as PENDING
      // Only update status when healthcare provider selects an agency
      
      return { success: true, data: agencyResponse, error: null };
    } catch (error: any) {
      console.error('TCC_DEBUG: Error creating agency response:', error);
      console.error('TCC_DEBUG: Error details:', {
        message: error?.message,
        code: error?.code,
        meta: error?.meta
      });
      return { 
        success: false, 
        data: null, 
        error: error?.message || 'Failed to create agency response' 
      };
    }
  }

  /**
   * Update agency response
   */
  async updateAgencyResponse(id: string, data: any) {
    console.log('TCC_DEBUG: Updating agency response:', { id, data });
    
    try {
      const updateData: any = {};
      
      if (data.response) updateData.response = data.response;
      if (data.responseNotes !== undefined) updateData.responseNotes = data.responseNotes;
      if (data.estimatedArrival !== undefined) {
        updateData.estimatedArrival = data.estimatedArrival ? new Date(data.estimatedArrival) : null;
      }
      // Ignore assignedUnitId on agency responses
      
      console.log('TCC_DEBUG: Update data for agency response:', updateData);
      const response = await prisma.agencyResponse.update({
        where: { id },
        data: updateData,
        include: {
          assignedUnit: true
        }
      });
      
      console.log('TCC_DEBUG: Agency response updated successfully:', { id: response.id, assignedUnitId: response.assignedUnitId, assignedUnit: response.assignedUnit });
      return { success: true, data: response, error: null };
    } catch (error) {
      console.error('TCC_DEBUG: Error updating agency response:', error);
      return { success: false, data: null, error: 'Failed to update agency response' };
    }
  }

  /**
   * Get agency responses
   */
  async getAgencyResponses(filters: any) {
    console.log('TCC_DEBUG: Getting agency responses with filters:', filters);
    
    try {
      const where: any = {};
      
      if (filters.tripId) where.tripId = filters.tripId;
      if (filters.agencyId) where.agencyId = filters.agencyId;
      if (filters.response) where.response = filters.response;
      if (filters.isSelected !== undefined) where.isSelected = filters.isSelected;
      
      // Get all agency responses from the agency_responses table, including assigned units
      const agencyResponses = await prisma.agencyResponse.findMany({
        where,
        include: {
          assignedUnit: true // Include the unit assigned by this specific agency
        },
        orderBy: { responseTimestamp: 'desc' }
      });
      
      console.log('TCC_DEBUG: Found', agencyResponses.length, 'agency responses in database');
      
      // Get unique trip IDs to fetch trip details
      const tripIds = [...new Set(agencyResponses.map(r => r.tripId))];
      
      // Fetch trip details - check both transport_requests and trips tables
      const transportRequests = await prisma.transportRequest.findMany({
        where: { id: { in: tripIds } },
        include: {
          assignedUnit: true,
          originFacility: true,
          destinationFacility: true
        }
      });
      
      const tripsData = await prisma.trip.findMany({
        where: { id: { in: tripIds } }
      });
      
      // Combine both sources into a single map
      const tripMap = new Map<string, any>();
      
      transportRequests.forEach(trip => {
        tripMap.set(trip.id, {
          id: trip.id,
          patientId: trip.patientId,
          fromLocation: trip.fromLocation,
          toLocation: trip.toLocation,
          transportLevel: trip.transportLevel,
          urgencyLevel: trip.urgencyLevel,
          assignedUnit: trip.assignedUnit
        });
      });
      
      tripsData.forEach(trip => {
        if (!tripMap.has(trip.id)) {
          tripMap.set(trip.id, {
            id: trip.id,
            patientId: trip.patientId,
            fromLocation: trip.fromLocation,
            toLocation: trip.toLocation,
            transportLevel: trip.transportLevel,
            urgencyLevel: trip.urgencyLevel,
            assignedUnit: null
          });
        }
      });
      
      // Get agency names for all agencies in responses
      const agencyIds = [...new Set(agencyResponses.map(r => r.agencyId))];
      const agencies = await prisma.eMSAgency.findMany({
        where: { id: { in: agencyIds } },
        select: { id: true, name: true }
      });
      const agencyMap = new Map(agencies.map(agency => [agency.id, agency.name]));
      
      // Combine agency response data with trip details
      const responses = agencyResponses.map(response => {
        const trip = tripMap.get(response.tripId);
        return {
          id: response.id,
          tripId: response.tripId,
          agencyId: response.agencyId,
          agency: { 
            id: response.agencyId, 
            name: agencyMap.get(response.agencyId) || `Agency ${response.agencyId}` 
          },
          response: response.response,
          responseTimestamp: response.responseTimestamp,
          responseNotes: response.responseNotes || '',
          estimatedArrival: response.estimatedArrival,
          isSelected: response.isSelected,
          assignedUnitId: response.assignedUnitId,
          assignedUnit: response.assignedUnit ? {
            id: response.assignedUnit.id,
            unitNumber: response.assignedUnit.unitNumber,
            type: response.assignedUnit.type
          } : null,
          createdAt: response.createdAt,
          updatedAt: response.updatedAt,
          trip: trip ? {
            id: trip.id,
            patientId: trip.patientId,
            fromLocation: trip.fromLocation,
            toLocation: trip.toLocation,
            transportLevel: trip.transportLevel,
            urgencyLevel: trip.urgencyLevel
          } : null
        };
      });

      console.log('TCC_DEBUG: Returning', responses.length, 'agency responses with trip details');
      return { success: true, data: responses };
    } catch (error) {
      console.error('TCC_DEBUG: Error getting agency responses:', error);
      return { success: false, error: 'Failed to fetch agency responses' };
    }
  }

  /**
   * Get agency response by ID
   */
  async getAgencyResponseById(id: string) {
    console.log('TCC_DEBUG: Getting agency response by ID:', id);
    
    // For now, return a simple response
    // This can be expanded to actually query agency responses
    return { success: true, data: { id, response: 'PENDING' }, error: null };
  }

  /**
   * Select agency for trip
   */
  async selectAgencyForTrip(responseId: string) {
    console.log('TCC_DEBUG: Selecting agency for trip, responseId:', responseId);
    
    try {
      // Get the agency response
      const agencyResponse = await prisma.agencyResponse.findUnique({
        where: { id: responseId },
        include: {
          trip: true
        }
      });
      
      if (!agencyResponse) {
        return { success: false, data: null, error: 'Agency response not found' };
      }
      
      const tripId = agencyResponse.tripId;
      
      // Mark this response as selected
      await prisma.agencyResponse.update({
        where: { id: responseId },
        data: { isSelected: true }
      });
      
      // Unselect all other responses for this trip
      await prisma.agencyResponse.updateMany({
        where: { 
          tripId,
          id: { not: responseId }
        },
        data: { isSelected: false }
      });
      
      // Update the trip with the selected agency
      await prisma.transportRequest.update({
        where: { id: tripId },
        data: {
          assignedAgencyId: agencyResponse.agencyId,
          status: 'ACCEPTED',
          acceptedTimestamp: new Date()
        }
      }).catch(() => {
        // If transportRequest doesn't exist, try updating Trip table
        return prisma.trip.update({
          where: { id: tripId },
          data: {
            assignedAgencyId: agencyResponse.agencyId,
            status: 'ACCEPTED',
            acceptedTimestamp: new Date()
          }
        });
      });
      
      console.log('TCC_DEBUG: Agency selected successfully for trip:', tripId);
      return { success: true, data: { tripId, responseId }, error: null };
    } catch (error) {
      console.error('TCC_DEBUG: Error selecting agency:', error);
      return { success: false, data: null, error: 'Failed to select agency for trip' };
    }
  }

  /**
   * Validate unit assignment
   */
  private async validateUnitAssignment(unitId: string, agencyId?: string): Promise<any> {
    try {
      console.log('EMS_UNIT_ASSIGN: Validating unit assignment:', { unitId, agencyId });
      
      const emsDB = databaseManager.getPrismaClient();
      const unit = await emsDB.unit.findUnique({
        where: { id: unitId },
        include: { agency: true }
      });

      console.log('EMS_UNIT_ASSIGN: Unit lookup result:', unit ? {
        id: unit.id,
        unitNumber: unit.unitNumber,
        status: unit.status,
        isActive: unit.isActive,
        agencyId: unit.agencyId,
        agencyName: unit.agency?.name
      } : 'NOT FOUND');

      if (!unit) {
        console.log('EMS_UNIT_ASSIGN: FAILED - Unit not found:', unitId);
        return null;
      }

      if (!unit.isActive) {
        console.log('EMS_UNIT_ASSIGN: FAILED - Unit is not active:', unitId);
        return null;
      }

      if (unit.status !== 'AVAILABLE') {
        console.log('EMS_UNIT_ASSIGN: FAILED - Unit is not available. Unit status:', unit.status, 'Expected: AVAILABLE');
        return null;
      }

      // If agencyId is provided, validate unit belongs to that agency
      if (agencyId && unit.agencyId !== agencyId) {
        console.log('EMS_UNIT_ASSIGN: FAILED - Unit does not belong to agency. Unit agencyId:', unit.agencyId, 'Requested agencyId:', agencyId);
        return null;
      }

      console.log('EMS_UNIT_ASSIGN: SUCCESS - Unit assignment validated:', unitId);
      return unit;
    } catch (error) {
      console.error('EMS_UNIT_ASSIGN: ERROR - Exception during validation:', error);
      return null;
    }
  }

  /**
   * Update unit status
   */
  private async updateUnitStatus(unitId: string, status: string): Promise<void> {
    try {
      console.log('TCC_DEBUG: Updating unit status:', { unitId, status });
      
      const emsDB = databaseManager.getPrismaClient();
      await emsDB.unit.update({
        where: { id: unitId },
        data: { 
          status: status,
          updatedAt: new Date()
        }
      });

      console.log('TCC_DEBUG: Unit status updated successfully:', unitId, 'to', status);
    } catch (error) {
      console.error('TCC_DEBUG: Error updating unit status:', error);
      // Don't throw error as this is not critical to trip update
    }
  }

  /**
   * Calculate distance and estimated time for a trip
   */
  async calculateTripDistanceAndTime(data: {
    fromLocation?: string;
    toLocation?: string;
    fromLocationId?: string;
    destinationFacilityId?: string;
  }) {
    console.log('TCC_DEBUG: Calculating trip distance and time:', data);
    
    try {
      let fromCoords: { latitude: number; longitude: number } | null = null;
      let toCoords: { latitude: number; longitude: number } | null = null;

      // Get origin coordinates
      if (data.fromLocationId) {
        const healthcareLocation = await prisma.healthcareLocation.findUnique({
          where: { id: data.fromLocationId },
          select: { latitude: true, longitude: true, locationName: true }
        });
        
        if (healthcareLocation?.latitude && healthcareLocation?.longitude) {
          fromCoords = {
            latitude: healthcareLocation.latitude,
            longitude: healthcareLocation.longitude
          };
          console.log('TCC_DEBUG: Found origin coordinates from healthcare location:', fromCoords);
        }
      }

      // Get destination coordinates
      if (data.destinationFacilityId) {
        const facility = await prisma.facility.findUnique({
          where: { id: data.destinationFacilityId },
          select: { latitude: true, longitude: true, name: true }
        });
        
        if (facility?.latitude && facility?.longitude) {
          toCoords = {
            latitude: facility.latitude,
            longitude: facility.longitude
          };
          console.log('TCC_DEBUG: Found destination coordinates from facility:', toCoords);
        }
      }

      // If we don't have coordinates, try to find them in healthcare locations
      if (!fromCoords && data.fromLocation) {
        console.log('TCC_DEBUG: Looking up coordinates for fromLocation:', data.fromLocation);
        
        // Try to find the location in healthcare locations
        const healthcareLocation = await prisma.healthcareLocation.findFirst({
          where: { 
            locationName: { contains: data.fromLocation, mode: 'insensitive' }
          },
          select: { latitude: true, longitude: true, locationName: true }
        });
        
        if (healthcareLocation?.latitude && healthcareLocation?.longitude) {
          fromCoords = {
            latitude: healthcareLocation.latitude,
            longitude: healthcareLocation.longitude
          };
          console.log('TCC_DEBUG: Found coordinates from healthcare location:', fromCoords);
        } else {
          // Fallback to mock coordinates if not found
          console.log('TCC_DEBUG: Using mock coordinates for fromLocation:', data.fromLocation);
          fromCoords = { latitude: 40.2031, longitude: -79.9262 }; // Mock coordinates
        }
      }

      if (!toCoords && data.toLocation) {
        console.log('TCC_DEBUG: Looking up coordinates for toLocation:', data.toLocation);
        
        // Try to find the location in healthcare locations
        const healthcareLocation = await prisma.healthcareLocation.findFirst({
          where: { 
            locationName: { contains: data.toLocation, mode: 'insensitive' }
          },
          select: { latitude: true, longitude: true, locationName: true }
        });
        
        if (healthcareLocation?.latitude && healthcareLocation?.longitude) {
          toCoords = {
            latitude: healthcareLocation.latitude,
            longitude: healthcareLocation.longitude
          };
          console.log('TCC_DEBUG: Found coordinates from healthcare location:', toCoords);
        } else {
          // Fallback to mock coordinates if not found
          console.log('TCC_DEBUG: Using mock coordinates for toLocation:', data.toLocation);
          toCoords = { latitude: 41.5025, longitude: -81.6214 }; // Mock coordinates
        }
      }

      if (!fromCoords || !toCoords) {
        return {
          success: false,
          error: 'Unable to determine coordinates for trip locations'
        };
      }

      // Calculate distance using DistanceService
      const distance = DistanceService.calculateDistance(
        { latitude: fromCoords.latitude, longitude: fromCoords.longitude },
        { latitude: toCoords.latitude, longitude: toCoords.longitude }
      );

      // Estimate time based on distance (assuming average speed of 30 mph in urban areas)
      const estimatedTimeMinutes = Math.round((distance / 30) * 60);

      console.log('TCC_DEBUG: Calculated distance:', distance, 'miles, estimated time:', estimatedTimeMinutes, 'minutes');

      return {
        success: true,
        data: {
          distance: Math.round(distance * 10) / 10, // Round to 1 decimal place
          estimatedTimeMinutes,
          estimatedTimeFormatted: `${estimatedTimeMinutes} minutes`,
          distanceFormatted: `${Math.round(distance * 10) / 10} miles`
        }
      };
    } catch (error) {
      console.error('TCC_DEBUG: Error calculating trip distance and time:', error);
      return {
        success: false,
        error: 'Failed to calculate trip distance and time'
      };
    }
  }
}

export const tripService = new TripService();