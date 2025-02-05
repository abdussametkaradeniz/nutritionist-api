/*
  Warnings:

  - The primary key for the `DietitianProfile` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `about` on the `DietitianProfile` table. All the data in the column will be lost.
  - You are about to drop the column `isVerified` on the `DietitianProfile` table. All the data in the column will be lost.
  - The `education` column on the `DietitianProfile` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `PricingPackage` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `price` on the `PricingPackage` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.
  - The primary key for the `WorkingHours` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `WorkingHours` table. All the data in the column will be lost.
  - You are about to drop the column `dayOfWeek` on the `WorkingHours` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `WorkingHours` table. All the data in the column will be lost.
  - You are about to drop the `DietitianSpecialty` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Specialty` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[dietitianId,day]` on the table `WorkingHours` will be added. If there are existing duplicate values, this will fail.
  - Made the column `experience` on table `DietitianProfile` required. This step will fail if there are existing NULL values in that column.
  - Made the column `rating` on table `DietitianProfile` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `sessionCount` to the `PricingPackage` table without a default value. This is not possible if the table is not empty.
  - Made the column `description` on table `PricingPackage` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `day` to the `WorkingHours` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Specialization" AS ENUM ('WEIGHT_MANAGEMENT', 'SPORTS_NUTRITION', 'DIABETES', 'EATING_DISORDERS', 'PEDIATRIC_NUTRITION', 'PREGNANCY_NUTRITION', 'CLINICAL_NUTRITION', 'VEGAN_VEGETARIAN', 'FOOD_ALLERGIES');

-- CreateEnum
CREATE TYPE "WeekDay" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- DropForeignKey
ALTER TABLE "DietitianSpecialty" DROP CONSTRAINT "DietitianSpecialty_dietitianId_fkey";

-- DropForeignKey
ALTER TABLE "DietitianSpecialty" DROP CONSTRAINT "DietitianSpecialty_specialtyId_fkey";

-- DropForeignKey
ALTER TABLE "PricingPackage" DROP CONSTRAINT "PricingPackage_dietitianId_fkey";

-- DropForeignKey
ALTER TABLE "WorkingHours" DROP CONSTRAINT "WorkingHours_dietitianId_fkey";

-- DropIndex
DROP INDEX "DietitianProfile_userId_idx";

-- DropIndex
DROP INDEX "PricingPackage_dietitianId_idx";

-- DropIndex
DROP INDEX "WorkingHours_dayOfWeek_idx";

-- DropIndex
DROP INDEX "WorkingHours_dietitianId_idx";

-- AlterTable
ALTER TABLE "DietitianProfile" DROP CONSTRAINT "DietitianProfile_pkey",
DROP COLUMN "about",
DROP COLUMN "isVerified",
ADD COLUMN     "certificates" TEXT[],
ADD COLUMN     "specializations" "Specialization"[],
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
DROP COLUMN "education",
ADD COLUMN     "education" TEXT[],
ALTER COLUMN "experience" SET NOT NULL,
ALTER COLUMN "rating" SET NOT NULL,
ADD CONSTRAINT "DietitianProfile_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "DietitianProfile_id_seq";

-- AlterTable
ALTER TABLE "PricingPackage" DROP CONSTRAINT "PricingPackage_pkey",
ADD COLUMN     "features" TEXT[],
ADD COLUMN     "sessionCount" INTEGER NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "dietitianId" SET DATA TYPE TEXT,
ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "price" SET DATA TYPE DOUBLE PRECISION,
ADD CONSTRAINT "PricingPackage_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "PricingPackage_id_seq";

-- AlterTable
ALTER TABLE "WorkingHours" DROP CONSTRAINT "WorkingHours_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "dayOfWeek",
DROP COLUMN "updatedAt",
ADD COLUMN     "day" "WeekDay" NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "dietitianId" SET DATA TYPE TEXT,
ADD CONSTRAINT "WorkingHours_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "WorkingHours_id_seq";

-- DropTable
DROP TABLE "DietitianSpecialty";

-- DropTable
DROP TABLE "Specialty";

-- CreateIndex
CREATE UNIQUE INDEX "WorkingHours_dietitianId_day_key" ON "WorkingHours"("dietitianId", "day");

-- AddForeignKey
ALTER TABLE "WorkingHours" ADD CONSTRAINT "WorkingHours_dietitianId_fkey" FOREIGN KEY ("dietitianId") REFERENCES "DietitianProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PricingPackage" ADD CONSTRAINT "PricingPackage_dietitianId_fkey" FOREIGN KEY ("dietitianId") REFERENCES "DietitianProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
