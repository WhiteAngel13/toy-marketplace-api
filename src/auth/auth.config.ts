import {
  createParamDecorator,
  ExecutionContext,
  Injectable,
  CanActivate,
  UnauthorizedException,
  NestMiddleware,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { NextFunction, Request, Response } from 'express';
import { Observable } from 'rxjs';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { z } from 'zod';

export const IsPublic = Reflector.createDecorator();

export const LoggedUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): User | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();
    if ('user' in request) return request.user as User;
  },
);

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.get(IsPublic, context.getHandler());
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const hasUser = 'user' in request;
    if (hasUser) return true;

    throw new UnauthorizedException();
  }
}

const ExpectedPayloadSchema = z.object({ sub: z.string() });

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return next();

    const decoded = this.jwtService.decode<unknown>(token);
    const parsedPayload = ExpectedPayloadSchema.safeParse(decoded);
    if (!parsedPayload.success) return next();

    const { user } = await this.userService.get({
      where: { id: parsedPayload.data.sub },
      options: { throwIfNotFound: true },
    });

    req['user'] = user;
    next();
  }
}
