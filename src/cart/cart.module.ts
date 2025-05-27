import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { CartMiddleware } from './cart.config';
import { StoreModule } from 'src/store/store.module';
import { ProductModule } from 'src/product/product.module';

@Module({
  imports: [StoreModule, ProductModule],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CartMiddleware).forRoutes(CartController);
  }
}
