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

export const ReqAd = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): Ad | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();
    if ('ad' in request) return request.ad as Ad;
  },
);

@Injectable()
export class AdMiddleware implements NestMiddleware {
  constructor(private readonly adService: AdService) {}
  async use(req: Request, _: Response, next: NextFunction) {
    const id = req.params.id;
    if (!id) return next();

    const { ad } = await this.adService.get({
      where: { id },
      options: { throwIfNotFound: true },
    });

    req['ad'] = ad;
    next();
  }
}

@Injectable()
export class AdGuard implements CanActivate {
  canActivate(): boolean | Promise<boolean> | Observable<boolean> {
    return true;
  }
}
