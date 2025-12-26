-- AlterTable
ALTER TABLE "center_users" ADD COLUMN "deletedAt" TIMESTAMP(3),
ADD COLUMN "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "healthcare_users" ADD COLUMN "deletedAt" TIMESTAMP(3),
ADD COLUMN "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable: Add deletion fields to ems_users (only if table exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ems_users') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'ems_users' AND column_name = 'deletedAt') THEN
            ALTER TABLE "ems_users" ADD COLUMN "deletedAt" TIMESTAMP(3);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'ems_users' AND column_name = 'isDeleted') THEN
            ALTER TABLE "ems_users" ADD COLUMN "isDeleted" BOOLEAN NOT NULL DEFAULT false;
        END IF;
    END IF;
END $$;

-- CreateIndex
CREATE INDEX "center_users_isDeleted_idx" ON "center_users"("isDeleted");

-- CreateIndex
CREATE INDEX "healthcare_users_isDeleted_idx" ON "healthcare_users"("isDeleted");

-- CreateIndex: Add index for ems_users (only if table exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ems_users') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'ems_users_isDeleted_idx') THEN
            CREATE INDEX "ems_users_isDeleted_idx" ON "ems_users"("isDeleted");
        END IF;
    END IF;
END $$;

