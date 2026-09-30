# Research engine

`ResearchProvider` is the boundary for official APIs, approved search providers, feeds, or compliant retrieval. The core does not scrape a marketplace directly. The default Wikimedia Commons adapter uses its public API, returns source-backed media evidence, and leaves commercial fields absent when unavailable. The development provider remains available with `RESEARCH_PROVIDER=development` for deterministic tests.
