/*
  Warnings:

  - Added the required column `collected` to the `OrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "collected" BOOLEAN NOT NULL;
