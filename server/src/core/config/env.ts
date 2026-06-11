import dotenv from "dotenv";
import { z } from "zod";

// Load environment variables from .env file
dotenv.config();

// Inject test mocks if running in test context to prevent configuration validation crashes
if (process.env.NODE_ENV === "test") {
  process.env.MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/test_ai_trip_planner";
  process.env.JWT_SECRET = process.env.JWT_SECRET || "test_jwt_access_secret_key_holder";
  process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "test_jwt_refresh_secret_key_holder";
}

const envSchema = z.object({
  PORT: z.preprocess((val) => (val ? Number(val) : 5000), z.number().default(5000)),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  MONGODB_URI: z.string({
    required_error: "MONGODB_URI is required in environment variables",
  }),
  JWT_SECRET: z.string({
    required_error: "JWT_SECRET is required in environment variables",
  }),
  JWT_REFRESH_SECRET: z.string({
    required_error: "JWT_REFRESH_SECRET is required in environment variables",
  }),
  JWT_ACCESS_EXPIRATION: z.string().default("15m"),
  JWT_REFRESH_EXPIRATION: z.string().default("7d"),
  GEMINI_API_KEY: z.string().optional(),
  AMADEUS_CLIENT_ID: z.string().optional(),
  AMADEUS_CLIENT_SECRET: z.string().optional(),
  MAPBOX_ACCESS_TOKEN: z.string().optional(),
  ROME2RIO_API_KEY: z.string().optional(),
});

// Run validation
const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  // eslint-disable-next-line no-console
  console.error("❌ Invalid environment configurations:", parseResult.error.format());
  process.exit(1);
}

export const env = parseResult.data;
export type Env = z.infer<typeof envSchema>;
