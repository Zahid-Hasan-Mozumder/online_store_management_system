/*
  Warnings:

  - A unique constraint covering the columns `[customerOrderNumber]` on the table `PlacedOrders` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "PlacedOrders_uuid_customerOrderNumber_key";

-- CreateIndex
CREATE UNIQUE INDEX "PlacedOrders_customerOrderNumber_key" ON "PlacedOrders"("customerOrderNumber");
