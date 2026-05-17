import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization,x-tenant-id',
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
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





