"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const productionDatabaseManager_1 = require("./services/productionDatabaseManager");
// Import routes
const auth_1 = __importDefault(require("./routes/auth"));
const hospitals_1 = __importDefault(require("./routes/hospitals"));
const agencies_1 = __importDefault(require("./routes/agencies"));
const facilities_1 = __importDefault(require("./routes/facilities"));
const analytics_1 = __importDefault(require("./routes/analytics"));
const trips_1 = __importDefault(require("./routes/trips"));
const optimization_1 = __importDefault(require("./routes/optimization"));
const notifications_1 = __importDefault(require("./routes/notifications"));
const productionUnits_1 = __importDefault(require("./routes/productionUnits"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5001;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
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
        const isHealthy = await productionDatabaseManager_1.productionDatabaseManager.healthCheck();
        if (isHealthy) {
            res.json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                database: 'connected'
            });
        }
        else {
            res.status(503).json({
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                database: 'disconnected'
            });
        }
    }
    catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// API Routes
app.use('/api/auth', auth_1.default);
app.use('/api/trips', trips_1.default);
app.use('/api/units', productionUnits_1.default);
app.use('/api/notifications', notifications_1.default);
app.use('/api/optimize', optimization_1.default);
// TCC Admin Routes
app.use('/api/tcc/hospitals', hospitals_1.default);
app.use('/api/tcc/agencies', agencies_1.default);
app.use('/api/tcc/facilities', facilities_1.default);
app.use('/api/tcc/analytics', analytics_1.default);
app.use('/api/tcc/units', productionUnits_1.default);
// Error handling middleware
app.use((err, req, res, next) => {
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
        const isHealthy = await productionDatabaseManager_1.productionDatabaseManager.healthCheck();
        if (!isHealthy) {
            console.log('⚠️ Database connection failed, but continuing with server startup...');
        }
        else {
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
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}
// Start the server
startServer();
// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('🛑 Shutting down server...');
    await productionDatabaseManager_1.productionDatabaseManager.disconnect();
    process.exit(0);
});
process.on('SIGINT', async () => {
    console.log('🛑 Shutting down server...');
    await productionDatabaseManager_1.productionDatabaseManager.disconnect();
    process.exit(0);
});
//# sourceMappingURL=production-index.js.map