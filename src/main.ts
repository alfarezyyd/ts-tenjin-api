import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import PrismaExceptionFilter from './exception/PrismaExceptionFilter';
import ValidationExceptionFilter from './exception/ValidationExceptionFilter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import MulterExceptionFilter from './exception/MulterExceptionFilter';
import { IoAdapter } from '@nestjs/platform-socket.io';
import * as fs from 'node:fs';
import { ConfigService } from '@nestjs/config';

declare const module: any;

async function bootstrap() {
  let app = await NestFactory.create(AppModule);

  // Ambil ConfigService
  const configService = app.get(ConfigService);

  // Cek environment
  const environment = configService.get<string>('ENVIRONMENT');
  let httpsOptions = undefined;

  if (environment !== 'DEVELOPMENT') {
    httpsOptions = {
      key: fs.readFileSync('/etc/letsencrypt/live/tenjin.web.id/privkey.pem'),
      cert: fs.readFileSync(
        '/etc/letsencrypt/live/tenjin.web.id/fullchain.pem',
      ),
    };
  }

  // Jika HTTPS diperlukan, buat ulang app dengan HTTPS options
  if (httpsOptions) {
    await app.close(); // Tutup instance sebelumnya
    app = await NestFactory.create(AppModule, { httpsOptions });
  }
  app.enableCors({
    origin: ['http://localhost:3000', 'https://tenjin-lake.vercel.app/'], // Allow requests from this origin
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

  await app.listen(8080, '0.0.0.0');
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}

bootstrap();
