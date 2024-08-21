/*
  Warnings:

  - Added the required column `academicYear` to the `CommitteeMember` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CommitteeMember" ADD COLUMN     "academicYear" TEXT NOT NULL;
