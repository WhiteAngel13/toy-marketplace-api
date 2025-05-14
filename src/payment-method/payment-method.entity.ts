import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { randomUUID } from 'crypto';

export class PaymentMethod {
  @IsString()
  @ApiProperty({
    description: 'ID do método de pagamento',
    example: randomUUID(),
  })
  id!: string;

  @IsString()
  @ApiProperty({
    description: 'Nome do método de pagamento',
    example: 'Cartão de Crédito',
  })
  name!: string;

  @IsString()
  @ApiProperty({ description: 'ID da loja', example: randomUUID() })
  store_id!: string;

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
