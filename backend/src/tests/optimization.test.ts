import { RevenueOptimizer } from '../services/revenueOptimizer';
import { BackhaulDetector } from '../services/backhaulDetector';
import { testUnits, testRequests, testScenarios, expectedResults, createTestDataWithCurrentTime } from '../testData/optimizationTestData';

describe('Revenue Optimization System', () => {
  let revenueOptimizer: RevenueOptimizer;
  let backhaulDetector: BackhaulDetector;
  let mockDatabaseManager: any;

  beforeEach(() => {
    mockDatabaseManager = {};
    revenueOptimizer = new RevenueOptimizer(mockDatabaseManager);
    backhaulDetector = new BackhaulDetector();
  });

  describe('RevenueOptimizer', () => {
    describe('Revenue Calculation', () => {
      test('should calculate correct BLS revenue', () => {
        const request = testRequests[0]; // BLS, MEDIUM priority
        const revenue = revenueOptimizer.calculateRevenue(request);
        expect(revenue).toBe(165.0); // 150 * 1.1 (MEDIUM priority)
      });

      test('should calculate correct ALS revenue with special requirements', () => {
        const request = testRequests[1]; // ALS, HIGH priority, special requirements
        const revenue = revenueOptimizer.calculateRevenue(request);
        expect(revenue).toBe(362.5); // (250 * 1.25) + 50 (special requirements)
      });

      test('should calculate correct CCT revenue for URGENT priority', () => {
        const request = testRequests[2]; // CCT, URGENT priority
        const revenue = revenueOptimizer.calculateRevenue(request);
        expect(revenue).toBe(650.0); // (400 * 1.5) + 50 (special requirements)
      });

      test('should calculate correct LOW priority revenue', () => {
        const request = testRequests[3]; // BLS, LOW priority
        const revenue = revenueOptimizer.calculateRevenue(request);
        expect(revenue).toBe(150.0); // 150 * 1.0 (LOW priority)
      });
    });

    describe('Distance Calculation', () => {
      test('should calculate distance between two points correctly', () => {
        const point1 = { lat: 40.7128, lng: -74.0060 }; // NYC
        const point2 = { lat: 40.7589, lng: -73.9851 }; // Central Park
        const distance = revenueOptimizer.calculateDistance(point1, point2);
        expect(distance).toBeCloseTo(3.5, 1); // Approximately 3.5 miles
      });

      test('should calculate zero distance for same location', () => {
        const point = { lat: 40.7128, lng: -74.0060 };
        const distance = revenueOptimizer.calculateDistance(point, point);
        expect(distance).toBe(0);
      });
    });

    describe('Wait Time Calculation', () => {
      test('should calculate wait time when arriving early', () => {
        const unit = testUnits[0];
        const request = testRequests[0];
        const currentTime = new Date('2024-01-15T08:00:00Z');
        
        const waitTime = revenueOptimizer.calculateWaitTime(unit, request, currentTime);
        expect(waitTime).toBeGreaterThan(0);
      });

      test('should return zero wait time when arriving after ready time', () => {
        const unit = testUnits[0];
        const request = testRequests[0];
        const currentTime = new Date('2024-01-15T09:30:00Z'); // After ready time
        
        const waitTime = revenueOptimizer.calculateWaitTime(unit, request, currentTime);
        expect(waitTime).toBe(0);
      });
    });

    describe('Overtime Risk Calculation', () => {
      test('should calculate overtime risk for long trips near shift end', () => {
        const unit = testUnits[0];
        const request = testRequests[4]; // Long trip to Queens
        const currentTime = new Date('2024-01-15T17:00:00Z'); // Near shift end
        
        const overtimeRisk = revenueOptimizer.calculateOvertimeRisk(unit, request, currentTime);
        expect(overtimeRisk).toBeGreaterThan(0);
      });

      test('should return zero overtime risk for short trips', () => {
        const unit = testUnits[0];
        const request = testRequests[0]; // Short trip
        const currentTime = new Date('2024-01-15T08:00:00Z');
        
        const overtimeRisk = revenueOptimizer.calculateOvertimeRisk(unit, request, currentTime);
        expect(overtimeRisk).toBe(0);
      });
    });

    describe('Unit Capability Validation', () => {
      test('should validate BLS unit can handle BLS request', () => {
        const unit = testUnits[1]; // BLS unit
        const request = testRequests[0]; // BLS request
        
        const canHandle = revenueOptimizer.canHandleRequest(unit, request);
        expect(canHandle).toBe(true);
      });

      test('should validate ALS unit can handle BLS request', () => {
        const unit = testUnits[0]; // ALS unit
        const request = testRequests[0]; // BLS request
        
        const canHandle = revenueOptimizer.canHandleRequest(unit, request);
        expect(canHandle).toBe(true);
      });

      test('should validate BLS unit cannot handle CCT request', () => {
        const unit = testUnits[1]; // BLS unit
        const request = testRequests[2]; // CCT request
        
        const canHandle = revenueOptimizer.canHandleRequest(unit, request);
        expect(canHandle).toBe(false);
      });

      test('should validate unavailable unit cannot handle request', () => {
        const unit = testUnits[3]; // ON_TRIP unit
        const request = testRequests[0]; // BLS request
        
        const canHandle = revenueOptimizer.canHandleRequest(unit, request);
        expect(canHandle).toBe(false);
      });
    });

    describe('Scoring Algorithm', () => {
      test('should calculate positive score for profitable assignment', () => {
        const unit = testUnits[0];
        const request = testRequests[1]; // High revenue ALS request
        const currentTime = new Date('2024-01-15T08:00:00Z');
        
        const score = revenueOptimizer.calculateScore(unit, request, currentTime);
        expect(score).toBeGreaterThan(0);
      });

      test('should calculate negative score for unprofitable assignment', () => {
        const unit = testUnits[0];
        const request = testRequests[4]; // Long trip with overtime risk
        const currentTime = new Date('2024-01-15T17:30:00Z'); // Near shift end
        
        const score = revenueOptimizer.calculateScore(unit, request, currentTime);
        expect(score).toBeLessThan(0);
      });
    });

    describe('Weight Configuration', () => {
      test('should allow weight updates', () => {
        const newWeights = { deadheadMiles: 1.0, waitTime: 0.2 };
        revenueOptimizer.updateWeights(newWeights);
        
        const weights = revenueOptimizer.getWeights();
        expect(weights.deadheadMiles).toBe(1.0);
        expect(weights.waitTime).toBe(0.2);
      });
    });
  });

  describe('BackhaulDetector', () => {
    describe('Distance Calculation', () => {
      test('should calculate distance between two points', () => {
        const point1 = { lat: 40.7128, lng: -74.0060 };
        const point2 = { lat: 40.7589, lng: -73.9851 };
        const distance = backhaulDetector.calculateDistance(point1, point2);
        expect(distance).toBeCloseTo(3.5, 1);
      });
    });

    describe('Pair Detection', () => {
      test('should find valid backhaul pairs', () => {
        const pairs = backhaulDetector.findPairs(testRequests);
        expect(pairs.length).toBeGreaterThan(0);
        
        // Check that all pairs are valid
        pairs.forEach(pair => {
          expect(pair.distance).toBeLessThanOrEqual(15); // Max distance
          expect(pair.timeWindow).toBeLessThanOrEqual(90); // Max time window
        });
      });

      test('should not find pairs for incompatible transport levels', () => {
        const incompatibleRequests = [
          { ...testRequests[0], transportLevel: 'BLS' },
          { ...testRequests[2], transportLevel: 'CCT' }
        ];
        
        const pairs = backhaulDetector.findPairs(incompatibleRequests);
        expect(pairs.length).toBe(0);
      });

      test('should find perfect backhaul pair', () => {
        const perfectPair = testScenarios.perfectBackhaul.requests;
        const pairs = backhaulDetector.findPairs(perfectPair);
        
        expect(pairs.length).toBe(1);
        expect(pairs[0].distance).toBe(0); // Same location
        expect(pairs[0].timeWindow).toBe(15); // 15 minutes apart
        expect(pairs[0].efficiency).toBeCloseTo(1.0, 1); // Perfect efficiency
      });
    });

    describe('Pair Validation', () => {
      test('should validate pairs within distance limit', () => {
        const pair = {
          request1: testRequests[0],
          request2: testRequests[1],
          distance: 5.0, // Within 15 mile limit
          timeWindow: 30, // Within 90 minute limit
          revenueBonus: 25.0,
          efficiency: 0.8
        };
        
        const isValid = backhaulDetector.isValidPair(pair);
        expect(isValid).toBe(true);
      });

      test('should reject pairs beyond distance limit', () => {
        const pair = {
          request1: testRequests[0],
          request2: testRequests[4], // Far distance
          distance: 20.0, // Beyond 15 mile limit
          timeWindow: 30,
          revenueBonus: 25.0,
          efficiency: 0.8
        };
        
        const isValid = backhaulDetector.isValidPair(pair);
        expect(isValid).toBe(false);
      });

      test('should reject pairs beyond time window limit', () => {
        const pair = {
          request1: testRequests[0],
          request2: testRequests[1],
          distance: 5.0,
          timeWindow: 120, // Beyond 90 minute limit
          revenueBonus: 25.0,
          efficiency: 0.8
        };
        
        const isValid = backhaulDetector.isValidPair(pair);
        expect(isValid).toBe(false);
      });
    });

    describe('Revenue Calculation', () => {
      test('should calculate pairing revenue correctly', () => {
        const pair = {
          request1: testRequests[0], // BLS, MEDIUM
          request2: testRequests[1], // ALS, HIGH
          distance: 5.0,
          timeWindow: 30,
          revenueBonus: 25.0,
          efficiency: 0.8
        };
        
        const revenue = backhaulDetector.calculatePairingRevenue(pair);
        expect(revenue).toBeGreaterThan(0);
        expect(revenue).toBeGreaterThan(25.0); // Should include bonus
      });
    });

    describe('Statistics', () => {
      test('should calculate backhaul statistics', () => {
        const stats = backhaulDetector.getBackhaulStatistics(testRequests);
        
        expect(stats.totalRequests).toBeGreaterThan(0);
        expect(stats.possiblePairs).toBeGreaterThan(0);
        expect(stats.validPairs).toBeGreaterThanOrEqual(0);
        expect(stats.averageEfficiency).toBeGreaterThanOrEqual(0);
        expect(stats.potentialRevenueIncrease).toBeGreaterThanOrEqual(0);
      });
    });

    describe('Parameter Configuration', () => {
      test('should allow parameter updates', () => {
        backhaulDetector.updateParameters(60, 10, 30.0);
        
        const params = backhaulDetector.getParameters();
        expect(params.maxTimeWindow).toBe(60);
        expect(params.maxDistance).toBe(10);
        expect(params.revenueBonus).toBe(30.0);
      });
    });
  });

  describe('Integration Tests', () => {
    test('should work with current timestamp data', () => {
      const { units, requests } = createTestDataWithCurrentTime();
      
      // Test revenue optimization
      const unit = units[0];
      const request = requests[0];
      const currentTime = new Date();
      
      const score = revenueOptimizer.calculateScore(unit, request, currentTime);
      expect(typeof score).toBe('number');
      
      // Test backhaul detection
      const pairs = backhaulDetector.findPairs(requests);
      expect(Array.isArray(pairs)).toBe(true);
    });

    test('should handle edge cases gracefully', () => {
      // Empty request list
      const emptyPairs = backhaulDetector.findPairs([]);
      expect(emptyPairs).toEqual([]);
      
      // Single request
      const singlePairs = backhaulDetector.findPairs([testRequests[0]]);
      expect(singlePairs).toEqual([]);
      
      // Invalid unit status
      const invalidUnit = { ...testUnits[0], currentStatus: 'MAINTENANCE' };
      const canHandle = revenueOptimizer.canHandleRequest(invalidUnit, testRequests[0]);
      expect(canHandle).toBe(false);
    });
  });
});
