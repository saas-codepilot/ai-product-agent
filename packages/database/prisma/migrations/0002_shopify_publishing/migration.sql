CREATE TABLE "ShopifyConnection" (
  "id" TEXT NOT NULL, "workspaceId" TEXT NOT NULL, "shop" TEXT NOT NULL, "encryptedAccessToken" TEXT NOT NULL,
  "scopes" JSONB NOT NULL, "status" TEXT NOT NULL DEFAULT 'connected', "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ShopifyConnection_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "PublishAttempt" (
  "id" TEXT NOT NULL, "workspaceId" TEXT NOT NULL, "productId" TEXT NOT NULL, "listingId" TEXT NOT NULL, "connectionId" TEXT,
  "idempotencyKey" TEXT NOT NULL, "status" TEXT NOT NULL, "providerProductId" TEXT, "providerUrl" TEXT, "error" TEXT, "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PublishAttempt_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "OAuthState" (
  "id" TEXT NOT NULL, "workspaceId" TEXT NOT NULL, "userId" TEXT NOT NULL, "shop" TEXT NOT NULL, "stateHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL, "consumedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OAuthState_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ShopifyConnection_workspaceId_shop_key" ON "ShopifyConnection"("workspaceId","shop");
CREATE UNIQUE INDEX "PublishAttempt_workspaceId_idempotencyKey_key" ON "PublishAttempt"("workspaceId","idempotencyKey");
CREATE UNIQUE INDEX "OAuthState_stateHash_key" ON "OAuthState"("stateHash");
ALTER TABLE "ShopifyConnection" ADD CONSTRAINT "ShopifyConnection_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PublishAttempt" ADD CONSTRAINT "PublishAttempt_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PublishAttempt" ADD CONSTRAINT "PublishAttempt_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PublishAttempt" ADD CONSTRAINT "PublishAttempt_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "ShopifyConnection"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ProductImage" ADD COLUMN "storageKey" TEXT, ADD COLUMN "width" INTEGER, ADD COLUMN "height" INTEGER;
ALTER TABLE "ProductImage" ADD COLUMN "checksum" TEXT, ADD COLUMN "variant" TEXT NOT NULL DEFAULT 'original';
CREATE UNIQUE INDEX "ProductImage_productId_variant_key" ON "ProductImage"("productId","variant");
ALTER TABLE "ResearchCandidate" ADD COLUMN "provider" TEXT, ADD COLUMN "providerProductId" TEXT, ADD COLUMN "providerMetadata" JSONB;
CREATE INDEX "ResearchCandidate_productId_provider_providerProductId_idx" ON "ResearchCandidate"("productId","provider","providerProductId");
CREATE TABLE "UsageRecord" ("id" TEXT NOT NULL, "workspaceId" TEXT NOT NULL, "userId" TEXT, "productId" TEXT, "jobId" TEXT, "operation" TEXT NOT NULL, "provider" TEXT, "model" TEXT, "inputTokens" INTEGER, "outputTokens" INTEGER, "imageCount" INTEGER, "durationMs" INTEGER, "estimatedCostUsd" DOUBLE PRECISION, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "UsageRecord_pkey" PRIMARY KEY ("id"));
CREATE INDEX "UsageRecord_workspaceId_createdAt_idx" ON "UsageRecord"("workspaceId","createdAt");
ALTER TABLE "UsageRecord" ADD CONSTRAINT "UsageRecord_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE TABLE "AppJob" ("id" TEXT NOT NULL, "workspaceId" TEXT NOT NULL, "productId" TEXT, "type" TEXT NOT NULL, "idempotencyKey" TEXT NOT NULL, "status" TEXT NOT NULL DEFAULT 'queued', "payload" JSONB NOT NULL, "attempts" INTEGER NOT NULL DEFAULT 0, "maxAttempts" INTEGER NOT NULL DEFAULT 3, "error" TEXT, "errorCategory" TEXT, "provider" TEXT, "result" JSONB, "leaseOwner" TEXT, "leaseUntil" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "startedAt" TIMESTAMP(3), "completedAt" TIMESTAMP(3), "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "AppJob_pkey" PRIMARY KEY ("id"));
ALTER TABLE "PublishAttempt" ADD COLUMN "jobId" TEXT;
ALTER TABLE "AppJob" ADD COLUMN "durationMs" INTEGER;
CREATE UNIQUE INDEX "AppJob_workspaceId_idempotencyKey_key" ON "AppJob"("workspaceId","idempotencyKey");
CREATE INDEX "AppJob_workspaceId_status_createdAt_idx" ON "AppJob"("workspaceId","status","createdAt");
ALTER TABLE "AppJob" ADD CONSTRAINT "AppJob_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AppJob" ADD CONSTRAINT "AppJob_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PublishAttempt" ADD CONSTRAINT "PublishAttempt_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "AppJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;
