import { PrismaClient } from '@prisma/client';

class DatabaseManager {
  private static instance: DatabaseManager;
  private prisma: PrismaClient;
  private connectionRetries = 0;
  private maxRetries = 5;
  private retryDelay = 2000; // 2 seconds

  private constructor() {
    this.prisma = new PrismaClient({
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

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  public getPrismaClient(): PrismaClient {
    return this.prisma;
  }

  // Backward compatibility methods for existing service calls
  public getCenterDB(): PrismaClient {
    return this.prisma;
  }

  public getEMSDB(): PrismaClient {
    return this.prisma;
  }

  public getHospitalDB(): PrismaClient {
    return this.prisma;
  }

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
    await this.prisma.$disconnect();
  }
}

export const databaseManager = DatabaseManager.getInstance();
export default databaseManager;
