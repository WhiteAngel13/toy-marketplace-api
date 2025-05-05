import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { eq, and, SQL } from 'drizzle-orm';
import {
  drizzleOrder,
  drizzleOrderColumns,
} from '../app/drizzle/schemas/order.drizzle.schema';
import { DrizzleService } from '../app/drizzle/drizzle.service';
import { Order } from './order.entity';
import { GetServiceOptions } from 'src/app/utils/types.utils';
import { randomUUID } from 'crypto';
import { User } from 'src/user/user.entity';
import { Cart } from 'src/cart/cart.entity';

export type GetOrderServiceParamsDTO<Options extends GetServiceOptions> = {
  where: FindOrderServiceParamsDTO['where'];
  options?: Options;
};

export type GetOrderServiceResponseDTO<Options extends GetServiceOptions> = {
  order: Options['throwIfNotFound'] extends true ? Order : Order | undefined;
};

export type FindOrderServiceParamsDTO = {
  where: { id?: string };
};

export type FindOrderServiceResponseDTO = {
  orders: Order[];
};

export type CreateOrderServiceParamsDTO = {
  cart: Cart;
};

export type CreateOrderServiceResponseDTO = {
  order: Order;
};

export type IsUserOrderOwnerServiceParamsDTO = {
  order: Order;
  user: User;
};

export type IsUserOrderOwnerServiceResponseDTO = {
  isOwner: boolean;
};

@Injectable()
export class OrderService {
  constructor(private readonly drizzleService: DrizzleService) {}

  async get<Options extends GetServiceOptions>(
    params: GetOrderServiceParamsDTO<Options>,
  ): Promise<GetOrderServiceResponseDTO<Options>> {
    const { orders } = await this.find({ where: params.where });

    if (orders.length === 0) {
      if (params.options?.throwIfNotFound)
        throw new NotFoundException(`Order not found`);

      return { order: undefined } as GetOrderServiceResponseDTO<Options>;
    }

    if (orders.length > 1) {
      throw new InternalServerErrorException(
        `More than one Order found, expected only one`,
      );
    }

    const order = orders[0];

    return { order } as GetOrderServiceResponseDTO<Options>;
  }

  async find(
    params: FindOrderServiceParamsDTO,
  ): Promise<FindOrderServiceResponseDTO> {
    const dynamicQuery = this.drizzleService.db
      .select(drizzleOrderColumns)
      .from(drizzleOrder)
      .$dynamic();

    const wheres: SQL[] = [];

    if (params.where.id) {
      wheres.push(eq(drizzleOrderColumns.id, params.where.id));
    }

    dynamicQuery.where(and(...wheres));

    const ordersData = await dynamicQuery;

    const orders = ordersData.map((orderData): Order => {
      return {
        id: orderData.id,
        cart_id: orderData.cart_id,
        status: orderData.status,
        created_at: orderData.created_at.toISOString(),
        updated_at: orderData.updated_at.toISOString(),
      };
    });

    return { orders };
  }

  async create(
    params: CreateOrderServiceParamsDTO,
  ): Promise<CreateOrderServiceResponseDTO> {
    const { cart } = params;

    const id = randomUUID();
    const now = new Date().toISOString();

    if (cart.status !== 'open')
      throw new BadRequestException('Cart is not open');

    const order: Order = {
      id,
      cart_id: cart.id,
      status: 'pending',
      created_at: now,
      updated_at: now,
    };

    await this.drizzleService.db.insert(drizzleOrder).values({
      ...order,
      created_at: new Date(order.created_at),
      updated_at: new Date(order.updated_at),
    });

    return { order };
  }
}
