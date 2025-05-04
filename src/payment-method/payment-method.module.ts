import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { StoreModule } from 'src/store/store.module';
import {
  PaymentMethodGuard,
  PaymentMethodMiddleware,
} from './payment-method.config';
import { PaymentMethodController } from './payment-method.controller';
import { PaymentMethodService } from './payment-method.service';

@Module({
  imports: [StoreModule],
  controllers: [PaymentMethodController],
  providers: [
    PaymentMethodService,
    { provide: APP_GUARD, useClass: PaymentMethodGuard },
  ],
  exports: [PaymentMethodService],
})
export class PaymentMethodModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(PaymentMethodMiddleware).forRoutes(PaymentMethodController);
  }
}
