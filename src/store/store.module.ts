import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { StoreService } from './store.service';
import { StoreController } from './store.controller';
import { StoreMiddleware } from './store.config';

@Module({
  controllers: [StoreController],
  providers: [StoreService],
  exports: [StoreService],
})
export class StoreModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(StoreMiddleware).forRoutes(StoreController);
  }
}
