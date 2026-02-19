import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { SqliteService } from '../database/sqlite.service';
import { HederaService } from '../hedera/hedera.service';
import { EncryptionService } from '../encryption/encryption.service';

@Injectable()
export class VaultService {
  constructor(
    private readonly db: SqliteService,
    private readonly hederaService: HederaService,
    private readonly encryptionService: EncryptionService
  ) {}

  async uploadVault(
    body: { hospitalId?: number; content?: string; releaseTime?: string },
    user?: { hospitalId: number }
  ) {
    const hospitalId = Number(body.hospitalId ?? user?.hospitalId);
    const content = body.content;
    const releaseTime = body.releaseTime;

    if (!hospitalId || !content || !releaseTime) {
      throw new BadRequestException('hospitalId, content, and releaseTime are required');
    }

    const releaseDate = new Date(releaseTime);
    if (Number.isNaN(releaseDate.getTime())) {
      throw new BadRequestException('releaseTime must be a valid ISO timestamp');
    }

    const dataKey = this.encryptionService.generateDataKey();
    const encrypted = this.encryptionService.encryptWithAesGcm(content, dataKey);
    const keyCipher = this.encryptionService.wrapDataKey(dataKey);

    const fileHash = this.encryptionService.sha256(
      `${encrypted.encryptedContent}.${encrypted.iv}.${encrypted.authTag}`
    );

    const hfs = await this.hederaService.uploadHashToFileService(fileHash, {
      eventType: 'VAULT_HASH_ANCHOR',
      hospitalId,
      releaseTime: releaseDate.toISOString()
    });

    const hcs = await this.hederaService.submitConsensusMessage({
      eventType: 'VAULT_UPLOAD',
      hospitalId,
      fileHash,
      releaseTime: releaseDate.toISOString(),
      hfsFileId: hfs.fileId,
      timestamp: new Date().toISOString()
    });

    const createdAt = new Date().toISOString();
    const insert = this.db.run(
      `
      INSERT INTO vaults (
        hospital_id,
        encrypted_content,
        iv,
        auth_tag,
        key_cipher,
        file_hash,
        release_time,
        hfs_file_id,
        hcs_tx_id,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        hospitalId,
        encrypted.encryptedContent,
        encrypted.iv,
        encrypted.authTag,
        keyCipher,
        fileHash,
        releaseDate.toISOString(),
        hfs.fileId,
        hcs.txId,
        createdAt
      ]
    );

    return {
      id: Number(insert.lastInsertRowid),
      hospitalId,
      fileHash,
      releaseTime: releaseDate.toISOString(),
      hfsFileId: hfs.fileId,
      hederaTopicId: hcs.topicId,
      hederaTxId: hcs.txId,
      createdAt
    };
  }

  releaseVault(idParam: string, user?: { hospitalId: number }) {
    const id = Number(idParam);
    if (!id) {
      throw new BadRequestException('Invalid vault id');
    }

    const vault = this.db.query<{
      id: number;
      hospital_id: number;
      encrypted_content: string;
      iv: string;
      auth_tag: string;
      key_cipher: string;
      file_hash: string;
      release_time: string;
      hfs_file_id: string;
      hcs_tx_id: string;
    }>('SELECT * FROM vaults WHERE id = ? LIMIT 1', [id])[0];

    if (!vault) {
      throw new NotFoundException('Vault not found');
    }

    if (!user || Number(vault.hospital_id) !== Number(user.hospitalId)) {
      throw new ForbiddenException('You are not allowed to access this vault');
    }

    if (Date.now() < new Date(vault.release_time).getTime()) {
      throw new ForbiddenException({
        error: 'Vault is still time-locked',
        releaseTime: vault.release_time
      });
    }

    const key = this.encryptionService.unwrapDataKey(vault.key_cipher);
    const content = this.encryptionService.decryptWithAesGcm(
      {
        encryptedContent: vault.encrypted_content,
        iv: vault.iv,
        authTag: vault.auth_tag
      },
      key
    );

    return {
      id: vault.id,
      hospitalId: vault.hospital_id,
      releasedAt: new Date().toISOString(),
      content,
      fileHash: vault.file_hash,
      hfsFileId: vault.hfs_file_id,
      hederaTxId: vault.hcs_tx_id
    };
  }
}
