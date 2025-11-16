-- AlterTable
ALTER TABLE "transport_requests" ADD COLUMN "healthcareCompletionTimestamp" TIMESTAMP(3),
ADD COLUMN "emsCompletionTimestamp" TIMESTAMP(3);

-- Migrate existing completionTimestamp data to healthcareCompletionTimestamp
UPDATE "transport_requests" 
SET "healthcareCompletionTimestamp" = "completionTimestamp" 
WHERE "completionTimestamp" IS NOT NULL;

