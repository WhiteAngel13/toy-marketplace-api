import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { NotificationMiddleware } from './notification.config';

@Module({
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(NotificationMiddleware).forRoutes(NotificationController);
  }
}
