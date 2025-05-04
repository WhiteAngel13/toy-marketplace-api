import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ShippingService } from './shipping.service';
import { ShippingController } from './shipping.controller';
import { APP_GUARD } from '@nestjs/core';
import { ShippingGuard, ShippingMiddleware } from './shipping.config';
import { StoreModule } from 'src/store/store.module';

@Module({
  imports: [StoreModule],
  controllers: [ShippingController],
  providers: [ShippingService, { provide: APP_GUARD, useClass: ShippingGuard }],
  exports: [ShippingService],
})
export class ShippingModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ShippingMiddleware).forRoutes(ShippingController);
  }
}
