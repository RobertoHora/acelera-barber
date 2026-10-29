-- Existing installations may have received this field via db push; make upgrades repeatable.
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "lateCancellationVoucherEnabled" BOOLEAN NOT NULL DEFAULT true;
