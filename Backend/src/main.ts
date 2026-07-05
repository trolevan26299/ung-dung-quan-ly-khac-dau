import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as compression from 'compression';
import { AppModule } from './app.module';
import { AuthService } from './modules/auth/auth.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Enable CORS
  app.enableCors();

  // Gzip response compression
  app.use(compression());

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe());

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Hệ thống quản lý khắc dấu')
    .setDescription('API cho hệ thống quản lý cơ sở khắc dấu và biển quảng cáo')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Initialize default data
  const authService = app.get(AuthService);
  
  await authService.createDefaultAdmin();

  const port = process.env.PORT || 8085;
  await app.listen(port);

  logger.log('Server is running on: http://localhost:' + port);
  logger.log('Swagger API: http://localhost:' + port + '/api');
}
bootstrap(); 