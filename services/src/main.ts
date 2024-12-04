import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './exceptionFilter/AllExceptionsFilter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {cors: true});
  app.useGlobalFilters(new AllExceptionsFilter());
  console.log('process.env.PORT:',process.env.PORT)
  await app.listen(process.env.PORT ?? 8003);
}
bootstrap();
