import { EventEmitter } from 'events';
import { databaseManager } from './databaseManager';

/**
 * EventBus - Handles cross-database communication through events
 * 
 * This system enables real-time updates across the three databases
 * without tight coupling between them.
 */
export class EventBus extends EventEmitter {
  private static instance: EventBus;

  private constructor() {
    super();
    this.setupEventHandlers();
  }

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  /**
   * Setup event handlers for cross-database communication
   */
  private setupEventHandlers() {
    // Trip Creation Flow
    this.on('trip.created', this.handleTripCreated.bind(this));
    this.on('trip.accepted', this.handleTripAccepted.bind(this));
    this.on('trip.completed', this.handleTripCompleted.bind(this));
    this.on('trip.cancelled', this.handleTripCancelled.bind(this));

    // User Management Flow
    this.on('user.created', this.handleUserCreated.bind(this));
    this.on('user.updated', this.handleUserUpdated.bind(this));

    // Service Management Flow
    this.on('service.added', this.handleServiceAdded.bind(this));
    this.on('service.updated', this.handleServiceUpdated.bind(this));

    // Agency Management Flow
    this.on('agency.registered', this.handleAgencyRegistered.bind(this));
    this.on('agency.updated', this.handleAgencyUpdated.bind(this));
  }

  /**
   * Trip Creation Event Handlers
   */
  private async handleTripCreated(data: {
    tripId: string;
    hospitalId: string;
    transportLevel: string;
    priority: string;
    originFacilityId: string;
    destinationFacilityId: string;
  }) {
    try {
      console.log('[EventBus] Trip created:', data.tripId);

      // 1. Create available trip in EMS DB for agencies to see
      const emsDB = databaseManager.getEMSDB();
      await emsDB.availableTrip.create({
        data: {
          transportRequestId: data.tripId,
          hospitalId: data.hospitalId,
          transportLevel: data.transportLevel,
          priority: data.priority,
          originFacilityId: data.originFacilityId,
          destinationFacilityId: data.destinationFacilityId,
          status: 'AVAILABLE',
          createdAt: new Date()
        }
      });

      // 2. Log analytics in Center DB
      const centerDB = databaseManager.getCenterDB();
      await centerDB.systemAnalytics.create({
        data: {
          metricName: 'trip_created',
          metricValue: 1,
          category: 'hospital_operations',
          metadata: {
            transportLevel: data.transportLevel,
            priority: data.priority,
            hospitalId: data.hospitalId
          }
        }
      });

      console.log('[EventBus] Trip creation processed successfully');
    } catch (error) {
      console.error('[EventBus] Error processing trip creation:', error);
    }
  }

  private async handleTripAccepted(data: {
    tripId: string;
    agencyId: string;
    unitId: string;
    estimatedArrival: Date;
  }) {
    try {
      console.log('[EventBus] Trip accepted:', data.tripId);

      // 1. Update trip status in Hospital DB
      const hospitalDB = databaseManager.getHospitalDB();
      await hospitalDB.transportRequest.update({
        where: { id: data.tripId },
        data: {
          status: 'ASSIGNED',
          assignedAgencyId: data.agencyId,
          assignedUnitId: data.unitId,
          acceptedTimestamp: new Date()
        }
      });

      // 2. Update EMS DB bid status
      const emsDB = databaseManager.getEMSDB();
      await emsDB.transportBid.updateMany({
        where: { transportRequestId: data.tripId },
        data: { status: 'ACCEPTED' }
      });

      // 3. Log performance metrics in Center DB
      const centerDB = databaseManager.getCenterDB();
      await centerDB.systemAnalytics.create({
        data: {
          metricName: 'trip_accepted',
          metricValue: 1,
          category: 'ems_operations',
          metadata: {
            agencyId: data.agencyId,
            unitId: data.unitId,
            estimatedArrival: data.estimatedArrival
          }
        }
      });

      console.log('[EventBus] Trip acceptance processed successfully');
    } catch (error) {
      console.error('[EventBus] Error processing trip acceptance:', error);
    }
  }

  private async handleTripCompleted(data: {
    tripId: string;
    agencyId: string;
    completionTime: Date;
    actualDuration: number;
  }) {
    try {
      console.log('[EventBus] Trip completed:', data.tripId);

      // 1. Update trip status in Hospital DB
      const hospitalDB = databaseManager.getHospitalDB();
      await hospitalDB.transportRequest.update({
        where: { id: data.tripId },
        data: {
          status: 'COMPLETED',
          completionTimestamp: data.completionTime
        }
      });

      // 2. Log completion analytics in Center DB
      const centerDB = databaseManager.getCenterDB();
      await centerDB.systemAnalytics.create({
        data: {
          metricName: 'trip_completed',
          metricValue: 1,
          category: 'performance_metrics',
          metadata: {
            agencyId: data.agencyId,
            actualDuration: data.actualDuration,
            completionTime: data.completionTime
          }
        }
      });

      console.log('[EventBus] Trip completion processed successfully');
    } catch (error) {
      console.error('[EventBus] Error processing trip completion:', error);
    }
  }

  private async handleTripCancelled(data: {
    tripId: string;
    hospitalId: string;
    cancellationReason: string;
  }) {
    try {
      console.log('[EventBus] Trip cancelled:', data.tripId);

      // 1. Update trip status in Hospital DB
      const hospitalDB = databaseManager.getHospitalDB();
      await hospitalDB.transportRequest.update({
        where: { id: data.tripId },
        data: {
          status: 'CANCELLED',
          cancellationReason: data.cancellationReason
        }
      });

      // 2. Remove from EMS DB available trips
      const emsDB = databaseManager.getEMSDB();
      await emsDB.availableTrip.deleteMany({
        where: { transportRequestId: data.tripId }
      });

      // 3. Log cancellation analytics in Center DB
      const centerDB = databaseManager.getCenterDB();
      await centerDB.systemAnalytics.create({
        data: {
          metricName: 'trip_cancelled',
          metricValue: 1,
          category: 'hospital_operations',
          metadata: {
            hospitalId: data.hospitalId,
            cancellationReason: data.cancellationReason
          }
        }
      });

      console.log('[EventBus] Trip cancellation processed successfully');
    } catch (error) {
      console.error('[EventBus] Error processing trip cancellation:', error);
    }
  }

  /**
   * User Management Event Handlers
   */
  private async handleUserCreated(data: {
    userId: string;
    userType: string;
    email: string;
    name: string;
  }) {
    try {
      console.log('[EventBus] User created:', data.userId);

      // Log user registration analytics in Center DB
      const centerDB = databaseManager.getCenterDB();
      await centerDB.systemAnalytics.create({
        data: {
          metricName: 'user_registered',
          metricValue: 1,
          category: 'user_management',
          metadata: {
            userType: data.userType,
            email: data.email,
            name: data.name
          }
        }
      });

      console.log('[EventBus] User creation processed successfully');
    } catch (error) {
      console.error('[EventBus] Error processing user creation:', error);
    }
  }

  private async handleUserUpdated(data: {
    userId: string;
    userType: string;
    changes: any;
  }) {
    try {
      console.log('[EventBus] User updated:', data.userId);

      // Log user update analytics in Center DB
      const centerDB = databaseManager.getCenterDB();
      await centerDB.systemAnalytics.create({
        data: {
          metricName: 'user_updated',
          metricValue: 1,
          category: 'user_management',
          metadata: {
            userType: data.userType,
            changes: data.changes
          }
        }
      });

      console.log('[EventBus] User update processed successfully');
    } catch (error) {
      console.error('[EventBus] Error processing user update:', error);
    }
  }

  /**
   * Service Management Event Handlers
   */
  private async handleServiceAdded(data: {
    serviceId: string;
    serviceName: string;
    addedBy: string;
  }) {
    try {
      console.log('[EventBus] Service added:', data.serviceId);

      // Log service addition analytics in Center DB
      const centerDB = databaseManager.getCenterDB();
      await centerDB.systemAnalytics.create({
        data: {
          metricName: 'service_added',
          metricValue: 1,
          category: 'service_management',
          metadata: {
            serviceName: data.serviceName,
            addedBy: data.addedBy
          }
        }
      });

      console.log('[EventBus] Service addition processed successfully');
    } catch (error) {
      console.error('[EventBus] Error processing service addition:', error);
    }
  }

  private async handleServiceUpdated(data: {
    serviceId: string;
    serviceName: string;
    changes: any;
  }) {
    try {
      console.log('[EventBus] Service updated:', data.serviceId);

      // Log service update analytics in Center DB
      const centerDB = databaseManager.getCenterDB();
      await centerDB.systemAnalytics.create({
        data: {
          metricName: 'service_updated',
          metricValue: 1,
          category: 'service_management',
          metadata: {
            serviceName: data.serviceName,
            changes: data.changes
          }
        }
      });

      console.log('[EventBus] Service update processed successfully');
    } catch (error) {
      console.error('[EventBus] Error processing service update:', error);
    }
  }

  /**
   * Agency Management Event Handlers
   */
  private async handleAgencyRegistered(data: {
    agencyId: string;
    agencyName: string;
    contactName: string;
  }) {
    try {
      console.log('[EventBus] Agency registered:', data.agencyId);

      // Log agency registration analytics in Center DB
      const centerDB = databaseManager.getCenterDB();
      await centerDB.systemAnalytics.create({
        data: {
          metricName: 'agency_registered',
          metricValue: 1,
          category: 'agency_management',
          metadata: {
            agencyName: data.agencyName,
            contactName: data.contactName
          }
        }
      });

      console.log('[EventBus] Agency registration processed successfully');
    } catch (error) {
      console.error('[EventBus] Error processing agency registration:', error);
    }
  }

  private async handleAgencyUpdated(data: {
    agencyId: string;
    agencyName: string;
    changes: any;
  }) {
    try {
      console.log('[EventBus] Agency updated:', data.agencyId);

      // Log agency update analytics in Center DB
      const centerDB = databaseManager.getCenterDB();
      await centerDB.systemAnalytics.create({
        data: {
          metricName: 'agency_updated',
          metricValue: 1,
          category: 'agency_management',
          metadata: {
            agencyName: data.agencyName,
            changes: data.changes
          }
        }
      });

      console.log('[EventBus] Agency update processed successfully');
    } catch (error) {
      console.error('[EventBus] Error processing agency update:', error);
    }
  }

  /**
   * Public methods for emitting events
   */
  public emitTripCreated(data: any) {
    this.emit('trip.created', data);
  }

  public emitTripAccepted(data: any) {
    this.emit('trip.accepted', data);
  }

  public emitTripCompleted(data: any) {
    this.emit('trip.completed', data);
  }

  public emitTripCancelled(data: any) {
    this.emit('trip.cancelled', data);
  }

  public emitUserCreated(data: any) {
    this.emit('user.created', data);
  }

  public emitUserUpdated(data: any) {
    this.emit('user.updated', data);
  }

  public emitServiceAdded(data: any) {
    this.emit('service.added', data);
  }

  public emitServiceUpdated(data: any) {
    this.emit('service.updated', data);
  }

  public emitAgencyRegistered(data: any) {
    this.emit('agency.registered', data);
  }

  public emitAgencyUpdated(data: any) {
    this.emit('agency.updated', data);
  }
}

// Export singleton instance
export const eventBus = EventBus.getInstance();

