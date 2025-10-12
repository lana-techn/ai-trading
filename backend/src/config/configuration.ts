export default () => ({
  app: {
name: process.env.APP_NAME ?? 'NousTrade Backend',
    port: parseInt(process.env.PORT ?? '8000', 10),
    env: process.env.NODE_ENV ?? 'development',
    version: process.env.APP_VERSION ?? '1.0.0',
  },
  supabase: {
    url: process.env.SUPABASE_URL ?? '',
    anonKey: process.env.SUPABASE_ANON_KEY ?? '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
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
