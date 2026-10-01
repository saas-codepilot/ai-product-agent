# Media and storage

Media validation is centralized in `@ai-product-agent/media`. It enforces supported MIME types, size limits, safe filenames, and common JPEG/PNG/WebP signatures. `StorageProvider` separates local memory storage from object storage; only opaque storage keys belong in the domain. Original and derived assets should be separate records, with dimensions, alt text, and SEO filenames persisted alongside the key. Remote asset retrieval must pass the SSRF-safe URL boundary.
