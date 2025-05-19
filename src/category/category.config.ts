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
import { User } from 'src/user/user.entity';
import { StoreService } from 'src/store/store.service';

export const ReqCategory = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): Category | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();
    if ('category' in request) return request.category as Category;
  },
);

@Injectable()
export class CategoryMiddleware implements NestMiddleware {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly storeService: StoreService,
  ) {}
  async use(req: Request, _: Response, next: NextFunction) {
    const id = req.params.id;
    if (!id) return next();

    const user = req['user'] as User;
    if (!user) return next();

    const { category } = await this.categoryService.get({
      where: { id },
      options: { throwIfNotFound: true },
    });

    const { store } = await this.storeService.get({
      where: { id: category.store_id },
      options: { throwIfNotFound: true },
    });

    req['category'] = category;
    req['store'] = store;
    req['is_store_owner'] = user.id === store.owner_user_id;

    next();
  }
}

@Injectable()
export class CategoryGuard implements CanActivate {
  constructor(private readonly categoryService: CategoryService) {}

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
