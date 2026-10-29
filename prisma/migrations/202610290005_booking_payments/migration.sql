ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "onlinePaymentsEnabled" BOOLEAN NOT NULL DEFAULT false;
CREATE TABLE "BookingPayment" (
 "id" TEXT NOT NULL PRIMARY KEY, "bookingId" TEXT NOT NULL,
 "orderNsu" TEXT NOT NULL, "merchantHandle" TEXT NOT NULL, "amountCents" INTEGER NOT NULL,
 "status" TEXT NOT NULL DEFAULT 'PENDING', "checkoutUrl" TEXT, "transactionNsu" TEXT,
 "paidAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "BookingPayment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "BookingPayment_bookingId_key" ON "BookingPayment"("bookingId");
CREATE UNIQUE INDEX "BookingPayment_orderNsu_key" ON "BookingPayment"("orderNsu");
CREATE UNIQUE INDEX "BookingPayment_transactionNsu_key" ON "BookingPayment"("transactionNsu");
