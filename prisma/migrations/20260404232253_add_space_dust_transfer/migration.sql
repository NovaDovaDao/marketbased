-- CreateTable
CREATE TABLE "space_dust_transfer" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "space_dust_transfer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "space_dust_transfer_senderId_idx" ON "space_dust_transfer"("senderId");

-- CreateIndex
CREATE INDEX "space_dust_transfer_recipientId_idx" ON "space_dust_transfer"("recipientId");

-- AddForeignKey
ALTER TABLE "space_dust_transfer" ADD CONSTRAINT "space_dust_transfer_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "space_dust_transfer" ADD CONSTRAINT "space_dust_transfer_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
