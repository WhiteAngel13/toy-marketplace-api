import {
  Injectable,
  CanActivate,
  ExecutionContext,
  createParamDecorator,
  NestMiddleware,
} from '@nestjs/common';
import { NextFunction, Request } from 'express';
import { Shipping } from './shipping.entity';
import { Observable } from 'rxjs';
import { ShippingService } from './shipping.service';
import { User } from 'src/user/user.entity';

export const ReqShipping = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): Shipping | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();
    if ('shipping' in request) return request.shipping as Shipping;
  },
);

@Injectable()
export class ShippingMiddleware implements NestMiddleware {
  constructor(private readonly shippingService: ShippingService) {}
  async use(req: Request, _: Response, next: NextFunction) {
    const id = req.params.id;
    if (!id) return next();

    const { shipping } = await this.shippingService.get({
      where: { id },
      options: { throwIfNotFound: true },
    });

    req['shipping'] = shipping;
    next();
  }
}

@Injectable()
export class ShippingGuard implements CanActivate {
  private needsValidationMethods = ['PUT', 'DELETE'];

  canActivate(
    ctx: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = ctx.switchToHttp().getRequest<Request>();

    const user = request['user'] as User;
    if (!user) return false;

    if (!this.needsValidationMethods.includes(request.method)) {
      return true;
    }

    return request['is_store_owner'] as boolean;
  }
}
