/*
  Warnings:

  - A unique constraint covering the columns `[academicYear,cid]` on the table `CommitteeMember` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[academicYear,shortcode]` on the table `CommitteeMember` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "CommitteeMember_cid_key";

-- DropIndex
DROP INDEX "CommitteeMember_shortcode_key";

-- CreateTable
CREATE TABLE "AcademicYear" (
    "year" TEXT NOT NULL,

    CONSTRAINT "AcademicYear_pkey" PRIMARY KEY ("year")
);

-- CreateIndex
CREATE UNIQUE INDEX "AcademicYear_year_key" ON "AcademicYear"("year");

-- CreateIndex
CREATE UNIQUE INDEX "CommitteeMember_academicYear_cid_key" ON "CommitteeMember"("academicYear", "cid");

-- CreateIndex
CREATE UNIQUE INDEX "CommitteeMember_academicYear_shortcode_key" ON "CommitteeMember"("academicYear", "shortcode");

-- AddForeignKey
ALTER TABLE "CommitteeMember" ADD CONSTRAINT "CommitteeMember_academicYear_fkey" FOREIGN KEY ("academicYear") REFERENCES "AcademicYear"("year") ON DELETE RESTRICT ON UPDATE CASCADE;
