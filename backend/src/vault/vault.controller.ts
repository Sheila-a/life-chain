import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger';
import { VaultService } from './vault.service';

@ApiTags('AfterLife Vault Core')
@Controller()
export class VaultController {
  constructor(private readonly vaultService: VaultService) {}

  @Post('vault/upload')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload Vault Entry' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['content', 'releaseTime'],
      properties: {
        hospitalId: { type: 'number', example: 1, nullable: true },
        content: { type: 'string', example: 'Patient has severe penicillin allergy.' },
        releaseTime: { type: 'string', format: 'date-time', example: '2026-12-31T23:59:59.000Z' }
      }
    },
    description: 'Encrypts content, stores ciphertext only, anchors hash to HFS, and logs proof to HCS.'
  })
  @ApiResponse({ status: 201, description: 'Vault entry created successfully.' })
  uploadVault(
    @Body() body: { hospitalId?: number; content?: string; releaseTime?: string },
    @Req() req: { user?: { hospitalId: number } }
  ) {
    return this.vaultService.uploadVault(body, req.user);
  }

  @Get('vault/release/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Release Vault Entry' })
  @ApiParam({ name: 'id', example: '1' })
  @ApiResponse({
    status: 200,
    description: 'Releases decrypted content only after release time and only for the owning hospital.'
  })
  releaseVault(@Param('id') id: string, @Req() req: { user?: { hospitalId: number } }) {
    return this.vaultService.releaseVault(id, req.user);
  }
}
