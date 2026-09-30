# System architecture

```mermaid
flowchart LR
  Web[Next.js web] --> API[TypeScript API]
  API --> Domain[Shared types + validation]
  API --> Research[Research provider ports]
  API --> Jobs[Async job boundary]
  API --> Shopify[Commerce provider ports]
  API -. planned .-> DB[(PostgreSQL/Prisma)]
  API -. planned .-> Redis[(Redis queue)]
```

The MVP keeps the API and web separable, uses ports for research/AI/image processing/commerce, and uses an in-memory store only for local development. PostgreSQL, Redis, object storage, authentication, and workers are planned integration points rather than fake implementations.
