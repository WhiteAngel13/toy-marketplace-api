import {
  Injectable,
  CanActivate,
  ExecutionContext,
  createParamDecorator,
  NestMiddleware,
} from '@nestjs/common';
import { NextFunction, Request } from 'express';
import { Category } from './category.entity';
import { Observable } from 'rxjs';
import { CategoryService } from './category.service';

export const ReqCategory = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): Category | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();
    if ('category' in request) return request.category as Category;
  },
);

@Injectable()
export class CategoryMiddleware implements NestMiddleware {
  constructor(private readonly categoryService: CategoryService) {}
  async use(req: Request, _: Response, next: NextFunction) {
    const id = req.params.id;
    if (!id) return next();

    const { category } = await this.categoryService.get({
      where: { id },
      options: { throwIfNotFound: true },
    });

    req['category'] = category;
    next();
  }
}

@Injectable()
export class CategoryGuard implements CanActivate {
  canActivate(): boolean | Promise<boolean> | Observable<boolean> {
    return true;
  }
}
