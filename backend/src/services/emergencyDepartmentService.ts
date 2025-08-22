import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface EmergencyDepartmentData {
  id?: string;
  facilityId: string;
  name: string;
  totalBeds: number;
  availableBeds: number;
  occupiedBeds: number;
  hallwayBeds: number;
  criticalBeds: number;
  capacityThreshold: number;
  currentCensus: number;
  transportQueueLength: number;
  averageWaitTime: number;
  peakHours?: any;
}

export interface BedStatusUpdateData {
  emergencyDepartmentId: string;
  updateType: 'BED_ADDED' | 'BED_REMOVED' | 'BED_OCCUPIED' | 'BED_VACATED' | 'HALLWAY_BED_ADDED' | 'HALLWAY_BED_REMOVED' | 'CRITICAL_BED_UPDATE';
  bedCount: number;
  updateReason?: string;
  notes?: string;
  updatedBy?: string;
}

export interface TransportQueueData {
  emergencyDepartmentId: string;
  transportRequestId: string;
  queuePosition: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  waitTime: number;
  estimatedWaitTime?: number;
  status: 'WAITING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'ESCALATED';
  assignedProviderId?: string;
  assignedUnitId?: string;
}

export interface ProviderForecastData {
  agencyId: string;
  forecastDate: Date;
  forecastType: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'SEASONAL' | 'EVENT_BASED';
  predictedDemand: number;
  availableCapacity: number;
  capacityUtilization: number;
  confidence: number;
  factors?: any;
  recommendations?: string;
}

export interface DemandPatternData {
  facilityId: string;
  patternType: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'SEASONAL' | 'EVENT_DRIVEN';
  dayOfWeek?: number;
  hourOfDay?: number;
  averageDemand: number;
  peakDemand: number;
  seasonalFactor: number;
  trendDirection: 'INCREASING' | 'DECREASING' | 'STABLE' | 'CYCLICAL' | 'UNKNOWN';
  confidence: number;
}

export class EmergencyDepartmentService {
  // Emergency Department Management
  async createEmergencyDepartment(data: EmergencyDepartmentData) {
    console.log('ED_SERVICE: Creating emergency department for facility:', data.facilityId);
    
    try {
      const ed = await prisma.emergencyDepartment.create({
        data: {
          facilityId: data.facilityId,
          name: data.name,
          totalBeds: data.totalBeds,
          availableBeds: data.availableBeds,
          occupiedBeds: data.occupiedBeds,
          hallwayBeds: data.hallwayBeds,
          criticalBeds: data.criticalBeds,
          capacityThreshold: data.capacityThreshold,
          currentCensus: data.currentCensus,
          transportQueueLength: data.transportQueueLength,
          averageWaitTime: data.averageWaitTime,
          peakHours: data.peakHours
        },
        include: {
          facility: true
        }
      });
      
      console.log('ED_SERVICE: Emergency department created successfully:', ed.id);
      return ed;
    } catch (error) {
      console.error('ED_SERVICE: Error creating emergency department:', error);
      throw error;
    }
  }

  async getEmergencyDepartment(facilityId: string) {
    console.log('ED_SERVICE: Fetching emergency department for facility:', facilityId);
    
    try {
      const ed = await prisma.emergencyDepartment.findUnique({
        where: { facilityId },
        include: {
          facility: true,
          bedStatusUpdates: {
            orderBy: { createdAt: 'desc' },
            take: 10
          },
          transportQueues: {
            where: { status: { in: ['WAITING', 'ASSIGNED'] } },
            include: {
              transportRequest: {
                include: {
                  originFacility: true,
                  destinationFacility: true
                }
              },
              assignedProvider: true,
              assignedUnit: true
            },
            orderBy: { queuePosition: 'asc' }
          },
          capacityAlerts: {
            where: { isActive: true },
            orderBy: { createdAt: 'desc' }
          }
        }
      });
      
      return ed;
    } catch (error) {
      console.error('ED_SERVICE: Error fetching emergency department:', error);
      throw error;
    }
  }

  async updateEmergencyDepartment(facilityId: string, data: Partial<EmergencyDepartmentData>) {
    console.log('ED_SERVICE: Updating emergency department for facility:', facilityId);
    
    try {
      const ed = await prisma.emergencyDepartment.update({
        where: { facilityId },
        data,
        include: {
          facility: true
        }
      });
      
      console.log('ED_SERVICE: Emergency department updated successfully');
      return ed;
    } catch (error) {
      console.error('ED_SERVICE: Error updating emergency department:', error);
      throw error;
    }
  }

  // Bed Status Management
  async updateBedStatus(data: BedStatusUpdateData) {
    console.log('ED_SERVICE: Updating bed status for ED:', data.emergencyDepartmentId);
    
    try {
      const bedUpdate = await prisma.bedStatusUpdate.create({
        data
      });

      // Update the emergency department bed counts
      const ed = await prisma.emergencyDepartment.findUnique({
        where: { id: data.emergencyDepartmentId }
      });

      if (ed) {
        let newAvailableBeds = ed.availableBeds;
        let newOccupiedBeds = ed.occupiedBeds;
        let newHallwayBeds = ed.hallwayBeds;
        let newCriticalBeds = ed.criticalBeds;

        switch (data.updateType) {
          case 'BED_ADDED':
            newAvailableBeds += data.bedCount;
            break;
          case 'BED_REMOVED':
            newAvailableBeds = Math.max(0, newAvailableBeds - data.bedCount);
            break;
          case 'BED_OCCUPIED':
            newAvailableBeds = Math.max(0, newAvailableBeds - data.bedCount);
            newOccupiedBeds += data.bedCount;
            break;
          case 'BED_VACATED':
            newOccupiedBeds = Math.max(0, newOccupiedBeds - data.bedCount);
            newAvailableBeds += data.bedCount;
            break;
          case 'HALLWAY_BED_ADDED':
            newHallwayBeds += data.bedCount;
            break;
          case 'HALLWAY_BED_REMOVED':
            newHallwayBeds = Math.max(0, newHallwayBeds - data.bedCount);
            break;
          case 'CRITICAL_BED_UPDATE':
            newCriticalBeds = data.bedCount;
            break;
        }

        const newCensus = newOccupiedBeds + newHallwayBeds;
        const capacityPercentage = (newCensus / ed.totalBeds) * 100;

        await prisma.emergencyDepartment.update({
          where: { id: data.emergencyDepartmentId },
          data: {
            availableBeds: newAvailableBeds,
            occupiedBeds: newOccupiedBeds,
            hallwayBeds: newHallwayBeds,
            criticalBeds: newCriticalBeds,
            currentCensus: newCensus
          }
        });

        // Check for capacity alerts
        if (capacityPercentage >= ed.capacityThreshold) {
          await this.createCapacityAlert({
            emergencyDepartmentId: data.emergencyDepartmentId,
            alertType: 'BED_CAPACITY',
            severity: capacityPercentage >= 95 ? 'CRITICAL' : capacityPercentage >= 90 ? 'HIGH' : 'MEDIUM',
            message: `ED capacity at ${capacityPercentage.toFixed(1)}% (${newCensus}/${ed.totalBeds} beds)`,
            threshold: ed.capacityThreshold,
            currentValue: Math.round(capacityPercentage)
          });
        }
      }

      console.log('ED_SERVICE: Bed status updated successfully');
      return bedUpdate;
    } catch (error) {
      console.error('ED_SERVICE: Error updating bed status:', error);
      throw error;
    }
  }

  // Transport Queue Management
  async addToTransportQueue(data: TransportQueueData) {
    console.log('ED_SERVICE: Adding transport request to queue for ED:', data.emergencyDepartmentId);
    
    try {
      // Get current queue length and assign position
      const currentQueue = await prisma.transportQueue.findMany({
        where: { 
          emergencyDepartmentId: data.emergencyDepartmentId,
          status: { in: ['WAITING', 'ASSIGNED'] }
        },
        orderBy: { queuePosition: 'desc' },
        take: 1
      });

      const newPosition = currentQueue.length > 0 ? currentQueue[0].queuePosition + 1 : 1;

      const queueEntry = await prisma.transportQueue.create({
        data: {
          ...data,
          queuePosition: newPosition
        },
        include: {
          transportRequest: {
            include: {
              originFacility: true,
              destinationFacility: true
            }
          },
          emergencyDepartment: true
        }
      });

      // Update ED queue length
      await prisma.emergencyDepartment.update({
        where: { id: data.emergencyDepartmentId },
        data: {
          transportQueueLength: { increment: 1 }
        }
      });

      console.log('ED_SERVICE: Transport request added to queue at position:', newPosition);
      return queueEntry;
    } catch (error) {
      console.error('ED_SERVICE: Error adding to transport queue:', error);
      throw error;
    }
  }

  async updateTransportQueueStatus(queueId: string, status: string, assignedProviderId?: string, assignedUnitId?: string) {
    console.log('ED_SERVICE: Updating transport queue status:', queueId, 'to:', status);
    
    try {
      const updateData: any = { status };
      
      if (assignedProviderId) {
        updateData.assignedProviderId = assignedProviderId;
        updateData.assignedTimestamp = new Date();
      }
      
      if (assignedUnitId) {
        updateData.assignedUnitId = assignedUnitId;
      }

      const queueEntry = await prisma.transportQueue.update({
        where: { id: queueId },
        data: updateData,
        include: {
          transportRequest: {
            include: {
              originFacility: true,
              destinationFacility: true
            }
          },
          assignedProvider: true,
          assignedUnit: true
        }
      });

      // If completed or cancelled, update ED queue length
      if (status === 'COMPLETED' || status === 'CANCELLED') {
        await prisma.emergencyDepartment.update({
          where: { id: queueEntry.emergencyDepartmentId },
          data: {
            transportQueueLength: { decrement: 1 }
          }
        });
      }

      console.log('ED_SERVICE: Transport queue status updated successfully');
      return queueEntry;
    } catch (error) {
      console.error('ED_SERVICE: Error updating transport queue status:', error);
      throw error;
    }
  }

  async getTransportQueue(emergencyDepartmentId: string) {
    console.log('ED_SERVICE: Fetching transport queue for ED:', emergencyDepartmentId);
    
    try {
      const queue = await prisma.transportQueue.findMany({
        where: { 
          emergencyDepartmentId,
          status: { in: ['WAITING', 'ASSIGNED', 'IN_PROGRESS'] }
        },
        include: {
          transportRequest: {
            include: {
              originFacility: true,
              destinationFacility: true
            }
          },
          assignedProvider: true,
          assignedUnit: true
        },
        orderBy: [
          { priority: 'desc' },
          { queuePosition: 'asc' }
        ]
      });
      
      return queue;
    } catch (error) {
      console.error('ED_SERVICE: Error fetching transport queue:', error);
      throw error;
    }
  }

  // Capacity Alert Management
  async createCapacityAlert(data: {
    emergencyDepartmentId: string;
    alertType: string;
    severity: string;
    message: string;
    threshold: number;
    currentValue: number;
  }) {
    console.log('ED_SERVICE: Creating capacity alert for ED:', data.emergencyDepartmentId);
    
    try {
      const alert = await prisma.capacityAlert.create({
        data: {
          emergencyDepartmentId: data.emergencyDepartmentId,
          alertType: data.alertType as any,
          severity: data.severity as any,
          message: data.message,
          threshold: data.threshold,
          currentValue: data.currentValue
        }
      });
      
      console.log('ED_SERVICE: Capacity alert created successfully');
      return alert;
    } catch (error) {
      console.error('ED_SERVICE: Error creating capacity alert:', error);
      throw error;
    }
  }

  async acknowledgeCapacityAlert(alertId: string, acknowledgedBy: string) {
    console.log('ED_SERVICE: Acknowledging capacity alert:', alertId);
    
    try {
      const alert = await prisma.capacityAlert.update({
        where: { id: alertId },
        data: {
          isActive: false,
          acknowledgedBy,
          acknowledgedAt: new Date()
        }
      });
      
      console.log('ED_SERVICE: Capacity alert acknowledged successfully');
      return alert;
    } catch (error) {
      console.error('ED_SERVICE: Error acknowledging capacity alert:', error);
      throw error;
    }
  }

  // Provider Forecasting
  async createProviderForecast(data: ProviderForecastData) {
    console.log('ED_SERVICE: Creating provider forecast for agency:', data.agencyId);
    
    try {
      const forecast = await prisma.providerForecast.create({
        data: {
          agencyId: data.agencyId,
          forecastDate: data.forecastDate,
          forecastType: data.forecastType,
          predictedDemand: data.predictedDemand,
          availableCapacity: data.availableCapacity,
          capacityUtilization: data.capacityUtilization,
          confidence: data.confidence,
          factors: data.factors,
          recommendations: data.recommendations
        },
        include: {
          agency: true
        }
      });
      
      console.log('ED_SERVICE: Provider forecast created successfully');
      return forecast;
    } catch (error) {
      console.error('ED_SERVICE: Error creating provider forecast:', error);
      throw error;
    }
  }

  async getProviderForecasts(agencyId?: string, forecastType?: string) {
    console.log('ED_SERVICE: Fetching provider forecasts');
    
    try {
      const where: any = {};
      if (agencyId) where.agencyId = agencyId;
      if (forecastType) where.forecastType = forecastType;

      const forecasts = await prisma.providerForecast.findMany({
        where,
        include: {
          agency: true
        },
        orderBy: { forecastDate: 'desc' }
      });
      
      return forecasts;
    } catch (error) {
      console.error('ED_SERVICE: Error fetching provider forecasts:', error);
      throw error;
    }
  }

  // Demand Pattern Analysis
  async createDemandPattern(data: DemandPatternData) {
    console.log('ED_SERVICE: Creating demand pattern for facility:', data.facilityId);
    
    try {
      const pattern = await prisma.demandPattern.create({
        data: {
          facilityId: data.facilityId,
          patternType: data.patternType,
          dayOfWeek: data.dayOfWeek,
          hourOfDay: data.hourOfDay,
          averageDemand: data.averageDemand,
          peakDemand: data.peakDemand,
          seasonalFactor: data.seasonalFactor,
          trendDirection: data.trendDirection,
          confidence: data.confidence
        },
        include: {
          facility: true
        }
      });
      
      console.log('ED_SERVICE: Demand pattern created successfully');
      return pattern;
    } catch (error) {
      console.error('ED_SERVICE: Error creating demand pattern:', error);
      throw error;
    }
  }

  async getDemandPatterns(facilityId?: string, patternType?: string) {
    console.log('ED_SERVICE: Fetching demand patterns');
    
    try {
      const where: any = {};
      if (facilityId) where.facilityId = facilityId;
      if (patternType) where.patternType = patternType;

      const patterns = await prisma.demandPattern.findMany({
        where,
        include: {
          facility: true
        },
        orderBy: { lastUpdated: 'desc' }
      });
      
      return patterns;
    } catch (error) {
      console.error('ED_SERVICE: Error fetching demand patterns:', error);
      throw error;
    }
  }

  // Analytics and Forecasting
  async calculateEDMetrics(emergencyDepartmentId: string) {
    console.log('ED_SERVICE: Calculating ED metrics for:', emergencyDepartmentId);
    
    try {
      const ed = await prisma.emergencyDepartment.findUnique({
        where: { id: emergencyDepartmentId },
        include: {
          transportQueues: {
            where: { status: { in: ['WAITING', 'ASSIGNED'] } }
          }
        }
      });

      if (!ed) {
        throw new Error('Emergency department not found');
      }

      const metrics = {
        capacityUtilization: (ed.currentCensus / ed.totalBeds) * 100,
        availableCapacity: ed.totalBeds - ed.currentCensus,
        queueWaitTime: ed.averageWaitTime,
        criticalBedUtilization: ed.criticalBeds > 0 ? (ed.occupiedBeds / ed.criticalBeds) * 100 : 0,
        hallwayBedPercentage: (ed.hallwayBeds / ed.totalBeds) * 100,
        transportQueueLength: ed.transportQueueLength,
        isAtCapacity: ed.currentCensus >= ed.totalBeds,
        isOverCapacity: ed.currentCensus > ed.totalBeds
      };

      console.log('ED_SERVICE: ED metrics calculated successfully');
      return metrics;
    } catch (error) {
      console.error('ED_SERVICE: Error calculating ED metrics:', error);
      throw error;
    }
  }

  async forecastProviderDemand(agencyId: string, forecastDate: Date) {
    console.log('ED_SERVICE: Forecasting provider demand for agency:', agencyId);
    
    try {
      // Get historical data for the agency
      const historicalForecasts = await prisma.providerForecast.findMany({
        where: { 
          agencyId,
          forecastDate: { lte: forecastDate }
        },
        orderBy: { forecastDate: 'desc' },
        take: 30 // Last 30 forecasts
      });

      if (historicalForecasts.length === 0) {
        throw new Error('No historical data available for forecasting');
      }

      // Simple forecasting algorithm (can be enhanced with ML)
      const avgDemand = historicalForecasts.reduce((sum, f) => sum + f.predictedDemand, 0) / historicalForecasts.length;
      const avgCapacity = historicalForecasts.reduce((sum, f) => sum + f.availableCapacity, 0) / historicalForecasts.length;
      
      // Apply seasonal factors if available
      const currentMonth = forecastDate.getMonth();
      const seasonalFactor = this.getSeasonalFactor(currentMonth);
      
      const predictedDemand = Math.round(avgDemand * seasonalFactor);
      const availableCapacity = Math.round(avgCapacity);
      const capacityUtilization = (predictedDemand / availableCapacity) * 100;

      const forecast = await this.createProviderForecast({
        agencyId,
        forecastDate,
        forecastType: 'DAILY',
        predictedDemand,
        availableCapacity,
        capacityUtilization,
        confidence: 0.8,
        factors: { seasonalFactor, historicalDataPoints: historicalForecasts.length },
        recommendations: this.generateForecastRecommendations(predictedDemand, availableCapacity, capacityUtilization)
      });

      console.log('ED_SERVICE: Provider demand forecasted successfully');
      return forecast;
    } catch (error) {
      console.error('ED_SERVICE: Error forecasting provider demand:', error);
      throw error;
    }
  }

  private getSeasonalFactor(month: number): number {
    // Simple seasonal factors based on month
    const seasonalFactors = [
      1.1, 1.0, 1.0,  // Jan, Feb, Mar (winter - slightly higher)
      0.9, 0.9, 1.0,  // Apr, May, Jun (spring - slightly lower)
      1.0, 1.0, 1.1,  // Jul, Aug, Sep (summer - slightly higher)
      1.0, 1.1, 1.2   // Oct, Nov, Dec (fall/winter - higher)
    ];
    return seasonalFactors[month];
  }

  private generateForecastRecommendations(predictedDemand: number, availableCapacity: number, capacityUtilization: number): string {
    if (capacityUtilization > 90) {
      return 'High capacity utilization expected. Consider adding additional units or extending operating hours.';
    } else if (capacityUtilization > 75) {
      return 'Moderate capacity utilization. Monitor closely and prepare for potential surges.';
    } else if (capacityUtilization > 50) {
      return 'Normal capacity utilization. Maintain current staffing levels.';
    } else {
      return 'Low capacity utilization. Consider cost optimization strategies.';
    }
  }
}

export default EmergencyDepartmentService;
