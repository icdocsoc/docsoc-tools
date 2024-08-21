-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_importId_fkey";

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_importId_fkey" FOREIGN KEY ("importId") REFERENCES "OrderItemImport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
