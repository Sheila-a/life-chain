import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HederaService } from './hedera/hedera.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());

  const corsOrigin = process.env.CORS_ORIGIN;
  app.enableCors({
    origin: corsOrigin ? corsOrigin.split(',').map((origin) => origin.trim()) : true,
    credentials: true
  });

  app.setGlobalPrefix('api');

  const swaggerConfig = new DocumentBuilder()
    .setTitle('LifeChain Phase 1 API')
    .setDescription(
      'Swagger documentation for LifeChain Phase 1. Route descriptions and examples mirror the Postman collection.'
    )
    .setVersion('2.0.0')
    .addBearerAuth()
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDocument, {
    useGlobalPrefix: true,
    swaggerOptions: {
      persistAuthorization: true
    }
  });

  // Ensure module lifecycle hooks (including DB schema init) run before custom startup logic.
  await app.init();

  const hederaService = app.get(HederaService);
  await hederaService.init();

  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port);
  console.log(`LifeChain backend listening on port ${port}`);
  console.log(`Swagger docs available at /api/docs`);
}

bootstrap();
