import revenueTrackingService from './revenueTrackingService';

export interface RevenueOpportunity {
  id: string;
  type: 'ROUTE_OPTIMIZATION' | 'CHAINED_TRIPS' | 'CAPACITY_UTILIZATION' | 'EMPTY_MILES_REDUCTION';
  title: string;
  description: string;
  currentRevenue: number;
  potentialRevenue: number;
  revenueIncrease: number;
  costSavings: number;
  roi: number;
  implementationDifficulty: 'LOW' | 'MEDIUM' | 'HIGH';
  estimatedTimeToImplement: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'IMPLEMENTED' | 'REJECTED';
  createdAt: string;
  details: {
    routes?: string[];
    facilities?: string[];
    estimatedMilesSaved?: number;
    estimatedTimeSaved?: number;
  };
}

export class RevenueOpportunitiesService {
  
  /**
   * Generate comprehensive revenue opportunities for an agency
   */
  async generateRevenueOpportunities(agencyId: string): Promise<RevenueOpportunity[]> {
    try {
      console.log('[REVENUE_OPPORTUNITIES_SERVICE] Generating opportunities for agency:', agencyId);
      
      // Get agency's current performance metrics
      const timeRange = {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        end: new Date()
      };
      
      const revenueMetrics = await revenueTrackingService.calculateRevenueMetrics(agencyId, 'agency', timeRange);
      const costAnalysis = await revenueTrackingService.calculateCostAnalysis(agencyId, 'agency', timeRange);
      
      // Generate opportunities based on current performance
      const opportunities: RevenueOpportunity[] = [];
      
      // Route Optimization Opportunity
      if (revenueMetrics.totalMiles > 1000) {
        const estimatedMilesSaved = revenueMetrics.totalMiles * 0.15; // 15% improvement potential
        const costPerMile = costAnalysis.totalCosts / revenueMetrics.totalMiles;
        const revenueIncrease = estimatedMilesSaved * revenueMetrics.averageRevenuePerMile;
        const costSavings = estimatedMilesSaved * costPerMile;
        
        opportunities.push({
          id: `opp-route-${Date.now()}`,
          type: 'ROUTE_OPTIMIZATION',
          title: 'Advanced Route Optimization',
          description: 'Implement AI-powered route optimization to reduce empty miles and increase efficiency. This will optimize unit deployment and reduce fuel costs while improving response times.',
          currentRevenue: revenueMetrics.totalRevenue,
          potentialRevenue: revenueMetrics.totalRevenue + revenueIncrease,
          revenueIncrease: Math.round(revenueIncrease * 100) / 100,
          costSavings: Math.round(costSavings * 100) / 100,
          roi: Math.round(((revenueIncrease + costSavings) / 5000) * 100), // Assuming $5k implementation cost
          implementationDifficulty: 'MEDIUM',
          estimatedTimeToImplement: '4-6 weeks',
          status: 'PENDING',
          createdAt: new Date().toISOString(),
          details: {
            estimatedMilesSaved: Math.round(estimatedMilesSaved * 100) / 100,
            estimatedTimeSaved: Math.round(estimatedMilesSaved / 45 * 60), // Assuming 45 mph average
            routes: ['Primary Service Area', 'Secondary Routes', 'Emergency Response Corridors']
          }
        });
      }
      
      // Chained Trips Opportunity
      if (revenueMetrics.totalTransports > 50) {
        const chainedTripPotential = revenueMetrics.totalTransports * 0.25; // 25% of trips could be chained
        const revenueIncrease = chainedTripPotential * revenueMetrics.averageRevenuePerTransport * 0.3; // 30% additional revenue per chained trip
        const costSavings = chainedTripPotential * 15; // $15 savings per chained trip
        
        opportunities.push({
          id: `opp-chained-${Date.now()}`,
          type: 'CHAINED_TRIPS',
          title: 'Chained Trip Coordination',
          description: 'Coordinate multiple transports in sequence to maximize unit utilization and reduce empty miles between assignments. This will increase revenue per unit while reducing operational costs.',
          currentRevenue: revenueMetrics.totalRevenue,
          potentialRevenue: revenueMetrics.totalRevenue + revenueIncrease,
          revenueIncrease: Math.round(revenueIncrease * 100) / 100,
          costSavings: Math.round(costSavings * 100) / 100,
          roi: Math.round(((revenueIncrease + costSavings) / 2000) * 100), // Assuming $2k implementation cost
          implementationDifficulty: 'LOW',
          estimatedTimeToImplement: '2-3 weeks',
          status: 'PENDING',
          createdAt: new Date().toISOString(),
          details: {
            estimatedMilesSaved: Math.round(chainedTripPotential * 8), // Average 8 miles saved per chained trip
            estimatedTimeSaved: Math.round(chainedTripPotential * 20), // 20 minutes saved per chained trip
            facilities: ['Main Hospital', 'Urgent Care Centers', 'Rehabilitation Facilities']
          }
        });
      }
      
      // Capacity Utilization Opportunity
      if (revenueMetrics.averageRevenuePerTransport < 200) {
        const utilizationImprovement = 0.2; // 20% improvement potential
        const revenueIncrease = revenueMetrics.totalRevenue * utilizationImprovement;
        const costSavings = costAnalysis.totalCosts * 0.1; // 10% cost reduction
        
        opportunities.push({
          id: `opp-capacity-${Date.now()}`,
          type: 'CAPACITY_UTILIZATION',
          title: 'Enhanced Capacity Utilization',
          description: 'Improve unit utilization through better scheduling, demand forecasting, and dynamic pricing strategies. This will increase revenue per transport while maintaining service quality.',
          currentRevenue: revenueMetrics.totalRevenue,
          potentialRevenue: revenueMetrics.totalRevenue + revenueIncrease,
          revenueIncrease: Math.round(revenueIncrease * 100) / 100,
          costSavings: Math.round(costSavings * 100) / 100,
          roi: Math.round(((revenueIncrease + costSavings) / 3000) * 100), // Assuming $3k implementation cost
          implementationDifficulty: 'MEDIUM',
          estimatedTimeToImplement: '3-4 weeks',
          status: 'PENDING',
          createdAt: new Date().toISOString(),
          details: {
            estimatedMilesSaved: Math.round(revenueMetrics.totalMiles * 0.1), // 10% mileage optimization
            estimatedTimeSaved: Math.round(revenueMetrics.totalTransports * 15), // 15 minutes saved per transport
            facilities: ['All Service Areas', 'High-Demand Zones']
          }
        });
      }
      
      // Empty Miles Reduction Opportunity
      if (revenueMetrics.totalMiles > 800) {
        const emptyMilesReduction = revenueMetrics.totalMiles * 0.2; // 20% empty miles reduction
        const costSavings = emptyMilesReduction * (costAnalysis.costPerMile * 0.7); // 70% of cost per mile (empty miles cost less)
        const revenueIncrease = emptyMilesReduction * revenueMetrics.averageRevenuePerMile * 0.5; // 50% of revenue potential for those miles
        
        opportunities.push({
          id: `opp-empty-${Date.now()}`,
          type: 'EMPTY_MILES_REDUCTION',
          title: 'Empty Miles Reduction Strategy',
          description: 'Implement strategies to reduce empty miles through better unit positioning, backhaul opportunities, and strategic partnerships with other agencies.',
          currentRevenue: revenueMetrics.totalRevenue,
          potentialRevenue: revenueMetrics.totalRevenue + revenueIncrease,
          revenueIncrease: Math.round(revenueIncrease * 100) / 100,
          costSavings: Math.round(costSavings * 100) / 100,
          roi: Math.round(((revenueIncrease + costSavings) / 4000) * 100), // Assuming $4k implementation cost
          implementationDifficulty: 'HIGH',
          estimatedTimeToImplement: '6-8 weeks',
          status: 'PENDING',
          createdAt: new Date().toISOString(),
          details: {
            estimatedMilesSaved: Math.round(emptyMilesReduction * 100) / 100,
            estimatedTimeSaved: Math.round(emptyMilesReduction / 50 * 60), // Assuming 50 mph average for empty miles
            routes: ['Return Routes', 'Positioning Routes', 'Partnership Corridors']
          }
        });
      }
      
      // Add a general optimization opportunity if we have few specific ones
      if (opportunities.length < 2) {
        opportunities.push({
          id: `opp-general-${Date.now()}`,
          type: 'CAPACITY_UTILIZATION',
          title: 'General Revenue Optimization',
          description: 'Implement comprehensive revenue optimization strategies including pricing optimization, service area expansion, and operational efficiency improvements.',
          currentRevenue: revenueMetrics.totalRevenue,
          potentialRevenue: revenueMetrics.totalRevenue * 1.15, // 15% improvement
          revenueIncrease: Math.round(revenueMetrics.totalRevenue * 0.15 * 100) / 100,
          costSavings: Math.round(costAnalysis.totalCosts * 0.08 * 100) / 100, // 8% cost reduction
          roi: Math.round(((revenueMetrics.totalRevenue * 0.15 + costAnalysis.totalCosts * 0.08) / 2500) * 100), // Assuming $2.5k implementation cost
          implementationDifficulty: 'MEDIUM',
          estimatedTimeToImplement: '4-5 weeks',
          status: 'PENDING',
          createdAt: new Date().toISOString(),
          details: {
            estimatedMilesSaved: Math.round(revenueMetrics.totalMiles * 0.12), // 12% improvement
            estimatedTimeSaved: Math.round(revenueMetrics.totalTransports * 12), // 12 minutes saved per transport
            facilities: ['Primary Service Area', 'Expansion Zones']
          }
        });
      }
      
      return opportunities;
      
    } catch (error) {
      console.error('[REVENUE_OPPORTUNITIES_SERVICE] Error generating opportunities:', error);
      throw error;
    }
  }
  
  /**
   * Get revenue opportunities with filtering
   */
  async getRevenueOpportunities(
    agencyId: string,
    filters: {
      type?: string;
      status?: string;
      minROI?: number;
      maxDifficulty?: string;
    } = {}
  ): Promise<RevenueOpportunity[]> {
    try {
      console.log('[REVENUE_OPPORTUNITIES_SERVICE] Getting opportunities with filters:', filters);
      
      let opportunities = await this.generateRevenueOpportunities(agencyId);
      
      // Apply filters
      if (filters.type && filters.type !== 'ALL') {
        opportunities = opportunities.filter(opp => opp.type === filters.type);
      }
      
      if (filters.status && filters.status !== 'ALL') {
        opportunities = opportunities.filter(opp => opp.status === filters.status);
      }
      
      if (filters.minROI) {
        opportunities = opportunities.filter(opp => opp.roi >= filters.minROI!);
      }
      
      if (filters.maxDifficulty && filters.maxDifficulty !== 'ALL') {
        const difficultyOrder = { 'LOW': 1, 'MEDIUM': 2, 'HIGH': 3 };
        const maxDifficultyLevel = difficultyOrder[filters.maxDifficulty as keyof typeof difficultyOrder];
        opportunities = opportunities.filter(opp => 
          difficultyOrder[opp.implementationDifficulty] <= maxDifficultyLevel
        );
      }
      
      return opportunities;
      
    } catch (error) {
      console.error('[REVENUE_OPPORTUNITIES_SERVICE] Error getting opportunities:', error);
      throw error;
    }
  }
  
  /**
   * Implement a revenue opportunity
   */
  async implementOpportunity(opportunityId: string, agencyId: string): Promise<boolean> {
    try {
      console.log('[REVENUE_OPPORTUNITIES_SERVICE] Implementing opportunity:', opportunityId);
      
      // In a real implementation, this would:
      // 1. Update the opportunity status to IN_PROGRESS
      // 2. Create implementation tasks
      // 3. Notify relevant stakeholders
      // 4. Track implementation progress
      
      // For demo purposes, just return success
      return true;
      
    } catch (error) {
      console.error('[REVENUE_OPPORTUNITIES_SERVICE] Error implementing opportunity:', error);
      throw error;
    }
  }
  
  /**
   * Reject a revenue opportunity
   */
  async rejectOpportunity(opportunityId: string, agencyId: string, reason: string): Promise<boolean> {
    try {
      console.log('[REVENUE_OPPORTUNITIES_SERVICE] Rejecting opportunity:', opportunityId, 'Reason:', reason);
      
      // In a real implementation, this would:
      // 1. Update the opportunity status to REJECTED
      // 2. Store the rejection reason
      // 3. Log the decision for future reference
      // 4. Potentially generate alternative opportunities
      
      // For demo purposes, just return success
      return true;
      
    } catch (error) {
      console.error('[REVENUE_OPPORTUNITIES_SERVICE] Error rejecting opportunity:', error);
      throw error;
    }
  }
  
  /**
   * Get demo revenue opportunities for testing
   */
  getDemoRevenueOpportunities(): RevenueOpportunity[] {
    return [
      {
        id: 'demo-opp-1',
        type: 'ROUTE_OPTIMIZATION',
        title: 'AI-Powered Route Optimization',
        description: 'Implement machine learning algorithms to optimize routes in real-time, reducing empty miles by 15% and improving response times by 20%. This will significantly increase revenue per mile while reducing operational costs.',
        currentRevenue: 45000,
        potentialRevenue: 51750,
        revenueIncrease: 6750,
        costSavings: 3200,
        roi: 199,
        implementationDifficulty: 'MEDIUM',
        estimatedTimeToImplement: '4-6 weeks',
        status: 'PENDING',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        details: {
          routes: ['Primary Service Area', 'Emergency Response Corridors', 'Secondary Routes'],
          facilities: ['Main Hospital', 'Urgent Care Centers'],
          estimatedMilesSaved: 450,
          estimatedTimeSaved: 600
        }
      },
      {
        id: 'demo-opp-2',
        type: 'CHAINED_TRIPS',
        title: 'Strategic Trip Chaining',
        description: 'Coordinate multiple transports in sequence to maximize unit utilization. This will reduce empty miles between assignments and increase revenue per unit by 25% while maintaining service quality.',
        currentRevenue: 45000,
        potentialRevenue: 56250,
        revenueIncrease: 11250,
        costSavings: 1800,
        roi: 652,
        implementationDifficulty: 'LOW',
        estimatedTimeToImplement: '2-3 weeks',
        status: 'PENDING',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        details: {
          routes: ['Hospital Transfer Routes', 'Rehabilitation Circuits'],
          facilities: ['Main Hospital', 'Rehabilitation Center', 'Specialty Clinics'],
          estimatedMilesSaved: 280,
          estimatedTimeSaved: 420
        }
      },
      {
        id: 'demo-opp-3',
        type: 'CAPACITY_UTILIZATION',
        title: 'Dynamic Pricing Strategy',
        description: 'Implement demand-based pricing to optimize revenue during peak hours and encourage off-peak utilization. This will increase average revenue per transport by 18% while improving overall capacity utilization.',
        currentRevenue: 45000,
        potentialRevenue: 53100,
        revenueIncrease: 8100,
        costSavings: 2400,
        roi: 420,
        implementationDifficulty: 'MEDIUM',
        estimatedTimeToImplement: '3-4 weeks',
        status: 'PENDING',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        details: {
          routes: ['Peak Hour Corridors', 'High-Demand Zones'],
          facilities: ['All Service Areas'],
          estimatedMilesSaved: 320,
          estimatedTimeSaved: 480
        }
      },
      {
        id: 'demo-opp-4',
        type: 'EMPTY_MILES_REDUCTION',
        title: 'Strategic Unit Positioning',
        description: 'Implement predictive positioning of units based on historical demand patterns and real-time data. This will reduce empty miles by 22% and improve response times by 15%.',
        currentRevenue: 45000,
        potentialRevenue: 54900,
        revenueIncrease: 9900,
        costSavings: 4100,
        roi: 350,
        implementationDifficulty: 'HIGH',
        estimatedTimeToImplement: '6-8 weeks',
        status: 'PENDING',
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
        details: {
          routes: ['Strategic Positioning Zones', 'Demand Hotspots'],
          facilities: ['Main Hospital', 'Emergency Centers'],
          estimatedMilesSaved: 520,
          estimatedTimeSaved: 780
        }
      },
      {
        id: 'demo-opp-5',
        type: 'ROUTE_OPTIMIZATION',
        title: 'Real-Time Traffic Integration',
        description: 'Integrate real-time traffic data with route planning to avoid congestion and optimize travel times. This will improve efficiency by 12% and increase customer satisfaction.',
        currentRevenue: 45000,
        potentialRevenue: 50400,
        revenueIncrease: 5400,
        costSavings: 1600,
        roi: 175,
        implementationDifficulty: 'LOW',
        estimatedTimeToImplement: '2-3 weeks',
        status: 'IN_PROGRESS',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        details: {
          routes: ['Urban Routes', 'Highway Corridors'],
          facilities: ['City Hospitals', 'Suburban Centers'],
          estimatedMilesSaved: 180,
          estimatedTimeSaved: 360
        }
      }
    ];
  }
}

export default new RevenueOpportunitiesService();
