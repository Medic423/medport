import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables before initializing database
// Load .env first, then .env.local (which will override .env values)
dotenv.config();
dotenv.config({ path: '.env.local', override: true });

class DatabaseManager {
  private static instance: DatabaseManager;
  private prisma: PrismaClient;
  private connectionRetries = 0;
  private maxRetries = 5;
  private retryDelay = 2000; // 2 seconds

  private constructor() {
    // Validate DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      const error = new Error('DATABASE_URL environment variable is not set. Cannot initialize Prisma client.');
      console.error('❌ DatabaseManager initialization failed:', error.message);
      throw error;
    }

    try {
      this.prisma = new PrismaClient({
        datasources: {
          db: {
            url: process.env.DATABASE_URL
          }
        },
        // Add connection configuration for Azure PostgreSQL
        log: process.env.NODE_ENV === 'production' ? ['error'] : ['error', 'warn'],
        errorFormat: 'pretty',
      });
      console.log('✅ DatabaseManager: Prisma client initialized successfully');
    } catch (error) {
      console.error('❌ DatabaseManager: Failed to create Prisma client:', error);
      throw error;
    }
  }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  public getPrismaClient(): PrismaClient {
    if (!this.prisma) {
      const error = new Error('Prisma client is not initialized. DATABASE_URL may be missing or Prisma client generation failed.');
      console.error('❌ DatabaseManager.getPrismaClient() failed:', error.message);
      throw error;
    }
    return this.prisma;
  }

  // Backward compatibility methods removed - all services now use getPrismaClient()

  public async healthCheck(): Promise<boolean> {
    return await this.executeWithRetry(async () => {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    });
  }

  private async executeWithRetry<T>(operation: () => Promise<T>): Promise<T> {
    try {
      const result = await operation();
      this.connectionRetries = 0; // Reset retry counter on success
      return result;
    } catch (error) {
      console.error(`Database operation failed (attempt ${this.connectionRetries + 1}/${this.maxRetries}):`, error);
      
      if (this.connectionRetries < this.maxRetries) {
        this.connectionRetries++;
        console.log(`Retrying in ${this.retryDelay}ms...`);
        await this.delay(this.retryDelay);
        
        // Exponential backoff
        this.retryDelay = Math.min(this.retryDelay * 1.5, 10000);
        
        return await this.executeWithRetry(operation);
      } else {
        console.error('Max retries reached, giving up');
        throw error;
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public async disconnect(): Promise<void> {
    if (this.prisma) {
      await this.prisma.$disconnect();
    }
  }
}

// Lazy initialization - only create instance when first accessed
let databaseManagerInstance: DatabaseManager | null = null;

export const databaseManager = {
  getInstance: (): DatabaseManager => {
    if (!databaseManagerInstance) {
      databaseManagerInstance = DatabaseManager.getInstance();
    }
    return databaseManagerInstance;
  },
  
  getPrismaClient: () => {
    return databaseManager.getInstance().getPrismaClient();
  },
  
  healthCheck: async (): Promise<boolean> => {
    return databaseManager.getInstance().healthCheck();
  },
  
  disconnect: async (): Promise<void> => {
    if (databaseManagerInstance) {
      await databaseManagerInstance.disconnect();
      databaseManagerInstance = null;
    }
  }
};

export default databaseManager;
