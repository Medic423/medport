import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 5001;

app.use(helmet());
// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "http://localhost:3002",
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// Basic routes
app.get('/', (req, res) => {
  res.json({ message: 'MedPort Backend API is running!' });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'MedPort Backend (Minimal)'
  });
});

// Basic auth route for testing
app.post('/api/auth/login', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Login successful (minimal backend)',
    user: { id: '1', email: 'test@example.com', role: 'admin' }
  });
});

// Error handling
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

server.listen(PORT, () => {
  console.log(`🚀 MedPort Backend (Minimal) running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth endpoint: http://localhost:${PORT}/api/auth/login`);
});

export default app;
