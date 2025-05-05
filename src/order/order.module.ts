import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { APP_GUARD } from '@nestjs/core';
import { OrderGuard, OrderMiddleware } from './order.config';
import { CartModule } from 'src/cart/cart.module';

@Module({
  imports: [CartModule],
  controllers: [OrderController],
  providers: [
    OrderService,
    {
      provide: APP_GUARD,
      useClass: OrderGuard,
    },
  ],
  exports: [OrderService],
})
export class OrderModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(OrderMiddleware).forRoutes(OrderController);
  }
}
