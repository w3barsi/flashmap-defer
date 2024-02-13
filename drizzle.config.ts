import { type Config } from "drizzle-kit";

import { env } from "~/env.js";

export default {
  schema: "./src/server/db/schema.ts",
  driver: "turso",
  dbCredentials: {
    url: env.TURSO_DATABASE_URL,
    authToken: env.TURSO_AUTH_TOKEN,
  },
  out: "./drizzle",
  tablesFilter: ["web_*"],
} satisfies Config;
