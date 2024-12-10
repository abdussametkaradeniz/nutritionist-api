/*
  Warnings:

  - Added the required column `lastUpdateDate` to the `Permission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastUpdateDate` to the `Role` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Permission"
ADD COLUMN "lastUpdateDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "lastUpdatingUser" TEXT DEFAULT 'ADMIN',
ADD COLUMN "recordStatus" TEXT DEFAULT 'A';

-- AlterTable
ALTER TABLE "Role"
ADD COLUMN "lastUpdateDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "lastUpdatingUser" TEXT DEFAULT 'ADMIN',
ADD COLUMN "recordStatus" TEXT DEFAULT 'A';