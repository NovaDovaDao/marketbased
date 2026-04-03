CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE "message"
  ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
