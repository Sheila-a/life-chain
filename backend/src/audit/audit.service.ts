import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { HederaService } from '../hedera/hedera.service';

@Injectable()
export class AuditService {
  constructor(
    private readonly db: DatabaseService,
    private readonly hederaService: HederaService
  ) {}

  async getResourceAudit(idParam: string) {
    const id = this.parseId(idParam, 'resource');
    const record = (
      await this.db.query<{
        id: number;
        hospital_id: number;
        resource_type: string;
        quantity: number;
        timestamp: string;
        hedera_tx_id: string | null;
        kms_signature: string | null;
        payload_hash: string | null;
        kms_key_id: string | null;
      }>(
        'SELECT id, hospital_id, resource_type, quantity, timestamp, hedera_tx_id, kms_signature, payload_hash, kms_key_id FROM resource_updates WHERE id = ? LIMIT 1',
        [id]
      )
    )[0];

    if (!record) {
      throw new NotFoundException('Resource audit record not found');
    }

    const topicId = await this.hederaService.getStoredTopicId();

    return {
      id: record.id,
      type: 'resource',
      hospitalId: record.hospital_id,
      resourceType: record.resource_type,
      quantity: record.quantity,
      timestamp: record.timestamp,
      hederaTopicId: topicId,
      hederaTransactionId: record.hedera_tx_id,
      signature: record.kms_signature,
      payloadHash: record.payload_hash,
      kmsKeyId: record.kms_key_id,
      hashscanTopicUrl: this.hederaService.getHashscanTopicUrl(topicId),
      hashscanTransactionUrl: this.hederaService.getHashscanTransactionUrl(record.hedera_tx_id),
      hashscanFileUrl: null,
      auditStatus: record.hedera_tx_id && record.kms_signature ? 'verified-stored' : 'missing-hedera-reference'
    };
  }

  async getBookingAudit(idParam: string) {
    const id = this.parseId(idParam, 'booking');
    const record = (
      await this.db.query<{
        id: number;
        slot_id: number;
        hospital_id: number;
        booked_at: string;
        hedera_tx_id: string | null;
        kms_signature: string | null;
        payload_hash: string | null;
        kms_key_id: string | null;
      }>(
        'SELECT id, slot_id, hospital_id, booked_at, hedera_tx_id, kms_signature, payload_hash, kms_key_id FROM bookings WHERE id = ? LIMIT 1',
        [id]
      )
    )[0];

    if (!record) {
      throw new NotFoundException('Booking audit record not found');
    }

    const topicId = await this.hederaService.getStoredTopicId();

    return {
      id: record.id,
      type: 'booking',
      hospitalId: record.hospital_id,
      slotId: record.slot_id,
      bookedAt: record.booked_at,
      hederaTopicId: topicId,
      hederaTransactionId: record.hedera_tx_id,
      signature: record.kms_signature,
      payloadHash: record.payload_hash,
      kmsKeyId: record.kms_key_id,
      hashscanTopicUrl: this.hederaService.getHashscanTopicUrl(topicId),
      hashscanTransactionUrl: this.hederaService.getHashscanTransactionUrl(record.hedera_tx_id),
      hashscanFileUrl: null,
      auditStatus: record.hedera_tx_id && record.kms_signature ? 'verified-stored' : 'missing-hedera-reference'
    };
  }

  async getVaultAudit(idParam: string) {
    const id = this.parseId(idParam, 'vault');
    const record = (
      await this.db.query<{
        id: number;
        hospital_id: number;
        file_hash: string;
        release_time: string;
        hfs_file_id: string | null;
        hfs_tx_id: string | null;
        hcs_tx_id: string | null;
        kms_signature: string | null;
        kms_key_id: string | null;
      }>(
        'SELECT id, hospital_id, file_hash, release_time, hfs_file_id, hfs_tx_id, hcs_tx_id, kms_signature, kms_key_id FROM vaults WHERE id = ? LIMIT 1',
        [id]
      )
    )[0];

    if (!record) {
      throw new NotFoundException('Vault audit record not found');
    }

    const topicId = await this.hederaService.getStoredTopicId();
    const hasRequiredRefs = Boolean(record.hcs_tx_id && record.hfs_file_id);

    return {
      id: record.id,
      type: 'vault',
      hospitalId: record.hospital_id,
      fileHash: record.file_hash,
      releaseTime: record.release_time,
      hederaTopicId: topicId,
      hederaTransactionId: record.hcs_tx_id,
      hfsFileId: record.hfs_file_id,
      hfsTransactionId: record.hfs_tx_id,
      signature: record.kms_signature,
      payloadHash: record.file_hash,
      kmsKeyId: record.kms_key_id,
      hashscanTopicUrl: this.hederaService.getHashscanTopicUrl(topicId),
      hashscanTransactionUrl: this.hederaService.getHashscanTransactionUrl(record.hcs_tx_id),
      hashscanFileUrl: this.hederaService.getHashscanFileUrl(record.hfs_file_id),
      auditStatus:
        hasRequiredRefs && record.kms_signature && record.kms_key_id
          ? 'verified-stored'
          : 'missing-hedera-reference'
    };
  }

  private parseId(idParam: string, label: string): number {
    const id = Number(idParam);
    if (!id) {
      throw new NotFoundException(`Invalid ${label} audit id`);
    }

    return id;
  }
}
