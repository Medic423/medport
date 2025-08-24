import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import authRoutes from './routes/auth';
import protectedRoutes from './routes/protected';
import transportRequestRoutes from './routes/transportRequests';
import distanceRoutes from './routes/distance';
import resourceManagementRoutes from './routes/resourceManagement';
import advancedTransportRoutes from './routes/advancedTransport';
import facilityRoutes from './routes/facilities';
import airMedicalRoutes from './routes/airMedical';
import emergencyDepartmentRoutes from './routes/emergencyDepartment';
import agencyRoutes from './routes/agency';
import hospitalRoutes from './routes/hospital';
import transportCenterRoutes from './routes/transportCenter';
import matchingRoutes from './routes/matching';
import routeOptimizationRoutes from './routes/routeOptimization';
import routeCardGenerationRoutes from './routes/routeCardGeneration';
import unitAssignmentRoutes from './routes/unitAssignment';
import notificationRoutes from './routes/notifications';
import qrCodeRoutes from './routes/qrCode';
import realTimeTrackingRoutes from './routes/realTimeTracking';
import analyticsRoutes from './routes/analytics';
import WebSocketService from './services/webSocketService';

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 5001;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/protected', protectedRoutes);
app.use('/api/transport-requests', transportRequestRoutes);
app.use('/api/distance', distanceRoutes);
app.use('/api/resource-management', resourceManagementRoutes);
app.use('/api/advanced-transport', advancedTransportRoutes);
app.use('/api/facilities', facilityRoutes);
app.use('/api/air-medical', airMedicalRoutes);
app.use('/api/emergency-department', emergencyDepartmentRoutes);
app.use('/api/agency', agencyRoutes);
app.use('/api/hospital', hospitalRoutes);
app.use('/api/transport-center', transportCenterRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/route-optimization', routeOptimizationRoutes);
app.use('/api/route-card-generation', routeCardGenerationRoutes);
app.use('/api/unit-assignment', unitAssignmentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/qr', qrCodeRoutes);
app.use('/api/real-time-tracking', realTimeTrackingRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'MedPort Backend API is running!' });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'MedPort Backend'
  });
});

// Initialize WebSocket service
const webSocketService = new WebSocketService(server);

// Start server
server.listen(PORT, () => {
  console.log(`[MedPort] Server running on port ${PORT}`);
  console.log(`[MedPort] WebSocket service initialized`);
});
