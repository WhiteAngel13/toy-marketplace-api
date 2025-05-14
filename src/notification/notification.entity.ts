import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';
import { randomUUID } from 'crypto';

export class Notification {
  @IsString()
  @ApiProperty({ description: 'ID da notificação', example: randomUUID() })
  id!: string;

  @IsString()
  @ApiProperty({ description: 'ID do usuário', example: randomUUID() })
  user_id!: string;

  @IsString()
  @ApiProperty({ description: 'Título da notificação', example: 'Novo pedido' })
  title!: string;

  @IsString()
  @ApiProperty({
    description: 'Mensagem da notificação',
    example: 'Você recebeu um novo pedido',
  })
  message!: string;

  @IsBoolean()
  @ApiProperty({ description: 'Status de leitura', example: false })
  read!: boolean;

  @ApiProperty({ description: 'Metadados adicionais' })
  metadata!: any;

  @IsString()
  @ApiProperty({
    description: 'Data de criação',
    example: new Date().toISOString(),
  })
  created_at!: string;
}
