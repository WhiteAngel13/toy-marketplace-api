import { mediumint, mysqlTable, text, timestamp } from 'drizzle-orm/mysql-core';
import { drizzleUser } from './user.drizzle.schema';
import {
  drizzleCoupon,
  drizzlePaymentMethod,
  drizzleShipping,
  drizzleStore,
} from './store.drizzle.schema';
import { drizzleProduct } from './product.drizzle.schema';
import { CartStatus } from 'src/cart/cart.entity';

export const drizzleCart = mysqlTable('carts', {
  id: text('id').primaryKey(),
  user_id: text('user_id')
    .notNull()
    .references(() => drizzleUser.id),
  store_id: text('store_id')
    .notNull()
    .references(() => drizzleStore.id),
  delivery_address: text('delivery_address'),
  status: text('status').notNull().$type<CartStatus>(),
  payment_method_id: text('payment_method_id').references(
    () => drizzlePaymentMethod.id,
  ),
  shipping_id: text('shipping_id').references(() => drizzleShipping.id),
  coupon_id: text('coupon_id').references(() => drizzleCoupon.id),
  created_at: timestamp({ mode: 'date' }).notNull(),
  updated_at: timestamp({ mode: 'date' }).notNull(),
});

export const drizzleCartColumns = {
  id: drizzleCart.id,
  user_id: drizzleCart.user_id,
  store_id: drizzleCart.store_id,
  status: drizzleCart.status,
  delivery_address: drizzleCart.delivery_address,
  payment_method_id: drizzleCart.payment_method_id,
  shipping_id: drizzleCart.shipping_id,
  coupon_id: drizzleCart.coupon_id,
  created_at: drizzleCart.created_at,
  updated_at: drizzleCart.updated_at,
};

export const drizzleCartProduct = mysqlTable('cart_products', {
  id: text('id').primaryKey(),
  cart_id: text('cart_id')
    .notNull()
    .references(() => drizzleCart.id),
  product_id: text('product_id')
    .notNull()
    .references(() => drizzleProduct.id),
  quantity: mediumint('quantity').notNull(),
  created_at: timestamp({ mode: 'date' }).notNull(),
  updated_at: timestamp({ mode: 'date' }).notNull(),
});

export const drizzleCartProductColumns = {
  id: drizzleCartProduct.id,
  cart_id: drizzleCartProduct.cart_id,
  product_id: drizzleCartProduct.product_id,
  quantity: drizzleCartProduct.quantity,
  created_at: drizzleCartProduct.created_at,
  updated_at: drizzleCartProduct.updated_at,
};
