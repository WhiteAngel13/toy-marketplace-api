import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { randomUUID } from 'crypto';

export class Category {
  @IsString()
  @ApiProperty({ description: 'ID da categoria', example: randomUUID() })
  id!: string;

  @IsString()
  @ApiProperty({ description: 'Nome da categoria', example: 'Eletrônicos' })
  name!: string;

  @IsString()
  @ApiProperty({
    description: 'URL da imagem da categoria',
    example: 'https://picsum.photos/200/300',
  })
  image_url!: string;

  @IsString()
  @ApiProperty({ description: 'ID da loja', example: randomUUID() })
  store_id!: string;

  @IsString()
  @ApiProperty({
    description: 'Data de criação da categoria',
    example: new Date().toISOString(),
  })
  created_at!: string;

  @IsString()
  @ApiProperty({
    description: 'Data de atualização da categoria',
    example: new Date().toISOString(),
  })
  updated_at!: string;
}
