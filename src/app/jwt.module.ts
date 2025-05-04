import { JwtModule as NestJwtModule } from '@nestjs/jwt';

export const JwtModule = NestJwtModule.registerAsync({
  global: true,
  useFactory: () => {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET is not defined');
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN_ZEIT_MS || '1h';

    return {
      secret,
      signOptions: {
        expiresIn: jwtExpiresIn,
        issuer: 'mazonia',
        audience: 'heynova.ai',
      },
    };
  },
});
