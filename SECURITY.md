# Security

The local MVP does not persist customer data and does not accept provider credentials from the browser. Production work must add authenticated workspaces, authorization checks, signed upload URLs, file-type/size validation, SSRF-safe source fetching, encrypted Shopify token storage, rate limits, audit logs, and secret redaction.

Never place API keys in client-side code or commit `.env` files.
