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
  @ApiResponse({
    status: 201,
    description: 'Vault entry created successfully.',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        hospitalId: { type: 'number', example: 1 },
        fileHash: {
          type: 'string',
          example: '6780039259630b821568c48624604fbdf492f5a88ffd229e0965f4fd08be3575'
        },
        releaseTime: { type: 'string', format: 'date-time', example: '2026-12-31T23:59:59.000Z' },
        hfsFileId: { type: 'string', example: '0.0.5001' },
        hfsTxId: { type: 'string', example: '0.0.7002@1012.000000001' },
        hederaTopicId: { type: 'string', example: '0.0.8188073' },
        hederaTxId: { type: 'string', example: '0.0.8046730@1774115684.933487364' },
        signature: {
          type: 'string',
          example: 'MEYCIQClZ9ga44NXxKthOAF79jbeg4NpMnZ/QfpIP28u9RUSegIhANWaugrf0E+lITefq1MD8gVU0GxVwvavvMx/JOUnzrJK'
        },
        kmsKeyId: {
          type: 'string',
          example: 'arn:aws:kms:eu-north-1:123456789012:key/5ccd60b6-e7fd-4c23-8c8d-e4922b9df8b8'
        },
        createdAt: { type: 'string', format: 'date-time', example: '2026-03-21T17:54:47.579Z' }
      }
    }
  })
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
