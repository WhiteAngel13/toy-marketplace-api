import { Controller, Get } from '@nestjs/common';
import { User, UserSchema } from './user.entity';
import { LoggedUser } from 'src/auth/auth.config';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ApiOperation } from '@nestjs/swagger';

export const RestUserSchema = UserSchema.omit({ password_hash: true });

export const GetMeUserControllerResponseSchema = z.object({
  user: RestUserSchema,
});

export class GetMeUserControllerResponseDTO extends createZodDto(
  GetMeUserControllerResponseSchema,
) {}

const tags = ['Usuários'];

@Controller()
export class UserController {
  @Get('/v1/users/me')
  @ApiOperation({ summary: 'Detalhes do Usuário Logado', tags })
  getMe(@LoggedUser() user: User): GetMeUserControllerResponseDTO {
    return { user: RestUserSchema.parse(user) };
  }
}
