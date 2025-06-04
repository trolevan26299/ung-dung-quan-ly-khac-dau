import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AuthService } from './modules/auth/auth.service';
import { ProductsService } from './modules/products/products.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

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
  const productsService = app.get(ProductsService);
  
  await authService.createDefaultAdmin();
  await productsService.initializeProducts();

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log('🚀 Server is running on: http://localhost:' + port);
  console.log('📚 Swagger API: http://localhost:' + port + '/api');
}
bootstrap(); 