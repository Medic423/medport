-- Migration: Add missing user fields to healthcare_users and create ems_users table
-- Safe to run multiple times (uses IF NOT EXISTS checks)

-- Add missing columns to healthcare_users (only if they don't exist)
DO $$ 
BEGIN
    -- Add isSubUser column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'healthcare_users' 
        AND column_name = 'isSubUser'
    ) THEN
        ALTER TABLE "healthcare_users" ADD COLUMN "isSubUser" BOOLEAN NOT NULL DEFAULT false;
    END IF;

    -- Add parentUserId column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'healthcare_users' 
        AND column_name = 'parentUserId'
    ) THEN
        ALTER TABLE "healthcare_users" ADD COLUMN "parentUserId" TEXT;
    END IF;

    -- Add mustChangePassword column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'healthcare_users' 
        AND column_name = 'mustChangePassword'
    ) THEN
        ALTER TABLE "healthcare_users" ADD COLUMN "mustChangePassword" BOOLEAN NOT NULL DEFAULT false;
    END IF;

    -- Add orgAdmin column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'healthcare_users' 
        AND column_name = 'orgAdmin'
    ) THEN
        ALTER TABLE "healthcare_users" ADD COLUMN "orgAdmin" BOOLEAN NOT NULL DEFAULT false;
    END IF;
END $$;

-- Create ems_users table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'ems_users'
    ) THEN
        CREATE TABLE "ems_users" (
            "id" TEXT NOT NULL,
            "email" TEXT NOT NULL,
            "password" TEXT NOT NULL,
            "name" TEXT NOT NULL,
            "agencyName" TEXT NOT NULL,
            "agencyId" TEXT,
            "isActive" BOOLEAN NOT NULL DEFAULT true,
            "userType" TEXT NOT NULL DEFAULT 'EMS',
            "isSubUser" BOOLEAN NOT NULL DEFAULT false,
            "parentUserId" TEXT,
            "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
            "orgAdmin" BOOLEAN NOT NULL DEFAULT false,
            "deletedAt" TIMESTAMP(3),
            "isDeleted" BOOLEAN NOT NULL DEFAULT false,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,

            CONSTRAINT "ems_users_pkey" PRIMARY KEY ("id")
        );

        CREATE UNIQUE INDEX "ems_users_email_key" ON "ems_users"("email");
        CREATE INDEX "ems_users_isDeleted_idx" ON "ems_users"("isDeleted");
        
        -- Add foreign key constraint for parentUserId (self-reference)
        ALTER TABLE "ems_users" ADD CONSTRAINT "ems_users_parentUserId_fkey" 
            FOREIGN KEY ("parentUserId") REFERENCES "ems_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- Add missing columns to ems_users if table exists but columns are missing
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'ems_users'
    ) THEN
        -- Add isSubUser if missing
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'ems_users' 
            AND column_name = 'isSubUser'
        ) THEN
            ALTER TABLE "ems_users" ADD COLUMN "isSubUser" BOOLEAN NOT NULL DEFAULT false;
        END IF;

        -- Add parentUserId if missing
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'ems_users' 
            AND column_name = 'parentUserId'
        ) THEN
            ALTER TABLE "ems_users" ADD COLUMN "parentUserId" TEXT;
        END IF;

        -- Add mustChangePassword if missing
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'ems_users' 
            AND column_name = 'mustChangePassword'
        ) THEN
            ALTER TABLE "ems_users" ADD COLUMN "mustChangePassword" BOOLEAN NOT NULL DEFAULT false;
        END IF;

        -- Add orgAdmin if missing
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'ems_users' 
            AND column_name = 'orgAdmin'
        ) THEN
            ALTER TABLE "ems_users" ADD COLUMN "orgAdmin" BOOLEAN NOT NULL DEFAULT false;
        END IF;

        -- Add deletedAt if missing
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'ems_users' 
            AND column_name = 'deletedAt'
        ) THEN
            ALTER TABLE "ems_users" ADD COLUMN "deletedAt" TIMESTAMP(3);
        END IF;

        -- Add isDeleted if missing
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'ems_users' 
            AND column_name = 'isDeleted'
        ) THEN
            ALTER TABLE "ems_users" ADD COLUMN "isDeleted" BOOLEAN NOT NULL DEFAULT false;
        END IF;

        -- Add index if missing
        IF NOT EXISTS (
            SELECT 1 FROM pg_indexes 
            WHERE indexname = 'ems_users_isDeleted_idx'
        ) THEN
            CREATE INDEX "ems_users_isDeleted_idx" ON "ems_users"("isDeleted");
        END IF;
    END IF;
END $$;

-- Add foreign key constraint for healthcare_users parentUserId if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_schema = 'public' 
        AND constraint_name = 'healthcare_users_parentUserId_fkey'
    ) THEN
        ALTER TABLE "healthcare_users" ADD CONSTRAINT "healthcare_users_parentUserId_fkey" 
            FOREIGN KEY ("parentUserId") REFERENCES "healthcare_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

