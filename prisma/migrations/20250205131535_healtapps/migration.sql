-- CreateEnum
CREATE TYPE "HealthAppProvider" AS ENUM ('APPLE_HEALTH', 'GOOGLE_FIT');

-- CreateTable
CREATE TABLE "HealthAppConnection" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "provider" "HealthAppProvider" NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "expiresAt" TIMESTAMP(3),
    "lastSync" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HealthAppConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HealthData" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "provider" "HealthAppProvider" NOT NULL,
    "dataType" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HealthData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HealthAppConnection_userId_idx" ON "HealthAppConnection"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "HealthAppConnection_userId_provider_key" ON "HealthAppConnection"("userId", "provider");

-- CreateIndex
CREATE INDEX "HealthData_userId_idx" ON "HealthData"("userId");

-- CreateIndex
CREATE INDEX "HealthData_dataType_idx" ON "HealthData"("dataType");

-- CreateIndex
CREATE INDEX "HealthData_timestamp_idx" ON "HealthData"("timestamp");

-- AddForeignKey
ALTER TABLE "HealthAppConnection" ADD CONSTRAINT "HealthAppConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HealthData" ADD CONSTRAINT "HealthData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
