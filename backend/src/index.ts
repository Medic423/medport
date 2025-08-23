import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
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

dotenv.config();

const app = express();
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

app.listen(PORT, () => {
  console.log(`[MedPort] Server running on port ${PORT}`);
});
