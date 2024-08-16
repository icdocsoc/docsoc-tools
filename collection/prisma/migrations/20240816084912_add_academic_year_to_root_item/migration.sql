/*
  Warnings:

  - Added the required column `academicYear` to the `RootItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RootItem" ADD COLUMN     "academicYear" TEXT;

-- Set default value to 23-24
-- create 23-24 if it doesn't exist
INSERT INTO "AcademicYear" ("year") VALUES ('23-24') ON CONFLICT DO NOTHING;
UPDATE "RootItem" SET "academicYear" = '23-24';

-- Make it non-NULL
ALTER TABLE "RootItem" ALTER COLUMN "academicYear" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "RootItem" ADD CONSTRAINT "RootItem_academicYear_fkey" FOREIGN KEY ("academicYear") REFERENCES "AcademicYear"("year") ON DELETE RESTRICT ON UPDATE CASCADE;
