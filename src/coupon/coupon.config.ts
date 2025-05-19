import {
  Injectable,
  CanActivate,
  createParamDecorator,
  NestMiddleware,
  ExecutionContext,
} from '@nestjs/common';
import { NextFunction, Request } from 'express';
import { Coupon } from './coupon.entity';
import { Observable } from 'rxjs';
import { CouponService } from './coupon.service';
import { User } from 'src/user/user.entity';
import { StoreService } from 'src/store/store.service';

export const ReqCoupon = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): Coupon | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();
    if ('coupon' in request) return request.coupon as Coupon;
  },
);

@Injectable()
export class CouponMiddleware implements NestMiddleware {
  constructor(
    private readonly couponService: CouponService,
    private readonly storeService: StoreService,
  ) {}
  async use(req: Request, _: Response, next: NextFunction) {
    const id = req.params.id;
    if (!id) return next();
    const user = req['user'] as User;
    if (!user) return next();

    const { coupon } = await this.couponService.get({
      where: { id },
      options: { throwIfNotFound: true },
    });

    const { store } = await this.storeService.get({
      where: { id: coupon.store_id },
      options: { throwIfNotFound: true },
    });

    req['coupon'] = coupon;
    req['store'] = store;
    req['is_store_owner'] = user.id === store.owner_user_id;
    next();
  }
}

@Injectable()
export class CouponGuard implements CanActivate {
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
