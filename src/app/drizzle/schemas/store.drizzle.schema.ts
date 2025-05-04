import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { drizzleUser } from './user.drizzle.schema';
import { drizzleProduct } from './product.drizzle.schema';

export const drizzleStore = pgTable('stores', {
  id: text().primaryKey(),
  name: text().notNull(),
  owner_user_id: text()
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

export const drizzleAd = pgTable('ads', {
  id: text().primaryKey(),
  image_url: text().notNull(),
  store_id: text()
    .notNull()
    .references(() => drizzleStore.id, { onDelete: 'cascade' }),
  product_id: text()
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

export const drizzleShipping = pgTable('shippings', {
  id: text().primaryKey(),
  store_id: text()
    .notNull()
    .references(() => drizzleStore.id, { onDelete: 'cascade' }),
  name: text().notNull(),
  price: integer().notNull(),
  delivery_time: integer().notNull(),
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

export const drizzlePaymentMethod = pgTable('payment_methods', {
  id: text().primaryKey(),
  store_id: text()
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

export const drizzleCoupon = pgTable('coupons', {
  id: text().primaryKey(),
  store_id: text()
    .notNull()
    .references(() => drizzleStore.id, { onDelete: 'cascade' }),
  code: text().notNull(),
  discount: integer().notNull(),
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
