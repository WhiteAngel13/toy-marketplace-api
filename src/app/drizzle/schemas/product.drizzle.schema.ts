import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { drizzleStore } from './store.drizzle.schema';

export const drizzleCategory = pgTable('categories', {
  id: text().primaryKey(),
  name: text().notNull(),
  image_url: text().notNull(),
  store_id: text()
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

export const drizzleProduct = pgTable('products', {
  id: text().primaryKey(),
  title: text().notNull(),
  category_id: text()
    .notNull()
    .references(() => drizzleCategory.id),
  store_id: text()
    .notNull()
    .references(() => drizzleStore.id),
  price: integer().notNull(),
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
