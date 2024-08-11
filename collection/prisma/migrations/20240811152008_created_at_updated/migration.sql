/*
  Warnings:

  - Added the required column `updatedAt` to the `AcademicYear` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `CommitteeMember` table without a default value. This is not possible if the table is not empty.

*/
-- Step 1: Add the columns as nullable
ALTER TABLE "AcademicYear" 
ADD COLUMN "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "CommitteeMember" 
ADD COLUMN "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- Step 2: Update existing records to set the current timestamp
UPDATE "AcademicYear" SET "createdAt" = CURRENT_TIMESTAMP WHERE "createdAt" IS NULL;
UPDATE "AcademicYear" SET "updatedAt" = CURRENT_TIMESTAMP WHERE "updatedAt" IS NULL;

UPDATE "CommitteeMember" SET "createdAt" = CURRENT_TIMESTAMP WHERE "createdAt" IS NULL;
UPDATE "CommitteeMember" SET "updatedAt" = CURRENT_TIMESTAMP WHERE "updatedAt" IS NULL;

-- Step 3: Alter the columns to be non-nullable
ALTER TABLE "AcademicYear" 
ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "updatedAt" SET NOT NULL;

ALTER TABLE "CommitteeMember" 
ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "updatedAt" SET NOT NULL;