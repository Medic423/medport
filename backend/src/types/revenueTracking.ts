// Revenue Tracking Types for MedPort Phase 4.4

import { TransportLevel, UnitStatus, RequestStatus, Priority } from '@prisma/client';

// Revenue Metrics Interface
export interface RevenueMetrics {
  entityId: string;
  entityType: 'unit' | 'agency';
  timeRange: {
    start: Date;
    end: Date;
  };
  totalRevenue: number;
  totalMiles: number;
  totalTransports: number;
  averageRevenuePerTransport: number;
  averageRevenuePerMile: number;
  revenueByLevel: Record<string, number>;
  revenueByFacility: Record<string, number>;
  lastUpdated: Date;
}

// Revenue Optimization Parameters Interface
export interface RevenueOptimizationParams {
  targetRevenuePerMile: number;
  targetTransportsPerPeriod: number;
  maxEmptyMiles: number;
  preferredTransportLevels: TransportLevel[];
  geographicConstraints?: {
    maxDistance: number;
    preferredAreas: string[];
    avoidAreas: string[];
  };
  timeConstraints?: {
    preferredTimeWindows: Array<{
      start: string; // HH:MM format
      end: string; // HH:MM format
      daysOfWeek: number[]; // 0-6, Sunday-Saturday
    }>;
    maxShiftExtension: number; // in hours
  };
  costConstraints?: {
    maxFuelCost: number;
    maxMaintenanceCost: number;
    maxLaborCost: number;
    targetProfitMargin: number;
  };
}

// Revenue Analysis Interface
export interface RevenueAnalysis {
  currentMetrics: RevenueMetrics;
  optimizationPotential: {
    revenueIncrease: number;
    efficiencyGains: number;
    utilizationImprovement: number;
    costReduction: number;
  };
  recommendations: string[];
  analysisDate: Date;
  confidence: number;
  historicalComparison?: {
    previousPeriod: RevenueMetrics;
    growthRate: number;
    trendDirection: 'INCREASING' | 'DECREASING' | 'STABLE';
  };
}

// Cost Analysis Interface
export interface CostAnalysis {
  entityId: string;
  entityType: 'unit' | 'agency';
  timeRange: {
    start: Date;
    end: Date;
  };
  totalCosts: number;
  costBreakdown: {
    fuelCosts: number;
    maintenanceCosts: number;
    laborCosts: number;
    insuranceCosts: number;
    administrativeCosts: number;
    equipmentCosts: number;
  };
  netProfit: number;
  profitMargin: number; // percentage
  costPerMile: number;
  costPerTransport: number;
  costTrends?: Array<{
    period: string;
    totalCosts: number;
    costBreakdown: any;
  }>;
}

// Profitability Metrics Interface
export interface ProfitabilityMetrics {
  entityId: string;
  entityType: 'unit' | 'agency';
  timeRange: {
    start: Date;
    end: Date;
  };
  grossProfit: number;
  netProfit: number;
  profitMargin: number; // percentage
  returnOnInvestment: number; // percentage
  breakEvenTransports: number;
  revenueEfficiency: number; // revenue per cost ratio
  lastUpdated: Date;
  profitabilityTrends?: Array<{
    period: string;
    profitMargin: number;
    returnOnInvestment: number;
    revenueEfficiency: number;
  }>;
}

// Revenue Trend Interface
export interface RevenueTrend {
  period: string;
  revenue: number;
  transports: number;
  miles: number;
  averageRevenuePerTransport: number;
  growthRate?: number;
  seasonalityFactor?: number;
}

// Agency Revenue Summary Interface
export interface AgencyRevenueSummary {
  agencyId: string;
  agencyName: string;
  totalRevenue: number;
  totalMiles: number;
  totalTransports: number;
  activeUnits: number;
  averageRevenuePerUnit: number;
  averageRevenuePerMile: number;
  performanceRanking?: number;
  growthRate?: number;
  marketShare?: number;
}

// Unit Revenue Performance Interface
export interface UnitRevenuePerformance {
  unitId: string;
  unitNumber: string;
  unitType: TransportLevel;
  totalRevenue: number;
  totalMiles: number;
  totalTransports: number;
  averageRevenuePerTransport: number;
  averageRevenuePerMile: number;
  utilizationRate: number; // percentage
  efficiencyScore: number;
  performanceRanking?: number;
  improvementPotential?: number;
}

// Revenue Forecast Interface
export interface RevenueForecast {
  entityId: string;
  entityType: 'unit' | 'agency';
  forecastPeriod: {
    start: Date;
    end: Date;
  };
  predictedRevenue: number;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  factors: Array<{
    name: string;
    impact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
    magnitude: number;
    description: string;
  }>;
  assumptions: string[];
  lastUpdated: Date;
}

// Revenue Optimization Strategy Interface
export interface RevenueOptimizationStrategy {
  strategyId: string;
  name: string;
  description: string;
  targetMetrics: {
    revenueIncrease: number;
    efficiencyImprovement: number;
    costReduction: number;
  };
  implementationSteps: Array<{
    step: number;
    action: string;
    estimatedImpact: number;
    timeline: string;
    resources: string[];
  }>;
  successMetrics: Array<{
    metric: string;
    target: number;
    current: number;
    unit: string;
  }>;
  riskAssessment: {
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    risks: string[];
    mitigationStrategies: string[];
  };
}

// Revenue Performance Benchmark Interface
export interface RevenuePerformanceBenchmark {
  benchmarkId: string;
  name: string;
  category: 'INDUSTRY' | 'REGIONAL' | 'COMPETITIVE' | 'HISTORICAL';
  metrics: {
    averageRevenuePerMile: number;
    averageRevenuePerTransport: number;
    utilizationRate: number;
    profitMargin: number;
    responseTime: number;
  };
  dataSource: string;
  lastUpdated: Date;
  confidence: number;
  sampleSize: number;
}

// Revenue Alert Interface
export interface RevenueAlert {
  alertId: string;
  entityId: string;
  entityType: 'unit' | 'agency';
  alertType: 'REVENUE_DROP' | 'COST_INCREASE' | 'UTILIZATION_DECLINE' | 'PROFIT_MARGIN_DROP' | 'PERFORMANCE_ANOMALY';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  currentValue: number;
  thresholdValue: number;
  deviation: number;
  triggeredAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  recommendations: string[];
}

// Revenue Report Interface
export interface RevenueReport {
  reportId: string;
  reportType: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUAL' | 'CUSTOM';
  entityId: string;
  entityType: 'unit' | 'agency';
  timeRange: {
    start: Date;
    end: Date;
  };
  generatedAt: Date;
  generatedBy: string;
  summary: {
    totalRevenue: number;
    totalCosts: number;
    netProfit: number;
    profitMargin: number;
    totalTransports: number;
    totalMiles: number;
  };
  details: {
    revenueMetrics: RevenueMetrics;
    costAnalysis: CostAnalysis;
    profitabilityMetrics: ProfitabilityMetrics;
    trends: RevenueTrend[];
    alerts: RevenueAlert[];
  };
  recommendations: string[];
  attachments?: Array<{
    name: string;
    type: 'PDF' | 'CSV' | 'EXCEL' | 'CHART';
    url: string;
  }>;
}

// Revenue Dashboard Configuration Interface
export interface RevenueDashboardConfig {
  entityId: string;
  entityType: 'unit' | 'agency';
  widgets: Array<{
    widgetId: string;
    type: 'REVENUE_CHART' | 'COST_BREAKDOWN' | 'PROFITABILITY_METRICS' | 'PERFORMANCE_COMPARISON' | 'TREND_ANALYSIS';
    position: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    configuration: {
      timeRange: string;
      chartType?: string;
      metrics?: string[];
      refreshInterval?: number;
    };
    isVisible: boolean;
  }>;
  defaultTimeRange: string;
  refreshInterval: number;
  lastUpdated: Date;
}
