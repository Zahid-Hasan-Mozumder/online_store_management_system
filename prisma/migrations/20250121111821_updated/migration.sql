/*
  Warnings:

  - Changed the type of `customerOrderNumber` on the `PlacedOrders` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "PlacedOrders" DROP COLUMN "customerOrderNumber",
ADD COLUMN     "customerOrderNumber" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PlacedOrders_customerOrderNumber_key" ON "PlacedOrders"("customerOrderNumber");

-- AddForeignKey
ALTER TABLE "PlacedOrders" ADD CONSTRAINT "PlacedOrders_customerOrderNumber_fkey" FOREIGN KEY ("customerOrderNumber") REFERENCES "Orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
