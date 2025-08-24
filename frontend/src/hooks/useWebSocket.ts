import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth';

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

export interface UnitStatus {
  unitId: string;
  status: string;
  lastLocation: {
    latitude: number;
    longitude: number;
  };
  lastUpdate: string;
}

export interface WebSocketStats {
  connected: boolean;
  reconnecting: boolean;
  lastHeartbeat: string | null;
  connectionCount: number;
  activeSubscriptions: number;
}

export const useWebSocket = () => {
  const { token } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [lastHeartbeat, setLastHeartbeat] = useState<string | null>(null);
  const [connectionStats, setConnectionStats] = useState<WebSocketStats>({
    connected: false,
    reconnecting: false,
    lastHeartbeat: null,
    connectionCount: 0,
    activeSubscriptions: 0,
  });

  // Connection management
  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      return;
    }

    const backendUrl = process.env.VITE_BACKEND_URL || 'http://localhost:5001';
    
    socketRef.current = io(backendUrl, {
      auth: {
        token: token || 'demo-token',
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    // Connection events
    socketRef.current.on('connect', () => {
      console.log('🔌 WebSocket connected');
      setIsConnected(true);
      setIsReconnecting(false);
      setConnectionStats(prev => ({ ...prev, connected: true, reconnecting: false }));
    });

    socketRef.current.on('disconnect', (reason) => {
      console.log('🔌 WebSocket disconnected:', reason);
      setIsConnected(false);
      setConnectionStats(prev => ({ ...prev, connected: false }));
      
      if (reason === 'io server disconnect') {
        // Server disconnected us, try to reconnect
        socketRef.current?.connect();
      }
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('🔌 WebSocket connection error:', error);
      setIsConnected(false);
      setConnectionStats(prev => ({ ...prev, connected: false }));
    });

    socketRef.current.on('reconnect', (attemptNumber) => {
      console.log(`🔌 WebSocket reconnected after ${attemptNumber} attempts`);
      setIsConnected(true);
      setIsReconnecting(false);
      setConnectionStats(prev => ({ ...prev, connected: true, reconnecting: false }));
    });

    socketRef.current.on('reconnecting', (attemptNumber) => {
      console.log(`🔌 WebSocket reconnecting... attempt ${attemptNumber}`);
      setIsReconnecting(true);
      setConnectionStats(prev => ({ ...prev, reconnecting: true }));
    });

    socketRef.current.on('reconnect_failed', () => {
      console.error('🔌 WebSocket reconnection failed');
      setIsReconnecting(false);
      setConnectionStats(prev => ({ ...prev, reconnecting: false }));
    });

    // Application events
    socketRef.current.on('connected', (data) => {
      console.log('✅ WebSocket server confirmed connection:', data);
    });

    socketRef.current.on('heartbeat', (data) => {
      setLastHeartbeat(data.timestamp);
      setConnectionStats(prev => ({
        ...prev,
        lastHeartbeat: data.timestamp,
        connectionCount: data.connectedClients,
        activeSubscriptions: data.activeSubscriptions,
      }));
    });

    socketRef.current.on('location:confirmed', (data) => {
      console.log('✅ Location update confirmed:', data);
    });

    socketRef.current.on('location:error', (data) => {
      console.error('❌ Location update error:', data);
    });

    socketRef.current.on('transport:confirmed', (data) => {
      console.log('✅ Transport request update confirmed:', data);
    });

    socketRef.current.on('transport:error', (data) => {
      console.error('❌ Transport request update error:', data);
    });

    socketRef.current.on('geofence:confirmed', (data) => {
      console.log('✅ Geofence event confirmed:', data);
    });

    socketRef.current.on('geofence:error', (data) => {
      console.error('❌ Geofence event error:', data);
    });

  }, [token]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setIsConnected(false);
    setIsReconnecting(false);
    setConnectionStats({
      connected: false,
      reconnecting: false,
      lastHeartbeat: null,
      connectionCount: 0,
      activeSubscriptions: 0,
    });
  }, []);

  // Subscription methods
  const subscribeToUnits = useCallback((unitIds: string[]) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('subscribe:units', unitIds);
      console.log(`📡 Subscribed to units: ${unitIds.join(', ')}`);
    }
  }, []);

  const subscribeToFacilities = useCallback((facilityIds: string[]) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('subscribe:facilities', facilityIds);
      console.log(`🏥 Subscribed to facilities: ${facilityIds.join(', ')}`);
    }
  }, []);

  const subscribeToAdmin = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('subscribe:admin');
      console.log('👑 Subscribed to admin updates');
    }
  }, []);

  const subscribeToAll = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('subscribe:all');
      console.log('🌐 Subscribed to all updates');
    }
  }, []);

  // Event emission methods
  const emitLocationUpdate = useCallback((update: LocationUpdate) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('location:update', update);
      console.log('📡 Emitting location update:', update);
    }
  }, []);

  const emitTransportRequestUpdate = useCallback((update: TransportRequestUpdate) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('transport:update', update);
      console.log('📡 Emitting transport request update:', update);
    }
  }, []);

  const emitGeofenceEvent = useCallback((event: GeofenceEvent) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('geofence:event', event);
      console.log('📡 Emitting geofence event:', event);
    }
  }, []);

  // Event listening methods
  const onLocationUpdate = useCallback((callback: (update: LocationUpdate) => void) => {
    if (socketRef.current) {
      socketRef.current.on('location:update', callback);
      return () => {
        socketRef.current?.off('location:update', callback);
      };
    }
  }, []);

  const onTransportRequestUpdate = useCallback((callback: (update: TransportRequestUpdate) => void) => {
    if (socketRef.current) {
      socketRef.current.on('transport:update', callback);
      return () => {
        socketRef.current?.off('transport:update', callback);
      };
    }
  }, []);

  const onGeofenceEvent = useCallback((callback: (event: GeofenceEvent) => void) => {
    if (socketRef.current) {
      socketRef.current.on('geofence:event', callback);
      return () => {
        socketRef.current?.off('geofence:event', callback);
      };
    }
  }, []);

  const onUnitsStatus = useCallback((callback: (status: UnitStatus[]) => void) => {
    if (socketRef.current) {
      socketRef.current.on('units:status', callback);
      return () => {
        socketRef.current?.off('units:status', callback);
      };
    }
  }, []);

  // Connection management
  useEffect(() => {
    if (token) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [token, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    // Connection state
    isConnected,
    isReconnecting,
    connectionStats,
    
    // Connection methods
    connect,
    disconnect,
    
    // Subscription methods
    subscribeToUnits,
    subscribeToFacilities,
    subscribeToAdmin,
    subscribeToAll,
    
    // Event emission methods
    emitLocationUpdate,
    emitTransportRequestUpdate,
    emitGeofenceEvent,
    
    // Event listening methods
    onLocationUpdate,
    onTransportRequestUpdate,
    onGeofenceEvent,
    onUnitsStatus,
    
    // Raw socket access (for advanced use cases)
    socket: socketRef.current,
  };
};
