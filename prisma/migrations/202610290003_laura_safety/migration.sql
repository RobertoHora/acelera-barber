CREATE TABLE "LauraSafetyState" ("id" TEXT PRIMARY KEY NOT NULL, "value" JSONB NOT NULL);
INSERT INTO "LauraSafetyState" ("id","value") VALUES ('circuit_breaker:channel_whatsapp','{"state":"CLOSED","reason":"ISOLATED_INITIAL_STATE"}');
