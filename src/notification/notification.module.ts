import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { APP_GUARD } from '@nestjs/core';
import {
  NotificationGuard,
  NotificationMiddleware,
} from './notification.config';

@Module({
  controllers: [NotificationController],
  providers: [
    NotificationService,
    {
      provide: APP_GUARD,
      useClass: NotificationGuard,
    },
  ],
  exports: [NotificationService],
})
export class NotificationModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(NotificationMiddleware).forRoutes(NotificationController);
  }
}
