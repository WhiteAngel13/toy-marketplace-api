import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { StoreModule } from 'src/store/store.module';
import { CategoryModule } from 'src/category/category.module';
import { ProductMiddleware } from './product.config';

@Module({
  imports: [StoreModule, CategoryModule],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ProductMiddleware).forRoutes(ProductController);
  }
}
