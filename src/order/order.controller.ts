import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { Order } from './order.entity';
import { OrderGuard, ReqOrder, ReqOrderCart } from './order.config';
import { Cart } from 'src/cart/cart.entity';
import { ApiOperation, ApiProperty, ApiResponse } from '@nestjs/swagger';

export class ListOrderControllerResponseDTO {
  @ApiProperty({ type: [Order] })
  orders!: Order[];
}

export class GetOrderControllerResponseDTO {
  @ApiProperty({ type: Order })
  order!: Order;
}

const tags = ['Pedidos'];

@Controller()
@UseGuards(OrderGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get('/v1/orders')
  @ApiOperation({ summary: 'Listagem de Pedidos', tags })
  @ApiResponse({ type: ListOrderControllerResponseDTO })
  async find(): Promise<ListOrderControllerResponseDTO> {
    const { orders } = await this.orderService.find({
      where: {},
    });
    return { orders };
  }

  @Get('/v1/orders/:id')
  @ApiOperation({ summary: 'Detalhes de Pedido por ID', tags })
  @ApiResponse({ type: GetOrderControllerResponseDTO })
  get(@ReqOrder() order: Order): GetOrderControllerResponseDTO {
    return { order };
  }

  @Post('/v1/orders')
  @ApiOperation({ summary: 'Criar Pedido', tags })
  @ApiResponse({ type: GetOrderControllerResponseDTO })
  async create(
    @ReqOrderCart() cart: Cart,
  ): Promise<GetOrderControllerResponseDTO> {
    const { order } = await this.orderService.create({ cart });
    return { order };
  }
}
