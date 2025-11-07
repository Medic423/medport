import express from 'express';
import cors from 'cors';

const app = express();

// Basic middleware  
// Clean environment variables (remove any whitespace/newlines)
const frontendUrl = (process.env.FRONTEND_URL || 'https://traccems.com').trim().replace(/[\r\n]/g, '');

console.log('TCC_DEBUG: FRONTEND_URL =', JSON.stringify(process.env.FRONTEND_URL));
console.log('TCC_DEBUG: Cleaned frontendUrl =', JSON.stringify(frontendUrl));

app.use(cors({
  origin: frontendUrl,
  credentials: true
}));
app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  try {
    console.log('TCC_DEBUG: Root endpoint hit');
    res.json({
      success: true,
      message: 'TCC Backend API is running (minimal version)',
      timestamp: new Date().toISOString(),
      version: '1.0.0-minimal',
      frontendUrl: frontendUrl
    });
  } catch (error) {
    console.error('TCC_ERROR: Root endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Root endpoint failed',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: 'minimal'
  });
});

// API test endpoint
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
    error: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: error.message
  });
});

// For Vercel serverless
export default app;

