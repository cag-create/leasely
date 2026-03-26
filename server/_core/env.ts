export const ENV = {
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  isProduction: process.env.NODE_ENV === "production",
  ownerEmail: process.env.OWNER_EMAIL ?? "",
  // Optional: Manus-compatible LLM proxy. Can also use OPENAI_API_KEY.
  appId: process.env.VITE_APP_ID ?? "leasely",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? process.env.OPENAI_API_BASE_URL ?? "https://api.openai.com/v1",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? process.env.OPENAI_API_KEY ?? "",
};
