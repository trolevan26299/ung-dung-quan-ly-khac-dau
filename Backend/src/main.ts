import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as compression from 'compression';
import { AppModule } from './app.module';
import { AuthService } from './modules/auth/auth.service';

const DEFAULT_CORS_ORIGINS = [
  'https://khacdau.tamtin.id.vn', // web nội bộ
  'https://khacdau-client.pages.dev', // web đại lý
  'http://localhost:3000',
  'http://localhost:3005',
  'http://localhost:5173',
];
const CLIENT_PREVIEW_ORIGIN = /^https:\/\/[a-z0-9-]+\.khacdau-client\.pages\.dev$/;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // CORS: chỉ cho web nội bộ + web đại lý gọi API.
  // Ghi đè bằng env CORS_ORIGINS="https://a.com,https://b.com" (hoặc "*" để mở hết).
  const corsOrigins = (process.env.CORS_ORIGINS || DEFAULT_CORS_ORIGINS.join(','))
    .split(',')
    .map(o => o.trim().replace(/\/$/, ''))
    .filter(Boolean);
  app.enableCors({
    origin: (origin, callback) => {
      const allowed =
        !origin || // gọi từ server, curl, Swagger cùng domain
        corsOrigins.includes('*') ||
        corsOrigins.includes(origin) ||
        CLIENT_PREVIEW_ORIGIN.test(origin); // bản preview của Cloudflare Pages
      callback(null, allowed);
    },
  });

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