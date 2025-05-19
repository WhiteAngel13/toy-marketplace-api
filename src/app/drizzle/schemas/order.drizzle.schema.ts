import { mysqlTable, timestamp, varchar } from 'drizzle-orm/mysql-core';
import { drizzleCart } from './cart.drizzle.schema';
import { OrderStatus } from 'src/order/order.entity';

export const drizzleOrder = mysqlTable('orders', {
  id: varchar('id', { length: 191 }).primaryKey(),
  cart_id: varchar('cart_id', { length: 191 })
    .notNull()
    .references(() => drizzleCart.id),
  status: varchar('status', { length: 191 }).notNull().$type<OrderStatus>(),
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
