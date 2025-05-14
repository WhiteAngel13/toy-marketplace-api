import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import { randomUUID } from 'crypto';

export class Shipping {
  @IsString()
  @ApiProperty({ description: 'ID do frete', example: randomUUID() })
  id!: string;

  @IsString()
  @ApiProperty({ description: 'ID da loja', example: randomUUID() })
  store_id!: string;

  @IsString()
  @ApiProperty({ description: 'Nome do frete', example: 'Motoboy' })
  name!: string;

  @IsNumber()
  @ApiProperty({
    description:
      'Preço do frete (Em centavos com 2 dígitos, por exemplo, 10 reais seria: 1000)',
    example: 1000,
  })
  price!: number;

  @IsNumber()
  @ApiProperty({
    description:
      'Tempo de entrega (Em milissegundos, por exemplo, 1 dia seria: 86400000)',
    example: 86400000,
  })
  delivery_time!: number;

  @IsString()
  @ApiProperty({
    description: 'Data de criação do frete',
    example: new Date().toISOString(),
  })
  created_at!: string;

  @IsString()
  @ApiProperty({
    description: 'Data de atualização do frete',
    example: new Date().toISOString(),
  })
  updated_at!: string;
}
