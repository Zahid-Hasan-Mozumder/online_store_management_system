-- CreateTable
CREATE TABLE "PlacedOrders" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "isScheduled" BOOLEAN NOT NULL,
    "isCompleted" BOOLEAN NOT NULL,
    "displayOrderId" TEXT NOT NULL,
    "routificOrderNumber" TEXT NOT NULL,
    "customerOrderNumber" TEXT NOT NULL,
    "workspaceId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "PlacedOrders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeWindows" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "startTime" TEXT,
    "endTime" TEXT,

    CONSTRAINT "TimeWindows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Locations" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "address" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "timezone" TEXT,
    "status" TEXT,

    CONSTRAINT "Locations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlacedOrders_uuid_key" ON "PlacedOrders"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "TimeWindows_uuid_key" ON "TimeWindows"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Locations_uuid_key" ON "Locations"("uuid");
