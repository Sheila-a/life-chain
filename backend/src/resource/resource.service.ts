import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { HederaService } from '../hedera/hedera.service';

type ResourceQuantityBody = {
  hospitalId?: number;
  resourceType?: string;
  quantity?: number;
};

@Injectable()
export class ResourceService {
  constructor(
    private readonly db: DatabaseService,
    private readonly hederaService: HederaService
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
      SELECT hr.id, hr.hospital_id, h.name AS hospital_name, hr.resource_type, hr.quantity, hr.updated_at
      FROM hospital_resources hr
      INNER JOIN hospitals h ON h.id = hr.hospital_id
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

  async searchResourceUpdates(resourceType?: string, hospitalId?: string) {
    let sql = `
      SELECT ru.id, ru.hospital_id, h.name AS hospital_name, ru.resource_type, ru.quantity, ru.timestamp, ru.hedera_tx_id
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
    const hospitalId = Number(body.hospitalId ?? user?.hospitalId);
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
      timestamp
    });

    await this.db.run('UPDATE resource_updates SET hedera_tx_id = ? WHERE id = ?', [hcs.txId, updateId]);

    return {
      id: updateId,
      hospitalId,
      resourceType,
      quantity,
      timestamp,
      hederaTopicId: hcs.topicId,
      hederaTxId: hcs.txId
    };
  }
}
