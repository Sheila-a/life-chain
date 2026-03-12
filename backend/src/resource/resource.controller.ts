import { Body, Controller, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger';
import { ResourceService } from './resource.service';

@ApiTags('Hospital Resource Registry')
@Controller()
export class ResourceController {
  constructor(private readonly resourceService: ResourceService) {}

  @Post('resource-updates')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Resource Update' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['resourceType', 'quantity'],
      properties: {
        hospitalId: { type: 'number', example: 1, nullable: true },
        resourceType: { type: 'string', example: 'MRI' },
        quantity: { type: 'number', example: 3 }
      }
    },
    description: 'Creates a resource registry event and updates current hospital inventory.'
  })
  @ApiResponse({ status: 201, description: 'Resource update created successfully.' })
  createResourceUpdate(
    @Body() body: { hospitalId?: number; resourceType?: string; quantity?: number },
    @Req() req: { user?: { hospitalId: number } }
  ) {
    return this.resourceService.createResourceUpdate(body, req.user);
  }

  @Post('resource/update')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Resource Update (Legacy Route)', deprecated: true })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['resourceType', 'quantity'],
      properties: {
        hospitalId: { type: 'number', example: 1, nullable: true },
        resourceType: { type: 'string', example: 'MRI' },
        quantity: { type: 'number', example: 3 }
      }
    },
    description: 'Legacy alias for creating a resource update.'
  })
  @ApiResponse({ status: 201, description: 'Resource update created successfully.' })
  createResourceUpdateLegacy(
    @Body() body: { hospitalId?: number; resourceType?: string; quantity?: number },
    @Req() req: { user?: { hospitalId: number } }
  ) {
    return this.resourceService.createResourceUpdate(body, req.user);
  }

  @Patch('resources/:resourceType')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update Resource Quantity' })
  @ApiParam({ name: 'resourceType', example: 'MRI' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['quantity'],
      properties: {
        hospitalId: { type: 'number', example: 1, nullable: true },
        quantity: { type: 'number', example: 5 }
      }
    },
    description: 'Updates the current quantity for an existing hospital resource and records the change in history.'
  })
  @ApiResponse({ status: 200, description: 'Resource quantity updated successfully.' })
  updateResourceQuantity(
    @Param('resourceType') resourceType: string,
    @Body() body?: { hospitalId?: number; quantity?: number },
    @Req() req?: { user?: { hospitalId: number } }
  ) {
    return this.resourceService.updateResourceQuantity(resourceType, body ?? {}, req?.user);
  }

  @Get('resources/search')
  @ApiOperation({ summary: 'Search Resources' })
  @ApiQuery({ name: 'resourceType', required: false, example: 'MRI' })
  @ApiQuery({ name: 'hospitalId', required: false, example: '1' })
  @ApiResponse({
    status: 200,
    description: 'Returns current hospital inventory. Optional query params: resourceType, hospitalId.'
  })
  searchResources(@Query('resourceType') resourceType?: string, @Query('hospitalId') hospitalId?: string) {
    return this.resourceService.searchResources(resourceType, hospitalId);
  }

  @Get('resources/nearest')
  @ApiOperation({ summary: 'Search Nearest Resources' })
  @ApiQuery({ name: 'resourceType', required: true, example: 'MRI' })
  @ApiQuery({ name: 'lat', required: true, example: '6.5244' })
  @ApiQuery({ name: 'long', required: true, example: '3.3792' })
  @ApiQuery({ name: 'radiusKm', required: false, example: '50' })
  @ApiQuery({ name: 'limit', required: false, example: '10' })
  @ApiResponse({
    status: 200,
    description: 'Returns nearby hospitals with positive stock for the requested resource, ordered by distance.'
  })
  searchNearestResources(
    @Query('resourceType') resourceType?: string,
    @Query('lat') lat?: string,
    @Query('long') long?: string,
    @Query('radiusKm') radiusKm?: string,
    @Query('limit') limit?: string
  ) {
    return this.resourceService.searchNearestResources(resourceType, lat, long, radiusKm, limit);
  }

  @Get('resource-updates/search')
  @ApiOperation({ summary: 'Search Resource Updates' })
  @ApiQuery({ name: 'resourceType', required: false, example: 'MRI' })
  @ApiQuery({ name: 'hospitalId', required: false, example: '1' })
  @ApiResponse({
    status: 200,
    description: 'Returns resource update history. Optional query params: resourceType, hospitalId.'
  })
  searchResourceUpdates(@Query('resourceType') resourceType?: string, @Query('hospitalId') hospitalId?: string) {
    return this.resourceService.searchResourceUpdates(resourceType, hospitalId);
  }
}
