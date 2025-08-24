import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
  isDemoMode?: boolean;
}

export interface LocationUpdate {
  unitId: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  batteryLevel: number;
  signalStrength: number;
  timestamp: string;
}

export interface TransportRequestUpdate {
  id: string;
  status: string;
  assignedUnitId?: string;
  timestamp: string;
}

export interface GeofenceEvent {
  unitId: string;
  facilityId: string;
  eventType: 'ENTER' | 'EXIT' | 'APPROACHING';
  timestamp: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

export class WebSocketService {
  private io: SocketIOServer;
  private connectedClients: Map<string, AuthenticatedSocket> = new Map();
  private unitSubscriptions: Map<string, Set<string>> = new Map(); // unitId -> Set of clientIds
  private facilitySubscriptions: Map<string, Set<string>> = new Map(); // facilityId -> Set of clientIds
  private adminSubscriptions: Set<string> = new Set(); // clientIds of admin users

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3002",
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.setupMiddleware();
    this.setupEventHandlers();
    this.startHeartbeat();
  }

  private setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        // Check for demo mode
        if (token === 'demo-token') {
          socket.isDemoMode = true;
          socket.userId = 'demo-user';
          socket.userRole = 'coordinator';
          return next();
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
        socket.userId = decoded.userId;
        socket.userRole = decoded.role;
        socket.isDemoMode = false;
        
        next();
      } catch (error) {
        console.error('WebSocket authentication error:', error);
        next(new Error('Authentication failed'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`🔌 WebSocket client connected: ${socket.id} (User: ${socket.userId}, Role: ${socket.userRole})`);
      
      this.connectedClients.set(socket.id, socket);

      // Handle client subscriptions
      socket.on('subscribe:units', (unitIds: string[]) => {
        this.handleUnitSubscription(socket, unitIds);
      });

      socket.on('subscribe:facilities', (facilityIds: string[]) => {
        this.handleFacilitySubscription(socket, facilityIds);
      });

      socket.on('subscribe:admin', () => {
        if (socket.userRole === 'admin' || socket.userRole === 'coordinator') {
          this.adminSubscriptions.add(socket.id);
          console.log(`👑 Admin subscription added for client: ${socket.id}`);
        }
      });

      socket.on('subscribe:all', () => {
        // Subscribe to all updates (for coordinators and admins)
        if (socket.userRole === 'admin' || socket.userRole === 'coordinator') {
          this.adminSubscriptions.add(socket.id);
          console.log(`🌐 Global subscription added for client: ${socket.id}`);
        }
      });

      // Handle location updates from units
      socket.on('location:update', async (update: LocationUpdate) => {
        await this.handleLocationUpdate(socket, update);
      });

      // Handle transport request updates
      socket.on('transport:update', async (update: TransportRequestUpdate) => {
        await this.handleTransportRequestUpdate(socket, update);
      });

      // Handle geofence events
      socket.on('geofence:event', async (event: GeofenceEvent) => {
        await this.handleGeofenceEvent(socket, event);
      });

      // Handle client disconnection
      socket.on('disconnect', () => {
        this.handleClientDisconnection(socket);
      });

      // Send initial connection confirmation
      socket.emit('connected', {
        message: 'Successfully connected to MedPort WebSocket server',
        userId: socket.userId,
        userRole: socket.userRole,
        isDemoMode: socket.isDemoMode,
        timestamp: new Date().toISOString()
      });
    });
  }

  private handleUnitSubscription(socket: AuthenticatedSocket, unitIds: string[]) {
    unitIds.forEach(unitId => {
      if (!this.unitSubscriptions.has(unitId)) {
        this.unitSubscriptions.set(unitId, new Set());
      }
      this.unitSubscriptions.get(unitId)!.add(socket.id);
    });

    console.log(`📡 Client ${socket.id} subscribed to units: ${unitIds.join(', ')}`);
    
    // Send current unit status
    this.sendCurrentUnitStatus(socket, unitIds);
  }

  private handleFacilitySubscription(socket: AuthenticatedSocket, facilityIds: string[]) {
    facilityIds.forEach(facilityId => {
      if (!this.facilitySubscriptions.has(facilityId)) {
        this.facilitySubscriptions.set(facilityId, new Set());
      }
      this.facilitySubscriptions.get(facilityId)!.add(socket.id);
    });

    console.log(`🏥 Client ${socket.id} subscribed to facilities: ${facilityIds.join(', ')}`);
  }

  private async handleLocationUpdate(socket: AuthenticatedSocket, update: LocationUpdate) {
    try {
      // Store location update in database
      if (!socket.isDemoMode) {
        await this.storeLocationUpdate(update);
      }

      // Broadcast to subscribed clients
      this.broadcastLocationUpdate(update);

      // Check for geofence events
      await this.checkGeofenceEvents(update);

      // Send confirmation to sender
      socket.emit('location:confirmed', {
        unitId: update.unitId,
        timestamp: update.timestamp,
        status: 'stored'
      });

    } catch (error) {
      console.error('Error handling location update:', error);
      socket.emit('location:error', {
        unitId: update.unitId,
        error: 'Failed to process location update'
      });
    }
  }

  private async handleTransportRequestUpdate(socket: AuthenticatedSocket, update: TransportRequestUpdate) {
    try {
      // Store transport request update in database
      if (!socket.isDemoMode) {
        await this.storeTransportRequestUpdate(update);
      }

      // Broadcast to admin subscribers
      this.broadcastTransportRequestUpdate(update);

      // Send confirmation to sender
      socket.emit('transport:confirmed', {
        id: update.id,
        timestamp: update.timestamp,
        status: 'updated'
      });

    } catch (error) {
      console.error('Error handling transport request update:', error);
      socket.emit('transport:error', {
        id: update.id,
        error: 'Failed to process transport request update'
      });
    }
  }

  private async handleGeofenceEvent(socket: AuthenticatedSocket, event: GeofenceEvent) {
    try {
      // Store geofence event in database
      if (!socket.isDemoMode) {
        await this.storeGeofenceEvent(event);
      }

      // Broadcast to facility subscribers
      this.broadcastGeofenceEvent(event);

      // Send confirmation to sender
      socket.emit('geofence:confirmed', {
        unitId: event.unitId,
        facilityId: event.facilityId,
        timestamp: event.timestamp,
        status: 'processed'
      });

    } catch (error) {
      console.error('Error handling geofence event:', error);
      socket.emit('geofence:error', {
        unitId: event.unitId,
        facilityId: event.facilityId,
        error: 'Failed to process geofence event'
      });
    }
  }

  private async storeLocationUpdate(update: LocationUpdate) {
    // Store in GPS tracking table
    let gpsTracking = await prisma.gPSTracking.findFirst({
      where: { unitId: update.unitId, isActive: true },
      orderBy: { timestamp: 'desc' },
    });

    if (gpsTracking) {
      // Update existing record
      gpsTracking = await prisma.gPSTracking.update({
        where: { id: gpsTracking.id },
        data: {
          latitude: update.latitude,
          longitude: update.longitude,
          speed: update.speed,
          heading: update.heading,
          batteryLevel: update.batteryLevel,
          signalStrength: update.signalStrength,
          timestamp: new Date(update.timestamp),
          isActive: true,
        },
      });
    } else {
      // Create new record
      gpsTracking = await prisma.gPSTracking.create({
        data: {
          unitId: update.unitId,
          latitude: update.latitude,
          longitude: update.longitude,
          speed: update.speed,
          heading: update.heading,
          batteryLevel: update.batteryLevel,
          signalStrength: update.signalStrength,
          timestamp: new Date(update.timestamp),
          locationType: 'GPS',
          source: 'UNIT_DEVICE',
          isActive: true,
        },
      });
    }

    // Store in location history
    await prisma.locationHistory.create({
      data: {
        gpsTrackingId: gpsTracking.id,
        latitude: update.latitude,
        longitude: update.longitude,
        speed: update.speed,
        heading: update.heading,
        locationType: 'GPS',
        source: 'UNIT_DEVICE',
        timestamp: new Date(update.timestamp),
      },
    });
  }

  private async storeTransportRequestUpdate(update: TransportRequestUpdate) {
    await prisma.transportRequest.update({
      where: { id: update.id },
      data: {
        status: update.status as any, // Cast to any to handle enum conversion
        assignedUnitId: update.assignedUnitId,
        updatedAt: new Date(update.timestamp),
      },
    });
  }

  private async storeGeofenceEvent(event: GeofenceEvent) {
    // First get the GPS tracking record for this unit
    const gpsTracking = await prisma.gPSTracking.findFirst({
      where: { unitId: event.unitId, isActive: true },
      orderBy: { timestamp: 'desc' },
    });

    if (!gpsTracking) {
      throw new Error(`No active GPS tracking found for unit ${event.unitId}`);
    }

    await prisma.geofenceEvent.create({
      data: {
        gpsTrackingId: gpsTracking.id,
        facilityId: event.facilityId,
        geofenceType: 'FACILITY_ARRIVAL', // Default type
        eventType: event.eventType === 'ENTER' ? 'ENTERED' : 
                  event.eventType === 'EXIT' ? 'EXITED' : 'APPROACHING',
        latitude: event.location.latitude,
        longitude: event.location.longitude,
        radius: 100, // Default radius in meters
        timestamp: new Date(event.timestamp),
        isActive: true,
      },
    });
  }

  private async checkGeofenceEvents(update: LocationUpdate) {
    // This would implement geofence checking logic
    // For now, we'll just log the check
    console.log(`🔍 Checking geofences for unit ${update.unitId} at ${update.latitude}, ${update.longitude}`);
  }

  private broadcastLocationUpdate(update: LocationUpdate) {
    // Broadcast to unit subscribers
    const unitSubscribers = this.unitSubscriptions.get(update.unitId);
    if (unitSubscribers) {
      unitSubscribers.forEach(clientId => {
        const client = this.connectedClients.get(clientId);
        if (client) {
          client.emit('location:update', update);
        }
      });
    }

    // Broadcast to admin subscribers
    this.adminSubscriptions.forEach(clientId => {
      const client = this.connectedClients.get(clientId);
      if (client) {
        client.emit('location:update', update);
      }
    });
  }

  private broadcastTransportRequestUpdate(update: TransportRequestUpdate) {
    // Broadcast to admin subscribers
    this.adminSubscriptions.forEach(clientId => {
      const client = this.connectedClients.get(clientId);
      if (client) {
        client.emit('transport:update', update);
      }
    });
  }

  private broadcastGeofenceEvent(event: GeofenceEvent) {
    // Broadcast to facility subscribers
    const facilitySubscribers = this.facilitySubscriptions.get(event.facilityId);
    if (facilitySubscribers) {
      facilitySubscribers.forEach(clientId => {
        const client = this.connectedClients.get(clientId);
        if (client) {
          client.emit('geofence:event', event);
        }
      });
    }

    // Broadcast to admin subscribers
    this.adminSubscriptions.forEach(clientId => {
      const client = this.connectedClients.get(clientId);
      if (client) {
        client.emit('geofence:event', event);
      }
    });
  }

  private async sendCurrentUnitStatus(socket: AuthenticatedSocket, unitIds: string[]) {
    try {
      if (socket.isDemoMode) {
        // Send demo data
        const demoStatus = unitIds.map(unitId => ({
          unitId,
          status: 'active',
          lastLocation: {
            latitude: 37.7749 + (Math.random() - 0.5) * 0.1,
            longitude: -122.4194 + (Math.random() - 0.5) * 0.1,
          },
          lastUpdate: new Date().toISOString(),
        }));
        
        socket.emit('units:status', demoStatus);
      } else {
        // Send real data from database
        const units = await prisma.gPSTracking.findMany({
          where: {
            unitId: { in: unitIds },
            isActive: true,
          },
          orderBy: { timestamp: 'desc' },
        });

        const status = units.map(unit => ({
          unitId: unit.unitId,
          status: 'active',
          lastLocation: {
            latitude: unit.latitude,
            longitude: unit.longitude,
          },
          lastUpdate: unit.timestamp.toISOString(),
        }));

        socket.emit('units:status', status);
      }
    } catch (error) {
      console.error('Error sending current unit status:', error);
    }
  }

  private handleClientDisconnection(socket: AuthenticatedSocket) {
    console.log(`🔌 WebSocket client disconnected: ${socket.id}`);
    
    // Remove from connected clients
    this.connectedClients.delete(socket.id);
    
    // Remove from admin subscriptions
    this.adminSubscriptions.delete(socket.id);
    
    // Remove from unit subscriptions
    this.unitSubscriptions.forEach((subscribers, unitId) => {
      subscribers.delete(socket.id);
      if (subscribers.size === 0) {
        this.unitSubscriptions.delete(unitId);
      }
    });
    
    // Remove from facility subscriptions
    this.facilitySubscriptions.forEach((subscribers, facilityId) => {
      subscribers.delete(socket.id);
      if (subscribers.size === 0) {
        this.facilitySubscriptions.delete(facilityId);
      }
    });
  }

  private startHeartbeat() {
    // Send heartbeat every 30 seconds to keep connections alive
    setInterval(() => {
      this.io.emit('heartbeat', {
        timestamp: new Date().toISOString(),
        connectedClients: this.connectedClients.size,
        activeSubscriptions: this.unitSubscriptions.size + this.facilitySubscriptions.size,
      });
    }, 30000);
  }

  // Public methods for external use
  public broadcastToAll(event: string, data: any) {
    this.io.emit(event, data);
  }

  public broadcastToAdmins(event: string, data: any) {
    this.adminSubscriptions.forEach(clientId => {
      const client = this.connectedClients.get(clientId);
      if (client) {
        client.emit(event, data);
      }
    });
  }

  public broadcastToUnit(unitId: string, event: string, data: any) {
    const unitSubscribers = this.unitSubscriptions.get(unitId);
    if (unitSubscribers) {
      unitSubscribers.forEach(clientId => {
        const client = this.connectedClients.get(clientId);
        if (client) {
          client.emit(event, data);
        }
      });
    }
  }

  public getConnectionStats() {
    return {
      totalConnections: this.connectedClients.size,
      adminSubscriptions: this.adminSubscriptions.size,
      unitSubscriptions: this.unitSubscriptions.size,
      facilitySubscriptions: this.facilitySubscriptions.size,
    };
  }
}

export default WebSocketService;
