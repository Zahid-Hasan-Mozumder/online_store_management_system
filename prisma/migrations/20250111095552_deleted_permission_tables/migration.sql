/*
  Warnings:

  - You are about to drop the `AdminPermissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ClientPermissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductPermissions` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `adminPermissions` to the `Admins` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clientPermissions` to the `Admins` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productPermissions` to the `Admins` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AdminPermissions" DROP CONSTRAINT "AdminPermissions_adminId_fkey";

-- DropForeignKey
ALTER TABLE "ClientPermissions" DROP CONSTRAINT "ClientPermissions_adminId_fkey";

-- DropForeignKey
ALTER TABLE "ProductPermissions" DROP CONSTRAINT "ProductPermissions_adminId_fkey";

-- AlterTable
ALTER TABLE "Admins" ADD COLUMN     "adminPermissions" JSONB NOT NULL,
ADD COLUMN     "clientPermissions" JSONB NOT NULL,
ADD COLUMN     "productPermissions" JSONB NOT NULL;

-- DropTable
DROP TABLE "AdminPermissions";

-- DropTable
DROP TABLE "ClientPermissions";

-- DropTable
DROP TABLE "ProductPermissions";
