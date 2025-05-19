import {
  Injectable,
  CanActivate,
  ExecutionContext,
  createParamDecorator,
  NestMiddleware,
} from '@nestjs/common';
import { NextFunction, Request } from 'express';
import { Observable } from 'rxjs';
import { PaymentMethod } from './payment-method.entity';
import { PaymentMethodService } from './payment-method.service';
import { User } from 'src/user/user.entity';
import { StoreService } from 'src/store/store.service';

export const ReqPaymentMethod = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): PaymentMethod | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();
    if ('payment_method' in request)
      return request.payment_method as PaymentMethod;
  },
);

@Injectable()
export class PaymentMethodMiddleware implements NestMiddleware {
  constructor(
    private readonly paymentMethodService: PaymentMethodService,
    private readonly storeService: StoreService,
  ) {}

  async use(req: Request, _: Response, next: NextFunction) {
    const id = req.params.id;
    if (!id) return next();
    const user = req['user'] as User;
    if (!user) return next();

    const { paymentMethod } = await this.paymentMethodService.get({
      where: { id },
      options: { throwIfNotFound: true },
    });

    const { store } = await this.storeService.get({
      where: { id: paymentMethod.store_id },
      options: { throwIfNotFound: true },
    });

    req['payment_method'] = paymentMethod;
    req['store'] = store;
    req['is_store_owner'] = user.id === store.owner_user_id;
    next();
  }
}

@Injectable()
export class PaymentMethodGuard implements CanActivate {
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
