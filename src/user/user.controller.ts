import { Controller, Get } from '@nestjs/common';
import { LoggedUser } from 'src/auth/config/auth.decorator';
import { User } from './user.entity';
import {
  GetMeUserControllerResponseDTO,
  RestUserSchema,
} from './user.controller.dtos';

@Controller()
export class UserController {
  @Get('/v1/users/me')
  getMe(@LoggedUser() user: User): GetMeUserControllerResponseDTO {
    return { user: RestUserSchema.parse(user) };
  }
}
