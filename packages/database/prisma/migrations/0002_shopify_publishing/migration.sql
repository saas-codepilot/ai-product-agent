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
