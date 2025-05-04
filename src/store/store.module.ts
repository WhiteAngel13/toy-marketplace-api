import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { StoreService } from './store.service';
import { StoreController } from './store.controller';
import { APP_GUARD } from '@nestjs/core';
import { StoreGuard, StoreMiddleware } from './store.config';

@Module({
  controllers: [StoreController],
  providers: [
    StoreService,
    {
      provide: APP_GUARD,
      useClass: StoreGuard,
    },
  ],
  exports: [StoreService],
})
export class StoreModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(StoreMiddleware).forRoutes(StoreController);
  }
}
