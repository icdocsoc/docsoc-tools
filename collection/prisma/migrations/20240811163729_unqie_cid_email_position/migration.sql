/*
  Warnings:

  - A unique constraint covering the columns `[academicYear,cid,email,position]` on the table `CommitteeMember` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CommitteeMember_academicYear_cid_email_position_key" ON "CommitteeMember"("academicYear", "cid", "email", "position");
