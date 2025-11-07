import { PrismaClient } from '@prisma/client';

// Production database manager for single database setup
class ProductionDatabaseManager {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    });
  }

  // Health check for production
  async healthCheck(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
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

export const productionDatabaseManager = new ProductionDatabaseManager();
