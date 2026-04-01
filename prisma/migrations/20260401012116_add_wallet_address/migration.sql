-- CreateTable
CREATE TABLE "wallet_address" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallet_address_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "wallet_address_address_key" ON "wallet_address"("address");

-- CreateIndex
CREATE INDEX "wallet_address_userId_idx" ON "wallet_address"("userId");

-- AddForeignKey
ALTER TABLE "wallet_address" ADD CONSTRAINT "wallet_address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
