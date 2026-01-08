import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { databaseManager } from './services/databaseManager';
import cookieParser from 'cookie-parser';

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
// import adminNotificationRoutes from './routes/adminNotifications';
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
// Load .env first, then .env.local (which will override .env values)
dotenv.config();
dotenv.config({ path: '.env.local', override: true });

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
// Clean environment variables (remove any whitespace/newlines)
const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').trim().replace(/[\r\n]/g, '');
const corsOrigin = (process.env.CORS_ORIGIN || frontendUrl).trim().replace(/[\r\n]/g, '');

console.log('TCC_DEBUG: FRONTEND_URL =', JSON.stringify(process.env.FRONTEND_URL));
console.log('TCC_DEBUG: Cleaned frontendUrl =', JSON.stringify(frontendUrl));
console.log('TCC_DEBUG: Cleaned corsOrigin =', JSON.stringify(corsOrigin));

// Handle OPTIONS preflight requests FIRST (before any other middleware)
// This must be before Helmet and CORS middleware to ensure immediate response
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
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
    
    return res.status(403).send('CORS not allowed');
  }
  next();
});

// Configure Helmet to allow CORS preflight requests
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));

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
      console.warn('TCC_DEBUG: CORS blocked origin:', origin);
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
    message: 'TCC Backend API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const isHealthy = await databaseManager.healthCheck();
    
    if (isHealthy) {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        databases: 'connected'
      });
    } else {
      // Ensure CORS headers even on unhealthy status
      const origin = req.headers.origin;
      if (origin) {
        const allowedOrigins = [
          process.env.FRONTEND_URL,
          process.env.CORS_ORIGIN,
          'http://localhost:3000',
          'http://localhost:5173',
          'https://traccems.com',
          'https://dev-swa.traccems.com'
        ].filter(Boolean);
        
        if (allowedOrigins.includes(origin)) {
          res.header('Access-Control-Allow-Origin', origin);
          res.header('Access-Control-Allow-Credentials', 'true');
        }
      }
      
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        databases: 'disconnected'
      });
    }
  } catch (error) {
    // Ensure CORS headers even on error
    const origin = req.headers.origin;
    if (origin) {
      const allowedOrigins = [
        process.env.FRONTEND_URL,
        process.env.CORS_ORIGIN,
        'http://localhost:3000',
        'http://localhost:5173',
        'https://traccems.com',
        'https://dev-swa.traccems.com'
      ].filter(Boolean);
      
      if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Credentials', 'true');
      }
    }
    
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed'
    });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/agency-responses', agencyResponseRoutes);
// Notification routes
app.use('/api/notifications', notificationRoutes);
// app.use('/api/admin/notifications', adminNotificationRoutes);
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

// Test endpoints
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API is working',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/test-db', async (req, res) => {
  try {
    // Try a simple connection test first
    await databaseManager.getPrismaClient().$connect();
    const result = await databaseManager.getPrismaClient().$queryRaw`SELECT version() as version, now() as current_time`;
    const hospitalCount = await databaseManager.getPrismaClient().hospital.count();
    const hospitals = await databaseManager.getPrismaClient().hospital.findMany({ take: 2 });
    res.json({
      success: true,
      message: 'Database connection successful',
      data: result,
      hospitalCount: hospitalCount,
      sampleHospitals: hospitals,
      databaseUrl: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 30) + '...' : 'Not set'
    });
  } catch (error) {
    res.json({
      success: false,
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : String(error),
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
      errorCode: error instanceof Error && 'code' in error ? (error as any).code : 'unknown'
    });
  }
});

// Manual database initialization endpoint
app.post('/api/init-db', async (req, res) => {
  try {
    const { execSync } = require('child_process');
    
    console.log('🔧 Manual database initialization requested...');
    
    // First, try to wake up the database with a simple connection
    console.log('🔌 Attempting to wake up database...');
    try {
      await databaseManager.healthCheck();
      console.log('✅ Database is awake and responsive');
    } catch (error) {
      console.log('⚠️ Database appears to be sleeping, continuing with initialization...');
    }
    
    // Push schema
    console.log('📊 Pushing production schema...');
    execSync('npx prisma db push --schema=prisma/schema-production.prisma', { 
      stdio: 'inherit',
      cwd: process.cwd(),
      timeout: 120000 // Increased timeout to 2 minutes
    });
    
    // Seed database
    console.log('🌱 Seeding database...');
    execSync('npx ts-node prisma/seed.ts', { 
      stdio: 'inherit',
      cwd: process.cwd(),
      timeout: 120000 // Increased timeout to 2 minutes
    });
    
    res.json({
      success: true,
      message: 'Database initialized successfully!'
    });
  } catch (error) {
    res.json({
      success: false,
      message: 'Database initialization failed',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Ensure CORS headers are set even on errors
  const origin = req.headers.origin;
  if (origin) {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      process.env.CORS_ORIGIN,
      'http://localhost:3000',
      'http://localhost:5173',
      'https://traccems.com',
      'https://dev-swa.traccems.com'
    ].filter(Boolean);
    
    if (allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Credentials', 'true');
    }
  }
  
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Initialize database and start server
async function startServer() {
  try {
    // REMOVED: Production database initialization on startup
    // This was causing conflicts with GitHub Actions migrations (prisma migrate deploy)
    // Database migrations are now handled exclusively by GitHub Actions deployment workflow
    // See: docs/active/sessions/2026-01/BACKEND_DEPLOYMENT_FAILURE_ANALYSIS.md
    
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

// Start the server (skip in Vercel serverless environment)
if (!process.env.VERCEL) {
  startServer();
} else {
  console.log('🔧 Running in Vercel serverless mode - server startup handled by Vercel');
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  await databaseManager.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down server...');
  await databaseManager.disconnect();
  process.exit(0);
});

export default app;
