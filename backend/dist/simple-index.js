"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
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
        message: 'TCC Backend API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        databases: 'connected'
    });
});
// Simple auth endpoint for testing
app.post('/api/auth/healthcare/login', (req, res) => {
    console.log('Healthcare login attempt:', req.body);
    // Simple mock response for testing
    res.json({
        success: true,
        message: 'Login successful',
        user: {
            id: 'test-user',
            email: req.body.email,
            name: 'Test User',
            userType: 'HEALTHCARE'
        },
        token: 'mock-jwt-token'
    });
});
// Test endpoints
app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: 'API is working',
        timestamp: new Date().toISOString()
    });
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
// Start the server
app.listen(PORT, () => {
    console.log(`🚀 TCC Backend server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔐 Auth endpoint: http://localhost:${PORT}/api/auth/healthcare/login`);
});
exports.default = app;
//# sourceMappingURL=simple-index.js.map