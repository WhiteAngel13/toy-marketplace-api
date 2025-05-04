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

export const ReqProduct = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): Product | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();
    if ('product' in request) return request.product as Product;
  },
);

@Injectable()
export class ProductMiddleware implements NestMiddleware {
  constructor(private readonly productService: ProductService) {}
  async use(req: Request, _: Response, next: NextFunction) {
    const id = req.params.id;
    if (!id) return next();

    const { product } = await this.productService.get({
      where: { id },
      options: { throwIfNotFound: true },
    });

    req['product'] = product;
  }
}

@Injectable()
export class ProductGuard implements CanActivate {
  canActivate(): boolean | Promise<boolean> | Observable<boolean> {
    return true;
  }
}
