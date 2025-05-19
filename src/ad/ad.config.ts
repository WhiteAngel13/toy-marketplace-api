import {
  Injectable,
  CanActivate,
  ExecutionContext,
  createParamDecorator,
  NestMiddleware,
} from '@nestjs/common';
import { NextFunction, Request } from 'express';
import { Ad } from './ad.entity';
import { Observable } from 'rxjs';
import { AdService } from './ad.service';
import { User } from 'src/user/user.entity';
import { StoreService } from 'src/store/store.service';

export const ReqAd = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): Ad | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();
    if ('ad' in request) return request.ad as Ad;
  },
);

@Injectable()
export class AdMiddleware implements NestMiddleware {
  constructor(
    private readonly adService: AdService,
    private readonly storeService: StoreService,
  ) {}
  async use(req: Request, _: Response, next: NextFunction) {
    const id = req.params.id;
    if (!id) return next();

    const user = req['user'] as User;
    if (!user) return next();

    const { ad } = await this.adService.get({
      where: { id },
      options: { throwIfNotFound: true },
    });

    const { store } = await this.storeService.get({
      where: { id: ad.store_id },
      options: { throwIfNotFound: true },
    });

    req['ad'] = ad;
    req['store'] = store;
    req['is_store_owner'] = user.id === store.owner_user_id;
    next();
  }
}

@Injectable()
export class AdGuard implements CanActivate {
  private needsValidationMethods = ['PUT', 'DELETE'];

  canActivate(
    ctx: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request['user'] as User;
    if (!user) return false;

    if (!this.needsValidationMethods.includes(request.method)) return true;

    return request['is_store_owner'] as boolean;
  }
}
