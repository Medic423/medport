/*
  Warnings:

  - You are about to drop the column `shiftEnd` on the `units` table. All the data in the column will be lost.
  - You are about to drop the column `shiftStart` on the `units` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "units" DROP COLUMN "shiftEnd",
DROP COLUMN "shiftStart",
ADD COLUMN     "isOnDuty" BOOLEAN NOT NULL DEFAULT false;
