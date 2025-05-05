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

export const ReqPaymentMethod = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): PaymentMethod | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();
    if ('payment_method' in request)
      return request.payment_method as PaymentMethod;
  },
);

@Injectable()
export class PaymentMethodMiddleware implements NestMiddleware {
  constructor(private readonly paymentMethodService: PaymentMethodService) {}
  async use(req: Request, _: Response, next: NextFunction) {
    const id = req.params.id;
    if (!id) return next();

    const { paymentMethod } = await this.paymentMethodService.get({
      where: { id },
      options: { throwIfNotFound: true },
    });

    req['payment_method'] = paymentMethod;
    next();
  }
}

@Injectable()
export class PaymentMethodGuard implements CanActivate {
  canActivate(): boolean | Promise<boolean> | Observable<boolean> {
    return true;
  }
}
