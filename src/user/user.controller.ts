import { Controller, Get } from '@nestjs/common';
import { User, UserSchema } from './user.entity';
import { LoggedUser } from 'src/auth/auth.config';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const RestUserSchema = UserSchema.omit({ password_hash: true });

export const GetMeUserControllerResponseSchema = z.object({
  user: RestUserSchema,
});

export class GetMeUserControllerResponseDTO extends createZodDto(
  GetMeUserControllerResponseSchema,
) {}

@Controller()
export class UserController {
  @Get('/v1/users/me')
  getMe(@LoggedUser() user: User): GetMeUserControllerResponseDTO {
    return { user: RestUserSchema.parse(user) };
  }
}
