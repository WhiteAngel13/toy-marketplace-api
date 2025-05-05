import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { drizzleCart } from './cart.drizzle.schema';
import { OrderStatus } from 'src/order/order.entity';

export const drizzleOrder = pgTable('orders', {
  id: text('id').primaryKey(),
  cart_id: text('cart_id')
    .notNull()
    .references(() => drizzleCart.id),
  status: text('status').notNull().$type<OrderStatus>(),
  created_at: timestamp({ mode: 'date' }).notNull(),
  updated_at: timestamp({ mode: 'date' }).notNull(),
});

export const drizzleOrderColumns = {
  id: drizzleOrder.id,
  cart_id: drizzleOrder.cart_id,
  status: drizzleOrder.status,
  created_at: drizzleOrder.created_at,
  updated_at: drizzleOrder.updated_at,
};
