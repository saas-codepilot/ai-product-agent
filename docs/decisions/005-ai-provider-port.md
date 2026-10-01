# ADR 005: AI provider port with safe fallback

## Decision

Define one server-side AI interface for visual analysis, listing generation, and field regeneration. Use an OpenAI Responses adapter only when an environment key is present, otherwise return explicit unknowns or conservative deterministic copy.

## Consequences

The MVP is runnable without paid AI access and cannot accidentally expose a key to the browser. Real intelligence requires configuring `OPENAI_API_KEY`; provider metadata remains available for future usage accounting.
