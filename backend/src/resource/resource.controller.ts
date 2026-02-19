import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { ResourceService } from './resource.service';

@Controller()
export class ResourceController {
  constructor(private readonly resourceService: ResourceService) {}

  @Post('resource/update')
  updateResource(
    @Body() body: { hospitalId?: number; resourceType?: string; quantity?: number },
    @Req() req: { user?: { hospitalId: number } }
  ) {
    return this.resourceService.updateResource(body, req.user);
  }

  @Get('resources/search')
  searchResources(@Query('resourceType') resourceType?: string, @Query('hospitalId') hospitalId?: string) {
    return this.resourceService.searchResources(resourceType, hospitalId);
  }
}
