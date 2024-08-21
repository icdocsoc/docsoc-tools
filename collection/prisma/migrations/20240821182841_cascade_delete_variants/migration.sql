-- DropForeignKey
ALTER TABLE "Variant" DROP CONSTRAINT "Variant_rootItemId_fkey";

-- AddForeignKey
ALTER TABLE "Variant" ADD CONSTRAINT "Variant_rootItemId_fkey" FOREIGN KEY ("rootItemId") REFERENCES "RootItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
