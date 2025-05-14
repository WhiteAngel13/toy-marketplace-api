import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { randomUUID } from 'crypto';

export class Ad {
  @IsString()
  @ApiProperty({ description: 'ID do anúncio', example: randomUUID() })
  id!: string;

  @IsString()
  @ApiProperty({
    description: 'URL da imagem do anúncio',
    example: 'https://picsum.photos/200/300',
  })
  image_url!: string;

  @IsString()
  @ApiProperty({ description: 'ID da loja', example: randomUUID() })
  store_id!: string;

  @IsString()
  @ApiProperty({ description: 'ID do produto', example: randomUUID() })
  product_id!: string;

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
