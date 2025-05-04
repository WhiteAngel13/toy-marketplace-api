import {
  Injectable,
  CanActivate,
  ExecutionContext,
  createParamDecorator,
  NestMiddleware,
} from '@nestjs/common';
import { NextFunction, Request } from 'express';
import { Coupon } from './coupon.entity';
import { Observable } from 'rxjs';
import { CouponService } from './coupon.service';

export const ReqCoupon = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): Coupon | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();
    if ('coupon' in request) return request.coupon as Coupon;
  },
);

@Injectable()
export class CouponMiddleware implements NestMiddleware {
  constructor(private readonly couponService: CouponService) {}
  async use(req: Request, _: Response, next: NextFunction) {
    const id = req.params.id;
    if (!id) return next();

    const { coupon } = await this.couponService.get({
      where: { id },
      options: { throwIfNotFound: true },
    });

    req['coupon'] = coupon;
  }
}

@Injectable()
export class CouponGuard implements CanActivate {
  canActivate(): boolean | Promise<boolean> | Observable<boolean> {
    return true;
  }
}
