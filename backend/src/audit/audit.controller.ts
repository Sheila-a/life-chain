import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuditService } from './audit.service';

@ApiTags('Audit')
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('resources/:id')
  @ApiOperation({ summary: 'Get Resource Audit' })
  @ApiParam({ name: 'id', example: '1' })
  @ApiResponse({ status: 200, description: 'Returns explorer-ready resource audit data.' })
  getResourceAudit(@Param('id') id: string) {
    return this.auditService.getResourceAudit(id);
  }

  @Get('bookings/:id')
  @ApiOperation({ summary: 'Get Booking Audit' })
  @ApiParam({ name: 'id', example: '1' })
  @ApiResponse({ status: 200, description: 'Returns explorer-ready booking audit data.' })
  getBookingAudit(@Param('id') id: string) {
    return this.auditService.getBookingAudit(id);
  }

  @Get('vaults/:id')
  @ApiOperation({ summary: 'Get Vault Audit' })
  @ApiParam({ name: 'id', example: '1' })
  @ApiResponse({ status: 200, description: 'Returns explorer-ready vault audit data.' })
  getVaultAudit(@Param('id') id: string) {
    return this.auditService.getVaultAudit(id);
  }
}
