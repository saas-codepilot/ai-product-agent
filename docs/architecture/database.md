# Database foundation

The intended normalized model centers on Workspace, Product, ProductImage, ResearchJob, ResearchCandidate, Listing, ListingField, ShopifyStore, PublishJob, and AuditLog. The current in-memory store mirrors these boundaries so persistence can be introduced without changing API contracts.
