import compression from '@fastify/compress';
import cors from '@fastify/cors';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { useContainer } from 'class-validator';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  await app.register(compression);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.enableShutdownHooks();

  const configService = app.get(ConfigService);

  const logger = new Logger('NestApplication');
  const isCorsEnabled = configService.get<boolean>('common.cors');
  const name = configService.get<string>('common.name');
  const version = configService.get<string>('common.version');
  const environment = configService.get<string>('common.environment');
  const port = configService.get<number>('common.port');

  if (isCorsEnabled) {
    await app.register(cors, {
      origin: configService.get<string | string[]>('common.corsDomains'),
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    });
  }

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  const docBuilder = new DocumentBuilder()
    .setTitle('Tic Tac Toe API')
    .setDescription('OAuth2 Tic Tac Toe Game API')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access-token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, docBuilder);
  SwaggerModule.setup('docs', app, document, {
    customCssUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js',
    ],
  });

  await app.listen({ port, host: '0.0.0.0' });
  logger.log(`${name} - ${version}`);
  logger.log(`On ${environment} environment`);
  logger.log(`Enable CORS ${isCorsEnabled}`);
  logger.log(`Started on port ${port}`);
}

bootstrap();
