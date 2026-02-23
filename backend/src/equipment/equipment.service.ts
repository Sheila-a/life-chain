import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { HederaService } from '../hedera/hedera.service';

@Injectable()
export class EquipmentService {
  constructor(
    private readonly db: DatabaseService,
    private readonly hederaService: HederaService
  ) {}

  async createSlot(body: { hospitalId?: number; slotType?: string; slotTime?: string }, user?: { hospitalId: number }) {
    const hospitalId = Number(body.hospitalId ?? user?.hospitalId);
    const slotType = body.slotType ?? 'MRI';
    const slotTime = body.slotTime;

    if (!hospitalId || !slotTime) {
      throw new BadRequestException('hospitalId and slotTime are required');
    }

    const createdAt = new Date().toISOString();
    const status = 'available';
    const result = await this.db.run(
      'INSERT INTO equipment_slots (hospital_id, slot_type, slot_time, status, created_at) VALUES (?, ?, ?, ?, ?)',
      [hospitalId, slotType, slotTime, status, createdAt]
    );

    return {
      id: Number(result.lastInsertRowid),
      hospitalId,
      slotType,
      slotTime,
      status,
      createdAt
    };
  }

  async listSlots(hospitalId?: string, onlyAvailable?: string) {
    let sql = `
      SELECT es.id, es.hospital_id, h.name AS hospital_name, es.slot_type, es.slot_time, es.status, es.created_at
      FROM equipment_slots es
      INNER JOIN hospitals h ON h.id = es.hospital_id
      WHERE 1=1
    `;
    const params: unknown[] = [];

    if (hospitalId) {
      sql += ' AND es.hospital_id = ?';
      params.push(Number(hospitalId));
    }

    if ((onlyAvailable ?? '').toLowerCase() === 'true') {
      sql += " AND es.status = 'available'";
    }

    sql += ' ORDER BY es.slot_time ASC';
    return this.db.query(sql, params);
  }

  async createBooking(body: { hospitalId?: number; slotId?: number }, user?: { hospitalId: number }) {
    const hospitalId = Number(body.hospitalId ?? user?.hospitalId);
    const slotId = Number(body.slotId);

    if (!hospitalId || !slotId) {
      throw new BadRequestException('hospitalId and slotId are required');
    }

    const update = await this.db.run(
      "UPDATE equipment_slots SET status = 'booked' WHERE id = ? AND status = 'available'",
      [slotId]
    );

    if (update.changes < 1) {
      throw new ConflictException('Slot is already booked or does not exist');
    }

    const bookedAt = new Date().toISOString();
    const bookingInsert = await this.db.run(
      'INSERT INTO bookings (slot_id, hospital_id, booked_at) VALUES (?, ?, ?)',
      [slotId, hospitalId, bookedAt]
    );

    const bookingId = Number(bookingInsert.lastInsertRowid);

    const hcs = await this.hederaService.submitConsensusMessage({
      eventType: 'EQUIPMENT_BOOKING',
      bookingId,
      hospitalId,
      slotId,
      bookedAt
    });

    await this.db.run('UPDATE bookings SET hedera_tx_id = ? WHERE id = ?', [hcs.txId, bookingId]);

    return {
      id: bookingId,
      slotId,
      hospitalId,
      bookedAt,
      hederaTopicId: hcs.topicId,
      hederaTxId: hcs.txId
    };
  }
}
