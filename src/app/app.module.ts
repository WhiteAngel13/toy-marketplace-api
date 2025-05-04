import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { JwtModule } from './jwt.module';
import { AuthMiddleware } from 'src/auth/config/auth.middleware';
import { APP_PIPE, APP_GUARD } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';
import { AuthGuard } from 'src/auth/config/auth.guard';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';
import { DrizzleModule } from './drizzle/drizzle.module';

@Module({
  imports: [JwtModule, UserModule, AuthModule, DrizzleModule],
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
