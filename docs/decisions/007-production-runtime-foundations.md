# ADR 007: Production runtime foundations

PostgreSQL is the required production persistence boundary; memory repositories are retained only for local development and tests. Sessions, authorization, rate limiting, jobs, media validation, and provider retries are isolated behind small ports so Redis, object storage, and a managed identity provider can be introduced without changing product/listing domain types. No billing or automatic publishing is introduced.
