import { Controller, Get } from '@nestjs/common';
import { User } from './user.entity';
import { LoggedUser } from 'src/auth/auth.config';
import {
  ApiOperation,
  ApiProperty,
  ApiResponse,
  OmitType,
} from '@nestjs/swagger';
import { Exclude, plainToInstance } from 'class-transformer';

class RestUser extends OmitType(User, ['password_hash'] as const) {
  @Exclude()
  password_hash!: string;
}

export class GetMeUserControllerResponseDTO {
  @ApiProperty({ type: RestUser })
  user!: RestUser;
}

const tags = ['Usuários'];

@Controller()
export class UserController {
  @Get('/v1/users/me')
  @ApiOperation({ summary: 'Detalhes do Usuário Logado', tags })
  @ApiResponse({ type: GetMeUserControllerResponseDTO })
  getMe(@LoggedUser() user: User): GetMeUserControllerResponseDTO {
    const restUser = plainToInstance(RestUser, user);
    return { user: restUser };
  }
}
