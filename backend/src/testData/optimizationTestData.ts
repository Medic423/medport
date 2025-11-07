import { Unit, TransportRequest } from '../services/revenueOptimizer';

/**
 * Test data for optimization algorithms
 * Based on realistic scenarios for testing revenue optimization and backhaul detection
 */

export const testUnits: Unit[] = [
  {
    id: 'unit-001',
    agencyId: 'agency-001',
    unitNumber: 'A-101',
    type: 'AMBULANCE',
    capabilities: ['BLS', 'ALS'],
    currentStatus: 'AVAILABLE',
    currentLocation: { lat: 40.7128, lng: -74.0060 }, // New York City
    shiftStart: new Date('2024-01-15T06:00:00Z'),
    shiftEnd: new Date('2024-01-15T18:00:00Z'),
    isActive: true
  },
  {
    id: 'unit-002',
    agencyId: 'agency-001',
    unitNumber: 'A-102',
    type: 'AMBULANCE',
    capabilities: ['BLS'],
    currentStatus: 'AVAILABLE',
    currentLocation: { lat: 40.7589, lng: -73.9851 }, // Central Park area
    shiftStart: new Date('2024-01-15T06:00:00Z'),
    shiftEnd: new Date('2024-01-15T18:00:00Z'),
    isActive: true
  },
  {
    id: 'unit-003',
    agencyId: 'agency-002',
    unitNumber: 'C-201',
    type: 'CRITICAL_CARE',
    capabilities: ['BLS', 'ALS', 'CCT'],
    currentStatus: 'ON_CALL',
    currentLocation: { lat: 40.7505, lng: -73.9934 }, // Times Square area
    shiftStart: new Date('2024-01-15T06:00:00Z'),
    shiftEnd: new Date('2024-01-15T18:00:00Z'),
    isActive: true
  },
  {
    id: 'unit-004',
    agencyId: 'agency-002',
    unitNumber: 'A-202',
    type: 'AMBULANCE',
    capabilities: ['BLS', 'ALS'],
    currentStatus: 'ON_TRIP',
    currentLocation: { lat: 40.6892, lng: -74.0445 }, // Statue of Liberty area
    shiftStart: new Date('2024-01-15T06:00:00Z'),
    shiftEnd: new Date('2024-01-15T18:00:00Z'),
    isActive: true
  },
  {
    id: 'unit-005',
    agencyId: 'agency-003',
    unitNumber: 'A-301',
    type: 'AMBULANCE',
    capabilities: ['BLS'],
    currentStatus: 'AVAILABLE',
    currentLocation: { lat: 40.7282, lng: -73.7949 }, // Queens area
    shiftStart: new Date('2024-01-15T06:00:00Z'),
    shiftEnd: new Date('2024-01-15T18:00:00Z'),
    isActive: true
  }
];

export const testRequests: TransportRequest[] = [
  {
    id: 'req-001',
    patientId: 'patient-001',
    originFacilityId: 'facility-001',
    destinationFacilityId: 'facility-002',
    transportLevel: 'BLS',
    priority: 'MEDIUM',
    status: 'PENDING',
    specialRequirements: '',
    requestTimestamp: new Date('2024-01-15T08:00:00Z'),
    readyStart: new Date('2024-01-15T08:30:00Z'),
    readyEnd: new Date('2024-01-15T09:00:00Z'),
    originLocation: { lat: 40.7128, lng: -74.0060 }, // Same as unit-001
    destinationLocation: { lat: 40.7589, lng: -73.9851 } // Central Park
  },
  {
    id: 'req-002',
    patientId: 'patient-002',
    originFacilityId: 'facility-002',
    destinationFacilityId: 'facility-003',
    transportLevel: 'ALS',
    priority: 'HIGH',
    status: 'PENDING',
    specialRequirements: 'Cardiac monitoring',
    requestTimestamp: new Date('2024-01-15T08:15:00Z'),
    readyStart: new Date('2024-01-15T08:45:00Z'),
    readyEnd: new Date('2024-01-15T09:15:00Z'),
    originLocation: { lat: 40.7589, lng: -73.9851 }, // Central Park
    destinationLocation: { lat: 40.7505, lng: -73.9934 } // Times Square
  },
  {
    id: 'req-003',
    patientId: 'patient-003',
    originFacilityId: 'facility-003',
    destinationFacilityId: 'facility-004',
    transportLevel: 'CCT',
    priority: 'URGENT',
    status: 'PENDING',
    specialRequirements: 'Ventilator support',
    requestTimestamp: new Date('2024-01-15T08:30:00Z'),
    readyStart: new Date('2024-01-15T09:00:00Z'),
    readyEnd: new Date('2024-01-15T09:30:00Z'),
    originLocation: { lat: 40.7505, lng: -73.9934 }, // Times Square
    destinationLocation: { lat: 40.6892, lng: -74.0445 } // Statue of Liberty
  },
  {
    id: 'req-004',
    patientId: 'patient-004',
    originFacilityId: 'facility-004',
    destinationFacilityId: 'facility-005',
    transportLevel: 'BLS',
    priority: 'LOW',
    status: 'PENDING',
    specialRequirements: '',
    requestTimestamp: new Date('2024-01-15T08:45:00Z'),
    readyStart: new Date('2024-01-15T09:15:00Z'),
    readyEnd: new Date('2024-01-15T09:45:00Z'),
    originLocation: { lat: 40.6892, lng: -74.0445 }, // Statue of Liberty
    destinationLocation: { lat: 40.7282, lng: -73.7949 } // Queens
  },
  {
    id: 'req-005',
    patientId: 'patient-005',
    originFacilityId: 'facility-005',
    destinationFacilityId: 'facility-001',
    transportLevel: 'ALS',
    priority: 'MEDIUM',
    status: 'PENDING',
    specialRequirements: 'IV therapy',
    requestTimestamp: new Date('2024-01-15T09:00:00Z'),
    readyStart: new Date('2024-01-15T09:30:00Z'),
    readyEnd: new Date('2024-01-15T10:00:00Z'),
    originLocation: { lat: 40.7282, lng: -73.7949 }, // Queens
    destinationLocation: { lat: 40.7128, lng: -74.0060 } // Back to NYC
  },
  // Additional requests for backhaul testing
  {
    id: 'req-006',
    patientId: 'patient-006',
    originFacilityId: 'facility-001',
    destinationFacilityId: 'facility-002',
    transportLevel: 'BLS',
    priority: 'MEDIUM',
    status: 'PENDING',
    specialRequirements: '',
    requestTimestamp: new Date('2024-01-15T09:15:00Z'),
    readyStart: new Date('2024-01-15T09:45:00Z'),
    readyEnd: new Date('2024-01-15T10:15:00Z'),
    originLocation: { lat: 40.7128, lng: -74.0060 }, // NYC
    destinationLocation: { lat: 40.7589, lng: -73.9851 } // Central Park
  },
  {
    id: 'req-007',
    patientId: 'patient-007',
    originFacilityId: 'facility-002',
    destinationFacilityId: 'facility-001',
    transportLevel: 'BLS',
    priority: 'LOW',
    status: 'PENDING',
    specialRequirements: '',
    requestTimestamp: new Date('2024-01-15T09:30:00Z'),
    readyStart: new Date('2024-01-15T10:00:00Z'),
    readyEnd: new Date('2024-01-15T10:30:00Z'),
    originLocation: { lat: 40.7589, lng: -73.9851 }, // Central Park
    destinationLocation: { lat: 40.7128, lng: -74.0060 } // Back to NYC
  }
];

// Test scenarios for different optimization cases
export const testScenarios = {
  // Scenario 1: Perfect backhaul opportunity (same locations, close times)
  perfectBackhaul: {
    name: 'Perfect Backhaul Opportunity',
    description: 'Two requests with same origin/destination and close time windows',
    requests: [
      {
        id: 'backhaul-001',
        patientId: 'patient-backhaul-001',
        originFacilityId: 'facility-001',
        destinationFacilityId: 'facility-002',
        transportLevel: 'BLS',
        priority: 'MEDIUM',
        status: 'PENDING',
        specialRequirements: '',
        requestTimestamp: new Date('2024-01-15T10:00:00Z'),
        readyStart: new Date('2024-01-15T10:30:00Z'),
        readyEnd: new Date('2024-01-15T11:00:00Z'),
        originLocation: { lat: 40.7128, lng: -74.0060 },
        destinationLocation: { lat: 40.7589, lng: -73.9851 }
      },
      {
        id: 'backhaul-002',
        patientId: 'patient-backhaul-002',
        originFacilityId: 'facility-002',
        destinationFacilityId: 'facility-001',
        transportLevel: 'BLS',
        priority: 'MEDIUM',
        status: 'PENDING',
        specialRequirements: '',
        requestTimestamp: new Date('2024-01-15T10:15:00Z'),
        readyStart: new Date('2024-01-15T10:45:00Z'),
        readyEnd: new Date('2024-01-15T11:15:00Z'),
        originLocation: { lat: 40.7589, lng: -73.9851 },
        destinationLocation: { lat: 40.7128, lng: -74.0060 }
      }
    ]
  },

  // Scenario 2: High priority urgent request
  urgentRequest: {
    name: 'Urgent High Priority Request',
    description: 'URGENT priority CCT request requiring immediate attention',
    requests: [
      {
        id: 'urgent-001',
        patientId: 'patient-urgent-001',
        originFacilityId: 'facility-001',
        destinationFacilityId: 'facility-003',
        transportLevel: 'CCT',
        priority: 'URGENT',
        status: 'PENDING',
        specialRequirements: 'Ventilator, cardiac monitoring',
        requestTimestamp: new Date('2024-01-15T11:00:00Z'),
        readyStart: new Date('2024-01-15T11:15:00Z'),
        readyEnd: new Date('2024-01-15T11:30:00Z'),
        originLocation: { lat: 40.7128, lng: -74.0060 },
        destinationLocation: { lat: 40.7505, lng: -73.9934 }
      }
    ]
  },

  // Scenario 3: Multiple units with different capabilities
  capabilityMismatch: {
    name: 'Capability Mismatch Test',
    description: 'CCT request with only BLS units available',
    requests: [
      {
        id: 'cct-001',
        patientId: 'patient-cct-001',
        originFacilityId: 'facility-001',
        destinationFacilityId: 'facility-002',
        transportLevel: 'CCT',
        priority: 'HIGH',
        status: 'PENDING',
        specialRequirements: 'Critical care team',
        requestTimestamp: new Date('2024-01-15T12:00:00Z'),
        readyStart: new Date('2024-01-15T12:30:00Z'),
        readyEnd: new Date('2024-01-15T13:00:00Z'),
        originLocation: { lat: 40.7128, lng: -74.0060 },
        destinationLocation: { lat: 40.7589, lng: -73.9851 }
      }
    ]
  },

  // Scenario 4: Overtime risk scenario
  overtimeRisk: {
    name: 'Overtime Risk Scenario',
    description: 'Request that would cause unit to work overtime',
    requests: [
      {
        id: 'overtime-001',
        patientId: 'patient-overtime-001',
        originFacilityId: 'facility-001',
        destinationFacilityId: 'facility-005',
        transportLevel: 'BLS',
        priority: 'LOW',
        status: 'PENDING',
        specialRequirements: '',
        requestTimestamp: new Date('2024-01-15T17:30:00Z'), // Near end of shift
        readyStart: new Date('2024-01-15T18:00:00Z'),
        readyEnd: new Date('2024-01-15T18:30:00Z'),
        originLocation: { lat: 40.7128, lng: -74.0060 },
        destinationLocation: { lat: 40.7282, lng: -73.7949 } // Far destination
      }
    ]
  }
};

// Expected results for validation
export const expectedResults = {
  revenueOptimizer: {
    // Expected revenue calculations
    blsRevenue: 150.0,
    alsRevenue: 275.0, // 250 * 1.1 (MEDIUM priority)
    cctRevenue: 600.0, // 400 * 1.5 (URGENT priority)
    
    // Expected scoring components
    deadheadPenalty: 0.5, // $0.50 per mile
    waitTimePenalty: 0.1, // $0.10 per minute
    backhaulBonus: 25.0, // $25 bonus
    overtimePenalty: 2.0 // $2.00 per hour
  },
  
  backhaulDetector: {
    maxTimeWindow: 90, // minutes
    maxDistance: 15, // miles
    revenueBonus: 25.0, // $25 bonus
    
    // Expected pairings
    perfectBackhaulDistance: 0.0, // Same location
    perfectBackhaulTimeWindow: 15, // 15 minutes apart
    perfectBackhaulEfficiency: 1.0 // Perfect efficiency score
  }
};

// Helper function to create test data with current timestamp
export function createTestDataWithCurrentTime(): { units: Unit[]; requests: TransportRequest[] } {
  const now = new Date();
  const baseTime = new Date(now.getTime() - (2 * 60 * 60 * 1000)); // 2 hours ago
  
  const units = testUnits.map(unit => ({
    ...unit,
    shiftStart: new Date(baseTime.getTime() - (2 * 60 * 60 * 1000)), // 4 hours ago
    shiftEnd: new Date(baseTime.getTime() + (10 * 60 * 60 * 1000)) // 8 hours from now
  }));
  
  const requests = testRequests.map((req, index) => ({
    ...req,
    requestTimestamp: new Date(baseTime.getTime() + (index * 15 * 60 * 1000)), // 15 min apart
    readyStart: new Date(baseTime.getTime() + (index * 15 * 60 * 1000) + (30 * 60 * 1000)), // 30 min after request
    readyEnd: new Date(baseTime.getTime() + (index * 15 * 60 * 1000) + (60 * 60 * 1000)) // 60 min after request
  }));
  
  return { units, requests };
}
