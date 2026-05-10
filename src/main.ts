import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

/**
 * Bootstrap the ArenaHub NestJS application.
 * Configures global pipes, CORS, Swagger documentation and starts the HTTP server.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security headers
  app.use(helmet());

  // Global prefix for all routes
  app.setGlobalPrefix('api');

  // Enable CORS for frontend integration
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization,x-tenant-id',
  });

  // Global validation pipe with class-validator + class-transformer
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('ArenaHub API')
    .setDescription(
      'API Multi-Tenant para gestão de quadras esportivas e complexos esportivos. ' +
      'Cada arena/complexo é um tenant isolado. Todas as requisições autenticadas ' +
      'devem incluir o Bearer Token JWT.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .addTag('Auth', 'Autenticação e geração de tokens JWT')
    .addTag('Dashboard', 'Métricas e indicadores consolidados')
    .addTag('Reservations', 'Gestão de reservas/agendamentos')
    .addTag('Courts', 'Gestão de quadras e instalações')
    .addTag('Customers', 'Gestão de clientes')
    .addTag('Settings', 'Configurações da arena')
    .addTag('Team', 'Gestão de membros da equipe')
    .addTag('Analytics', 'Relatórios e análises')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🏟️  ArenaHub API running on http://localhost:${port}`);
  console.log(`📚 Swagger docs at http://localhost:${port}/api/docs`);
}

bootstrap();
