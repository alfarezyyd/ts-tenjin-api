import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import PrismaExceptionFilter from './exception/PrismaExceptionFilter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Exception Filter
  app.useGlobalFilters(new PrismaExceptionFilter());

  // Interceptor
  await app.listen(3000);
}

bootstrap();
