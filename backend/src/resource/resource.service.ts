import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { HederaService } from '../hedera/hedera.service';

@Injectable()
export class ResourceService {
  constructor(
    private readonly db: DatabaseService,
    private readonly hederaService: HederaService
  ) {}

  async updateResource(
    body: { hospitalId?: number; resourceType?: string; quantity?: number },
    user?: { hospitalId: number }
  ) {
    const hospitalId = Number(body.hospitalId ?? user?.hospitalId);
    const resourceType = body.resourceType;
    const quantity = Number(body.quantity);

    if (!hospitalId || !resourceType || Number.isNaN(quantity)) {
      throw new BadRequestException('hospitalId, resourceType, and quantity are required');
    }

    const timestamp = new Date().toISOString();
    const result = await this.db.run(
      'INSERT INTO resource_updates (hospital_id, resource_type, quantity, timestamp) VALUES (?, ?, ?, ?)',
      [hospitalId, resourceType, quantity, timestamp]
    );

    const updateId = Number(result.lastInsertRowid);

    const hcs = await this.hederaService.submitConsensusMessage({
      eventType: 'RESOURCE_UPDATE',
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

  async searchResources(resourceType?: string, hospitalId?: string) {
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
}
