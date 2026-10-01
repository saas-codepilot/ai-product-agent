# Storage

`StorageProvider` exposes private upload/read/delete operations without leaking filesystem paths. Local development can use `MemoryStorageProvider` or `LocalFileStorageProvider`; production should provide an object-storage-compatible implementation and private signed access. Storage keys are opaque and must be workspace-scoped by the service layer. `STORAGE_ROOT` configures local storage, while object-storage credentials remain server-side.
