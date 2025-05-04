import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AdService } from './ad.service';
import { AdController } from './ad.controller';
import { APP_GUARD } from '@nestjs/core';
import { AdGuard, AdMiddleware } from './ad.config';
import { StoreModule } from 'src/store/store.module';
import { ProductModule } from 'src/product/product.module';

@Module({
  imports: [StoreModule, ProductModule],
  controllers: [AdController],
  providers: [AdService, { provide: APP_GUARD, useClass: AdGuard }],
  exports: [AdService],
})
export class AdModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AdMiddleware).forRoutes(AdController);
  }
}
