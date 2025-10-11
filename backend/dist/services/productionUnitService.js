"use strict";
// Temporarily disabled due to missing production database schema
// This service will be implemented when production database is set up
Object.defineProperty(exports, "__esModule", { value: true });
exports.productionUnitService = exports.ProductionUnitService = void 0;
class ProductionUnitService {
    async getUnitsByAgency(agencyId) {
        // Temporarily disabled - return empty array
        console.log('ProductionUnitService.getUnitsByAgency called but disabled');
        return [];
    }
    async getAllUnits() {
        // Temporarily disabled - return empty array
        console.log('ProductionUnitService.getAllUnits called but disabled');
        return [];
    }
    async createUnit(unitData) {
        // Temporarily disabled
        throw new Error('ProductionUnitService is temporarily disabled');
    }
    async updateUnit(id, unitData) {
        // Temporarily disabled
        throw new Error('ProductionUnitService is temporarily disabled');
    }
    async deleteUnit(id) {
        // Temporarily disabled
        throw new Error('ProductionUnitService is temporarily disabled');
    }
    async updateUnitStatus(id, status) {
        // Temporarily disabled
        throw new Error('ProductionUnitService is temporarily disabled');
    }
    async getUnitStats() {
        // Temporarily disabled - return empty stats
        return {
            totalUnits: 0,
            availableUnits: 0,
            committedUnits: 0,
            outOfServiceUnits: 0,
            maintenanceUnits: 0
        };
    }
    async getUnitAnalytics() {
        // Temporarily disabled - return empty analytics
        return {
            totalUnits: 0,
            availableUnits: 0,
            committedUnits: 0,
            outOfServiceUnits: 0,
            maintenanceUnits: 0,
            statusDistribution: {},
            typeDistribution: {}
        };
    }
}
exports.ProductionUnitService = ProductionUnitService;
exports.productionUnitService = new ProductionUnitService();
//# sourceMappingURL=productionUnitService.js.map