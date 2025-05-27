import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CouponController } from './coupon.controller';
import { StoreModule } from 'src/store/store.module';
import { CouponMiddleware } from './coupon.config';

@Module({
  imports: [StoreModule],
  controllers: [CouponController],
  providers: [CouponService],
  exports: [CouponService],
})
export class CouponModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CouponMiddleware).forRoutes(CouponController);
  }
}
