import { text, timestamp, mysqlTable, varchar } from 'drizzle-orm/mysql-core';

export const drizzleUser = mysqlTable('users', {
  id: varchar('id', { length: 191 }).primaryKey(),
  email: text().notNull(),
  password_hash: text().notNull(),
  created_at: timestamp({ mode: 'date' }).notNull(),
  updated_at: timestamp({ mode: 'date' }).notNull(),
});

export const drizzleUserColumns = {
  id: drizzleUser.id,
  email: drizzleUser.email,
  password_hash: drizzleUser.password_hash,
  created_at: drizzleUser.created_at,
  updated_at: drizzleUser.updated_at,
};
