-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('OWNER', 'BARBER', 'ADMIN');

-- CreateEnum
CREATE TYPE "ChecklistStatus" AS ENUM ('TODO', 'DONE', 'DISMISSED');

-- CreateEnum
CREATE TYPE "ChannelType" AS ENUM ('GOOGLE_BUSINESS_PROFILE', 'INSTAGRAM');

-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('NOT_STARTED', 'MANUAL_ASSISTED', 'CLIENT_CONFIRMED');

-- CreateEnum
CREATE TYPE "ObservationSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PAID', 'EXPIRED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "EntitlementStatus" AS ENUM ('ACTIVE', 'REVOKED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "TrialStatus" AS ENUM ('GRANTED', 'ACTIVE', 'EXPIRED');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIALING', 'ACTIVE', 'PAST_DUE', 'PAST_DUE_SUSPENDED', 'CANCELED');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING_CONFIRMATION', 'CONFIRMED', 'COMPLETED', 'CANCELLED_BY_CUSTOMER', 'CANCELLED_BY_BUSINESS', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "OutboxDirection" AS ENUM ('OUTBOUND', 'INBOUND');

-- CreateEnum
CREATE TYPE "OutboxPurpose" AS ENUM ('AUTH_OTP', 'BOOKING_CUSTOMER_NOTICE', 'BOOKING_BUSINESS_NOTICE', 'PAYMENT_NOTICE', 'INITIAL_OUTREACH', 'CADENCE_FOLLOWUP', 'INBOUND_REPLY');

-- CreateEnum
CREATE TYPE "OutboxStatus" AS ENUM ('QUEUED', 'CLAIMED', 'DISPATCHING', 'PROVIDER_ACCEPTED', 'UNKNOWN', 'UNCERTAIN', 'FAILED', 'CANCELLED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'OWNER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OwnerSession" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OwnerSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtpVerification" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "userId" TEXT,
    "codeHash" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OtpVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Business" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cleanName" TEXT,
    "phone" TEXT,
    "whatsapp" TEXT,
    "phoneHmac" TEXT,
    "address" TEXT,
    "neighborhood" TEXT,
    "city" TEXT NOT NULL DEFAULT 'Governador Valadares',
    "state" TEXT NOT NULL DEFAULT 'MG',
    "rating" DOUBLE PRECISION DEFAULT 0,
    "reviewsCount" INTEGER DEFAULT 0,
    "placeId" TEXT,
    "reviewUrl" TEXT,
    "googleMapsUrl" TEXT,
    "photosCount" INTEGER DEFAULT 0,
    "featuredImageUrl" TEXT,
    "openingHoursRaw" JSONB,
    "timezone" TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
    "cancellationNoticeHours" INTEGER NOT NULL DEFAULT 1,
    "infiniteTag" TEXT,
    "infinitepayReferralClickedAt" TIMESTAMP(3),
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Business_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiagnosticReport" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "criteria" JSONB NOT NULL,
    "gaps" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiagnosticReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChecklistItemProgress" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "itemKey" TEXT NOT NULL,
    "status" "ChecklistStatus" NOT NULL DEFAULT 'TODO',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChecklistItemProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChannelSyncState" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "channel" "ChannelType" NOT NULL,
    "syncStatus" "SyncStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "lastVerifiedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChannelSyncState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NeedObservation" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "evidence" TEXT NOT NULL,
    "severity" "ObservationSeverity" NOT NULL DEFAULT 'MEDIUM',
    "observedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NeedObservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfferPresentation" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'WEB_LP',
    "presentedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OfferPresentation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "orderNsu" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "infinitepayCheckoutUrl" TEXT,
    "idempotencyKey" TEXT NOT NULL,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentTransaction" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rawPayload" JSONB,

    CONSTRAINT "PaymentTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentWebhookReceipt" (
    "id" TEXT NOT NULL,
    "providerEventId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentWebhookReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Entitlement" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "status" "EntitlementStatus" NOT NULL DEFAULT 'ACTIVE',
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "Entitlement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrialBenefit" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "sourcePlan" TEXT NOT NULL,
    "grantedDays" INTEGER NOT NULL DEFAULT 14,
    "status" "TrialStatus" NOT NULL DEFAULT 'GRANTED',
    "selectedModality" TEXT NOT NULL DEFAULT 'agenda_basic_monthly',
    "activatedAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrialBenefit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "planCode" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'TRIALING',
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "gracePeriodEndsAt" TIMESTAMP(3),
    "lastPaymentOrderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Professional" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nickname" TEXT,
    "phone" TEXT,
    "avatarUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "workingHours" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Professional_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "priceCents" INTEGER NOT NULL,
    "durationMinutes" INTEGER NOT NULL DEFAULT 30,
    "bufferMinutes" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeOff" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "professionalId" TEXT,
    "startsAt" TIMESTAMPTZ NOT NULL,
    "endsAt" TIMESTAMPTZ NOT NULL,
    "reason" TEXT,

    CONSTRAINT "TimeOff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phoneE164" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerVoucher" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "discountPercent" INTEGER NOT NULL DEFAULT 50,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerVoucher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "professionalId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhoneE164" TEXT NOT NULL,
    "startsAt" TIMESTAMPTZ NOT NULL,
    "endsAt" TIMESTAMPTZ NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'CONFIRMED',
    "cancelTokenHash" TEXT NOT NULL,
    "cancelledAt" TIMESTAMP(3),
    "cancelReason" TEXT,
    "isLateCancellation" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "idempotencyKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutboxMessage" (
    "id" TEXT NOT NULL,
    "businessId" TEXT,
    "direction" "OutboxDirection" NOT NULL DEFAULT 'OUTBOUND',
    "destinationPhone" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "purpose" "OutboxPurpose" NOT NULL,
    "template" TEXT,
    "dedupeKey" TEXT NOT NULL,
    "status" "OutboxStatus" NOT NULL DEFAULT 'QUEUED',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "availableAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leaseExpiresAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "waMessageId" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OutboxMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrowthEvent" (
    "id" TEXT NOT NULL,
    "canonicalEventId" TEXT,
    "event" TEXT NOT NULL,
    "schemaVersion" INTEGER NOT NULL DEFAULT 1,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "producerSystem" TEXT NOT NULL DEFAULT 'eleva-orc',
    "businessId" TEXT,
    "orderId" TEXT,
    "bookingId" TEXT,
    "metadata" JSONB,
    "dedupeKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GrowthEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "OwnerSession_sessionToken_key" ON "OwnerSession"("sessionToken");

-- CreateIndex
CREATE INDEX "OwnerSession_userId_expiresAt_idx" ON "OwnerSession"("userId", "expiresAt");

-- CreateIndex
CREATE INDEX "OtpVerification_phone_createdAt_idx" ON "OtpVerification"("phone", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "Business_slug_key" ON "Business"("slug");

-- CreateIndex
CREATE INDEX "Business_city_neighborhood_idx" ON "Business"("city", "neighborhood");

-- CreateIndex
CREATE INDEX "Business_slug_idx" ON "Business"("slug");

-- CreateIndex
CREATE INDEX "Business_phoneHmac_idx" ON "Business"("phoneHmac");

-- CreateIndex
CREATE INDEX "DiagnosticReport_businessId_createdAt_idx" ON "DiagnosticReport"("businessId", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "ChecklistItemProgress_businessId_itemKey_key" ON "ChecklistItemProgress"("businessId", "itemKey");

-- CreateIndex
CREATE UNIQUE INDEX "ChannelSyncState_businessId_channel_key" ON "ChannelSyncState"("businessId", "channel");

-- CreateIndex
CREATE INDEX "NeedObservation_businessId_observedAt_idx" ON "NeedObservation"("businessId", "observedAt" DESC);

-- CreateIndex
CREATE INDEX "OfferPresentation_businessId_presentedAt_idx" ON "OfferPresentation"("businessId", "presentedAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNsu_key" ON "Order"("orderNsu");

-- CreateIndex
CREATE UNIQUE INDEX "Order_idempotencyKey_key" ON "Order"("idempotencyKey");

-- CreateIndex
CREATE INDEX "Order_businessId_status_idx" ON "Order"("businessId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentTransaction_transactionId_key" ON "PaymentTransaction"("transactionId");

-- CreateIndex
CREATE INDEX "PaymentTransaction_orderId_idx" ON "PaymentTransaction"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentWebhookReceipt_providerEventId_key" ON "PaymentWebhookReceipt"("providerEventId");

-- CreateIndex
CREATE UNIQUE INDEX "Entitlement_businessId_sku_key" ON "Entitlement"("businessId", "sku");

-- CreateIndex
CREATE UNIQUE INDEX "TrialBenefit_businessId_key" ON "TrialBenefit"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_businessId_key" ON "Subscription"("businessId");

-- CreateIndex
CREATE INDEX "Professional_businessId_isActive_idx" ON "Professional"("businessId", "isActive");

-- CreateIndex
CREATE INDEX "Service_businessId_isActive_sortOrder_idx" ON "Service"("businessId", "isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "TimeOff_businessId_startsAt_endsAt_idx" ON "TimeOff"("businessId", "startsAt", "endsAt");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_businessId_phoneE164_key" ON "Customer"("businessId", "phoneE164");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerVoucher_code_key" ON "CustomerVoucher"("code");

-- CreateIndex
CREATE INDEX "CustomerVoucher_businessId_customerId_isUsed_idx" ON "CustomerVoucher"("businessId", "customerId", "isUsed");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_cancelTokenHash_key" ON "Booking"("cancelTokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_idempotencyKey_key" ON "Booking"("idempotencyKey");

-- CreateIndex
CREATE INDEX "Booking_businessId_startsAt_idx" ON "Booking"("businessId", "startsAt" ASC);

-- CreateIndex
CREATE INDEX "Booking_professionalId_startsAt_idx" ON "Booking"("professionalId", "startsAt" ASC);

-- CreateIndex
CREATE INDEX "Booking_customerPhoneE164_status_idx" ON "Booking"("customerPhoneE164", "status");

-- CreateIndex
CREATE UNIQUE INDEX "OutboxMessage_dedupeKey_key" ON "OutboxMessage"("dedupeKey");

-- CreateIndex
CREATE UNIQUE INDEX "OutboxMessage_waMessageId_key" ON "OutboxMessage"("waMessageId");

-- CreateIndex
CREATE INDEX "OutboxMessage_status_availableAt_idx" ON "OutboxMessage"("status", "availableAt");

-- CreateIndex
CREATE INDEX "OutboxMessage_businessId_purpose_createdAt_idx" ON "OutboxMessage"("businessId", "purpose", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "GrowthEvent_canonicalEventId_key" ON "GrowthEvent"("canonicalEventId");

-- CreateIndex
CREATE UNIQUE INDEX "GrowthEvent_dedupeKey_key" ON "GrowthEvent"("dedupeKey");

-- CreateIndex
CREATE INDEX "GrowthEvent_event_occurredAt_idx" ON "GrowthEvent"("event", "occurredAt" DESC);

-- CreateIndex
CREATE INDEX "GrowthEvent_businessId_occurredAt_idx" ON "GrowthEvent"("businessId", "occurredAt" DESC);

-- AddForeignKey
ALTER TABLE "OwnerSession" ADD CONSTRAINT "OwnerSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OtpVerification" ADD CONSTRAINT "OtpVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Business" ADD CONSTRAINT "Business_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiagnosticReport" ADD CONSTRAINT "DiagnosticReport_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistItemProgress" ADD CONSTRAINT "ChecklistItemProgress_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelSyncState" ADD CONSTRAINT "ChannelSyncState_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NeedObservation" ADD CONSTRAINT "NeedObservation_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferPresentation" ADD CONSTRAINT "OfferPresentation_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entitlement" ADD CONSTRAINT "Entitlement_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrialBenefit" ADD CONSTRAINT "TrialBenefit_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Professional" ADD CONSTRAINT "Professional_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeOff" ADD CONSTRAINT "TimeOff_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeOff" ADD CONSTRAINT "TimeOff_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "Professional"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerVoucher" ADD CONSTRAINT "CustomerVoucher_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerVoucher" ADD CONSTRAINT "CustomerVoucher_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "Professional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutboxMessage" ADD CONSTRAINT "OutboxMessage_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrowthEvent" ADD CONSTRAINT "GrowthEvent_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrowthEvent" ADD CONSTRAINT "GrowthEvent_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrowthEvent" ADD CONSTRAINT "GrowthEvent_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Habilita extensão btree_gist para concorrência
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Trava Anti-Regressão #6: Impossibilidade física de double-booking concorrente
ALTER TABLE "Booking"
ADD CONSTRAINT "Booking_no_overlapping_active_slots"
EXCLUDE USING gist (
  "professionalId" WITH =,
  tstzrange("startsAt", "endsAt", '[)') WITH &&
)
WHERE ("status" IN ('PENDING_CONFIRMATION', 'CONFIRMED'));
