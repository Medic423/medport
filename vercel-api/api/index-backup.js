// Simple TCC Backend API for Vercel
export default function handler(req, res) {
  // Set CORS headers - Allow specific origins for production
  const allowedOrigins = [
    'https://traccems.com',
    'https://frontend-a9vym5ias-chuck-ferrells-projects.vercel.app',
    'https://frontend-1419nswch-chuck-ferrells-projects.vercel.app',
    'https://frontend-f4xv77dag-chuck-ferrells-projects.vercel.app',
    'https://frontend-vzhord984-chuck-ferrells-projects.vercel.app',
    'https://frontend-i9kw0pl8v-chuck-ferrells-projects.vercel.app',
    'https://frontend-eu6mgu6w2-chuck-ferrells-projects.vercel.app',
    'https://frontend-k9s4i52zp-chuck-ferrells-projects.vercel.app',
    'https://frontend-mm5z91yvo-chuck-ferrells-projects.vercel.app',
    'https://frontend-fm9aeatz6-chuck-ferrells-projects.vercel.app',
    'https://frontend-9gec38p8d-chuck-ferrells-projects.vercel.app',
    'https://frontend-l4dn8uf0n-chuck-ferrells-projects.vercel.app',
    'https://frontend-1snhqmn1s-chuck-ferrells-projects.vercel.app',
    'https://frontend-csyqeue6b-chuck-ferrells-projects.vercel.app',
    'https://frontend-oqzka4274-chuck-ferrells-projects.vercel.app', // Latest frontend URL with enhanced trips endpoints
    'https://frontend-4xr2iebdp-chuck-ferrells-projects.vercel.app', // Latest frontend URL with financial endpoints
    'https://frontend-iv7b6gffd-chuck-ferrells-projects.vercel.app', // Latest frontend URL with hospitals fix
    'https://frontend-esef2a1vo-chuck-ferrells-projects.vercel.app', // Latest frontend URL with working backend
    'https://frontend-cp81j4etk-chuck-ferrells-projects.vercel.app', // Latest frontend URL with cost analysis fix
    'https://frontend-dc7ysfvqg-chuck-ferrells-projects.vercel.app', // Latest frontend URL with user management fix
    'https://frontend-25ikiilhb-chuck-ferrells-projects.vercel.app', // Latest frontend URL with user management fix
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else {
    // For unknown origins, don't set credentials
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Client-Version, X-Environment, Cache-Control, Pragma');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Health check endpoint
  if (req.method === 'GET' && req.url === '/health') {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      message: 'TCC Backend API is working',
      version: '1.0.0',
      environment: 'production'
    });
    return;
  }

  // Login endpoints
  if (req.method === 'POST' && (req.url === '/api/auth/login' || req.url === '/api/auth/healthcare/login' || req.url === '/api/auth/ems/login')) {
    const { email, password } = req.body;
    
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
      return;
    }

    // Real authentication credentials
    const validCredentials = {
      'admin@tcc.com': { password: 'admin123', userType: 'ADMIN', name: 'TCC Administrator' },
      'admin@altoonaregional.org': { password: 'password123', userType: 'HEALTHCARE', name: 'Healthcare Admin' },
      'ems@test.com': { password: 'password123', userType: 'EMS', name: 'EMS Test User' }
    };

    const user = validCredentials[email];
    if (user && user.password === password) {
      res.status(200).json({
        success: true,
        message: 'Login successful',
        token: 'vercel-jwt-token-' + Date.now() + '-' + email,
        user: {
          id: 'vercel-' + Date.now(),
          email: email,
          name: user.name,
          userType: user.userType
        }
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
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

    // Simple token validation (in production, you'd verify JWT signature)
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

    // Simple token validation
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
          },
          {
            id: 'user-4',
            email: 'operator@tcc.com',
            name: 'TCC Operator',
            userType: 'USER',
            isActive: false,
            createdAt: '2024-03-01T00:00:00Z',
            updatedAt: '2024-09-15T09:15:00Z'
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

  // Mock data endpoints
  if (req.method === 'GET' && req.url.startsWith('/api/trips')) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const status = url.searchParams.get('status');
    
    // Mock trips data
    const allTrips = [
      {
        id: 'trip-001',
        tripNumber: 'TCC-2025-001',
        status: 'PENDING',
        patientName: 'John Smith',
        transportLevel: 'BLS',
        priority: 'MEDIUM',
        pickupLocation: 'City General Hospital',
        dropoffLocation: 'Rehabilitation Center',
        requestedTime: '2025-09-22T10:00:00Z',
        estimatedDuration: 45,
        estimatedDistance: 12.5,
        estimatedCost: 850.00,
        agencyId: null,
        assignedUnit: null,
        notes: 'Patient requires wheelchair assistance'
      },
      {
        id: 'trip-002',
        tripNumber: 'TCC-2025-002',
        status: 'ACCEPTED',
        patientName: 'Sarah Johnson',
        transportLevel: 'ALS',
        priority: 'HIGH',
        pickupLocation: 'Regional Medical Center',
        dropoffLocation: 'Specialty Clinic',
        requestedTime: '2025-09-22T11:30:00Z',
        estimatedDuration: 30,
        estimatedDistance: 8.2,
        estimatedCost: 1200.00,
        agencyId: 'agency-001',
        assignedUnit: 'TCC-001',
        notes: 'Patient requires cardiac monitoring'
      },
      {
        id: 'trip-003',
        tripNumber: 'TCC-2025-003',
        status: 'IN_PROGRESS',
        patientName: 'Mike Davis',
        transportLevel: 'Critical Care',
        priority: 'URGENT',
        pickupLocation: 'Emergency Department',
        dropoffLocation: 'ICU Transfer',
        requestedTime: '2025-09-22T09:15:00Z',
        estimatedDuration: 20,
        estimatedDistance: 5.1,
        estimatedCost: 1800.00,
        agencyId: 'agency-002',
        assignedUnit: 'TCC-003',
        notes: 'Critical patient transport'
      },
      {
        id: 'trip-004',
        tripNumber: 'TCC-2025-004',
        status: 'COMPLETED',
        patientName: 'Emily Wilson',
        transportLevel: 'BLS',
        priority: 'LOW',
        pickupLocation: 'Nursing Home',
        dropoffLocation: 'Outpatient Clinic',
        requestedTime: '2025-09-22T08:00:00Z',
        completedTime: '2025-09-22T09:30:00Z',
        actualDuration: 90,
        actualDistance: 15.8,
        actualCost: 950.00,
        agencyId: 'agency-001',
        assignedUnit: 'TCC-002',
        notes: 'Routine transport completed successfully'
      }
    ];

    // Filter trips based on status parameter
    let filteredTrips = allTrips;
    if (status) {
      const statusList = status.split(',');
      filteredTrips = allTrips.filter(trip => statusList.includes(trip.status));
    }

    res.status(200).json({
      success: true,
      data: filteredTrips,
      total: filteredTrips.length
    });
    return;
  }

  // Trip status update endpoint
  if (req.method === 'PUT' && req.url.includes('/api/trips/') && req.url.includes('/status')) {
    const tripId = req.url.split('/api/trips/')[1].split('/status')[0];
    const { status } = req.body;
    
    if (!status) {
      res.status(400).json({
        success: false,
        message: 'Status is required'
      });
      return;
    }

    // Mock status update response
    res.status(200).json({
      success: true,
      message: `Trip ${tripId} status updated to ${status}`,
      data: {
        id: tripId,
        status: status,
        updatedAt: new Date().toISOString()
      }
    });
    return;
  }

  // Trip history endpoint
  if (req.method === 'GET' && req.url.startsWith('/api/trips/history')) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const limit = url.searchParams.get('limit') || 50;
    const offset = url.searchParams.get('offset') || 0;
    
    // Mock trip history data
    const historyTrips = [
      {
        id: 'trip-hist-001',
        tripNumber: 'TCC-2025-001',
        status: 'COMPLETED',
        patientName: 'John Smith',
        transportLevel: 'BLS',
        priority: 'MEDIUM',
        pickupLocation: 'City General Hospital',
        dropoffLocation: 'Rehabilitation Center',
        requestedTime: '2025-09-21T10:00:00Z',
        completedTime: '2025-09-21T11:30:00Z',
        actualDuration: 90,
        actualDistance: 12.5,
        actualCost: 850.00,
        agencyId: 'agency-001',
        assignedUnit: 'TCC-001'
      }
    ];

    res.status(200).json({
      success: true,
      data: historyTrips,
      total: historyTrips.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    return;
  }

  // TCC Pickup Locations endpoint
  if (req.method === 'GET' && req.url === '/api/tcc/pickup-locations') {
    res.status(200).json({
      success: true,
      data: [
        {
          id: 'pickup-001',
          name: 'Emergency Department',
          description: 'Main emergency entrance',
          hospitalId: 'hospital-001',
          hospital: {
            id: 'hospital-001',
            name: 'City General Hospital'
          },
          floor: 'Ground Floor',
          room: 'ED-001',
          contactPhone: '(555) 123-4567',
          contactEmail: 'ed@citygeneral.com'
        },
        {
          id: 'pickup-002',
          name: 'ICU Unit',
          description: 'Intensive Care Unit',
          hospitalId: 'hospital-001',
          hospital: {
            id: 'hospital-001',
            name: 'City General Hospital'
          },
          floor: '3rd Floor',
          room: 'ICU-305',
          contactPhone: '(555) 123-4568',
          contactEmail: 'icu@citygeneral.com'
        },
        {
          id: 'pickup-003',
          name: 'Cardiology Ward',
          description: 'Cardiac care unit',
          hospitalId: 'hospital-002',
          hospital: {
            id: 'hospital-002',
            name: 'Regional Medical Center'
          },
          floor: '2nd Floor',
          room: 'CCU-201',
          contactPhone: '(555) 234-5678',
          contactEmail: 'cardiology@regional.com'
        }
      ]
    });
    return;
  }

  // TCC Pickup Locations by Hospital endpoint
  if (req.method === 'GET' && req.url.startsWith('/api/tcc/pickup-locations/hospital/')) {
    const hospitalId = req.url.split('/api/tcc/pickup-locations/hospital/')[1];
    
    // Mock pickup locations for specific hospital
    const hospitalPickupLocations = [
      {
        id: `pickup-${hospitalId}-001`,
        name: 'Emergency Department',
        description: 'Main emergency entrance',
        hospitalId: hospitalId,
        hospital: {
          id: hospitalId,
          name: 'Hospital Emergency Dept'
        },
        floor: 'Ground Floor',
        room: 'ED-001',
        contactPhone: '(555) 123-4567',
        contactEmail: 'ed@hospital.com'
      },
      {
        id: `pickup-${hospitalId}-002`,
        name: 'ICU Unit',
        description: 'Intensive Care Unit',
        hospitalId: hospitalId,
        hospital: {
          id: hospitalId,
          name: 'Hospital ICU'
        },
        floor: '3rd Floor',
        room: 'ICU-305',
        contactPhone: '(555) 123-4568',
        contactEmail: 'icu@hospital.com'
      }
    ];

    res.status(200).json({
      success: true,
      data: hospitalPickupLocations
    });
    return;
  }

  // TCC Facilities endpoint
  if (req.method === 'GET' && req.url === '/api/tcc/facilities') {
    res.status(200).json({
      success: true,
      data: [
        {
          id: 'facility-001',
          name: 'City General Hospital',
          type: 'HOSPITAL',
          address: '123 Main St, City, ST 12345',
          phone: '(555) 123-4567',
          email: 'info@citygeneral.com',
          isActive: true
        },
        {
          id: 'facility-002',
          name: 'Regional Medical Center',
          type: 'HOSPITAL',
          address: '456 Oak Ave, City, ST 12345',
          phone: '(555) 234-5678',
          email: 'info@regional.com',
          isActive: true
        },
        {
          id: 'facility-003',
          name: 'Specialty Clinic',
          type: 'CLINIC',
          address: '789 Pine Rd, City, ST 12345',
          phone: '(555) 345-6789',
          email: 'info@specialty.com',
          isActive: true
        }
      ]
    });
    return;
  }

  // Notifications endpoint
  if (req.method === 'GET' && req.url === '/api/notifications') {
    res.status(200).json({
      success: true,
      data: [
        {
          id: 'notif-001',
          title: 'New Trip Request',
          message: 'A new transport request has been submitted',
          type: 'TRIP_REQUEST',
          isRead: false,
          createdAt: new Date().toISOString(),
          userId: 'user-001'
        },
        {
          id: 'notif-002',
          title: 'Trip Completed',
          message: 'Transport request TCC-2025-001 has been completed',
          type: 'TRIP_COMPLETED',
          isRead: true,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          userId: 'user-001'
        }
      ]
    });
    return;
  }

  // Mark notification as read
  if (req.method === 'PUT' && req.url.includes('/api/notifications/') && req.url.includes('/read')) {
    const notificationId = req.url.split('/api/notifications/')[1].split('/read')[0];
    
    res.status(200).json({
      success: true,
      message: `Notification ${notificationId} marked as read`,
      data: {
        id: notificationId,
        isRead: true,
        readAt: new Date().toISOString()
      }
    });
    return;
  }

  // Mark all notifications as read
  if (req.method === 'PUT' && req.url === '/api/notifications/read-all') {
    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      data: {
        markedRead: 5,
        timestamp: new Date().toISOString()
      }
    });
    return;
  }

  // Agency Responses endpoints
  if (req.method === 'GET' && req.url.startsWith('/api/agency-responses')) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const tripId = url.searchParams.get('tripId');
    
    res.status(200).json({
      success: true,
      data: [
        {
          id: 'response-001',
          tripId: tripId || 'trip-001',
          agencyId: 'agency-001',
          agency: {
            id: 'agency-001',
            name: 'City EMS'
          },
          status: 'PENDING',
          estimatedArrival: new Date(Date.now() + 1800000).toISOString(),
          estimatedCost: 850.00,
          notes: 'Available for transport',
          submittedAt: new Date().toISOString()
        },
        {
          id: 'response-002',
          tripId: tripId || 'trip-001',
          agencyId: 'agency-002',
          agency: {
            id: 'agency-002',
            name: 'Regional EMS'
          },
          status: 'ACCEPTED',
          estimatedArrival: new Date(Date.now() + 2400000).toISOString(),
          estimatedCost: 920.00,
          notes: 'Unit dispatched',
          submittedAt: new Date(Date.now() - 300000).toISOString()
        }
      ]
    });
    return;
  }

  // Select agency response
  if (req.method === 'POST' && req.url.startsWith('/api/agency-responses/select/')) {
    const tripId = req.url.split('/api/agency-responses/select/')[1];
    
    res.status(200).json({
      success: true,
      message: `Agency response selected for trip ${tripId}`,
      data: {
        tripId: tripId,
        selectedAgencyId: 'agency-001',
        selectedAt: new Date().toISOString()
      }
    });
    return;
  }

  if (req.method === 'GET' && req.url === '/api/agencies') {
    res.status(200).json([
      {
        id: '1',
        name: 'Test EMS Agency',
        type: 'EMS',
        isActive: true
      }
    ]);
    return;
  }

  if (req.method === 'GET' && req.url === '/api/hospitals') {
    res.status(200).json([
      {
        id: '1',
        name: 'Test Hospital',
        type: 'Hospital',
        isActive: true
      }
    ]);
    return;
  }

  // Units endpoints
  if (req.method === 'GET' && req.url === '/api/units') {
    res.status(200).json([
      {
        id: '1',
        unitNumber: 'U001',
        status: 'AVAILABLE',
        currentLocation: 'Station 1',
        crew: ['John Doe', 'Jane Smith'],
        isActive: true
      },
      {
        id: '2',
        unitNumber: 'U002',
        status: 'ON_CALL',
        currentLocation: 'En Route',
        crew: ['Bob Johnson', 'Alice Brown'],
        isActive: true
      }
    ]);
    return;
  }

  if (req.method === 'GET' && req.url === '/api/units/analytics') {
    res.status(200).json({
      totalUnits: 2,
      availableUnits: 1,
      onCallUnits: 1,
      responseTime: 4.2,
      utilizationRate: 0.75
    });
    return;
  }

  // Notifications endpoint
  if (req.method === 'GET' && req.url === '/api/notifications') {
    res.status(200).json([
      {
        id: '1',
        title: 'System Update',
        message: 'All systems operational',
        type: 'INFO',
        timestamp: new Date().toISOString()
      }
    ]);
    return;
  }

  // TCC Authentication endpoints
  if (req.method === 'POST' && req.url === '/api/tcc/auth/login') {
    const { email, password } = req.body;
    
    if (email === 'admin@tcc.com' && password === 'admin123') {
      res.status(200).json({
        success: true,
        message: 'TCC Login successful',
        token: `tcc-jwt-token-${Date.now()}-${email}`,
        user: {
          id: `tcc-${Date.now()}`,
          email: email,
          name: 'TCC Administrator',
          userType: 'ADMIN'
        }
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid TCC credentials'
      });
    }
    return;
  }

  // TCC Revenue Optimization endpoints
  if (req.method === 'GET' && req.url === '/api/tcc/analytics/revenue-optimization') {
    res.status(200).json({
      success: true,
      data: {
        totalRevenue: 125000.00,
        totalCosts: 95000.00,
        netProfit: 30000.00,
        profitMargin: 24.0,
        revenuePerTrip: 850.00,
        costPerTrip: 646.00,
        averageTripDistance: 45.2,
        averageRevenuePerMile: 18.81,
        averageCostPerMile: 14.29,
        averageLoadedMileRatio: 0.78,
        utilizationRate: 0.82,
        efficiencyScore: 87.5,
        recommendations: [
          'Optimize route planning to reduce deadhead miles',
          'Increase utilization during peak hours',
          'Implement dynamic pricing for high-demand periods'
        ],
        trends: {
          revenueGrowth: 12.5,
          costReduction: -3.2,
          profitImprovement: 18.7
        }
      }
    });
    return;
  }

  // TCC Cost Analysis endpoint
  if (req.method === 'GET' && req.url.startsWith('/api/tcc/analytics/cost-analysis')) {
    res.status(200).json({
      success: true,
      data: {
        averageProfitMargin: 24.0,
        averageCostPerMile: 38.0,
        averageRevenuePerMile: 50.0,
        averageLoadedMileRatio: 0.75,
        totalOperatingCosts: 95000.00,
        laborCosts: 42000.00,
        vehicleCosts: 28000.00,
        fuelCosts: 15000.00,
        maintenanceCosts: 10000.00,
        costBreakdown: {
          labor: 44.2,
          vehicles: 29.5,
          fuel: 15.8,
          maintenance: 10.5
        },
        efficiencyMetrics: {
          costPerTrip: 646.00,
          costPerMile: 14.29,
          laborEfficiency: 0.85,
          vehicleUtilization: 0.78
        }
      }
    });
    return;
  }

  // TCC Profitability Analysis endpoint
  if (req.method === 'GET' && req.url.startsWith('/api/tcc/analytics/profitability')) {
    res.status(200).json({
      success: true,
      data: {
        grossProfit: 30000.00,
        netProfit: 28500.00,
        profitMargin: 24.0,
        roi: 31.6,
        profitabilityTrend: 'increasing',
        efficiencyMetrics: {
          revenuePerHour: 125.50,
          profitPerHour: 30.12,
          costPerHour: 95.38,
          utilizationRate: 0.82
        },
        profitByTransportLevel: {
          'BLS': { profit: 15000.00, margin: 22.5 },
          'ALS': { profit: 12000.00, margin: 26.8 },
          'Critical Care': { profit: 3000.00, margin: 28.2 }
        },
        monthlyTrends: [
          { month: 'Jul', profit: 28500, margin: 24.0 },
          { month: 'Aug', profit: 31200, margin: 25.2 },
          { month: 'Sep', profit: 28900, margin: 23.8 }
        ]
      }
    });
    return;
  }

  // TCC Units Management endpoints
  if (req.method === 'GET' && req.url === '/api/tcc/units') {
    res.status(200).json({
      success: true,
      data: [
        {
          id: 'tcc-unit-001',
          unitNumber: 'TCC-001',
          type: 'BLS',
          status: 'Available',
          location: 'Downtown Station',
          assignedCrew: ['John Smith', 'Jane Doe'],
          lastMaintenance: '2025-09-15',
          utilizationRate: 0.85,
          revenueGenerated: 12500.00
        },
        {
          id: 'tcc-unit-002',
          unitNumber: 'TCC-002',
          type: 'ALS',
          status: 'On Call',
          location: 'North Station',
          assignedCrew: ['Mike Johnson', 'Sarah Wilson'],
          lastMaintenance: '2025-09-10',
          utilizationRate: 0.78,
          revenueGenerated: 18200.00
        },
        {
          id: 'tcc-unit-003',
          unitNumber: 'TCC-003',
          type: 'Critical Care',
          status: 'In Service',
          location: 'South Station',
          assignedCrew: ['Dr. Robert Lee', 'Nurse Emily Chen'],
          lastMaintenance: '2025-09-18',
          utilizationRate: 0.92,
          revenueGenerated: 28500.00
        }
      ]
    });
    return;
  }

  if (req.method === 'POST' && req.url === '/api/tcc/units') {
    const { unitNumber, type, location, assignedCrew } = req.body;
    
    res.status(201).json({
      success: true,
      message: 'TCC Unit created successfully',
      data: {
        id: `tcc-unit-${Date.now()}`,
        unitNumber: unitNumber || 'TCC-NEW',
        type: type || 'BLS',
        status: 'Available',
        location: location || 'Main Station',
        assignedCrew: assignedCrew || [],
        lastMaintenance: new Date().toISOString().split('T')[0],
        utilizationRate: 0.0,
        revenueGenerated: 0.00
      }
    });
    return;
  }

  if (req.method === 'PUT' && req.url.startsWith('/api/tcc/units/')) {
    const unitId = req.url.split('/').pop();
    
    res.status(200).json({
      success: true,
      message: 'TCC Unit updated successfully',
      data: {
        id: unitId,
        unitNumber: 'TCC-001-UPDATED',
        type: 'ALS',
        status: 'Available',
        location: 'Updated Location',
        assignedCrew: ['Updated Crew Member'],
        lastMaintenance: '2025-09-20',
        utilizationRate: 0.75,
        revenueGenerated: 15000.00
      }
    });
    return;
  }

  if (req.method === 'DELETE' && req.url.startsWith('/api/tcc/units/')) {
    const unitId = req.url.split('/').pop();
    
    res.status(200).json({
      success: true,
      message: `TCC Unit ${unitId} deleted successfully`
    });
    return;
  }

  // TCC Hospitals Management endpoints
  if (req.method === 'GET' && req.url === '/api/tcc/hospitals') {
    res.status(200).json({
      success: true,
      data: [
        {
          id: 'tcc-hosp-001',
          name: 'City General Hospital',
          address: '123 Medical Center Dr',
          city: 'Anytown',
          state: 'PA',
          zipCode: '12345',
          phone: '(555) 123-4567',
          email: 'info@citygeneral.org',
          type: 'General',
          capabilities: ['Emergency', 'Surgery', 'ICU'],
          region: 'Central',
          latitude: 40.7128,
          longitude: -74.0060,
          isActive: true,
          partnershipLevel: 'Preferred',
          averageTripRevenue: 850.00
        },
        {
          id: 'tcc-hosp-002',
          name: 'Regional Trauma Center',
          address: '456 Trauma Way',
          city: 'Anytown',
          state: 'PA',
          zipCode: '12346',
          phone: '(555) 987-6543',
          email: 'contact@regionaltrauma.org',
          type: 'Trauma',
          capabilities: ['Trauma', 'Emergency', 'Surgery', 'ICU'],
          region: 'Central',
          latitude: 40.7589,
          longitude: -73.9851,
          isActive: true,
          partnershipLevel: 'Exclusive',
          averageTripRevenue: 1250.00
        }
      ]
    });
    return;
  }

  if (req.method === 'POST' && req.url === '/api/tcc/hospitals') {
    const { name, address, city, state, zipCode, phone, email, type, capabilities, region, latitude, longitude } = req.body;
    
    res.status(201).json({
      success: true,
      message: 'TCC Hospital created successfully',
      data: {
        id: `tcc-hosp-${Date.now()}`,
        name: name || 'New Hospital',
        address: address || '123 New St',
        city: city || 'New City',
        state: state || 'PA',
        zipCode: zipCode || '00000',
        phone: phone || '(555) 000-0000',
        email: email || 'info@newhospital.org',
        type: type || 'General',
        capabilities: capabilities || ['Emergency'],
        region: region || 'Central',
        latitude: latitude || 40.7128,
        longitude: longitude || -74.0060,
        isActive: true,
        partnershipLevel: 'Standard',
        averageTripRevenue: 750.00
      }
    });
    return;
  }

  if (req.method === 'PUT' && req.url.startsWith('/api/tcc/hospitals/')) {
    const hospitalId = req.url.split('/').pop();
    
    res.status(200).json({
      success: true,
      message: 'TCC Hospital updated successfully',
      data: {
        id: hospitalId,
        name: 'Updated Hospital Name',
        address: 'Updated Address',
        city: 'Updated City',
        state: 'PA',
        zipCode: '12345',
        phone: '(555) 111-2222',
        email: 'updated@hospital.org',
        type: 'General',
        capabilities: ['Emergency', 'Surgery'],
        region: 'Central',
        latitude: 40.7128,
        longitude: -74.0060,
        isActive: true,
        partnershipLevel: 'Preferred',
        averageTripRevenue: 900.00
      }
    });
    return;
  }

  if (req.method === 'DELETE' && req.url.startsWith('/api/tcc/hospitals/')) {
    const hospitalId = req.url.split('/').pop();
    
    res.status(200).json({
      success: true,
      message: `TCC Hospital ${hospitalId} deleted successfully`
    });
    return;
  }

  // TCC Agencies Management endpoints
  if (req.method === 'GET' && req.url === '/api/tcc/agencies') {
    res.status(200).json({
      success: true,
      data: [
        {
          id: 'tcc-agency-001',
          name: 'Metro EMS',
          type: 'Private',
          licenseNumber: 'EMS-001-PA',
          contactPerson: 'John Manager',
          phone: '(555) 111-2222',
          email: 'dispatch@metroems.com',
          address: '789 EMS Way',
          city: 'Anytown',
          state: 'PA',
          zipCode: '12347',
          capabilities: ['BLS', 'ALS'],
          region: 'Central',
          isActive: true,
          partnershipLevel: 'Preferred',
          averageResponseTime: 8.5,
          reliabilityScore: 95.2
        },
        {
          id: 'tcc-agency-002',
          name: 'Regional Ambulance',
          type: 'Municipal',
          licenseNumber: 'EMS-002-PA',
          contactPerson: 'Jane Director',
          phone: '(555) 333-4444',
          email: 'ops@regionalambulance.gov',
          address: '321 Public Safety Blvd',
          city: 'Anytown',
          state: 'PA',
          zipCode: '12348',
          capabilities: ['BLS', 'ALS', 'Critical Care'],
          region: 'Central',
          isActive: true,
          partnershipLevel: 'Exclusive',
          averageResponseTime: 6.2,
          reliabilityScore: 98.7
        }
      ]
    });
    return;
  }

  if (req.method === 'POST' && req.url === '/api/tcc/agencies') {
    const { name, type, licenseNumber, contactPerson, phone, email, address, city, state, zipCode, capabilities, region } = req.body;
    
    res.status(201).json({
      success: true,
      message: 'TCC Agency created successfully',
      data: {
        id: `tcc-agency-${Date.now()}`,
        name: name || 'New EMS Agency',
        type: type || 'Private',
        licenseNumber: licenseNumber || 'EMS-NEW-PA',
        contactPerson: contactPerson || 'New Contact',
        phone: phone || '(555) 000-0000',
        email: email || 'info@newagency.com',
        address: address || '123 New St',
        city: city || 'New City',
        state: state || 'PA',
        zipCode: zipCode || '00000',
        capabilities: capabilities || ['BLS'],
        region: region || 'Central',
        isActive: true,
        partnershipLevel: 'Standard',
        averageResponseTime: 10.0,
        reliabilityScore: 85.0
      }
    });
    return;
  }

  if (req.method === 'PUT' && req.url.startsWith('/api/tcc/agencies/')) {
    const agencyId = req.url.split('/').pop();
    
    res.status(200).json({
      success: true,
      message: 'TCC Agency updated successfully',
      data: {
        id: agencyId,
        name: 'Updated EMS Agency',
        type: 'Private',
        licenseNumber: 'EMS-UPDATED-PA',
        contactPerson: 'Updated Contact',
        phone: '(555) 999-8888',
        email: 'updated@agency.com',
        address: 'Updated Address',
        city: 'Updated City',
        state: 'PA',
        zipCode: '12345',
        capabilities: ['BLS', 'ALS'],
        region: 'Central',
        isActive: true,
        partnershipLevel: 'Preferred',
        averageResponseTime: 7.5,
        reliabilityScore: 92.5
      }
    });
    return;
  }

  if (req.method === 'DELETE' && req.url.startsWith('/api/tcc/agencies/')) {
    const agencyId = req.url.split('/').pop();
    
    res.status(200).json({
      success: true,
      message: `TCC Agency ${agencyId} deleted successfully`
    });
    return;
  }

  // TCC Users Management endpoints
  if (req.method === 'GET' && req.url === '/api/tcc/users') {
    res.status(200).json({
      success: true,
      data: [
        {
          id: 'tcc-user-001',
          email: 'admin@tcc.com',
          name: 'TCC Administrator',
          userType: 'ADMIN',
          phone: '(555) 123-4567',
          emailNotifications: true,
          smsNotifications: false,
          isActive: true,
          createdAt: '2025-01-01T00:00:00Z',
          lastLogin: '2025-09-22T15:00:00Z'
        },
        {
          id: 'tcc-user-002',
          email: 'dispatcher@tcc.com',
          name: 'TCC Dispatcher',
          userType: 'DISPATCHER',
          phone: '(555) 987-6543',
          emailNotifications: true,
          smsNotifications: true,
          isActive: true,
          createdAt: '2025-01-15T00:00:00Z',
          lastLogin: '2025-09-22T14:30:00Z'
        }
      ]
    });
    return;
  }

  if (req.method === 'POST' && req.url === '/api/tcc/users') {
    const { email, name, userType, phone, emailNotifications, smsNotifications } = req.body;
    
    res.status(201).json({
      success: true,
      message: 'TCC User created successfully',
      data: {
        id: `tcc-user-${Date.now()}`,
        email: email || 'newuser@tcc.com',
        name: name || 'New TCC User',
        userType: userType || 'USER',
        phone: phone || '(555) 000-0000',
        emailNotifications: emailNotifications !== undefined ? emailNotifications : true,
        smsNotifications: smsNotifications !== undefined ? smsNotifications : false,
        isActive: true,
        createdAt: new Date().toISOString(),
        lastLogin: null
      }
    });
    return;
  }

  if (req.method === 'PUT' && req.url.startsWith('/api/tcc/users/')) {
    const userId = req.url.split('/').pop();
    
    res.status(200).json({
      success: true,
      message: 'TCC User updated successfully',
      data: {
        id: userId,
        email: 'updated@tcc.com',
        name: 'Updated TCC User',
        userType: 'ADMIN',
        phone: '(555) 111-2222',
        emailNotifications: true,
        smsNotifications: true,
        isActive: true,
        createdAt: '2025-01-01T00:00:00Z',
        lastLogin: '2025-09-22T15:00:00Z'
      }
    });
    return;
  }

  if (req.method === 'DELETE' && req.url.startsWith('/api/tcc/users/')) {
    const userId = req.url.split('/').pop();
    
    res.status(200).json({
      success: true,
      message: `TCC User ${userId} deleted successfully`
    });
    return;
  }

  // TCC Route Optimization endpoint
  if (req.method === 'POST' && req.url === '/api/tcc/optimize/routes') {
    const { trips, vehicles, constraints } = req.body;
    
    res.status(200).json({
      success: true,
      data: {
        optimizedRoutes: [
          {
            vehicleId: 'tcc-unit-001',
            route: [
              { tripId: 'trip-001', pickup: 'Hospital A', dropoff: 'Hospital B', distance: 15.2, estimatedTime: 25 },
              { tripId: 'trip-003', pickup: 'Hospital B', dropoff: 'Hospital C', distance: 22.1, estimatedTime: 35 }
            ],
            totalDistance: 37.3,
            totalTime: 60,
            efficiency: 0.92
          },
          {
            vehicleId: 'tcc-unit-002',
            route: [
              { tripId: 'trip-002', pickup: 'Hospital D', dropoff: 'Hospital E', distance: 18.7, estimatedTime: 30 },
              { tripId: 'trip-004', pickup: 'Hospital E', dropoff: 'Hospital F', distance: 12.5, estimatedTime: 20 }
            ],
            totalDistance: 31.2,
            totalTime: 50,
            efficiency: 0.88
          }
        ],
        optimizationMetrics: {
          totalDistance: 68.5,
          totalTime: 110,
          averageEfficiency: 0.90,
          fuelSavings: 15.2,
          timeSavings: 25
        }
      }
    });
    return;
  }

  // TCC Revenue Optimization endpoint
  if (req.method === 'POST' && req.url === '/api/tcc/optimize/revenue') {
    const { trips, pricing, constraints } = req.body;
    
    res.status(200).json({
      success: true,
      data: {
        optimizedPricing: {
          baseRate: 450.00,
          mileageRate: 12.50,
          priorityMultiplier: 1.25,
          surgeMultiplier: 1.15
        },
        revenueProjection: {
          totalRevenue: 145000.00,
          averageRevenue: 967.00,
          revenueIncrease: 16000.00,
          marginImprovement: 2.8
        },
        averageProfitMargin: 26.8,
        recommendations: [
          'Implement dynamic pricing for peak hours',
          'Adjust rates based on distance and urgency',
          'Optimize vehicle utilization patterns'
        ]
      }
    });
    return;
  }

  // TCC Analytics Overview endpoint
  if (req.method === 'GET' && req.url === '/api/tcc/analytics/overview') {
    res.status(200).json({
      success: true,
      data: {
        totalTrips: 156,
        activeTrips: 12,
        completedTrips: 144,
        totalRevenue: 125000.00,
        averageTripValue: 801.28,
        utilizationRate: 0.82,
        activeUnits: 8,
        totalUnits: 10,
        pendingRequests: 5,
        completedToday: 23,
        revenueThisMonth: 45000.00,
        costThisMonth: 32000.00,
        profitThisMonth: 13000.00,
        profitMargin: 28.9,
        topPerformingUnit: 'TCC-003',
        averageResponseTime: 8.5,
        customerSatisfaction: 4.7,
        trends: {
          revenueGrowth: 12.5,
          tripVolumeGrowth: 8.3,
          costReduction: -3.2,
          efficiencyImprovement: 15.7
        }
      }
    });
    return;
  }

  // TCC Analytics Trips endpoint
  if (req.method === 'GET' && req.url === '/api/tcc/analytics/trips') {
    res.status(200).json({
      success: true,
      data: {
        totalTrips: 156,
        tripsByStatus: {
          pending: 8,
          inProgress: 12,
          completed: 136
        },
        tripsByLevel: {
          BLS: 89,
          ALS: 45,
          CCT: 22
        },
        tripsByPriority: {
          LOW: 34,
          MEDIUM: 67,
          HIGH: 42,
          URGENT: 13
        },
        averageTripDuration: 45.2,
        averageDistance: 12.8,
        onTimePerformance: 0.94,
        recentTrips: [
          {
            id: 'trip-001',
            tripNumber: 'TCC-2025-001',
            status: 'completed',
            type: 'BLS',
            patientName: 'John Smith',
            pickupLocation: 'City Hospital',
            dropoffLocation: 'Rehabilitation Center',
            startTime: '2025-09-22T10:00:00Z',
            endTime: '2025-09-22T11:30:00Z',
            duration: 90,
            distance: 15.2,
            revenue: 850.00
          }
        ]
      }
    });
    return;
  }

  // TCC Analytics Agencies endpoint
  if (req.method === 'GET' && req.url === '/api/tcc/analytics/agencies') {
    res.status(200).json({
      success: true,
      data: {
        totalAgencies: 12,
        activeAgencies: 10,
        pendingApprovals: 2,
        agencyPerformance: [
          {
            id: 'agency-001',
            name: 'Metro EMS',
            tripsCompleted: 45,
            averageRating: 4.8,
            revenueGenerated: 28500.00,
            utilizationRate: 0.89
          },
          {
            id: 'agency-002',
            name: 'City Ambulance',
            tripsCompleted: 38,
            averageRating: 4.6,
            revenueGenerated: 22100.00,
            utilizationRate: 0.76
          }
        ],
        topPerformingAgency: 'Metro EMS',
        averageAgencyRating: 4.7,
        totalAgencyRevenue: 125000.00
      }
    });
    return;
  }

  // TCC Analytics Hospitals endpoint
  if (req.method === 'GET' && req.url === '/api/tcc/analytics/hospitals') {
    res.status(200).json({
      success: true,
      data: {
        totalHospitals: 8,
        activeHospitals: 7,
        pendingApprovals: 1,
        hospitalUsage: [
          {
            id: 'hospital-001',
            name: 'City General Hospital',
            tripsRequested: 67,
            averageResponseTime: 7.2,
            satisfactionRating: 4.8,
            revenueGenerated: 45600.00
          },
          {
            id: 'hospital-002',
            name: 'Regional Medical Center',
            tripsRequested: 43,
            averageResponseTime: 8.1,
            satisfactionRating: 4.6,
            revenueGenerated: 32100.00
          }
        ],
        mostActiveHospital: 'City General Hospital',
        averageHospitalRating: 4.7,
        totalHospitalRevenue: 125000.00
      }
    });
    return;
  }

  // TCC Cost Breakdowns endpoint
  if (req.method === 'GET' && req.url === '/api/tcc/analytics/cost-breakdowns') {
    const { limit = 50 } = req.query;
    res.status(200).json({
      success: true,
      data: {
        breakdowns: [
          {
            id: 'breakdown-001',
            tripId: 'trip-001',
            tripNumber: 'TCC-2025-001',
            date: '2025-09-22',
            totalCost: 450.00,
            fuelCost: 85.00,
            laborCost: 280.00,
            maintenanceCost: 45.00,
            insuranceCost: 40.00,
            profit: 400.00,
            profitMargin: 0.89
          }
        ],
        total: 1,
        limit: parseInt(limit)
      }
    });
    return;
  }

  // TCC Cost Breakdown POST endpoint
  if (req.method === 'POST' && req.url === '/api/tcc/analytics/cost-breakdown') {
    const { tripId, breakdownData } = req.body;
    
    if (!tripId || !breakdownData) {
      res.status(400).json({
        success: false,
        message: 'Trip ID and breakdown data are required'
      });
      return;
    }

    res.status(201).json({
      success: true,
      message: 'Cost breakdown created successfully',
      data: {
        id: 'breakdown-' + Date.now(),
        tripId: tripId,
        ...breakdownData,
        createdAt: new Date().toISOString()
      }
    });
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
      '/api/auth/users',
      '/api/trips',
      '/api/agencies',
      '/api/hospitals',
      '/api/units',
      '/api/units/analytics',
      '/api/notifications',
      '/api/tcc/auth/login',
      '/api/tcc/analytics/overview',
      '/api/tcc/analytics/trips',
      '/api/tcc/analytics/agencies',
      '/api/tcc/analytics/hospitals',
      '/api/tcc/analytics/revenue-optimization',
      '/api/tcc/analytics/cost-analysis',
      '/api/tcc/analytics/profitability',
      '/api/tcc/analytics/cost-breakdowns',
      '/api/tcc/analytics/cost-breakdown',
      '/api/tcc/units',
      '/api/tcc/hospitals',
      '/api/tcc/agencies',
      '/api/tcc/users',
      '/api/tcc/optimize/routes',
      '/api/tcc/optimize/revenue',
      '/api/tcc/pickup-locations',
      '/api/tcc/facilities',
      '/api/agency-responses',
      '/api/optimize/what-if',
      '/api/optimize/return-trips'
    ]
  });
}
