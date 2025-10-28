import { PrismaClient } from '@prisma/client';
declare class DatabaseManager {
    private static instance;
    private prisma;
    private connectionRetries;
    private maxRetries;
    private retryDelay;
    private constructor();
    static getInstance(): DatabaseManager;
    getPrismaClient(): PrismaClient;
    healthCheck(): Promise<boolean>;
    private executeWithRetry;
    private delay;
    disconnect(): Promise<void>;
}
export declare const databaseManager: DatabaseManager;
export default databaseManager;
//# sourceMappingURL=databaseManager.d.ts.map