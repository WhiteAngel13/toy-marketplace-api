import { z } from 'zod';
import { UserSchema } from './user.entity';
import { createZodDto } from 'nestjs-zod';

export const RestUserSchema = UserSchema.omit({ password_hash: true });

export const GetMeUserControllerResponseSchema = z.object({
  user: RestUserSchema,
});

export class GetMeUserControllerResponseDTO extends createZodDto(
  GetMeUserControllerResponseSchema,
) {}
