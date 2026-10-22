process.env.DEV_AUTH_BYPASS = 'false';
process.env.SHOPIFY_MODE = 'development';
process.env.RESEARCH_PROVIDER = 'wikimedia';
await import('../apps/api/src/server.ts');
