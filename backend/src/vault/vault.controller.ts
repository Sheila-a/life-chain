import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { VaultService } from './vault.service';

@Controller()
export class VaultController {
  constructor(private readonly vaultService: VaultService) {}

  @Post('vault/upload')
  uploadVault(
    @Body() body: { hospitalId?: number; content?: string; releaseTime?: string },
    @Req() req: { user?: { hospitalId: number } }
  ) {
    return this.vaultService.uploadVault(body, req.user);
  }

  @Get('vault/release/:id')
  releaseVault(@Param('id') id: string, @Req() req: { user?: { hospitalId: number } }) {
    return this.vaultService.releaseVault(id, req.user);
  }
}
