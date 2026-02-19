import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HederaService } from './hedera/hedera.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.setGlobalPrefix('api');

  const hederaService = app.get(HederaService);
  await hederaService.init();

  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port);
  console.log(`LifeChain backend listening on port ${port}`);
}

bootstrap();
