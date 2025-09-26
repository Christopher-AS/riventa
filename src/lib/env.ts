import { z } from "zod";

const envSchema = z.object({
  OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY is required"),
  COMMIT_SHA: z.string().default("dev"),
});

const parsed = envSchema.safeParse({
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  COMMIT_SHA: process.env.COMMIT_SHA,
});

if (!parsed.success) {
  const message = parsed.error.errors
    .map((issue) => `${issue.path.join(".") || "environment"}: ${issue.message}`)
    .join("; ");

  throw new Error(`Invalid environment variables: ${message}`);
}

export const env = parsed.data;
