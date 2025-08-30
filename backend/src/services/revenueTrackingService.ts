import { PrismaClient } from '@prisma/client';
import { 
  RevenueMetrics, 
  RevenueOptimizationParams, 
  RevenueAnalysis, 
  CostAnalysis, 
  ProfitabilityMetrics,
  RevenueTrend,
  AgencyRevenueSummary,
  UnitRevenuePerformance
} from '../types/revenueTracking';
import { TransportLevel, UnitStatus, RequestStatus } from '@prisma/client';

const prisma = new PrismaClient();

export class RevenueTrackingService {

  /**
   * Calculate comprehensive revenue metrics for a unit or agency
   */
  async calculateRevenueMetrics(
    entityId: string, 
    entityType: 'unit' | 'agency', 
    timeRange: { start: Date, end: Date }
  ): Promise<RevenueMetrics> {
    try {
      console.log('[REVENUE_TRACKING_SERVICE] Calculating revenue metrics for:', entityType, entityId);

      let assignments;
      
      if (entityType === 'unit') {
        assignments = await prisma.unitAssignment.findMany({
          where: {
            unitId: entityId,
            startTime: { gte: timeRange.start },
            endTime: { lte: timeRange.end },
            status: 'COMPLETED'
          },
          include: {
            transportRequest: {
              include: {
                originFacility: true,
                destinationFacility: true
              }
            }
          }
        });
      } else {
        assignments = await prisma.unitAssignment.findMany({
          where: {
            unit: {
              agencyId: entityId
            },
            startTime: { gte: timeRange.start },
            endTime: { lte: timeRange.end },
            status: 'COMPLETED'
          },
          include: {
            unit: true,
            transportRequest: {
              include: {
                originFacility: true,
                destinationFacility: true
              }
            }
          }
        });
      }

      let totalRevenue = 0;
      let totalMiles = 0;
      let totalTransports = 0;
      let revenueByLevel: Record<string, number> = {};
      let revenueByFacility: Record<string, number> = {};

      for (const assignment of assignments) {
        if (assignment.transportRequest) {
          const miles = this.calculateTransportMiles(assignment.transportRequest);
          const revenue = this.calculateTransportRevenue(assignment.transportRequest, miles);
          
          totalRevenue += revenue;
          totalMiles += miles;
          totalTransports++;

          // Revenue by transport level
          const level = assignment.transportRequest.transportLevel;
          revenueByLevel[level] = (revenueByLevel[level] || 0) + revenue;

          // Revenue by facility
          const facilityName = assignment.transportRequest.originFacility.name;
          revenueByFacility[facilityName] = (revenueByFacility[facilityName] || 0) + revenue;
        }
      }

      const averageRevenuePerTransport = totalTransports > 0 ? totalRevenue / totalTransports : 0;
      const averageRevenuePerMile = totalMiles > 0 ? totalRevenue / totalMiles : 0;

      return {
        entityId,
        entityType,
        timeRange,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalMiles: Math.round(totalMiles * 100) / 100,
        totalTransports,
        averageRevenuePerTransport: Math.round(averageRevenuePerTransport * 100) / 100,
        averageRevenuePerMile: Math.round(averageRevenuePerMile * 100) / 100,
        revenueByLevel,
        revenueByFacility,
        lastUpdated: new Date()
      };

    } catch (error) {
      console.error('[REVENUE_TRACKING_SERVICE] Error calculating revenue metrics:', error);
      throw error;
    }
  }

  /**
   * Calculate transport miles (demo implementation)
   */
  private calculateTransportMiles(transportRequest: any): number {
    // In production, this would use the distance matrix
    // For demo, return a realistic range based on facility locations
    const baseMiles = 15 + Math.random() * 35; // 15-50 miles
    
    // Add some variation based on transport level
    switch (transportRequest.transportLevel) {
      case TransportLevel.CCT:
        return baseMiles * (1 + Math.random() * 0.3); // CCT tends to be longer distance
      case TransportLevel.ALS:
        return baseMiles * (1 + Math.random() * 0.2); // ALS moderate variation
      case TransportLevel.BLS:
        return baseMiles * (0.8 + Math.random() * 0.4); // BLS more variable
      default:
        return baseMiles;
    }
  }

  /**
   * Calculate transport revenue based on level and distance
   */
  private calculateTransportRevenue(transportRequest: any, miles: number): number {
    let baseRate = 0;
    let mileageRate = 0;
    
    switch (transportRequest.transportLevel) {
      case TransportLevel.BLS:
        baseRate = 75; // Base fee for BLS
        mileageRate = 2.50; // Per mile rate
        break;
      case TransportLevel.ALS:
        baseRate = 125; // Base fee for ALS
        mileageRate = 3.75; // Per mile rate
        break;
      case TransportLevel.CCT:
        baseRate = 200; // Base fee for CCT
        mileageRate = 5.00; // Per mile rate
        break;
      case TransportLevel.OTHER:
        baseRate = 50; // Base fee for Other (wheelchair van, medical taxi)
        mileageRate = 2.00; // Per mile rate
        break;
    }
    
    // Add priority multiplier
    let priorityMultiplier = 1.0;
    switch (transportRequest.priority) {
      case 'URGENT':
        priorityMultiplier = 1.5;
        break;
      case 'HIGH':
        priorityMultiplier = 1.25;
        break;
      case 'MEDIUM':
        priorityMultiplier = 1.0;
        break;
      case 'LOW':
        priorityMultiplier = 0.9;
        break;
    }
    
    const totalRevenue = (baseRate + (mileageRate * miles)) * priorityMultiplier;
    return Math.round(totalRevenue * 100) / 100;
  }

  /**
   * Analyze revenue optimization opportunities
   */
  async analyzeRevenueOptimization(
    entityId: string, 
    entityType: 'unit' | 'agency',
    optimizationParams: RevenueOptimizationParams
  ): Promise<RevenueAnalysis> {
    try {
      console.log('[REVENUE_TRACKING_SERVICE] Analyzing revenue optimization for:', entityType, entityId);

      const currentMetrics = await this.calculateRevenueMetrics(entityId, entityType, {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        end: new Date()
      });

      // Calculate optimization potential
      const optimizationPotential = this.calculateOptimizationPotential(currentMetrics, optimizationParams);
      
      // Generate recommendations
      const recommendations = this.generateRevenueRecommendations(currentMetrics, optimizationPotential);

      return {
        currentMetrics,
        optimizationPotential,
        recommendations,
        analysisDate: new Date(),
        confidence: 0.85 // Demo confidence level
      };

    } catch (error) {
      console.error('[REVENUE_TRACKING_SERVICE] Error analyzing revenue optimization:', error);
      throw error;
    }
  }

  /**
   * Calculate optimization potential based on current metrics
   */
  private calculateOptimizationPotential(metrics: RevenueMetrics, params: RevenueOptimizationParams): any {
    const potential = {
      revenueIncrease: 0,
      efficiencyGains: 0,
      utilizationImprovement: 0,
      costReduction: 0
    };

    // Revenue increase potential based on utilization
    if (metrics.averageRevenuePerMile < params.targetRevenuePerMile) {
      potential.revenueIncrease += (params.targetRevenuePerMile - metrics.averageRevenuePerMile) * metrics.totalMiles * 0.3;
    }

    // Efficiency gains from route optimization
    potential.efficiencyGains = metrics.totalMiles * 0.15; // 15% efficiency improvement potential

    // Utilization improvement
    if (metrics.totalTransports < params.targetTransportsPerPeriod) {
      potential.utilizationImprovement = (params.targetTransportsPerPeriod - metrics.totalTransports) * metrics.averageRevenuePerTransport;
    }

    return potential;
  }

  /**
   * Generate revenue optimization recommendations
   */
  private generateRevenueRecommendations(metrics: RevenueMetrics, potential: any): string[] {
    const recommendations = [];

    if (potential.revenueIncrease > 0) {
      recommendations.push(`Focus on higher-value transport requests to increase revenue by $${potential.revenueIncrease.toFixed(2)}`);
    }

    if (potential.efficiencyGains > 0) {
      recommendations.push(`Implement route optimization to reduce empty miles and increase efficiency by ${potential.efficiencyGains.toFixed(0)} miles`);
    }

    if (potential.utilizationImprovement > 0) {
      recommendations.push(`Increase unit utilization to capture additional $${potential.utilizationImprovement.toFixed(2)} in revenue`);
    }

    // Add general recommendations
    if (metrics.averageRevenuePerMile < 3.0) {
      recommendations.push('Consider adjusting pricing structure to improve revenue per mile');
    }

    if (Object.keys(metrics.revenueByLevel).length > 0) {
      const bestLevel = Object.entries(metrics.revenueByLevel).reduce((a, b) => a[1] > b[1] ? a : b);
      recommendations.push(`Focus on ${bestLevel[0]} transports as they generate the highest revenue`);
    }

    return recommendations;
  }

  /**
   * Calculate cost analysis for revenue optimization
   */
  async calculateCostAnalysis(
    entityId: string, 
    entityType: 'unit' | 'agency',
    timeRange: { start: Date, end: Date }
  ): Promise<CostAnalysis> {
    try {
      // In production, this would pull from actual cost data
      // For demo, we'll use estimated costs based on industry standards
      
      const revenueMetrics = await this.calculateRevenueMetrics(entityId, entityType, timeRange);
      
      // Estimate costs based on revenue (typical EMS cost structure)
      const estimatedCosts = {
        fuelCosts: revenueMetrics.totalMiles * 0.35, // $0.35 per mile
        maintenanceCosts: revenueMetrics.totalMiles * 0.25, // $0.25 per mile
        laborCosts: revenueMetrics.totalTransports * 85, // $85 per transport
        insuranceCosts: revenueMetrics.totalRevenue * 0.08, // 8% of revenue
        administrativeCosts: revenueMetrics.totalRevenue * 0.12, // 12% of revenue
        equipmentCosts: revenueMetrics.totalTransports * 15 // $15 per transport
      };

      const totalCosts = Object.values(estimatedCosts).reduce((sum, cost) => sum + cost, 0);
      const netProfit = revenueMetrics.totalRevenue - totalCosts;
      const profitMargin = revenueMetrics.totalRevenue > 0 ? (netProfit / revenueMetrics.totalRevenue) * 100 : 0;

      return {
        entityId,
        entityType,
        timeRange,
        totalCosts: Math.round(totalCosts * 100) / 100,
        costBreakdown: estimatedCosts,
        netProfit: Math.round(netProfit * 100) / 100,
        profitMargin: Math.round(profitMargin * 100) / 100,
        costPerMile: revenueMetrics.totalMiles > 0 ? Math.round((totalCosts / revenueMetrics.totalMiles) * 100) / 100 : 0,
        costPerTransport: revenueMetrics.totalTransports > 0 ? Math.round((totalCosts / revenueMetrics.totalTransports) * 100) / 100 : 0
      };

    } catch (error) {
      console.error('[REVENUE_TRACKING_SERVICE] Error calculating cost analysis:', error);
      throw error;
    }
  }

  /**
   * Calculate profitability metrics
   */
  async calculateProfitabilityMetrics(
    entityId: string, 
    entityType: 'unit' | 'agency',
    timeRange: { start: Date, end: Date }
  ): Promise<ProfitabilityMetrics> {
    try {
      const revenueMetrics = await this.calculateRevenueMetrics(entityId, entityType, timeRange);
      const costAnalysis = await this.calculateCostAnalysis(entityId, entityType, timeRange);

      // Calculate additional profitability metrics
      const returnOnInvestment = costAnalysis.totalCosts > 0 ? 
        (costAnalysis.netProfit / costAnalysis.totalCosts) * 100 : 0;

      const breakEvenPoint = costAnalysis.totalCosts / revenueMetrics.averageRevenuePerTransport;

      return {
        entityId,
        entityType,
        timeRange,
        grossProfit: revenueMetrics.totalRevenue - costAnalysis.costBreakdown.fuelCosts - costAnalysis.costBreakdown.maintenanceCosts,
        netProfit: costAnalysis.netProfit,
        profitMargin: costAnalysis.profitMargin,
        returnOnInvestment: Math.round(returnOnInvestment * 100) / 100,
        breakEvenTransports: Math.ceil(breakEvenPoint),
        revenueEfficiency: revenueMetrics.averageRevenuePerMile / (costAnalysis.costPerMile || 1),
        lastUpdated: new Date()
      };

    } catch (error) {
      console.error('[REVENUE_TRACKING_SERVICE] Error calculating profitability metrics:', error);
      throw error;
    }
  }

  /**
   * Get revenue trends over time
   */
  async getRevenueTrends(
    entityId: string, 
    entityType: 'unit' | 'agency',
    period: 'daily' | 'weekly' | 'monthly' = 'monthly',
    timeRange: { start: Date, end: Date }
  ): Promise<RevenueTrend[]> {
    try {
      // For demo purposes, generate trend data
      // In production, this would aggregate actual data by time periods
      
      const trends: RevenueTrend[] = [];
      const currentDate = new Date(timeRange.start);
      
      while (currentDate <= timeRange.end) {
        const periodEnd = new Date(currentDate);
        
        switch (period) {
          case 'daily':
            periodEnd.setDate(periodEnd.getDate() + 1);
            break;
          case 'weekly':
            periodEnd.setDate(periodEnd.getDate() + 7);
            break;
          case 'monthly':
            periodEnd.setMonth(periodEnd.getMonth() + 1);
            break;
        }

        // Generate demo trend data with realistic variation
        const baseRevenue = 500 + Math.random() * 1000; // $500-$1500 base
        const trendRevenue = baseRevenue * (1 + Math.sin(currentDate.getTime() / (1000 * 60 * 60 * 24 * 30)) * 0.3); // Seasonal variation
        
        trends.push({
          period: currentDate.toISOString(),
          revenue: Math.round(trendRevenue * 100) / 100,
          transports: Math.floor(3 + Math.random() * 8), // 3-10 transports
          miles: Math.round((100 + Math.random() * 200) * 100) / 100, // 100-300 miles
          averageRevenuePerTransport: Math.round(trendRevenue / (3 + Math.random() * 8) * 100) / 100
        });

        currentDate.setTime(periodEnd.getTime());
      }

      return trends;

    } catch (error) {
      console.error('[REVENUE_TRACKING_SERVICE] Error getting revenue trends:', error);
      throw error;
    }
  }

  /**
   * Get agency revenue summary for multiple agencies
   */
  async getAgencyRevenueSummary(timeRange: { start: Date, end: Date }): Promise<AgencyRevenueSummary[]> {
    try {
      const agencies = await prisma.transportAgency.findMany({
        where: { isActive: true },
        include: {
          units: {
            include: {
              unitAssignments: {
                where: {
                  startTime: { gte: timeRange.start },
                  endTime: { lte: timeRange.end },
                  status: 'COMPLETED'
                },
                include: {
                  transportRequest: true
                }
              }
            }
          }
        }
      });

      const summaries: AgencyRevenueSummary[] = [];

      for (const agency of agencies) {
        let totalRevenue = 0;
        let totalMiles = 0;
        let totalTransports = 0;
        let activeUnits = 0;

        for (const unit of agency.units) {
          if (unit.currentStatus === UnitStatus.AVAILABLE || unit.currentStatus === UnitStatus.IN_USE) {
            activeUnits++;
          }

          for (const assignment of unit.unitAssignments) {
            if (assignment.transportRequest) {
              const miles = this.calculateTransportMiles(assignment.transportRequest);
              const revenue = this.calculateTransportRevenue(assignment.transportRequest, miles);
              
              totalRevenue += revenue;
              totalMiles += miles;
              totalTransports++;
            }
          }
        }

        summaries.push({
          agencyId: agency.id,
          agencyName: agency.name,
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          totalMiles: Math.round(totalMiles * 100) / 100,
          totalTransports,
          activeUnits,
          averageRevenuePerUnit: activeUnits > 0 ? Math.round((totalRevenue / activeUnits) * 100) / 100 : 0,
          averageRevenuePerMile: totalMiles > 0 ? Math.round((totalRevenue / totalMiles) * 100) / 100 : 0
        });
      }

      return summaries.sort((a, b) => b.totalRevenue - a.totalRevenue);

    } catch (error) {
      console.error('[REVENUE_TRACKING_SERVICE] Error getting agency revenue summary:', error);
      throw error;
    }
  }

  /**
   * Get unit revenue performance comparison
   */
  async getUnitRevenuePerformance(
    agencyId: string,
    timeRange: { start: Date, end: Date }
  ): Promise<UnitRevenuePerformance[]> {
    try {
      const units = await prisma.unit.findMany({
        where: { 
          agencyId,
          isActive: true 
        },
        include: {
          unitAssignments: {
            where: {
              startTime: { gte: timeRange.start },
              endTime: { lte: timeRange.end },
              status: 'COMPLETED'
            },
            include: {
              transportRequest: true
            }
          }
        }
      });

      const performances: UnitRevenuePerformance[] = [];

      for (const unit of units) {
        let totalRevenue = 0;
        let totalMiles = 0;
        let totalTransports = 0;

        for (const assignment of unit.unitAssignments) {
          if (assignment.transportRequest) {
            const miles = this.calculateTransportMiles(assignment.transportRequest);
            const revenue = this.calculateTransportRevenue(assignment.transportRequest, miles);
            
            totalRevenue += revenue;
            totalMiles += miles;
            totalTransports++;
          }
        }

        performances.push({
          unitId: unit.id,
          unitNumber: unit.unitNumber,
          unitType: unit.type,
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          totalMiles: Math.round(totalMiles * 100) / 100,
          totalTransports,
          averageRevenuePerTransport: totalTransports > 0 ? Math.round((totalRevenue / totalTransports) * 100) / 100 : 0,
          averageRevenuePerMile: totalMiles > 0 ? Math.round((totalRevenue / totalMiles) * 100) / 100 : 0,
          utilizationRate: totalTransports / 30, // Assuming 30 possible transports per month
          efficiencyScore: totalMiles > 0 ? Math.round((totalRevenue / totalMiles) * 100) / 100 : 0
        });
      }

      return performances.sort((a, b) => b.totalRevenue - a.totalRevenue);

    } catch (error) {
      console.error('[REVENUE_TRACKING_SERVICE] Error getting unit revenue performance:', error);
      throw error;
    }
  }
}

export default new RevenueTrackingService();
