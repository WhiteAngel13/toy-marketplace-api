import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from 'src/user/user.entity';
import { Request } from 'express';

export const IsPublic = Reflector.createDecorator();

export const LoggedUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): User | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();
    if ('user' in request) return request.user as User;
  },
);
