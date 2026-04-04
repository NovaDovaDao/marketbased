-- DropForeignKey
ALTER TABLE "trade_room" DROP CONSTRAINT "trade_room_offerId_fkey";

-- AlterTable
ALTER TABLE "listing" ADD COLUMN     "spaceDustPrice" INTEGER;

-- AlterTable
ALTER TABLE "trade_room" ALTER COLUMN "offerId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "item_purchase" (
    "id" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "sellerId" TEXT,
    "listingId" TEXT,
    "runeId" INTEGER,
    "itemName" TEXT NOT NULL,
    "spaceDustAmount" INTEGER NOT NULL,
    "tradeRoomId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "item_purchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "item_purchase_buyerId_idx" ON "item_purchase"("buyerId");

-- CreateIndex
CREATE INDEX "item_purchase_sellerId_idx" ON "item_purchase"("sellerId");

-- AddForeignKey
ALTER TABLE "trade_room" ADD CONSTRAINT "trade_room_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "offer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_purchase" ADD CONSTRAINT "item_purchase_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_purchase" ADD CONSTRAINT "item_purchase_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_purchase" ADD CONSTRAINT "item_purchase_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listing"("id") ON DELETE SET NULL ON UPDATE CASCADE;
