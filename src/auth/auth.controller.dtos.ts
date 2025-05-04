import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const SignInAuthControllerBodySchema = z.object({
  email: z.string().email(),
  password: z.string(),
});
export class SignInAuthControllerBodyDTO extends createZodDto(
  SignInAuthControllerBodySchema,
) {}
export const SignInAuthControllerResponseSchema = z.object({
  auth_token: z.string(),
});
export class SignInAuthControllerResponseDTO extends createZodDto(
  SignInAuthControllerResponseSchema,
) {}

export const SignUpAuthControllerBodySchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export class SignUpAuthControllerBodyDTO extends createZodDto(
  SignUpAuthControllerBodySchema,
) {}

export const SignUpAuthControllerResponseSchema = z.object({
  auth_token: z.string(),
});

export class SignUpAuthControllerResponseDTO extends createZodDto(
  SignUpAuthControllerResponseSchema,
) {}
