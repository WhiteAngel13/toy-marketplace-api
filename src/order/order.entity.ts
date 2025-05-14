import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { randomUUID } from 'crypto';

export const OrderStatusEnum = [
  'pending',
  'confirmed',
  'shipped',
  'delivered',
  'canceled',
] as const;

export type OrderStatus = (typeof OrderStatusEnum)[number];

export class Order {
  @IsString()
  @ApiProperty({ description: 'ID do pedido', example: randomUUID() })
  id!: string;

  @IsString()
  @ApiProperty({ description: 'ID do carrinho', example: randomUUID() })
  cart_id!: string;

  @IsString()
  @ApiProperty({
    description: 'Status do pedido',
    enum: OrderStatusEnum,
    example: 'pending',
  })
  status!: OrderStatus;

  @IsString()
  @ApiProperty({ description: 'Data de criação do pedido' })
  created_at!: string;

  @IsString()
  @ApiProperty({ description: 'Data de atualização do pedido' })
  updated_at!: string;
}
