import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { HederaService } from '../hedera/hedera.service';
import { KmsService } from '../kms/kms.service';

@Injectable()
export class EquipmentService {
  constructor(
    private readonly db: DatabaseService,
    private readonly hederaService: HederaService,
    private readonly kmsService: KmsService
  ) {}

  async createSlot(body: { hospitalId?: number; slotType?: string; slotTime?: string }, user?: { hospitalId: number }) {
    const hospitalId = Number(user?.hospitalId ?? body.hospitalId);
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
      SELECT
        es.id,
        es.hospital_id,
        es.slot_type,
        es.slot_time,
        es.status,
        es.created_at
      FROM equipment_slots es
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
    const slots = await this.db.query<{
      id: number | string;
      hospital_id: number | string;
      slot_type: string;
      slot_time: string;
      status: string;
      created_at: string;
    }>(sql, params);

    if (slots.length === 0) {
      return slots;
    }

    const hospitalRows = await this.db.query<{
      id: number | string;
      name: string;
    }>('SELECT id, name FROM hospitals');

    const bookingRows = await this.db.query<{
      slot_id: number | string;
      hedera_tx_id: string | null;
    }>(
      `
        SELECT DISTINCT ON (b.slot_id)
          b.slot_id,
          b.hedera_tx_id
        FROM bookings b
        ORDER BY b.slot_id, b.booked_at DESC, b.id DESC
      `
    );

    const hospitalNameById = new Map(hospitalRows.map((row) => [Number(row.id), row.name]));
    const hederaBySlotId = new Map(
      bookingRows.map((row) => [Number(row.slot_id), row.hedera_tx_id ?? null])
    );

    return slots.map((slot) => ({
      ...slot,
      hospital_name: hospitalNameById.get(Number(slot.hospital_id)) ?? null,
      hederaTxId: hederaBySlotId.get(Number(slot.id)) ?? null
    }));
  }

  async getMySlots(user?: { hospitalId: number }, onlyAvailable?: string) {
    const hospitalId = Number(user?.hospitalId);
    if (!hospitalId) {
      throw new BadRequestException('Authenticated hospital context is required');
    }

    return this.listSlots(String(hospitalId), onlyAvailable);
  }

  async createBooking(
    body: { hospitalId?: number; slotId?: number; name?: string; email?: string; phone?: string },
    user?: { hospitalId: number }
  ) {
    const hospitalId = user?.hospitalId ? Number(user.hospitalId) : null;
    const slotId = Number(body.slotId);

    if (!slotId) {
      throw new BadRequestException('slotId is required');
    }

    const update = await this.db.run(
      "UPDATE equipment_slots SET status = 'booked' WHERE id = ? AND status = 'available'",
      [slotId]
    );

    if (update.changes < 1) {
      throw new ConflictException('Slot is already booked or does not exist');
    }

    const bookedAt = new Date().toISOString();
    const bookingContact = await this.resolveBookingContact(hospitalId, body);
    const bookingInsert = await this.db.run(
      'INSERT INTO bookings (slot_id, hospital_id, booking_name, booking_email, booking_phone, booked_at) VALUES (?, ?, ?, ?, ?, ?)',
      [slotId, hospitalId, bookingContact.name, bookingContact.email, bookingContact.phone, bookedAt]
    );

    const bookingId = Number(bookingInsert.lastInsertRowid);
    const signedPayload = await this.kmsService.signPayload({
      eventType: 'EQUIPMENT_BOOKING',
      bookingId,
      hospitalId,
      slotId,
      bookedAt,
      contactName: bookingContact.name,
      contactEmail: bookingContact.email,
      contactPhone: bookingContact.phone,
      bookingSource: hospitalId ? 'hospital-admin' : 'guest'
    });

    const hcs = await this.hederaService.submitConsensusMessage({
      eventType: 'EQUIPMENT_BOOKING',
      bookingId,
      hospitalId,
      slotId,
      bookedAt,
      contactName: bookingContact.name,
      contactEmail: bookingContact.email,
      contactPhone: bookingContact.phone,
      bookingSource: hospitalId ? 'hospital-admin' : 'guest',
      signature: signedPayload.signature,
      payloadHash: signedPayload.payloadHash,
      kmsKeyId: signedPayload.kmsKeyId
    });

    await this.db.run(
      'UPDATE bookings SET hedera_tx_id = ?, kms_signature = ?, payload_hash = ?, kms_key_id = ? WHERE id = ?',
      [hcs.txId, signedPayload.signature, signedPayload.payloadHash, signedPayload.kmsKeyId, bookingId]
    );

    return {
      id: bookingId,
      slotId,
      hospitalId,
      name: bookingContact.name,
      email: bookingContact.email,
      phone: bookingContact.phone,
      bookedAt,
      hederaTopicId: hcs.topicId,
      hederaTxId: hcs.txId,
      signature: signedPayload.signature,
      payloadHash: signedPayload.payloadHash,
      kmsKeyId: signedPayload.kmsKeyId
    };
  }

  private async resolveBookingContact(
    hospitalId: number | null,
    body: { name?: string; email?: string; phone?: string }
  ) {
    if (hospitalId) {
      const hospital = (
        await this.db.query<{
          name: string;
          email: string;
          phone: string | null;
        }>('SELECT name, email, phone FROM hospitals WHERE id = ? LIMIT 1', [hospitalId])
      )[0];

      if (!hospital) {
        throw new BadRequestException('Authenticated hospital account was not found');
      }

      return {
        name: hospital.name,
        email: hospital.email,
        phone: hospital.phone
      };
    }

    const name = body.name?.trim();
    const email = body.email?.trim();
    const phone = body.phone?.trim();

    if (!name || !email || !phone) {
      throw new BadRequestException('name, email, and phone are required for guest bookings');
    }

    return { name, email, phone };
  }
}
