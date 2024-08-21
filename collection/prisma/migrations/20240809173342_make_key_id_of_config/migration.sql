/*
  Warnings:

  - The primary key for the `Config` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Config` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Config" DROP CONSTRAINT "Config_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "Config_pkey" PRIMARY KEY ("key");
