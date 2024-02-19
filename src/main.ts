import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Meeting Room Booking System')
    .setDescription('The API for Meeting Room booking system')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('doc', app, document, {
    explorer: true
  });
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // app.setGlobalPrefix('api')
  app.enableCors()
  app.useStaticAssets('uploads', {
    prefix: '/uploads'
  })
  setupSwagger(app);

  const configService = app.get(ConfigService);
  await app.listen(configService.get('nest_server_port'));
}

bootstrap();

