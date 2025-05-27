import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { hash, verify } from 'argon2';
import { User } from 'src/user/user.entity';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard, IsPublic } from './auth.config';
import { ApiOperation, ApiProperty, ApiResponse } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class SignInAuthControllerBodyDTO {
  @IsEmail()
  @ApiProperty({
    description: 'Email do usuário',
    example: 'teste@gmail.com',
  })
  email!: string;

  @IsString()
  @ApiProperty({
    description: 'Senha do usuário',
    example: '123456',
  })
  password!: string;
}

export class SignInAuthControllerResponseDTO {
  @IsString()
  @ApiProperty({
    description: 'Token de autenticação',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  auth_token!: string;
}

export class SignUpAuthControllerBodyDTO {
  @IsEmail()
  @ApiProperty({
    description: 'Email do usuário',
    example: 'teste@gmail.com',
  })
  email!: string;

  @IsString()
  @ApiProperty({
    description: 'Senha do usuário',
    example: '123456',
  })
  password!: string;
}

export class SignUpAuthControllerResponseDTO {
  @IsString()
  @ApiProperty({
    description: 'Token de autenticação',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  auth_token!: string;
}

const tags = ['Autenticação'];

@Controller()
@UseGuards(AuthGuard)
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  @IsPublic()
  @Post('/v1/auth/signin')
  @ApiOperation({ summary: 'Fazer Login', tags })
  @ApiResponse({ type: SignInAuthControllerResponseDTO })
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
  @ApiOperation({ summary: 'Criar Conta', tags })
  @ApiResponse({ type: SignUpAuthControllerResponseDTO })
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
