import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ScalarModule } from './scalar/scalar.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const baseUrl = process.env.BASE_URL;
  if (!baseUrl) throw new Error('BASE_URL environment variable is not set');

  ScalarModule.setup(app, {
    documentConfig: {
      info: {
        title: 'Mazonia API',
        description: 'Mazonia API',
        version: '1.0.0',
      },
      openapi: '3.0.0',
      servers: [{ url: baseUrl }],
    },
    routes: {
      json: '/openapi.json',
      html: '/api-docs',
    },
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch(console.error);
