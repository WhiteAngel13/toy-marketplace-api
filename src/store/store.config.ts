import {
  Injectable,
  CanActivate,
  ExecutionContext,
  createParamDecorator,
  NestMiddleware,
  SetMetadata,
  applyDecorators,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Request } from 'express';
import { Store } from './store.entity';
import { Observable } from 'rxjs';
import { StoreService } from './store.service';
import { User } from 'src/user/user.entity';
import { Reflector } from '@nestjs/core';

export const SHOULD_BE_STORE_OWNER_WATERMARK = 'has:construction:permissions';

export const ShouldBeStoreOwner = () => {
  return applyDecorators(SetMetadata(SHOULD_BE_STORE_OWNER_WATERMARK, true));
};

export const ReqStore = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): Store | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();
    if ('store' in request) return request.store as Store;
  },
);

@Injectable()
export class StoreMiddleware implements NestMiddleware {
  constructor(private readonly storeService: StoreService) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const id = req.params.id;
    if (!id) return next();

    const { store } = await this.storeService.get({
      where: { id },
      options: { throwIfNotFound: true },
    });

    req['store'] = store;
  }
}

@Injectable()
export class StoreGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const store = request['store'] as Store | undefined;
    const user = request['user'] as User | undefined;
    if (!store || !user) return true;

    const shouldBeStoreOwner = this.reflector.get<boolean>(
      SHOULD_BE_STORE_OWNER_WATERMARK,
      context.getHandler(),
    );

    if (!shouldBeStoreOwner) return true;
    if (store.owner_user_id === user.id) return true;

    throw new UnauthorizedException('You has no permission to do this');
  }
}
