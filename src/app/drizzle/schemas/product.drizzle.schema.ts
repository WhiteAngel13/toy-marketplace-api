import {
  mediumint,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/mysql-core';
import { drizzleStore } from './store.drizzle.schema';

export const drizzleCategory = mysqlTable('categories', {
  id: varchar('id', { length: 191 }).primaryKey(),
  name: text().notNull(),
  image_url: text().notNull(),
  store_id: varchar('store_id', { length: 191 })
    .notNull()
    .references(() => drizzleStore.id),
  created_at: timestamp({ mode: 'date' }).notNull(),
  updated_at: timestamp({ mode: 'date' }).notNull(),
});

export const drizzleCategoryColumns = {
  id: drizzleCategory.id,
  name: drizzleCategory.name,
  image_url: drizzleCategory.image_url,
  store_id: drizzleCategory.store_id,
  created_at: drizzleCategory.created_at,
  updated_at: drizzleCategory.updated_at,
};

export const drizzleProduct = mysqlTable('products', {
  id: varchar('id', { length: 191 }).primaryKey(),
  title: text().notNull(),
  category_id: varchar('category_id', { length: 191 })
    .notNull()
    .references(() => drizzleCategory.id),
  store_id: varchar('store_id', { length: 191 })
    .notNull()
    .references(() => drizzleStore.id),
  price: mediumint().notNull(),
  image_url: text().notNull(),
  created_at: timestamp({ mode: 'date' }).notNull(),
  updated_at: timestamp({ mode: 'date' }).notNull(),
});

export const drizzleProductColumns = {
  id: drizzleProduct.id,
  title: drizzleProduct.title,
  category_id: drizzleProduct.category_id,
  store_id: drizzleProduct.store_id,
  price: drizzleProduct.price,
  image_url: drizzleProduct.image_url,
  created_at: drizzleProduct.created_at,
  updated_at: drizzleProduct.updated_at,
};
