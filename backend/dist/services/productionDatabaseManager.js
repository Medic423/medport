"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productionDatabaseManager = void 0;
const client_1 = require("@prisma/client");
// Production database manager for single database setup
class ProductionDatabaseManager {
    constructor() {
        this.prisma = new client_1.PrismaClient({
            datasources: {
                db: {
                    url: process.env.DATABASE_URL
                }
            }
        });
    }
    // Health check for production
    async healthCheck() {
        try {
            await this.prisma.$queryRaw `SELECT 1`;
            return true;
        }
        catch (error) {
            console.error('Production database health check failed:', error);
            return false;
        }
    }
    // Get the single database client
    getDatabase() {
        return this.prisma;
    }
    // Disconnect
    async disconnect() {
        await this.prisma.$disconnect();
    }
}
exports.productionDatabaseManager = new ProductionDatabaseManager();
//# sourceMappingURL=productionDatabaseManager.js.map