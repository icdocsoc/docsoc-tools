/*
  Warnings:

  - A unique constraint covering the columns `[variantName,rootItemId]` on the table `Variant` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Variant_variantName_rootItemId_key" ON "Variant"("variantName", "rootItemId");
