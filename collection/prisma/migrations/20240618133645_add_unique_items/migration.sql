/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `RootItem` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "RootItem_name_key" ON "RootItem"("name");
