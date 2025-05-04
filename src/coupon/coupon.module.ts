import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CouponController } from './coupon.controller';
import { APP_GUARD } from '@nestjs/core';
import { CouponGuard, CouponMiddleware } from './coupon.config';
import { StoreModule } from 'src/store/store.module';

@Module({
  imports: [StoreModule],
  controllers: [CouponController],
  providers: [CouponService, { provide: APP_GUARD, useClass: CouponGuard }],
  exports: [CouponService],
})
export class CouponModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CouponMiddleware).forRoutes(CouponController);
  }
}
