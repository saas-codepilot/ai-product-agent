# Worker runtime

The worker boundary is separate from HTTP handlers. Workers should claim Redis jobs, execute reusable AI/research/media/Shopify domain operations, update job metadata, and retry only bounded transient failures. Job records carry workspace/product/provider/attempt/timing metadata. A worker restart calls stale-lease recovery so processing jobs do not remain stuck forever.
