-- CreateTable
CREATE TABLE "public"."HospitalAgencyPreference" (
    "id" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "preferenceOrder" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HospitalAgencyPreference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HospitalAgencyPreference_hospitalId_idx" ON "public"."HospitalAgencyPreference"("hospitalId");

-- CreateIndex
CREATE INDEX "HospitalAgencyPreference_agencyId_idx" ON "public"."HospitalAgencyPreference"("agencyId");

-- CreateIndex
CREATE UNIQUE INDEX "HospitalAgencyPreference_hospitalId_agencyId_key" ON "public"."HospitalAgencyPreference"("hospitalId", "agencyId");

-- AddForeignKey
ALTER TABLE "public"."HospitalAgencyPreference" ADD CONSTRAINT "HospitalAgencyPreference_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HospitalAgencyPreference" ADD CONSTRAINT "HospitalAgencyPreference_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "public"."TransportAgency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
