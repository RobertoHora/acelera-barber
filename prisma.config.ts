try {
  // @ts-ignore Node 20.6+ native env loader
  if (typeof process.loadEnvFile === 'function') process.loadEnvFile();
} catch {}
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"] || "postgresql://ubuntu@localhost:5433/eleva_agenda_production?host=/home/ubuntu/orc-db",
  },
});
