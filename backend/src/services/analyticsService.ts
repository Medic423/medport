import { databaseManager } from './databaseManager';
import { 
  RevenueMetrics, 
  CostAnalysis, 
  ProfitabilityMetrics,
  RevenueTrend,
  AgencyRevenueSummary,
  UnitRevenuePerformance
} from '../types/revenueTracking';
import { TransportLevel, UnitStatus, RequestStatus, Priority } from '@prisma/client';

export interface TransportEfficiencyMetrics {
  totalTransports: number;
  totalMiles: number;
  totalRevenue: number;
  averageResponseTime: number;
  averageTransportTime: number;
  utilizationRate: number;
  efficiencyScore: number;
  chainedTripRate: number;
  emptyMilesReduction: number;
}

export interface AgencyPerformanceMetrics {
  agencyId: string;
  agencyName: string;
  totalUnits: number;
  activeUnits: number;
  totalTransports: number;
  totalRevenue: number;
  averageResponseTime: number;
  utilizationRate: number;
  performanceScore: number;
  growthRate: number;
}

export interface CostAnalysisMetrics {
  totalCosts: number;
  fuelCosts: number;
  maintenanceCosts: number;
  laborCosts: number;
  insuranceCosts: number;
  administrativeCosts: number;
  costPerMile: number;
  costPerTransport: number;
  profitMargin: number;
}

export interface HistoricalDataAnalysis {
  timeRange: {
    start: Date;
    end: Date;
  };
  period: 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  data: Array<{
    period: string;
    transports: number;
    revenue: number;
    miles: number;
    costs: number;
    profit: number;
    utilization: number;
  }>;
  trends: {
    revenueGrowth: number;
    costTrend: number;
    utilizationTrend: number;
    efficiencyTrend: number;
  };
}

export interface AnalyticsSummary {
  overview: {
    totalTransports: number;
    totalRevenue: number;
    totalCosts: number;
    netProfit: number;
    activeUnits: number;
    averageResponseTime: number;
  };
  efficiency: TransportEfficiencyMetrics;
  agencyPerformance: AgencyPerformanceMetrics[];
  costAnalysis: CostAnalysisMetrics;
  historicalData: HistoricalDataAnalysis;
  recommendations: string[];
  lastUpdated: Date;
}

export class AnalyticsService {

  /**
   * Get comprehensive analytics summary for the entire system
   */
  async getAnalyticsSummary(timeRange: { start: Date; end: Date }): Promise<AnalyticsSummary> {
    try {
      console.log('[ANALYTICS_SERVICE] Getting analytics summary for time range:', timeRange);

      const [
        overview,
        efficiency,
        agencyPerformance,
        costAnalysis,
        historicalData
      ] = await Promise.all([
        this.getOverviewMetrics(timeRange),
        this.getTransportEfficiencyMetrics(timeRange),
        this.getAgencyPerformanceMetrics(timeRange),
        this.getCostAnalysisMetrics(timeRange),
        this.getHistoricalDataAnalysis(timeRange, 'MONTHLY')
      ]);

      const recommendations = this.generateRecommendations(efficiency, costAnalysis, historicalData);

      return {
        overview,
        efficiency,
        agencyPerformance,
        costAnalysis,
        historicalData,
        recommendations,
        lastUpdated: new Date()
      };

    } catch (error) {
      console.error('[ANALYTICS_SERVICE] Error getting analytics summary:', error);
      throw new Error('Failed to get analytics summary');
    }
  }

  /**
   * Get overview metrics for the entire system
   */
  private async getOverviewMetrics(timeRange: { start: Date; end: Date }) {
    // Get transport requests from Hospital DB
    const hospitalDB = databaseManager.getHospitalDB();
    const transports = await hospitalDB.transportRequest.count({
      where: {
        createdAt: { 
          gte: timeRange.start,
          lte: timeRange.end 
        }
      }
    });

    // Get active units from EMS DB
    const emsDB = databaseManager.getEMSDB();
    const activeUnits = await emsDB.unit.count({
      where: {
        isActive: true,
        currentStatus: 'AVAILABLE'
      }
    });

    // For demo purposes, calculate revenue and costs based on transport requests
    const transportRequests = await hospitalDB.transportRequest.findMany({
      where: {
        createdAt: { 
          gte: timeRange.start,
          lte: timeRange.end 
        }
      }
    });

    let totalRevenue = 0;
    let totalCosts = 0;
    let totalMiles = 0;

    for (const request of transportRequests) {
      const miles = this.calculateTransportMiles(request);
      const revenue = this.calculateTransportRevenue(request, miles);
      const costs = this.calculateTransportCosts(request, miles);
      
      totalRevenue += revenue;
      totalCosts += costs;
      totalMiles += miles;
    }

    const averageResponseTime = await this.calculateAverageResponseTime(timeRange);

    return {
      totalTransports: transports,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalCosts: Math.round(totalCosts * 100) / 100,
      netProfit: Math.round((totalRevenue - totalCosts) * 100) / 100,
      activeUnits,
      averageResponseTime
    };
  }

  /**
   * Get transport efficiency metrics
   */
  private async getTransportEfficiencyMetrics(timeRange: { start: Date; end: Date }): Promise<TransportEfficiencyMetrics> {
    // Get transport requests from Hospital DB
    const hospitalDB = databaseManager.getHospitalDB();
    const transportRequests = await hospitalDB.transportRequest.findMany({
      where: {
        createdAt: { 
          gte: timeRange.start,
          lte: timeRange.end 
        }
      }
    });

    let totalMiles = 0;
    let totalRevenue = 0;
    let totalTransportTime = 0;
    let chainedTrips = 0;

    for (const request of transportRequests) {
      const miles = this.calculateTransportMiles(request);
      const revenue = this.calculateTransportRevenue(request, miles);
      const transportTime = this.calculateTransportTime(request);
      
      totalMiles += miles;
      totalRevenue += revenue;
      totalTransportTime += transportTime;

      // Check if this is a chained trip (has chaining opportunities)
      if (request.chainingOpportunities) {
        chainedTrips++;
      }
    }

    const totalTransports = transportRequests.length;
    const averageResponseTime = await this.calculateAverageResponseTime(timeRange);
    const averageTransportTime = totalTransports > 0 ? totalTransportTime / totalTransports : 0;
    const utilizationRate = await this.calculateUtilizationRate(timeRange);
    const efficiencyScore = this.calculateEfficiencyScore(totalRevenue, totalMiles, totalTransports);
    const chainedTripRate = totalTransports > 0 ? (chainedTrips / totalTransports) * 100 : 0;
    const emptyMilesReduction = this.calculateEmptyMilesReduction(totalMiles, totalTransports);

    return {
      totalTransports,
      totalMiles: Math.round(totalMiles * 100) / 100,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      averageResponseTime,
      averageTransportTime: Math.round(averageTransportTime * 100) / 100,
      utilizationRate,
      efficiencyScore,
      chainedTripRate: Math.round(chainedTripRate * 100) / 100,
      emptyMilesReduction: Math.round(emptyMilesReduction * 100) / 100
    };
  }

  /**
   * Get agency performance metrics
   */
  private async getAgencyPerformanceMetrics(timeRange: { start: Date; end: Date }): Promise<AgencyPerformanceMetrics[]> {
    // Get EMS agencies from Center DB
    const centerDB = databaseManager.getCenterDB();
    const agencies = await centerDB.eMSAgency.findMany({
      where: { isActive: true }
    });

    // Get units from EMS DB
    const emsDB = databaseManager.getEMSDB();
    const units = await emsDB.unit.findMany({
      where: { isActive: true }
    });

    // Get transport requests from Hospital DB
    const hospitalDB = databaseManager.getHospitalDB();
    const transportRequests = await hospitalDB.transportRequest.findMany({
      where: {
        createdAt: { 
          gte: timeRange.start,
          lte: timeRange.end 
        }
      }
    });

    const agencyMetrics: AgencyPerformanceMetrics[] = [];

    for (const agency of agencies) {
      // Find units for this agency
      const agencyUnits = units.filter(unit => unit.agencyId === agency.id);
      
      // For demo purposes, calculate metrics based on available data
      const totalTransports = Math.floor(Math.random() * 50) + 10; // Demo data
      const totalRevenue = totalTransports * (100 + Math.random() * 50); // Demo data
      const totalResponseTime = totalTransports * (15 + Math.random() * 10); // Demo data

      const activeUnits = agencyUnits.filter(unit => unit.currentStatus === 'AVAILABLE').length;
      const averageResponseTime = totalTransports > 0 ? totalResponseTime / totalTransports : 0;
      const utilizationRate = await this.calculateAgencyUtilizationRate(agency.id, timeRange);
      const performanceScore = this.calculateAgencyPerformanceScore(totalRevenue, totalTransports, averageResponseTime, utilizationRate);
      const growthRate = await this.calculateAgencyGrowthRate(agency.id, timeRange);

      agencyMetrics.push({
        agencyId: agency.id,
        agencyName: agency.name,
        totalUnits: agencyUnits.length,
        activeUnits,
        totalTransports,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        averageResponseTime: Math.round(averageResponseTime * 100) / 100,
        utilizationRate,
        performanceScore,
        growthRate
      });
    }

    return agencyMetrics.sort((a, b) => b.performanceScore - a.performanceScore);
  }

  /**
   * Get cost analysis metrics
   */
  private async getCostAnalysisMetrics(timeRange: { start: Date; end: Date }): Promise<CostAnalysisMetrics> {
    // Get transport requests from Hospital DB
    const hospitalDB = databaseManager.getHospitalDB();
    const transportRequests = await hospitalDB.transportRequest.findMany({
      where: {
        createdAt: { 
          gte: timeRange.start,
          lte: timeRange.end 
        }
      }
    });

    let totalCosts = 0;
    let totalMiles = 0;
    let totalTransports = 0;

    for (const request of transportRequests) {
      const miles = this.calculateTransportMiles(request);
      const costs = this.calculateTransportCosts(request, miles);
      
      totalCosts += costs;
      totalMiles += miles;
      totalTransports++;
    }

    // Cost breakdown (demo implementation)
    const fuelCosts = totalCosts > 0 ? totalCosts * 0.35 : 0;
    const maintenanceCosts = totalCosts > 0 ? totalCosts * 0.25 : 0;
    const laborCosts = totalCosts > 0 ? totalCosts * 0.20 : 0;
    const insuranceCosts = totalCosts > 0 ? totalCosts * 0.15 : 0;
    const administrativeCosts = totalCosts > 0 ? totalCosts * 0.05 : 0;

    const costPerMile = totalMiles > 0 ? totalCosts / totalMiles : 0;
    const costPerTransport = totalTransports > 0 ? totalCosts / totalTransports : 0;

    // Calculate profit margin (demo - would use actual revenue data)
    let profitMargin = 0;
    if (totalCosts > 0) {
      const estimatedRevenue = totalCosts * 1.25; // 25% profit margin
      profitMargin = ((estimatedRevenue - totalCosts) / estimatedRevenue) * 100;
    }

    return {
      totalCosts: Math.round(totalCosts * 100) / 100,
      fuelCosts: Math.round(fuelCosts * 100) / 100,
      maintenanceCosts: Math.round(maintenanceCosts * 100) / 100,
      laborCosts: Math.round(laborCosts * 100) / 100,
      insuranceCosts: Math.round(insuranceCosts * 100) / 100,
      administrativeCosts: Math.round(administrativeCosts * 100) / 100,
      costPerMile: Math.round(costPerMile * 100) / 100,
      costPerTransport: Math.round(costPerTransport * 100) / 100,
      profitMargin: Math.round(profitMargin * 100) / 100
    };
  }

  /**
   * Get historical data analysis
   */
  private async getHistoricalDataAnalysis(
    timeRange: { start: Date; end: Date }, 
    period: 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
  ): Promise<HistoricalDataAnalysis> {
    const data: Array<{
      period: string;
      transports: number;
      revenue: number;
      miles: number;
      costs: number;
      profit: number;
      utilization: number;
    }> = [];

    // Generate historical data based on period
    if (period === 'MONTHLY') {
      const months = this.getMonthsBetween(timeRange.start, timeRange.end);
      for (const month of months) {
        const monthData = await this.getMonthlyData(month);
        data.push(monthData);
      }
    }

    const trends = this.calculateTrends(data);

    return {
      timeRange,
      period,
      data,
      trends
    };
  }

  /**
   * Generate recommendations based on analytics data
   */
  private generateRecommendations(
    efficiency: TransportEfficiencyMetrics,
    costAnalysis: CostAnalysisMetrics,
    historicalData: HistoricalDataAnalysis
  ): string[] {
    const recommendations: string[] = [];

    if (efficiency.chainedTripRate < 30) {
      recommendations.push('Increase chained trip opportunities by 15% to improve efficiency');
    }

    if (efficiency.utilizationRate < 70) {
      recommendations.push('Optimize unit scheduling to increase utilization rate');
    }

    if (costAnalysis.costPerMile > 2.5) {
      recommendations.push('Review fuel and maintenance costs to reduce per-mile expenses');
    }

    if (efficiency.emptyMilesReduction < 20) {
      recommendations.push('Implement better route planning to reduce empty miles');
    }

    if (efficiency.averageResponseTime > 25) {
      recommendations.push('Optimize unit placement and dispatch for faster response times');
    }

    return recommendations;
  }

  // Helper methods for calculations
  private calculateTransportMiles(transportRequest: any): number {
    // Demo implementation - would use actual distance matrix
    return 15 + Math.random() * 35;
  }

  private calculateTransportRevenue(transportRequest: any, miles: number): number {
    // Demo implementation - would use actual pricing
    const baseRate = transportRequest.transportLevel === 'CCT' ? 150 : 100;
    const mileageRate = transportRequest.transportLevel === 'CCT' ? 3.5 : 2.5;
    return baseRate + (miles * mileageRate);
  }

  private calculateTransportCosts(transportRequest: any, miles: number): number {
    // Demo implementation - would use actual cost data
    const fuelCost = miles * 0.85;
    const laborCost = transportRequest.transportLevel === 'CCT' ? 45 : 35;
    const maintenanceCost = miles * 0.15;
    return fuelCost + laborCost + maintenanceCost;
  }

  private calculateTransportTime(request: any): number {
    // Demo implementation - would use actual transport time data
    return 45 + Math.random() * 30; // 45-75 minutes
  }

  private async calculateAverageResponseTime(timeRange: { start: Date; end: Date }): Promise<number> {
    // Demo implementation
    return 18.5 + Math.random() * 10;
  }

  private async calculateUtilizationRate(timeRange: { start: Date; end: Date }): Promise<number> {
    // Demo implementation
    return 75 + Math.random() * 20;
  }

  private calculateEfficiencyScore(revenue: number, miles: number, transports: number): number {
    if (miles === 0 || transports === 0) return 0;
    const revenuePerMile = revenue / miles;
    const revenuePerTransport = revenue / transports;
    return Math.min(100, (revenuePerMile * 10) + (revenuePerTransport / 10));
  }

  private calculateEmptyMilesReduction(totalMiles: number, totalTransports: number): number {
    // Demo implementation
    return 15 + Math.random() * 25;
  }

  private calculateResponseTime(assignment: any): number {
    // Demo implementation
    return 15 + Math.random() * 20;
  }

  private async calculateAgencyUtilizationRate(agencyId: string, timeRange: { start: Date; end: Date }): Promise<number> {
    // Demo implementation
    return 70 + Math.random() * 25;
  }

  private calculateAgencyPerformanceScore(revenue: number, transports: number, responseTime: number, utilization: number): number {
    const revenueScore = Math.min(100, revenue / 1000);
    const transportScore = Math.min(100, transports / 10);
    const responseScore = Math.max(0, 100 - (responseTime * 2));
    const utilizationScore = utilization;
    
    return (revenueScore * 0.3) + (transportScore * 0.25) + (responseScore * 0.25) + (utilizationScore * 0.2);
  }

  private async calculateAgencyGrowthRate(agencyId: string, timeRange: { start: Date; end: Date }): Promise<number> {
    // Demo implementation
    return -5 + Math.random() * 20;
  }

  private getMonthsBetween(start: Date, end: Date): Date[] {
    const months: Date[] = [];
    const current = new Date(start);
    
    while (current <= end) {
      months.push(new Date(current));
      current.setMonth(current.getMonth() + 1);
    }
    
    return months;
  }

  private async getMonthlyData(month: Date): Promise<{
    period: string;
    transports: number;
    revenue: number;
    miles: number;
    costs: number;
    profit: number;
    utilization: number;
  }> {
    // Demo implementation
    const transports = Math.floor(Math.random() * 50) + 20;
    const revenue = transports * (100 + Math.random() * 50);
    const miles = transports * (15 + Math.random() * 25);
    const costs = revenue * (0.6 + Math.random() * 0.2);
    const profit = revenue - costs;
    const utilization = 70 + Math.random() * 25;

    return {
      period: month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      transports,
      revenue: Math.round(revenue * 100) / 100,
      miles: Math.round(miles * 100) / 100,
      costs: Math.round(costs * 100) / 100,
      profit: Math.round(profit * 100) / 100,
      utilization: Math.round(utilization * 100) / 100
    };
  }

  private calculateTrends(data: any[]): {
    revenueGrowth: number;
    costTrend: number;
    utilizationTrend: number;
    efficiencyTrend: number;
  } {
    if (data.length < 2) {
      return {
        revenueGrowth: 0,
        costTrend: 0,
        utilizationTrend: 0,
        efficiencyTrend: 0
      };
    }

    const first = data[0];
    const last = data[data.length - 1];

    const revenueGrowth = first.revenue > 0 ? ((last.revenue - first.revenue) / first.revenue) * 100 : 0;
    const costTrend = first.costs > 0 ? ((last.costs - first.costs) / first.costs) * 100 : 0;
    const utilizationTrend = first.utilization > 0 ? ((last.utilization - first.utilization) / first.utilization) * 100 : 0;
    const efficiencyTrend = first.profit > 0 ? ((last.profit - first.profit) / first.profit) * 100 : 0;

    return {
      revenueGrowth: Math.round(revenueGrowth * 100) / 100,
      costTrend: Math.round(costTrend * 100) / 100,
      utilizationTrend: Math.round(utilizationTrend * 100) / 100,
      efficiencyTrend: Math.round(efficiencyTrend * 100) / 100
    };
  }

  /**
   * Export analytics data to CSV format
   */
  async exportAnalyticsToCSV(timeRange: { start: Date; end: Date }): Promise<string> {
    try {
      const analytics = await this.getAnalyticsSummary(timeRange);
      
      let csv = 'Metric,Value,Unit\n';
      csv += `Total Transports,${analytics.overview.totalTransports},count\n`;
      csv += `Total Revenue,${analytics.overview.totalRevenue},USD\n`;
      csv += `Total Costs,${analytics.overview.totalCosts},USD\n`;
      csv += `Net Profit,${analytics.overview.netProfit},USD\n`;
      csv += `Active Units,${analytics.overview.activeUnits},count\n`;
      csv += `Average Response Time,${analytics.overview.averageResponseTime},minutes\n`;
      csv += `Utilization Rate,${analytics.efficiency.utilizationRate},%\n`;
      csv += `Efficiency Score,${analytics.efficiency.efficiencyScore},score\n`;
      csv += `Chained Trip Rate,${analytics.efficiency.chainedTripRate},%\n`;
      csv += `Empty Miles Reduction,${analytics.efficiency.emptyMilesReduction},%\n`;
      csv += `Cost Per Mile,${analytics.costAnalysis.costPerMile},USD\n`;
      csv += `Profit Margin,${analytics.costAnalysis.profitMargin},%\n`;
      
      return csv;
    } catch (error) {
      console.error('[ANALYTICS_SERVICE] Error exporting to CSV:', error);
      throw new Error('Failed to export analytics to CSV');
    }
  }
}

export default AnalyticsService;
