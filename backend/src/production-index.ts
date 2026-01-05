import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { productionDatabaseManager } from './services/productionDatabaseManager';

// Import routes
import authRoutes from './routes/auth';
import hospitalRoutes from './routes/hospitals';
import agencyRoutes from './routes/agencies';
import facilityRoutes from './routes/facilities';
import analyticsRoutes from './routes/analytics';
import tripRoutes from './routes/trips';
import agencyResponseRoutes from './routes/agencyResponses';
import optimizationRoutes from './routes/optimization';
import notificationRoutes from './routes/notifications';
import unitRoutes from './routes/units';
import tccUnitRoutes from './routes/tccUnits';
import dropdownOptionsRoutes from './routes/dropdownOptions';
import dropdownCategoriesRoutes from './routes/dropdownCategories';
import pickupLocationRoutes from './routes/pickupLocations';
import emsAnalyticsRoutes from './routes/emsAnalytics';
import backupRoutes from './routes/backup';
import maintenanceRoutes from './routes/maintenance';
import healthcareLocationsRoutes from './routes/healthcareLocations';
import agencyTransportRoutes from './routes/agency';
import healthcareAgenciesRoutes from './routes/healthcareAgencies';
import healthcareDestinationsRoutes from './routes/healthcareDestinations';
import healthcareSubUsersRoutes from './routes/healthcareSubUsers';
import emsSubUsersRoutes from './routes/emsSubUsers';
import publicRoutes from './routes/public';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
// Clean environment variables (remove any whitespace/newlines)
const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').trim().replace(/[\r\n]/g, '');
const corsOrigin = (process.env.CORS_ORIGIN || frontendUrl).trim().replace(/[\r\n]/g, '');

// Configure Helmet to allow CORS preflight requests
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));

// Handle OPTIONS preflight requests immediately (before CORS middleware)
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    corsOrigin,
    'http://localhost:3000',
    'http://localhost:5173',
    'https://traccems.com',
    'https://dev-swa.traccems.com'
  ].filter(Boolean);
  
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400'); // 24 hours
    return res.status(204).send();
  }
  
  res.status(403).send('CORS not allowed');
});

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      corsOrigin,
      'http://localhost:3000',
      'http://localhost:5173',
      'https://traccems.com',
      'https://dev-swa.traccems.com'
    ].filter(Boolean);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'TCC Backend API is running (Production)',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const isHealthy = await productionDatabaseManager.healthCheck();
    
    if (isHealthy) {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: 'connected'
      });
    } else {
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected'
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/agency-responses', agencyResponseRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/tcc/hospitals', hospitalRoutes);
app.use('/api/tcc/agencies', agencyRoutes);
app.use('/api/tcc/facilities', facilityRoutes);
app.use('/api/tcc/analytics', analyticsRoutes);
app.use('/api/tcc/units', tccUnitRoutes);
app.use('/api/dropdown-options', dropdownOptionsRoutes);
app.use('/api/dropdown-categories', dropdownCategoriesRoutes);
app.use('/api/tcc/pickup-locations', pickupLocationRoutes);
app.use('/api/ems/analytics', emsAnalyticsRoutes);
app.use('/api/optimize', optimizationRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/healthcare/locations', healthcareLocationsRoutes);
app.use('/api/healthcare/agencies', healthcareAgenciesRoutes);
app.use('/api/healthcare/destinations', healthcareDestinationsRoutes);
app.use('/api/healthcare/sub-users', healthcareSubUsersRoutes);
app.use('/api/ems/sub-users', emsSubUsersRoutes);
app.use('/api/agency', agencyTransportRoutes);

// Public endpoints (no auth required)
app.use('/api/public', publicRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

async function startServer() {
  try {
    console.log('🔧 Production mode: Starting TCC Backend...');
    
    // Test database connection
    const isHealthy = await productionDatabaseManager.healthCheck();
    if (!isHealthy) {
      console.log('⚠️ Database connection failed, but continuing with server startup...');
    } else {
      console.log('✅ Database connection successful');
    }
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 TCC Backend server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔐 Auth endpoint: http://localhost:${PORT}/api/auth/login`);
      console.log(`🚗 Trips API: http://localhost:${PORT}/api/trips`);
      console.log(`🏥 Hospitals API: http://localhost:${PORT}/api/tcc/hospitals`);
      console.log(`🚑 Agencies API: http://localhost:${PORT}/api/tcc/agencies`);
      console.log(`🏢 Facilities API: http://localhost:${PORT}/api/tcc/facilities`);
      console.log(`📈 Analytics API: http://localhost:${PORT}/api/tcc/analytics`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 Shutting down server...');
  await productionDatabaseManager.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 Shutting down server...');
  await productionDatabaseManager.disconnect();
  process.exit(0);
});
