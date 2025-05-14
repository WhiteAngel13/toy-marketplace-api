import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import { randomUUID } from 'crypto';

export class Coupon {
  @IsString()
  @ApiProperty({ description: 'ID do cupom', example: randomUUID() })
  id!: string;

  @IsString()
  @ApiProperty({ description: 'ID da loja', example: randomUUID() })
  store_id!: string;

  @IsString()
  @ApiProperty({ description: 'Código do cupom', example: 'DESCONTO10' })
  code!: string;

  @IsNumber()
  @ApiProperty({
    description:
      'Desconto do cupom (Em centavos com 2 dígitos, por exemplo, 10 reais seria: 1000)',
    example: 1000,
  })
  discount!: number;

  @IsString()
  @ApiProperty({
    description: 'Data de criação',
    example: new Date().toISOString(),
  })
  created_at!: string;

  @IsString()
  @ApiProperty({
    description: 'Data de atualização',
    example: new Date().toISOString(),
  })
  updated_at!: string;
}
