import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { productionDatabaseManager } from './services/productionDatabaseManager';

// Import routes
import authRoutes from './routes/auth';
import hospitalRoutes from './routes/hospitals';
import agencyRoutes from './routes/agencies';
import facilityRoutes from './routes/facilities';
import analyticsRoutes from './routes/analytics';
import tripRoutes from './routes/trips';
import optimizationRoutes from './routes/optimization';
import notificationRoutes from './routes/notifications';
import unitRoutes from './routes/units';
import tccUnitRoutes from './routes/tccUnits';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
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
app.use('/api/units', unitRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/optimize', optimizationRoutes);

// TCC Admin Routes
app.use('/api/tcc/hospitals', hospitalRoutes);
app.use('/api/tcc/agencies', agencyRoutes);
app.use('/api/tcc/facilities', facilityRoutes);
app.use('/api/tcc/analytics', analyticsRoutes);
app.use('/api/tcc/units', tccUnitRoutes);

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
