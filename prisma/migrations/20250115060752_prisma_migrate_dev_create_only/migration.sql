/*
  Warnings:

  - Added the required column `updatedAt` to the `Collections` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Tags` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Collections" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Images" ALTER COLUMN "url" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Options" ALTER COLUMN "name" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Tags" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Varients" ALTER COLUMN "title" DROP NOT NULL;
