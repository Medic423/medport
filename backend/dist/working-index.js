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
// ===== AUTHENTICATION ENDPOINTS =====
// Healthcare login
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
// EMS login
app.post('/api/auth/ems/login', (req, res) => {
    console.log('EMS login attempt:', req.body);
    res.json({
        success: true,
        message: 'Login successful',
        user: {
            id: 'ems-user',
            email: req.body.email,
            name: 'EMS User',
            userType: 'EMS',
            agencyName: 'Test EMS Agency'
        },
        token: 'mock-ems-jwt-token'
    });
});
// TCC login
app.post('/api/auth/tcc/login', (req, res) => {
    console.log('TCC login attempt:', req.body);
    res.json({
        success: true,
        message: 'Login successful',
        user: {
            id: 'tcc-user',
            email: req.body.email,
            name: 'TCC User',
            userType: 'TCC'
        },
        token: 'mock-tcc-jwt-token'
    });
});
// ===== DROPDOWN OPTIONS ENDPOINTS =====
// Get categories
app.get('/api/dropdown-options/categories', (req, res) => {
    console.log('Getting categories');
    res.json({
        success: true,
        data: [
            { id: '1', name: 'Transport Level', value: 'transport_level' },
            { id: '2', name: 'Urgency Level', value: 'urgency_level' },
            { id: '3', name: 'Priority', value: 'priority' },
            { id: '4', name: 'Mobility Level', value: 'mobility_level' },
            { id: '5', name: 'Status', value: 'status' }
        ]
    });
});
// Get options by category
app.get('/api/dropdown-options/category/:category', (req, res) => {
    const { category } = req.params;
    console.log('Getting options for category:', category);
    const options = {
        transport_level: [
            { id: '1', name: 'BLS', value: 'BLS' },
            { id: '2', name: 'ALS', value: 'ALS' },
            { id: '3', name: 'CCT', value: 'CCT' },
            { id: '4', name: 'Other', value: 'Other' }
        ],
        urgency_level: [
            { id: '1', name: 'Routine', value: 'Routine' },
            { id: '2', name: 'Urgent', value: 'Urgent' },
            { id: '3', name: 'Emergent', value: 'Emergent' }
        ],
        priority: [
            { id: '1', name: 'LOW', value: 'LOW' },
            { id: '2', name: 'MEDIUM', value: 'MEDIUM' },
            { id: '3', name: 'HIGH', value: 'HIGH' },
            { id: '4', name: 'CRITICAL', value: 'CRITICAL' }
        ],
        mobility_level: [
            { id: '1', name: 'Ambulatory', value: 'Ambulatory' },
            { id: '2', name: 'Wheelchair', value: 'Wheelchair' },
            { id: '3', name: 'Stretcher', value: 'Stretcher' },
            { id: '4', name: 'Bed', value: 'Bed' }
        ],
        status: [
            { id: '1', name: 'PENDING', value: 'PENDING' },
            { id: '2', name: 'ACCEPTED', value: 'ACCEPTED' },
            { id: '3', name: 'IN_PROGRESS', value: 'IN_PROGRESS' },
            { id: '4', name: 'COMPLETED', value: 'COMPLETED' },
            { id: '5', name: 'CANCELLED', value: 'CANCELLED' }
        ]
    };
    res.json({
        success: true,
        data: options[category] || []
    });
});
// ===== TRIPS ENDPOINTS =====
// Get trips
app.get('/api/trips', (req, res) => {
    console.log('Getting trips');
    res.json({
        success: true,
        data: [
            {
                id: '1',
                tripNumber: 'TCC-001',
                patientId: 'P001',
                fromLocation: 'Hospital A',
                toLocation: 'Hospital B',
                scheduledTime: new Date().toISOString(),
                transportLevel: 'BLS',
                urgencyLevel: 'Routine',
                status: 'PENDING',
                priority: 'MEDIUM',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ]
    });
});
// Create trip
app.post('/api/trips', (req, res) => {
    console.log('Creating trip:', req.body);
    res.json({
        success: true,
        message: 'Trip created successfully',
        data: {
            id: '2',
            tripNumber: 'TCC-002',
            ...req.body,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    });
});
// ===== AGENCIES ENDPOINTS =====
// Get agencies
app.get('/api/agencies', (req, res) => {
    console.log('Getting agencies');
    res.json({
        success: true,
        data: [
            {
                id: '1',
                name: 'Test EMS Agency',
                contactName: 'John Doe',
                phone: '555-1234',
                email: 'contact@testems.com',
                address: '123 Main St',
                city: 'Test City',
                state: 'PA',
                zipCode: '12345',
                capabilities: ['BLS', 'ALS'],
                serviceArea: ['Test City', 'Nearby City'],
                isActive: true
            }
        ]
    });
});
// ===== HOSPITALS ENDPOINTS =====
// Get hospitals
app.get('/api/hospitals', (req, res) => {
    console.log('Getting hospitals');
    res.json({
        success: true,
        data: [
            {
                id: '1',
                name: 'Test Hospital',
                address: '456 Hospital Ave',
                city: 'Test City',
                state: 'PA',
                zipCode: '12345',
                phone: '555-5678',
                email: 'info@testhospital.com',
                type: 'General',
                capabilities: ['Emergency', 'Surgery'],
                region: 'Western PA',
                isActive: true
            }
        ]
    });
});
// ===== PICKUP LOCATIONS ENDPOINTS =====
// Get pickup locations
app.get('/api/pickup-locations', (req, res) => {
    console.log('Getting pickup locations');
    res.json({
        success: true,
        data: [
            {
                id: '1',
                name: 'Emergency Department',
                description: 'Main ED entrance',
                contactPhone: '555-9999',
                contactEmail: 'ed@testhospital.com',
                floor: '1',
                room: 'ED-001',
                hospitalId: '1',
                isActive: true
            }
        ]
    });
});
// ===== UNITS ENDPOINTS =====
// Get units
app.get('/api/units', (req, res) => {
    console.log('Getting units');
    res.json({
        success: true,
        data: [
            {
                id: '1',
                unitNumber: 'U-001',
                type: 'BLS',
                capabilities: ['BLS'],
                currentStatus: 'AVAILABLE',
                isActive: true,
                agencyId: '1'
            }
        ]
    });
});
// ===== ANALYTICS ENDPOINTS =====
// Get analytics
app.get('/api/analytics', (req, res) => {
    console.log('Getting analytics');
    res.json({
        success: true,
        data: {
            totalTrips: 10,
            completedTrips: 8,
            pendingTrips: 2,
            averageResponseTime: 15.5,
            totalRevenue: 2500.00
        }
    });
});
// ===== AGENCY RESPONSES ENDPOINTS =====
// Create agency response
app.post('/api/agency-responses', (req, res) => {
    console.log('Creating agency response:', req.body);
    res.json({
        success: true,
        message: 'Agency response created successfully',
        data: {
            id: '1',
            tripId: req.body.tripId,
            agencyId: req.body.agencyId,
            response: req.body.response,
            responseTimestamp: new Date().toISOString(),
            responseNotes: req.body.responseNotes,
            estimatedArrival: req.body.estimatedArrival,
            isSelected: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    });
});
// Get agency responses
app.get('/api/agency-responses', (req, res) => {
    console.log('Getting agency responses');
    res.json({
        success: true,
        data: []
    });
});
// ===== TEST ENDPOINTS =====
app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: 'API is working',
        timestamp: new Date().toISOString()
    });
});
// 404 handler
app.use('*', (req, res) => {
    console.log('404 - Endpoint not found:', req.method, req.originalUrl);
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
    console.log(`🔐 Auth endpoints: /api/auth/*`);
    console.log(`📋 Dropdown options: /api/dropdown-options/*`);
    console.log(`🚑 Trips: /api/trips`);
    console.log(`🏥 Agencies: /api/agencies`);
    console.log(`🏥 Hospitals: /api/hospitals`);
    console.log(`📍 Pickup locations: /api/pickup-locations`);
    console.log(`🚐 Units: /api/units`);
    console.log(`📊 Analytics: /api/analytics`);
    console.log(`📝 Agency responses: /api/agency-responses`);
});
exports.default = app;
//# sourceMappingURL=working-index.js.map