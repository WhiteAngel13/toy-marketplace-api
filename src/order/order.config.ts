import {
  Injectable,
  CanActivate,
  ExecutionContext,
  createParamDecorator,
  NestMiddleware,
  SetMetadata,
  applyDecorators,
  ForbiddenException,
} from '@nestjs/common';
import { NextFunction, Request } from 'express';
import { Order } from './order.entity';
import { Observable } from 'rxjs';
import { OrderService } from './order.service';
import { User } from 'src/user/user.entity';
import { Reflector } from '@nestjs/core';
import { CartService } from 'src/cart/cart.service';
import { Cart } from 'src/cart/cart.entity';

export const SHOULD_BE_ORDER_OWNER_WATERMARK = 'has:construction:permissions';

export const ShouldBeOrderOwner = () => {
  return applyDecorators(SetMetadata(SHOULD_BE_ORDER_OWNER_WATERMARK, true));
};

export const ReqOrder = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): Order | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();
    if ('order' in request) return request.order as Order;
  },
);

export const ReqOrderCart = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): Cart | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();
    if ('cart' in request) return request.cart as Cart;
  },
);

@Injectable()
export class OrderMiddleware implements NestMiddleware {
  constructor(
    private readonly orderService: OrderService,
    private readonly cartService: CartService,
  ) {}

  async use(req: Request, _: Response, next: NextFunction) {
    const id = req.params.id;
    if (!id) return next();

    const { order } = await this.orderService.get({
      where: { id },
      options: { throwIfNotFound: true },
    });

    req['order'] = order;

    const { cart } = await this.cartService.get({
      where: { id },
      options: { throwIfNotFound: true },
    });

    req['cart'] = cart;

    next();
  }
}

@Injectable()
export class OrderGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const order = request['order'] as Order | undefined;
    const user = request['user'] as User | undefined;
    const cart = request['cart'] as Cart | undefined;
    if (!order || !user || !cart) return true;

    const shouldBeOrderOwner = this.reflector.get<boolean>(
      SHOULD_BE_ORDER_OWNER_WATERMARK,
      context.getHandler(),
    );

    if (!shouldBeOrderOwner) return true;
    if (cart.user_id === user.id) return true;

    throw new ForbiddenException();
  }
}
