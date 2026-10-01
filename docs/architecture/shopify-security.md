# Shopify token security

OAuth access tokens are encrypted with AES-256-GCM using a server-only `SHOPIFY_ENCRYPTION_KEY`. The key is never returned to the browser or logged. The provider decrypts only at the Admin GraphQL call boundary. Production startup rejects missing encryption configuration; key rotation should be implemented by decrypting with the active/previous key and re-encrypting during connection use.
