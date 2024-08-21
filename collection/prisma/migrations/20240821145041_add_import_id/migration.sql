/*
  Warnings:

  - Added the required column `importId` to the `OrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable

-- Begin by allowing NULL values
ALTER TABLE "OrderItem" ADD COLUMN     "importId" UUID;

-- CreateTable
CREATE TABLE "OrderItemImport" (
    "id" UUID NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,

    CONSTRAINT "OrderItemImport_pkey" PRIMARY KEY ("id")
);



-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_importId_fkey" FOREIGN KEY ("importId") REFERENCES "OrderItemImport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Create import for everything so far called "Initial Import"
INSERT INTO "OrderItemImport" ("id", "name") VALUES (gen_random_uuid (), 'Initial Import (academic year 22-23)');

-- Set importId to the initial import
UPDATE "OrderItem" SET "importId" = (SELECT "id" FROM "OrderItemImport" WHERE "name" = 'Initial Import (academic year 22-23)');

-- Make non-NULL
ALTER TABLE "OrderItem" ALTER COLUMN "importId" SET NOT NULL;