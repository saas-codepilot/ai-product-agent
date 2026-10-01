# Shopify integration

Shopify is represented by a provider port. The explicit publish endpoint creates an idempotent `AppJob` and `PublishAttempt` when Redis is configured; the worker calls the development or GraphQL provider and persists safe status, provider ID, URL, error category/message, and provider metadata. Access tokens and authorization headers are never persisted in attempts or job payloads. The development provider is deterministic and requires no paid service; real GraphQL publishing still requires Shopify credentials and an encryption key. No automatic publishing is performed.
