import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { HederaService } from '../hedera/hedera.service';
import { KmsService } from '../kms/kms.service';

type ResourceQuantityBody = {
  hospitalId?: number;
  resourceType?: string;
  quantity?: number;
};

@Injectable()
export class ResourceService {
  constructor(
    private readonly db: DatabaseService,
    private readonly hederaService: HederaService,
    private readonly kmsService: KmsService
  ) {}

  async createResourceUpdate(
    body: ResourceQuantityBody,
    user?: { hospitalId: number }
  ) {
    const { hospitalId, resourceType, quantity } = this.parseResourcePayload(body, user);
    return this.recordResourceQuantity(hospitalId, resourceType, quantity, 'RESOURCE_CREATED');
  }

  async updateResourceQuantity(
    resourceType: string,
    body: { hospitalId?: number; quantity?: number },
    user?: { hospitalId: number }
  ) {
    const { hospitalId, quantity } = this.parseResourcePayload({ ...body, resourceType }, user);
    const existing = await this.db.query<{ id: number }>(
      'SELECT id FROM hospital_resources WHERE hospital_id = ? AND resource_type = ? LIMIT 1',
      [hospitalId, resourceType]
    );

    if (!existing[0]) {
      throw new NotFoundException('Resource does not exist for this hospital');
    }

    return this.recordResourceQuantity(hospitalId, resourceType, quantity, 'RESOURCE_QUANTITY_UPDATED');
  }

  async searchResources(resourceType?: string, hospitalId?: string) {
    let sql = `
      SELECT
        hr.id,
        hr.hospital_id,
        h.name AS hospital_name,
        hr.resource_type,
        hr.quantity,
        hr.updated_at,
        latest_ru.hedera_tx_id AS "hederaTxId"
      FROM hospital_resources hr
      INNER JOIN hospitals h ON h.id = hr.hospital_id
      LEFT JOIN (
        SELECT DISTINCT ON (ru.hospital_id, ru.resource_type)
          ru.hospital_id,
          ru.resource_type,
          ru.hedera_tx_id
        FROM resource_updates ru
        ORDER BY ru.hospital_id, ru.resource_type, ru.timestamp DESC, ru.id DESC
      ) latest_ru
        ON latest_ru.hospital_id = hr.hospital_id
       AND latest_ru.resource_type = hr.resource_type
      WHERE 1=1
    `;
    const params: unknown[] = [];

    if (resourceType) {
      sql += ' AND hr.resource_type = ?';
      params.push(resourceType);
    }

    if (hospitalId) {
      sql += ' AND hr.hospital_id = ?';
      params.push(Number(hospitalId));
    }

    sql += ' ORDER BY hr.updated_at DESC';

    return this.db.query(sql, params);
  }

  async getMyResources(user?: { hospitalId: number }, resourceType?: string) {
    const hospitalId = Number(user?.hospitalId);
    if (!hospitalId) {
      throw new BadRequestException('Authenticated hospital context is required');
    }

    return this.searchResources(resourceType, String(hospitalId));
  }

  async searchNearestResources(
    resourceType?: string,
    lat?: string,
    long?: string,
    radiusKm?: string,
    limit?: string
  ) {
    const normalizedType = resourceType?.trim();
    const latitude = Number(lat);
    const longitude = Number(long);
    const maxRadiusKm = radiusKm ? Number(radiusKm) : 50;
    const maxResults = limit ? Number(limit) : 10;

    if (!normalizedType || Number.isNaN(latitude) || Number.isNaN(longitude)) {
      throw new BadRequestException('resourceType, lat, and long are required');
    }

    if (Number.isNaN(maxRadiusKm) || maxRadiusKm <= 0) {
      throw new BadRequestException('radiusKm must be a positive number');
    }

    if (Number.isNaN(maxResults) || maxResults <= 0) {
      throw new BadRequestException('limit must be a positive number');
    }

    const safeLimit = Math.min(Math.trunc(maxResults), 50);
    const sql = `
      SELECT
        hr.hospital_id AS "hospitalId",
        h.name AS "hospitalName",
        hr.resource_type AS "resourceType",
        hr.quantity,
        h.lat,
        h.long,
        (
          6371 * ACOS(
            LEAST(
              1,
              GREATEST(
                -1,
                COS(RADIANS(CAST(? AS DOUBLE PRECISION))) * COS(RADIANS(h.lat)) *
                COS(RADIANS(h.long) - RADIANS(CAST(? AS DOUBLE PRECISION))) +
                SIN(RADIANS(CAST(? AS DOUBLE PRECISION))) * SIN(RADIANS(h.lat))
              )
            )
          )
        ) AS "distanceKm",
        hr.updated_at AS "updatedAt"
      FROM hospital_resources hr
      INNER JOIN hospitals h ON h.id = hr.hospital_id
      WHERE hr.resource_type = ?
        AND hr.quantity > 0
        AND (
          6371 * ACOS(
            LEAST(
              1,
              GREATEST(
                -1,
                COS(RADIANS(CAST(? AS DOUBLE PRECISION))) * COS(RADIANS(h.lat)) *
                COS(RADIANS(h.long) - RADIANS(CAST(? AS DOUBLE PRECISION))) +
                SIN(RADIANS(CAST(? AS DOUBLE PRECISION))) * SIN(RADIANS(h.lat))
              )
            )
          )
        ) <= CAST(? AS DOUBLE PRECISION)
      ORDER BY
        (
          6371 * ACOS(
            LEAST(
              1,
              GREATEST(
                -1,
                COS(RADIANS(CAST(? AS DOUBLE PRECISION))) * COS(RADIANS(h.lat)) *
                COS(RADIANS(h.long) - RADIANS(CAST(? AS DOUBLE PRECISION))) +
                SIN(RADIANS(CAST(? AS DOUBLE PRECISION))) * SIN(RADIANS(h.lat))
              )
            )
          )
        ) ASC,
        hr.quantity DESC
      LIMIT CAST(? AS INTEGER)
    `;

    return this.db.query(sql, [
      latitude,
      longitude,
      latitude,
      normalizedType,
      latitude,
      longitude,
      latitude,
      maxRadiusKm,
      latitude,
      longitude,
      latitude,
      safeLimit
    ]);
  }

  async searchResourceUpdates(resourceType?: string, hospitalId?: string) {
    let sql = `
      SELECT ru.id, ru.hospital_id, h.name AS hospital_name, ru.resource_type, ru.quantity, ru.timestamp, ru.hedera_tx_id, ru.kms_signature, ru.payload_hash, ru.kms_key_id
      FROM resource_updates ru
      INNER JOIN hospitals h ON h.id = ru.hospital_id
      WHERE 1=1
    `;
    const params: unknown[] = [];

    if (resourceType) {
      sql += ' AND ru.resource_type = ?';
      params.push(resourceType);
    }

    if (hospitalId) {
      sql += ' AND ru.hospital_id = ?';
      params.push(Number(hospitalId));
    }

    sql += ' ORDER BY ru.timestamp DESC';

    return this.db.query(sql, params);
  }

  private parseResourcePayload(body: ResourceQuantityBody, user?: { hospitalId: number }) {
    const hospitalId = Number(user?.hospitalId ?? body.hospitalId);
    const resourceType = body.resourceType?.trim();
    const quantity = Number(body.quantity);

    if (!hospitalId || !resourceType || Number.isNaN(quantity)) {
      throw new BadRequestException('hospitalId, resourceType, and quantity are required');
    }

    return { hospitalId, resourceType, quantity };
  }

  private async recordResourceQuantity(
    hospitalId: number,
    resourceType: string,
    quantity: number,
    eventType: 'RESOURCE_CREATED' | 'RESOURCE_QUANTITY_UPDATED'
  ) {
    const timestamp = new Date().toISOString();
    const result = await this.db.run(
      'INSERT INTO resource_updates (hospital_id, resource_type, quantity, timestamp) VALUES (?, ?, ?, ?)',
      [hospitalId, resourceType, quantity, timestamp]
    );

    const updateId = Number(result.lastInsertRowid);
    const signedPayload = await this.kmsService.signPayload({
      eventType,
      updateId,
      hospitalId,
      resourceType,
      quantity,
      timestamp
    });

    await this.db.run(
      `
        INSERT INTO hospital_resources (hospital_id, resource_type, quantity, updated_at)
        VALUES (?, ?, ?, ?)
        ON CONFLICT (hospital_id, resource_type)
        DO UPDATE SET quantity = EXCLUDED.quantity, updated_at = EXCLUDED.updated_at
      `,
      [hospitalId, resourceType, quantity, timestamp]
    );

    const hcs = await this.hederaService.submitConsensusMessage({
      eventType,
      updateId,
      hospitalId,
      resourceType,
      quantity,
      timestamp,
      signature: signedPayload.signature,
      payloadHash: signedPayload.payloadHash,
      kmsKeyId: signedPayload.kmsKeyId
    });

    await this.db.run(
      'UPDATE resource_updates SET hedera_tx_id = ?, kms_signature = ?, payload_hash = ?, kms_key_id = ? WHERE id = ?',
      [hcs.txId, signedPayload.signature, signedPayload.payloadHash, signedPayload.kmsKeyId, updateId]
    );

    return {
      id: updateId,
      hospitalId,
      resourceType,
      quantity,
      timestamp,
      hederaTopicId: hcs.topicId,
      hederaTxId: hcs.txId,
      signature: signedPayload.signature,
      payloadHash: signedPayload.payloadHash,
      kmsKeyId: signedPayload.kmsKeyId
    };
  }
}
