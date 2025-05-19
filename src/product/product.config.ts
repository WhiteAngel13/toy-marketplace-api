import {
  Injectable,
  CanActivate,
  ExecutionContext,
  createParamDecorator,
  NestMiddleware,
} from '@nestjs/common';
import { NextFunction, Request } from 'express';
import { Product } from './product.entity';
import { Observable } from 'rxjs';
import { ProductService } from './product.service';
import { User } from 'src/user/user.entity';
import { StoreService } from 'src/store/store.service';

export const ReqProduct = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): Product | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();
    if ('product' in request) return request.product as Product;
  },
);

@Injectable()
export class ProductMiddleware implements NestMiddleware {
  constructor(
    private readonly productService: ProductService,
    private readonly storeService: StoreService,
  ) {}

  async use(req: Request, _: Response, next: NextFunction) {
    const id = req.params.id;
    if (!id) return next();

    const user = req['user'] as User;
    if (!user) return next();

    const { product } = await this.productService.get({
      where: { id },
      options: { throwIfNotFound: true },
    });

    const { store } = await this.storeService.get({
      where: { id: product.store_id },
      options: { throwIfNotFound: true },
    });

    req['product'] = product;
    req['store'] = store;
    req['is_store_owner'] = user.id === store.owner_user_id;
    next();
  }
}

@Injectable()
export class ProductGuard implements CanActivate {
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
