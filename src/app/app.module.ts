import {
  MiddlewareConsumer,
  Module,
  NestModule,
  ValidationPipe,
} from '@nestjs/common';
import { JwtModule } from './jwt.module';
import { APP_PIPE, APP_GUARD } from '@nestjs/core';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';
import { DrizzleModule } from './drizzle/drizzle.module';
import { AuthGuard, AuthMiddleware } from 'src/auth/auth.config';
import { StoreModule } from 'src/store/store.module';
import { CategoryModule } from 'src/category/category.module';
import { ProductModule } from 'src/product/product.module';
import { AdModule } from 'src/ad/ad.module';
import { CouponModule } from 'src/coupon/coupon.module';
import { PaymentMethodModule } from 'src/payment-method/payment-method.module';
import { ShippingModule } from 'src/shipping/shipping.module';
import { CartModule } from 'src/cart/cart.module';
import { NotificationModule } from 'src/notification/notification.module';
import { OrderModule } from 'src/order/order.module';

@Module({
  imports: [
    AdModule,
    AuthModule,
    CartModule,
    CategoryModule,
    CouponModule,
    NotificationModule,
    OrderModule,
    PaymentMethodModule,
    ProductModule,
    ShippingModule,
    StoreModule,
    UserModule,
    DrizzleModule,
    JwtModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({ whitelist: true, transform: true }),
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('*');
  }
}
