import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import { randomUUID } from 'crypto';

export class Product {
  @IsString()
  @ApiProperty({ description: 'ID do produto', example: randomUUID() })
  id!: string;

  @IsString()
  @ApiProperty({ description: 'Título do produto', example: 'Pente de Cabelo' })
  title!: string;

  @IsString()
  @ApiProperty({
    description: 'URL da imagem do produto',
    example: 'https://picsum.photos/200/300',
  })
  image_url!: string;

  @IsString()
  @ApiProperty({ description: 'ID da categoria', example: randomUUID() })
  category_id!: string;

  @IsString()
  @ApiProperty({ description: 'ID da loja', example: randomUUID() })
  store_id!: string;

  @IsNumber()
  @ApiProperty({
    description:
      'Preço do produto (Em centavos com 2 dígitos, por exemplo, 10 reais seria: 1000)',
    example: 1000,
  })
  price!: number;

  @IsString()
  @ApiProperty({
    description: 'Data de criação do produto',
    example: new Date().toISOString(),
  })
  created_at!: string;

  @IsString()
  @ApiProperty({
    description: 'Data de atualização do produto',
    example: new Date().toISOString(),
  })
  updated_at!: string;
}
