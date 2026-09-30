export const config = { port: Number(process.env.API_PORT ?? 4000), webOrigin: process.env.WEB_ORIGIN ?? 'http://localhost:3000', nodeEnv: process.env.NODE_ENV ?? 'development' };
