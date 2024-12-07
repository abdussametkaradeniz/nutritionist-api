/*
  Warnings:

  - A unique constraint covering the columns `[phoneNumber]` on the table `Profile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `phoneNumber` to the `Profile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "phoneNumber" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Profile_phoneNumber_key" ON "Profile"("phoneNumber");
