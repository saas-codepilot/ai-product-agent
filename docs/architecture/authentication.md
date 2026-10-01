# Authentication and authorization

The API now has a server-side session boundary. Registration hashes passwords with scrypt, login creates an expiring HttpOnly/SameSite cookie, logout invalidates the session, and `/api/auth/me` exposes only non-secret identity metadata. Production startup rejects missing PostgreSQL, production auth bypass, and missing OpenAI configuration.

Sessions resolve a workspace and role on the server. Client-supplied workspace headers are not used when a valid session exists. The development bypass is limited to non-production local runs and must be disabled for deployed environments. The existing membership schema supports owner/member roles; future persistence should move the session store to PostgreSQL or Redis.
