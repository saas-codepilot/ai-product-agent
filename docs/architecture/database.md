# Database foundation

Prisma models Workspace, User, Membership, Product, ProductImage, ProductAttribute, ResearchJob, ResearchCandidate, Evidence, ProductListing, ListingField, Generation, and AuditLog. Every product query is scoped by `workspaceId`; the Prisma repository is the only application boundary that issues database calls. The memory repository remains a test/local fallback when no `DATABASE_URL` is supplied.
