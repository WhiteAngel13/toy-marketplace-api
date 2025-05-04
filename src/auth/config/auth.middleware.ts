import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NextFunction, Request, Response } from 'express';
import { UserService } from 'src/user/user.service';
import { z } from 'zod';

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
