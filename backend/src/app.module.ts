import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { EquipmentModule } from './equipment/equipment.module';
import { HederaModule } from './hedera/hedera.module';
import { ResourceModule } from './resource/resource.module';
import { VaultModule } from './vault/vault.module';
import { EncryptionModule } from './encryption/encryption.module';
import { JwtAuthGuard } from './common/jwt-auth.guard';

@Module({
  imports: [
    DatabaseModule,
    HederaModule,
    EncryptionModule,
    AuthModule,
    ResourceModule,
    EquipmentModule,
    VaultModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard
    }
  ]
})
export class AppModule {}
