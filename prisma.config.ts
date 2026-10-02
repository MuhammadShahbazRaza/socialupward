import { defineConfig } from "prisma/config";

// Prisma 7+ configuration. DATABASE_URL is used by `prisma migrate`,
// `prisma db push` and the seed script. Client generation
// (`prisma generate`) does not need a live database.
// Runtime connections are configured via the pg adapter in src/lib/prisma.ts.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
