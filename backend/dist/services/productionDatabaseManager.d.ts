import { PrismaClient } from '@prisma/client';
declare class ProductionDatabaseManager {
    private prisma;
    constructor();
    healthCheck(): Promise<boolean>;
    getDatabase(): PrismaClient<import(".prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>;
    disconnect(): Promise<void>;
}
export declare const productionDatabaseManager: ProductionDatabaseManager;
export {};
//# sourceMappingURL=productionDatabaseManager.d.ts.map