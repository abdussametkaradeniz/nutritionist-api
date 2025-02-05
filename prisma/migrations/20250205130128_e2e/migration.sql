-- AlterTable
ALTER TABLE "ChatMessage" ADD COLUMN     "encryptedContent" TEXT,
ADD COLUMN     "ephemeralPublicKey" TEXT,
ADD COLUMN     "isEncrypted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "nonce" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "privateKey" TEXT,
ADD COLUMN     "publicKey" TEXT;
