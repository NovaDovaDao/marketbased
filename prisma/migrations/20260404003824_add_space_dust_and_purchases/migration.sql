-- AlterTable
ALTER TABLE "message" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "spaceDust" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "purchase" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amountUsd" INTEGER NOT NULL,
    "spaceDust" INTEGER NOT NULL,
    "provider" TEXT NOT NULL,
    "providerRef" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "purchase_userId_idx" ON "purchase"("userId");

-- CreateIndex
CREATE INDEX "purchase_status_idx" ON "purchase"("status");

-- CreateIndex
CREATE INDEX "purchase_provider_status_idx" ON "purchase"("provider", "status");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_providerRef_key" ON "purchase"("providerRef");

-- AddForeignKey
ALTER TABLE "purchase" ADD CONSTRAINT "purchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
