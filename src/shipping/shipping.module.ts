import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ShippingService } from './shipping.service';
import { ShippingController } from './shipping.controller';
import { StoreModule } from 'src/store/store.module';
import { ShippingMiddleware } from './shipping.config';

@Module({
  imports: [StoreModule],
  controllers: [ShippingController],
  providers: [ShippingService],
  exports: [ShippingService],
})
export class ShippingModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ShippingMiddleware).forRoutes(ShippingController);
  }
}
