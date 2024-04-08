import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import PrismaExceptionFilter from './exception/PrismaExceptionFilter';
import ValidationExceptionFilter from './exception/ValidationExceptionFilter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Exception Filter
  app.useGlobalFilters(new PrismaExceptionFilter());
  app.useGlobalFilters(new ValidationExceptionFilter());

  // Open API Swagger for Documentation
  const config = new DocumentBuilder()
    .setTitle('ZENITH - ONLINE STORE RESTful API DOCUMENTATION')
    .setDescription('ZENITH - ONLINE STORE REST API DOCUMENTATION for Client')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Interceptor
  await app.listen(3000);
}

bootstrap();
