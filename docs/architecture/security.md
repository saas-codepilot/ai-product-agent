# Security boundaries

Every product route resolves a user/workspace scope before reading or writing data. The memory repository tracks product ownership explicitly; the Prisma repository scopes queries by workspace. Shopify connections and publish records are likewise keyed by workspace.

OAuth state is random, single-use, workspace-bound, expires after ten minutes, and is checked against the normalized shop domain. Shop identifiers are restricted to valid `*.myshopify.com` domains. Access tokens remain server-side and are not included in connection responses or browser URLs. API failures return safe user-facing messages while provider details stay out of response bodies. Production deployments must replace the development auth bypass and encrypt persisted Shopify tokens with a managed secret/KMS boundary.
