/*
  Warnings:

  - Added the required column `academicYear` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "academicYear" TEXT;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_academicYear_fkey" FOREIGN KEY ("academicYear") REFERENCES "AcademicYear"("year") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Set default value to 23-24
-- create 23-24 if it doesn't exist
INSERT INTO "AcademicYear" ("year") VALUES ('23-24') ON CONFLICT DO NOTHING;
UPDATE "Order" SET "academicYear" = '23-24';

-- Make it non-NULL
ALTER TABLE "Order" ALTER COLUMN "academicYear" SET NOT NULL;

