-- AlterTable
ALTER TABLE "User" ADD COLUMN     "dietitianId" INTEGER;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_dietitianId_fkey" FOREIGN KEY ("dietitianId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
