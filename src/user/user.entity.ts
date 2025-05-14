import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsString } from 'class-validator';
import { randomUUID } from 'crypto';

export class User {
  @IsString()
  @ApiProperty({
    description: 'ID do usuário',
    example: randomUUID(),
  })
  id!: string;

  @IsString()
  @ApiProperty({
    description: 'Email do usuário',
    example: 'teste@gmail.com',
  })
  email!: string;

  @IsString()
  @Exclude()
  password_hash!: string;

  @IsString()
  @ApiProperty({
    description: 'Data de criação do usuário',
    example: new Date().toISOString(),
  })
  created_at!: string;

  @IsString()
  @ApiProperty({
    description: 'Data de atualização do usuário',
    example: new Date().toISOString(),
  })
  updated_at!: string;
}
