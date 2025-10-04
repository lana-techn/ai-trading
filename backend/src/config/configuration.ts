export default () => ({
  app: {
    name: process.env.APP_NAME ?? 'Trader AI Backend',
    port: parseInt(process.env.PORT ?? '8000', 10),
    env: process.env.NODE_ENV ?? 'development',
    version: process.env.APP_VERSION ?? '1.0.0',
  },
  database: {
    url: process.env.DATABASE_URL ?? '',
    type: (process.env.DB_TYPE ?? '').toLowerCase(),
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? '',
    name: process.env.DB_NAME ?? 'trader_ai',
    path: process.env.DB_PATH ?? './data/trader-ai.sqlite',
    logging: (process.env.DB_LOGGING ?? 'false').toLowerCase() === 'true',
  },
  cors: {
    origins: (process.env.CORS_ORIGINS ?? 'http://localhost:3000')
      .split(',')
      .map(origin => origin.trim())
      .filter(origin => origin.length > 0),
  },
  marketData: {
    alphaVantageKey: process.env.ALPHA_VANTAGE_API_KEY ?? 'demo',
  },
  chat: {
    memoryLimit: parseInt(process.env.CHAT_MEMORY_LIMIT ?? '20', 10),
  },
  ai: {
    geminiApiKey: process.env.GEMINI_API_KEY ?? '',
    openRouterApiKey: process.env.OPENROUTER_API_KEY ?? '',
  },
});
