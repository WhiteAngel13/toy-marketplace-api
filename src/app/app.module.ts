import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { JwtModule } from './jwt.module';
import { APP_PIPE, APP_GUARD } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';
import { DrizzleModule } from './drizzle/drizzle.module';
import { AuthGuard, AuthMiddleware } from 'src/auth/auth.config';
import { StoreModule } from 'src/store/store.module';
import { CategoryModule } from 'src/category/category.module';
import { ProductModule } from 'src/product/product.module';

@Module({
  imports: [
    AuthModule,
    CategoryModule,
    ProductModule,
    StoreModule,
    UserModule,
    DrizzleModule,
    JwtModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
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
