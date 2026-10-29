CREATE TABLE "LauraInbound" (
 "id" TEXT NOT NULL PRIMARY KEY, "providerId" TEXT NOT NULL,
 "phone" TEXT NOT NULL, "businessSlug" TEXT, "runId" TEXT,
 "content" TEXT NOT NULL, "status" TEXT NOT NULL DEFAULT 'PENDING',
 "availableAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "processedAt" TIMESTAMP(3)
);
CREATE UNIQUE INDEX "LauraInbound_providerId_key" ON "LauraInbound"("providerId");
CREATE INDEX "LauraInbound_status_availableAt_idx" ON "LauraInbound"("status","availableAt");
CREATE TABLE "LauraConversation" (
 "id" TEXT NOT NULL PRIMARY KEY, "phone" TEXT NOT NULL, "scope" TEXT NOT NULL,
 "state" JSONB NOT NULL, "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE UNIQUE INDEX "LauraConversation_phone_scope_key" ON "LauraConversation"("phone","scope");
