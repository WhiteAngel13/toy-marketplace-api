import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { APP_GUARD } from '@nestjs/core';
import { ProductGuard, ProductMiddleware } from './product.config';
import { StoreModule } from 'src/store/store.module';
import { CategoryModule } from 'src/category/category.module';

@Module({
  imports: [StoreModule, CategoryModule],
  controllers: [ProductController],
  providers: [ProductService, { provide: APP_GUARD, useClass: ProductGuard }],
  exports: [ProductService],
})
export class ProductModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ProductMiddleware).forRoutes(ProductController);
  }
}
