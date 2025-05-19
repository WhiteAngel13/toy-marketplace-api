import {
  mediumint,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/mysql-core';
import { drizzleUser } from './user.drizzle.schema';
import { drizzleProduct } from './product.drizzle.schema';

export const drizzleStore = mysqlTable('stores', {
  id: varchar('id', { length: 191 }).primaryKey(),
  name: text().notNull(),
  owner_user_id: varchar('owner_user_id', { length: 191 })
    .notNull()
    .references(() => drizzleUser.id),
  created_at: timestamp({ mode: 'date' }).notNull(),
  updated_at: timestamp({ mode: 'date' }).notNull(),
});

export const drizzleStoreColumns = {
  id: drizzleStore.id,
  name: drizzleStore.name,
  owner_user_id: drizzleStore.owner_user_id,
  created_at: drizzleStore.created_at,
  updated_at: drizzleStore.updated_at,
};

export const drizzleAd = mysqlTable('ads', {
  id: varchar('id', { length: 191 }).primaryKey(),
  image_url: text().notNull(),
  store_id: varchar('store_id', { length: 191 })
    .notNull()
    .references(() => drizzleStore.id, { onDelete: 'cascade' }),
  product_id: varchar('product_id', { length: 191 })
    .notNull()
    .references(() => drizzleProduct.id, { onDelete: 'cascade' }),
  created_at: timestamp({ mode: 'date' }).notNull(),
  updated_at: timestamp({ mode: 'date' }).notNull(),
});

export const drizzleAdColumns = {
  id: drizzleAd.id,
  image_url: drizzleAd.image_url,
  store_id: drizzleAd.store_id,
  product_id: drizzleAd.product_id,
  created_at: drizzleAd.created_at,
  updated_at: drizzleAd.updated_at,
};

export const drizzleShipping = mysqlTable('shippings', {
  id: varchar('id', { length: 191 }).primaryKey(),
  store_id: varchar('store_id', { length: 191 })
    .notNull()
    .references(() => drizzleStore.id, { onDelete: 'cascade' }),
  name: text().notNull(),
  price: mediumint().notNull(),
  delivery_time: mediumint().notNull(),
  created_at: timestamp({ mode: 'date' }).notNull(),
  updated_at: timestamp({ mode: 'date' }).notNull(),
});

export const drizzleShippingColumns = {
  id: drizzleShipping.id,
  store_id: drizzleShipping.store_id,
  name: drizzleShipping.name,
  price: drizzleShipping.price,
  delivery_time: drizzleShipping.delivery_time,
  created_at: drizzleShipping.created_at,
  updated_at: drizzleShipping.updated_at,
};

export const drizzlePaymentMethod = mysqlTable('payment_methods', {
  id: varchar('id', { length: 191 }).primaryKey(),
  store_id: varchar('store_id', { length: 191 })
    .notNull()
    .references(() => drizzleStore.id, { onDelete: 'cascade' }),
  name: text().notNull(),
  created_at: timestamp({ mode: 'date' }).notNull(),
  updated_at: timestamp({ mode: 'date' }).notNull(),
});

export const drizzlePaymentMethodColumns = {
  id: drizzlePaymentMethod.id,
  store_id: drizzlePaymentMethod.store_id,
  name: drizzlePaymentMethod.name,
  created_at: drizzlePaymentMethod.created_at,
  updated_at: drizzlePaymentMethod.updated_at,
};

export const drizzleCoupon = mysqlTable('coupons', {
  id: varchar('id', { length: 191 }).primaryKey(),
  store_id: varchar('store_id', { length: 191 })
    .notNull()
    .references(() => drizzleStore.id, { onDelete: 'cascade' }),
  code: text().notNull(),
  discount: mediumint().notNull(),
  created_at: timestamp({ mode: 'date' }).notNull(),
  updated_at: timestamp({ mode: 'date' }).notNull(),
});

export const drizzleCouponColumns = {
  id: drizzleCoupon.id,
  store_id: drizzleCoupon.store_id,
  code: drizzleCoupon.code,
  discount: drizzleCoupon.discount,
  created_at: drizzleCoupon.created_at,
  updated_at: drizzleCoupon.updated_at,
};
