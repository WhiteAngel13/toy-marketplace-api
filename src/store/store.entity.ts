import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { randomUUID } from 'crypto';

export class Store {
  @IsString()
  @ApiProperty({
    description: 'ID da loja',
    example: randomUUID(),
  })
  id!: string;

  @IsString()
  @ApiProperty({
    description: 'Nome da loja',
    example: 'Loja do João',
  })
  name!: string;

  @IsString()
  @ApiProperty({
    description: 'ID do usuário dono da loja',
    example: randomUUID(),
  })
  owner_user_id!: string;

  @IsString()
  @ApiProperty({
    description: 'Data de criação da loja',
    example: new Date().toISOString(),
  })
  created_at!: string;

  @IsString()
  @ApiProperty({
    description: 'Data de atualização da loja',
    example: new Date().toISOString(),
  })
  updated_at!: string;
}
