# ADR 008: Persistent runtime adapters

Redis and object storage are introduced behind the existing queue and storage ports. This preserves deterministic local tests while making production fallback explicit: the runtime validates required configuration and fails readiness rather than silently losing work or storing private files locally. Sharp is used for deterministic server-side image variants; no generative image path is added.
