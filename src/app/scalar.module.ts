import { INestApplication } from '@nestjs/common';
import {
  OpenAPIObject,
  SwaggerDocumentOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { Request, Response } from 'express';

export type ScalarModuleDocumentConfig = Omit<OpenAPIObject, 'paths'>;

export type ScalarModuleConfig = {
  routes: { json: string; html: string };
  documentConfig: ScalarModuleDocumentConfig;
  documentOptions?: SwaggerDocumentOptions;
};

export class ScalarModule {
  static setup(app: INestApplication, config: ScalarModuleConfig) {
    const swaggerDocument = SwaggerModule.createDocument(
      app,
      config.documentConfig,
      config.documentOptions,
    );

    app.use(config.routes.json, (req: Request, res: Response) => {
      res.json(swaggerDocument);
    });

    app.use(
      config.routes.html,
      apiReference({
        url: '/openapi.json',
        hideModels: true,
        hiddenClients: true,
        hideClientButton: true,
        metaData: {
          title: "Mazonia's Api Documentation",
        },
      }),
    );
  }
}
