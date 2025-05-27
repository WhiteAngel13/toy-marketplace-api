import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { CartModule } from 'src/cart/cart.module';
import { OrderMiddleware } from './order.config';

@Module({
  imports: [CartModule],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(OrderMiddleware).forRoutes(OrderController);
  }
}
