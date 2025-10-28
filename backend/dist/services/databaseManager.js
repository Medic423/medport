"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseManager = void 0;
const client_1 = require("@prisma/client");
class DatabaseManager {
    constructor() {
        this.connectionRetries = 0;
        this.maxRetries = 5;
        this.retryDelay = 2000; // 2 seconds
        this.prisma = new client_1.PrismaClient({
            datasources: {
                db: {
                    url: process.env.DATABASE_URL
                }
            },
            // Add connection configuration for Render PostgreSQL
            log: process.env.NODE_ENV === 'production' ? ['error'] : ['error', 'warn'],
            errorFormat: 'pretty',
        });
    }
    static getInstance() {
        if (!DatabaseManager.instance) {
            DatabaseManager.instance = new DatabaseManager();
        }
        return DatabaseManager.instance;
    }
    getPrismaClient() {
        return this.prisma;
    }
    // Backward compatibility methods removed - all services now use getPrismaClient()
    async healthCheck() {
        return await this.executeWithRetry(async () => {
            await this.prisma.$queryRaw `SELECT 1`;
            return true;
        });
    }
    async executeWithRetry(operation) {
        try {
            const result = await operation();
            this.connectionRetries = 0; // Reset retry counter on success
            return result;
        }
        catch (error) {
            console.error(`Database operation failed (attempt ${this.connectionRetries + 1}/${this.maxRetries}):`, error);
            if (this.connectionRetries < this.maxRetries) {
                this.connectionRetries++;
                console.log(`Retrying in ${this.retryDelay}ms...`);
                await this.delay(this.retryDelay);
                // Exponential backoff
                this.retryDelay = Math.min(this.retryDelay * 1.5, 10000);
                return await this.executeWithRetry(operation);
            }
            else {
                console.error('Max retries reached, giving up');
                throw error;
            }
        }
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    async disconnect() {
        await this.prisma.$disconnect();
    }
}
exports.databaseManager = DatabaseManager.getInstance();
exports.default = exports.databaseManager;
//# sourceMappingURL=databaseManager.js.map