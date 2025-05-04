import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { hash, verify } from 'argon2';
import { User } from 'src/user/user.entity';
import { JwtService } from '@nestjs/jwt';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { IsPublic } from './auth.config';

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

@Controller()
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  @IsPublic()
  @Post('/v1/auth/signin')
  async signIn(
    @Body() body: SignInAuthControllerBodyDTO,
  ): Promise<SignInAuthControllerResponseDTO> {
    const { user } = await this.userService.get({
      where: { email: body.email },
      options: { throwIfNotFound: true },
    });

    const isPasswordValid = await verify(user.password_hash, body.password);
    if (!isPasswordValid) throw new BadRequestException('Invalid password');

    const { auth_token } = await this.getToken({ user });

    return { auth_token };
  }

  @IsPublic()
  @Post('/v1/auth/signup')
  async signUp(
    @Body() body: SignUpAuthControllerBodyDTO,
  ): Promise<SignUpAuthControllerResponseDTO> {
    const { user: userAlreadyExists } = await this.userService.get({
      where: { email: body.email },
    });

    if (userAlreadyExists) throw new BadRequestException('User already exists');

    const passwordHash = await hash(body.password);

    const { user } = await this.userService.create({
      data: { email: body.email, password_hash: passwordHash },
    });

    const { auth_token } = await this.getToken({ user });

    return { auth_token };
  }

  private async getToken(params: { user: User }): Promise<{
    auth_token: string;
  }> {
    const authTokenPayload = { sub: params.user.id };
    const authToken = await this.jwtService.signAsync(authTokenPayload);
    return { auth_token: authToken };
  }
}
