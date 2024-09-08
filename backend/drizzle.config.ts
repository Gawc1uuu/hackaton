import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

dotenv.config();
if (!process.env.DB_CONNECTION_STRING) {
  throw new Error("CONNECTION_STRING not provided");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/singletons/Database/schema.ts",
  out: "./src/singletons/Database/migrations/drizzle",
  dbCredentials: {
    url: process.env.DB_CONNECTION_STRING,
  },
});
