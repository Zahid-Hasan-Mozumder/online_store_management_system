/*
  Warnings:

  - A unique constraint covering the columns `[customerOrderNumber]` on the table `PlacedOrders` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PlacedOrders_customerOrderNumber_key" ON "PlacedOrders"("customerOrderNumber");
