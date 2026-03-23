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

  @Get('equipment/me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List My Equipment Slots' })
  @ApiQuery({ name: 'onlyAvailable', required: false, example: 'true' })
  @ApiResponse({
    status: 200,
    description: 'Returns only the authenticated hospital admin equipment slots, including the latest booking Hedera tx id when available.'
  })
  getMySlots(
    @Query('onlyAvailable') onlyAvailable?: string,
    @Req() req?: { user?: { hospitalId: number } }
  ) {
    return this.equipmentService.getMySlots(req?.user, onlyAvailable);
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
  @ApiResponse({
    status: 201,
    description: 'Booking created successfully.',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        slotId: { type: 'number', example: 1 },
        hospitalId: { type: 'number', example: 2 },
        name: { type: 'string', example: 'Booking Hospital' },
        email: { type: 'string', example: 'booker@example.org' },
        phone: { type: 'string', example: '+2348012345678', nullable: true },
        bookedAt: { type: 'string', format: 'date-time', example: '2026-03-22T10:00:00.000Z' },
        hederaTopicId: { type: 'string', example: '0.0.8188073' },
        hederaTxId: { type: 'string', example: '0.0.8046730@1774115684.933487364' },
        signature: { type: 'string', example: 'MEYCIQClZ9ga44NXxKthOAF79jbeg4NpMnZ/QfpIP28u9RUSegIhANWaugrf0E+lITefq1MD8gVU0GxVwvavvMx/JOUnzrJK' },
        payloadHash: { type: 'string', example: '2134aa81186c01998f339b6428eb8239691760ce97c84e34decbdd1b33cdce02' },
        kmsKeyId: { type: 'string', example: 'arn:aws:kms:eu-north-1:123456789012:key/5ccd60b6-e7fd-4c23-8c8d-e4922b9df8b8' }
      }
    }
  })
  createBooking(
    @Body() body: { hospitalId?: number; slotId?: number },
    @Req() req: { user?: { hospitalId: number } }
  ) {
    return this.equipmentService.createBooking(body, req.user);
  }
}
