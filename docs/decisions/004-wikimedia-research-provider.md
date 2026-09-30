# ADR 004: Wikimedia Commons as the first real research adapter

## Context

The MVP needs a permitted provider without paid credentials or marketplace scraping.

## Decision

Use the public Wikimedia Commons API behind `ResearchProvider`. Normalize search results into candidates with source URLs, optional image URLs, confidence signals, and evidence excerpts. Missing commercial fields remain absent.

## Consequences

The adapter is useful for image/source discovery and safe local development, but it is not a substitute for a commerce search provider. Additional authorized adapters can be added without changing the API contract.
