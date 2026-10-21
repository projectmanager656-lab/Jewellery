import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ path: process.env.SERVER_ENV_FILE || ".env.server" });

const configSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  CLIENT_ORIGIN: z.string().url().default("http://localhost:5173"),
  MONGODB_URI: z.string().default(""),
  MONGODB_DB_NAME: z.string().default("shree_jewellers"),
  JWT_SECRET: z.string().default(""),
  CLOUDINARY_CLOUD_NAME: z.string().default(""),
  CLOUDINARY_API_KEY: z.string().default(""),
  CLOUDINARY_API_SECRET: z.string().default(""),
});

const parsed = configSchema.safeParse(process.env);
if (!parsed.success) {
  throw new Error(`Invalid server configuration: ${parsed.error.issues.map((issue) => issue.path.join(".")).join(", ")}`);
}

export const config = Object.freeze({
  ...parsed.data,
  cloudinaryConfigured: Boolean(
    parsed.data.CLOUDINARY_CLOUD_NAME &&
      parsed.data.CLOUDINARY_API_KEY &&
      parsed.data.CLOUDINARY_API_SECRET,
  ),
  cookieName: "sj_admin_session",
  cookieSecure: parsed.data.NODE_ENV === "production",
  cookieMaxAgeMs: 8 * 60 * 60 * 1000,
});

export function assertRuntimeConfig() {
  const missing = [];
  if (!config.MONGODB_URI) missing.push("MONGODB_URI");
  if (config.JWT_SECRET.length < 32) missing.push("JWT_SECRET (at least 32 characters)");
  if (missing.length) {
    throw new Error(`Server cannot start. Configure: ${missing.join(", ")}. See .env.server.example.`);
  }
}
