import { PrismaClient } from '@prisma/client';

// Production database manager for single database setup
class ProductionDatabaseManager {
  private prisma: PrismaClient;

  constructor() {
    // Validate DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      const error = new Error('DATABASE_URL environment variable is not set. Cannot initialize Prisma client.');
      console.error('❌ ProductionDatabaseManager initialization failed:', error.message);
      throw error;
    }

    try {
      this.prisma = new PrismaClient({
        datasources: {
          db: {
            url: process.env.DATABASE_URL
          }
        },
        log: process.env.NODE_ENV === 'production' ? ['error'] : ['error', 'warn'],
        errorFormat: 'pretty',
      });
      console.log('✅ ProductionDatabaseManager: Prisma client initialized successfully');
    } catch (error) {
      console.error('❌ ProductionDatabaseManager: Failed to create Prisma client:', error);
      throw error;
    }
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
    if (this.prisma) {
      await this.prisma.$disconnect();
    }
  }
}

// Lazy initialization - only create instance when first accessed
let productionDatabaseManagerInstance: ProductionDatabaseManager | null = null;

export const productionDatabaseManager = {
  getInstance: (): ProductionDatabaseManager => {
    if (!productionDatabaseManagerInstance) {
      try {
        productionDatabaseManagerInstance = new ProductionDatabaseManager();
      } catch (error) {
        console.error('❌ Failed to initialize ProductionDatabaseManager:', error);
        throw error;
      }
    }
    return productionDatabaseManagerInstance;
  },
  
  healthCheck: async (): Promise<boolean> => {
    try {
      return productionDatabaseManager.getInstance().healthCheck();
    } catch (error) {
      console.error('❌ ProductionDatabaseManager healthCheck failed:', error);
      return false;
    }
  },
  
  getDatabase: () => {
    return productionDatabaseManager.getInstance().getDatabase();
  },
  
  disconnect: async (): Promise<void> => {
    if (productionDatabaseManagerInstance) {
      await productionDatabaseManagerInstance.disconnect();
      productionDatabaseManagerInstance = null;
    }
  }
};
