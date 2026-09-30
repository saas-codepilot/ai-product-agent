# Authentication and authorization

The API now has an `AuthScope` boundary containing `userId` and `workspaceId`. Every product read/write resolves through that scope, and Prisma filters products by workspace ownership. Local development defaults to a clearly documented `DEV_AUTH_BYPASS=true`; production must set it false and provide both headers from a secure session middleware. No browser token or provider secret is accepted by the frontend.
