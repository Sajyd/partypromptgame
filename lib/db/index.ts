import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }
  return url;
}

export type AppDb = NeonHttpDatabase<typeof schema>;

let cached: AppDb | undefined;

export function getDb(): AppDb {
  if (!cached) {
    cached = drizzle(neon(requireDatabaseUrl()), { schema });
  }
  return cached;
}

export { schema };
