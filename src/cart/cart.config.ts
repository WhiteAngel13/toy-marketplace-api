import {
  Injectable,
  CanActivate,
  ExecutionContext,
  createParamDecorator,
  NestMiddleware,
  ForbiddenException,
} from '@nestjs/common';
import { NextFunction, Request } from 'express';
import { Cart } from './cart.entity';
import { Observable } from 'rxjs';
import { CartService } from './cart.service';
import { User } from 'src/user/user.entity';

export const ReqCart = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): Cart | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();
    if ('cart' in request) return request.cart as Cart;
  },
);

export const ReqCartProduct = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): Cart | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();
    if ('cart_product' in request) return request.cart_product as Cart;
  },
);

@Injectable()
export class CartMiddleware implements NestMiddleware {
  constructor(private readonly cartService: CartService) {}
  async use(req: Request, _: Response, next: NextFunction) {
    const id = req.params.id;
    if (!id) return next();
    if (id === 'me') return next();

    const { cart } = await this.cartService.get({
      where: { id },
      options: { throwIfNotFound: true },
    });

    req['cart'] = cart;

    const cartProductId = req.params.cart_product_id;
    if (cartProductId) {
      const { cartProduct } = await this.cartService.getCartProduct({
        where: { id: cartProductId },
        options: { throwIfNotFound: true },
      });

      req['cart_product'] = cartProduct;
    }

    next();
  }
}

@Injectable()
export class CartGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const user = request['user'] as User;
    const cart = request['cart'] as Cart;

    if (!cart || !user) return true;

    if (cart.user_id !== user.id) throw new ForbiddenException();

    return true;
  }
}
