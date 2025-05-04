import { defineConfig } from 'drizzle-kit';
import 'dotenv/config';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/app/infra/drizzle/schemas',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
