# ADR 001: TypeScript monorepo

## Decision

Use pnpm workspaces with TypeScript packages for shared contracts, validation, services, API, and web.

## Consequences

Contracts can be shared by future web/mobile clients. Package boundaries add a small amount of setup but prevent provider details leaking into UI code.
