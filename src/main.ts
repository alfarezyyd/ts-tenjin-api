import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import PrismaExceptionFilter from './exception/PrismaExceptionFilter';
import ValidationExceptionFilter from './exception/ValidationExceptionFilter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import MulterExceptionFilter from './exception/MulterExceptionFilter';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { NoVerifiedEmailGuard } from './authentication/guard/no-verified-email.guard';
import PrismaService from './common/prisma.service';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:3000', // Allow requests from this origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  // Exception Filter
  app.useGlobalFilters(new PrismaExceptionFilter());
  app.useGlobalFilters(new ValidationExceptionFilter());
  app.useGlobalFilters(new MulterExceptionFilter());

  // Global Prefix
  app.setGlobalPrefix('api', {
    exclude: ['authentication/(.*)'],
  });

  // Global Guards
  // app.useGlobalGuards(
  //   new NoVerifiedEmailGuard(app.get(Reflector), app.get(PrismaService)),
  // );

  // Open API Swagger for Documentation
  const config = new DocumentBuilder()
    .setTitle('TENJIN - RESTful API DOCUMENTATION')
    .setDescription('TENJIN - REST API DOCUMENTATION for Client')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  BigInt.prototype['toJSON'] = function () {
    return this.toString();
  };
  app.useWebSocketAdapter(new IoAdapter(app));

  await app.listen(3001);
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}

bootstrap();
