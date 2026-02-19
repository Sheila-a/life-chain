import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { EquipmentService } from './equipment.service';

@Controller()
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Post('equipment/create')
  createSlot(
    @Body() body: { hospitalId?: number; slotType?: string; slotTime?: string },
    @Req() req: { user?: { hospitalId: number } }
  ) {
    return this.equipmentService.createSlot(body, req.user);
  }

  @Get('equipment/list')
  listSlots(@Query('hospitalId') hospitalId?: string, @Query('onlyAvailable') onlyAvailable?: string) {
    return this.equipmentService.listSlots(hospitalId, onlyAvailable);
  }

  @Post('booking/create')
  createBooking(
    @Body() body: { hospitalId?: number; slotId?: number },
    @Req() req: { user?: { hospitalId: number } }
  ) {
    return this.equipmentService.createBooking(body, req.user);
  }
}
