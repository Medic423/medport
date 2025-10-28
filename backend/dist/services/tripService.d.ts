export interface CreateTripRequest {
    patientId: string;
    originFacilityId: string;
    destinationFacilityId: string;
    transportLevel: 'BLS' | 'ALS' | 'CCT';
    urgencyLevel?: 'Routine' | 'Urgent' | 'Emergent';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    specialNeeds?: string;
    readyStart: string;
    readyEnd: string;
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
    fromLocation: string;
    fromLocationId?: string;
    pickupLocationId?: string;
    toLocation: string;
    scheduledTime: string;
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
    healthcareUserId?: string;
    createdByTCCUserId?: string;
    createdByTCCUserEmail?: string;
    createdVia?: string;
}
export declare class TripService {
    /**
     * Create a new transport request
     */
    createTrip(data: CreateTripRequest): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            tripNumber: string | null;
            patientId: string;
            patientWeight: string | null;
            specialNeeds: string | null;
            originFacilityId: string | null;
            destinationFacilityId: string | null;
            fromLocation: string | null;
            toLocation: string | null;
            fromLocationId: string | null;
            isMultiLocationFacility: boolean;
            scheduledTime: Date | null;
            transportLevel: string;
            urgencyLevel: string | null;
            priority: string;
            specialRequirements: string | null;
            diagnosis: string | null;
            mobilityLevel: string | null;
            oxygenRequired: boolean;
            monitoringRequired: boolean;
            generateQRCode: boolean;
            qrCodeData: string | null;
            selectedAgencies: string[];
            notificationRadius: number | null;
            requestTimestamp: Date;
            acceptedTimestamp: Date | null;
            pickupTimestamp: Date | null;
            arrivalTimestamp: Date | null;
            departureTimestamp: Date | null;
            completionTimestamp: Date | null;
            pickupLocationId: string | null;
            assignedAgencyId: string | null;
            assignedUnitId: string | null;
            createdById: string | null;
            healthcareCreatedById: string | null;
            isolation: boolean;
            bariatric: boolean;
            notes: string | null;
        };
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        data?: undefined;
    }>;
    /**
     * Get all transport requests with optional filtering
     */
    getTrips(filters?: {
        status?: string;
        transportLevel?: string;
        priority?: string;
        agencyId?: string;
        fromLocationId?: string;
        healthcareUserId?: string;
    }): Promise<{
        success: boolean;
        data: ({
            distanceMiles: number;
            estimatedTripTimeMinutes: number;
            healthcareLocation: {
                id: string;
                facilityType: string;
                city: string;
                state: string;
                locationName: string;
            } | null;
            assignedUnit: {
                id: string;
                agency: {
                    id: string;
                    name: string;
                };
                type: string;
                unitNumber: string;
            } | null;
            destinationFacility: {
                id: string;
                name: string;
                type: string;
            } | null;
            originFacility: {
                id: string;
                name: string;
                type: string;
            } | null;
            pickupLocation: {
                id: string;
                name: string;
                contactPhone: string | null;
                contactEmail: string | null;
                floor: string | null;
                room: string | null;
            } | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            tripNumber: string | null;
            patientId: string;
            patientWeight: string | null;
            specialNeeds: string | null;
            originFacilityId: string | null;
            destinationFacilityId: string | null;
            fromLocation: string | null;
            toLocation: string | null;
            fromLocationId: string | null;
            isMultiLocationFacility: boolean;
            scheduledTime: Date | null;
            transportLevel: string;
            urgencyLevel: string | null;
            priority: string;
            specialRequirements: string | null;
            diagnosis: string | null;
            mobilityLevel: string | null;
            oxygenRequired: boolean;
            monitoringRequired: boolean;
            generateQRCode: boolean;
            qrCodeData: string | null;
            selectedAgencies: string[];
            notificationRadius: number | null;
            requestTimestamp: Date;
            acceptedTimestamp: Date | null;
            pickupTimestamp: Date | null;
            arrivalTimestamp: Date | null;
            departureTimestamp: Date | null;
            completionTimestamp: Date | null;
            pickupLocationId: string | null;
            assignedAgencyId: string | null;
            assignedUnitId: string | null;
            createdById: string | null;
            healthcareCreatedById: string | null;
            isolation: boolean;
            bariatric: boolean;
            notes: string | null;
        } | {
            distanceMiles: null;
            estimatedTripTimeMinutes: null;
            healthcareLocation: {
                id: string;
                facilityType: string;
                city: string;
                state: string;
                locationName: string;
            } | null;
            assignedUnit: {
                id: string;
                agency: {
                    id: string;
                    name: string;
                };
                type: string;
                unitNumber: string;
            } | null;
            destinationFacility: {
                id: string;
                name: string;
                type: string;
            } | null;
            originFacility: {
                id: string;
                name: string;
                type: string;
            } | null;
            pickupLocation: {
                id: string;
                name: string;
                contactPhone: string | null;
                contactEmail: string | null;
                floor: string | null;
                room: string | null;
            } | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            tripNumber: string | null;
            patientId: string;
            patientWeight: string | null;
            specialNeeds: string | null;
            originFacilityId: string | null;
            destinationFacilityId: string | null;
            fromLocation: string | null;
            toLocation: string | null;
            fromLocationId: string | null;
            isMultiLocationFacility: boolean;
            scheduledTime: Date | null;
            transportLevel: string;
            urgencyLevel: string | null;
            priority: string;
            specialRequirements: string | null;
            diagnosis: string | null;
            mobilityLevel: string | null;
            oxygenRequired: boolean;
            monitoringRequired: boolean;
            generateQRCode: boolean;
            qrCodeData: string | null;
            selectedAgencies: string[];
            notificationRadius: number | null;
            requestTimestamp: Date;
            acceptedTimestamp: Date | null;
            pickupTimestamp: Date | null;
            arrivalTimestamp: Date | null;
            departureTimestamp: Date | null;
            completionTimestamp: Date | null;
            pickupLocationId: string | null;
            assignedAgencyId: string | null;
            assignedUnitId: string | null;
            createdById: string | null;
            healthcareCreatedById: string | null;
            isolation: boolean;
            bariatric: boolean;
            notes: string | null;
        })[];
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        data?: undefined;
    }>;
    /**
     * Get a single transport request by ID
     */
    getTripById(id: string): Promise<{
        success: boolean;
        error: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            assignedUnit: {
                id: string;
                agency: {
                    id: string;
                    name: string;
                };
                type: string;
                unitNumber: string;
            } | null;
            destinationFacility: {
                id: string;
                name: string;
                type: string;
            } | null;
            originFacility: {
                id: string;
                name: string;
                type: string;
            } | null;
            pickupLocation: {
                id: string;
                name: string;
                contactPhone: string | null;
                contactEmail: string | null;
                floor: string | null;
                room: string | null;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            tripNumber: string | null;
            patientId: string;
            patientWeight: string | null;
            specialNeeds: string | null;
            originFacilityId: string | null;
            destinationFacilityId: string | null;
            fromLocation: string | null;
            toLocation: string | null;
            fromLocationId: string | null;
            isMultiLocationFacility: boolean;
            scheduledTime: Date | null;
            transportLevel: string;
            urgencyLevel: string | null;
            priority: string;
            specialRequirements: string | null;
            diagnosis: string | null;
            mobilityLevel: string | null;
            oxygenRequired: boolean;
            monitoringRequired: boolean;
            generateQRCode: boolean;
            qrCodeData: string | null;
            selectedAgencies: string[];
            notificationRadius: number | null;
            requestTimestamp: Date;
            acceptedTimestamp: Date | null;
            pickupTimestamp: Date | null;
            arrivalTimestamp: Date | null;
            departureTimestamp: Date | null;
            completionTimestamp: Date | null;
            pickupLocationId: string | null;
            assignedAgencyId: string | null;
            assignedUnitId: string | null;
            createdById: string | null;
            healthcareCreatedById: string | null;
            isolation: boolean;
            bariatric: boolean;
            notes: string | null;
        };
        error?: undefined;
    }>;
    /**
     * Update trip status
     */
    updateTripStatus(id: string, data: UpdateTripStatusRequest): Promise<{
        success: boolean;
        data: {
            assignedUnit: {
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                agencyId: string;
                latitude: number | null;
                longitude: number | null;
                type: string;
                capabilities: string[];
                status: string;
                unitNumber: string;
                currentStatus: string;
                currentLocation: string | null;
                crewSize: number;
                equipment: string[];
                location: import("@prisma/client/runtime/library").JsonValue | null;
                lastMaintenance: Date | null;
                nextMaintenance: Date | null;
                lastStatusUpdate: Date;
            } | null;
            destinationFacility: {
                email: string | null;
                id: string;
                name: string;
                phone: string | null;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                address: string;
                city: string;
                state: string;
                zipCode: string;
                latitude: number | null;
                longitude: number | null;
                type: string;
                capabilities: string[];
                region: string;
                coordinates: import("@prisma/client/runtime/library").JsonValue | null;
                operatingHours: string | null;
                requiresReview: boolean;
                approvedAt: Date | null;
                approvedBy: string | null;
            } | null;
            originFacility: {
                email: string | null;
                id: string;
                name: string;
                phone: string | null;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                address: string;
                city: string;
                state: string;
                zipCode: string;
                latitude: number | null;
                longitude: number | null;
                type: string;
                capabilities: string[];
                region: string;
                coordinates: import("@prisma/client/runtime/library").JsonValue | null;
                operatingHours: string | null;
                requiresReview: boolean;
                approvedAt: Date | null;
                approvedBy: string | null;
            } | null;
            pickupLocation: {
                id: string;
                name: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                contactPhone: string | null;
                hospitalId: string;
                description: string | null;
                contactEmail: string | null;
                floor: string | null;
                room: string | null;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            tripNumber: string | null;
            patientId: string;
            patientWeight: string | null;
            specialNeeds: string | null;
            originFacilityId: string | null;
            destinationFacilityId: string | null;
            fromLocation: string | null;
            toLocation: string | null;
            fromLocationId: string | null;
            isMultiLocationFacility: boolean;
            scheduledTime: Date | null;
            transportLevel: string;
            urgencyLevel: string | null;
            priority: string;
            specialRequirements: string | null;
            diagnosis: string | null;
            mobilityLevel: string | null;
            oxygenRequired: boolean;
            monitoringRequired: boolean;
            generateQRCode: boolean;
            qrCodeData: string | null;
            selectedAgencies: string[];
            notificationRadius: number | null;
            requestTimestamp: Date;
            acceptedTimestamp: Date | null;
            pickupTimestamp: Date | null;
            arrivalTimestamp: Date | null;
            departureTimestamp: Date | null;
            completionTimestamp: Date | null;
            pickupLocationId: string | null;
            assignedAgencyId: string | null;
            assignedUnitId: string | null;
            createdById: string | null;
            healthcareCreatedById: string | null;
            isolation: boolean;
            bariatric: boolean;
            notes: string | null;
        };
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    /**
     * Get agencies for a specific hospital (simplified version)
     */
    getAgenciesForHospital(hospitalId: string): Promise<{
        success: boolean;
        data: {
            email: string;
            id: string;
            name: string;
            phone: string;
            city: string;
            state: string;
        }[];
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        data?: undefined;
    }>;
    /**
     * Create an enhanced transport request
     */
    createEnhancedTrip(data: EnhancedCreateTripRequest): Promise<{
        success: boolean;
        error: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            healthcareLocation: {
                id: string;
                facilityType: string;
                city: string;
                state: string;
                locationName: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            tripNumber: string | null;
            patientId: string;
            patientWeight: string | null;
            specialNeeds: string | null;
            originFacilityId: string | null;
            destinationFacilityId: string | null;
            fromLocation: string | null;
            toLocation: string | null;
            fromLocationId: string | null;
            isMultiLocationFacility: boolean;
            scheduledTime: Date | null;
            transportLevel: string;
            urgencyLevel: string | null;
            priority: string;
            specialRequirements: string | null;
            diagnosis: string | null;
            mobilityLevel: string | null;
            oxygenRequired: boolean;
            monitoringRequired: boolean;
            generateQRCode: boolean;
            qrCodeData: string | null;
            selectedAgencies: string[];
            notificationRadius: number | null;
            requestTimestamp: Date;
            acceptedTimestamp: Date | null;
            pickupTimestamp: Date | null;
            arrivalTimestamp: Date | null;
            departureTimestamp: Date | null;
            completionTimestamp: Date | null;
            pickupLocationId: string | null;
            assignedAgencyId: string | null;
            assignedUnitId: string | null;
            createdById: string | null;
            healthcareCreatedById: string | null;
            isolation: boolean;
            bariatric: boolean;
            notes: string | null;
        };
        error?: undefined;
    }>;
    /**
     * Get trip history with filtering
     */
    getTripHistory(filters: {
        status?: string;
        agencyId?: string;
        dateFrom?: string;
        dateTo?: string;
        limit: number;
        offset: number;
        search?: string;
    }): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            tripNumber: string | null;
            patientId: string;
            patientWeight: string | null;
            specialNeeds: string | null;
            originFacilityId: string | null;
            destinationFacilityId: string | null;
            fromLocation: string | null;
            toLocation: string | null;
            fromLocationId: string | null;
            isMultiLocationFacility: boolean;
            scheduledTime: Date | null;
            transportLevel: string;
            urgencyLevel: string | null;
            priority: string;
            specialRequirements: string | null;
            diagnosis: string | null;
            mobilityLevel: string | null;
            oxygenRequired: boolean;
            monitoringRequired: boolean;
            generateQRCode: boolean;
            qrCodeData: string | null;
            selectedAgencies: string[];
            notificationRadius: number | null;
            requestTimestamp: Date;
            acceptedTimestamp: Date | null;
            pickupTimestamp: Date | null;
            arrivalTimestamp: Date | null;
            departureTimestamp: Date | null;
            completionTimestamp: Date | null;
            pickupLocationId: string | null;
            assignedAgencyId: string | null;
            assignedUnitId: string | null;
            createdById: string | null;
            healthcareCreatedById: string | null;
            isolation: boolean;
            bariatric: boolean;
            notes: string | null;
        }[];
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        data?: undefined;
    }>;
    /**
     * Get available agencies
     */
    getAvailableAgencies(): Promise<{
        success: boolean;
        data: {
            email: string;
            id: string;
            name: string;
            phone: string;
            city: string;
            state: string;
            capabilities: string[];
            serviceArea: string[];
        }[];
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        data?: undefined;
    }>;
    /**
     * Get notification settings for a user
     */
    getNotificationSettings(userId: string): Promise<{
        emailNotifications: boolean;
        smsNotifications: boolean;
        newTripAlerts: boolean;
        statusUpdates: boolean;
        emailAddress: null;
        phoneNumber: null;
    }>;
    /**
     * Update notification settings for a user
     */
    updateNotificationSettings(userId: string, settings: any): Promise<{
        success: boolean;
        data: any;
        error: null;
    }>;
    /**
     * Update trip times
     */
    updateTripTimes(id: string, times: {
        transferAcceptedTime?: string;
        emsArrivalTime?: string;
        emsDepartureTime?: string;
    }): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            tripNumber: string | null;
            patientId: string;
            patientWeight: string | null;
            specialNeeds: string | null;
            originFacilityId: string | null;
            destinationFacilityId: string | null;
            fromLocation: string | null;
            toLocation: string | null;
            fromLocationId: string | null;
            isMultiLocationFacility: boolean;
            scheduledTime: Date | null;
            transportLevel: string;
            urgencyLevel: string | null;
            priority: string;
            specialRequirements: string | null;
            diagnosis: string | null;
            mobilityLevel: string | null;
            oxygenRequired: boolean;
            monitoringRequired: boolean;
            generateQRCode: boolean;
            qrCodeData: string | null;
            selectedAgencies: string[];
            notificationRadius: number | null;
            requestTimestamp: Date;
            acceptedTimestamp: Date | null;
            pickupTimestamp: Date | null;
            arrivalTimestamp: Date | null;
            departureTimestamp: Date | null;
            completionTimestamp: Date | null;
            pickupLocationId: string | null;
            assignedAgencyId: string | null;
            assignedUnitId: string | null;
            createdById: string | null;
            healthcareCreatedById: string | null;
            isolation: boolean;
            bariatric: boolean;
            notes: string | null;
        };
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        data?: undefined;
    }>;
    /**
     * Get diagnosis options
     */
    getDiagnosisOptions(): {
        success: boolean;
        data: readonly ["UTI", "Dialysis", "Cardiac", "Respiratory", "Neurological", "Orthopedic", "General Medical", "Other"];
    };
    /**
     * Get mobility options
     */
    getMobilityOptions(): {
        success: boolean;
        data: readonly ["Ambulatory", "Wheelchair", "Stretcher", "Bed"];
    };
    /**
     * Get transport level options
     */
    getTransportLevelOptions(): {
        success: boolean;
        data: readonly ["BLS", "ALS", "CCT", "Other"];
    };
    /**
     * Get urgency options
     */
    getUrgencyOptions(): {
        success: boolean;
        data: readonly ["Routine", "Urgent", "Emergent"];
    };
    /**
     * Get insurance options
     */
    getInsuranceOptions(): Promise<{
        success: boolean;
        data: string[];
    }>;
    /**
     * Create trip with responses
     */
    createTripWithResponses(data: any): Promise<{
        success: boolean;
        error: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            healthcareLocation: {
                id: string;
                facilityType: string;
                city: string;
                state: string;
                locationName: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            tripNumber: string | null;
            patientId: string;
            patientWeight: string | null;
            specialNeeds: string | null;
            originFacilityId: string | null;
            destinationFacilityId: string | null;
            fromLocation: string | null;
            toLocation: string | null;
            fromLocationId: string | null;
            isMultiLocationFacility: boolean;
            scheduledTime: Date | null;
            transportLevel: string;
            urgencyLevel: string | null;
            priority: string;
            specialRequirements: string | null;
            diagnosis: string | null;
            mobilityLevel: string | null;
            oxygenRequired: boolean;
            monitoringRequired: boolean;
            generateQRCode: boolean;
            qrCodeData: string | null;
            selectedAgencies: string[];
            notificationRadius: number | null;
            requestTimestamp: Date;
            acceptedTimestamp: Date | null;
            pickupTimestamp: Date | null;
            arrivalTimestamp: Date | null;
            departureTimestamp: Date | null;
            completionTimestamp: Date | null;
            pickupLocationId: string | null;
            assignedAgencyId: string | null;
            assignedUnitId: string | null;
            createdById: string | null;
            healthcareCreatedById: string | null;
            isolation: boolean;
            bariatric: boolean;
            notes: string | null;
        };
        error?: undefined;
    }>;
    /**
     * Update trip response fields
     */
    updateTripResponseFields(id: string, data: any): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            tripNumber: string | null;
            patientId: string;
            patientWeight: string | null;
            specialNeeds: string | null;
            originFacilityId: string | null;
            destinationFacilityId: string | null;
            fromLocation: string | null;
            toLocation: string | null;
            fromLocationId: string | null;
            isMultiLocationFacility: boolean;
            scheduledTime: Date | null;
            transportLevel: string;
            urgencyLevel: string | null;
            priority: string;
            specialRequirements: string | null;
            diagnosis: string | null;
            mobilityLevel: string | null;
            oxygenRequired: boolean;
            monitoringRequired: boolean;
            generateQRCode: boolean;
            qrCodeData: string | null;
            selectedAgencies: string[];
            notificationRadius: number | null;
            requestTimestamp: Date;
            acceptedTimestamp: Date | null;
            pickupTimestamp: Date | null;
            arrivalTimestamp: Date | null;
            departureTimestamp: Date | null;
            completionTimestamp: Date | null;
            pickupLocationId: string | null;
            assignedAgencyId: string | null;
            assignedUnitId: string | null;
            createdById: string | null;
            healthcareCreatedById: string | null;
            isolation: boolean;
            bariatric: boolean;
            notes: string | null;
        };
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        data?: undefined;
    }>;
    /**
     * Get trip with responses
     */
    getTripWithResponses(id: string): Promise<{
        success: boolean;
        error: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            tripNumber: string | null;
            patientId: string;
            patientWeight: string | null;
            specialNeeds: string | null;
            originFacilityId: string | null;
            destinationFacilityId: string | null;
            fromLocation: string | null;
            toLocation: string | null;
            fromLocationId: string | null;
            isMultiLocationFacility: boolean;
            scheduledTime: Date | null;
            transportLevel: string;
            urgencyLevel: string | null;
            priority: string;
            specialRequirements: string | null;
            diagnosis: string | null;
            mobilityLevel: string | null;
            oxygenRequired: boolean;
            monitoringRequired: boolean;
            generateQRCode: boolean;
            qrCodeData: string | null;
            selectedAgencies: string[];
            notificationRadius: number | null;
            requestTimestamp: Date;
            acceptedTimestamp: Date | null;
            pickupTimestamp: Date | null;
            arrivalTimestamp: Date | null;
            departureTimestamp: Date | null;
            completionTimestamp: Date | null;
            pickupLocationId: string | null;
            assignedAgencyId: string | null;
            assignedUnitId: string | null;
            createdById: string | null;
            healthcareCreatedById: string | null;
            isolation: boolean;
            bariatric: boolean;
            notes: string | null;
        };
        error?: undefined;
    }>;
    /**
     * Get trip response summary
     */
    getTripResponseSummary(id: string): Promise<{
        success: boolean;
        data: {
            totalResponses: number;
            acceptedResponses: number;
            declinedResponses: number;
            pendingResponses: number;
        };
        error: null;
    }>;
    /**
     * Create agency response
     */
    createAgencyResponse(data: any): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            agencyId: string;
            assignedUnitId: string | null;
            tripId: string;
            response: string;
            responseTimestamp: Date;
            responseNotes: string | null;
            estimatedArrival: Date | null;
            isSelected: boolean;
        };
        error: null;
    } | {
        success: boolean;
        data: null;
        error: any;
    }>;
    /**
     * Update agency response
     */
    updateAgencyResponse(id: string, data: any): Promise<{
        success: boolean;
        data: {
            assignedUnit: {
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                agencyId: string;
                latitude: number | null;
                longitude: number | null;
                type: string;
                capabilities: string[];
                status: string;
                unitNumber: string;
                currentStatus: string;
                currentLocation: string | null;
                crewSize: number;
                equipment: string[];
                location: import("@prisma/client/runtime/library").JsonValue | null;
                lastMaintenance: Date | null;
                nextMaintenance: Date | null;
                lastStatusUpdate: Date;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            agencyId: string;
            assignedUnitId: string | null;
            tripId: string;
            response: string;
            responseTimestamp: Date;
            responseNotes: string | null;
            estimatedArrival: Date | null;
            isSelected: boolean;
        };
        error: null;
    } | {
        success: boolean;
        data: null;
        error: string;
    }>;
    /**
     * Get agency responses
     */
    getAgencyResponses(filters: any): Promise<{
        success: boolean;
        data: {
            id: string;
            tripId: string;
            agencyId: string;
            agency: {
                id: string;
                name: string;
            };
            response: string;
            responseTimestamp: Date;
            responseNotes: string;
            estimatedArrival: Date | null;
            isSelected: boolean;
            assignedUnitId: string | null;
            assignedUnit: {
                id: string;
                unitNumber: string;
                type: string;
            } | null;
            createdAt: Date;
            updatedAt: Date;
            trip: {
                id: any;
                patientId: any;
                fromLocation: any;
                toLocation: any;
                transportLevel: any;
                urgencyLevel: any;
            } | null;
        }[];
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        data?: undefined;
    }>;
    /**
     * Get agency response by ID
     */
    getAgencyResponseById(id: string): Promise<{
        success: boolean;
        data: {
            id: string;
            response: string;
        };
        error: null;
    }>;
    /**
     * Select agency for trip
     */
    selectAgencyForTrip(responseId: string): Promise<{
        success: boolean;
        data: null;
        error: string;
    } | {
        success: boolean;
        data: {
            tripId: string;
            responseId: string;
        };
        error: null;
    }>;
    /**
     * Validate unit assignment
     */
    private validateUnitAssignment;
    /**
     * Update unit status
     */
    private updateUnitStatus;
    /**
     * Calculate distance and estimated time for a trip
     */
    calculateTripDistanceAndTime(data: {
        fromLocation?: string;
        toLocation?: string;
        fromLocationId?: string;
        destinationFacilityId?: string;
    }): Promise<{
        success: boolean;
        error: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            distance: number;
            estimatedTimeMinutes: number;
            estimatedTimeFormatted: string;
            distanceFormatted: string;
        };
        error?: undefined;
    }>;
}
export declare const tripService: TripService;
//# sourceMappingURL=tripService.d.ts.map