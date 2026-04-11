/*
  Warnings:

  - A unique constraint covering the columns `[itemInstanceId]` on the table `listing` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ItemRarity" AS ENUM ('NORMAL', 'MAGIC', 'RARE', 'SET', 'UNIQUE', 'RUNEWORD', 'CRAFTED');

-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('HELMET', 'ARMOR', 'SHIELD', 'GLOVES', 'BOOTS', 'BELT', 'WEAPON', 'RING', 'AMULET', 'CHARM', 'JEWEL', 'RUNE', 'GEM', 'MISC');

-- CreateEnum
CREATE TYPE "EquipmentSlot" AS ENUM ('HEAD', 'BODY', 'HANDS', 'FEET', 'WAIST', 'WEAPON', 'OFFHAND', 'FINGER', 'NECK', 'INVENTORY');

-- CreateEnum
CREATE TYPE "GameMode" AS ENUM ('SOFTCORE', 'HARDCORE');

-- CreateEnum
CREATE TYPE "LadderType" AS ENUM ('LADDER', 'NON_LADDER');

-- AlterTable
ALTER TABLE "listing" ADD COLUMN     "itemInstanceId" TEXT,
ADD COLUMN     "tradeCurrency" TEXT;

-- CreateTable
CREATE TABLE "base_item" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ItemType" NOT NULL,
    "baseType" TEXT NOT NULL,
    "ilvl" INTEGER,
    "requiredLvl" INTEGER,
    "minDamage" INTEGER,
    "maxDamage" INTEGER,
    "defense" INTEGER,
    "durability" INTEGER,
    "socketsMax" INTEGER,
    "stackable" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "base_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unique_item" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "baseItemId" TEXT NOT NULL,
    "level" INTEGER,
    "stats" JSONB NOT NULL,
    "lore" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "unique_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_set" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bonuses" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "item_set_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "set_item" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "setId" TEXT NOT NULL,
    "baseItemId" TEXT NOT NULL,
    "stats" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "set_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "runeword" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "runes" TEXT[],
    "bases" TEXT[],
    "attributes" TEXT[],
    "stats" JSONB NOT NULL,
    "level" INTEGER,
    "ladder" BOOLEAN,
    "tier" INTEGER,
    "patch" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "runeword_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "affix" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "tier" INTEGER,
    "statKey" TEXT NOT NULL,
    "minValue" INTEGER,
    "maxValue" INTEGER,
    "levelReq" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "affix_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_instance" (
    "id" TEXT NOT NULL,
    "baseItemId" TEXT NOT NULL,
    "rarity" "ItemRarity" NOT NULL,
    "name" TEXT,
    "ilvl" INTEGER,
    "sockets" INTEGER,
    "ethereal" BOOLEAN NOT NULL DEFAULT false,
    "identified" BOOLEAN NOT NULL DEFAULT true,
    "gameMode" "GameMode" NOT NULL DEFAULT 'SOFTCORE',
    "ladder" "LadderType" NOT NULL DEFAULT 'NON_LADDER',
    "stats" JSONB NOT NULL,
    "rawText" TEXT,
    "statKeys" TEXT[],
    "searchText" TEXT,
    "score" DOUBLE PRECISION,
    "isPerfect" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "item_instance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_affix" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "affixId" TEXT NOT NULL,
    "value" INTEGER,

    CONSTRAINT "item_affix_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rune" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tier" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rune_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stat_definition" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "display" TEXT NOT NULL,
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stat_definition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gemType" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "effect" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "base_item_name_idx" ON "base_item"("name");

-- CreateIndex
CREATE INDEX "base_item_type_idx" ON "base_item"("type");

-- CreateIndex
CREATE INDEX "unique_item_name_idx" ON "unique_item"("name");

-- CreateIndex
CREATE UNIQUE INDEX "runeword_name_key" ON "runeword"("name");

-- CreateIndex
CREATE INDEX "runeword_name_idx" ON "runeword"("name");

-- CreateIndex
CREATE INDEX "affix_name_idx" ON "affix"("name");

-- CreateIndex
CREATE INDEX "affix_statKey_idx" ON "affix"("statKey");

-- CreateIndex
CREATE INDEX "item_instance_rarity_idx" ON "item_instance"("rarity");

-- CreateIndex
CREATE INDEX "item_instance_ilvl_idx" ON "item_instance"("ilvl");

-- CreateIndex
CREATE INDEX "item_instance_baseItemId_idx" ON "item_instance"("baseItemId");

-- CreateIndex
CREATE INDEX "item_instance_ethereal_idx" ON "item_instance"("ethereal");

-- CreateIndex
CREATE INDEX "item_instance_sockets_idx" ON "item_instance"("sockets");

-- CreateIndex
CREATE INDEX "item_instance_gameMode_idx" ON "item_instance"("gameMode");

-- CreateIndex
CREATE INDEX "item_instance_ladder_idx" ON "item_instance"("ladder");

-- CreateIndex
CREATE INDEX "item_affix_itemId_idx" ON "item_affix"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "rune_name_key" ON "rune"("name");

-- CreateIndex
CREATE UNIQUE INDEX "stat_definition_key_key" ON "stat_definition"("key");

-- CreateIndex
CREATE INDEX "stat_definition_key_idx" ON "stat_definition"("key");

-- CreateIndex
CREATE INDEX "gem_gemType_idx" ON "gem"("gemType");

-- CreateIndex
CREATE UNIQUE INDEX "listing_itemInstanceId_key" ON "listing"("itemInstanceId");

-- CreateIndex
CREATE INDEX "listing_tradeCurrency_idx" ON "listing"("tradeCurrency");

-- AddForeignKey
ALTER TABLE "listing" ADD CONSTRAINT "listing_itemInstanceId_fkey" FOREIGN KEY ("itemInstanceId") REFERENCES "item_instance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unique_item" ADD CONSTRAINT "unique_item_baseItemId_fkey" FOREIGN KEY ("baseItemId") REFERENCES "base_item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "set_item" ADD CONSTRAINT "set_item_setId_fkey" FOREIGN KEY ("setId") REFERENCES "item_set"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "set_item" ADD CONSTRAINT "set_item_baseItemId_fkey" FOREIGN KEY ("baseItemId") REFERENCES "base_item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_instance" ADD CONSTRAINT "item_instance_baseItemId_fkey" FOREIGN KEY ("baseItemId") REFERENCES "base_item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_affix" ADD CONSTRAINT "item_affix_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "item_instance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_affix" ADD CONSTRAINT "item_affix_affixId_fkey" FOREIGN KEY ("affixId") REFERENCES "affix"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- GIN full-text index on item_instance.search_text via pg_trgm
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX CONCURRENTLY IF NOT EXISTS "item_instance_search_text_gin"
  ON "item_instance" USING gin("searchText" gin_trgm_ops)
  WHERE "searchText" IS NOT NULL;
