# AI and evidence pipeline

The API now runs an AI provider port with a server-side OpenAI Responses adapter when `OPENAI_API_KEY` exists. It accepts low-detail data URLs from the upload flow, requests structured JSON, and records provider/model/operation/latency/usage metadata. Without a key, the development adapter returns explicit unknowns and does not invent facts. Research adapters return normalized candidates and evidence; deterministic ranking then combines clue overlap with provider signals. Candidate claims retain `verified`, `inferred`, `unknown`, or `user-confirmed` status.
