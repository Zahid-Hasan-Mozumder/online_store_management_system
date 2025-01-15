-- CreateTable
CREATE TABLE "ProductCounts" (
    "id" SERIAL NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProductCounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollectionCounts" (
    "id" SERIAL NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CollectionCounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TagCounts" (
    "id" SERIAL NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TagCounts_pkey" PRIMARY KEY ("id")
);
