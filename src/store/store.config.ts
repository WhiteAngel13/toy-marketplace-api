import {
  Injectable,
  CanActivate,
  ExecutionContext,
  createParamDecorator,
  NestMiddleware,
} from '@nestjs/common';
import { NextFunction, Request } from 'express';
import { Store } from './store.entity';
import { Observable } from 'rxjs';
import { StoreService } from './store.service';
import { User } from 'src/user/user.entity';

export const ReqStore = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): Store | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();
    if ('store' in request) return request.store as Store;
  },
);

@Injectable()
export class StoreMiddleware implements NestMiddleware {
  constructor(private readonly storeService: StoreService) {}
  async use(req: Request, _: Response, next: NextFunction) {
    const id = req.params.id;
    if (!id) return next();
    const user = req['user'] as User;
    if (!user) return next();

    const { store } = await this.storeService.get({
      where: { id },
      options: { throwIfNotFound: true },
    });

    req['store'] = store;
    req['is_store_owner'] = store.owner_user_id === user.id;

    next();
  }
}

@Injectable()
export class StoreGuard implements CanActivate {
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
