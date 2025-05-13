import { Controller, Get, Post } from '@nestjs/common';
import { OrderService } from './order.service';
import { createZodDto } from 'nestjs-zod';
import { Order, OrderSchema } from './order.entity';
import { z } from 'zod';
import { ReqOrder, ReqOrderCart } from './order.config';
import { Cart } from 'src/cart/cart.entity';
import { ApiOperation } from '@nestjs/swagger';

export const ListOrderControllerResponseSchema = z.object({
  orders: z.array(OrderSchema),
});

export class ListOrderControllerResponseDTO extends createZodDto(
  ListOrderControllerResponseSchema,
) {}

export const GetOrderControllerResponseSchema = z.object({
  order: OrderSchema,
});

export class GetOrderControllerResponseDTO extends createZodDto(
  GetOrderControllerResponseSchema,
) {}

const tags = ['Pedidos'];

@Controller()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get('/v1/orders')
  @ApiOperation({ summary: 'Listagem de Pedidos', tags })
  async find(): Promise<ListOrderControllerResponseDTO> {
    const { orders } = await this.orderService.find({
      where: {},
    });
    return { orders };
  }

  @Get('/v1/orders/:id')
  @ApiOperation({ summary: 'Detalhes de Pedido por ID', tags })
  get(@ReqOrder() order: Order): GetOrderControllerResponseDTO {
    return { order };
  }

  @Post('/v1/orders')
  @ApiOperation({ summary: 'Criar Pedido', tags })
  async create(
    @ReqOrderCart() cart: Cart,
  ): Promise<GetOrderControllerResponseDTO> {
    const { order } = await this.orderService.create({ cart });
    return { order };
  }
}
