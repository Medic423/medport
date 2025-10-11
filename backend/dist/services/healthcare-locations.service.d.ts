interface CreateLocationData {
    locationName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone?: string;
    facilityType: string;
    isActive?: boolean;
    isPrimary?: boolean;
    latitude?: number | null;
    longitude?: number | null;
}
interface UpdateLocationData {
    locationName?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    phone?: string;
    facilityType?: string;
    isActive?: boolean;
    isPrimary?: boolean;
    latitude?: number | null;
    longitude?: number | null;
}
export declare class HealthcareLocationsService {
    /**
     * Create a new healthcare location
     */
    createLocation(healthcareUserId: string, locationData: CreateLocationData): Promise<{
        id: string;
        phone: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        facilityType: string;
        address: string;
        city: string;
        state: string;
        zipCode: string;
        latitude: number | null;
        longitude: number | null;
        healthcareUserId: string;
        locationName: string;
        isPrimary: boolean;
    }>;
    /**
     * Get all locations for a healthcare user
     */
    getLocationsByUserId(healthcareUserId: string): Promise<{
        id: string;
        phone: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        facilityType: string;
        address: string;
        city: string;
        state: string;
        zipCode: string;
        latitude: number | null;
        longitude: number | null;
        healthcareUserId: string;
        locationName: string;
        isPrimary: boolean;
    }[]>;
    /**
     * Get only active locations for a healthcare user (for dropdowns)
     */
    getActiveLocations(healthcareUserId: string): Promise<{
        id: string;
        phone: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        facilityType: string;
        address: string;
        city: string;
        state: string;
        zipCode: string;
        latitude: number | null;
        longitude: number | null;
        healthcareUserId: string;
        locationName: string;
        isPrimary: boolean;
    }[]>;
    /**
     * Get a specific location by ID
     */
    getLocationById(locationId: string, healthcareUserId: string): Promise<{
        id: string;
        phone: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        facilityType: string;
        address: string;
        city: string;
        state: string;
        zipCode: string;
        latitude: number | null;
        longitude: number | null;
        healthcareUserId: string;
        locationName: string;
        isPrimary: boolean;
    }>;
    /**
     * Update a location
     */
    updateLocation(locationId: string, healthcareUserId: string, updateData: UpdateLocationData): Promise<{
        id: string;
        phone: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        facilityType: string;
        address: string;
        city: string;
        state: string;
        zipCode: string;
        latitude: number | null;
        longitude: number | null;
        healthcareUserId: string;
        locationName: string;
        isPrimary: boolean;
    }>;
    /**
     * Delete a location (with validation)
     */
    deleteLocation(locationId: string, healthcareUserId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Set a location as primary
     */
    setPrimaryLocation(locationId: string, healthcareUserId: string): Promise<{
        id: string;
        phone: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        facilityType: string;
        address: string;
        city: string;
        state: string;
        zipCode: string;
        latitude: number | null;
        longitude: number | null;
        healthcareUserId: string;
        locationName: string;
        isPrimary: boolean;
    }>;
    /**
     * Get location statistics for analytics
     */
    getLocationStatistics(healthcareUserId: string): Promise<{
        statistics: {
            totalTrips: number;
            pendingTrips: number;
            completedTrips: number;
        };
        id: string;
        phone: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        facilityType: string;
        address: string;
        city: string;
        state: string;
        zipCode: string;
        latitude: number | null;
        longitude: number | null;
        healthcareUserId: string;
        locationName: string;
        isPrimary: boolean;
    }[]>;
}
export declare const healthcareLocationsService: HealthcareLocationsService;
export {};
//# sourceMappingURL=healthcare-locations.service.d.ts.map