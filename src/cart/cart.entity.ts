import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import { randomUUID } from 'crypto';

export const CartStatusEnum = ['open', 'closed'] as const;

export type CartStatus = (typeof CartStatusEnum)[number];

export class CartProduct {
  @IsString()
  @ApiProperty({
    description: 'ID do produto no carrinho',
    example: randomUUID(),
  })
  id!: string;

  @IsString()
  @ApiProperty({
    description: 'ID do carrinho',
    example: randomUUID(),
  })
  cart_id!: string;

  @IsString()
  @ApiProperty({
    description: 'ID do produto',
    example: randomUUID(),
  })
  product_id!: string;

  @IsNumber()
  @ApiProperty({
    description: 'Quantidade do produto no carrinho',
    example: 2,
  })
  quantity!: number;

  @IsString()
  @ApiProperty({
    description: 'Data de criação do carrinho',
    example: new Date().toISOString(),
  })
  created_at!: string;

  @IsString()
  @ApiProperty({
    description: 'Data de atualização do carrinho',
    example: new Date().toISOString(),
  })
  updated_at!: string;
}

export class Cart {
  @IsString()
  @ApiProperty({
    description: 'ID do carrinho',
    example: randomUUID(),
  })
  id!: string;

  @IsString()
  @ApiProperty({
    description: 'ID do usuário',
    example: randomUUID(),
  })
  user_id!: string;

  @IsString()
  @ApiProperty({
    description: 'ID da loja',
    example: randomUUID(),
  })
  store_id!: string;

  @IsString()
  @ApiProperty({
    description: 'Status do carrinho',
    enum: CartStatusEnum,
    example: 'open',
  })
  status!: CartStatus;

  @IsString()
  @ApiProperty({
    description: 'Endereço de entrega do carrinho',
    example: 'Rua das Flores, 123, São Paulo - SP',
  })
  delivery_address?: string;

  @IsString()
  @ApiProperty({
    description: 'ID do método de pagamento',
    example: randomUUID(),
  })
  payment_method_id?: string;

  @IsString()
  @ApiProperty({
    description: 'ID do frete',
    example: randomUUID(),
  })
  shipping_id?: string;

  @IsString()
  @ApiProperty({
    description: 'ID do cupom de desconto',
    example: randomUUID(),
  })
  coupon_id?: string;

  @IsString()
  @ApiProperty({
    description: 'Data de criação do carrinho',
    example: new Date().toISOString(),
  })
  created_at!: string;

  @IsString()
  @ApiProperty({
    description: 'Data de atualização do carrinho',
    example: new Date().toISOString(),
  })
  updated_at!: string;
}
