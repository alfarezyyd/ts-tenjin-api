import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import PrismaExceptionFilter from './exception/PrismaExceptionFilter';
import ValidationExceptionFilter from './exception/ValidationExceptionFilter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import MulterExceptionFilter from './exception/MulterExceptionFilter';
declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Exception Filter
  app.useGlobalFilters(new PrismaExceptionFilter());
  app.useGlobalFilters(new ValidationExceptionFilter());
  app.useGlobalFilters(new MulterExceptionFilter());

  // Open API Swagger for Documentation
  const config = new DocumentBuilder()
    .setTitle('TENJIN - RESTful API DOCUMENTATION')
    .setDescription('TENJIN - REST API DOCUMENTATION for Client')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}

bootstrap();
