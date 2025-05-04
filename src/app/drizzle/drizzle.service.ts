import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

@Injectable()
export class DrizzleService implements OnModuleInit, OnModuleDestroy {
  private internalDb!: ReturnType<typeof drizzle>;

  get db() {
    return this.internalDb;
  }

  async onModuleInit() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString)
      throw new Error('DATABASE_URL is not set in environment variables');
    const pool = new Pool({ connectionString });
    this.internalDb = drizzle({ client: pool });
    await this.internalDb.execute('select 1');
  }

  async onModuleDestroy() {
    const client = this.internalDb.$client as Pool;
    await client.end();
  }
}
