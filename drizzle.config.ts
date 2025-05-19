import { defineConfig } from 'drizzle-kit';
import 'dotenv/config';

export default defineConfig({
  dialect: 'mysql',
  schema: './src/app/drizzle/schemas',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
