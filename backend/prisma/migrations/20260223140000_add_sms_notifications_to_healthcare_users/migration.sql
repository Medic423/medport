-- AlterTable: Add smsNotifications to healthcare_users (Azure toll-free opt-in persistence)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'healthcare_users' AND column_name = 'smsNotifications') THEN
        ALTER TABLE "healthcare_users" ADD COLUMN "smsNotifications" BOOLEAN NOT NULL DEFAULT false;
    END IF;
END $$;
