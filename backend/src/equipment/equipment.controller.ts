import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger';
import { EquipmentService } from './equipment.service';

@ApiTags('Equipment Sharing Simulation')
@Controller()
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Post('equipment/create')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Equipment Slot' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['slotType', 'slotTime'],
      properties: {
        hospitalId: { type: 'number', example: 1, nullable: true },
        slotType: { type: 'string', example: 'MRI' },
        slotTime: { type: 'string', format: 'date-time', example: '2026-02-18T14:00:00.000Z' }
      }
    },
    description: 'Creates an available equipment slot.'
  })
  @ApiResponse({ status: 201, description: 'Equipment slot created successfully.' })
  createSlot(
    @Body() body: { hospitalId?: number; slotType?: string; slotTime?: string },
    @Req() req: { user?: { hospitalId: number } }
  ) {
    return this.equipmentService.createSlot(body, req.user);
  }

  @Get('equipment/list')
  @ApiOperation({ summary: 'List Equipment Slots' })
  @ApiQuery({ name: 'hospitalId', required: false, example: '1' })
  @ApiQuery({ name: 'onlyAvailable', required: false, example: 'true' })
  @ApiResponse({
    status: 200,
    description: 'Public endpoint. Optional query params: hospitalId, onlyAvailable.'
  })
  listSlots(@Query('hospitalId') hospitalId?: string, @Query('onlyAvailable') onlyAvailable?: string) {
    return this.equipmentService.listSlots(hospitalId, onlyAvailable);
  }

  @Post('booking/create')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Booking' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['slotId'],
      properties: {
        hospitalId: { type: 'number', example: 1, nullable: true },
        slotId: { type: 'number', example: 1 }
      }
    },
    description: 'Books an available slot, logs booking event to Hedera HCS, and stores tx ID.'
  })
  @ApiResponse({ status: 201, description: 'Booking created successfully.' })
  createBooking(
    @Body() body: { hospitalId?: number; slotId?: number },
    @Req() req: { user?: { hospitalId: number } }
  ) {
    return this.equipmentService.createBooking(body, req.user);
  }
}
