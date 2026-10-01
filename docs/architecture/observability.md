# Observability and usage

Provider operations expose duration and token metadata through the AI abstraction. Usage records now have workspace, user, product, job, provider, model, token, image-count, duration, and estimated-cost fields. API error responses use stable codes such as `AUTH_REQUIRED`, `RATE_LIMITED`, and provider failure codes. Secrets, tokens, passwords, and authorization headers must never be logged. The job ID is the correlation key for future worker logs.
