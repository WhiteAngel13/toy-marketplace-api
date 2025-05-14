import { Controller, Get } from '@nestjs/common';
import { User } from './user.entity';
import { LoggedUser } from 'src/auth/auth.config';
import {
  ApiOperation,
  ApiProperty,
  ApiResponse,
  OmitType,
} from '@nestjs/swagger';

class RestUser extends OmitType(User, ['password_hash'] as const) {}

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
    return { user };
  }
}
