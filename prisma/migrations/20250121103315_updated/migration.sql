/*
  Warnings:

  - A unique constraint covering the columns `[uuid,customerOrderNumber]` on the table `PlacedOrders` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "PlacedOrders_customerOrderNumber_key";

-- DropIndex
DROP INDEX "PlacedOrders_uuid_key";

-- CreateIndex
CREATE UNIQUE INDEX "PlacedOrders_uuid_customerOrderNumber_key" ON "PlacedOrders"("uuid", "customerOrderNumber");
