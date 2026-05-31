import "dotenv/config";

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function optionalEnv(key: string, defaultValue: string = ""): string {
  return process.env[key] ?? defaultValue;
}

const _uploadMaxMb = parseInt(optionalEnv("MAX_IMAGE_UPLOAD_MB", "2"), 10);

export const config = {
  nodeEnv: optionalEnv("NODE_ENV", "development"),
  port: parseInt(optionalEnv("PORT", "4000"), 10),
  frontendUrl: optionalEnv("FRONTEND_URL", "http://localhost:5173"),

  supabase: {
    url: requireEnv("SUPABASE_URL"),
    anonKey: requireEnv("SUPABASE_ANON_KEY"),
    serviceRoleKey: requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  },

  usda: {
    apiKey: optionalEnv("USDA_FDC_API_KEY"),
  },

  calorieNinja: {
    apiKey: optionalEnv("CALORIE_NINJA_API_KEY"),
  },

  ai: {
    enabled: optionalEnv("ENABLE_AI_FOOD_MATCHING", "false") === "true",
    provider: optionalEnv("AI_PROVIDER", "GEMINI"),
    model: optionalEnv("AI_MODEL", "gemini-2.0-flash-lite"),
    advancedModel: optionalEnv("AI_ADVANCED_MODEL", "gemini-2.0-flash"),
    futureModel: optionalEnv("AI_FUTURE_MODEL", ""),
    geminiApiKey: optionalEnv("GEMINI_API_KEY"),
  },

  upload: {
    maxMb: _uploadMaxMb,
    maxSizeMb: _uploadMaxMb,
    maxSizeBytes: _uploadMaxMb * 1024 * 1024,
    allowedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  },

  isDevelopment(): boolean {
    return this.nodeEnv === "development";
  },

  isProduction(): boolean {
    return this.nodeEnv === "production";
  },
};

export type Config = typeof config;
