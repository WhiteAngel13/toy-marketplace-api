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
import { Notification } from './notification.entity';
import { Observable } from 'rxjs';
import { NotificationService } from './notification.service';
import { User } from 'src/user/user.entity';
import { Reflector } from '@nestjs/core';

export const SHOULD_BE_NOTIFICATION_OWNER_WATERMARK =
  'has:construction:permissions';

export const ShouldBeNotificationOwner = () => {
  return applyDecorators(
    SetMetadata(SHOULD_BE_NOTIFICATION_OWNER_WATERMARK, true),
  );
};

export const ReqNotification = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): Notification | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();
    if ('notification' in request) return request.notification as Notification;
  },
);

@Injectable()
export class NotificationMiddleware implements NestMiddleware {
  constructor(private readonly notificationService: NotificationService) {}
  async use(req: Request, _: Response, next: NextFunction) {
    const id = req.params.id;
    if (!id) return next();

    const { notification } = await this.notificationService.get({
      where: { id },
      options: { throwIfNotFound: true },
    });

    req['notification'] = notification;
    next();
  }
}

@Injectable()
export class NotificationGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const notification = request['notification'] as Notification | undefined;
    const user = request['user'] as User | undefined;
    if (!notification || !user) return true;

    const shouldBeNotificationOwner = this.reflector.get<boolean>(
      SHOULD_BE_NOTIFICATION_OWNER_WATERMARK,
      context.getHandler(),
    );

    if (!shouldBeNotificationOwner) return true;
    if (notification.user_id === user.id) return true;

    throw new ForbiddenException();
  }
}
