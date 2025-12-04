-- CreateTable
CREATE TABLE IF NOT EXISTS "healthcare_destinations" (
    "id" TEXT NOT NULL,
    "healthcare_user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip_code" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "contact_name" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "healthcare_destinations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "healthcare_destinations_healthcare_user_id_idx" ON "healthcare_destinations"("healthcare_user_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "healthcare_destinations_is_active_idx" ON "healthcare_destinations"("is_active");

-- AddForeignKey
ALTER TABLE "healthcare_destinations" ADD CONSTRAINT "healthcare_destinations_healthcare_user_id_fkey" FOREIGN KEY ("healthcare_user_id") REFERENCES "healthcare_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;








