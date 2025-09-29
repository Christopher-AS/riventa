// src/lib/env.ts
export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  DATABASE_URL: process.env.DATABASE_URL ?? "",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? "",
  NEXT_PUBLIC_APP_URL:
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
};
