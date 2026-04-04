import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS - allow Railway frontend
  app.enableCors({
    origin: [
      'http://localhost:8080',
      'https://liftquest.up.railway.app',
    ],
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0'); 
  
  console.log(`Server running on port ${port}`);
}
bootstrap();