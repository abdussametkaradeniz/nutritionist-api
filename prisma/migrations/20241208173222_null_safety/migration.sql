-- AlterTable
ALTER TABLE "Profile" ALTER COLUMN "recordStatus" DROP NOT NULL,
ALTER COLUMN "isProfileCompleted" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" DROP NOT NULL,
ALTER COLUMN "recordStatus" DROP NOT NULL,
ALTER COLUMN "phoneNumber" DROP NOT NULL;
