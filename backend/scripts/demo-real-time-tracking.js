#!/usr/bin/env node

/**
 * Demo script for MedPort Real-time Tracking System
 * This script simulates GPS tracking data for demo purposes
 */

const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const prisma = new PrismaClient();

// Demo configuration
const DEMO_CONFIG = {
  baseUrl: 'http://localhost:5001',
  apiToken: null, // Will be set after login
  updateInterval: 5000, // 5 seconds between updates
  simulationDuration: 300000, // 5 minutes total
  units: [
    {
      unitNumber: 'DEMO-001',
      agencyName: 'Demo EMS Agency',
      startLat: 37.7749,
      startLng: -122.4194,
      targetLat: 37.7849,
      targetLng: -122.4094,
      speed: 35, // mph
    },
    {
      unitNumber: 'DEMO-002',
      agencyName: 'Demo EMS Agency',
      startLat: 37.7649,
      startLng: -122.4294,
      targetLat: 37.7749,
      targetLng: -122.4194,
      speed: 40, // mph
    },
    {
      unitNumber: 'DEMO-003',
      agencyName: 'Demo EMS Agency',
      startLat: 37.7849,
      startLng: -122.4094,
      targetLat: 37.7949,
      targetLng: -122.3994,
      speed: 30, // mph
    },
  ],
};

// Demo facilities for geofencing
const DEMO_FACILITIES = [
  {
    name: 'Demo Hospital A',
    coordinates: { latitude: 37.7849, longitude: -122.4094 },
    radius: 500, // meters
  },
  {
    name: 'Demo Hospital B',
    coordinates: { latitude: 37.7949, longitude: -122.3994 },
    radius: 500, // meters
  },
  {
    name: 'Demo Urgent Care',
    coordinates: { latitude: 37.7749, longitude: -122.4194 },
    radius: 300, // meters
  },
];

class RealTimeTrackingDemo {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
    this.startTime = null;
    this.currentPositions = new Map();
    this.demoUnits = new Map();
  }

  async initialize() {
    console.log('🚀 Initializing MedPort Real-time Tracking Demo...');
    
    try {
      // Login to get API token
      await this.login();
      
      // Setup demo units
      await this.setupDemoUnits();
      
      // Setup demo facilities
      await this.setupDemoFacilities();
      
      console.log('✅ Demo initialization completed successfully!');
      return true;
    } catch (error) {
      console.error('❌ Demo initialization failed:', error.message);
      return false;
    }
  }

  async login() {
    try {
      console.log('🔐 Logging in to get API token...');
      
      const response = await axios.post(`${DEMO_CONFIG.baseUrl}/api/auth/login`, {
        email: 'demo@medport.com',
        password: 'demo123',
      });

      console.log('🔍 Login response:', JSON.stringify(response.data, null, 2));

      if (response.data.token) {
        DEMO_CONFIG.apiToken = response.data.token;
        console.log('✅ Login successful, API token obtained');
      } else {
        throw new Error('Login failed: ' + (response.data.message || 'Unknown error'));
      }
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('⚠️  Login failed, trying to create demo user...');
        await this.createDemoUser();
        await this.login();
      } else {
        throw error;
      }
    }
  }

  async createDemoUser() {
    try {
      console.log('👤 Creating demo user...');
      
      const response = await axios.post(`${DEMO_CONFIG.baseUrl}/api/auth/register`, {
        email: 'demo@medport.com',
        password: 'demo123',
        name: 'Demo User',
        role: 'COORDINATOR',
      });

      if (response.data.success) {
        console.log('✅ Demo user created successfully');
      } else {
        throw new Error('Failed to create demo user: ' + response.data.message);
      }
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('ℹ️  Demo user already exists');
      } else {
        throw error;
      }
    }
  }

  async setupDemoUnits() {
    try {
      console.log('🚑 Setting up demo units...');
      
      for (const unitConfig of DEMO_CONFIG.units) {
        // Check if unit exists
        let unit = await prisma.unit.findFirst({
          where: { unitNumber: unitConfig.unitNumber },
        });

        if (!unit) {
          // Create demo agency if it doesn't exist
          let agency = await prisma.transportAgency.findFirst({
            where: { name: unitConfig.agencyName },
          });

          if (!agency) {
            agency = await prisma.transportAgency.create({
              data: {
                name: unitConfig.agencyName,
                contactName: 'Demo Contact',
                phone: '555-0123',
                email: 'demo@agency.com',
                address: '123 Demo St',
                city: 'San Francisco',
                state: 'CA',
                zipCode: '94102',
                isActive: true,
              },
            });
          }

          // Create demo unit
          unit = await prisma.unit.create({
            data: {
              agencyId: agency.id,
              unitNumber: unitConfig.unitNumber,
              type: 'ALS',
              capabilities: { equipment: ['Defibrillator', 'Ventilator', 'Monitor'] },
              currentStatus: 'AVAILABLE',
              currentLocation: {
                latitude: unitConfig.startLat,
                longitude: unitConfig.startLng,
                timestamp: new Date(),
              },
              isActive: true,
            },
          });

          console.log(`✅ Created demo unit: ${unitConfig.unitNumber}`);
        } else {
          console.log(`ℹ️  Demo unit already exists: ${unitConfig.unitNumber}`);
        }

        // Store unit info and initial position
        this.demoUnits.set(unit.id, {
          ...unitConfig,
          id: unit.id,
        });

        this.currentPositions.set(unit.id, {
          latitude: unitConfig.startLat,
          longitude: unitConfig.startLng,
        });

        console.log(`📝 Stored unit ${unitConfig.unitNumber} with ID: ${unit.id}`);
      }
    } catch (error) {
      console.error('❌ Failed to setup demo units:', error);
      throw error;
    }
  }

  async setupDemoFacilities() {
    try {
      console.log('🏥 Setting up demo facilities...');
      
      for (const facilityConfig of DEMO_FACILITIES) {
        // Check if facility exists
        let facility = await prisma.facility.findFirst({
          where: { name: facilityConfig.name },
        });

        if (!facility) {
          facility = await prisma.facility.create({
            data: {
              name: facilityConfig.name,
              type: 'HOSPITAL',
              address: 'Demo Address',
              city: 'San Francisco',
              state: 'CA',
              zipCode: '94102',
              coordinates: facilityConfig.coordinates,
              isActive: true,
            },
          });

          console.log(`✅ Created demo facility: ${facilityConfig.name}`);
        } else {
          console.log(`ℹ️  Demo facility already exists: ${facilityConfig.name}`);
        }
      }
    } catch (error) {
      console.error('❌ Failed to setup demo facilities:', error);
      throw error;
    }
  }

  async startSimulation() {
    if (this.isRunning) {
      console.log('⚠️  Simulation is already running');
      return;
    }

    console.log('🎬 Starting real-time tracking simulation...');
    console.log(`⏱️  Simulation will run for ${DEMO_CONFIG.simulationDuration / 1000} seconds`);
    console.log(`🔄 Updates every ${DEMO_CONFIG.updateInterval / 1000} seconds`);
    
    this.isRunning = true;
    this.startTime = Date.now();

    // Start the simulation loop
    this.intervalId = setInterval(async () => {
      await this.updateAllUnits();
      
      // Check if simulation should end
      if (Date.now() - this.startTime >= DEMO_CONFIG.simulationDuration) {
        await this.stopSimulation();
      }
    }, DEMO_CONFIG.updateInterval);

    console.log('✅ Simulation started successfully!');
    console.log('📊 Check the real-time tracking dashboard to see live updates');
  }

  async updateAllUnits() {
    try {
      for (const [unitId, unitConfig] of this.demoUnits) {
        await this.updateUnitLocation(unitId, unitConfig);
      }
    } catch (error) {
      console.error('❌ Error updating units:', error);
    }
  }

  async updateUnitLocation(unitId, unitConfig) {
    try {
      const currentPos = this.currentPositions.get(unitId);
      if (!currentPos) return;

      // Calculate movement towards target
      const targetLat = unitConfig.targetLat;
      const targetLng = unitConfig.targetLng;
      
      // Simple linear interpolation towards target
      const latDiff = targetLat - currentPos.latitude;
      const lngDiff = targetLng - currentPos.longitude;
      
      // Move a small step towards target (based on speed)
      const stepSize = (unitConfig.speed / 3600) * (DEMO_CONFIG.updateInterval / 1000) * 0.0001; // Rough conversion
      
      const newLat = currentPos.latitude + (latDiff * stepSize);
      const newLng = currentPos.longitude + (lngDiff * stepSize);

      // Add some realistic GPS noise
      const noiseLat = newLat + (Math.random() - 0.5) * 0.0001;
      const noiseLng = newLng + (Math.random() - 0.5) * 0.0001;

      // Update current position
      this.currentPositions.set(unitId, {
        latitude: noiseLat,
        longitude: noiseLng,
      });

      // Calculate heading (direction of movement)
      const heading = Math.atan2(lngDiff, latDiff) * (180 / Math.PI);
      const normalizedHeading = (heading + 360) % 360;

      // Simulate realistic GPS data
      const locationUpdate = {
        unitId,
        location: {
          latitude: noiseLat,
          longitude: noiseLng,
          altitude: 50 + Math.random() * 20, // 50-70 meters
          speed: unitConfig.speed + (Math.random() - 0.5) * 10, // ±5 mph variation
          heading: normalizedHeading,
          accuracy: 5 + Math.random() * 10, // 5-15 meters
          batteryLevel: 80 + Math.random() * 20, // 80-100%
          signalStrength: 70 + Math.random() * 30, // 70-100%
        },
        source: 'DEMO_SIMULATION',
      };

      // Send location update via API
      const response = await axios.post(
        `${DEMO_CONFIG.baseUrl}/api/real-time-tracking/location`,
        locationUpdate,
        {
          headers: {
            'Authorization': `Bearer ${DEMO_CONFIG.apiToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        console.log(`📍 Updated ${unitConfig.unitNumber}: ${noiseLat.toFixed(6)}, ${noiseLng.toFixed(6)}`);
      } else {
        console.error(`❌ Failed to update ${unitConfig.unitNumber}:`, response.data.message);
      }
    } catch (error) {
      console.error(`❌ Error updating unit ${unitConfig.unitNumber}:`, error.message);
    }
  }

  async stopSimulation() {
    if (!this.isRunning) {
      console.log('⚠️  Simulation is not running');
      return;
    }

    console.log('🛑 Stopping real-time tracking simulation...');
    
    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    const duration = Date.now() - this.startTime;
    console.log(`✅ Simulation stopped after ${Math.round(duration / 1000)} seconds`);
    console.log('📊 Check the dashboard to see the final unit positions');
  }

  async cleanup() {
    console.log('🧹 Cleaning up demo data...');
    
    try {
      // Stop simulation if running
      if (this.isRunning) {
        await this.stopSimulation();
      }

      // Close database connection
      await prisma.$disconnect();
      
      console.log('✅ Cleanup completed');
    } catch (error) {
      console.error('❌ Cleanup failed:', error);
    }
  }
}

// Main execution
async function main() {
  const demo = new RealTimeTrackingDemo();
  
  try {
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Received SIGINT, shutting down gracefully...');
      await demo.cleanup();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
      await demo.cleanup();
      process.exit(0);
    });

    // Initialize demo
    const initialized = await demo.initialize();
    if (!initialized) {
      console.error('❌ Demo initialization failed, exiting');
      process.exit(1);
    }

    // Start simulation
    await demo.startSimulation();

    // Keep the process running
    console.log('\n💡 Press Ctrl+C to stop the simulation');
    
  } catch (error) {
    console.error('❌ Demo execution failed:', error);
    await demo.cleanup();
    process.exit(1);
  }
}

// Run the demo if this script is executed directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = RealTimeTrackingDemo;
