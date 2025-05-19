import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

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
    const connection = await mysql.createConnection({
      uri: connectionString,
    });

    this.internalDb = drizzle({ client: connection });
    await this.internalDb.execute('select 1');
  }

  async onModuleDestroy() {
    const client = this.internalDb.$client;
    await client.end();
  }
}
