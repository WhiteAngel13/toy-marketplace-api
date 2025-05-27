import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { CategoryMiddleware } from './category.config';
import { StoreModule } from 'src/store/store.module';

@Module({
  imports: [StoreModule],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService],
})
export class CategoryModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CategoryMiddleware).forRoutes(CategoryController);
  }
}
