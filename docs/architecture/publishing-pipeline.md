# Publishing pipeline

Publishing is an explicit, two-phase workflow: the API exposes a read-only Shopify preview for a confirmed listing, then accepts a separate publish command. Listing generation never calls Shopify. The server validates the listing, maps internal fields to Shopify Admin GraphQL `ProductCreateInput`, records a publishing state, and persists the provider product ID and URL on success.

The in-memory repository is intentionally used when `DATABASE_URL` is absent. PostgreSQL adds `ShopifyConnection`, `PublishAttempt`, and `OAuthState` models. Publish keys are workspace-scoped and duplicate published attempts are rejected. A failed attempt remains visible as `failed` and can be retried intentionally.
