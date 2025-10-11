"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const databaseManager_1 = require("./services/databaseManager");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
// Import routes
const auth_1 = __importDefault(require("./routes/auth"));
const hospitals_1 = __importDefault(require("./routes/hospitals"));
const agencies_1 = __importDefault(require("./routes/agencies"));
const facilities_1 = __importDefault(require("./routes/facilities"));
const analytics_1 = __importDefault(require("./routes/analytics"));
const trips_1 = __importDefault(require("./routes/trips"));
const agencyResponses_1 = __importDefault(require("./routes/agencyResponses"));
const optimization_1 = __importDefault(require("./routes/optimization"));
const notifications_1 = __importDefault(require("./routes/notifications"));
// import adminNotificationRoutes from './routes/adminNotifications';
const units_1 = __importDefault(require("./routes/units"));
const tccUnits_1 = __importDefault(require("./routes/tccUnits"));
const dropdownOptions_1 = __importDefault(require("./routes/dropdownOptions"));
const pickupLocations_1 = __importDefault(require("./routes/pickupLocations"));
const emsAnalytics_1 = __importDefault(require("./routes/emsAnalytics"));
const backup_1 = __importDefault(require("./routes/backup"));
const maintenance_1 = __importDefault(require("./routes/maintenance"));
const healthcareLocations_1 = __importDefault(require("./routes/healthcareLocations"));
const unitLocation_1 = __importDefault(require("./routes/unitLocation"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5001;
// Middleware
// Clean environment variables (remove any whitespace/newlines)
const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').trim().replace(/[\r\n]/g, '');
const corsOrigin = (process.env.CORS_ORIGIN || frontendUrl).trim().replace(/[\r\n]/g, '');
console.log('TCC_DEBUG: FRONTEND_URL =', JSON.stringify(process.env.FRONTEND_URL));
console.log('TCC_DEBUG: Cleaned frontendUrl =', JSON.stringify(frontendUrl));
console.log('TCC_DEBUG: Cleaned corsOrigin =', JSON.stringify(corsOrigin));
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: corsOrigin,
    credentials: true
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
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
        const isHealthy = await databaseManager_1.databaseManager.healthCheck();
        if (isHealthy) {
            res.json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                databases: 'connected'
            });
        }
        else {
            res.status(503).json({
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                databases: 'disconnected'
            });
        }
    }
    catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: 'Database connection failed'
        });
    }
});
// API routes
app.use('/api/auth', auth_1.default);
app.use('/api/trips', trips_1.default);
app.use('/api/agency-responses', agencyResponses_1.default);
// Notification routes
app.use('/api/notifications', notifications_1.default);
// app.use('/api/admin/notifications', adminNotificationRoutes);
app.use('/api/units', units_1.default);
app.use('/api/units', unitLocation_1.default); // Unit location management
app.use('/api/tcc/hospitals', hospitals_1.default);
app.use('/api/tcc/agencies', agencies_1.default);
app.use('/api/tcc/facilities', facilities_1.default);
app.use('/api/tcc/analytics', analytics_1.default);
app.use('/api/tcc/units', tccUnits_1.default);
app.use('/api/dropdown-options', dropdownOptions_1.default);
app.use('/api/tcc/pickup-locations', pickupLocations_1.default);
app.use('/api/ems/analytics', emsAnalytics_1.default);
app.use('/api/optimize', optimization_1.default);
app.use('/api/backup', backup_1.default);
app.use('/api/maintenance', maintenance_1.default);
app.use('/api/healthcare/locations', healthcareLocations_1.default);
// Public endpoints for healthcare users
app.get('/api/public/categories', async (req, res) => {
    try {
        const hospitalPrisma = databaseManager_1.databaseManager.getHospitalDB();
        const categories = await hospitalPrisma.dropdownOption.findMany({
            select: {
                category: true
            },
            distinct: ['category'],
            where: {
                isActive: true
            }
        });
        res.json({
            success: true,
            data: categories.map((c) => c.category),
            message: 'Categories retrieved successfully'
        });
    }
    catch (error) {
        console.error('TCC_DEBUG: Get public categories error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get categories'
        });
    }
});
app.get('/api/public/hospitals', async (req, res) => {
    try {
        const hospitalPrisma = databaseManager_1.databaseManager.getHospitalDB();
        const hospitals = await hospitalPrisma.facility.findMany({
            where: {
                isActive: true
            },
            select: {
                id: true,
                name: true,
                address: true,
                city: true,
                state: true,
                zipCode: true,
                phone: true,
                email: true,
                type: true
            },
            orderBy: {
                name: 'asc'
            }
        });
        res.json({
            success: true,
            data: hospitals,
            message: 'Hospitals retrieved successfully'
        });
    }
    catch (error) {
        console.error('TCC_DEBUG: Get public hospitals error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get hospitals'
        });
    }
});
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
        await databaseManager_1.databaseManager.getPrismaClient().$connect();
        const result = await databaseManager_1.databaseManager.getPrismaClient().$queryRaw `SELECT version() as version, now() as current_time`;
        res.json({
            success: true,
            message: 'Database connection successful',
            data: result
        });
    }
    catch (error) {
        res.json({
            success: false,
            message: 'Database connection failed',
            error: error instanceof Error ? error.message : String(error),
            databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
            errorCode: error instanceof Error && 'code' in error ? error.code : 'unknown'
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
            await databaseManager_1.databaseManager.healthCheck();
            console.log('✅ Database is awake and responsive');
        }
        catch (error) {
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
    }
    catch (error) {
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
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});
// Initialize database and start server
async function startServer() {
    try {
        // Check if we're in production and need to initialize the database
        if (process.env.NODE_ENV === 'production') {
            console.log('🔧 Production mode: Attempting database initialization...');
            // Import execSync for running commands
            const { execSync } = require('child_process');
            // Try to initialize database in background, don't block server startup
            setTimeout(async () => {
                try {
                    console.log('📊 Attempting to push production schema...');
                    execSync('npx prisma db push --schema=prisma/schema-production.prisma', {
                        stdio: 'inherit',
                        cwd: process.cwd(),
                        timeout: 60000 // 60 second timeout
                    });
                    console.log('🌱 Attempting to seed database...');
                    execSync('npx ts-node prisma/seed.ts', {
                        stdio: 'inherit',
                        cwd: process.cwd(),
                        timeout: 60000 // 60 second timeout
                    });
                    console.log('✅ Database initialized successfully!');
                }
                catch (error) {
                    console.log('⚠️ Database initialization failed (will retry on next deployment):', error instanceof Error ? error.message : String(error));
                }
            }, 10000); // Wait 10 seconds before attempting database init
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
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}
// Start the server (skip in Vercel serverless environment)
if (!process.env.VERCEL) {
    startServer();
}
else {
    console.log('🔧 Running in Vercel serverless mode - server startup handled by Vercel');
}
// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down server...');
    await databaseManager_1.databaseManager.disconnect();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    console.log('\n🛑 Shutting down server...');
    await databaseManager_1.databaseManager.disconnect();
    process.exit(0);
});
exports.default = app;
//# sourceMappingURL=index.js.map