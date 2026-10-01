# Production runtime

Production requires PostgreSQL, Redis, a real session boundary, OpenAI configuration, and Shopify encryption configuration. Readiness reports non-secret dependency configuration separately from liveness. Local development may use memory repositories, in-memory jobs, local storage, development AI, and the development Shopify adapter. Run the API and a dedicated worker process separately once Redis is provisioned.
