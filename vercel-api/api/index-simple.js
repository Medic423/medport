// Simple TCC Backend API for Vercel - Minimal Version
export default function handler(req, res) {
  // Set CORS headers
  const allowedOrigins = [
    'https://traccems.com',
    'https://frontend-25ikiilhb-chuck-ferrells-projects.vercel.app',
    'http://localhost:3000'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Health check endpoint
  if (req.method === 'GET' && req.url === '/health') {
    res.status(200).json({
      success: true,
      message: 'TCC API is healthy',
      timestamp: new Date().toISOString()
    });
    return;
  }

  // Login endpoints
  if (req.method === 'POST' && (req.url === '/api/auth/login' || req.url === '/api/auth/healthcare/login' || req.url === '/api/auth/ems/login')) {
    const { email, password } = req.body;
    
    // Simple mock authentication
    if ((email === 'admin@tcc.com' && password === 'admin123') ||
        (email === 'healthcare@test.com' && password === 'healthcare123') ||
        (email === 'ems@test.com' && password === 'ems123')) {
      const token = `vercel-jwt-token-${Date.now()}-${email}`;
      res.status(200).json({
        success: true,
        message: 'Login successful',
        token: token,
        user: {
          id: `vercel-${Date.now()}`,
          email: email,
          name: email.includes('admin') ? 'TCC Administrator' : 
                email.includes('healthcare') ? 'Healthcare User' : 'EMS User',
          userType: email.includes('admin') ? 'ADMIN' : 'USER'
        }
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    return;
  }

  // Auth verify endpoint
  if (req.method === 'GET' && req.url === '/api/auth/verify') {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      res.status(401).json({
        success: false,
        message: 'No token provided'
      });
      return;
    }

    if (token.startsWith('vercel-jwt-token-')) {
      res.status(200).json({
        success: true,
        message: 'Token is valid',
        user: {
          id: 'vercel-user-123',
          email: 'admin@tcc.com',
          name: 'TCC Administrator',
          userType: 'ADMIN'
        }
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    return;
  }

  // Get users endpoint for User Management
  if (req.method === 'GET' && req.url === '/api/auth/users') {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      res.status(401).json({
        success: false,
        message: 'No token provided'
      });
      return;
    }

    if (token.startsWith('vercel-jwt-token-')) {
      res.status(200).json({
        success: true,
        users: [
          {
            id: 'user-1',
            email: 'admin@tcc.com',
            name: 'TCC Administrator',
            userType: 'ADMIN',
            isActive: true,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-09-22T15:43:00Z'
          },
          {
            id: 'user-2',
            email: 'manager@tcc.com',
            name: 'TCC Manager',
            userType: 'USER',
            isActive: true,
            createdAt: '2024-01-15T00:00:00Z',
            updatedAt: '2024-09-20T10:30:00Z'
          },
          {
            id: 'user-3',
            email: 'coordinator@tcc.com',
            name: 'TCC Coordinator',
            userType: 'USER',
            isActive: true,
            createdAt: '2024-02-01T00:00:00Z',
            updatedAt: '2024-09-18T14:20:00Z'
          }
        ]
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    return;
  }

  // Default response
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    availableEndpoints: [
      '/health',
      '/api/auth/login',
      '/api/auth/healthcare/login', 
      '/api/auth/ems/login',
      '/api/auth/verify',
      '/api/auth/users'
    ]
  });
}
